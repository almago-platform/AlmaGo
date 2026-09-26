import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import {
  academicEvidenceOrigins,
  academicEvidenceTypes,
  academicEvidenceVerificationStatuses,
  assessAcademicEvidence,
  type AcademicEvidenceOrigin,
  type AcademicEvidenceType,
  type AcademicEvidenceVerificationStatus,
} from "@/lib/academic-evidence";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedKeys = new Set([
  "student_id",
  "evidence_type",
  "institution",
  "evidence_date",
  "origin",
  "verification_status",
  "document_id",
]);

type EvidencePayload = {
  student_id: string;
  evidence_type: AcademicEvidenceType;
  institution: string | null;
  evidence_date: string | null;
  origin: AcademicEvidenceOrigin;
  verification_status: AcademicEvidenceVerificationStatus;
  document_id: string | null;
};

type ParseResult =
  | { ok: true; value: EvidencePayload }
  | { ok: false; error: string };

function validDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function parsePayload(body: unknown, now: Date): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Données invalides." };
  }

  const input = body as Record<string, unknown>;
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
    return { ok: false, error: "Le classement contient un champ non autorisé." };
  }

  const studentId = typeof input.student_id === "string" ? input.student_id : "";
  const evidenceType = academicEvidenceTypes.includes(input.evidence_type as AcademicEvidenceType)
    ? input.evidence_type as AcademicEvidenceType
    : null;
  const origin = academicEvidenceOrigins.includes(input.origin as AcademicEvidenceOrigin)
    ? input.origin as AcademicEvidenceOrigin
    : null;
  const verificationStatus = academicEvidenceVerificationStatuses.includes(
    input.verification_status as AcademicEvidenceVerificationStatus,
  )
    ? input.verification_status as AcademicEvidenceVerificationStatus
    : null;

  const institution = input.institution === null || input.institution === undefined || input.institution === ""
    ? null
    : typeof input.institution === "string" && input.institution.trim().length <= 180
      ? input.institution.trim()
      : undefined;

  const evidenceDate = input.evidence_date === null || input.evidence_date === undefined || input.evidence_date === ""
    ? null
    : typeof input.evidence_date === "string" && validDateOnly(input.evidence_date)
      ? input.evidence_date
      : undefined;

  const documentId = input.document_id === null || input.document_id === undefined || input.document_id === ""
    ? null
    : typeof input.document_id === "string" && uuidPattern.test(input.document_id)
      ? input.document_id
      : undefined;

  if (!uuidPattern.test(studentId) || !evidenceType || !origin || !verificationStatus) {
    return { ok: false, error: "Le contrat de preuve académique est invalide." };
  }
  if (institution === undefined || evidenceDate === undefined || documentId === undefined) {
    return { ok: false, error: "Une valeur de preuve académique est invalide." };
  }
  if (evidenceDate && evidenceDate > now.toISOString().slice(0, 10)) {
    return { ok: false, error: "La date de la preuve ne peut pas être dans le futur." };
  }

  return {
    ok: true,
    value: {
      student_id: studentId,
      evidence_type: evidenceType,
      institution,
      evidence_date: evidenceDate,
      origin,
      verification_status: verificationStatus,
      document_id: documentId,
    },
  };
}

function databaseErrorResponse(error: { message?: string | null; code?: string | null }) {
  const message = error.message || "";
  if (message.includes("academic_evidence_acceptance_prerequisites_missing")) {
    return NextResponse.json(
      { error: "Les conditions nécessaires pour accepter cette preuve ne sont pas remplies." },
      { status: 409 },
    );
  }
  if (message.includes("academic_evidence_document_not_approved")) {
    return NextResponse.json(
      { error: "Le document lié doit être approuvé avant acceptation comme preuve de parcours." },
      { status: 409 },
    );
  }
  if (message.includes("academic_evidence_date_invalid")
    || message.includes("academic_evidence_verification_time_invalid")) {
    return NextResponse.json({ error: "La date de la preuve ou de sa vérification est invalide." }, { status: 400 });
  }
  if (message.includes("academic_evidence_admin_verifier_required")) {
    return NextResponse.json({ error: "La vérification doit être effectuée par l’Admin connecté." }, { status: 403 });
  }
  if (error.code === "23503") {
    return NextResponse.json({ error: "La preuve référence un étudiant ou un document invalide." }, { status: 400 });
  }
  return NextResponse.json({ error: "Impossible d’enregistrer la preuve académique." }, { status: 500 });
}

async function loadDocumentStatus(
  supabase: Awaited<ReturnType<typeof getAdminUser>>["supabase"],
  documentId: string | null,
  studentId: string,
) {
  if (!documentId) return { status: null, error: null };

  const { data, error } = await supabase
    .from("documents")
    .select("id,status")
    .eq("id", documentId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (error) return { status: null, error: "load_failed" as const };
  if (!data) return { status: null, error: "not_owned" as const };
  return { status: data.status as string, error: null };
}

function writePayload(
  payload: EvidencePayload,
  userId: string,
  documentStatus: string | null,
  now: Date,
) {
  const accepted = payload.verification_status === "accepted_for_pathway";
  const verifiedAt = accepted ? now.toISOString() : null;

  if (accepted) {
    const assessment = assessAcademicEvidence({
      type: payload.evidence_type,
      institution: payload.institution,
      evidence_date: payload.evidence_date,
      origin: payload.origin,
      verification_status: payload.verification_status,
      document_id: payload.document_id,
      document_status: documentStatus,
      verified_at: verifiedAt,
    }, now);

    if (!assessment.can_support_pathway_decision) {
      return { ok: false as const, error: assessment.reason };
    }
  }

  return {
    ok: true as const,
    value: {
      student_id: payload.student_id,
      evidence_type: payload.evidence_type,
      institution: payload.institution,
      evidence_date: payload.evidence_date,
      origin: payload.origin,
      verification_status: payload.verification_status,
      document_id: payload.document_id,
      verified_by: accepted ? userId : null,
      verified_at: verifiedAt,
    },
  };
}

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const now = new Date();
  const parsed = parsePayload(await request.json().catch(() => null), now);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const linkedDocument = await loadDocumentStatus(
    supabase,
    parsed.value.document_id,
    parsed.value.student_id,
  );
  if (linkedDocument.error === "load_failed") {
    return NextResponse.json({ error: "Impossible de vérifier le document lié." }, { status: 500 });
  }
  if (linkedDocument.error === "not_owned") {
    return NextResponse.json(
      { error: "Le document lié n’appartient pas à cet étudiant ou n’existe pas." },
      { status: 400 },
    );
  }

  const write = writePayload(parsed.value, user.id, linkedDocument.status, now);
  if (!write.ok) return NextResponse.json({ error: write.error }, { status: 409 });

  const { data, error } = await supabase
    .from("academic_evidence")
    .insert(write.value)
    .select("id")
    .single();

  if (error) return databaseErrorResponse(error);
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const { id, ...candidate } = body as Record<string, unknown>;
  if (typeof id !== "string" || !uuidPattern.test(id)) {
    return NextResponse.json({ error: "Identifiant de preuve invalide." }, { status: 400 });
  }

  const now = new Date();
  const parsed = parsePayload(candidate, now);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data: current, error: currentError } = await supabase
    .from("academic_evidence")
    .select("id,student_id")
    .eq("id", id)
    .maybeSingle();

  if (currentError) {
    return NextResponse.json({ error: "Impossible de charger la preuve académique." }, { status: 500 });
  }
  if (!current) return NextResponse.json({ error: "Preuve académique introuvable." }, { status: 404 });
  if (current.student_id !== parsed.value.student_id) {
    return NextResponse.json(
      { error: "L’étudiant associé à une preuve existante ne peut pas être modifié." },
      { status: 409 },
    );
  }

  const linkedDocument = await loadDocumentStatus(
    supabase,
    parsed.value.document_id,
    parsed.value.student_id,
  );
  if (linkedDocument.error === "load_failed") {
    return NextResponse.json({ error: "Impossible de vérifier le document lié." }, { status: 500 });
  }
  if (linkedDocument.error === "not_owned") {
    return NextResponse.json(
      { error: "Le document lié n’appartient pas à cet étudiant ou n’existe pas." },
      { status: 400 },
    );
  }

  const write = writePayload(parsed.value, user.id, linkedDocument.status, now);
  if (!write.ok) return NextResponse.json({ error: write.error }, { status: 409 });

  const { student_id: _studentId, ...updates } = write.value;
  void _studentId;

  const { data, error } = await supabase
    .from("academic_evidence")
    .update(updates)
    .eq("id", id)
    .eq("student_id", parsed.value.student_id)
    .select("id")
    .maybeSingle();

  if (error) return databaseErrorResponse(error);
  if (!data) return NextResponse.json({ error: "Preuve académique introuvable." }, { status: 404 });

  return NextResponse.json({ ok: true, id: data.id });
}
