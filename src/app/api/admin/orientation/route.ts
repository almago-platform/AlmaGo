import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { recommendationStatuses } from "@/lib/phase4";
import { isPublishableProgram } from "@/lib/source-verification";

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const status = body?.status as string;
  if (!body || typeof body.student_id !== "string" || typeof body.program_id !== "string" || !recommendationStatuses.includes(status as (typeof recommendationStatuses)[number])) return NextResponse.json({ error: "Étudiant, programme et statut obligatoires." }, { status: 400 });

  const [
    { data: student, error: studentError },
    { data: studentRole, error: studentRoleError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,onboarding_completed")
      .eq("id", body.student_id)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", body.student_id)
      .maybeSingle(),
  ]);

  if (studentError || studentRoleError) {
    return NextResponse.json({ error: "Impossible de vérifier le profil étudiant." }, { status: 500 });
  }

  if (!student?.onboarding_completed || studentRole?.role !== "student") {
    return NextResponse.json(
      { error: "Choisissez un étudiant dont le profil est complété avant de publier une piste." },
      { status: 400 },
    );
  }

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("id,is_active,source_url,application_url,verified_at,universities(is_active)")
    .eq("id", body.program_id)
    .maybeSingle();

  if (programError) {
    return NextResponse.json({ error: "Impossible de vérifier la fiche programme." }, { status: 500 });
  }

  if (!isPublishableProgram(program)) {
    return NextResponse.json(
      { error: "Le programme et son université doivent être actifs et disposer d’une source officielle vérifiée avant publication." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.from("program_recommendations").upsert({
    student_id: body.student_id,
    program_id: body.program_id,
    admin_id: user.id,
    note: typeof body.note === "string" ? body.note.trim().slice(0, 2000) : null,
    status,
    is_archived: false,
    archived_at: null,
  }, { onConflict: "student_id,program_id" }).select("id").single();
  if (error) return NextResponse.json({ error: "Impossible d’enregistrer la recommandation." }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
