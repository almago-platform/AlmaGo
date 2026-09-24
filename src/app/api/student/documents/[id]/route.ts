import { NextResponse } from "next/server";
import { getStudentUser } from "@/lib/auth/access";
import { removableDocumentStatuses } from "@/lib/documents";
import { isUuid } from "@/lib/identifiers";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isStudent) return NextResponse.json({ error: "Accès réservé aux étudiants." }, { status: 403 });
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Identifiant de document invalide." }, { status: 400 });

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id,storage_path,status")
    .eq("id", id)
    .maybeSingle();

  if (documentError) return NextResponse.json({ error: "Impossible de vérifier le document." }, { status: 500 });
  if (!document) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  if (!removableDocumentStatuses.includes(document.status as (typeof removableDocumentStatuses)[number])) return NextResponse.json({ error: "Ce document ne peut plus être supprimé." }, { status: 403 });
  const { error: storageError } = await supabase.storage.from("student-documents").remove([document.storage_path]);
  if (storageError) return NextResponse.json({ error: "Impossible de supprimer le fichier." }, { status: 500 });
  const { error: deleteError } = await supabase.from("documents").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: "Le fichier a été supprimé, mais son enregistrement doit être vérifié." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
