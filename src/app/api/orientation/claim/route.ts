import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { hasVerifiedEmail } from "@/lib/auth/verified";
import { hashOrientationResumeToken } from "@/lib/orientation/resume-token";
import { isPhase2AccountLinkingEnabled } from "@/lib/phase2/config";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { isProvisionalCandidateEnabled } from "@/lib/prospect/provisional-auth";
import { handoffProvisionalDocuments } from "@/lib/prospect/provisional-handoff";
import { enforceRequestRateLimit, PUBLIC_ABUSE_POLICIES } from "@/lib/security/abuse";

const MAX_BODY_BYTES = 1_024;

export async function POST(request: Request) {
  if (!isPhase2AccountLinkingEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ipLimited = enforceRequestRateLimit(
    request,
    PUBLIC_ABUSE_POLICIES.orientationAccountMutation,
  );
  if (ipLimited) return ipLimited;

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  const { user } = await getAuthenticatedUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!hasVerifiedEmail(user)) {
    return NextResponse.json({ error: "Confirm your email before linking an orientation." }, { status: 403 });
  }

  const accountLimited = enforceRequestRateLimit(
    request,
    PUBLIC_ABUSE_POLICIES.orientationAccountMutation,
    { accountId: user.id },
  );
  if (accountLimited) return accountLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = (body as Record<string, unknown>).token;
  const tokenHash = typeof token === "string"
    ? hashOrientationResumeToken(token)
    : null;

  if (!tokenHash) {
    return NextResponse.json({ error: "Invalid activation link." }, { status: 400 });
  }

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Activation unavailable." }, { status: 503 });
  }

  const { data, error } = await privileged.rpc("claim_phase2_orientation", {
    p_token_hash: tokenHash,
    p_user_id: user.id,
    p_user_email: user.email,
  });

  if (error || typeof data !== "string") {
    return NextResponse.json({ error: "Unable to link orientation." }, { status: 409 });
  }

  // The user is verified and the existing atomic claim has succeeded.
  // Transfer provisional documents before acknowledging success, so a failed
  // handoff remains retryable without silently discarding the pending files.
  if (isProvisionalCandidateEnabled()) {
    const moved = await handoffProvisionalDocuments({
      supabase: privileged, userId: user.id, verifiedEmail: user.email, orientationId: data,
    });
    if (!moved) {
      return NextResponse.json({ error: "Document handoff pending. Retry activation." }, { status: 503 });
    }
  }

  return NextResponse.json({ linked: true }, { status: 200 });
}
