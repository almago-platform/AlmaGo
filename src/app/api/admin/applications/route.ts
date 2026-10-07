import { NextResponse } from "next/server";
import { resolveApplicationIntake } from "@/lib/application-intake";
import { programPublicationIssues } from "@/lib/academic-match";
import { getAdminUser } from "@/lib/auth/access";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const recommendationId = typeof body?.recommendation_id === "string" ? body.recommendation_id.trim() : "";
  if (!UUID_RE.test(recommendationId)) {
    return NextResponse.json({ error: "Recommandation invalide." }, { status: 400 });
  }

  const { data: recommendation, error: recommendationError } = await supabase
    .from("program_recommendations")
    .select("id,student_id,program_id,status,is_archived,programs(is_active,source_url,application_url,verified_at,intake_terms,winter_deadline,summer_deadline,universities(is_active))")
    .eq("id", recommendationId)
    .maybeSingle();

  if (recommendationError) {
    return NextResponse.json({ error: "Impossible de vérifier la recommandation." }, { status: 500 });
  }
  if (!recommendation || recommendation.is_archived || recommendation.status === "not_recommended") {
    return NextResponse.json({ error: "Cette recommandation n’est pas disponible pour une candidature." }, { status: 400 });
  }

  const program = Array.isArray(recommendation.programs)
    ? recommendation.programs[0] ?? null
    : recommendation.programs;
  if (!program) {
    return NextResponse.json({ error: "Programme introuvable." }, { status: 409 });
  }

  const university = Array.isArray(program.universities)
    ? program.universities[0] ?? null
    : program.universities;
  if (!university?.is_active) {
    return NextResponse.json({ error: "L’université liée n’est pas active." }, { status: 409 });
  }

  const publicationIssues = programPublicationIssues(program);
  if (publicationIssues.length) {
    return NextResponse.json(
      { error: `La candidature ne peut pas être créée : ${publicationIssues.join(" ")}` },
      { status: 409 },
    );
  }

  const { data: project, error: projectError } = await supabase
    .from("student_projects")
    .select("target_intake")
    .eq("student_id", recommendation.student_id)
    .maybeSingle();

  if (projectError) {
    return NextResponse.json({ error: "Impossible de vérifier la rentrée du projet étudiant." }, { status: 500 });
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
        error: "La date enregistrée pour cette rentrée est dépassée. Vérifiez d’abord la source officielle dans le catalogue et la candidature.",
        code: "application_deadline_passed",
        deadline: resolution.deadline,
      },
      { status: 409 },
    );
  }

  const { data: application, error: insertError } = await supabase
    .from("applications")
    .insert({
      student_id: recommendation.student_id,
      program_id: recommendation.program_id,
      intake: resolution.intake,
      deadline: resolution.deadline,
      status: "interested",
      next_action: resolution.deadline
        ? "Vérifier la deadline officielle puis préparer le dossier de candidature."
        : "Confirmer la deadline officielle puis préparer le dossier de candidature.",
    })
    .select("id")
    .single();

  if (insertError || !application) {
    return NextResponse.json(
      {
        error: insertError?.code === "23505"
          ? "Une candidature existe déjà pour ce programme et cette rentrée."
          : "Impossible de créer la candidature.",
      },
      { status: insertError?.code === "23505" ? 409 : 500 },
    );
  }

  const { error: historyError } = await supabase.from("student_history").insert({
    student_id: recommendation.student_id,
    actor_id: user.id,
    event_type: "admin_application_created",
    message: "Campus Allemagne a créé une candidature à partir d’une recommandation publiée.",
    metadata: {
      application_id: application.id,
      recommendation_id: recommendation.id,
      program_id: recommendation.program_id,
      intake: resolution.intake,
      candidate_deadline: resolution.deadline,
    },
  });

  if (historyError) {
    await supabase.from("applications").delete().eq("id", application.id);
    return NextResponse.json(
      { error: "La candidature n’a pas été conservée car son historique n’a pas pu être créé." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      id: application.id,
      intake: resolution.intake,
      deadline: resolution.deadline,
    },
    { status: 201 },
  );
}
