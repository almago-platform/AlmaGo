import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { isCampusRouteKey } from "@/lib/campus-intake";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { user, isAdmin } = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });

  const { studentId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const record = body && typeof body === "object"
    ? body as Record<string, unknown>
    : {};
  const routeKey = record.routeKey;
  const reason = typeof record.reason === "string" ? record.reason.trim() : "";

  if (!isCampusRouteKey(routeKey)) {
    return NextResponse.json({ error: "Parcours invalide." }, { status: 400 });
  }
  if (reason.length < 3 || reason.length > 1200) {
    return NextResponse.json(
      { error: "Ajoutez une courte raison expliquant la proposition." },
      { status: 400 },
    );
  }

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Validation indisponible." }, { status: 503 });
  }

  const { error } = await privileged.rpc("service_admin_propose_student_route", {
    p_admin_id: user.id,
    p_student_id: studentId,
    p_route_key: routeKey,
    p_reason: reason,
  });

  if (error) {
    const message = String(error.message || "");
    const safeMessage = message.includes("starter_documents_not_approved")
      ? "Les trois pièces obligatoires doivent être approuvées avant de proposer un parcours."
      : "Impossible d’enregistrer la proposition.";
    return NextResponse.json({ error: safeMessage }, { status: 409 });
  }

  return NextResponse.json({ proposed: true }, { status: 200 });
}
