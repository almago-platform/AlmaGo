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
import { orientationScopeContainsCity } from "@/lib/orientation-engine/geography";
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

function candidatesForGeographicScope(
  plan: OrientationDiscoveryPlan,
  candidates: OrientationDiscoveryResult["candidates"],
) {
  if (!plan.geographicScope) return [...candidates];
  return candidates.filter((candidate) =>
    orientationScopeContainsCity(plan.geographicScope!, candidate.city)
  );
}

function planForCoverage(plan: OrientationDiscoveryPlan): OrientationDiscoveryPlan {
  if (!plan.geographicScope) return plan;

  const preferredCities =
    plan.geographicScope.tier === "germany"
      ? []
      : plan.geographicScope.cities;

  return {
    ...plan,
    profile: {
      ...plan.profile,
      preferredCities,
    },
  };
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
  const cachedCandidates = candidatesForGeographicScope(
    plan,
    knowledge.entries.map((entry) => entry.candidate),
  );
  const coveragePlan = planForCoverage(plan);
  const initialCacheStatus = cacheStatus(
    knowledge.available,
    cachedCandidates.length,
  );

  if (
    plan.status === "ready"
    && knowledge.available
    && orientationKnowledgeCoverageSufficient(
      coveragePlan,
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
  const scopedResearchCandidates = candidatesForGeographicScope(
    plan,
    research.candidates,
  );
  const scopedResearch = {
    ...research,
    status:
      research.status === "ready" && scopedResearchCandidates.length === 0
        ? "unavailable" as const
        : research.status,
    reason:
      research.status === "ready" && scopedResearchCandidates.length === 0
        ? "provider_error" as const
        : research.reason,
    candidates: scopedResearchCandidates,
  };

  console.info("orientation_v4_provider", JSON.stringify({
    stage: "discovery",
    provider: scopedResearch.provider,
    status: scopedResearch.status,
    reason: scopedResearch.reason,
    requests: scopedResearch.usage.requests,
    webSearchCalls: scopedResearch.usage.webSearchCalls,
    candidates: scopedResearch.candidates.length,
    geographicTier: plan.geographicScope?.tier || null,
    queryBudget: discoveryQueryBudget(cachedCandidates.length),
  }));

  if (scopedResearch.status === "ready" && scopedResearch.candidates.length > 0) {
    const persistence = await persistOrientationDiscoveryResearch(plan, scopedResearch);
    const candidates = mergeOrientationKnowledgeCandidates(
      cachedCandidates,
      persistence.candidates.length > 0
        ? persistence.candidates
        : scopedResearch.candidates,
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
    model: scopedResearch.model,
    status: scopedResearch.status,
    reason: scopedResearch.reason,
    candidates: [],
    usage: scopedResearch.usage,
    cache: {
      status: initialCacheStatus,
      candidatesLoaded: 0,
      candidatesPersisted: 0,
      ...cacheMetadata,
    },
  };
}
