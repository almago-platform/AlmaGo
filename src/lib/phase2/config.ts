const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isPhase2AccessEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  const raw = env.ALMAGO_PHASE2_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function isPhase2ProspectCaptureEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (!isPhase2AccessEnabled(env)) return false;
  const raw = env.ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function isPhase2EmailDeliveryEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (!isPhase2ProspectCaptureEnabled(env)) return false;
  const raw = env.ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}
