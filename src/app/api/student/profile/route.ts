import { NextResponse } from "next/server";
import { getStudentUser } from "@/lib/auth/access";
import { profileUpdateFromInput, validateProfileUpdate } from "@/lib/student/profile";

export async function PATCH(request: Request) {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isStudent) return NextResponse.json({ error: "Accès réservé aux étudiants." }, { status: 403 });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  const update = profileUpdateFromInput(input);
  const validationError = validateProfileUpdate(update);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name,last_name,nationality,target_degree,target_field,study_language,target_intake,onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "Impossible de vérifier le profil actuel." }, { status: 500 });
  }

  const mergedProfile = { ...(currentProfile || {}), ...update };
  const requiredKeys = [
    "first_name",
    "last_name",
    "nationality",
    "target_degree",
    "target_field",
    "study_language",
    "target_intake",
  ] as const;

  if (
    currentProfile?.onboarding_completed &&
    requiredKeys.some((key) => {
      const value = mergedProfile[key];
      return typeof value !== "string" || !value.trim();
    })
  ) {
    return NextResponse.json(
      { error: "Les informations essentielles du profil doivent rester complètes." },
      { status: 400 },
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(update, "first_name") ||
    Object.prototype.hasOwnProperty.call(update, "last_name")
  ) {
    const fullName = [mergedProfile.first_name, mergedProfile.last_name]
      .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
      .map((value) => value.trim())
      .join(" ");

    update.full_name = fullName || null;
  }

  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...update }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Impossible d’enregistrer les modifications." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
