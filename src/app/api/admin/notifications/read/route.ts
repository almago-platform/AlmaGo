import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const body = await request.json().catch(() => null) as {
    notification_id?: unknown;
    all?: unknown;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const readAt = new Date().toISOString();

  if (body.all === true) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("user_id", user.id)
      .is("read_at", null)
      .select("id");

    if (error) {
      return NextResponse.json(
        { error: "Impossible de marquer les notifications comme lues." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, updated: data?.length || 0 });
  }

  const notificationId =
    typeof body.notification_id === "string" ? body.notification_id.trim() : "";

  if (!UUID_RE.test(notificationId)) {
    return NextResponse.json({ error: "Notification invalide." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: readAt })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Impossible de mettre à jour cette notification." },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Notification introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, updated: 1 });
}
