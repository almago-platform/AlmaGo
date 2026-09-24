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
  if (update.first_name || update.last_name) update.full_name = `${update.first_name ?? ""} ${update.last_name ?? ""}`.trim();
  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...update }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Impossible d’enregistrer les modifications." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
