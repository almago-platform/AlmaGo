import { isPartnerPrelaunchModeEnabled } from "@/lib/prelaunch";

export function isPublicIndexingEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (isPartnerPrelaunchModeEnabled(env)) return false;
  return env.ALMAGO_PUBLIC_INDEXING_ENABLED === "true";
}
