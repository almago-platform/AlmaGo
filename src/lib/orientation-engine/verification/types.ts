import type {
  OrientationDiscoveryResearchCandidate,
  OrientationDiscoveryUsage,
} from "@/lib/orientation-engine/discovery/types";

export type OrientationVerificationFactStatus =
  | "verified"
  | "needs_review"
  | "unknown";

export type OrientationVerificationOverallStatus =
  | "verified"
  | "needs_review"
  | "unknown";

export type OrientationVerificationSourceKind =
  | "official_programme"
  | "official_university"
  | "official_registry"
  | "discovery_only";

export type OrientationVerificationFactKey =
  | "programme_exists"
  | "degree_level"
  | "city"
  | "teaching_language"
  | "german_language_requirement"
  | "english_language_requirement"
  | "accepted_language_certificates"
  | "intake_terms"
  | "winter_deadline"
  | "summer_deadline"
  | "application_route"
  | "application_url"
  | "studienkolleg_requirement"
  | "tuition_or_semester_fees";

export type OrientationVerificationValue =
  | string
  | boolean
  | string[]
  | null;

export type OrientationVerificationFact = {
  field: OrientationVerificationFactKey;
  status: OrientationVerificationFactStatus;
  value: OrientationVerificationValue;
  sourceUrl: string | null;
  sourceKind: OrientationVerificationSourceKind | null;
  verifiedAt: string | null;
};

export type OrientationProgrammeVerification = {
  candidate: OrientationDiscoveryResearchCandidate;
  overallStatus: OrientationVerificationOverallStatus;
  facts: OrientationVerificationFact[];
  sourceUrls: string[];
  verifiedAt: string;
};

export type OrientationVerificationProviderStatus =
  | "disabled"
  | "ready"
  | "unavailable";

export type OrientationVerificationProviderReason =
  | "feature_disabled"
  | "missing_credentials"
  | "provider_error"
  | "no_candidates"
  | null;

export type OrientationVerificationResult = {
  provider: "openai" | "deterministic";
  model: string | null;
  status: OrientationVerificationProviderStatus;
  reason: OrientationVerificationProviderReason;
  programmes: OrientationProgrammeVerification[];
  usage: OrientationDiscoveryUsage;
  candidatesConsidered: number;
  candidatesVerified: number;
};
