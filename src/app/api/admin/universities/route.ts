import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { universityTypes } from "@/lib/phase4";

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "Le nom de l’université est obligatoire." }, { status: 400 });
  const universityType = universityTypes.includes(body.university_type as (typeof universityTypes)[number]) ? body.university_type : "Universität";
  const { data, error } = await supabase.from("universities").insert({
    name: body.name.trim().slice(0, 180), city: typeof body.city === "string" ? body.city.trim() : null,
    country: "DE", bundesland: typeof body.bundesland === "string" ? body.bundesland.trim() : null,
    university_type: universityType, website_url: typeof body.website_url === "string" ? body.website_url.trim() : null,
    logo_url: typeof body.logo_url === "string" ? body.logo_url.trim() : null,
    description: typeof body.description === "string" ? body.description.trim() : null,
    is_public: body.is_public !== false, tuition_notes: typeof body.tuition_notes === "string" ? body.tuition_notes.trim() : null,
    is_active: body.is_active !== false,
  }).select("id").single();
  if (error) return NextResponse.json({ error: "Impossible de créer l’université." }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
