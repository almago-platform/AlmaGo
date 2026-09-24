import {
  budgetOptions,
  certificateOptions,
  degreeOptions,
  diplomaOptions,
  languageLevelOptions,
  nationalityOptions,
  preferredCityOptions,
  studyFieldOptions,
  studyLanguageOptions,
  tunisianBacTrackOptions,
  valuesOf,
} from "@/lib/student/profile-options";

export const languageLevels = valuesOf(languageLevelOptions);
export const certificates = valuesOf(certificateOptions);
export const degrees = valuesOf(degreeOptions);
export const fields = valuesOf(studyFieldOptions);

const stringKeys = [
  "first_name", "last_name", "birth_date", "nationality", "current_city", "phone",
  "last_diploma", "bac_track", "institution", "current_university_studies", "current_field",
  "german_level", "english_level", "french_level", "language_certificate",
  "language_certificate_other", "target_degree", "target_field", "study_language",
  "target_intake", "budget_range",
] as const;

export type ProfileInput = Record<string, unknown>;

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
}

export function profileUpdateFromInput(input: ProfileInput) {
  const update: Record<string, unknown> = {};
  for (const key of stringKeys) {
    if (key in input) {
      const value = input[key];
      update[key] = typeof value === "string" ? value.trim() || null : null;
    }
  }
  for (const key of ["bac_year", "university_semesters"] as const) {
    if (key in input) {
      const value = input[key];
      update[key] = value === "" || value === null || value === undefined ? null : Number(value);
    }
  }
  if ("general_average" in input) {
    const value = input.general_average;
    update.general_average = value === "" || value === null || value === undefined ? null : Number(value);
  }
  if ("preferred_cities" in input) {
    const cities = Array.isArray(input.preferred_cities)
      ? input.preferred_cities
      : typeof input.preferred_cities === "string" ? input.preferred_cities.split(",") : [];
    update.preferred_cities = cities.filter((city): city is string => typeof city === "string").map((city) => city.trim()).filter(Boolean).slice(0, 10);
  }
  return update;
}

export function validateProfileUpdate(update: Record<string, unknown>) {
  if (update.birth_date && (typeof update.birth_date !== "string" || !isValidDateOnly(update.birth_date))) {
    return "La date de naissance doit être une date valide au format AAAA-MM-JJ.";
  }
  if (update.general_average !== null && update.general_average !== undefined && (!Number.isFinite(update.general_average as number) || (update.general_average as number) < 0 || (update.general_average as number) > 20)) {
    return "La moyenne générale doit être comprise entre 0 et 20.";
  }
  if (update.bac_year !== null && update.bac_year !== undefined && (!Number.isInteger(update.bac_year as number) || (update.bac_year as number) < 1900 || (update.bac_year as number) > 2200)) return "L’année du Bac est invalide.";
  if (update.university_semesters !== null && update.university_semesters !== undefined && (!Number.isInteger(update.university_semesters as number) || (update.university_semesters as number) < 0 || (update.university_semesters as number) > 100)) return "Le nombre de semestres est invalide.";
  for (const key of ["german_level", "english_level", "french_level"]) if (update[key] && !languageLevels.includes(update[key] as (typeof languageLevels)[number])) return "Un niveau de langue est invalide.";
  if (update.language_certificate && !certificates.includes(update.language_certificate as (typeof certificates)[number])) return "Le certificat de langue est invalide.";
  if (update.target_degree && !degrees.includes(update.target_degree as (typeof degrees)[number])) return "Le niveau d’études est invalide.";
  if (update.target_field && !fields.includes(update.target_field as (typeof fields)[number])) return "Le domaine est invalide.";
  if (update.nationality && !valuesOf(nationalityOptions).includes(update.nationality as string)) return "La nationalité doit être choisie dans la liste.";
  if (update.bac_track && !valuesOf(tunisianBacTrackOptions).includes(update.bac_track as string)) return "La section du Bac doit être choisie dans la liste.";
  if (update.last_diploma && !valuesOf(diplomaOptions).includes(update.last_diploma as string)) return "Le dernier diplôme doit être choisi dans la liste.";
  if (update.study_language && !valuesOf(studyLanguageOptions).includes(update.study_language as string)) return "La langue d’études doit être choisie dans la liste.";
  if (update.budget_range && !valuesOf(budgetOptions).includes(update.budget_range as string)) return "Le budget doit être choisi dans la liste.";
  if (Array.isArray(update.preferred_cities) && update.preferred_cities.some((city) => !preferredCityOptions.includes(city as (typeof preferredCityOptions)[number]))) return "Une ville préférée est invalide.";
  return null;
}
