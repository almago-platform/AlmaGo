import {
  createOrientationResearchCandidate,
  DISCOVERY_MAX_CANDIDATES,
  DISCOVERY_MAX_SOURCE_URLS_PER_CANDIDATE,
} from "@/lib/orientation-engine/discovery/contract";
import type {
  OrientationDiscoveryResearchCandidate,
  OrientationDiscoveryUsage,
} from "@/lib/orientation-engine/discovery/types";

function canonicalUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return null;
    parsed.hash = "";
    const normalized = parsed.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    return null;
  }
}

function groundedUrl(value: unknown, sourceUrls: readonly string[]) {
  if (typeof value !== "string") return null;
  const candidate = canonicalUrl(value.trim());
  if (!candidate) return null;
  const allowed = new Set(
    sourceUrls
      .map(canonicalUrl)
      .filter((url): url is string => Boolean(url)),
  );
  return allowed.has(candidate) ? candidate : null;
}

function groundedSourceUrls(values: unknown, sourceUrls: readonly string[]) {
  if (!Array.isArray(values)) return [];
  const allowed = new Set(
    sourceUrls
      .map(canonicalUrl)
      .filter((url): url is string => Boolean(url)),
  );

  return [...new Set(
    values
      .filter((value): value is string => typeof value === "string")
      .map(canonicalUrl)
      .filter((url): url is string => Boolean(url) && allowed.has(url)),
  )].slice(0, DISCOVERY_MAX_SOURCE_URLS_PER_CANDIDATE);
}

export function createGroundedOrientationResearchCandidate(
  input: {
    institution?: unknown;
    programme?: unknown;
    degree?: unknown;
    city?: unknown;
    teachingLanguage?: unknown;
    officialProgrammeUrl?: unknown;
    officialUniversityUrl?: unknown;
    discoveryReason?: unknown;
    sourceUrls?: unknown;
  },
  webSourceUrls: readonly string[],
) {
  return createOrientationResearchCandidate({
    ...input,
    officialProgrammeUrl: groundedUrl(input.officialProgrammeUrl, webSourceUrls),
    officialUniversityUrl: groundedUrl(input.officialUniversityUrl, webSourceUrls),
    sourceUrls: groundedSourceUrls(input.sourceUrls, webSourceUrls),
  });
}

function candidateKey(candidate: OrientationDiscoveryResearchCandidate) {
  return [
    candidate.institution.trim().toLocaleLowerCase("en"),
    candidate.programme.trim().toLocaleLowerCase("en"),
  ].join("::");
}

export function dedupeOrientationResearchCandidates(
  candidates: readonly OrientationDiscoveryResearchCandidate[],
  limit = DISCOVERY_MAX_CANDIDATES,
) {
  const map = new Map<string, OrientationDiscoveryResearchCandidate>();

  for (const candidate of candidates) {
    const key = candidateKey(candidate);
    const current = map.get(key);

    if (!current) {
      map.set(key, candidate);
      if (map.size >= limit) break;
      continue;
    }

    map.set(key, {
      ...current,
      degree: current.degree || candidate.degree,
      city: current.city || candidate.city,
      teachingLanguage: current.teachingLanguage || candidate.teachingLanguage,
      officialProgrammeUrl:
        current.officialProgrammeUrl || candidate.officialProgrammeUrl,
      officialUniversityUrl:
        current.officialUniversityUrl || candidate.officialUniversityUrl,
      sourceUrls: [...new Set([
        ...current.sourceUrls,
        ...candidate.sourceUrls,
      ])].slice(0, DISCOVERY_MAX_SOURCE_URLS_PER_CANDIDATE),
    });
  }

  return [...map.values()].slice(0, limit);
}

export function emptyOrientationDiscoveryUsage(): OrientationDiscoveryUsage {
  return {
    requests: 0,
    webSearchCalls: 0,
    queriesAttempted: 0,
    queriesSucceeded: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    sourceUrlsSeen: 0,
    durationMs: 0,
  };
}

export function mergeOrientationDiscoveryUsage(
  ...items: readonly OrientationDiscoveryUsage[]
): OrientationDiscoveryUsage {
  return items.reduce<OrientationDiscoveryUsage>(
    (total, item) => ({
      requests: total.requests + item.requests,
      webSearchCalls: total.webSearchCalls + item.webSearchCalls,
      queriesAttempted: total.queriesAttempted + item.queriesAttempted,
      queriesSucceeded: total.queriesSucceeded + item.queriesSucceeded,
      inputTokens: total.inputTokens + item.inputTokens,
      outputTokens: total.outputTokens + item.outputTokens,
      totalTokens: total.totalTokens + item.totalTokens,
      sourceUrlsSeen: total.sourceUrlsSeen + item.sourceUrlsSeen,
      durationMs: total.durationMs + item.durationMs,
    }),
    emptyOrientationDiscoveryUsage(),
  );
}
