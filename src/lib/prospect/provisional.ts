import "server-only";
import { cookies } from "next/headers";
import { hashOrientationResumeToken } from "@/lib/orientation/resume-token";
import { restorePublicOrientationAnswers, type PublicOrientationAnswers } from "@/lib/orientation/public";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

/**
 * A bearer token already used by the existing report page. This reader returns
 * ONLY orientation answers: never a prospect, e-mail, user ID, payment or files.
 * No mutation, linkage, auth elevation or email-based lookup is performed.
 */
export async function loadProvisionalOrientation(): Promise<PublicOrientationAnswers | null> {
  const token = (await cookies()).get("almago_prospect_preview")?.value;
  const hash = token && hashOrientationResumeToken(token);
  if (!hash) return null;
  try {
    const supabase = createPrivilegedSupabaseClient();
    const { data, error } = await supabase
      .from("orientations")
      .select("input")
      .eq("resume_token_hash", hash)
      .gt("resume_token_expires_at", new Date().toISOString())
      .eq("engine_version", "public-orientation-v1")
      .maybeSingle();
    if (error || !data || !data.input || typeof data.input !== "object") return null;
    const input = data.input as Record<string, unknown>;
    return restorePublicOrientationAnswers(input.answers);
  } catch {
    return null;
  }
}
