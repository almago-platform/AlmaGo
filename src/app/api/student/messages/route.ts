import { NextResponse } from "next/server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const access = await getPhase2StudentAccess();
  const { supabase, user } = access;

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!access.isStudent || !access.canUseClientFeatures) {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const message = cleanText(body?.message, 4000);

  if (message.length < 2) {
    return NextResponse.json({ error: "Le message est trop court." }, { status: 400 });
  }

  const { data: created, error } = await supabase
    .from("student_dossier_messages")
    .insert({
      student_id: user.id,
      sender_id: user.id,
      sender_role: "student",
      body: message,
    })
    .select("id,student_id,sender_id,sender_role,body,student_read_at,admin_read_at,created_at")
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: "Impossible d’envoyer votre message." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, message: created });
}

export async function PATCH(request: Request) {
  const access = await getPhase2StudentAccess();
  const { supabase, user } = access;

  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!access.isStudent || !access.canUseClientFeatures) {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { operation?: unknown } | null;
  if (body?.operation !== "mark_read") {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const readAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("student_dossier_messages")
    .update({ student_read_at: readAt })
    .eq("student_id", user.id)
    .eq("sender_role", "admin")
    .is("student_read_at", null)
    .select("id");

  if (error) {
    return NextResponse.json(
      { error: "Impossible de mettre à jour vos messages." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, updated: data?.length || 0 });
}
