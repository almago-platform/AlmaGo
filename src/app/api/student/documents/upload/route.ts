import { NextResponse } from "next/server";
import { getStudentUser } from "@/lib/auth/access";
import { hasAllowedDocumentSignature, isDocumentCategory, isSafeDocumentFile, maxDocumentBytes, safeFilename } from "@/lib/documents";

export async function POST(request: Request) {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isStudent) return NextResponse.json({ error: "Accès étudiant requis." }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  const category = formData.get("category");
  if (!(file instanceof File) || !isDocumentCategory(category)) return NextResponse.json({ error: "Document ou catégorie invalide." }, { status: 400 });
  if (!isSafeDocumentFile(file)) return NextResponse.json({ error: `Utilise un PDF, JPEG ou PNG de 10 MiB maximum.` }, { status: 400 });
  if (!(await hasAllowedDocumentSignature(file))) {
    return NextResponse.json({ error: "Le contenu du fichier ne correspond pas au format déclaré." }, { status: 400 });
  }

  const { data: currentProcedure, error: procedureError } = await supabase
    .from("student_procedures")
    .select("id")
    .eq("student_id", user.id)
    .eq("is_current", true)
    .maybeSingle();

  if (procedureError) {
    return NextResponse.json({ error: "Impossible de vérifier les pièces demandées." }, { status: 500 });
  }

  if (currentProcedure) {
    const { data: requirements, error: requirementsError } = await supabase
      .from("student_document_requirements")
      .select("requirement_key,requested_from_student,status")
      .eq("student_id", user.id)
      .eq("student_procedure_id", currentProcedure.id)
      .eq("category", category);

    if (requirementsError) {
      return NextResponse.json({ error: "Impossible de vérifier les pièces demandées." }, { status: 500 });
    }

    const uploadAllowed = (requirements || []).some((requirement) =>
      (
        requirement.requested_from_student
        && ["requested", "replacement_required"].includes(requirement.status)
      )
      || (
        requirement.requirement_key === "existing_language_certificate"
        && ["not_applicable", "replacement_required"].includes(requirement.status)
      )
    );

    if (!uploadAllowed) {
      return NextResponse.json(
        { error: "Cette pièce n’est pas demandée pour votre dossier actuellement." },
        { status: 403 },
      );
    }
  }

  const id = crypto.randomUUID();
  const storagePath = `${user.id}/${id}/${safeFilename(file.name)}`;
  const { error: documentError } = await supabase.from("documents").insert({
    id, student_id: user.id, uploaded_by: user.id, category, storage_path: storagePath,
    original_filename: file.name, mime_type: file.type, size_bytes: file.size, status: "pending",
  });
  if (documentError) return NextResponse.json({ error: "Impossible de préparer le document." }, { status: 500 });

  const { error: uploadError } = await supabase.storage.from("student-documents").upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    await supabase.from("documents").delete().eq("id", id);
    return NextResponse.json({ error: "Impossible d’envoyer le fichier." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id, maxSize: maxDocumentBytes }, { status: 201 });
}
