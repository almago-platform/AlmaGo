import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationDiscoveryPlan,
  OrientationDiscoveryPolicy,
  OrientationDiscoveryProfile,
  OrientationDiscoveryResearchCandidate,
  OrientationProgrammeFamily,
} from "@/lib/orientation-engine/discovery/types";

export const DISCOVERY_MAX_SEARCH_QUERIES = 8;
export const DISCOVERY_MAX_CANDIDATES = 20;
export const DISCOVERY_MAX_SOURCE_URLS_PER_CANDIDATE = 8;

export const ORIENTATION_DISCOVERY_POLICY: OrientationDiscoveryPolicy = {
  maxSearchQueries: DISCOVERY_MAX_SEARCH_QUERIES,
  maxCandidates: DISCOVERY_MAX_CANDIDATES,
  maxSourceUrlsPerCandidate: DISCOVERY_MAX_SOURCE_URLS_PER_CANDIDATE,
  sourcePriority: [
    "official_programme",
    "official_university",
    "official_registry",
    "discovery_only",
  ],
  campusOffersStudienkolleg: false,
  studienkollegHandling: "flag_and_review",
};

const programmeFamiliesByField: Record<string, OrientationProgrammeFamily[]> = {
  Informatique: [
    {
      id: "computer_science",
      label: "Computer Science / Informatics",
      aliases: ["Computer Science", "Informatics", "Informatik", "Software Engineering"],
    },
    {
      id: "computer_engineering",
      label: "Computer Engineering",
      aliases: ["Computer Engineering", "Information Engineering"],
    },
  ],
  "Économie/Gestion": [
    {
      id: "business_economics",
      label: "Business / Economics",
      aliases: ["Business Administration", "Economics", "Management", "Wirtschaftswissenschaften"],
    },
  ],
  Architecture: [
    {
      id: "architecture",
      label: "Architecture",
      aliases: ["Architecture", "Architektur"],
    },
  ],
  Sciences: [
    {
      id: "natural_sciences",
      label: "Natural Sciences",
      aliases: ["Natural Sciences", "Mathematics", "Physics", "Chemistry", "Biology"],
    },
  ],
  "Médecine/Santé": [
    {
      id: "medicine_health",
      label: "Medicine / Health",
      aliases: ["Medicine", "Medizin", "Health Sciences", "Gesundheitswissenschaften"],
    },
  ],
  "Lettres/Langues": [
    {
      id: "languages_humanities",
      label: "Languages / Humanities",
      aliases: ["Languages", "Literature", "Linguistics", "Humanities", "Geisteswissenschaften"],
    },
  ],
  other: [
    {
      id: "other_field",
      label: "Other field",
      aliases: ["Bachelor programme"],
    },
  ],
};

const engineeringFamiliesBySpecialty: Record<string, OrientationProgrammeFamily[]> = {
  computer_engineering: [
    {
      id: "computer_engineering",
      label: "Computer Engineering",
      aliases: [
        "Computer Engineering",
        "Information Engineering",
        "Informatics",
        "Informatik",
        "Electrical Engineering and Information Technology",
      ],
    },
  ],
  electrical_electronics: [
    {
      id: "electrical_electronics",
      label: "Electrical / Electronics Engineering",
      aliases: [
        "Electrical Engineering",
        "Electronics Engineering",
        "Elektrotechnik",
        "Information Technology",
      ],
    },
  ],
  mechanical: [
    {
      id: "mechanical_engineering",
      label: "Mechanical Engineering",
      aliases: ["Mechanical Engineering", "Maschinenbau"],
    },
  ],
  mechatronics_robotics: [
    {
      id: "mechatronics_robotics",
      label: "Mechatronics / Robotics",
      aliases: ["Mechatronics", "Mechatronik", "Robotics", "Robotik"],
    },
  ],
  civil: [
    {
      id: "civil_engineering",
      label: "Civil Engineering",
      aliases: ["Civil Engineering", "Bauingenieurwesen"],
    },
  ],
  industrial_production: [
    {
      id: "industrial_production",
      label: "Industrial / Production Engineering",
      aliases: [
        "Industrial Engineering",
        "Production Engineering",
        "Manufacturing Engineering",
        "Wirtschaftsingenieurwesen",
        "Produktionstechnik",
      ],
    },
  ],
  automotive: [
    {
      id: "automotive_engineering",
      label: "Automotive / Vehicle Engineering",
      aliases: ["Automotive Engineering", "Vehicle Engineering", "Fahrzeugtechnik"],
    },
    {
      id: "mechanical_automotive",
      label: "Mechanical Engineering with automotive relevance",
      aliases: [
        "Mechanical Engineering automotive",
        "Maschinenbau Fahrzeugtechnik",
        "Mechanical Engineering vehicle technology",
      ],
    },
    {
      id: "mechatronics_automotive",
      label: "Mechatronics",
      aliases: ["Mechatronics automotive", "Mechatronik Fahrzeugtechnik"],
    },
  ],
  aerospace: [
    {
      id: "aerospace_engineering",
      label: "Aerospace Engineering",
      aliases: [
        "Aerospace Engineering",
        "Aeronautical Engineering",
        "Luft- und Raumfahrttechnik",
      ],
    },
  ],
  energy: [
    {
      id: "energy_engineering",
      label: "Energy Engineering",
      aliases: ["Energy Engineering", "Energietechnik", "Renewable Energy Engineering"],
    },
  ],
  undecided: [
    {
      id: "broad_engineering",
      label: "Broad Engineering",
      aliases: [
        "Engineering",
        "Ingenieurwissenschaften",
        "Mechanical Engineering",
        "Electrical Engineering",
        "Mechatronics",
      ],
    },
  ],
  other: [
    {
      id: "other_engineering",
      label: "Other Engineering",
      aliases: ["Engineering", "Ingenieurwissenschaften"],
    },
  ],
};

function cleanString(value: unknown, maxLength = 120) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!cleaned) return null;
  return cleaned.slice(0, maxLength);
}

function cleanNumber(
  value: unknown,
  {
    min,
    max,
    integer = false,
  }: { min: number; max: number; integer?: boolean },
) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (String(value).trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  if (integer && !Number.isInteger(parsed)) return null;
  return parsed;
}

export function normalizeOrientationDiscoveryProfile(
  answers: PublicOrientationAnswers,
): OrientationDiscoveryProfile {
  return {
    bacStatus: answers.bacStatus || "unknown",
    bacYear: cleanNumber(answers.bacYear, { min: 2000, max: 2035, integer: true }),
    bacTrack: cleanString(answers.bacTrack),
    averageOutOf20: cleanNumber(answers.generalAverage, { min: 0, max: 20 }),
    averageType: answers.averageType || null,
    lastDiploma: cleanString(answers.lastDiploma),
    targetDegree: cleanString(answers.targetDegree),
    targetField: cleanString(answers.targetField),
    engineeringSpecialty: cleanString(answers.engineeringSpecialty),
    germanLevel: cleanString(answers.germanLevel, 16),
    englishLevel: cleanString(answers.englishLevel, 16),
    studyLanguage: cleanString(answers.studyLanguage, 40),
    targetIntakeSeason: answers.targetIntakeSeason || null,
    targetIntakeYear: cleanNumber(answers.targetIntakeYear, {
      min: 2020,
      max: 2040,
      integer: true,
    }),
    budgetRange: cleanString(answers.budgetRange, 80),
    preferredCities: [...new Set(
      (answers.preferredCities || [])
        .map((city) => cleanString(city, 80))
        .filter((city): city is string => Boolean(city)),
    )].slice(0, 3),
  };
}

export function resolveOrientationProgrammeFamilies(
  profile: OrientationDiscoveryProfile,
): OrientationProgrammeFamily[] {
  if (profile.targetField === "Ingénierie") {
    return engineeringFamiliesBySpecialty[
      profile.engineeringSpecialty || "undecided"
    ] || engineeringFamiliesBySpecialty.other;
  }

  return programmeFamiliesByField[profile.targetField || "other"]
    || programmeFamiliesByField.other;
}

function uniqueAliases(families: OrientationProgrammeFamily[]) {
  const seen = new Set<string>();
  const aliases: string[] = [];

  for (const family of families) {
    for (const alias of family.aliases) {
      const key = alias.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      aliases.push(alias.trim());
    }
  }

  return aliases;
}

export function buildOrientationDiscoverySearchQueries(
  profile: OrientationDiscoveryProfile,
  families: OrientationProgrammeFamily[],
) {
  const degree = profile.targetDegree || "Bachelor";
  const aliases = uniqueAliases(families);
  const queries: string[] = [];

  for (const alias of aliases) {
    queries.push(`${alias} ${degree} Germany official university programme`);
    if (queries.length >= DISCOVERY_MAX_SEARCH_QUERIES) return queries;
  }

  const primaryAlias = aliases[0];
  if (primaryAlias) {
    for (const city of profile.preferredCities) {
      const query = `${primaryAlias} ${degree} ${city} official university programme`;
      if (!queries.includes(query)) queries.push(query);
      if (queries.length >= DISCOVERY_MAX_SEARCH_QUERIES) break;
    }
  }

  return queries.slice(0, DISCOVERY_MAX_SEARCH_QUERIES);
}

export function buildOrientationDiscoveryPlan(
  answers: PublicOrientationAnswers,
): OrientationDiscoveryPlan {
  const profile = normalizeOrientationDiscoveryProfile(answers);
  const programmeFamilies = resolveOrientationProgrammeFamilies(profile);

  if (!profile.targetDegree) {
    return {
      status: "profile_incomplete",
      reason: "target_degree_missing",
      profile,
      programmeFamilies,
      searchQueries: [],
      policy: ORIENTATION_DISCOVERY_POLICY,
    };
  }

  if (!profile.targetField) {
    return {
      status: "profile_incomplete",
      reason: "target_field_missing",
      profile,
      programmeFamilies,
      searchQueries: [],
      policy: ORIENTATION_DISCOVERY_POLICY,
    };
  }

  if (profile.bacStatus === "no_bac") {
    return {
      status: "route_requires_review",
      reason: "no_bac_requires_route_review",
      profile,
      programmeFamilies,
      searchQueries: [],
      policy: ORIENTATION_DISCOVERY_POLICY,
    };
  }

  return {
    status: "ready",
    reason: null,
    profile,
    programmeFamilies,
    searchQueries: buildOrientationDiscoverySearchQueries(profile, programmeFamilies),
    policy: ORIENTATION_DISCOVERY_POLICY,
  };
}

function cleanUrl(value: unknown) {
  const url = cleanString(value, 2048);
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function createOrientationResearchCandidate(input: {
  institution?: unknown;
  programme?: unknown;
  degree?: unknown;
  city?: unknown;
  teachingLanguage?: unknown;
  officialProgrammeUrl?: unknown;
  officialUniversityUrl?: unknown;
  discoveryReason?: unknown;
  sourceUrls?: unknown;
}): OrientationDiscoveryResearchCandidate | null {
  const institution = cleanString(input.institution, 180);
  const programme = cleanString(input.programme, 220);
  const discoveryReason = cleanString(input.discoveryReason, 500);

  if (!institution || !programme || !discoveryReason) return null;

  const sourceUrls = Array.isArray(input.sourceUrls)
    ? [...new Set(
        input.sourceUrls
          .map(cleanUrl)
          .filter((url): url is string => Boolean(url)),
      )].slice(0, DISCOVERY_MAX_SOURCE_URLS_PER_CANDIDATE)
    : [];

  return {
    institution,
    programme,
    degree: cleanString(input.degree, 80),
    city: cleanString(input.city, 120),
    teachingLanguage: cleanString(input.teachingLanguage, 120),
    officialProgrammeUrl: cleanUrl(input.officialProgrammeUrl),
    officialUniversityUrl: cleanUrl(input.officialUniversityUrl),
    discoveryReason,
    sourceUrls,
    status: "research_candidate",
  };
}
