import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { isUuid } from "@/lib/identifiers";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Identifiant de piste invalide." }, { status: 400 });

  const { data: archived, error } = await supabase
    .from("program_recommendations")
    .update({ is_archived: true, archived_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Impossible d’archiver la recommandation." }, { status: 500 });
  if (!archived) return NextResponse.json({ error: "Piste d’orientation introuvable." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
