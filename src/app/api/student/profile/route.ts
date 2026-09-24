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

  const hasFirstName = Object.prototype.hasOwnProperty.call(update, "first_name");
  const hasLastName = Object.prototype.hasOwnProperty.call(update, "last_name");

  if (hasFirstName || hasLastName) {
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name,last_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: "Impossible de vérifier le profil actuel." }, { status: 500 });
    }

    const firstName = hasFirstName ? update.first_name : currentProfile?.first_name;
    const lastName = hasLastName ? update.last_name : currentProfile?.last_name;
    const fullName = [firstName, lastName]
      .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
      .map((value) => value.trim())
      .join(" ");

    update.full_name = fullName || null;
  }

  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...update }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Impossible d’enregistrer les modifications." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
