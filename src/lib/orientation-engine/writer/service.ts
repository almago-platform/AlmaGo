import "server-only";

import { runGeminiOrientationWriter } from "@/lib/orientation-engine/writer/gemini";
import type {
  OrientationWriterInput,
  OrientationWriterResult,
} from "@/lib/orientation-engine/writer/types";

export async function runOrientationPersonalizedWriter(
  input: OrientationWriterInput,
): Promise<OrientationWriterResult> {
  const result = await runGeminiOrientationWriter(input);

  console.info("orientation_v4_provider", JSON.stringify({
    stage: "writer",
    provider: result.provider,
    status: result.status,
    reason: result.reason,
    requests: result.usage.requests,
  }));

  return result;
}
