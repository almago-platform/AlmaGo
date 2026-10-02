import "server-only";

import {
  ORIENTATION_KNOWLEDGE_FRESHNESS_DAYS,
  ORIENTATION_KNOWLEDGE_MIN_CANDIDATES,
  loadOrientationDiscoveryKnowledge,
  persistOrientationDiscoveryResearch,
  recordOrientationKnowledgeCacheHit,
} from "@/lib/orientation-engine/discovery/knowledge";
import {
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
        freshnessDays: ORIENTATION_KNOWLEDGE_FRESHNESS_DAYS,
      },
    };
  }

  const research = await runOpenAIOrientationDiscovery(plan);

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
        freshnessDays: ORIENTATION_KNOWLEDGE_FRESHNESS_DAYS,
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
        freshnessDays: ORIENTATION_KNOWLEDGE_FRESHNESS_DAYS,
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
      freshnessDays: ORIENTATION_KNOWLEDGE_FRESHNESS_DAYS,
    },
  };
}
