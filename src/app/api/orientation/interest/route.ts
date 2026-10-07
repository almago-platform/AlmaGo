import { NextResponse } from "next/server";
import { hashFreeValidationInterestToken } from "@/lib/phase2/free-validation-interest-token";
import { isPhase2ProspectCaptureEnabled } from "@/lib/phase2/config";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { enforceRequestRateLimit, PUBLIC_ABUSE_POLICIES } from "@/lib/security/abuse";

const MAX_BODY_BYTES = 2_000;
const SIGNAL_VERSION = "free-validation-interest-v1";

export async function POST(request: Request) {
  if (!isPhase2ProspectCaptureEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const limited = enforceRequestRateLimit(
    request,
    PUBLIC_ABUSE_POLICIES.orientationInterest,
  );
  if (limited) return limited;

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
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
  const token = record.token;
  const source = record.source === "email_followup"
    ? "email_followup"
    : record.source === undefined || record.source === "orientation_result"
      ? "orientation_result"
      : null;

  if (typeof token !== "string" || !source) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const tokenHash = hashFreeValidationInterestToken(token);
  if (!tokenHash) {
    return NextResponse.json({ error: "Invalid or expired interest token." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Interest persistence is not configured." }, { status: 503 });
  }

  try {
    const { data: orientation, error: orientationError } = await supabase
      .from("orientations")
      .select("id,prospect_id")
      .eq("free_validation_interest_token_hash", tokenHash)
      .gt("free_validation_interest_token_expires_at", new Date().toISOString())
      .maybeSingle();

    if (orientationError) throw orientationError;
    if (!orientation) {
      return NextResponse.json({ error: "Invalid or expired interest token." }, { status: 404 });
    }

    const { error: signalError } = await supabase
      .from("free_validation_interest_signals")
      .insert({
        prospect_id: orientation.prospect_id,
        orientation_id: orientation.id,
        signal: "wants_support",
        source,
        signal_version: SIGNAL_VERSION,
      });

    if (signalError && signalError.code !== "23505") {
      throw signalError;
    }

    return NextResponse.json(
      {
        recorded: true,
        signal: "wants_support",
        alreadyRecorded: signalError?.code === "23505",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to record interest." }, { status: 500 });
  }
}
