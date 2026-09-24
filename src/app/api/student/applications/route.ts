import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPublishableProgram } from "@/lib/source-verification";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.recommendation_id !== "string") return NextResponse.json({ error: "Recommandation invalide." }, { status: 400 });
  const { data: recommendation } = await supabase.from("program_recommendations").select("id,program_id,status,is_archived,programs(intake_terms,winter_deadline,summer_deadline,source_url,application_url,verified_at,is_active)").eq("id", body.recommendation_id).eq("student_id", user.id).maybeSingle();
  if (!recommendation || recommendation.is_archived || recommendation.status === "not_recommended") return NextResponse.json({ error: "Cette recommandation n’est plus disponible." }, { status: 400 });
  const program = Array.isArray(recommendation.programs) ? recommendation.programs[0] : recommendation.programs;
  if (!isPublishableProgram(program)) {
    return NextResponse.json(
      { error: "Cette piste doit être vérifiée avant de pouvoir créer une candidature." },
      { status: 400 },
    );
  }
  const intake = Array.isArray(program?.intake_terms) ? program.intake_terms[0] || null : null;
  const deadline = program?.winter_deadline || program?.summer_deadline || null;
  const { data, error } = await supabase.from("applications").insert({ student_id: user.id, program_id: recommendation.program_id, intake, deadline, status: "interested", next_action: "Échanger avec AlmaGo sur les prochaines étapes." }).select("id").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Une candidature existe déjà pour ce programme." : "Impossible de créer la candidature." }, { status: error.code === "23505" ? 409 : 500 });
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
