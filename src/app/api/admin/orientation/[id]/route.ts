import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const { id } = await params;
  const { error } = await supabase.from("program_recommendations").update({ is_archived: true, archived_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: "Impossible d’archiver la recommandation." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
