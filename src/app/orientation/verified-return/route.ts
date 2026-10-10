import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { hasVerifiedEmail } from "@/lib/auth/verified";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { isProvisionalCandidateEnabled } from "@/lib/prospect/provisional-auth";
import { handoffProvisionalDocuments } from "@/lib/prospect/provisional-handoff";

export const dynamic = "force-dynamic";

const responseTo = (path: string) => new NextResponse(null, {
  status: 303,
  headers: {
    Location: path,
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow",
  },
});

/**
 * Return target exclusively for the Supabase confirmation resend initiated
 * inside the pending Prospect dashboard.
 *
 * Never claim data from an arbitrary browser-submitted email. The verified
 * Supabase auth identity and the existing service recovery RPC enforce
 * ownership; pending-file handoff additionally checks the exact orientation.
 */
export async function GET() {
  if (!isProvisionalCandidateEnabled()) return responseTo("/login");
  const { user } = await getAuthenticatedUser();
  if (!user?.email || !hasVerifiedEmail(user)) return responseTo("/login");

  try {
    const privileged = createPrivilegedSupabaseClient();
    const { data: pending } = await privileged
      .from("provisional_candidate_credentials")
      .select("orientation_id")
      .eq("email", user.email.trim().toLowerCase())
      .maybeSingle();
    const { data: linked } = await privileged.from("prospects")
      .select("id").eq("user_id", user.id).maybeSingle();
    if (linked?.id) {
      // A previous claim may already have linked the orientation while the
      // storage handoff failed. Never lose those documents on a later callback.
      if (pending?.orientation_id) {
        const { data: ownOrientation } = await privileged.from("orientations")
          .select("id")
          .eq("id", pending.orientation_id)
          .eq("prospect_id", linked.id)
          .maybeSingle();
        if (!ownOrientation?.id) return responseTo("/prospect/orientation");
        const moved = await handoffProvisionalDocuments({
          supabase: privileged,
          userId: user.id,
          verifiedEmail: user.email,
          orientationId: ownOrientation.id,
        });
        if (!moved) return responseTo("/prospect/orientation");
      }
      return responseTo("/prospect");
    }

    // Public users can retake orientation while awaiting their email link.
    // For a pending account, recover its original orientation UUID exactly.
    const recoveryProcedure = pending?.orientation_id
      ? "service_recover_and_confirm_provisional_orientation"
      : "service_recover_and_confirm_latest_orientation";
    const { data: recovered, error } = await privileged.rpc(
      recoveryProcedure,
      { p_user_id: user.id, p_user_email: user.email },
    );
    if (error || typeof recovered !== "string") return responseTo("/prospect/orientation");

    const moved = await handoffProvisionalDocuments({
      supabase: privileged,
      userId: user.id,
      verifiedEmail: user.email,
      orientationId: recovered,
    });
    // On failure, leave the provisional objects and credential intact for
    // a later authenticated retry; do not pretend the handoff is complete.
    if (!moved) return responseTo("/prospect/orientation");
    return responseTo("/prospect");
  } catch {
    return responseTo("/prospect/orientation");
  }
}
