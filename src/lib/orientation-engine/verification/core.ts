import type { OrientationDiscoveryResearchCandidate } from "@/lib/orientation-engine/discovery/types";
import type {
  OrientationProgrammeVerification,
  OrientationVerificationFact,
  OrientationVerificationFactKey,
  OrientationVerificationOverallStatus,
  OrientationVerificationSourceKind,
  OrientationVerificationValue,
} from "@/lib/orientation-engine/verification/types";

export const ORIENTATION_VERIFICATION_MAX_CANDIDATES = 8;

const OFFICIAL_REGISTRY_DOMAINS = [
  "daad.de",
  "hochschulkompass.de",
  "uni-assist.de",
] as const;

type RawVerificationEvidence = {
  value?: unknown;
  sourceUrl?: unknown;
};

export type RawProgrammeVerificationEvidence = {
  programmeExists?: RawVerificationEvidence;
  degreeLevel?: RawVerificationEvidence;
  city?: RawVerificationEvidence;
  teachingLanguage?: RawVerificationEvidence;
  germanLanguageRequirement?: RawVerificationEvidence;
  englishLanguageRequirement?: RawVerificationEvidence;
  acceptedLanguageCertificates?: RawVerificationEvidence;
  intakeTerms?: RawVerificationEvidence;
  winterDeadline?: RawVerificationEvidence;
  summerDeadline?: RawVerificationEvidence;
  applicationRoute?: RawVerificationEvidence;
  applicationUrl?: RawVerificationEvidence;
  studienkollegRequirement?: RawVerificationEvidence;
  tuitionOrSemesterFees?: RawVerificationEvidence;
};

const evidenceFieldMap: ReadonlyArray<{
  key: OrientationVerificationFactKey;
  rawKey: keyof RawProgrammeVerificationEvidence;
}> = [
  { key: "programme_exists", rawKey: "programmeExists" },
  { key: "degree_level", rawKey: "degreeLevel" },
  { key: "city", rawKey: "city" },
  { key: "teaching_language", rawKey: "teachingLanguage" },
  { key: "german_language_requirement", rawKey: "germanLanguageRequirement" },
  { key: "english_language_requirement", rawKey: "englishLanguageRequirement" },
  { key: "accepted_language_certificates", rawKey: "acceptedLanguageCertificates" },
  { key: "intake_terms", rawKey: "intakeTerms" },
  { key: "winter_deadline", rawKey: "winterDeadline" },
  { key: "summer_deadline", rawKey: "summerDeadline" },
  { key: "application_route", rawKey: "applicationRoute" },
  { key: "application_url", rawKey: "applicationUrl" },
  { key: "studienkolleg_requirement", rawKey: "studienkollegRequirement" },
  { key: "tuition_or_semester_fees", rawKey: "tuitionOrSemesterFees" },
];

function canonicalUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "https:") return null;
    parsed.hash = "";
    const normalized = parsed.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    return null;
  }
}

function hostname(value: string | null | undefined) {
  const url = canonicalUrl(value);
  if (!url) return null;
  try {
    return new URL(url).hostname.toLocaleLowerCase("en").replace(/^www\./, "");
  } catch {
    return null;
  }
}

function domainMatches(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

export function classifyOrientationVerificationSource(
  candidate: OrientationDiscoveryResearchCandidate,
  sourceUrl: string | null,
): OrientationVerificationSourceKind | null {
  const canonical = canonicalUrl(sourceUrl);
  if (!canonical) return null;

  const programmeUrl = canonicalUrl(candidate.officialProgrammeUrl);
  if (programmeUrl && canonical === programmeUrl) {
    return "official_programme";
  }

  const sourceHost = hostname(canonical);
  if (!sourceHost) return null;

  const officialHosts = [
    hostname(candidate.officialProgrammeUrl),
    hostname(candidate.officialUniversityUrl),
  ].filter((value): value is string => Boolean(value));

  if (officialHosts.some((officialHost) => sourceHost === officialHost)) {
    return "official_university";
  }

  if (
    OFFICIAL_REGISTRY_DOMAINS.some((domain) =>
      domainMatches(sourceHost, domain)
    )
  ) {
    return "official_registry";
  }

  return "discovery_only";
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return normalized.slice(0, 500);
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return null;
  const normalized = [...new Set(
    value
      .map(normalizeString)
      .filter((item): item is string => Boolean(item)),
  )].slice(0, 16);
  return normalized.length > 0 ? normalized : null;
}

function normalizeVerificationValue(
  field: OrientationVerificationFactKey,
  value: unknown,
): OrientationVerificationValue {
  if (field === "programme_exists" || field === "studienkolleg_requirement") {
    return typeof value === "boolean" ? value : null;
  }

  if (
    field === "accepted_language_certificates"
    || field === "intake_terms"
  ) {
    return normalizeStringArray(value);
  }

  return normalizeString(value);
}

function canonicalSet(values: readonly string[]) {
  return new Set(
    values
      .map((value) => canonicalUrl(value))
      .filter((value): value is string => Boolean(value)),
  );
}

export function createOrientationVerifiedFact({
  candidate,
  field,
  evidence,
  webSourceUrls,
  verifiedAt,
}: {
  candidate: OrientationDiscoveryResearchCandidate;
  field: OrientationVerificationFactKey;
  evidence: RawVerificationEvidence | undefined;
  webSourceUrls: readonly string[];
  verifiedAt: string;
}): OrientationVerificationFact {
  const value = normalizeVerificationValue(field, evidence?.value);
  if (value === null) {
    return {
      field,
      status: "unknown",
      value: null,
      sourceUrl: null,
      sourceKind: null,
      verifiedAt: null,
    };
  }

  const sourceUrl = canonicalUrl(
    typeof evidence?.sourceUrl === "string" ? evidence.sourceUrl : null,
  );
  if (!sourceUrl || !canonicalSet(webSourceUrls).has(sourceUrl)) {
    return {
      field,
      status: "unknown",
      value: null,
      sourceUrl: null,
      sourceKind: null,
      verifiedAt: null,
    };
  }

  const sourceKind = classifyOrientationVerificationSource(candidate, sourceUrl);
  if (!sourceKind) {
    return {
      field,
      status: "unknown",
      value: null,
      sourceUrl: null,
      sourceKind: null,
      verifiedAt: null,
    };
  }

  const status =
    sourceKind === "official_programme" || sourceKind === "official_university"
      ? "verified"
      : "needs_review";

  return {
    field,
    status,
    value,
    sourceUrl,
    sourceKind,
    verifiedAt: status === "verified" ? verifiedAt : null,
  };
}

function overallStatus(
  facts: readonly OrientationVerificationFact[],
): OrientationVerificationOverallStatus {
  const byField = new Map(facts.map((fact) => [fact.field, fact]));
  const programmeExists = byField.get("programme_exists");
  const core = [
    programmeExists,
    byField.get("degree_level"),
    byField.get("teaching_language"),
  ];

  if (
    programmeExists?.status === "verified"
    && programmeExists.value === true
    && core.every((fact) => fact?.status === "verified")
  ) {
    return "verified";
  }

  if (
    facts.some((fact) =>
      fact.status === "verified" || fact.status === "needs_review"
    )
  ) {
    return "needs_review";
  }

  return "unknown";
}

export function buildOrientationProgrammeVerification({
  candidate,
  evidence,
  webSourceUrls,
  verifiedAt = new Date().toISOString(),
}: {
  candidate: OrientationDiscoveryResearchCandidate;
  evidence: RawProgrammeVerificationEvidence;
  webSourceUrls: readonly string[];
  verifiedAt?: string;
}): OrientationProgrammeVerification {
  const facts = evidenceFieldMap.map(({ key, rawKey }) =>
    createOrientationVerifiedFact({
      candidate,
      field: key,
      evidence: evidence[rawKey],
      webSourceUrls,
      verifiedAt,
    })
  );

  return {
    candidate,
    overallStatus: overallStatus(facts),
    facts,
    sourceUrls: [...canonicalSet(
      facts
        .map((fact) => fact.sourceUrl)
        .filter((url): url is string => Boolean(url)),
    )],
    verifiedAt,
  };
}

function fallbackFact(
  field: OrientationVerificationFactKey,
  value: OrientationVerificationValue,
  sourceUrl: string | null,
  candidate: OrientationDiscoveryResearchCandidate,
): OrientationVerificationFact {
  if (value === null || (Array.isArray(value) && value.length === 0)) {
    return {
      field,
      status: "unknown",
      value: null,
      sourceUrl: null,
      sourceKind: null,
      verifiedAt: null,
    };
  }

  const canonical = canonicalUrl(sourceUrl);
  return {
    field,
    status: "needs_review",
    value,
    sourceUrl: canonical,
    sourceKind: canonical
      ? classifyOrientationVerificationSource(candidate, canonical)
      : null,
    verifiedAt: null,
  };
}

export function buildOrientationVerificationFallback(
  candidate: OrientationDiscoveryResearchCandidate,
  now = new Date(),
): OrientationProgrammeVerification {
  const primarySource =
    candidate.officialProgrammeUrl
    || candidate.officialUniversityUrl
    || candidate.sourceUrls[0]
    || null;

  const facts: OrientationVerificationFact[] = [
    fallbackFact("programme_exists", null, primarySource, candidate),
    fallbackFact("degree_level", candidate.degree, primarySource, candidate),
    fallbackFact("city", candidate.city, primarySource, candidate),
    fallbackFact(
      "teaching_language",
      candidate.teachingLanguage,
      primarySource,
      candidate,
    ),
    fallbackFact("german_language_requirement", null, null, candidate),
    fallbackFact("english_language_requirement", null, null, candidate),
    fallbackFact("accepted_language_certificates", null, null, candidate),
    fallbackFact("intake_terms", null, null, candidate),
    fallbackFact("winter_deadline", null, null, candidate),
    fallbackFact("summer_deadline", null, null, candidate),
    fallbackFact("application_route", null, null, candidate),
    fallbackFact("application_url", null, null, candidate),
    fallbackFact("studienkolleg_requirement", null, null, candidate),
    fallbackFact("tuition_or_semester_fees", null, null, candidate),
  ];

  return {
    candidate,
    overallStatus: overallStatus(facts),
    facts,
    sourceUrls: primarySource ? [primarySource] : [],
    verifiedAt: now.toISOString(),
  };
}

function sourceStrength(candidate: OrientationDiscoveryResearchCandidate) {
  if (candidate.officialProgrammeUrl) return 3;
  if (candidate.officialUniversityUrl) return 2;
  if (candidate.sourceUrls.length > 0) return 1;
  return 0;
}

export function selectOrientationCandidatesForVerification(
  candidates: readonly OrientationDiscoveryResearchCandidate[],
  limit = ORIENTATION_VERIFICATION_MAX_CANDIDATES,
) {
  return candidates
    .map((candidate, index) => ({ candidate, index }))
    .sort((a, b) => {
      const strength = sourceStrength(b.candidate) - sourceStrength(a.candidate);
      if (strength !== 0) return strength;
      return a.index - b.index;
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
