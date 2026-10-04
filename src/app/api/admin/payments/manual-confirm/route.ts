import { NextResponse } from "next/server";
import { isPhase2PaymentOrchestrationEnabled } from "@/lib/phase2/config";
import { recordManualPhase2Payment } from "@/lib/phase2/payment";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!isPhase2PaymentOrchestrationEnabled()) {
    return NextResponse.json({ error: "Orchestration désactivée." }, { status: 503 });
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

  if (role?.role !== "admin") {
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
  const reference =
    typeof record.reference === "string" ? record.reference.trim() : "";

  if (!UUID_RE.test(purchaseId)) {
    return NextResponse.json({ error: "Achat invalide." }, { status: 400 });
  }

  if (reference.length > 80) {
    return NextResponse.json(
      { error: "La référence du paiement est trop longue." },
      { status: 400 },
    );
  }

  const confirmed = await recordManualPhase2Payment(
    user.id,
    purchaseId,
    reference,
  );

  if (!confirmed) {
    return NextResponse.json(
      { error: "Ce paiement ne peut pas être confirmé dans son état actuel." },
      { status: 409 },
    );
  }

  return NextResponse.json(
    { confirmed: true, status: "paid_pending_validation" },
    { status: 200 },
  );
}
