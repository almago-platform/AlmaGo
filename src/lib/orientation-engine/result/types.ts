import type {
  OrientationVerificationFactKey,
  OrientationVerificationFactStatus,
  OrientationVerificationSourceKind,
  OrientationVerificationValue,
  OrientationVerificationOverallStatus,
} from "@/lib/orientation-engine/verification/types";
import type {
  OrientationWriterContent,
} from "@/lib/orientation-engine/writer/types";
import type { OrientationUniversityMedia } from "@/lib/orientation-engine/types";
import type { OrientationSelectionStatus } from "@/lib/orientation-engine/selection/types";

export type OrientationPublicPersonalizedFact = {
  field: OrientationVerificationFactKey;
  status: Exclude<OrientationVerificationFactStatus, "unknown">;
  value: Exclude<OrientationVerificationValue, null>;
  sourceUrl: string | null;
  sourceKind: OrientationVerificationSourceKind | null;
  verifiedAt: string | null;
};

export type OrientationPublicPersonalizedOption = {
  optionId: string;
  position: number;
  institution: string;
  programme: string;
  city: string | null;
  universityMedia: OrientationUniversityMedia | null;
  overallStatus: OrientationVerificationOverallStatus;
  facts: OrientationPublicPersonalizedFact[];
};

export type OrientationPublicPersonalizedResult = {
  status: OrientationSelectionStatus;
  reviewId: string | null;
  content: OrientationWriterContent;
  selected: OrientationPublicPersonalizedOption[];
  humanReview: {
    mode: "post_result_audit";
    blocksResult: false;
  };
};
