import "server-only";

import { isPhase2DevPaymentAdapterEnabled } from "@/lib/phase2/config";
import {
  beginPhase2PaymentAttempt,
  getPurchasePaymentContext,
  hashPaymentPayload,
  processNormalizedPaymentEvent,
} from "@/lib/phase2/payment";

const DEV_PROVIDER = "almago_dev";

export async function confirmDevelopmentPayment(
  userId: string,
  purchaseId: string,
) {
  if (!isPhase2DevPaymentAdapterEnabled()) return null;

  const purchase = await getPurchasePaymentContext(userId, purchaseId);
  if (!purchase || purchase.status !== "payment_pending") return null;

  const idempotencyKey = `dev-attempt-${purchase.purchaseId}`;
  const attemptId = await beginPhase2PaymentAttempt({
    userId,
    purchaseId: purchase.purchaseId,
    provider: DEV_PROVIDER,
    idempotencyKey,
  });
  if (!attemptId) return null;

  const stablePayload = JSON.stringify({
    provider: DEV_PROVIDER,
    attemptId,
    purchaseId: purchase.purchaseId,
    amountMinor: purchase.amountMinor,
    currency: purchase.currency,
  });

  return processNormalizedPaymentEvent({
    provider: DEV_PROVIDER,
    providerEventId: `dev-event-${purchase.purchaseId}`,
    type: "charge_succeeded",
    payloadSha256: hashPaymentPayload(stablePayload),
    attemptId,
    purchaseId: purchase.purchaseId,
    amountMinor: purchase.amountMinor,
    currency: purchase.currency,
    providerTransactionId: `dev-charge-${purchase.purchaseId}`,
    occurredAt: new Date().toISOString(),
  });
}
