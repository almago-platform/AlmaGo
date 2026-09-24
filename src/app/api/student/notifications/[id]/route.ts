import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";

export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const readAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: readAt })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Impossible de marquer cette notification comme lue." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Notification introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, read_at: readAt });
}
