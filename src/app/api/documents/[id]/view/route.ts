import { NextResponse } from "next/server";
import { getRoleUser } from "@/lib/auth/access";
import { isUuid } from "@/lib/identifiers";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, role } = await getRoleUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (role !== "student" && role !== "admin") {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Identifiant de document invalide." }, { status: 400 });

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (documentError) return NextResponse.json({ error: "Impossible de vérifier le document." }, { status: 500 });
  if (!document) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  const { data, error } = await supabase.storage.from("student-documents").createSignedUrl(document.storage_path, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Impossible d’ouvrir le document." }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
