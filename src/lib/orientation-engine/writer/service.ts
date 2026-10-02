import "server-only";

import { runGeminiOrientationWriter } from "@/lib/orientation-engine/writer/gemini";
import type {
  OrientationWriterInput,
  OrientationWriterResult,
} from "@/lib/orientation-engine/writer/types";

export async function runOrientationPersonalizedWriter(
  input: OrientationWriterInput,
): Promise<OrientationWriterResult> {
  return runGeminiOrientationWriter(input);
}
