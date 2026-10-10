import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { hasVerifiedEmail } from "@/lib/auth/verified";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!hasVerifiedEmail(user)) return NextResponse.json({ error: "Vérifiez votre e-mail." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const orientationId =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).orientationId
      : null;

  if (typeof orientationId !== "string" || !uuidPattern.test(orientationId)) {
    return NextResponse.json({ error: "Orientation invalide." }, { status: 400 });
  }

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Validation indisponible." }, { status: 503 });
  }

  const { data, error } = await privileged.rpc("service_confirm_student_orientation", {
    p_user_id: user.id,
    p_orientation_id: orientationId,
  });

  if (error || typeof data !== "string") {
    return NextResponse.json(
      { error: "Impossible de confirmer cette orientation." },
      { status: 409 },
    );
  }

  return NextResponse.json({ confirmed: true, orientationId: data }, { status: 200 });
}
