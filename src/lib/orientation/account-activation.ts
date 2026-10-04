import "server-only";

import { hashOrientationResumeToken } from "@/lib/orientation/resume-token";
import { restorePublicOrientationIdentity } from "@/lib/orientation/public";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export type OrientationActivationContext = {
  token: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export async function resolveOrientationActivation(
  token: string | null | undefined,
): Promise<OrientationActivationContext | null> {
  if (!token) return null;

  const tokenHash = hashOrientationResumeToken(token);
  if (!tokenHash) return null;

  let supabase;
  try {
    supabase = createPrivilegedSupabaseClient();
  } catch {
    return null;
  }

  const { data: orientation, error: orientationError } = await supabase
    .from("orientations")
    .select("prospect_id,input")
    .eq("resume_token_hash", tokenHash)
    .gt("resume_token_expires_at", new Date().toISOString())
    .maybeSingle();

  if (orientationError || !orientation?.prospect_id) return null;

  const { data: prospect, error: prospectError } = await supabase
    .from("prospects")
    .select("email")
    .eq("id", orientation.prospect_id)
    .maybeSingle();

  if (prospectError || typeof prospect?.email !== "string") return null;

  const input = orientation.input && typeof orientation.input === "object"
    ? orientation.input as Record<string, unknown>
    : {};
  const identity = restorePublicOrientationIdentity(input.identity);

  return {
    token,
    email: prospect.email.trim().toLowerCase(),
    ...(identity.firstName ? { firstName: identity.firstName } : {}),
    ...(identity.lastName ? { lastName: identity.lastName } : {}),
  };
}
