export const CATALOG_VERIFICATION_MAX_AGE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export function catalogVerificationExpiresAt(verifiedAt: string | null) {
  if (!verifiedAt) return null;
  const timestamp = Date.parse(verifiedAt);
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp + CATALOG_VERIFICATION_MAX_AGE_DAYS * DAY_MS).toISOString();
}

export function catalogVerificationCutoff(asOf: Date = new Date()) {
  if (!(asOf instanceof Date) || Number.isNaN(asOf.getTime())) return null;
  return new Date(asOf.getTime() - CATALOG_VERIFICATION_MAX_AGE_DAYS * DAY_MS).toISOString();
}

export function isCatalogVerificationCurrent(
  verifiedAt: string | null,
  asOf: Date = new Date(),
) {
  if (!(asOf instanceof Date) || Number.isNaN(asOf.getTime())) return false;
  const expiresAt = catalogVerificationExpiresAt(verifiedAt);
  if (!expiresAt) return false;
  const verifiedTimestamp = Date.parse(verifiedAt as string);
  return verifiedTimestamp <= asOf.getTime() && Date.parse(expiresAt) > asOf.getTime();
}
