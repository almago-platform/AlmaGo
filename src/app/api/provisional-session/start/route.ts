import { NextResponse } from "next/server";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { hashOrientationResumeToken } from "@/lib/orientation/resume-token";
import { enforceRequestRateLimit, PUBLIC_ABUSE_POLICIES } from "@/lib/security/abuse";
import {
  createProvisionalSession,
  hashProvisionalPassword,
  isProvisionalCandidateEnabled,
  isTrustedProvisionalMutation,
  normalizeProvisionalEmail,
  validProvisionalPassword,
} from "@/lib/prospect/provisional-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isProvisionalCandidateEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!(await isTrustedProvisionalMutation(request))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const limited = enforceRequestRateLimit(request, PUBLIC_ABUSE_POLICIES.orientationAccountMutation);
  if (limited) return limited;
  if (Number(request.headers.get("content-length") || 0) > 2048) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || JSON.stringify(body).length > 2048) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const tokenHash = typeof body.token === "string"
    ? hashOrientationResumeToken(body.token) : null;
  const email = normalizeProvisionalEmail(body.email);
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  if (!tokenHash || !email || !validProvisionalPassword(body.password)
    || !firstName || firstName.length > 100 || !lastName || lastName.length > 100) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const supabase = createPrivilegedSupabaseClient();
    const { data: orientation, error } = await supabase.from("orientations")
      .select("id,prospect_id")
      .eq("resume_token_hash", tokenHash)
      .gt("resume_token_expires_at", new Date().toISOString())
      .eq("engine_version", "public-orientation-v1")
      .maybeSingle();
    if (error || !orientation?.id) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { data: prospect } = await supabase.from("prospects")
      .select("email,user_id").eq("id", orientation.prospect_id).maybeSingle();
    // Never attach temporary credentials to a verified account, even when
    // someone knows that account's public orientation link or email.
    if (normalizeProvisionalEmail(prospect?.email) !== email || prospect?.user_id) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const passwordHash = await hashProvisionalPassword(body.password);
    const { data: credential, error: insertError } = await supabase
      .from("provisional_candidate_credentials")
      .insert({
        orientation_id: orientation.id,
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
      })
      .select("id,expires_at")
      .single();
    // Generic conflict to prevent enumeration of provisional identities.
    if (insertError || !credential?.id) {
      return NextResponse.json({ error: "Account unavailable. Please sign in." }, { status: 409 });
    }

    const sessionCreated = await createProvisionalSession({
      id: credential.id,
      orientationId: orientation.id,
      email,
      firstName,
      lastName,
      expiresAt: credential.expires_at,
    });
    if (!sessionCreated) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 503 });
    }
    return NextResponse.json(
      { provisional: true, expiresAt: credential.expires_at },
      { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } },
    );
  } catch {
    return NextResponse.json({ error: "Temporary access unavailable." }, { status: 503 });
  }
}
