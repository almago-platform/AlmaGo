import { NextResponse } from "next/server";
import { getStudentUser } from "@/lib/auth/access";
import { removableDocumentStatuses } from "@/lib/documents";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isStudent) return NextResponse.json({ error: "Accès étudiant requis." }, { status: 403 });
  const { id } = await params;
  const { data: document } = await supabase.from("documents").select("id,storage_path,status").eq("id", id).maybeSingle();
  if (!document) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  if (!removableDocumentStatuses.includes(document.status as (typeof removableDocumentStatuses)[number])) return NextResponse.json({ error: "Ce document ne peut plus être supprimé." }, { status: 403 });
  const { error: storageError } = await supabase.storage.from("student-documents").remove([document.storage_path]);
  if (storageError) return NextResponse.json({ error: "Impossible de supprimer le fichier." }, { status: 500 });
  const { error: deleteError } = await supabase.from("documents").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: "Le fichier a été supprimé, mais son enregistrement doit être vérifié." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
