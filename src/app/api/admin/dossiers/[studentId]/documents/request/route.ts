import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { documentCategories, isDocumentCategory } from "@/lib/documents";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function requirementKey(category: string, label: string) {
  const slug = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "document";
  return `manual_${category}_${slug}`;
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

  const category = cleanText(body.category, 80);
  const label = cleanText(body.label, 180);
  const reason = cleanText(body.reason, 1200);
  const dueDate = cleanText(body.due_date, 10);

  if (!isDocumentCategory(category)) {
    return NextResponse.json({ error: "Type de document invalide." }, { status: 400 });
  }
  if (label.length < 3) {
    return NextResponse.json({ error: "Ajoutez un nom clair pour le document demandé." }, { status: 400 });
  }
  if (reason.length < 3) {
    return NextResponse.json(
      { error: "Expliquez à l’étudiant pourquoi ce document est nécessaire." },
      { status: 400 },
    );
  }
  if (dueDate && !DATE_RE.test(dueDate)) {
    return NextResponse.json({ error: "Date cible invalide." }, { status: 400 });
  }

  const categoryKnown = documentCategories.some((item) => item.value === category);
  if (!categoryKnown) {
    return NextResponse.json({ error: "Type de document non pris en charge." }, { status: 400 });
  }

  const { data: requirementId, error: requestError } = await supabase.rpc(
    "admin_request_student_document",
    {
      p_student_id: studentId,
      p_requirement_key: requirementKey(category, label),
      p_label: label,
      p_category: category,
      p_reason: reason,
      p_due_date: dueDate || null,
      p_required_for: [],
    },
  );

  if (requestError || !requirementId) {
    const message = requestError?.message || "";
    if (message.includes("current_student_procedure_not_found")) {
      return NextResponse.json(
        { error: "Le dossier n’a pas encore de procédure Campus active. Activez d’abord le parcours étudiant." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Impossible d’enregistrer cette demande documentaire." },
      { status: 500 },
    );
  }

  const warnings: string[] = [];

  const { error: noteError } = await supabase.from("student_case_notes").insert({
    student_id: studentId,
    author_id: user.id,
    kind: "document_request",
    content: `Document demandé : ${label}. ${reason}`,
    occurred_at: new Date().toISOString(),
  });
  if (noteError) warnings.push("La demande est enregistrée, mais le contact n’a pas pu être ajouté au journal interne.");

  const { error: notificationError } = await supabase.rpc("admin_enqueue_campus_notifications", {});
  if (notificationError) warnings.push("La demande est enregistrée, mais la notification n’a pas pu être générée immédiatement.");

  return NextResponse.json({
    ok: true,
    requirement_id: requirementId,
    warning: warnings.length ? warnings.join(" ") : null,
  });
}
