import type { OrientationProgrammeEvaluation, OrientationRuleCode } from "@/lib/orientation-engine/types";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";

type Locale = "fr" | "ar" | "en" | "de";

const copy = {
  fr: {
    engineeringFocus: "Vous pouvez y découvrir une formation intitulée Information Engineering, à la croisée de l'informatique et de l'ingénierie.",
    computerScienceFocus: "Cette formation porte directement sur les sciences informatiques.",
    start: (city: string) => `À ${city}, `,
    project: "cette formation rejoint le niveau et le domaine d'études que vous recherchez.",
    open: "cette formation est une piste supplémentaire à découvrir pour votre projet en Allemagne.",
    languageMatch: (language: string) => `Elle est enseignée en ${language}, comme vous le souhaitez.`,
    languageAlternative: (language: string) => `Enseignée en ${language}, elle vous permet aussi d'explorer une autre possibilité.`,
    languageInfo: (language: string) => `Elle est proposée en ${language}.`,
    cityMatch: "Cette ville fait partie de vos préférences.",
    languages: { german: "allemand", english: "anglais", mixed: "allemand et anglais" },
  },
  ar: {
    engineeringFocus: "ويمكنك اكتشاف تخصص هندسة المعلومات، الذي يجمع بين المعلوماتية والهندسة.",
    computerScienceFocus: "يركز عنوان هذا البرنامج على علوم الحاسوب.",
    start: (city: string) => `في ${city}، `,
    project: "هذا البرنامج يتوافق مع مستوى الدراسة والمجال اللذين تبحث عنهما.",
    open: "هذا البرنامج فرصة أخرى لاستكشاف الخيارات المتاحة لمشروعك الدراسي في ألمانيا.",
    languageMatch: (language: string) => `لغة الدراسة هي ${language}، كما تفضّل.`,
    languageAlternative: (language: string) => `يُدرّس باللغة ${language}، ويمكن أن يفتح لك خيارًا آخر للمقارنة.`,
    languageInfo: (language: string) => `تُقدّم الدراسة باللغة ${language}.`,
    cityMatch: "هذه المدينة من بين المدن التي اخترتها.",
    languages: { german: "الألمانية", english: "الإنجليزية", mixed: "الألمانية والإنجليزية" },
  },
  en: {
    engineeringFocus: "You can explore Information Engineering, a course connecting computing and engineering.",
    computerScienceFocus: "This course focuses on computer science.",
    start: (city: string) => `In ${city}, `,
    project: "this course matches the study level and subject you are looking for.",
    open: "this course offers another path to explore for your studies in Germany.",
    languageMatch: (language: string) => `It is taught in ${language}, your preferred language.`,
    languageAlternative: (language: string) => `Taught in ${language}, it gives you another option to explore.`,
    languageInfo: (language: string) => `It is taught in ${language}.`,
    cityMatch: "This is one of your preferred cities.",
    languages: { german: "German", english: "English", mixed: "German and English" },
  },
  de: {
    engineeringFocus: "Du kannst Information Engineering entdecken, ein Studienfach an der Schnittstelle von Informatik und Ingenieurwesen.",
    computerScienceFocus: "Dieser Studiengang widmet sich den Computerwissenschaften.",
    start: (city: string) => `In ${city} `,
    project: "passt dieser Studiengang zu deinem gewünschten Abschlussniveau und Fachgebiet.",
    open: "ist dieser Studiengang eine weitere Möglichkeit für dein Studium in Deutschland.",
    languageMatch: (language: string) => `Er wird auf ${language} unterrichtet, wie du es dir wünschst.`,
    languageAlternative: (language: string) => `Er wird auf ${language} unterrichtet und eröffnet dir eine weitere Möglichkeit.`,
    languageInfo: (language: string) => `Die Unterrichtssprache ist ${language}.`,
    cityMatch: "Diese Stadt gehört zu deinen Favoriten.",
    languages: { german: "Deutsch", english: "Englisch", mixed: "Deutsch und Englisch" },
  },
} as const;

function hasEligibleRule(recommendation: OrientationProgrammeEvaluation, code: OrientationRuleCode) {
  return recommendation.rules.some((rule) => rule.code === code && rule.status === "eligible");
}

function languageKind(value: string | null) {
  const text = (value || "").toLowerCase();
  const german = /german|deutsch|allemand/.test(text);
  const english = /english|englisch|anglais/.test(text);
  return german && english ? "mixed" : german ? "german" : english ? "english" : null;
}

/**
 * First contact is an invitation to explore, not an admission assessment.
 * Admission conditions stay in the engine for subsequent human review;
 * none are asserted as satisfied or passed to the student as a to-do list.
 */
export function explainDocumentedProgramme(
  recommendation: OrientationProgrammeEvaluation,
  answers: PublicOrientationAnswers,
  locale: Locale,
): { reason: string } {
  const t = copy[locale];
  const city = recommendation.programme.university.city;
  const place = city ? t.start(city) : "";
  const match = hasEligibleRule(recommendation, "degree_match")
    && hasEligibleRule(recommendation, "field_match");
  const description = match ? t.project : t.open;
  const reasons = [place + description];
  const programmeName = recommendation.programme.name.toLowerCase();
  if (/information engineering/.test(programmeName)) reasons.push(t.engineeringFocus);
  else if (/computer science/.test(programmeName)) reasons.push(t.computerScienceFocus);

  const language = languageKind(recommendation.programme.teachingLanguage);
  if (language) {
    const label = t.languages[language];
    if (answers.studyLanguage && answers.studyLanguage !== "À définir" && hasEligibleRule(recommendation, "teaching_language_match")) {
      reasons.push(t.languageMatch(label));
    } else if (recommendation.rules.some(
      (rule) => rule.code === "teaching_language_other" && rule.status === "conditional",
    )) {
      reasons.push(t.languageAlternative(label));
    } else {
      reasons.push(t.languageInfo(label));
    }
  }

  if (hasEligibleRule(recommendation, "preferred_city")) reasons.push(t.cityMatch);
  return { reason: reasons.join(" ") };
}
