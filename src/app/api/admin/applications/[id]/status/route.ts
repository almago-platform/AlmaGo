import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import {
  applicationStatuses,
  canTransitionApplication,
  transitionRequirements,
} from "@/lib/application-workflow";

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const targetStatus = body?.status as string;
  if (!body || !applicationStatuses.includes(targetStatus as (typeof applicationStatuses)[number])) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const { id } = await params;
  const { data: current, error: loadError } = await supabase
    .from("applications")
    .select("status,next_action,student_notes")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: "Impossible de vérifier la candidature avant modification." }, { status: 500 });
  }
  if (!current) return NextResponse.json({ error: "Candidature introuvable." }, { status: 404 });

  const nextAction = cleanText(body.next_action, 1000);
  const studentNote = cleanText(body.student_note, 2000);
  const statusChanged = current.status !== targetStatus;

  if (!statusChanged) {
    const sameAction = nextAction === (current.next_action || "");
    const sameNote = studentNote === (current.student_notes || "");
    if (sameAction && sameNote) {
      return NextResponse.json({ error: "Aucune modification à enregistrer." }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        next_action: nextAction || null,
        student_notes: studentNote || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: "Impossible de mettre à jour le suivi de la candidature." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status_changed: false });
  }

  if (!canTransitionApplication(current.status, targetStatus)) {
    return NextResponse.json(
      { error: `Transition non autorisée : ${current.status} → ${targetStatus}.` },
      { status: 409 },
    );
  }

  const requirements = transitionRequirements(current.status, targetStatus);
  if (requirements.length && body.transition_confirmed !== true) {
    return NextResponse.json(
      { error: "Cette transition nécessite une confirmation explicite.", requirements },
      { status: 409 },
    );
  }

  if ((targetStatus === "admission" || targetStatus === "rejection") && !studentNote) {
    return NextResponse.json(
      { error: "Ajoutez une note visible indiquant la décision communiquée par l’université." },
      { status: 400 },
    );
  }

  const { error } = await supabase.rpc("admin_update_application", {
    target_application_id: id,
    target_status: targetStatus,
    target_next_action: nextAction || null,
    target_student_note: studentNote || null,
  });

  if (error) {
    const message = error.message || "";
    if (message.includes("application_no_status_change")) {
      return NextResponse.json({ error: "Le statut a déjà changé. Rechargez le dossier avant de continuer." }, { status: 409 });
    }
    if (message.includes("application_transition_not_allowed")) {
      return NextResponse.json({ error: "Cette transition n’est plus autorisée depuis l’état actuel du dossier." }, { status: 409 });
    }
    if (message.includes("application_decision_note_required")) {
      return NextResponse.json(
        { error: "Ajoutez une note visible indiquant la décision communiquée par l’université." },
        { status: 400 },
      );
    }
    if (message.includes("application_not_found")) {
      return NextResponse.json({ error: "Candidature introuvable." }, { status: 404 });
    }
    return NextResponse.json({ error: "Impossible de mettre à jour la candidature." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, status_changed: true });
}
