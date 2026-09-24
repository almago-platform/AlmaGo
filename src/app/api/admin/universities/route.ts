import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { universityTypes } from "@/lib/phase4";
import { isHttpSourceUrl, isKnownCatalogueFixtureName } from "@/lib/source-verification";

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  for (const key of ["is_active", "is_public"] as const) {
    if (typeof body[key] !== "boolean") {
      return NextResponse.json(
        { error: "Les états actif/public de l’établissement doivent être explicitement définis." },
        { status: 400 },
      );
    }
  }
  if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "Le nom de l’université est obligatoire." }, { status: 400 });
  if (isKnownCatalogueFixtureName(body.name)) return NextResponse.json({ error: "Ce nom correspond à une donnée de test connue et ne peut pas être ajouté au catalogue." }, { status: 400 });
  if (!universityTypes.includes(body.university_type as (typeof universityTypes)[number])) {
    return NextResponse.json({ error: "Choisissez un type d’établissement valide." }, { status: 400 });
  }
  const universityType = body.university_type as (typeof universityTypes)[number];
  const optionalText = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const websiteUrl = optionalText(body.website_url);
  const sourceUrl = optionalText(body.source_url);
  const logoUrl = optionalText(body.logo_url);
  const universityUrls = [websiteUrl, sourceUrl].filter((value): value is string => Boolean(value));
  if (logoUrl && !isHttpSourceUrl(logoUrl)) {
    return NextResponse.json(
      { error: "Le lien du logo doit être une URL http/https valide." },
      { status: 400 },
    );
  }
  if (universityUrls.some((value) => !isHttpSourceUrl(value))) {
    return NextResponse.json(
      { error: "Les liens du site et de la source doivent être des URL http/https valides." },
      { status: 400 },
    );
  }
  if (
    body.mark_verified === true &&
    !isHttpSourceUrl(websiteUrl) &&
    !isHttpSourceUrl(sourceUrl)
  ) {
    return NextResponse.json(
      { error: "Ajoutez une URL officielle valide (http/https) avant de confirmer la vérification." },
      { status: 400 },
    );
  }
  const { data, error } = await supabase.from("universities").insert({
    name: body.name.trim().slice(0, 180),
    city: optionalText(body.city),
    country: "DE",
    bundesland: optionalText(body.bundesland),
    university_type: universityType,
    website_url: websiteUrl,
    source_url: sourceUrl,
    logo_url: logoUrl,
    description: optionalText(body.description),
    is_public: body.is_public as boolean,
    tuition_notes: optionalText(body.tuition_notes),
    // New catalogue records always start inactive. Activation is a separate, explicit admin action.
    is_active: false,
    ...(body.mark_verified === true ? { verified_at: new Date().toISOString() } : {}),
  }).select("id").single();
  if (error) return NextResponse.json({ error: "Impossible de créer l’université." }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
