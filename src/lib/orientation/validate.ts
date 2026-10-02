import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import {
  budgetOptions,
  degreeOptions,
  diplomaOptions,
  engineeringSpecialtyOptions,
  languageLevelOptions,
  preferredCityOptions,
  studyFieldOptions,
  studyLanguageOptions,
  tunisianBacTrackOptions,
  valuesOf,
} from "@/lib/student/profile-options";

const allowed = {
  bacTrack: new Set(valuesOf(tunisianBacTrackOptions)),
  diploma: new Set(valuesOf(diplomaOptions)),
  degree: new Set(valuesOf(degreeOptions)),
  field: new Set(valuesOf(studyFieldOptions)),
  engineeringSpecialty: new Set(valuesOf(engineeringSpecialtyOptions)),
  level: new Set(valuesOf(languageLevelOptions)),
  studyLanguage: new Set(valuesOf(studyLanguageOptions)),
  budget: new Set(valuesOf(budgetOptions)),
  city: new Set<string>(preferredCityOptions),
};

export function validatePublicOrientationAnswers(value: unknown) {
  const answers = restorePublicOrientationAnswers(value);
  const year = Number(answers.bacYear);
  const average = answers.generalAverage === "" ? null : Number(answers.generalAverage);

  if (
    answers.bacStatus !== "obtained"
    && answers.bacStatus !== "preparing"
    && answers.bacStatus !== "no_bac"
  ) return null;

  if (answers.bacStatus !== "no_bac") {
    if (!Number.isInteger(year) || year < 2000 || year > 2035) return null;
    if (!allowed.bacTrack.has(answers.bacTrack)) return null;
  } else if (answers.bacYear || answers.bacTrack || answers.generalAverage) {
    return null;
  }

  if (average !== null && (!Number.isFinite(average) || average < 0 || average > 20)) {
    return null;
  }

  if (answers.lastDiploma && !allowed.diploma.has(answers.lastDiploma)) return null;
  if (answers.bacStatus === "no_bac" && !answers.lastDiploma) return null;
  if (!allowed.degree.has(answers.targetDegree)) return null;
  if (!allowed.field.has(answers.targetField)) return null;

  if (
    answers.targetField === "Ingénierie"
    && !allowed.engineeringSpecialty.has(answers.engineeringSpecialty)
  ) return null;

  if (
    answers.targetField !== "Ingénierie"
    && answers.engineeringSpecialty
    && !allowed.engineeringSpecialty.has(answers.engineeringSpecialty)
  ) return null;

  if (!allowed.level.has(answers.germanLevel) || !allowed.level.has(answers.englishLevel)) {
    return null;
  }

  if (!allowed.studyLanguage.has(answers.studyLanguage)) return null;

  const hasIntakeSeason = answers.targetIntakeSeason !== "";
  const hasIntakeYear = answers.targetIntakeYear !== "";
  if (hasIntakeSeason !== hasIntakeYear) return null;
  if (hasIntakeSeason) {
    if (answers.targetIntakeSeason !== "winter" && answers.targetIntakeSeason !== "summer") return null;
    const intakeYear = Number(answers.targetIntakeYear);
    if (!Number.isInteger(intakeYear) || intakeYear < 2026 || intakeYear > 2035) return null;
  }

  if (!allowed.budget.has(answers.budgetRange)) return null;

  if (
    answers.preferredCities.length > 3
    || answers.preferredCities.some((city) => !allowed.city.has(city))
  ) return null;

  return answers;
}
