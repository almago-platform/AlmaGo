import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateFromInput, validateProfileUpdate } from "@/lib/student/profile";

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  const update = profileUpdateFromInput(input);
  const validationError = validateProfileUpdate(update);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  if (input.complete === true) {
    if (input.consentAccepted !== true) return NextResponse.json({ error: "Le consentement est obligatoire." }, { status: 400 });
    if (!update.first_name || !update.last_name || !update.nationality || !update.target_degree || !update.target_field || !update.study_language || !update.target_intake) {
      return NextResponse.json({ error: "Complète les champs obligatoires avant de valider." }, { status: 400 });
    }
    update.onboarding_completed = true;
    update.onboarding_completed_at = new Date().toISOString();
    update.full_name = `${update.first_name} ${update.last_name}`;
  }

  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...update }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Impossible d’enregistrer le profil." }, { status: 500 });

  if (input.complete === true) {
    const { error: consentError } = await supabase.from("consents").upsert({
      user_id: user.id,
      consent_type: "profile_processing",
      policy_version: "v1",
      metadata: { source: "student_onboarding" },
    }, { onConflict: "user_id,consent_type,policy_version" });
    if (consentError) return NextResponse.json({ error: "Le consentement n’a pas pu être enregistré." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, completed: input.complete === true });
}
