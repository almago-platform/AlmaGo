import { NextResponse } from "next/server";
import { getStudentUser } from "@/lib/auth/access";
import { isUuid } from "@/lib/identifiers";

export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isStudent) return NextResponse.json({ error: "Accès réservé aux étudiants." }, { status: 403 });

  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Identifiant de notification invalide." }, { status: 400 });

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
