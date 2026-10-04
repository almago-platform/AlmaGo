import { createHash } from "node:crypto";

import type {
  OrientationDiscoveryPlan,
  OrientationDiscoveryResearchCandidate,
} from "@/lib/orientation-engine/discovery/types";

function normalized(value: string | null) {
  return (value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

function stableJson(value: unknown): unknown {
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
    higherEducationStatus: plan.profile.higherEducationStatus,
    currentStudyField: plan.profile.currentStudyField,
    universitySemesters: plan.profile.universitySemesters,
    studyIntent: plan.profile.studyIntent,
    targetSpecialization: plan.profile.targetSpecialization,
    targetDegree: plan.profile.targetDegree,
    targetField: plan.profile.targetField,
    engineeringSpecialty: plan.profile.engineeringSpecialty,
    scienceSpecialty: plan.profile.scienceSpecialty,
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

function canonicalUniversityHost(value: string | null) {
  if (!value) return null;

  try {
    const hostname = new URL(value).hostname
      .trim()
      .toLocaleLowerCase("en")
      .replace(/^www\./, "");
    return hostname || null;
  } catch {
    return null;
  }
}

export function buildOrientationResearchUniversityDedupeKey(
  candidate: Pick<
    OrientationDiscoveryResearchCandidate,
    "institution" | "city" | "officialUniversityUrl"
  >,
) {
  const host = canonicalUniversityHost(candidate.officialUniversityUrl);
  if (host) return `host:${host}`;

  return [
    "name:",
    normalized(candidate.institution),
    "|city:",
    normalized(candidate.city),
  ].join("");
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
    higherEducationStatus: plan.profile.higherEducationStatus,
    currentStudyField: plan.profile.currentStudyField,
    universitySemesters: plan.profile.universitySemesters,
    studyIntent: plan.profile.studyIntent,
    targetSpecialization: plan.profile.targetSpecialization,
    targetDegree: plan.profile.targetDegree,
    targetField: plan.profile.targetField,
    engineeringSpecialty: plan.profile.engineeringSpecialty,
    scienceSpecialty: plan.profile.scienceSpecialty,
    germanLevel: plan.profile.germanLevel,
    englishLevel: plan.profile.englishLevel,
    studyLanguage: plan.profile.studyLanguage,
    targetIntakeSeason: plan.profile.targetIntakeSeason,
    targetIntakeYear: plan.profile.targetIntakeYear,
    budgetRange: plan.profile.budgetRange,
    preferredCities: plan.profile.preferredCities,
  };
}



export type OrientationDiscoveryRefreshWindow = {
  cycle: `summer_${number}` | `winter_${number}`;
  lastMajorRefreshAt: string;
  nextMajorRefreshAt: string;
};

function refreshBoundary(year: number, monthIndex: 3 | 9) {
  return new Date(Date.UTC(year, monthIndex, 15, 0, 0, 0, 0));
}

export function getOrientationDiscoveryRefreshWindow(
  now = new Date(),
): OrientationDiscoveryRefreshWindow {
  const year = now.getUTCFullYear();
  const april15 = refreshBoundary(year, 3);
  const october15 = refreshBoundary(year, 9);

  if (now < april15) {
    const previousOctober = refreshBoundary(year - 1, 9);
    return {
      cycle: `winter_${year - 1}`,
      lastMajorRefreshAt: previousOctober.toISOString(),
      nextMajorRefreshAt: april15.toISOString(),
    };
  }

  if (now < october15) {
    return {
      cycle: `summer_${year}`,
      lastMajorRefreshAt: april15.toISOString(),
      nextMajorRefreshAt: october15.toISOString(),
    };
  }

  const nextApril = refreshBoundary(year + 1, 3);
  return {
    cycle: `winter_${year}`,
    lastMajorRefreshAt: october15.toISOString(),
    nextMajorRefreshAt: nextApril.toISOString(),
  };
}

export function orientationDegreeCompatible(
  targetDegree: string | null,
  candidateDegree: string | null,
) {
  if (!targetDegree || !candidateDegree) return true;
  return normalized(candidateDegree).includes(normalized(targetDegree));
}

function masterTargetSpecializationCovered(
  plan: OrientationDiscoveryPlan,
  candidates: readonly OrientationDiscoveryResearchCandidate[],
) {
  if (!normalized(plan.profile.targetDegree).includes("master")) return true;

  const target = normalized(plan.profile.targetSpecialization);
  if (!target) return true;

  const targetPhrases = target
    .split(/\s+(?:and|und|et)\s+|[\/,&;+]+/)
    .map((value) => value.trim())
    .filter((value) => value.length >= 6);

  return candidates.some((candidate) => {
    const programme = normalized(candidate.programme);
    if (!programme) return false;
    if (programme.includes(target)) return true;
    return targetPhrases.some((phrase) => programme.includes(phrase));
  });
}

export function orientationKnowledgeCoverageSufficient(
  plan: OrientationDiscoveryPlan,
  candidates: readonly OrientationDiscoveryResearchCandidate[],
  minimumCandidates: number,
) {
  if (candidates.length < minimumCandidates) return false;

  if (!masterTargetSpecializationCovered(plan, candidates)) return false;

  if (plan.profile.preferredCities.length > 0) {
    const preferred = new Set(
      plan.profile.preferredCities.map((city) => normalized(city)),
    );
    const hasPreferredCity = candidates.some(
      (candidate) =>
        candidate.city
        && preferred.has(normalized(candidate.city)),
    );

    if (!hasPreferredCity) return false;
  }

  return true;
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
      universityMedia:
        candidate.universityMedia?.coverImageUrl
          ? candidate.universityMedia
          : current.universityMedia || candidate.universityMedia || null,
    });
  }

  return [...map.values()].slice(0, limit);
}
