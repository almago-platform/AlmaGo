import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { programPayload } from "@/app/api/admin/programs/route";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const { id } = await params;
  let existingRequirements: unknown = undefined;

  if (Object.prototype.hasOwnProperty.call(body, "master_requirements")) {
    const { data: existing, error: readError } = await supabase
      .from("programs")
      .select("requirements")
      .eq("id", id)
      .maybeSingle();

    if (readError) return NextResponse.json({ error: "Impossible de lire les exigences existantes." }, { status: 500 });
    if (!existing) return NextResponse.json({ error: "Programme introuvable." }, { status: 404 });
    existingRequirements = existing.requirements;
  }

  const parsed = programPayload(body, existingRequirements);
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;
  if (!data.name || typeof data.university_id !== "string") return NextResponse.json({ error: "Université et nom du programme obligatoires." }, { status: 400 });

  const { error } = await supabase.from("programs").update(data).eq("id", id);
  if (error) return NextResponse.json({ error: "Impossible de modifier le programme." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
