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
  const nextAction = typeof body.next_action === "string" && body.next_action.trim()
    ? body.next_action.trim()
    : null;
  const studentNote = typeof body.student_note === "string" && body.student_note.trim()
    ? body.student_note.trim()
    : null;

  const { data: currentApplication, error: currentApplicationError } = await supabase
    .from("applications")
    .select("status,next_action,student_notes")
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

  if (
    !applicationStatuses.includes(requestedStatus as (typeof applicationStatuses)[number]) &&
    currentApplication.status !== requestedStatus
  ) {
    return NextResponse.json(
      { error: "Ce statut historique peut être conservé, mais pas choisi pour une nouvelle transition." },
      { status: 400 },
    );
  }

  if (currentApplication.status === requestedStatus) {
    if (
      currentApplication.next_action === nextAction &&
      currentApplication.student_notes === studentNote
    ) {
      return NextResponse.json({ ok: true });
    }

    const { data: updatedApplication, error: updateError } = await supabase
      .from("applications")
      .update({
        next_action: nextAction,
        student_notes: studentNote,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", requestedStatus)
      .select("id")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: "Impossible de mettre à jour la candidature." }, { status: 500 });
    }
    if (!updatedApplication) {
      const { data: stillExists, error: existenceError } = await supabase
        .from("applications")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (existenceError) {
        return NextResponse.json({ error: "Impossible de vérifier la candidature." }, { status: 500 });
      }
      if (!stillExists) {
        return NextResponse.json({ error: "Candidature introuvable." }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Le statut de cette candidature a changé. Rechargez le dossier avant d’enregistrer." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.rpc("admin_update_application", {
    target_application_id: id,
    target_status: requestedStatus,
    target_next_action: nextAction,
    target_student_note: studentNote,
  });

  if (error?.message?.includes("application_not_found")) {
    return NextResponse.json({ error: "Candidature introuvable." }, { status: 404 });
  }
  if (error) return NextResponse.json({ error: "Impossible de mettre à jour la candidature." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
