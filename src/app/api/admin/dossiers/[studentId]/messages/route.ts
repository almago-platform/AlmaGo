import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) {
    return NextResponse.json({ error: "Dossier invalide." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const message = cleanText(body?.message, 4000);

  if (message.length < 2) {
    return NextResponse.json({ error: "Le message est trop court." }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", studentId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "Impossible de vérifier le dossier." }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ error: "Étudiant introuvable." }, { status: 404 });
  }

  const { data: created, error } = await supabase
    .from("student_dossier_messages")
    .insert({
      student_id: studentId,
      sender_id: user.id,
      sender_role: "admin",
      body: message,
    })
    .select("id,student_id,sender_id,sender_role,body,student_read_at,admin_read_at,created_at")
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: "Impossible d’envoyer le message dans l’espace étudiant." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, message: created });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) {
    return NextResponse.json({ error: "Dossier invalide." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as { operation?: unknown } | null;
  if (body?.operation !== "mark_read") {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const readAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("student_dossier_messages")
    .update({ admin_read_at: readAt })
    .eq("student_id", studentId)
    .eq("sender_role", "student")
    .is("admin_read_at", null)
    .select("id");

  if (error) {
    return NextResponse.json(
      { error: "Impossible de marquer les réponses comme lues." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, updated: data?.length || 0 });
}
