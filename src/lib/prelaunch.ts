const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isPartnerPrelaunchModeEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  const raw = env.ALMAGO_PARTNER_PRELAUNCH_MODE?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function getRuntimeExposureMode(
  env: Record<string, string | undefined> = process.env,
) {
  return isPartnerPrelaunchModeEnabled(env)
    ? "partner_prelaunch"
    : "standard";
}
