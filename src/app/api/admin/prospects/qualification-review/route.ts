import { NextResponse } from "next/server";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const decisions = new Set(["needs_verification", "qualified_prospect"]);

export async function POST(request: Request) {
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
  const orientationId = typeof record.orientationId === "string" ? record.orientationId : "";
  const expectedQualificationId =
    typeof record.expectedQualificationId === "string"
      ? record.expectedQualificationId
      : "";
  const decision = typeof record.decision === "string" ? record.decision : "";
  const reason = typeof record.reason === "string" ? record.reason.trim() : "";

  if (
    !UUID_RE.test(orientationId)
    || !UUID_RE.test(expectedQualificationId)
    || !decisions.has(decision)
    || reason.length < 10
    || reason.length > 1000
  ) {
    return NextResponse.json({ error: "Revue invalide." }, { status: 400 });
  }

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  const { data, error } = await privileged.rpc(
    "review_phase2_prospect_qualification",
    {
      p_admin_user_id: user.id,
      p_orientation_id: orientationId,
      p_expected_latest_qualification_id: expectedQualificationId,
      p_decision: decision,
      p_review_reason: reason,
    },
  );

  if (error) {
    return NextResponse.json({ error: "Impossible d’enregistrer la revue." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "La qualification a changé. Rechargez la file avant de réessayer." },
      { status: 409 },
    );
  }

  return NextResponse.json({ saved: true }, { status: 201 });
}
