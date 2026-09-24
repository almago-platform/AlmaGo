import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { degreeLevels } from "@/lib/phase4";
import { isHttpSourceUrl, isKnownCatalogueFixtureName } from "@/lib/source-verification";
import { isUuid } from "@/lib/identifiers";

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
}

function programValidationError(body: Record<string, unknown>) {
  if (isKnownCatalogueFixtureName(body.name)) {
    return "Ce nom correspond à une donnée de test connue et ne peut pas être ajouté au catalogue.";
  }

  if (!degreeLevels.includes(body.degree_level as (typeof degreeLevels)[number])) {
    return "Choisissez un niveau de diplôme valide.";
  }

  for (const key of ["winter_deadline", "summer_deadline"] as const) {
    const value = body[key];
    if (typeof value === "string" && value.trim() && !isValidDateOnly(value.trim())) {
      return "Les échéances doivent être des dates valides.";
    }
    if (value != null && typeof value !== "string") {
      return "Les échéances doivent être des dates valides.";
    }
  }

  const average = body.indicative_average;
  if (
    average != null &&
    !(
      (typeof average === "string" && (!average.trim() || Number.isFinite(Number(average)))) ||
      (typeof average === "number" && Number.isFinite(average))
    )
  ) {
    return "La moyenne indicative doit être un nombre valide.";
  }

  return null;
}

function payload(body: Record<string, unknown>) {
  const intakeTerms = typeof body.intake_terms === "string" ? body.intake_terms.split(",").map(item => item.trim()).filter(Boolean).slice(0, 5) : [];
  const optionalText = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const numberValue = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) return Number(value);
    return null;
  };
  const data = {
    university_id: body.university_id,
    name: typeof body.name === "string" ? body.name.trim().slice(0, 180) : "",
    degree_level: body.degree_level as (typeof degreeLevels)[number],
    field: optionalText(body.field),
    teaching_language: optionalText(body.teaching_language ?? body.language),
    intake_terms: intakeTerms,
    duration: optionalText(body.duration),
    nc_requirement: optionalText(body.nc_requirement),
    german_level_required: optionalText(body.german_level_required),
    english_level_required: optionalText(body.english_level_required),
    diploma_required: optionalText(body.diploma_required),
    indicative_average: numberValue(body.indicative_average),
    studienkolleg_required: body.studienkolleg_required as boolean,
    testas_required: body.testas_required as boolean,
    uni_assist_required: body.uni_assist_required as boolean,
    application_fee_notes: optionalText(body.application_fee_notes),
    winter_deadline: typeof body.winter_deadline === "string" && body.winter_deadline.trim() ? body.winter_deadline.trim() : null,
    summer_deadline: typeof body.summer_deadline === "string" && body.summer_deadline.trim() ? body.summer_deadline.trim() : null,
    application_url: optionalText(body.application_url ?? body.official_url),
    source_url: optionalText(body.source_url),
    almago_notes: optionalText(body.almago_notes),
    is_active: body.is_active as boolean,
  };

  return body.mark_verified === true
    ? { ...data, verified_at: new Date().toISOString() }
    : data;
}

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
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
  const data = payload(body);
  if (!data.name || !isUuid(data.university_id)) return NextResponse.json({ error: "Université et nom du programme obligatoires." }, { status: 400 });

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
      { error: "Choisissez une université active avant de créer ce programme." },
      { status: 400 },
    );
  }

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
  const { data: created, error } = await supabase.from("programs").insert(data).select("id").single();
  if (error) return NextResponse.json({ error: "Impossible de créer le programme." }, { status: 500 });
  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}

export { payload as programPayload, programValidationError };
