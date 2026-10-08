import { NextResponse } from "next/server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { removableDocumentStatuses } from "@/lib/documents";
import { starterDocumentCategories } from "@/lib/campus-intake";

const allowedStarterCategories = new Set<string>(
  starterDocumentCategories.map((item) => item.category),
);

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getPhase2StudentAccess();
  const { supabase, user } = access;

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!access.isStudent || !access.phase2Enabled || access.canUseClientFeatures) {
    return NextResponse.json({ error: "Espace de pré-dossier requis." }, { status: 403 });
  }

  const { id } = await params;
  const { data: document } = await supabase
    .from("documents")
    .select("id,storage_path,status,category,uploaded_by")
    .eq("id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!document || document.uploaded_by !== user.id || !allowedStarterCategories.has(document.category)) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  if (!removableDocumentStatuses.includes(
    document.status as (typeof removableDocumentStatuses)[number],
  )) {
    return NextResponse.json(
      { error: "Ce document ne peut plus être supprimé." },
      { status: 403 },
    );
  }

  const { error: storageError } = await supabase.storage
    .from("student-documents")
    .remove([document.storage_path]);

  if (storageError) {
    return NextResponse.json({ error: "Impossible de supprimer le fichier." }, { status: 500 });
  }

  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("student_id", user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Le fichier a été supprimé, mais son enregistrement doit être vérifié." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
