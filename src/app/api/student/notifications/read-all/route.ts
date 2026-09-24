import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";

export async function PATCH() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const readAt = new Date().toISOString();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: readAt })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    return NextResponse.json(
      { error: "Impossible de marquer les notifications comme lues." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, read_at: readAt });
}
