import { createHash } from "node:crypto";

import type {
  OrientationDiscoveryPlan,
  OrientationDiscoveryResearchCandidate,
} from "@/lib/orientation-engine/discovery/types";

function normalized(value: string | null) {
  return (value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

function stableJson(value: unknown) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, stableJson(item)]),
  );
}

function sha256(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(stableJson(value)))
    .digest("hex");
}

export function buildOrientationDiscoveryProfileFingerprint(
  plan: OrientationDiscoveryPlan,
) {
  return sha256({
    targetDegree: plan.profile.targetDegree,
    targetField: plan.profile.targetField,
    engineeringSpecialty: plan.profile.engineeringSpecialty,
    germanLevel: plan.profile.germanLevel,
    englishLevel: plan.profile.englishLevel,
    studyLanguage: plan.profile.studyLanguage,
    targetIntakeSeason: plan.profile.targetIntakeSeason,
    targetIntakeYear: plan.profile.targetIntakeYear,
    budgetRange: plan.profile.budgetRange,
    preferredCities: [...plan.profile.preferredCities].sort(),
    programmeFamilyIds: plan.programmeFamilies.map((family) => family.id).sort(),
  });
}

export function buildOrientationResearchProgrammeDedupeKey(
  candidate: OrientationDiscoveryResearchCandidate,
) {
  return sha256({
    institution: normalized(candidate.institution),
    programme: normalized(candidate.programme),
    degree: normalized(candidate.degree),
  });
}

export function buildOrientationDiscoverySearchContext(
  plan: OrientationDiscoveryPlan,
) {
  return {
    targetDegree: plan.profile.targetDegree,
    targetField: plan.profile.targetField,
    engineeringSpecialty: plan.profile.engineeringSpecialty,
    germanLevel: plan.profile.germanLevel,
    englishLevel: plan.profile.englishLevel,
    studyLanguage: plan.profile.studyLanguage,
    targetIntakeSeason: plan.profile.targetIntakeSeason,
    targetIntakeYear: plan.profile.targetIntakeYear,
    budgetRange: plan.profile.budgetRange,
    preferredCities: plan.profile.preferredCities,
  };
}

export function orientationDegreeCompatible(
  targetDegree: string | null,
  candidateDegree: string | null,
) {
  if (!targetDegree || !candidateDegree) return true;
  return normalized(candidateDegree).includes(normalized(targetDegree));
}

export function mergeOrientationKnowledgeCandidates(
  cached: readonly OrientationDiscoveryResearchCandidate[],
  researched: readonly OrientationDiscoveryResearchCandidate[],
  limit = 20,
) {
  const map = new Map<string, OrientationDiscoveryResearchCandidate>();

  for (const candidate of [...cached, ...researched]) {
    const key = buildOrientationResearchProgrammeDedupeKey(candidate);
    const current = map.get(key);
    if (!current) {
      map.set(key, candidate);
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
      ])].slice(0, 8),
    });
  }

  return [...map.values()].slice(0, limit);
}
