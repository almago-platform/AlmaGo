const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);
const P24_E2E_PREVIEW_BRANCH = "phase2/p2-4-e2e-proof";

export function isPhase2P24E2EPreview(
  env: Record<string, string | undefined> = process.env,
) {
  return env.VERCEL_ENV === "preview"
    && env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === P24_E2E_PREVIEW_BRANCH;
}

export function isPhase2AccessEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (isPhase2P24E2EPreview(env)) return true;
  const raw = env.ALMAGO_PHASE2_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function isPhase2ProspectCaptureEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (isPhase2P24E2EPreview(env)) return true;
  if (!isPhase2AccessEnabled(env)) return false;
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
  if (isPhase2P24E2EPreview(env)) return true;
  if (!isPhase2AccessEnabled(env)) return false;
  const raw = env.ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED?.trim().toLowerCase();
  return raw ? ENABLED_VALUES.has(raw) : false;
}

export function isPhase2PaymentOrchestrationEnabled(
  env: Record<string, string | undefined> = process.env,
) {
  if (!isPhase2AccessEnabled(env)) return false;
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
