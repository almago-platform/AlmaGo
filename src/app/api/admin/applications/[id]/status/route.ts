import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { applicationStatuses, databaseApplicationStatuses } from "@/lib/phase4";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !databaseApplicationStatuses.includes(body.status as (typeof databaseApplicationStatuses)[number])) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const { id } = await params;
  const requestedStatus = body.status as (typeof databaseApplicationStatuses)[number];

  if (!applicationStatuses.includes(requestedStatus as (typeof applicationStatuses)[number])) {
    const { data: currentApplication, error: currentApplicationError } = await supabase
      .from("applications")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (currentApplicationError?.code === "22P02") {
      return NextResponse.json({ error: "Identifiant de candidature invalide." }, { status: 400 });
    }
    if (currentApplicationError) {
      return NextResponse.json({ error: "Impossible de vérifier la candidature." }, { status: 500 });
    }
    if (!currentApplication) {
      return NextResponse.json({ error: "Candidature introuvable." }, { status: 404 });
    }
    if (currentApplication.status !== requestedStatus) {
      return NextResponse.json(
        { error: "Ce statut historique peut être conservé, mais pas choisi pour une nouvelle transition." },
        { status: 400 },
      );
    }
  }

  const { error } = await supabase.rpc("admin_update_application", {
    target_application_id: id,
    target_status: requestedStatus,
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
