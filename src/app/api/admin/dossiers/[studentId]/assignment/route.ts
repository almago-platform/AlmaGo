import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const assignedAdminId =
    typeof body.assigned_admin_id === "string" && body.assigned_admin_id.trim()
      ? body.assigned_admin_id.trim()
      : null;

  if (assignedAdminId && !UUID_RE.test(assignedAdminId)) {
    return NextResponse.json({ error: "Conseiller invalide." }, { status: 400 });
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

  if (!assignedAdminId) {
    const { error } = await supabase
      .from("student_case_assignments")
      .delete()
      .eq("student_id", studentId);

    if (error) {
      return NextResponse.json(
        { error: "Impossible de retirer l’attribution du dossier." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, assigned_admin_id: null });
  }

  const { data: targetAdmin, error: adminError } = await supabase
    .from("user_roles")
    .select("user_id,role")
    .eq("user_id", assignedAdminId)
    .eq("role", "admin")
    .maybeSingle();

  if (adminError) {
    return NextResponse.json(
      { error: "Impossible de vérifier le conseiller." },
      { status: 500 },
    );
  }
  if (!targetAdmin) {
    return NextResponse.json(
      { error: "Le responsable choisi n’est pas un administrateur actif." },
      { status: 400 },
    );
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("student_case_assignments")
    .upsert(
      {
        student_id: studentId,
        assigned_admin_id: assignedAdminId,
      },
      { onConflict: "student_id" },
    )
    .select("student_id,assigned_admin_id,assigned_at,updated_at")
    .single();

  if (assignmentError || !assignment) {
    const message = String(assignmentError?.message || "");
    return NextResponse.json(
      {
        error: message.includes("assigned_user_must_be_admin")
          ? "Le responsable choisi n’est pas un administrateur actif."
          : "Impossible d’attribuer le dossier.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, assignment });
}
