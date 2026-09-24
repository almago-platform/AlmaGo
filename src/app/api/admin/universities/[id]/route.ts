import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { universityTypes } from "@/lib/phase4";
import { isHttpSourceUrl, sourceUrlsChanged } from "@/lib/source-verification";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  const { id } = await params;

  if (typeof body.is_active === "boolean" && !("name" in body)) {
    const { error } = await supabase
      .from("universities")
      .update({ is_active: body.is_active })
      .eq("id", id);
    if (error) return NextResponse.json({ error: "Impossible de modifier l’état de l’université." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "Le nom de l’université est obligatoire." }, { status: 400 });
  const websiteUrl = typeof body.website_url === "string" ? body.website_url.trim() : "";
  const sourceUrl = typeof body.source_url === "string" ? body.source_url.trim() : "";
  const universityUrls = [websiteUrl, sourceUrl].filter(Boolean);
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
  const { data: existing, error: existingError } = await supabase
    .from("universities")
    .select("website_url,source_url")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: "Impossible de vérifier la source actuelle de l’université." }, { status: 500 });
  }
  if (!existing) return NextResponse.json({ error: "Université introuvable." }, { status: 404 });

  const sourceChanged = sourceUrlsChanged(
    [existing.website_url, existing.source_url],
    [websiteUrl, sourceUrl],
  );
  const verificationPatch =
    body.mark_verified === true || !sourceChanged ? {} : { verified_at: null };

  const { error } = await supabase.from("universities").update({
    name: body.name.trim().slice(0, 180), city: typeof body.city === "string" ? body.city.trim() : null,
    bundesland: typeof body.bundesland === "string" ? body.bundesland.trim() : null,
    university_type: universityTypes.includes(body.university_type as (typeof universityTypes)[number]) ? body.university_type : "Universität",
    website_url: typeof body.website_url === "string" ? body.website_url.trim() : null,
    source_url: typeof body.source_url === "string" ? body.source_url.trim() : null,
    logo_url: typeof body.logo_url === "string" ? body.logo_url.trim() : null,
    description: typeof body.description === "string" ? body.description.trim() : null,
    is_public: body.is_public !== false, tuition_notes: typeof body.tuition_notes === "string" ? body.tuition_notes.trim() : null,
    is_active: body.is_active !== false,
    ...(body.mark_verified === true ? { verified_at: new Date().toISOString() } : {}),
    ...verificationPatch,
  }).eq("id", id);
  if (error) return NextResponse.json({ error: "Impossible de modifier l’université." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
