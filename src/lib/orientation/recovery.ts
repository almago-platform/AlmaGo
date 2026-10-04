import "server-only";

import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export type RecoverableOrientation = {
  id: string;
  createdAt: string;
  targetDegree: string;
  targetField: string;
  germanLevel: string;
};

export async function findRecoverableOrientationForAccount({
  userId,
  email,
  emailConfirmed,
}: {
  userId: string;
  email: string | null | undefined;
  emailConfirmed: boolean;
}): Promise<RecoverableOrientation | null> {
  if (!email || !emailConfirmed) return null;

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return null;
  }

  const { data: alreadyLinked } = await privileged
    .from("prospects")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (alreadyLinked?.id) return null;

  const { data: prospect } = await privileged
    .from("prospects")
    .select("id,user_id")
    .ilike("email", email.trim().toLowerCase())
    .limit(1)
    .maybeSingle();

  if (!prospect?.id || prospect.user_id) return null;

  const { data: orientation } = await privileged
    .from("orientations")
    .select("id,input,created_at")
    .eq("prospect_id", prospect.id)
    .eq("engine_version", "public-orientation-v1")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!orientation?.id) return null;

  const input = orientation.input && typeof orientation.input === "object"
    ? orientation.input as Record<string, unknown>
    : {};
  const answers = restorePublicOrientationAnswers(input.answers);

  return {
    id: String(orientation.id),
    createdAt: String(orientation.created_at),
    targetDegree: answers.targetDegree,
    targetField: answers.targetField,
    germanLevel: answers.germanLevel,
  };
}
