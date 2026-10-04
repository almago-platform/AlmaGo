import { NextResponse } from "next/server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { starterDocumentCategories } from "@/lib/campus-intake";

const allowedStarterCategories = new Set(
  starterDocumentCategories.map((item) => item.category),
);

export async function GET(
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
    .select("storage_path,category")
    .eq("id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!document || !allowedStarterCategories.has(document.category)) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("student-documents")
    .createSignedUrl(document.storage_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Impossible d’ouvrir le document." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
