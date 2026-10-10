import type { ResearchPiste } from "@/lib/orientation-engine/discovery/research-pistes";

type ShortlistIdentity = {
  institution: string;
  programme: string;
  city: string | null;
};

function normalized(value: string | null | undefined) {
  return (value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").trim();
}

export function researchInstitutionKey(institution: string, city: string | null) {
  const normalizedName = normalized(institution);
  const normalizedCity = normalized(city);
  // Joint-degree programmes may include a partner university in their title.
  // They are not a separate German institution: identify the host campus.
  const host = normalizedName.replace(/ (?:and|und|et|y) (?:universidad|university|universitat|universite) .+$/, "");
  if (/^friedrich alexander universitat erlangen nurnberg(?: fau)?$/.test(host)
    || /^fau erlangen(?: nurnberg)?$/.test(host)) {
    return "erlangen|friedrich-alexander-universitat";
  }
  if (["otto friedrich universitat bamberg", "university of bamberg",
    "universitat bamberg", "universite de bamberg"].includes(host)) {
    return "bamberg|otto-friedrich-universitat";
  }
  return `${normalizedCity}|${host}`;
}

function sameInstitution(a: ShortlistIdentity, b: ShortlistIdentity) {
  if (researchInstitutionKey(a.institution, a.city) === researchInstitutionKey(b.institution, b.city)) return true;
  const left = normalized(a.institution);
  const right = normalized(b.institution);
  if (left === right) return true;
  if (!left || !right || normalized(a.city) !== normalized(b.city)) return false;

  // Named German universities sometimes have an international alias, e.g.
  // "Otto-Friedrich-Universität Bamberg" / "University of Bamberg".
  // Only collapse this alias when the complete city name is present in both
  // institution titles and one uses the generic "University of <City>" form.
  const city = normalized(a.city);
  if (!city || city.length < 5 || !left.includes(city) || !right.includes(city)) return false;
  const genericCityName = (name: string) =>
    name === `university of ${city}`
    || name === `universitat ${city}`
    || name === `universite de ${city}`;
  return genericCityName(left) || genericCityName(right);
}

/** Add research-only choices to a shortlist without rewriting verified choices. */
export function filterSupplementalResearchPistes(
  candidates: readonly ResearchPiste[],
  selected: readonly ShortlistIdentity[],
  maxTotal = 3,
): ResearchPiste[] {
  const result: ResearchPiste[] = [];
  for (const candidate of candidates) {
    if (selected.length + result.length >= maxTotal) break;
    if (!candidate.institution || !candidate.programme || !candidate.officialUrl) continue;
    if ([...selected, ...result].some((item) =>
      sameInstitution(candidate, item)
      || (normalized(candidate.city) === normalized(item.city)
        && normalized(candidate.programme) === normalized(item.programme))
    )) continue;
    result.push(candidate);
  }
  return result;
}
