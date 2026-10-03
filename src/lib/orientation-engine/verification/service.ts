import "server-only";

import { buildOrientationResearchProgrammeDedupeKey } from "@/lib/orientation-engine/discovery/knowledge-core";
import { emptyOrientationDiscoveryUsage } from "@/lib/orientation-engine/discovery/research";
import type { OrientationDiscoveryResearchCandidate } from "@/lib/orientation-engine/discovery/types";
import { runOpenAIOrientationVerification } from "@/lib/orientation-engine/verification/openai";
import {
  loadReusableOrientationVerifications,
  persistOrientationVerification,
  recordOrientationVerificationCacheHit,
} from "@/lib/orientation-engine/verification/store";
import type {
  OrientationProgrammeVerification,
  OrientationVerificationServiceResult,
} from "@/lib/orientation-engine/verification/types";

export const ORIENTATION_VERIFICATION_REUSE_TARGET = 4;

function candidateKey(candidate: OrientationDiscoveryResearchCandidate) {
  return buildOrientationResearchProgrammeDedupeKey(candidate);
}

function logVerification(result: {
  provider: string;
  status: string;
  reason: string | null;
  requests: number;
  webSearchCalls: number;
  candidatesConsidered: number;
  candidatesVerified: number;
  cachedProgrammes: number;
}) {
  console.info("orientation_v4_provider", JSON.stringify({
    stage: "verification",
    provider: result.provider,
    status: result.status,
    reason: result.reason,
    requests: result.requests,
    webSearchCalls: result.webSearchCalls,
    candidatesConsidered: result.candidatesConsidered,
    candidatesVerified: result.candidatesVerified,
    cachedProgrammes: result.cachedProgrammes,
  }));
}

function takeReusable(
  programmes: readonly OrientationProgrammeVerification[],
) {
  return programmes
    .filter((programme) => programme.overallStatus !== "unknown")
    .slice(0, ORIENTATION_VERIFICATION_REUSE_TARGET);
}

export async function runOrientationVerification(
  candidates: readonly OrientationDiscoveryResearchCandidate[],
): Promise<OrientationVerificationServiceResult> {
  const knowledge = await loadReusableOrientationVerifications(candidates);
  const cachedProgrammes = takeReusable(knowledge.programmes);

  if (cachedProgrammes.length >= ORIENTATION_VERIFICATION_REUSE_TARGET) {
    const persistence = await recordOrientationVerificationCacheHit(
      cachedProgrammes,
    );
    const candidatesVerified = cachedProgrammes.filter(
      (programme) => programme.overallStatus === "verified",
    ).length;

    logVerification({
      provider: "verification_cache",
      status: "ready",
      reason: null,
      requests: 0,
      webSearchCalls: 0,
      candidatesConsidered: cachedProgrammes.length,
      candidatesVerified,
      cachedProgrammes: cachedProgrammes.length,
    });

    return {
      provider: "verification_cache",
      model: null,
      status: "ready",
      reason: null,
      programmes: cachedProgrammes,
      usage: emptyOrientationDiscoveryUsage(),
      candidatesConsidered: cachedProgrammes.length,
      candidatesVerified,
      persistence,
    };
  }

  const cachedKeys = new Set(
    cachedProgrammes.map((programme) => candidateKey(programme.candidate)),
  );
  const uncachedCandidates = candidates.filter(
    (candidate) => !cachedKeys.has(candidateKey(candidate)),
  );
  const missing = Math.max(
    1,
    ORIENTATION_VERIFICATION_REUSE_TARGET - cachedProgrammes.length,
  );

  const fresh = await runOpenAIOrientationVerification(
    uncachedCandidates,
    missing,
  );
  const persistence = await persistOrientationVerification(fresh);

  const programmes = [
    ...cachedProgrammes,
    ...fresh.programmes,
  ].slice(0, ORIENTATION_VERIFICATION_REUSE_TARGET);

  const candidatesVerified = programmes.filter(
    (programme) => programme.overallStatus === "verified",
  ).length;
  const status = programmes.length > 0 ? "ready" : fresh.status;
  const reason = programmes.length > 0 ? null : fresh.reason;
  const provider =
    cachedProgrammes.length > 0
      ? fresh.usage.requests > 0
        ? "mixed"
        : "verification_cache"
      : fresh.provider;

  logVerification({
    provider,
    status,
    reason,
    requests: fresh.usage.requests,
    webSearchCalls: fresh.usage.webSearchCalls,
    candidatesConsidered: programmes.length,
    candidatesVerified,
    cachedProgrammes: cachedProgrammes.length,
  });

  return {
    provider,
    model: fresh.model,
    status,
    reason,
    programmes,
    usage: fresh.usage,
    candidatesConsidered: programmes.length,
    candidatesVerified,
    persistence,
  };
}
