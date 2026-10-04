import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { isCampusRouteKey } from "@/lib/campus-intake";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  const offerVersionId =
    typeof record.offerVersionId === "string" ? record.offerVersionId.trim() : "";

  if (!isCampusRouteKey(routeKey)) {
    return NextResponse.json({ error: "Parcours invalide." }, { status: 400 });
  }
  if (reason.length < 3 || reason.length > 1200) {
    return NextResponse.json(
      { error: "Ajoutez une courte raison expliquant la proposition." },
      { status: 400 },
    );
  }
  if (!UUID_RE.test(offerVersionId)) {
    return NextResponse.json(
      { error: "Choisissez une offre publiée pour cette proposition." },
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
    p_offer_version_id: offerVersionId,
  });

  if (error) {
    const message = String(error.message || "");
    let safeMessage = "Impossible d’enregistrer la proposition.";

    if (message.includes("starter_documents_not_approved")) {
      safeMessage = "Passeport, Bac et relevé de notes doivent être approuvés pour ce parcours.";
    } else if (message.includes("pre_bac_route_not_supported")) {
      safeMessage = "Avant le Bac, proposez uniquement un parcours de préparation aux études ou de langue.";
    } else if (message.includes("published_offer_required")) {
      safeMessage = "Cette offre n’est plus publiée. Choisissez une offre active.";
    } else if (
      message.includes("commercial_flow_already_started")
      || message.includes("commercial_access_not_proposable")
    ) {
      safeMessage = "Ce dossier a déjà commencé son parcours commercial ou client.";
    }

    return NextResponse.json({ error: safeMessage }, { status: 409 });
  }

  return NextResponse.json({ proposed: true }, { status: 200 });
}
