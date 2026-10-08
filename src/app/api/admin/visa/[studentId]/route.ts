import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import {
  canTransitionVisa,
  cleanVisaText,
  isVisaStatus,
  normalizeVisaSourceUrl,
  requiresNewVisaProof,
  requiresVisaProof,
  validVisaSourceDate,
  type VisaStatus,
} from "@/lib/admin/visa-workflow";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const tracks = new Set(["studies", "study_preparation", "study_place_search"]);
const allowedKeys = new Set([
  "track", "residence_country", "mission", "official_source_url",
  "source_verified_at", "note", "status", "version", "evidence_document_id",
]);

type JsonBody = Record<string, unknown>;

function readBody(input: unknown): JsonBody | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const body = input as JsonBody;
  return Object.keys(body).every((key) => allowedKeys.has(key)) ? body : null;
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function visaFields(body: JsonBody) {
  const track = cleanVisaText(body.track, 40);
  const residenceCountry = cleanVisaText(body.residence_country, 100);
  const mission = cleanVisaText(body.mission, 160);
  const source = normalizeVisaSourceUrl(body.official_source_url);
  const sourceDay = cleanVisaText(body.source_verified_at, 10);
  const note = cleanVisaText(body.note, 2000);
  if (!tracks.has(track)) return { error: "Motif de visa non pris en charge : vérifiez le parcours approprié." } as const;
  if (residenceCountry.length < 2 || mission.length < 3) return { error: "Pays de résidence et représentation compétente obligatoires." } as const;
  if (!source || !validVisaSourceDate(sourceDay)) {
    return { error: "Vérifiez aujourd’hui ou récemment une source officielle HTTPS, puis renseignez sa date de contrôle." } as const;
  }
  return {
    data: {
      track,
      residence_country: residenceCountry,
      mission,
      official_source_url: source,
      source_verified_at: sourceDay + "T00:00:00Z",
      note: note || null,
    },
  } as const;
}

async function validateApprovedProof(
  supabase: Awaited<ReturnType<typeof getAdminUser>>["supabase"],
  studentId: string,
  id: string | null,
) {
  if (!id) return true;
  if (!UUID_RE.test(id)) return false;
  const { data, error } = await supabase
    .from("documents")
    .select("id")
    .eq("id", id)
    .eq("student_id", studentId)
    .eq("category", "other")
    .eq("status", "approved")
    .maybeSingle();
  return !error && Boolean(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return bad("Non authentifié.", 401);
  if (!isAdmin) return bad("Accès administrateur avec MFA obligatoire.", 403);

  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) return bad("Dossier invalide.");
  const body = readBody(await request.json().catch(() => null));
  if (!body) return bad("Données invalides.");

  const validated = visaFields(body);
  if ("error" in validated) return bad(validated.error);
  const { data: person, error: profileError } = await supabase
    .from("profiles").select("id").eq("id", studentId).maybeSingle();
  if (profileError) return bad("Impossible de vérifier l’existence du candidat.", 500);
  if (!person) return bad("Candidat introuvable.", 404);

  const { data, error } = await supabase.from("visa_cases").insert({
    student_id: studentId,
    ...validated.data,
    status: "collecting",
    version: 1,
    evidence_document_id: null,
    updated_by: user.id,
  }).select("student_id,status,version").single();

  if (error) {
    if (error.code === "23505") return bad("Le dossier visa existe déjà. Rechargez la page.", 409);
    return bad("Création du suivi visa impossible. Vérifiez que la migration a été déployée.", 500);
  }
  return NextResponse.json({ ok: true, visa: data }, { status: 201 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return bad("Non authentifié.", 401);
  if (!isAdmin) return bad("Accès administrateur avec MFA obligatoire.", 403);

  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) return bad("Dossier invalide.");
  const body = readBody(await request.json().catch(() => null));
  if (!body || !isVisaStatus(body.status)
    || typeof body.version !== "number" || !Number.isSafeInteger(body.version) || body.version < 1) return bad("Statut ou version invalide.");

  const validated = visaFields(body);
  if ("error" in validated) return bad(validated.error);
  const { data: current, error: loadError } = await supabase
    .from("visa_cases")
    .select("student_id,status,version,evidence_document_id,track,residence_country,mission")
    .eq("student_id", studentId)
    .maybeSingle();
  if (loadError) return bad("Suivi visa indisponible. La migration est-elle installée ?", 503);
  if (!current) return bad("Dossier visa introuvable.", 404);
  if (current.version !== body.version) return bad("Ce dossier a changé depuis votre lecture. Rechargez.", 409);

  const target: VisaStatus = body.status;
  if (
    !["collecting", "ready_for_review"].includes(current.status)
    && target !== "collecting"
    && (
      validated.data.track !== current.track
      || validated.data.residence_country !== current.residence_country
      || validated.data.mission !== current.mission
    )
  ) return bad("Le motif et la représentation sont verrouillés après dépôt. Rouvrez un nouveau cycle si nécessaire.", 409);
  if (!isVisaStatus(current.status) || !canTransitionVisa(current.status, target)) {
    return bad("Transition refusée : suivez les étapes et conservez les preuves.", 409);
  }

  const proposedEvidence = typeof body.evidence_document_id === "string"
    ? body.evidence_document_id.trim() || null
    : null;
  if (requiresVisaProof(target) && !proposedEvidence) {
    return bad("Une preuve classée « Autre » et approuvée est obligatoire pour ce statut.");
  }
  if (target !== current.status && requiresNewVisaProof(target)
    && proposedEvidence === current.evidence_document_id) {
    return bad("Ajoutez une nouvelle preuve propre à cette nouvelle étape.");
  }
  if (!(await validateApprovedProof(supabase, studentId, proposedEvidence))) {
    return bad("Cette pièce n’est pas un document « Autre » approuvé et lié à ce candidat.");
  }

  const { data, error } = await supabase.from("visa_cases")
    .update({
      ...validated.data,
      status: target,
      evidence_document_id: proposedEvidence,
      version: Number(body.version) + 1,
      updated_by: user.id,
    })
    .eq("student_id", studentId)
    .eq("version", Number(body.version))
    .select("student_id,status,version")
    .maybeSingle();

  if (error) return bad("Transition refusée par les règles du dossier ou base indisponible.", 409);
  if (!data) return bad("Ce dossier a été mis à jour ailleurs. Rechargez.", 409);
  return NextResponse.json({ ok: true, visa: data });
}
