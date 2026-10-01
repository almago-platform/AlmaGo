import { NextResponse } from "next/server";
import { createPhase2CommercialPurchase } from "@/lib/phase2/payment";
import { isPhase2PaymentOrchestrationEnabled } from "@/lib/phase2/config";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!isPhase2PaymentOrchestrationEnabled()) {
    return NextResponse.json({ error: "Paiement indisponible." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (role?.role !== "student") {
    return NextResponse.json({ error: "Accès étudiant requis." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const offerVersionId =
    typeof record.offerVersionId === "string" ? record.offerVersionId : "";

  if (!UUID_RE.test(offerVersionId)) {
    return NextResponse.json({ error: "Offre invalide." }, { status: 400 });
  }

  const purchaseId = await createPhase2CommercialPurchase(
    user.id,
    offerVersionId,
  );

  if (!purchaseId) {
    return NextResponse.json(
      { error: "Impossible de préparer cet achat dans l’état actuel." },
      { status: 409 },
    );
  }

  return NextResponse.json(
    { purchaseId, status: "payment_pending" },
    { status: 201 },
  );
}
