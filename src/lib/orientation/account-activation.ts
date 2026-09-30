import "server-only";

import { hashOrientationResumeToken } from "@/lib/orientation/resume-token";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export type OrientationActivationContext = {
  token: string;
  email: string;
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
    .select("prospect_id")
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

  return {
    token,
    email: prospect.email.trim().toLowerCase(),
  };
}
