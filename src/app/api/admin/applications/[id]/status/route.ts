import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { applicationStatuses } from "@/lib/phase4";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !applicationStatuses.includes(body.status as (typeof applicationStatuses)[number])) return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  const { id } = await params;
  const { error } = await supabase.rpc("admin_update_application", {
    target_application_id: id,
    target_status: body.status,
    target_next_action: typeof body.next_action === "string" ? body.next_action : null,
    target_student_note: typeof body.student_note === "string" ? body.student_note : null,
  });

  if (error?.code === "22P02") {
    return NextResponse.json({ error: "Identifiant de candidature invalide." }, { status: 400 });
  }
  if (error?.message?.includes("application_not_found")) {
    return NextResponse.json({ error: "Candidature introuvable." }, { status: 404 });
  }
  if (error) return NextResponse.json({ error: "Impossible de mettre à jour la candidature." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
