import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { defaultAdminActionStatus } from "@/lib/admin/people";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const owners = new Set(["student", "almago", "external", "joint"]);

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function safeHistoryMessage(owner: string, operation: "created" | "completed" | "reopened") {
  if (owner === "student" || owner === "joint") {
    if (operation === "created") return "Une action personnelle a été ajoutée au suivi de votre dossier.";
    if (operation === "completed") return "Une action personnelle du dossier a été marquée comme terminée.";
    return "Une action personnelle du dossier a été rouverte.";
  }
  if (operation === "completed") return "Le suivi opérationnel Campus Allemagne a été mis à jour.";
  if (operation === "reopened") return "Une étape de suivi Campus Allemagne a été rouverte.";
  return "Une nouvelle étape de suivi Campus Allemagne a été enregistrée.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) {
    return NextResponse.json({ error: "Dossier invalide." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const title = cleanText(body.title, 180);
  const description = cleanText(body.description, 1200);
  const owner = cleanText(body.owner, 20);
  const dueDate = cleanText(body.due_date, 10);

  if (title.length < 3) {
    return NextResponse.json({ error: "Ajoutez un titre clair pour l’action." }, { status: 400 });
  }
  if (!owners.has(owner)) {
    return NextResponse.json({ error: "Responsable invalide." }, { status: 400 });
  }
  if (dueDate && !DATE_RE.test(dueDate)) {
    return NextResponse.json({ error: "Date cible invalide." }, { status: 400 });
  }

  const requiresStudentAction = owner === "student" || owner === "joint";
  if (requiresStudentAction && description.length < 3) {
    return NextResponse.json(
      { error: "Expliquez clairement ce que l’étudiant doit faire et pourquoi." },
      { status: 400 },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", studentId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "Impossible de vérifier le dossier." }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ error: "Personne introuvable." }, { status: 404 });
  }

  const status = defaultAdminActionStatus(owner);
  const { data: action, error: insertError } = await supabase
    .from("student_checklist_items")
    .insert({
      student_id: studentId,
      template_id: null,
      title,
      description: description || null,
      due_date: dueDate || null,
      status,
      owner,
      requires_student_action: requiresStudentAction,
      student_action_reason: requiresStudentAction ? description : null,
      deadline_kind: dueDate ? "internal_target" : null,
      manual_due_date_override: Boolean(dueDate),
      created_by: user.id,
    })
    .select("id,title,description,status,owner,due_date,template_id,created_at")
    .single();

  if (insertError || !action) {
    return NextResponse.json({ error: "Impossible d’enregistrer l’action." }, { status: 500 });
  }

  const { error: historyError } = await supabase.from("student_history").insert({
    student_id: studentId,
    actor_id: user.id,
    event_type: "admin_action_created",
    message: safeHistoryMessage(owner, "created"),
    metadata: {
      action_id: action.id,
      owner,
      status,
      due_date: dueDate || null,
    },
  });

  if (historyError) {
    await supabase.from("student_checklist_items").delete().eq("id", action.id).eq("student_id", studentId);
    return NextResponse.json(
      { error: "L’action n’a pas été conservée car son historique n’a pas pu être créé." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, action });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) {
    return NextResponse.json({ error: "Dossier invalide." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const actionId = cleanText(body?.action_id, 36);
  const operation = cleanText(body?.operation, 20);

  if (!UUID_RE.test(actionId) || !["complete", "reopen"].includes(operation)) {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }

  const { data: current, error: loadError } = await supabase
    .from("student_checklist_items")
    .select("id,status,owner,template_id,procedure_step_template_id,completed_at")
    .eq("id", actionId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: "Impossible de vérifier l’action." }, { status: 500 });
  }
  if (!current) return NextResponse.json({ error: "Action introuvable." }, { status: 404 });
  if (current.template_id || current.procedure_step_template_id) {
    return NextResponse.json(
      { error: "Cette étape est pilotée automatiquement et ne peut pas être modifiée ici." },
      { status: 409 },
    );
  }

  const owner = current.owner || "almago";
  const nextStatus = operation === "complete" ? "completed" : defaultAdminActionStatus(owner);
  const completedAt = operation === "complete" ? new Date().toISOString() : null;

  const { error: updateError } = await supabase
    .from("student_checklist_items")
    .update({
      status: nextStatus,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .eq("student_id", studentId);

  if (updateError) {
    return NextResponse.json({ error: "Impossible de mettre à jour l’action." }, { status: 500 });
  }

  const { error: historyError } = await supabase.from("student_history").insert({
    student_id: studentId,
    actor_id: user.id,
    event_type: operation === "complete" ? "admin_action_completed" : "admin_action_reopened",
    message: safeHistoryMessage(owner, operation === "complete" ? "completed" : "reopened"),
    metadata: {
      action_id: actionId,
      owner,
      status: nextStatus,
    },
  });

  if (historyError) {
    await supabase
      .from("student_checklist_items")
      .update({
        status: current.status,
        completed_at: current.completed_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", actionId)
      .eq("student_id", studentId);
    return NextResponse.json(
      { error: "La modification a été annulée car son historique n’a pas pu être enregistré." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
