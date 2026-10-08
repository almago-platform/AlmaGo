import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { hasClientLifecycleEntitlement } from "@/lib/auth/entitlement";
import { hasAllowedDocumentSignature, maxDocumentBytes, safeFilename } from "@/lib/documents";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BUCKET = "student-documents";
const typeValues = new Set(["definitive_admission", "conditional_admission"]);

function validDate(value: string) {
  if (!DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    && value <= new Date().toISOString().slice(0, 10);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });

  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) {
    return NextResponse.json({ error: "Dossier invalide." }, { status: 400 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  const file = form.get("file");
  const applicationId = form.get("application_id");
  const evidenceType = form.get("evidence_type");
  const institution = form.get("institution");
  const evidenceDate = form.get("evidence_date");

  if (typeof applicationId !== "string" || !UUID_RE.test(applicationId)
    || typeof evidenceType !== "string" || !typeValues.has(evidenceType)) {
    return NextResponse.json({ error: "Sélectionnez une candidature et le type de lettre." }, { status: 400 });
  }
  if (typeof institution !== "string" || institution.trim().length < 2 || institution.trim().length > 180) {
    return NextResponse.json({ error: "Indiquez le nom de l’établissement qui a émis la lettre." }, { status: 400 });
  }
  if (typeof evidenceDate !== "string" || (evidenceDate !== "" && !validDate(evidenceDate))) {
    return NextResponse.json({ error: "La date de la lettre est invalide." }, { status: 400 });
  }
  if (!(file instanceof File) || file.type !== "application/pdf"
    || !file.name.toLowerCase().endsWith(".pdf")
    || file.size <= 0 || file.size > maxDocumentBytes
    || !(await hasAllowedDocumentSignature(file))) {
    return NextResponse.json({ error: "Ajoutez un PDF valide de 10 MiB maximum." }, { status: 400 });
  }

  const [
    { data: profile, error: profileError },
    { data: application, error: appError },
    { data: access, error: accessError },
  ] = await Promise.all([
    supabase.from("profiles").select("id").eq("id", studentId).maybeSingle(),
    supabase.from("applications").select("id,student_id")
      .eq("id", applicationId).eq("student_id", studentId).maybeSingle(),
    supabase.from("customer_access").select("status").eq("user_id", studentId).maybeSingle(),
  ]);
  if (profileError || appError || accessError) {
    return NextResponse.json({ error: "Impossible de vérifier le dossier et sa candidature." }, { status: 500 });
  }
  if (!profile || !application) {
    return NextResponse.json({ error: "La candidature n’appartient pas à ce dossier." }, { status: 404 });
  }
  if (!hasClientLifecycleEntitlement(access?.status)) {
    return NextResponse.json({ error: "La personne doit disposer de l’accès étudiant pour recevoir ce PDF dans ses candidatures." }, { status: 409 });
  }

  const documentId = crypto.randomUUID();
  const path = `${studentId}/admissions/${documentId}/${safeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: "Impossible d’enregistrer le PDF dans l’espace privé." }, { status: 500 });
  }

  async function removeFile() {
    await supabase.storage.from(BUCKET).remove([path]);
  }
  async function removeDocument() {
    await supabase.from("documents").delete().eq("id", documentId).eq("student_id", studentId);
  }

  const { error: documentError } = await supabase.from("documents").insert({
    id: documentId,
    student_id: studentId,
    uploaded_by: user.id,
    category: "admission",
    storage_path: path,
    original_filename: file.name,
    mime_type: "application/pdf",
    size_bytes: file.size,
    status: "pending",
  });
  if (documentError) {
    await removeFile();
    return NextResponse.json({ error: "La lettre n’a pas pu être rattachée au dossier." }, { status: 500 });
  }

  const { data: evidence, error: evidenceError } = await supabase
    .from("academic_evidence")
    .insert({
      student_id: studentId,
      application_id: applicationId,
      document_id: documentId,
      evidence_type: evidenceType,
      institution: institution.trim(),
      evidence_date: evidenceDate || null,
      origin: "official_document",
      verification_status: "needs_review",
      verified_by: null,
      verified_at: null,
    })
    .select("id")
    .single();
  if (evidenceError || !evidence) {
    await removeDocument();
    await removeFile();
    return NextResponse.json({ error: "Impossible de lier le PDF à cette candidature." }, { status: 500 });
  }

  const { error: historyError } = await supabase.from("student_history").insert({
    student_id: studentId,
    actor_id: user.id,
    event_type: "admin_admission_document_received",
    message: "Une lettre universitaire a été ajoutée au dossier. Sa vérification par Campus Allemagne reste en attente.",
    metadata: {
      application_id: applicationId,
      document_id: documentId,
      academic_evidence_id: evidence.id,
      verification_status: "needs_review",
    },
  });
  if (historyError) {
    await supabase.from("academic_evidence").delete().eq("id", evidence.id).eq("student_id", studentId);
    await removeDocument();
    await removeFile();
    return NextResponse.json({ error: "La lettre n’a pas été conservée : historique indisponible." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    document_id: documentId,
    evidence_id: evidence.id,
    verification_status: "needs_review",
  }, { status: 201 });
}
