import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

const operations = [
  "accepted_original",
  "authentication_required",
  "authentication_in_progress",
  "authenticated",
  "translation_required",
  "translation_in_progress",
  "translated",
  "legalisation_to_verify",
  "legalisation_required",
  "legalisation_in_progress",
  "legalisation_not_required",
  "legalisation_completed",
  "ready",
  "not_applicable",
] as const;

type RequirementOperation = (typeof operations)[number];

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isOperation(value: unknown): value is RequirementOperation {
  return typeof value === "string" && operations.includes(value as RequirementOperation);
}

function validHttpUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function updateForOperation(
  operation: RequirementOperation,
  note: string,
  legalisationReason: string,
  sourceUrl: string,
) {
  const base: Record<string, unknown> = {
    admin_note: note || null,
    updated_at: new Date().toISOString(),
  };

  if (operation === "accepted_original") return { ...base, status: "accepted_original" };
  if (operation === "authentication_required") {
    return { ...base, status: "authentication_required", requires_tunisian_authentication: true };
  }
  if (operation === "authentication_in_progress") {
    return { ...base, status: "authentication_in_progress", requires_tunisian_authentication: true };
  }
  if (operation === "authenticated") {
    return { ...base, status: "authenticated", requires_tunisian_authentication: true };
  }
  if (operation === "translation_required") {
    return { ...base, status: "translation_required", requires_translation: true };
  }
  if (operation === "translation_in_progress") {
    return { ...base, status: "translation_in_progress", requires_translation: true };
  }
  if (operation === "translated") {
    return { ...base, status: "translated", requires_translation: true };
  }
  if (operation === "legalisation_to_verify") {
    return {
      ...base,
      status: "legalisation_to_verify",
      requires_german_legalisation: null,
      legalisation_status: "to_verify",
      legalisation_reason: legalisationReason || null,
      ...(sourceUrl ? { source_url: sourceUrl, source_verified_at: null } : {}),
    };
  }
  if (operation === "legalisation_required") {
    return {
      ...base,
      status: "legalisation_required",
      requires_german_legalisation: true,
      legalisation_status: "required",
      legalisation_reason: legalisationReason || null,
      source_url: sourceUrl,
      source_verified_at: new Date().toISOString(),
    };
  }
  if (operation === "legalisation_in_progress") {
    return {
      ...base,
      status: "legalisation_in_progress",
      requires_german_legalisation: true,
      legalisation_status: "submitted_external",
      legalisation_reason: legalisationReason || null,
    };
  }
  if (operation === "legalisation_not_required") {
    return {
      ...base,
      status: "ready",
      requires_german_legalisation: false,
      legalisation_status: "not_required",
      legalisation_reason: legalisationReason || null,
      source_url: sourceUrl,
      source_verified_at: new Date().toISOString(),
    };
  }
  if (operation === "legalisation_completed") {
    return {
      ...base,
      status: "ready",
      requires_german_legalisation: true,
      legalisation_status: "completed",
      legalisation_reason: legalisationReason || null,
    };
  }
  if (operation === "ready") return { ...base, status: "ready" };
  return { ...base, status: "not_applicable" };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ studentId: string; requirementId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const { studentId, requirementId } = await params;
  if (!UUID_RE.test(studentId) || !UUID_RE.test(requirementId)) {
    return NextResponse.json({ error: "Exigence documentaire invalide." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !isOperation(body.operation)) {
    return NextResponse.json({ error: "Opération documentaire invalide." }, { status: 400 });
  }

  const note = cleanText(body.admin_note, 1600);
  const legalisationReason = cleanText(body.legalisation_reason, 1600);
  const sourceUrl = cleanText(body.source_url, 1000);

  if (sourceUrl && !validHttpUrl(sourceUrl)) {
    return NextResponse.json({ error: "La source doit être une URL HTTP(S) valide." }, { status: 400 });
  }

  if (
    ["legalisation_to_verify", "legalisation_required", "legalisation_not_required"].includes(body.operation)
    && legalisationReason.length < 3
  ) {
    return NextResponse.json(
      { error: "Ajoutez le motif ou la source de la décision de légalisation." },
      { status: 400 },
    );
  }

  if (
    ["legalisation_required", "legalisation_not_required"].includes(body.operation)
    && !sourceUrl
  ) {
    return NextResponse.json(
      { error: "Ajoutez la source officielle utilisée pour décider la légalisation." },
      { status: 400 },
    );
  }

  const { data: requirement, error: requirementError } = await supabase
    .from("student_document_requirements")
    .select("id,student_id,student_procedure_id,document_id")
    .eq("id", requirementId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (requirementError) {
    return NextResponse.json({ error: "Impossible de charger cette exigence." }, { status: 500 });
  }
  if (!requirement?.student_procedure_id) {
    return NextResponse.json({ error: "Exigence documentaire introuvable." }, { status: 404 });
  }

  const { data: currentProcedure, error: procedureError } = await supabase
    .from("student_procedures")
    .select("id")
    .eq("id", requirement.student_procedure_id)
    .eq("student_id", studentId)
    .eq("is_current", true)
    .maybeSingle();

  if (procedureError) {
    return NextResponse.json({ error: "Impossible de vérifier la procédure courante." }, { status: 500 });
  }
  if (!currentProcedure) {
    return NextResponse.json(
      { error: "Cette exigence appartient à une ancienne procédure et ne peut plus être modifiée." },
      { status: 409 },
    );
  }

  const linkedDocumentRequired = new Set<RequirementOperation>([
    "accepted_original",
    "authentication_in_progress",
    "authenticated",
    "translation_in_progress",
    "translated",
    "legalisation_in_progress",
    "legalisation_not_required",
    "legalisation_completed",
    "ready",
  ]);
  if (linkedDocumentRequired.has(body.operation) && !requirement.document_id) {
    return NextResponse.json(
      { error: "Cette transition nécessite d’abord un fichier lié à l’exigence." },
      { status: 409 },
    );
  }

  const update = updateForOperation(body.operation, note, legalisationReason, sourceUrl);
  const { error: updateError } = await supabase
    .from("student_document_requirements")
    .update(update)
    .eq("id", requirementId)
    .eq("student_id", studentId);

  if (updateError) {
    return NextResponse.json(
      { error: "Impossible de mettre à jour le traitement documentaire." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
