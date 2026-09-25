import { NextResponse } from "next/server";
import { resolveApplicationIntake } from "@/lib/application-intake";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.recommendation_id !== "string") {
    return NextResponse.json({ error: "Recommandation invalide." }, { status: 400 });
  }

  const [
    { data: recommendation, error: recommendationError },
    { data: project, error: projectError },
  ] = await Promise.all([
    supabase
      .from("program_recommendations")
      .select("id,program_id,status,is_archived,programs(intake_terms,winter_deadline,summer_deadline)")
      .eq("id", body.recommendation_id)
      .eq("student_id", user.id)
      .maybeSingle(),
    supabase
      .from("student_projects")
      .select("target_intake")
      .eq("student_id", user.id)
      .maybeSingle(),
  ]);

  if (recommendationError || projectError) {
    return NextResponse.json(
      { error: "Impossible de vérifier la recommandation et votre rentrée souhaitée." },
      { status: 500 },
    );
  }

  if (!recommendation || recommendation.is_archived || recommendation.status === "not_recommended") {
    return NextResponse.json({ error: "Cette recommandation n’est plus disponible." }, { status: 400 });
  }

  const program = Array.isArray(recommendation.programs)
    ? recommendation.programs[0]
    : recommendation.programs;

  if (!program) {
    return NextResponse.json({ error: "Le programme lié à cette recommandation est introuvable." }, { status: 409 });
  }

  const resolution = resolveApplicationIntake({
    target_intake: project?.target_intake || null,
    intake_terms: Array.isArray(program.intake_terms) ? program.intake_terms : [],
    winter_deadline: program.winter_deadline,
    summer_deadline: program.summer_deadline,
  });

  if (resolution.status === "needs_manual_review") {
    return NextResponse.json(
      { error: resolution.reason, code: "intake_confirmation_required" },
      { status: 409 },
    );
  }

  if (resolution.status === "deadline_passed") {
    return NextResponse.json(
      {
        error: "L’échéance enregistrée pour cette rentrée est dépassée. Vérifiez la source officielle avant de poursuivre.",
        code: "application_deadline_passed",
        deadline: resolution.deadline,
      },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      student_id: user.id,
      program_id: recommendation.program_id,
      intake: resolution.intake,
      deadline: resolution.deadline,
      status: "interested",
      next_action: resolution.deadline
        ? "Préparer les prochaines étapes avant l’échéance enregistrée."
        : "Confirmer l’échéance officielle puis préparer les prochaines étapes.",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: error.code === "23505"
          ? "Une candidature existe déjà pour ce programme et cette rentrée."
          : "Impossible de créer la candidature.",
      },
      { status: error.code === "23505" ? 409 : 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      id: data.id,
      intake: resolution.intake,
      deadline: resolution.deadline,
    },
    { status: 201 },
  );
}
