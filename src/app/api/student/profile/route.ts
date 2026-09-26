import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fullNameUpdate } from "@/lib/student/full-name";
import { profileUpdateFromInput, validateProfileUpdate } from "@/lib/student/profile";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  const update = profileUpdateFromInput(input);
  const validationError = validateProfileUpdate(update);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  if (Object.hasOwn(update, "first_name") || Object.hasOwn(update, "last_name")) {
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name,last_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) return NextResponse.json({ error: "Impossible d’enregistrer les modifications." }, { status: 500 });
    Object.assign(update, fullNameUpdate(update, currentProfile || { first_name: null, last_name: null }));
  }
  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...update }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Impossible d’enregistrer les modifications." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
