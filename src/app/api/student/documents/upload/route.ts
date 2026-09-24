import { NextResponse } from "next/server";
import { getStudentUser } from "@/lib/auth/access";
import { hasSafeDocumentSignature, isDocumentCategory, isSafeDocumentFile, maxDocumentBytes, safeFilename } from "@/lib/documents";

export async function POST(request: Request) {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isStudent) return NextResponse.json({ error: "Accès réservé aux étudiants." }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  const category = formData.get("category");
  if (!(file instanceof File) || !isDocumentCategory(category)) return NextResponse.json({ error: "Document ou catégorie invalide." }, { status: 400 });
  if (!isSafeDocumentFile(file)) {
    return NextResponse.json({ error: "Utilisez un PDF, JPEG ou PNG de 10 MiB maximum." }, { status: 400 });
  }
  if (!(await hasSafeDocumentSignature(file))) {
    return NextResponse.json(
      { error: "Le contenu du fichier ne correspond pas à un PDF, JPEG ou PNG valide." },
      { status: 400 },
    );
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
