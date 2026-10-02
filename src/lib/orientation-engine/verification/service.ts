import "server-only";

import { runOpenAIOrientationVerification } from "@/lib/orientation-engine/verification/openai";
import { persistOrientationVerification } from "@/lib/orientation-engine/verification/store";
import type { OrientationDiscoveryResearchCandidate } from "@/lib/orientation-engine/discovery/types";
import type { OrientationVerificationServiceResult } from "@/lib/orientation-engine/verification/types";

export async function runOrientationVerification(
  candidates: readonly OrientationDiscoveryResearchCandidate[],
): Promise<OrientationVerificationServiceResult> {
  const result = await runOpenAIOrientationVerification(candidates);
  const persistence = await persistOrientationVerification(result);

  return {
    ...result,
    persistence,
  };
}
