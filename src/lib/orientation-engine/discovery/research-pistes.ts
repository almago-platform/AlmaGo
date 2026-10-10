import { canonicalOrientationCity, orientationCityDistanceKm, orientationCityLand } from "@/lib/orientation-engine/geography";

/** Public-facing, informational-only options from prior official-site research. */
export type ResearchPiste = {
  institution: string;
  programme: string;
  city: string | null;
  teachingLanguage: string | null;
  officialUrl: string;
};

export type ResearchPisteRow = ResearchPiste & {
  degree: string | null;
  familyIds: string[];
  verificationStatus: string;
  researchStatus: string;
};

export type ResearchPisteCriteria = {
  targetDegree: "Bachelor" | "Master";
  targetField: string;
  preferredCities: string[];
  studyLanguage: string;
  targetSpecialization: string | null;
  engineeringSpecialty: string | null;
  scienceSpecialty: string | null;
  bacStatus: string;
};

export const researchPisteFamilies: Record<string, readonly string[]> = {
  "Lettres/Langues": ["languages_humanities"],
  Informatique: ["computer_science", "computer_engineering"],
  "Économie/Gestion": ["business_economics"],
  Architecture: ["architecture"],
  Sciences: ["natural_sciences", "biology_life_sciences", "chemistry", "physics", "mathematics", "earth_environment"],
  "Médecine/Santé": ["medicine_health"],
  Ingénierie: ["computer_engineering", "electrical_electronics", "mechanical_engineering", "mechatronics_robotics", "civil_engineering", "industrial_production", "automotive_engineering", "aerospace_engineering", "energy_engineering"],
};

export function researchFamiliesFor(criteria: ResearchPisteCriteria) {
  if (criteria.targetField === "Ingénierie") {
    const specialtyFamilies: Record<string, string[]> = {
      computer_engineering: ["computer_engineering"],
      electrical_electronics: ["electrical_electronics"],
      mechanical: ["mechanical_engineering"],
      civil: ["civil_engineering"],
      aerospace: ["aerospace_engineering"],
      energy: ["energy_engineering"],
      automotive: ["automotive_engineering", "mechanical_automotive", "mechatronics_automotive"],
      mechatronics_robotics: ["mechatronics_robotics"],
      industrial_production: ["industrial_production"],
    };
    return specialtyFamilies[criteria.engineeringSpecialty || ""] || [...researchPisteFamilies.Ingénierie];
  }
  if (criteria.targetField === "Sciences") {
    const specialtyFamilies: Record<string, string[]> = {
      biology_life_sciences: ["biology_life_sciences"],
      chemistry: ["chemistry"],
      physics: ["physics"],
      mathematics_sciences: ["mathematics"],
      earth_environment: ["earth_environment"],
    };
    return specialtyFamilies[criteria.scienceSpecialty || ""] || [...researchPisteFamilies.Sciences];
  }
  return [...(researchPisteFamilies[criteria.targetField] || [])];
}

function normalize(value: string | null | undefined) {
  return (value || "").trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ");
}

function validOfficialProgrammeUrl(value: string) {
  try {
    const uri = new URL(value);
    // A research catalogue entry is not sufficient unless it points to a
    // directly usable official university programme page.
    const host = uri.hostname.toLowerCase();
    return uri.protocol === "https:"
      && (host.endsWith(".de") || host.endsWith(".edu") || host.endsWith(".ac.uk"))
      && host !== "localhost";
  } catch { return false; }
}

export function chooseDocumentedResearchPistes(
  rows: readonly ResearchPisteRow[],
  criteria: ResearchPisteCriteria,
  maxItems = 3,
): ResearchPiste[] {
  // A candidate with no Bac must follow the academic-route review, not a
  // regular Bachelor university shortlist.
  if (criteria.bacStatus === "no_bac") return [];
  const families = researchFamiliesFor(criteria);
  if (!families.length) return [];
  const preferences = criteria.preferredCities.slice(0, 3).map(canonicalOrientationCity);
  const preferredRegion = new Set(preferences.map(orientationCityLand).filter(Boolean));
  const wantsGerman = criteria.studyLanguage === "Allemand";
  const wantsEnglish = criteria.studyLanguage === "Anglais";
  const wantedSpecialization = criteria.targetDegree === "Master"
    ? normalize(criteria.targetSpecialization) : "";

  const viable = rows.filter((entry) => {
    if (!entry.familyIds.some((family) => families.includes(family))) return false;
    if (!normalize(entry.degree).includes(normalize(criteria.targetDegree))) return false;
    if (!["verified", "needs_review", "unverified"].includes(entry.verificationStatus)) return false;
    if (!["research_candidate", "promoted"].includes(entry.researchStatus)) return false;
    if (!entry.institution || !entry.programme || !entry.officialUrl
      || !validOfficialProgrammeUrl(entry.officialUrl)) return false;
    if (wantedSpecialization && !normalize(entry.programme).includes(wantedSpecialization)) return false;
    return true;
  });

  const withScore = viable.map((entry) => {
    const city = canonicalOrientationCity(entry.city);
    const cityMatch = preferences.includes(city);
    const distances = preferences
      .map((preferred) => orientationCityDistanceKm(preferred, entry.city))
      .filter((distance): distance is number => distance !== null);
    const nearest = distances.length ? Math.min(...distances) : null;
    const local = preferences.length === 0 ? 0 : cityMatch ? 450
      : nearest !== null && nearest <= 100 ? 300
      : preferredRegion.has(orientationCityLand(entry.city)) ? 200
      : 0;
    const verified = entry.verificationStatus === "verified" ? 24
      : entry.verificationStatus === "needs_review" ? 12 : 0;
    const language = normalize(entry.teachingLanguage);
    const languageScore = !language ? 0
      : wantsGerman && /german|deutsch|allemand/.test(language) ? 8
      : wantsEnglish && /english|englisch|anglais/.test(language) ? 8
      : 0;
    return { entry, score: local + verified + languageScore };
  }).sort((a, b) =>
    b.score - a.score
    || a.entry.institution.localeCompare(b.entry.institution)
    || a.entry.programme.localeCompare(b.entry.programme)
  );

  const result: ResearchPiste[] = [];
  const seenProgrammes = new Set<string>();
  const seenUniversities = new Set<string>();
  // First pass: three different institutions whenever the evidence permits.
  // Subsequent pass: multiple degree programmes from one institution if needed.
  for (const uniqueUniversity of [true, false]) {
    for (const { entry } of withScore) {
      const institution = normalize(entry.institution)
        .replace(/\s*\(fau\)\s*$/, "").replace(/\s*\(.*?\)\s*$/, "");
      const identity = `${institution}|${normalize(entry.city)}`;
      const programme = `${identity}|${normalize(entry.programme)}`;
      if (seenProgrammes.has(programme) || (uniqueUniversity && seenUniversities.has(identity))) continue;
      seenProgrammes.add(programme);
      seenUniversities.add(identity);
      result.push({
        institution: entry.institution,
        programme: entry.programme,
        city: entry.city,
        teachingLanguage: entry.teachingLanguage,
        officialUrl: entry.officialUrl,
      });
      if (result.length >= Math.min(3, maxItems)) return result;
    }
  }
  return result;
}
