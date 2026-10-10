import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type { OrientationProgrammeEvaluation, OrientationRuleCode, OrientationRuleStatus } from "@/lib/orientation-engine/types";

type Locale = "fr" | "ar" | "en" | "de";

const wording = {
  fr: {
    degreeField: "Le niveau et le domaine de cette formation correspondent à votre recherche.",
    unknownMatch: "Cette formation est une piste à comparer. Sa correspondance précise avec votre projet reste à confirmer.",
    taught: (language: string) => `Langue d'enseignement indiquée : ${language}.`,
    languageMatch: (language: string) => `L'enseignement en ${language} correspond à votre préférence.`,
    languageOther: (language: string) => `La formation est en ${language}, différent de votre préférence linguistique.`,
    cityMatch: (city: string) => `Elle se trouve à ${city}, une ville que vous avez choisie.`,
    cityOther: (city: string) => `Elle se trouve à ${city}, hors des villes que vous avez choisies.`,
    academic: "Vérifier si votre diplôme permet l'accès à cette formation.",
    languageGap: (language: string, level: string) => `En ${language}, le catalogue indique ${level} ; vérifiez le niveau demandé et le certificat accepté.`,
    languageUnknown: "Vérifier le niveau de langue demandé et le certificat accepté.",
    certificate: "Vérifier le certificat de langue accepté par cette formation, même si votre niveau déclaré semble suffisant.",
    studienkolleg: "Vérifier si un Studienkolleg est nécessaire pour votre diplôme.",
    deadline: "Vérifier la rentrée et la date limite de candidature sur la page du programme.",
    uniAssist: "Vérifier la procédure de candidature uni-assist.",
    source: "Confirmer les informations auprès de l'université : la source est incomplète.",
  },
  ar: {
    degreeField: "مستوى الدراسة والمجال يتوافقان مع بحثك.",
    unknownMatch: "هذا برنامج يمكن مقارنته بغيره، لكن مدى ملاءمته لملفك يحتاج إلى تأكيد.",
    taught: (language: string) => `لغة التدريس المسجلة: ${language}.`,
    languageMatch: (language: string) => `الدراسة باللغة ${language} تتوافق مع تفضيلك.`,
    languageOther: (language: string) => `لغة الدراسة هي ${language}، وهي مختلفة عن اختيارك.`,
    cityMatch: (city: string) => `تقع الجامعة في ${city}، وهي مدينة اخترتها.`,
    cityOther: (city: string) => `تقع الجامعة في ${city}، خارج المدن التي اخترتها.`,
    academic: "التحقق مما إذا كانت شهادتك تتيح لك الالتحاق بهذا البرنامج.",
    languageGap: (language: string, level: string) => `يذكر الدليل مستوى ${level} في ${language}؛ يجب تأكيد المستوى والشهادة المقبولة.`,
    languageUnknown: "التحقق من مستوى اللغة المطلوب والشهادة المقبولة.",
    certificate: "التحقق من شهادة اللغة المقبولة، حتى إن بدا مستواك المصرّح به كافيًا.",
    studienkolleg: "التحقق مما إذا كنت تحتاج إلى سنة Studienkolleg حسب شهادتك.",
    deadline: "التحقق من موعد بدء الدراسة وآخر أجل للتقديم في صفحة البرنامج.",
    uniAssist: "التحقق من إجراءات التقديم عبر uni-assist.",
    source: "تأكيد المعلومات مع الجامعة لأن بيانات المصدر غير مكتملة.",
  },
  en: {
    degreeField: "The degree level and subject match what you are looking for.",
    unknownMatch: "This is an option to compare, but the exact fit with your profile is not confirmed.",
    taught: (language: string) => `Recorded teaching language: ${language}.`,
    languageMatch: (language: string) => `Teaching in ${language} matches your preference.`,
    languageOther: (language: string) => `Teaching is in ${language}, different from your preference.`,
    cityMatch: (city: string) => `It is in ${city}, a city you selected.`,
    cityOther: (city: string) => `It is in ${city}, outside your selected cities.`,
    academic: "Check whether your diploma gives access to this programme.",
    languageGap: (language: string, level: string) => `The catalogue lists ${level} for ${language}; confirm the required level and accepted certificate.`,
    languageUnknown: "Check the required language level and accepted certificate.",
    certificate: "Check which language certificate the programme accepts, even if your stated level appears sufficient.",
    studienkolleg: "Check whether a Studienkolleg applies to your diploma.",
    deadline: "Check the intake and application deadline on the programme page.",
    uniAssist: "Check whether an application through uni-assist is needed.",
    source: "Confirm the information with the university because the source is incomplete.",
  },
  de: {
    degreeField: "Abschlussniveau und Fachgebiet passen zu deiner Suche.",
    unknownMatch: "Dieser Studiengang ist eine mögliche Option; ob er genau zu deinem Profil passt, muss noch geprüft werden.",
    taught: (language: string) => `Erfasste Unterrichtssprache: ${language}.`,
    languageMatch: (language: string) => `Die Unterrichtssprache ${language} passt zu deiner Präferenz.`,
    languageOther: (language: string) => `Der Studiengang wird auf ${language} unterrichtet, anders als von dir gewünscht.`,
    cityMatch: (city: string) => `Er liegt in ${city}, einer Stadt, die du ausgewählt hast.`,
    cityOther: (city: string) => `Er liegt in ${city}, außerhalb deiner ausgewählten Städte.`,
    academic: "Prüfen, ob dein Abschluss Zugang zu diesem Studiengang ermöglicht.",
    languageGap: (language: string, level: string) => `Der Katalog nennt ${level} für ${language}; Niveau und akzeptiertes Zertifikat prüfen.`,
    languageUnknown: "Erforderliches Sprachniveau und akzeptiertes Zertifikat prüfen.",
    certificate: "Akzeptiertes Sprachzertifikat prüfen, auch wenn dein angegebenes Niveau ausreichend erscheint.",
    studienkolleg: "Prüfen, ob für deinen Abschluss ein Studienkolleg nötig ist.",
    deadline: "Studienbeginn und Bewerbungsfrist auf der Studiengangsseite prüfen.",
    uniAssist: "Bewerbung über uni-assist prüfen.",
    source: "Angaben bei der Hochschule bestätigen, da die Quellenlage unvollständig ist.",
  },
} as const;

function hasRule(
  recommendation: OrientationProgrammeEvaluation,
  code: OrientationRuleCode,
  statuses: OrientationRuleStatus[],
) {
  return recommendation.rules.some((rule) => rule.code === code && statuses.includes(rule.status));
}

function languageName(locale: Locale, value: "german" | "english" | "mixed" | "unknown") {
  const labels = {
    fr: { german: "allemand", english: "anglais", mixed: "allemand / anglais", unknown: "à vérifier" },
    ar: { german: "الألمانية", english: "الإنجليزية", mixed: "الألمانية / الإنجليزية", unknown: "تحتاج إلى التحقق" },
    en: { german: "German", english: "English", mixed: "German / English", unknown: "to be checked" },
    de: { german: "Deutsch", english: "Englisch", mixed: "Deutsch / Englisch", unknown: "zu prüfen" },
  } as const;
  return labels[locale][value];
}

function languageKind(value: string | null): "german" | "english" | "mixed" | "unknown" {
  const text = (value || "").toLowerCase();
  const de = /german|deutsch|allemand/.test(text);
  const en = /english|englisch|anglais/.test(text);
  return de && en ? "mixed" : de ? "german" : en ? "english" : "unknown";
}

function levelGap(recommendation: OrientationProgrammeEvaluation, locale: Locale) {
  const item = recommendation.rules.find((rule) => rule.code === "language_insufficient" && rule.status === "conditional");
  const match = typeof item?.value === "string" ? /^(DE|EN) (A1|A2|B1|B2|C1|C2)$/.exec(item.value) : null;
  if (!match) return null;
  return wording[locale].languageGap(languageName(locale, match[1] === "DE" ? "german" : "english"), match[2]);
}

/** Explains recorded matches and verification work; never decides eligibility. */
export function explainDocumentedProgramme(
  recommendation: OrientationProgrammeEvaluation,
  answers: PublicOrientationAnswers,
  locale: Locale,
): { reason: string; checks: string[] } {
  const t = wording[locale];
  const reasons: string[] = [];
  const programme = recommendation.programme;
  if (
    hasRule(recommendation, "degree_match", ["eligible"])
    && hasRule(recommendation, "field_match", ["eligible"])
  ) {
    reasons.push(t.degreeField);
  } else {
    reasons.push(t.unknownMatch);
  }

  const kind = languageKind(programme.teachingLanguage);
  if (kind !== "unknown") {
    const language = languageName(locale, kind);
    if (hasRule(recommendation, "teaching_language_other", ["conditional"])) {
      reasons.push(t.languageOther(language));
    } else if (answers.studyLanguage !== "À définir" && hasRule(recommendation, "teaching_language_match", ["eligible"])) {
      reasons.push(t.languageMatch(language));
    } else {
      reasons.push(t.taught(language));
    }
  }
  if (programme.university.city && hasRule(recommendation, "preferred_city", ["eligible"])) {
    reasons.push(t.cityMatch(programme.university.city));
  } else if (programme.university.city && hasRule(recommendation, "other_city", ["conditional"])) {
    reasons.push(t.cityOther(programme.university.city));
  }

  const checks: string[] = [];
  if (hasRule(recommendation, "academic_access_review", ["conditional", "missing_information", "unknown"])) {
    checks.push(t.academic);
  }
  const gap = levelGap(recommendation, locale);
  if (gap) {
    checks.push(gap);
  } else if (hasRule(recommendation, "language_missing", ["missing_information", "unknown"]) || kind === "unknown") {
    checks.push(t.languageUnknown);
  } else {
    checks.push(t.certificate);
  }
  if (hasRule(recommendation, "studienkolleg_required", ["conditional"])) checks.push(t.studienkolleg);
  if (hasRule(recommendation, "deadline_to_verify", ["missing_information", "unknown"])
    || hasRule(recommendation, "deadline_unknown", ["missing_information", "unknown"])
    || hasRule(recommendation, "intake_unknown", ["missing_information", "unknown"])) {
    checks.push(t.deadline);
  }
  if (hasRule(recommendation, "uni_assist_required", ["eligible"])) checks.push(t.uniAssist);
  if (hasRule(recommendation, "source_incomplete", ["unknown", "missing_information"])) checks.push(t.source);

  return {
    reason: reasons.join(" "),
    checks: checks.length ? checks.slice(0, 4) : [t.certificate],
  };
}
