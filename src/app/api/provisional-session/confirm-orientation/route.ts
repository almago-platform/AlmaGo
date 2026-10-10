import { NextResponse } from "next/server";
import {
  getProvisionalIdentity,
  isTrustedProvisionalMutation,
} from "@/lib/prospect/provisional-auth";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { enforceRequestRateLimit, PUBLIC_ABUSE_POLICIES } from "@/lib/security/abuse";

export const dynamic = "force-dynamic";

/**
 * A pending candidate can approve the ACCURACY of their own public
 * orientation; this grants no verified email, Supabase student role,
 * staff review, proposal, purchase or payment entitlement.
 */
export async function POST(request: Request) {
  if (!(await isTrustedProvisionalMutation(request))) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  const identity = await getProvisionalIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Accès temporaire expiré." }, { status: 401 });
  }
  const rateLimit = enforceRequestRateLimit(request, PUBLIC_ABUSE_POLICIES.orientationAccountMutation, {
    accountId: identity.id,
  });
  if (rateLimit) return rateLimit;

  const db = createPrivilegedSupabaseClient();
  const { data, error } = await db.from("provisional_candidate_credentials")
    .update({ orientation_acknowledged_at: new Date().toISOString() })
    .eq("id", identity.id)
    .eq("orientation_id", identity.orientationId)
    .is("verified_user_id", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Validation indisponible." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
