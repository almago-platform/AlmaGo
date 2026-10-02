import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationProgrammeVerification,
  OrientationVerificationFactKey,
} from "@/lib/orientation-engine/verification/types";

export type OrientationSelectionStatus =
  | "ready"
  | "partial"
  | "insufficient_evidence";

export type OrientationSelectionReasonCode =
  | "core_verified"
  | "degree_match"
  | "field_match"
  | "specialty_match"
  | "study_language_match"
  | "preferred_city_match"
  | "intake_match"
  | "current_language_sufficient"
  | "application_route_known"
  | "deadline_known"
  | "institution_diversity"
  | "city_diversity";

export type OrientationSelectionWarningCode =
  | "core_needs_review"
  | "core_unknown"
  | "degree_needs_review"
  | "field_needs_review"
  | "study_language_other"
  | "preferred_city_other"
  | "intake_needs_review"
  | "intake_unknown"
  | "language_requirement_to_complete"
  | "language_requirement_unknown"
  | "application_route_unknown"
  | "deadline_unknown"
  | "studienkolleg_review"
  | "fees_unknown";

export type OrientationSelectionExclusionCode =
  | "programme_not_current"
  | "degree_mismatch"
  | "intake_unavailable";

export type OrientationSelectionScoreBreakdown = {
  verification: number;
  degree: number;
  field: number;
  language: number;
  city: number;
  intake: number;
  readiness: number;
  diversity: number;
};

export type OrientationSelectionCandidateEvaluation = {
  verification: OrientationProgrammeVerification;
  excluded: boolean;
  exclusionCodes: OrientationSelectionExclusionCode[];
  baseScore: number;
  finalScore: number;
  breakdown: OrientationSelectionScoreBreakdown;
  reasons: OrientationSelectionReasonCode[];
  warnings: OrientationSelectionWarningCode[];
  missingFacts: OrientationVerificationFactKey[];
};

export type OrientationSelectionItem =
  OrientationSelectionCandidateEvaluation & {
    position: number;
  };

export type OrientationSelectionResult = {
  profile: PublicOrientationAnswers;
  status: OrientationSelectionStatus;
  selected: OrientationSelectionItem[];
  considered: number;
  excluded: OrientationSelectionCandidateEvaluation[];
  unselected: OrientationSelectionCandidateEvaluation[];
  targetSize: {
    min: 3;
    max: 4;
  };
  generatedBy: "deterministic_selection_v1";
};
