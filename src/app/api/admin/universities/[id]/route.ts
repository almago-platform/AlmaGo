import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { universityTypes } from "@/lib/phase4";
import { isHttpSourceUrl, sourceUrlsChanged } from "@/lib/source-verification";
import { isUuid } from "@/lib/identifiers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Identifiant d’université invalide." }, { status: 400 });

  const isActiveOnlyPatch =
    typeof body.is_active === "boolean" &&
    Object.keys(body).every((key) => key === "is_active");

  if (isActiveOnlyPatch) {
    const { data: updated, error } = await supabase
      .from("universities")
      .update({ is_active: body.is_active })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Impossible de modifier l’état de l’université." }, { status: 500 });
    if (!updated) return NextResponse.json({ error: "Université introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  for (const key of ["is_active", "is_public"] as const) {
    if (typeof body[key] !== "boolean") {
      return NextResponse.json(
        { error: "Les états actif/public de l’établissement doivent être explicitement définis." },
        { status: 400 },
      );
    }
  }

  if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "Le nom de l’université est obligatoire." }, { status: 400 });
  if (!universityTypes.includes(body.university_type as (typeof universityTypes)[number])) {
    return NextResponse.json({ error: "Choisissez un type d’établissement valide." }, { status: 400 });
  }
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
    .select("name,city,bundesland,university_type,website_url,source_url,description,is_public,tuition_notes")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: "Impossible de vérifier la source actuelle de l’université." }, { status: 500 });
  }
  if (!existing) return NextResponse.json({ error: "Université introuvable." }, { status: 404 });

  const optionalText = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;

  const nextUniversity = {
    name: body.name.trim().slice(0, 180),
    city: optionalText(body.city),
    bundesland: optionalText(body.bundesland),
    university_type: body.university_type as (typeof universityTypes)[number],
    website_url: websiteUrl || null,
    source_url: sourceUrl || null,
    description: optionalText(body.description),
    is_public: body.is_public as boolean,
    tuition_notes: optionalText(body.tuition_notes),
  };

  const sourceChanged = sourceUrlsChanged(
    [existing.website_url, existing.source_url],
    [nextUniversity.website_url, nextUniversity.source_url],
  );
  const verificationContentChanged =
    sourceChanged ||
    existing.name !== nextUniversity.name ||
    existing.city !== nextUniversity.city ||
    existing.bundesland !== nextUniversity.bundesland ||
    existing.university_type !== nextUniversity.university_type ||
    existing.description !== nextUniversity.description ||
    existing.is_public !== nextUniversity.is_public ||
    existing.tuition_notes !== nextUniversity.tuition_notes;

  const verificationPatch =
    body.mark_verified === true || !verificationContentChanged ? {} : { verified_at: null };

  const { data: updated, error } = await supabase.from("universities").update({
    ...nextUniversity,
    logo_url: optionalText(body.logo_url),
    is_active: body.is_active as boolean,
    ...(body.mark_verified === true ? { verified_at: new Date().toISOString() } : {}),
    ...verificationPatch,
  }).eq("id", id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "Impossible de modifier l’université." }, { status: 500 });
  if (!updated) return NextResponse.json({ error: "Université introuvable." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
