import type {
  PublicOrientationAverageType,
  PublicOrientationBacStatus,
  PublicOrientationIntakeSeason,
} from "@/lib/orientation/public";

export type OrientationDiscoveryStatus =
  | "ready"
  | "profile_incomplete"
  | "route_requires_review";

export type OrientationDiscoveryReason =
  | "target_degree_missing"
  | "target_field_missing"
  | "no_bac_requires_route_review";

export type OrientationDiscoverySourceTier =
  | "official_programme"
  | "official_university"
  | "official_registry"
  | "discovery_only";

export type OrientationDiscoveryProfile = {
  bacStatus: PublicOrientationBacStatus | "unknown";
  bacYear: number | null;
  bacTrack: string | null;
  averageOutOf20: number | null;
  averageType: Exclude<PublicOrientationAverageType, ""> | null;
  lastDiploma: string | null;
  targetDegree: string | null;
  targetField: string | null;
  engineeringSpecialty: string | null;
  germanLevel: string | null;
  englishLevel: string | null;
  studyLanguage: string | null;
  targetIntakeSeason: Exclude<PublicOrientationIntakeSeason, ""> | null;
  targetIntakeYear: number | null;
  budgetRange: string | null;
  preferredCities: string[];
};

export type OrientationProgrammeFamily = {
  id: string;
  label: string;
  aliases: readonly string[];
};

export type OrientationDiscoveryPolicy = {
  maxSearchQueries: number;
  maxCandidates: number;
  maxSourceUrlsPerCandidate: number;
  sourcePriority: readonly OrientationDiscoverySourceTier[];
  campusOffersStudienkolleg: false;
  studienkollegHandling: "flag_and_review";
};

export type OrientationDiscoveryResearchCandidate = {
  institution: string;
  programme: string;
  degree: string | null;
  city: string | null;
  teachingLanguage: string | null;
  officialProgrammeUrl: string | null;
  officialUniversityUrl: string | null;
  discoveryReason: string;
  sourceUrls: string[];
  status: "research_candidate";
};

export type OrientationDiscoveryPlan = {
  status: OrientationDiscoveryStatus;
  reason: OrientationDiscoveryReason | null;
  profile: OrientationDiscoveryProfile;
  programmeFamilies: OrientationProgrammeFamily[];
  searchQueries: string[];
  policy: OrientationDiscoveryPolicy;
};


export type OrientationDiscoveryProviderStatus =
  | "disabled"
  | "not_applicable"
  | "ready"
  | "unavailable";

export type OrientationDiscoveryProviderReason =
  | "feature_disabled"
  | "plan_not_ready"
  | "missing_credentials"
  | "provider_error"
  | null;

export type OrientationDiscoveryUsage = {
  requests: number;
  webSearchCalls: number;
  queriesAttempted: number;
  queriesSucceeded: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  sourceUrlsSeen: number;
  durationMs: number;
};

export type OrientationDiscoveryResearchResult = {
  provider: "openai";
  model: string | null;
  status: OrientationDiscoveryProviderStatus;
  reason: OrientationDiscoveryProviderReason;
  candidates: OrientationDiscoveryResearchCandidate[];
  usage: OrientationDiscoveryUsage;
};


export type OrientationDiscoveryKnowledgeCacheStatus =
  | "hit"
  | "partial"
  | "miss"
  | "unavailable";

export type OrientationDiscoveryKnowledgeCache = {
  status: OrientationDiscoveryKnowledgeCacheStatus;
  candidatesLoaded: number;
  candidatesPersisted: number;
  refreshCadence: "semester";
  majorRefreshDates: readonly ["04-15", "10-15"];
  refreshCycle: `summer_${number}` | `winter_${number}`;
  nextMajorRefreshAt: string;
};

export type OrientationDiscoveryResult = {
  provider: "openai" | "knowledge_cache" | "mixed";
  model: string | null;
  status: OrientationDiscoveryProviderStatus;
  reason: OrientationDiscoveryProviderReason;
  candidates: OrientationDiscoveryResearchCandidate[];
  usage: OrientationDiscoveryUsage;
  cache: OrientationDiscoveryKnowledgeCache;
};
