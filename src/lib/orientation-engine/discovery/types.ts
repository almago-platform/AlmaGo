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
