import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { hasVerifiedEmail } from "@/lib/auth/verified";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const MAX_NOTE_LENGTH = 1000;

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!hasVerifiedEmail(user)) return NextResponse.json({ error: "Vérifiez votre e-mail." }, { status: 403 });

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const rawNote =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).note
      : null;
  const note = typeof rawNote === "string" ? rawNote.trim().slice(0, MAX_NOTE_LENGTH) : "";

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Demande indisponible." }, { status: 503 });
  }

  const { error } = await privileged.rpc("service_student_request_route_discussion", {
    p_user_id: user.id,
    p_note: note,
  });

  if (error) {
    return NextResponse.json(
      { error: "Impossible d’envoyer votre demande pour le moment." },
      { status: 409 },
    );
  }

  return NextResponse.json({ sent: true }, { status: 200 });
}
