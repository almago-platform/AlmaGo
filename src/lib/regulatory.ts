export type RegulatoryVerificationStatus = "verified" | "needs_reverification";

export type RegulatoryFreshnessInput = {
  verification_status: RegulatoryVerificationStatus | string | null;
  verified_at: string | null;
  review_due_at: string | null;
};

function validTimestamp(value: string | null) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function isRegulatoryRuleCurrent(
  rule: RegulatoryFreshnessInput,
  now: Date = new Date(),
) {
  if (rule.verification_status !== "verified") return false;

  const verifiedAt = validTimestamp(rule.verified_at);
  const reviewDueAt = validTimestamp(rule.review_due_at);
  const nowTimestamp = now.getTime();

  return (
    verifiedAt !== null &&
    reviewDueAt !== null &&
    verifiedAt <= nowTimestamp &&
    reviewDueAt > nowTimestamp &&
    reviewDueAt > verifiedAt
  );
}
