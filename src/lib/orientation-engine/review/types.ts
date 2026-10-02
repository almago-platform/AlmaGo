import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationDiscoveryProviderReason,
  OrientationDiscoveryProviderStatus,
  OrientationDiscoveryResearchCandidate,
  OrientationDiscoveryStatus,
} from "@/lib/orientation-engine/discovery/types";
import type {
  OrientationProgrammeVerification,
  OrientationVerificationProviderReason,
  OrientationVerificationProviderStatus,
} from "@/lib/orientation-engine/verification/types";
import type {
  OrientationSelectionReasonCode,
  OrientationSelectionStatus,
  OrientationSelectionWarningCode,
} from "@/lib/orientation-engine/selection/types";
import type { OrientationWriterResult } from "@/lib/orientation-engine/writer/types";

export type OrientationHumanReviewStatus =
  | "pending"
  | "approved"
  | "changes_requested"
  | "rejected";

export type OrientationHumanReviewPipelineStatus =
  | "ready"
  | "partial"
  | "insufficient_evidence"
  | "route_requires_review"
  | "profile_incomplete"
  | "provider_unavailable";

export type OrientationHumanReviewCandidate = {
  candidateKey: string;
  candidate: OrientationDiscoveryResearchCandidate;
};

export type OrientationHumanReviewVerification = {
  candidateKey: string;
  verification: OrientationProgrammeVerification;
};

export type OrientationHumanReviewSelectionItem = {
  candidateKey: string;
  position: number;
  reasons: OrientationSelectionReasonCode[];
  warnings: OrientationSelectionWarningCode[];
  missingFacts: string[];
  baseScore: number;
  finalScore: number;
};

export type OrientationHumanReviewBundle = {
  version: "orientation_v4_human_review_v1";
  profile: PublicOrientationAnswers;
  discovery: {
    planStatus: OrientationDiscoveryStatus;
    planReason: string | null;
    provider: string | null;
    status: OrientationDiscoveryProviderStatus | "not_run";
    reason: OrientationDiscoveryProviderReason | "not_run" | null;
    candidates: OrientationHumanReviewCandidate[];
  };
  verification: {
    provider: string | null;
    status: OrientationVerificationProviderStatus | "not_run";
    reason: OrientationVerificationProviderReason | "not_run" | null;
    programmes: OrientationHumanReviewVerification[];
  };
  selection: {
    status: OrientationSelectionStatus;
    considered: number;
    selected: OrientationHumanReviewSelectionItem[];
  };
  writer: OrientationWriterResult;
};

export type OrientationHumanReviewPersistence = {
  reviewId: string | null;
  available: boolean;
};

export type OrientationHumanReviewDecision = {
  status: Exclude<OrientationHumanReviewStatus, "pending">;
  selectedCandidateKeys: string[];
  counselorNote: string | null;
};
