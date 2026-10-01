import { NextResponse } from "next/server";
import { isPhase2DevPaymentAdapterEnabled } from "@/lib/phase2/config";
import { confirmDevelopmentPayment } from "@/lib/phase2/payment-dev-adapter";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!isPhase2DevPaymentAdapterEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
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

  const purchaseId =
    typeof (body as Record<string, unknown>).purchaseId === "string"
      ? (body as Record<string, unknown>).purchaseId as string
      : "";

  if (!UUID_RE.test(purchaseId)) {
    return NextResponse.json({ error: "Achat invalide." }, { status: 400 });
  }

  const status = await confirmDevelopmentPayment(user.id, purchaseId);
  if (status !== "paid_pending_validation") {
    return NextResponse.json(
      { error: "Simulation impossible." },
      { status: 409 },
    );
  }

  return NextResponse.json({ status }, { status: 200 });
}
