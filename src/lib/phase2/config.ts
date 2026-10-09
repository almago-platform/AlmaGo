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
  // Sending an explicitly requested orientation email must not force account creation.
  // The prospect capture and partner-prelaunch safety gates remain mandatory.
  if (!isPhase2ProspectCaptureEnabled(env)) return false;
  const raw = env.ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

// Sending as an included orientation service (no separate email CTA) is a
// distinct opt-in rollout decision. Keep it off until legal/privacy review.
export function isOrientationIncludedEmailEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (!isPhase2EmailDeliveryEnabled(env)) return false;
  const raw = env.ALMAGO_ORIENTATION_INCLUDED_EMAIL_ENABLED?.trim().toLowerCase();
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

