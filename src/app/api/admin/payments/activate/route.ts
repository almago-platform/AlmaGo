import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { isPhase2PaymentOrchestrationEnabled } from "@/lib/phase2/config";
import { activatePhase2PaidPurchase } from "@/lib/phase2/payment";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!isPhase2PaymentOrchestrationEnabled()) {
    return NextResponse.json({ error: "Orchestration désactivée." }, { status: 503 });
  }

  const { user, isAdmin } = await getAdminUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
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
  const purchaseId =
    typeof record.purchaseId === "string" ? record.purchaseId : "";

  if (!UUID_RE.test(purchaseId)) {
    return NextResponse.json({ error: "Achat invalide." }, { status: 400 });
  }

  const activated = await activatePhase2PaidPurchase(user.id, purchaseId);
  if (!activated) {
    return NextResponse.json(
      { error: "Cet achat ne peut pas être activé dans son état actuel." },
      { status: 409 },
    );
  }

  return NextResponse.json({ activated: true }, { status: 200 });
}
