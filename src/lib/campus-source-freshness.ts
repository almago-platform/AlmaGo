export type SourceFreshnessStatus = "verified" | "review_due" | "needs_reverification";

export function evaluateSourceFreshness(
  input: {
    verification_status: string | null;
    verified_at: string | null;
    review_due_at: string | null;
  },
  now: Date = new Date(),
): SourceFreshnessStatus {
  if (
    input.verification_status !== "verified"
    || !input.verified_at
    || !input.review_due_at
  ) {
    return "needs_reverification";
  }

  const verifiedAt = Date.parse(input.verified_at);
  const reviewDueAt = Date.parse(input.review_due_at);

  if (
    !Number.isFinite(verifiedAt)
    || !Number.isFinite(reviewDueAt)
    || verifiedAt > now.getTime()
    || reviewDueAt <= verifiedAt
  ) {
    return "needs_reverification";
  }

  return reviewDueAt <= now.getTime() ? "review_due" : "verified";
}
