function isPartnerPrelaunchEnabled(env: Record<string, string | undefined>) {
  const raw = env.ALMAGO_PARTNER_PRELAUNCH_MODE?.trim().toLowerCase();
  return raw ? ["1", "true", "yes", "on"].includes(raw) : false;
}

export function isPublicIndexingEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (isPartnerPrelaunchEnabled(env)) return false;
  return env.ALMAGO_PUBLIC_INDEXING_ENABLED === "true";
}
