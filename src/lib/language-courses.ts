import { catalogVerificationCutoff, isCatalogVerificationCurrent } from "@/lib/catalog-freshness";

export const languageCoursePurposes = [
  "study_preparation",
  "standalone_language",
] as const;

export const languageCourseLevels = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export type LanguageCoursePurpose = (typeof languageCoursePurposes)[number];
export type LanguageCourseLevel = (typeof languageCourseLevels)[number];

export type LanguageCourseInput = {
  title: string;
  provider_name: string;
  city: string | null;
  language: string;
  purpose: LanguageCoursePurpose;
  level_from: LanguageCourseLevel | null;
  level_to: LanguageCourseLevel | null;
  hours_per_week: number | null;
  starts_on: string | null;
  ends_on: string | null;
  price_cents: number | null;
  currency: string | null;
  source_url: string | null;
  application_url: string | null;
  verified_at: string | null;
  is_active: boolean;
};

export type LanguageCourseRecord = LanguageCourseInput & {
  id: string;
};

export type LanguageCourseFilters = {
  purpose?: LanguageCoursePurpose;
  city?: string;
  language?: string;
  level_from?: LanguageCourseLevel;
  level_to?: LanguageCourseLevel;
};

export type LanguageCoursePayloadResult =
  | { ok: true; value: LanguageCourseInput }
  | { ok: false; error: string };

export type LanguageCourseFilterResult =
  | { ok: true; value: LanguageCourseFilters }
  | { ok: false; error: string };

const MAX_TEXT = 180;
const MAX_URL = 2048;
const MAX_PRICE_CENTS = 100_000_000;

const payloadKeys = new Set([
  "title",
  "provider_name",
  "city",
  "language",
  "purpose",
  "level_from",
  "level_to",
  "hours_per_week",
  "starts_on",
  "ends_on",
  "price_cents",
  "currency",
  "source_url",
  "application_url",
  "verified_at",
  "is_active",
]);

function boundedRequiredText(value: unknown, maximum = MAX_TEXT) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maximum ? trimmed : null;
}

function boundedOptionalText(value: unknown, maximum = MAX_TEXT) {
  if (value === null || value === undefined || value === "") return null;
  return boundedRequiredText(value, maximum) ?? undefined;
}

function enumValue<T extends readonly string[]>(values: T, value: unknown): T[number] | null {
  return typeof value === "string" && values.includes(value) ? value as T[number] : null;
}

function optionalInteger(value: unknown, minimum: number, maximum: number) {
  if (value === null || value === undefined || value === "") return null;
  return Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum
    ? Number(value)
    : undefined;
}

function dateOnly(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    ? value
    : undefined;
}

function timestamp(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}

function httpUrl(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const text = boundedRequiredText(value, MAX_URL);
  if (!text) return undefined;
  try {
    const parsed = new URL(text);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? text : undefined;
  } catch {
    return undefined;
  }
}

function currencyCode(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const text = boundedRequiredText(value, 3)?.toUpperCase();
  return text && /^[A-Z]{3}$/.test(text) ? text : undefined;
}

function levelOrder(level: LanguageCourseLevel) {
  return languageCourseLevels.indexOf(level);
}

export function parseLanguageCoursePayload(body: unknown): LanguageCoursePayloadResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Données invalides." };
  }

  const input = body as Record<string, unknown>;
  if (Object.keys(input).some((key) => !payloadKeys.has(key))) {
    return { ok: false, error: "Le contrat du cours de langue contient un champ inconnu." };
  }

  const title = boundedRequiredText(input.title);
  const providerName = boundedRequiredText(input.provider_name);
  const city = boundedOptionalText(input.city);
  const language = boundedRequiredText(input.language, 80);
  const purpose = enumValue(languageCoursePurposes, input.purpose);
  const levelFrom = input.level_from === null || input.level_from === undefined || input.level_from === ""
    ? null
    : enumValue(languageCourseLevels, input.level_from) ?? undefined;
  const levelTo = input.level_to === null || input.level_to === undefined || input.level_to === ""
    ? null
    : enumValue(languageCourseLevels, input.level_to) ?? undefined;
  const hoursPerWeek = optionalInteger(input.hours_per_week, 1, 168);
  const startsOn = dateOnly(input.starts_on);
  const endsOn = dateOnly(input.ends_on);
  const priceCents = optionalInteger(input.price_cents, 0, MAX_PRICE_CENTS);
  const currency = currencyCode(input.currency);
  const sourceUrl = httpUrl(input.source_url);
  const applicationUrl = httpUrl(input.application_url);
  const verifiedAt = timestamp(input.verified_at);
  const isActive = input.is_active;

  if (!title || !providerName || !language || !purpose || typeof isActive !== "boolean") {
    return { ok: false, error: "Le contrat du cours de langue est invalide." };
  }

  if (
    city === undefined
    || levelFrom === undefined
    || levelTo === undefined
    || hoursPerWeek === undefined
    || startsOn === undefined
    || endsOn === undefined
    || priceCents === undefined
    || currency === undefined
    || sourceUrl === undefined
    || applicationUrl === undefined
    || verifiedAt === undefined
  ) {
    return { ok: false, error: "Une valeur du cours de langue est invalide." };
  }

  if (levelFrom && levelTo && levelOrder(levelFrom) > levelOrder(levelTo)) {
    return { ok: false, error: "La plage de niveaux est invalide." };
  }

  if (startsOn && endsOn && startsOn > endsOn) {
    return { ok: false, error: "La période du cours est invalide." };
  }

  if (priceCents !== null && !currency) {
    return { ok: false, error: "La devise est obligatoire lorsque le prix est renseigné." };
  }

  const value: LanguageCourseInput = {
    title,
    provider_name: providerName,
    city: city ?? null,
    language,
    purpose,
    level_from: levelFrom,
    level_to: levelTo,
    hours_per_week: hoursPerWeek,
    starts_on: startsOn,
    ends_on: endsOn,
    price_cents: priceCents,
    currency,
    source_url: sourceUrl,
    application_url: applicationUrl,
    verified_at: verifiedAt,
    is_active: isActive,
  };

  if (value.is_active && !isPublishableLanguageCourse(value)) {
    return {
      ok: false,
      error: "Un cours actif doit disposer d’une source officielle valide et d’une vérification datée.",
    };
  }

  return { ok: true, value };
}

export function isPublishableLanguageCourse(
  course: Pick<
    LanguageCourseInput,
    "title" | "provider_name" | "language" | "source_url" | "application_url" | "verified_at" | "is_active"
  >,
  now: Date = new Date(),
) {
  if (!course.is_active || !course.title.trim() || !course.provider_name.trim() || !course.language.trim()) {
    return false;
  }

  if (!httpUrl(course.source_url)) return false;
  if (course.application_url && !httpUrl(course.application_url)) return false;

  return isCatalogVerificationCurrent(course.verified_at, now);
}

export function parseLanguageCourseFilters(
  input: Record<string, unknown>,
): LanguageCourseFilterResult {
  const allowedKeys = new Set(["purpose", "city", "language", "level_from", "level_to"]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
    return { ok: false, error: "Filtre inconnu." };
  }

  const purpose = input.purpose === undefined
    ? undefined
    : enumValue(languageCoursePurposes, input.purpose) ?? null;
  const city = input.city === undefined ? undefined : boundedRequiredText(input.city);
  const language = input.language === undefined ? undefined : boundedRequiredText(input.language, 80);
  const levelFrom = input.level_from === undefined
    ? undefined
    : enumValue(languageCourseLevels, input.level_from) ?? null;
  const levelTo = input.level_to === undefined
    ? undefined
    : enumValue(languageCourseLevels, input.level_to) ?? null;

  if (
    purpose === null
    || city === null
    || language === null
    || levelFrom === null
    || levelTo === null
  ) {
    return { ok: false, error: "Filtre invalide." };
  }

  return {
    ok: true,
    value: {
      ...(purpose ? { purpose } : {}),
      ...(city ? { city } : {}),
      ...(language ? { language } : {}),
      ...(levelFrom ? { level_from: levelFrom } : {}),
      ...(levelTo ? { level_to: levelTo } : {}),
    },
  };
}

type LanguageCourseQuery = {
  eq(column: string, value: string | boolean): LanguageCourseQuery;
  ilike(column: string, value: string): LanguageCourseQuery;
  lte(column: string, value: string): LanguageCourseQuery;
  gt(column: string, value: string): LanguageCourseQuery;
  order(column: string, options: { ascending: boolean }): LanguageCourseQuery;
};

export function publishableLanguageCoursesQuery(
  query: LanguageCourseQuery,
  rawFilters: Record<string, unknown>,
  now: Date = new Date(),
) {
  const parsed = parseLanguageCourseFilters(rawFilters);
  if (!parsed.ok) return null;

  const filters = parsed.value;
  const cutoff = catalogVerificationCutoff(now);
  if (!cutoff) return null;

  let scoped = query
    .eq("is_active", true)
    .lte("verified_at", now.toISOString())
    .gt("verified_at", cutoff);

  if (filters.purpose) scoped = scoped.eq("purpose", filters.purpose);
  if (filters.city) scoped = scoped.ilike("city", filters.city);
  if (filters.language) scoped = scoped.ilike("language", filters.language);
  if (filters.level_from) scoped = scoped.eq("level_from", filters.level_from);
  if (filters.level_to) scoped = scoped.eq("level_to", filters.level_to);

  return scoped.order("title", { ascending: true });
}
