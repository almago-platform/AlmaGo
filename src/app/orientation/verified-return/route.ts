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
    const { data: linked } = await privileged.from("prospects")
      .select("id").eq("user_id", user.id).maybeSingle();
    if (linked?.id) return responseTo("/prospect");

    const { data: recovered, error } = await privileged.rpc(
      "service_recover_and_confirm_latest_orientation",
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
