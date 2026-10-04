import "server-only";

import { createHash } from "node:crypto";
import { isPhase2PaymentOrchestrationEnabled } from "@/lib/phase2/config";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROVIDER_RE = /^[a-z0-9][a-z0-9_-]{0,39}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;
const SHA256_RE = /^[0-9a-f]{64}$/;

export const normalizedPaymentEventTypes = [
  "charge_succeeded",
  "charge_failed",
  "payment_cancelled",
  "refund_succeeded",
  "dispute_opened",
] as const;

export type NormalizedPaymentEventType =
  (typeof normalizedPaymentEventTypes)[number];

export type NormalizedPaymentEvent = {
  provider: string;
  providerEventId: string;
  type: NormalizedPaymentEventType;
  payloadSha256: string;
  attemptId: string;
  purchaseId: string;
  amountMinor: number;
  currency: string;
  providerTransactionId: string | null;
  occurredAt: string;
};

export type PaymentProviderStartInput = {
  purchaseId: string;
  attemptId: string;
  amountMinor: number;
  currency: string;
  idempotencyKey: string;
};

export type PaymentProviderStartResult = {
  providerSessionId: string;
  redirectUrl: string | null;
};

export type PaymentProviderAdapter = {
  readonly provider: string;
  startPayment(input: PaymentProviderStartInput): Promise<PaymentProviderStartResult>;
  normalizeEvent(input: {
    rawBody: string;
    headers: Headers;
  }): Promise<NormalizedPaymentEvent | null>;
};

export type PurchasePaymentContext = {
  purchaseId: string;
  userId: string;
  amountMinor: number;
  currency: string;
  status:
    | "payment_pending"
    | "paid_pending_validation"
    | "client_active"
    | "cancelled"
    | "refunded";
};

function normalizedProvider(value: string) {
  const provider = value.trim().toLowerCase();
  return PROVIDER_RE.test(provider) ? provider : null;
}

function safeMinorAmount(value: unknown) {
  const amount = typeof value === "string" ? Number(value) : value;
  return typeof amount === "number"
    && Number.isSafeInteger(amount)
    && amount >= 0
    ? amount
    : null;
}

export function hashPaymentPayload(rawBody: string) {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

export function isNormalizedPaymentEvent(value: NormalizedPaymentEvent) {
  const provider = normalizedProvider(value.provider);
  const occurredAt = Date.parse(value.occurredAt);

  return Boolean(
    provider
    && value.providerEventId.length >= 1
    && value.providerEventId.length <= 240
    && normalizedPaymentEventTypes.includes(value.type)
    && SHA256_RE.test(value.payloadSha256)
    && UUID_RE.test(value.attemptId)
    && UUID_RE.test(value.purchaseId)
    && Number.isSafeInteger(value.amountMinor)
    && value.amountMinor >= 0
    && CURRENCY_RE.test(value.currency)
    && (
      value.providerTransactionId === null
      || (
        value.providerTransactionId.length >= 1
        && value.providerTransactionId.length <= 240
      )
    )
    && Number.isFinite(occurredAt),
  );
}

export async function createPhase2CommercialPurchase(
  userId: string,
  offerVersionId: string,
) {
  if (
    !isPhase2PaymentOrchestrationEnabled()
    || !UUID_RE.test(userId)
    || !UUID_RE.test(offerVersionId)
  ) {
    return null;
  }

  const privileged = createPrivilegedSupabaseClient();
  const { data, error } = await privileged.rpc(
    "begin_phase2_commercial_purchase",
    {
      p_user_id: userId,
      p_offer_version_id: offerVersionId,
    },
  );

  return !error && typeof data === "string" && UUID_RE.test(data)
    ? data
    : null;
}

export async function getPurchasePaymentContext(
  userId: string,
  purchaseId: string,
): Promise<PurchasePaymentContext | null> {
  if (
    !isPhase2PaymentOrchestrationEnabled()
    || !UUID_RE.test(userId)
    || !UUID_RE.test(purchaseId)
  ) {
    return null;
  }

  const privileged = createPrivilegedSupabaseClient();
  const { data, error } = await privileged
    .from("commercial_purchases")
    .select("id,user_id,amount_minor,currency,status")
    .eq("id", purchaseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data || typeof data.currency !== "string") return null;

  const amountMinor = safeMinorAmount(data.amount_minor);
  if (amountMinor === null || !CURRENCY_RE.test(data.currency)) return null;

  return {
    purchaseId: data.id,
    userId: data.user_id,
    amountMinor,
    currency: data.currency,
    status: data.status as PurchasePaymentContext["status"],
  };
}

export async function beginPhase2PaymentAttempt(input: {
  userId: string;
  purchaseId: string;
  provider: string;
  idempotencyKey: string;
}) {
  const provider = normalizedProvider(input.provider);
  if (
    !isPhase2PaymentOrchestrationEnabled()
    || !provider
    || !UUID_RE.test(input.userId)
    || !UUID_RE.test(input.purchaseId)
    || input.idempotencyKey.length < 16
    || input.idempotencyKey.length > 160
  ) {
    return null;
  }

  const privileged = createPrivilegedSupabaseClient();
  const { data, error } = await privileged.rpc(
    "begin_phase2_payment_attempt",
    {
      p_user_id: input.userId,
      p_purchase_id: input.purchaseId,
      p_provider: provider,
      p_idempotency_key: input.idempotencyKey,
    },
  );

  return !error && typeof data === "string" && UUID_RE.test(data)
    ? data
    : null;
}

export async function bindPhase2PaymentAttemptSession(input: {
  attemptId: string;
  provider: string;
  providerSessionId: string;
}) {
  const provider = normalizedProvider(input.provider);
  if (
    !isPhase2PaymentOrchestrationEnabled()
    || !provider
    || !UUID_RE.test(input.attemptId)
    || input.providerSessionId.length < 1
    || input.providerSessionId.length > 240
  ) {
    return false;
  }

  const privileged = createPrivilegedSupabaseClient();
  const { data, error } = await privileged.rpc(
    "bind_phase2_payment_attempt_session",
    {
      p_attempt_id: input.attemptId,
      p_provider: provider,
      p_provider_session_id: input.providerSessionId,
    },
  );

  return !error && data === true;
}

export async function processNormalizedPaymentEvent(
  event: NormalizedPaymentEvent,
) {
  if (!isPhase2PaymentOrchestrationEnabled() || !isNormalizedPaymentEvent(event)) {
    return null;
  }

  const provider = normalizedProvider(event.provider);
  if (!provider) return null;

  const privileged = createPrivilegedSupabaseClient();
  const { data, error } = await privileged.rpc(
    "process_phase2_normalized_payment_event",
    {
      p_provider: provider,
      p_provider_event_id: event.providerEventId,
      p_event_type: event.type,
      p_payload_sha256: event.payloadSha256,
      p_attempt_id: event.attemptId,
      p_purchase_id: event.purchaseId,
      p_amount_minor: event.amountMinor,
      p_currency: event.currency,
      p_provider_transaction_id: event.providerTransactionId,
      p_occurred_at: event.occurredAt,
    },
  );

  return !error && typeof data === "string" ? data : null;
}

const MANUAL_PAYMENT_PROVIDER = "manual_admin";

export async function recordManualPhase2Payment(
  adminUserId: string,
  purchaseId: string,
  reference: string,
) {
  const normalizedReference = reference.trim();
  if (
    !isPhase2PaymentOrchestrationEnabled()
    || !UUID_RE.test(adminUserId)
    || !UUID_RE.test(purchaseId)
    || normalizedReference.length > 80
  ) {
    return false;
  }

  const privileged = createPrivilegedSupabaseClient();
  const { data: role, error: roleError } = await privileged
    .from("user_roles")
    .select("role")
    .eq("user_id", adminUserId)
    .maybeSingle();

  if (roleError || role?.role !== "admin") return false;

  const { data: purchase, error: purchaseError } = await privileged
    .from("commercial_purchases")
    .select("id,user_id,amount_minor,currency,status")
    .eq("id", purchaseId)
    .maybeSingle();

  if (
    purchaseError
    || !purchase
    || purchase.status !== "payment_pending"
    || typeof purchase.user_id !== "string"
    || typeof purchase.currency !== "string"
  ) {
    return false;
  }

  const amountMinor = safeMinorAmount(purchase.amount_minor);
  if (
    amountMinor === null
    || !UUID_RE.test(purchase.user_id)
    || !CURRENCY_RE.test(purchase.currency)
  ) {
    return false;
  }

  const attemptId = await beginPhase2PaymentAttempt({
    userId: purchase.user_id,
    purchaseId,
    provider: MANUAL_PAYMENT_PROVIDER,
    idempotencyKey: `manual-attempt-${purchaseId}`,
  });
  if (!attemptId) return false;

  const referenceToken = normalizedReference || "sans-reference";
  const sessionBound = await bindPhase2PaymentAttemptSession({
    attemptId,
    provider: MANUAL_PAYMENT_PROVIDER,
    providerSessionId: `admin:${adminUserId}:ref:${referenceToken}`,
  });
  if (!sessionBound) return false;

  const stablePayload = JSON.stringify({
    provider: MANUAL_PAYMENT_PROVIDER,
    purchaseId,
    attemptId,
    amountMinor,
    currency: purchase.currency,
  });

  const status = await processNormalizedPaymentEvent({
    provider: MANUAL_PAYMENT_PROVIDER,
    providerEventId: `manual-event-${purchaseId}`,
    type: "charge_succeeded",
    payloadSha256: hashPaymentPayload(stablePayload),
    attemptId,
    purchaseId,
    amountMinor,
    currency: purchase.currency,
    providerTransactionId: `manual-charge-${purchaseId}`,
    occurredAt: new Date().toISOString(),
  });

  return status === "paid_pending_validation";
}

export async function activatePhase2PaidPurchase(
  adminUserId: string,
  purchaseId: string,
) {
  if (
    !isPhase2PaymentOrchestrationEnabled()
    || !UUID_RE.test(adminUserId)
    || !UUID_RE.test(purchaseId)
  ) {
    return false;
  }

  const privileged = createPrivilegedSupabaseClient();
  const { data, error } = await privileged.rpc(
    "activate_phase2_paid_purchase",
    {
      p_admin_user_id: adminUserId,
      p_purchase_id: purchaseId,
    },
  );

  return !error && data === true;
}
