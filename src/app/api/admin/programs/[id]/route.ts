import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { programPayload } from "@/app/api/admin/programs/route";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  const data = programPayload(body);
  if (!data.name || typeof data.university_id !== "string") return NextResponse.json({ error: "Université et nom du programme obligatoires." }, { status: 400 });
  if (body.mark_verified === true && !data.source_url && !data.application_url) {
    return NextResponse.json({ error: "Ajoutez une source officielle avant de confirmer la vérification." }, { status: 400 });
  }
  const { id } = await params;
  const { error } = await supabase.from("programs").update(data).eq("id", id);
  if (error) return NextResponse.json({ error: "Impossible de modifier le programme." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
