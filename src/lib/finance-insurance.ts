export const financeInsuranceKinds = [
  "blocked_account_provider",
  "health_insurance_provider",
  "student_financing_option",
] as const;

export type FinanceInsuranceKind = (typeof financeInsuranceKinds)[number];

export type FinanceInsuranceOption = {
  id?: string;
  provider_name: string;
  product_name: string | null;
  kind: FinanceInsuranceKind;
  description: string | null;
  official_source_url: string;
  application_url: string | null;
  price_notes: string | null;
  eligibility_notes: string | null;
  verified_at: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FinanceInsuranceAdminInput = Omit<FinanceInsuranceOption, "id" | "created_at" | "updated_at">;

export type FinanceInsuranceFilters = {
  kind?: FinanceInsuranceKind;
  provider_name?: string;
};

export type FinanceInsuranceParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

const MAX_NAME = 180;
const MAX_DESCRIPTION = 4000;
const MAX_NOTES = 2000;
const MAX_URL = 2048;
const CATALOG_VERIFICATION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function verificationCurrent(verifiedAt: string | null, asOf: Date) {
  if (!verifiedAt || Number.isNaN(Date.parse(verifiedAt))) return false;
  const timestamp = Date.parse(verifiedAt);
  return timestamp <= asOf.getTime() && timestamp > asOf.getTime() - CATALOG_VERIFICATION_MAX_AGE_MS;
}
const adminFields = new Set([
  "provider_name",
  "product_name",
  "kind",
  "description",
  "official_source_url",
  "application_url",
  "price_notes",
  "eligibility_notes",
  "verified_at",
  "is_active",
]);
const filterFields = new Set(["kind", "provider_name"]);

function requiredText(value: unknown, maximum: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maximum ? normalized : null;
}

function nullableText(value: unknown, maximum: number): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  return requiredText(value, maximum) ?? undefined;
}

function httpUrl(value: unknown): string | null {
  const normalized = requiredText(value, MAX_URL);
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) return null;
    return normalized;
  } catch {
    return null;
  }
}

function nullableHttpUrl(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  return httpUrl(value) ?? undefined;
}

function timestamp(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}

function kind(value: unknown): FinanceInsuranceKind | null {
  return typeof value === "string" && financeInsuranceKinds.includes(value as FinanceInsuranceKind)
    ? value as FinanceInsuranceKind
    : null;
}

export function parseFinanceInsuranceAdminInput(body: unknown): FinanceInsuranceParseResult<FinanceInsuranceAdminInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid finance or insurance option." };
  }
  const input = body as Record<string, unknown>;
  if (Object.keys(input).some((field) => !adminFields.has(field))) {
    return { ok: false, error: "Unknown finance or insurance field." };
  }

  const providerName = requiredText(input.provider_name, MAX_NAME);
  const productName = nullableText(input.product_name, MAX_NAME);
  const parsedKind = kind(input.kind);
  const description = nullableText(input.description, MAX_DESCRIPTION);
  const officialSourceUrl = httpUrl(input.official_source_url);
  const applicationUrl = nullableHttpUrl(input.application_url);
  const priceNotes = nullableText(input.price_notes, MAX_NOTES);
  const eligibilityNotes = nullableText(input.eligibility_notes, MAX_NOTES);
  const verifiedAt = timestamp(input.verified_at);

  if (!providerName || !parsedKind || !officialSourceUrl || typeof input.is_active !== "boolean") {
    return { ok: false, error: "Invalid finance or insurance option." };
  }
  if ([productName, description, applicationUrl, priceNotes, eligibilityNotes, verifiedAt].includes(undefined)) {
    return { ok: false, error: "A bounded finance or insurance value is invalid." };
  }
  if (input.is_active && verifiedAt === null) {
    return { ok: false, error: "An active finance or insurance option requires a dated verification." };
  }

  return {
    ok: true,
    value: {
      provider_name: providerName,
      product_name: productName ?? null,
      kind: parsedKind,
      description: description ?? null,
      official_source_url: officialSourceUrl,
      application_url: applicationUrl ?? null,
      price_notes: priceNotes ?? null,
      eligibility_notes: eligibilityNotes ?? null,
      verified_at: verifiedAt ?? null,
      is_active: input.is_active,
    },
  };
}

export function isPublishableFinanceInsuranceOption(
  option: Pick<FinanceInsuranceOption, "is_active" | "verified_at" | "official_source_url" | "application_url">,
  asOf: Date = new Date(),
) {
  if (!(asOf instanceof Date) || Number.isNaN(asOf.getTime())) return false;
  if (!option.is_active || !httpUrl(option.official_source_url)) return false;
  if (option.application_url !== null && !httpUrl(option.application_url)) return false;
  return verificationCurrent(option.verified_at, asOf);
}

export function parseFinanceInsuranceFilters(body: unknown): FinanceInsuranceParseResult<FinanceInsuranceFilters> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid factual filters." };
  }
  const input = body as Record<string, unknown>;
  if (Object.keys(input).some((field) => !filterFields.has(field))) {
    return { ok: false, error: "Unknown factual filter." };
  }
  const parsedKind = input.kind === undefined ? undefined : kind(input.kind) ?? null;
  const providerName = input.provider_name === undefined ? undefined : requiredText(input.provider_name, MAX_NAME);
  if (parsedKind === null || providerName === null) return { ok: false, error: "Invalid factual filter." };
  return {
    ok: true,
    value: {
      ...(parsedKind ? { kind: parsedKind } : {}),
      ...(providerName ? { provider_name: providerName } : {}),
    },
  };
}
