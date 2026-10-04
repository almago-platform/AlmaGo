import { localizePreferredCity, localizeProfileOptions } from "@/content/student-profile-copy";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import {
  degreeOptions,
  engineeringSpecialtyOptions,
  scienceSpecialtyOptions,
  studyFieldOptions,
} from "@/lib/student/profile-options";

function localizedOption(
  locale: Locale,
  value: string | null | undefined,
  options: readonly { value: string; label: string }[],
) {
  if (!value) return null;
  return localizeProfileOptions(locale, options)
    .find((option) => option.value === value)?.label || value;
}

export function localizedOrientationSpecialty(
  answers: PublicOrientationAnswers,
  locale: Locale,
) {
  if (answers.targetField === "Ingénierie" && answers.engineeringSpecialty) {
    return localizedOption(locale, answers.engineeringSpecialty, engineeringSpecialtyOptions);
  }

  if (answers.targetField === "Sciences" && answers.scienceSpecialty) {
    return localizedOption(locale, answers.scienceSpecialty, scienceSpecialtyOptions);
  }

  return null;
}

export function orientationProjectFacts(
  answers: PublicOrientationAnswers,
  locale: Locale,
) {
  const degree = localizedOption(locale, answers.targetDegree, degreeOptions);
  const field = localizedOption(locale, answers.targetField, studyFieldOptions);
  const specialty = localizedOrientationSpecialty(answers, locale);
  const cities = answers.preferredCities.length
    ? answers.preferredCities.map((city) => localizePreferredCity(locale, city)).join(", ")
    : null;
  const germanPrefix: Record<Locale, string> = {
    fr: "Allemand",
    ar: "الألمانية",
    en: "German",
    de: "Deutsch",
  };
  const german = answers.germanLevel
    ? `${germanPrefix[locale]} ${answers.germanLevel}`
    : null;
  const intake = answers.targetIntakeYear
    ? `${answers.targetIntakeSeason || ""} ${answers.targetIntakeYear}`.trim()
    : null;

  return [degree, field, specialty, cities, german, intake]
    .filter((value): value is string => Boolean(value));
}

export function orientationVersionSummary(
  answers: PublicOrientationAnswers,
  locale: Locale,
) {
  const degree = localizedOption(locale, answers.targetDegree, degreeOptions);
  const specialty = localizedOrientationSpecialty(answers, locale);
  const field = localizedOption(locale, answers.targetField, studyFieldOptions);
  const subject = specialty || field;
  const cities = answers.preferredCities.length
    ? answers.preferredCities.map((city) => localizePreferredCity(locale, city)).join(", ")
    : null;

  return [degree, subject, cities]
    .filter((value): value is string => Boolean(value))
    .join(" · ");
}
