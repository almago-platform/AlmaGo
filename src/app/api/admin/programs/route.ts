import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { degreeLevels } from "@/lib/phase4";

function payload(body: Record<string, unknown>) {
  const intakeTerms = typeof body.intake_terms === "string" ? body.intake_terms.split(",").map(item => item.trim()).filter(Boolean).slice(0, 5) : [];
  const numberValue = (value: unknown) => typeof value === "string" && value.trim() ? Number(value) : null;
  const data = {
    university_id: body.university_id, name: typeof body.name === "string" ? body.name.trim().slice(0, 180) : "",
    degree_level: degreeLevels.includes(body.degree_level as (typeof degreeLevels)[number]) ? body.degree_level : "Master",
    field: typeof body.field === "string" ? body.field.trim() : null, teaching_language: typeof (body.teaching_language ?? body.language) === "string" ? String(body.teaching_language ?? body.language).trim() : null,
    intake_terms: intakeTerms, duration: typeof body.duration === "string" ? body.duration.trim() : null, nc_requirement: typeof body.nc_requirement === "string" ? body.nc_requirement.trim() : null,
    german_level_required: typeof body.german_level_required === "string" ? body.german_level_required.trim() : null, english_level_required: typeof body.english_level_required === "string" ? body.english_level_required.trim() : null,
    diploma_required: typeof body.diploma_required === "string" ? body.diploma_required.trim() : null, indicative_average: numberValue(body.indicative_average),
    studienkolleg_required: body.studienkolleg_required === true, testas_required: body.testas_required === true, uni_assist_required: body.uni_assist_required === true,
    application_fee_notes: typeof body.application_fee_notes === "string" ? body.application_fee_notes.trim() : null, winter_deadline: typeof body.winter_deadline === "string" && body.winter_deadline ? body.winter_deadline : null,
    summer_deadline: typeof body.summer_deadline === "string" && body.summer_deadline ? body.summer_deadline : null, application_url: typeof (body.application_url ?? body.official_url) === "string" ? String(body.application_url ?? body.official_url).trim() : null,
    source_url: typeof body.source_url === "string" ? body.source_url.trim() : null, almago_notes: typeof body.almago_notes === "string" ? body.almago_notes.trim() : null, is_active: body.is_active !== false,
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
  const data = payload(body);
  if (!data.name || typeof data.university_id !== "string") return NextResponse.json({ error: "Université et nom du programme obligatoires." }, { status: 400 });
  const { data: created, error } = await supabase.from("programs").insert(data).select("id").single();
  if (error) return NextResponse.json({ error: "Impossible de créer le programme." }, { status: 500 });
  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}

export { payload as programPayload };
