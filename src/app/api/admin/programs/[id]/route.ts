import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { programPayload, programValidationError } from "@/app/api/admin/programs/route";
import { isHttpSourceUrl, sourceUrlsChanged } from "@/lib/source-verification";
import { isUuid } from "@/lib/identifiers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Identifiant de programme invalide." }, { status: 400 });

  const isActiveOnlyPatch =
    typeof body.is_active === "boolean" &&
    Object.keys(body).every((key) => key === "is_active");

  if (isActiveOnlyPatch) {
    const { data: updated, error } = await supabase
      .from("programs")
      .update({ is_active: body.is_active })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Impossible de modifier l’état du programme." }, { status: 500 });
    if (!updated) return NextResponse.json({ error: "Programme introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  for (const key of ["is_active", "studienkolleg_required", "testas_required", "uni_assist_required"] as const) {
    if (typeof body[key] !== "boolean") {
      return NextResponse.json(
        { error: "Les choix structurants du programme doivent être explicitement définis." },
        { status: 400 },
      );
    }
  }

  const validationError = programValidationError(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  const data = programPayload(body);
  if (!data.name || !isUuid(data.university_id)) return NextResponse.json({ error: "Université et nom du programme obligatoires." }, { status: 400 });
  const programmeUrls = [data.source_url, data.application_url].filter(
    (value): value is string => typeof value === "string" && Boolean(value.trim()),
  );
  if (programmeUrls.some((value) => !isHttpSourceUrl(value))) {
    return NextResponse.json(
      { error: "Les liens de source et de candidature doivent être des URL http/https valides." },
      { status: 400 },
    );
  }
  if (
    body.mark_verified === true &&
    !isHttpSourceUrl(data.source_url) &&
    !isHttpSourceUrl(data.application_url)
  ) {
    return NextResponse.json(
      { error: "Ajoutez une URL officielle valide (http/https) avant de confirmer la vérification." },
      { status: 400 },
    );
  }
  const { data: existing, error: existingError } = await supabase
    .from("programs")
    .select("university_id,name,degree_level,field,teaching_language,intake_terms,duration,nc_requirement,german_level_required,english_level_required,diploma_required,indicative_average,studienkolleg_required,testas_required,uni_assist_required,application_fee_notes,winter_deadline,summer_deadline,application_url,source_url")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: "Impossible de vérifier la source actuelle du programme." }, { status: 500 });
  }
  if (!existing) return NextResponse.json({ error: "Programme introuvable." }, { status: 404 });

  if (data.university_id !== existing.university_id) {
    const { data: targetUniversity, error: targetUniversityError } = await supabase
      .from("universities")
      .select("id,is_active")
      .eq("id", data.university_id)
      .maybeSingle();

    if (targetUniversityError) {
      return NextResponse.json({ error: "Impossible de vérifier l’université sélectionnée." }, { status: 500 });
    }
    if (!targetUniversity?.is_active) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas rattacher ce programme à une université inactive." },
        { status: 400 },
      );
    }
  }

  const sourceChanged = sourceUrlsChanged(
    [existing.source_url, existing.application_url],
    [data.source_url, data.application_url],
  );
  const currentAverage = existing.indicative_average == null ? null : Number(existing.indicative_average);
  const nextAverage = data.indicative_average == null ? null : Number(data.indicative_average);

  const verificationContentChanged =
    sourceChanged ||
    existing.university_id !== data.university_id ||
    existing.name !== data.name ||
    existing.degree_level !== data.degree_level ||
    existing.field !== data.field ||
    existing.teaching_language !== data.teaching_language ||
    JSON.stringify(existing.intake_terms || []) !== JSON.stringify(data.intake_terms || []) ||
    existing.duration !== data.duration ||
    existing.nc_requirement !== data.nc_requirement ||
    existing.german_level_required !== data.german_level_required ||
    existing.english_level_required !== data.english_level_required ||
    existing.diploma_required !== data.diploma_required ||
    currentAverage !== nextAverage ||
    existing.studienkolleg_required !== data.studienkolleg_required ||
    existing.testas_required !== data.testas_required ||
    existing.uni_assist_required !== data.uni_assist_required ||
    existing.application_fee_notes !== data.application_fee_notes ||
    existing.winter_deadline !== data.winter_deadline ||
    existing.summer_deadline !== data.summer_deadline;

  const verificationPatch =
    body.mark_verified === true || !verificationContentChanged ? {} : { verified_at: null };

  const { data: updated, error } = await supabase
    .from("programs")
    .update({ ...data, ...verificationPatch })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Impossible de modifier le programme." }, { status: 500 });
  if (!updated) return NextResponse.json({ error: "Programme introuvable." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
