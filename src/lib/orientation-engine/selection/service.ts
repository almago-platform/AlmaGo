import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type { OrientationProgrammeVerification } from "@/lib/orientation-engine/verification/types";
import { buildOrientationSelection } from "@/lib/orientation-engine/selection/core";
import type { OrientationSelectionResult } from "@/lib/orientation-engine/selection/types";

export function runOrientationSelection(
  profile: PublicOrientationAnswers,
  programmes: readonly OrientationProgrammeVerification[],
): OrientationSelectionResult {
  return buildOrientationSelection(profile, programmes);
}
