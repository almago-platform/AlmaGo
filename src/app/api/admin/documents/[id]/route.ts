import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, isAdmin } = await getAdminUser();

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });

  const { id } = await params;

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "La suppression privilégiée n’est pas configurée sur ce serveur." },
      { status: 503 },
    );
  }

  const { data: document, error: readError } = await privileged
    .from("documents")
    .select("id,storage_path,original_filename")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: "Impossible de vérifier ce document." }, { status: 500 });
  }
  if (!document) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  const { error: storageError } = await privileged.storage
    .from("student-documents")
    .remove([document.storage_path]);

  if (storageError) {
    return NextResponse.json(
      { error: "Impossible de supprimer le fichier du stockage privé. Aucun enregistrement n’a été supprimé." },
      { status: 500 },
    );
  }

  const { error: deleteError } = await privileged.from("documents").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Le fichier privé a été supprimé, mais l’enregistrement du document doit être vérifié." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, filename: document.original_filename });
}
