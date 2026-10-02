const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

function isPartnerPrelaunchEnabled(env: Record<string, string | undefined>) {
  const raw = env.ALMAGO_PARTNER_PRELAUNCH_MODE?.trim().toLowerCase();
  return raw ? ["1", "true", "yes", "on"].includes(raw) : false;
}

export function isPhase2AccessEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  const raw = env.ALMAGO_PHASE2_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function isPhase2ProspectCaptureEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (isPartnerPrelaunchEnabled(env) || !isPhase2AccessEnabled(env)) return false;
  const raw = env.ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function isPhase2EmailDeliveryEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (!isPhase2ProspectCaptureEnabled(env) || !isPhase2AccountLinkingEnabled(env)) return false;
  const raw = env.ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function isPhase2AccountLinkingEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (isPartnerPrelaunchEnabled(env) || !isPhase2AccessEnabled(env)) return false;
  const raw = env.ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}


export function isFreeValidationPilotEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (
    isPartnerPrelaunchEnabled(env)
    || !isPhase2AccessEnabled(env)
    || !isPhase2ProspectCaptureEnabled(env)
    || !isPhase2AccountLinkingEnabled(env)
  ) {
    return false;
  }

  const raw = env.ALMAGO_FREE_VALIDATION_PILOT_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function isPhase2PaymentOrchestrationEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (isPartnerPrelaunchEnabled(env) || !isPhase2AccessEnabled(env)) return false;
  const raw = env.ALMAGO_PHASE2_PAYMENT_ORCHESTRATION_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function isPhase2DevPaymentAdapterEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (env.NODE_ENV === "production" || !isPhase2PaymentOrchestrationEnabled(env)) {
    return false;
  }
  const raw = env.ALMAGO_PHASE2_DEV_PAYMENT_ADAPTER_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}
