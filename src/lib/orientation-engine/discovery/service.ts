import "server-only";

import {
  ORIENTATION_KNOWLEDGE_MIN_CANDIDATES,
  ORIENTATION_MAJOR_REFRESH_DATES,
  loadOrientationDiscoveryKnowledge,
  persistOrientationDiscoveryResearch,
  recordOrientationKnowledgeCacheHit,
} from "@/lib/orientation-engine/discovery/knowledge";
import {
  getOrientationDiscoveryRefreshWindow,
  mergeOrientationKnowledgeCandidates,
  orientationKnowledgeCoverageSufficient,
} from "@/lib/orientation-engine/discovery/knowledge-core";
import { runOpenAIOrientationDiscovery } from "@/lib/orientation-engine/discovery/openai";
import { emptyOrientationDiscoveryUsage } from "@/lib/orientation-engine/discovery/research";
import type {
  OrientationDiscoveryKnowledgeCacheStatus,
  OrientationDiscoveryPlan,
  OrientationDiscoveryResult,
} from "@/lib/orientation-engine/discovery/types";

export const ORIENTATION_DISCOVERY_MAX_FRESH_QUERIES = 3;
export const ORIENTATION_DISCOVERY_MAX_PARTIAL_QUERIES = 2;

function discoveryQueryBudget(cachedCount: number) {
  if (cachedCount <= 0) return ORIENTATION_DISCOVERY_MAX_FRESH_QUERIES;

  const missing = Math.max(
    1,
    ORIENTATION_KNOWLEDGE_MIN_CANDIDATES - cachedCount,
  );

  return Math.min(ORIENTATION_DISCOVERY_MAX_PARTIAL_QUERIES, missing);
}

function cacheStatus(
  available: boolean,
  count: number,
): OrientationDiscoveryKnowledgeCacheStatus {
  if (!available) return "unavailable";
  if (count >= ORIENTATION_KNOWLEDGE_MIN_CANDIDATES) return "hit";
  if (count > 0) return "partial";
  return "miss";
}

export async function runOrientationDiscovery(
  plan: OrientationDiscoveryPlan,
): Promise<OrientationDiscoveryResult> {
  const refreshWindow = getOrientationDiscoveryRefreshWindow();
  const cacheMetadata = {
    refreshCadence: "semester" as const,
    majorRefreshDates: ORIENTATION_MAJOR_REFRESH_DATES,
    refreshCycle: refreshWindow.cycle,
    nextMajorRefreshAt: refreshWindow.nextMajorRefreshAt,
  };
  const knowledge = await loadOrientationDiscoveryKnowledge(plan);
  const cachedCandidates = knowledge.entries.map((entry) => entry.candidate);
  const initialCacheStatus = cacheStatus(
    knowledge.available,
    cachedCandidates.length,
  );

  if (
    plan.status === "ready"
    && knowledge.available
    && orientationKnowledgeCoverageSufficient(
      plan,
      cachedCandidates,
      ORIENTATION_KNOWLEDGE_MIN_CANDIDATES,
    )
  ) {
    await recordOrientationKnowledgeCacheHit(plan, knowledge.entries);

    return {
      provider: "knowledge_cache",
      model: null,
      status: "ready",
      reason: null,
      candidates: cachedCandidates.slice(0, plan.policy.maxCandidates),
      usage: emptyOrientationDiscoveryUsage(),
      cache: {
        status: "hit",
        candidatesLoaded: cachedCandidates.length,
        candidatesPersisted: 0,
        ...cacheMetadata,
      },
    };
  }

  const research = await runOpenAIOrientationDiscovery(
    plan,
    discoveryQueryBudget(cachedCandidates.length),
  );

  console.info("orientation_v4_provider", JSON.stringify({
    stage: "discovery",
    provider: research.provider,
    status: research.status,
    reason: research.reason,
    requests: research.usage.requests,
    webSearchCalls: research.usage.webSearchCalls,
    candidates: research.candidates.length,
    queryBudget: discoveryQueryBudget(cachedCandidates.length),
  }));

  if (research.status === "ready" && research.candidates.length > 0) {
    const persistence = await persistOrientationDiscoveryResearch(plan, research);
    const candidates = mergeOrientationKnowledgeCandidates(
      cachedCandidates,
      research.candidates,
      plan.policy.maxCandidates,
    );

    return {
      provider: cachedCandidates.length > 0 ? "mixed" : "openai",
      model: research.model,
      status: "ready",
      reason: null,
      candidates,
      usage: research.usage,
      cache: {
        status: initialCacheStatus,
        candidatesLoaded: cachedCandidates.length,
        candidatesPersisted: persistence.persisted,
        ...cacheMetadata,
      },
    };
  }

  if (cachedCandidates.length > 0) {
    await recordOrientationKnowledgeCacheHit(plan, knowledge.entries);

    return {
      provider: "knowledge_cache",
      model: null,
      status: "ready",
      reason: null,
      candidates: cachedCandidates.slice(0, plan.policy.maxCandidates),
      usage: emptyOrientationDiscoveryUsage(),
      cache: {
        status: initialCacheStatus,
        candidatesLoaded: cachedCandidates.length,
        candidatesPersisted: 0,
        ...cacheMetadata,
      },
    };
  }

  return {
    provider: "openai",
    model: research.model,
    status: research.status,
    reason: research.reason,
    candidates: [],
    usage: research.usage,
    cache: {
      status: initialCacheStatus,
      candidatesLoaded: 0,
      candidatesPersisted: 0,
      ...cacheMetadata,
    },
  };
}
