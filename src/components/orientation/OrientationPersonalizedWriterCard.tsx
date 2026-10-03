"use client";

import { localizeProfileOptions } from "@/content/student-profile-copy";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { buildUniversalOrientationGuidance } from "@/lib/orientation/universal-guidance";
import type {
  OrientationPublicPersonalizedFact,
  OrientationPublicPersonalizedOption,
  OrientationPublicPersonalizedResult,
} from "@/lib/orientation-engine/result/types";
import type { OrientationVerificationFactKey } from "@/lib/orientation-engine/verification/types";
import {
  degreeOptions,
  engineeringSpecialtyOptions,
  languageLevelOptions,
  studyFieldOptions,
  tunisianBacTrackOptions,
  type SelectOption,
} from "@/lib/student/profile-options";

const copy = {
  fr: {
    heroEyebrow: "Votre orientation Campus Allemagne",
    heroTitle: "Voici votre orientation pour l’Allemagne.",
    summaryTitle: "Votre projet, en bref",
    summaryLead: "Vous avancez étape par étape. Nous gardons le cap avec vous.",
    summaryText: "Votre prochaine priorité est claire. Pendant que vous avancez, Campus Allemagne vérifie les conditions des programmes et prépare les prochaines étapes avec vous.",
    options: "Les programmes que nous étudions pour votre projet",
    why: "Pourquoi nous l’étudions",
    confirmed: "Repères vérifiés pour votre décision",
    checking: "Encore à confirmer",
    verifiedStatus: "Infos vérifiées",
    progressStatus: "Analyse en cours",
    unknownStatus: "À clarifier",
    roles: "Votre priorité est claire. Notre rôle aussi.",
    roleYou: "Votre priorité",
    roleCampus: "Ce que nous vérifions",
    roleTogether: "Ce que nous préparons avec vous",
    languagePaths: "Vos options pour avancer en allemand",
    campusLead: "Programmes, conditions d’accès, langue, Studienkolleg si nécessaire, dates limites et procédure de candidature.",
    campusCommitment: "Dossier, documents nécessaires, traductions ou légalisations utiles, candidatures et suivi. Après l’admission, nous vous guidons étape par étape pour le financement, l’assurance, le visa, le logement et l’arrivée.",
    priority: "Votre prochaine étape",
    language: "Progression linguistique",
    reassurance: "Vous gardez une prochaine action claire. Nous gardons la vue d’ensemble.",
    journey: "Votre parcours vers l’Allemagne",
    journeyCurrent: "Étape actuelle",
    journeyCurrentText: [
      "Nous clarifions votre projet et les options qui vous correspondent.",
      "Vous avancez sur votre préparation pendant que nous terminons la vérification des programmes.",
      "Nous comparons les pistes vérifiées pour retenir celles qui correspondent à votre projet.",
      "Nous préparons et suivons vos candidatures avec vous.",
      "Après l’admission, nous avançons dans l’ordre : financement, assurance, visa, logement et arrivée.",
    ],
    journeySteps: ["Orientation", "Préparation", "Sélection finale", "Candidatures", "Étapes administratives"],
    next: "Continuer mon orientation",
    details: "Voir les informations vérifiées et les sources officielles",
    reviewText: "Campus Allemagne conserve les faits et les sources de cette orientation et poursuit les contrôles utiles en arrière-plan.",
    verified: "Vérifié",
    reviewNeeded: "À confirmer",
    source: "Source",
    checked: "Vérifié le",
    noFacts: "Aucun fait publiable supplémentaire n’est disponible pour cette piste.",
    germanLabel: "Allemand",
    pathsCount: "pistes",
  },
  ar: {
    heroEyebrow: "توجيهك مع Campus Allemagne",
    heroTitle: "إليك توجيهك للدراسة في ألمانيا.",
    summaryTitle: "مشروعك باختصار",
    summaryLead: "تتقدم خطوة بخطوة، ونحن نحافظ معك على اتجاه المشروع.",
    summaryText: "أولويتك التالية واضحة. أثناء تقدمك، يتحقق Campus Allemagne من شروط البرامج ويحضّر معك الخطوات القادمة.",
    options: "البرامج التي ندرسها لمشروعك",
    why: "لماذا ندرس هذا المسار",
    confirmed: "معلومات موثقة تساعدك على الاختيار",
    checking: "ما زال يحتاج إلى تأكيد",
    verifiedStatus: "موثّق",
    progressStatus: "التحليل جارٍ",
    unknownStatus: "بحاجة إلى توضيح",
    roles: "أولويتك واضحة، ودورنا واضح أيضًا.",
    roleYou: "أولويتك",
    roleCampus: "ما نتحقق منه",
    roleTogether: "ما نحضّره معك",
    languagePaths: "خياراتك للتقدم في الألمانية",
    campusLead: "البرامج، شروط القبول، اللغة، Studienkolleg عند الحاجة، المواعيد وطريقة التقديم.",
    campusCommitment: "الملف، الوثائق المطلوبة، الترجمات أو التصديقات اللازمة، طلبات التقديم ومتابعتها. وبعد القبول نرافقك خطوة بخطوة في التمويل والتأمين والتأشيرة والسكن والوصول.",
    priority: "خطوتك التالية",
    language: "التقدم اللغوي",
    reassurance: "لديك خطوة واضحة الآن، ونحن نحتفظ بالصورة الكاملة للمشروع.",
    journey: "مسارك نحو ألمانيا",
    journeyCurrent: "المرحلة الحالية",
    journeyCurrentText: [
      "نوضح مشروعك والخيارات المناسبة له.",
      "تتقدم في التحضير بينما ننهي التحقق من البرامج.",
      "نقارن المسارات الموثقة لاختيار الأنسب لمشروعك.",
      "نحضّر طلبات التقديم معك ونتابعها.",
      "بعد القبول نرتب معك التمويل والتأمين والتأشيرة والسكن والوصول.",
    ],
    journeySteps: ["التوجيه", "التحضير", "الاختيار النهائي", "التقديم", "الخطوات الإدارية"],
    next: "متابعة توجيهي",
    details: "عرض المعلومات الموثقة والمصادر الرسمية",
    reviewText: "يحتفظ Campus Allemagne بالحقائق والمصادر ويواصل عمليات التحقق المفيدة في الخلفية.",
    verified: "موثّق",
    reviewNeeded: "يحتاج إلى تأكيد",
    source: "المصدر",
    checked: "تم التحقق في",
    noFacts: "لا توجد حقائق إضافية قابلة للعرض لهذا المسار حاليًا.",
    germanLabel: "الألمانية",
    pathsCount: "مسارات",
  },
  en: {
    heroEyebrow: "Your Campus Allemagne orientation",
    heroTitle: "Here is your orientation for studying in Germany.",
    summaryTitle: "Your project, at a glance",
    summaryLead: "You move forward step by step. We keep the project on course with you.",
    summaryText: "Your next priority is clear. While you move forward, Campus Allemagne checks programme requirements and prepares the next steps with you.",
    options: "Programmes we are reviewing for your project",
    why: "Why we are reviewing it",
    confirmed: "Verified decision points",
    checking: "Still to confirm",
    verifiedStatus: "Info verified",
    progressStatus: "Analysis in progress",
    unknownStatus: "To clarify",
    roles: "Your priority is clear. So is our role.",
    roleYou: "Your priority",
    roleCampus: "What we verify",
    roleTogether: "What we prepare with you",
    languagePaths: "Your options for progressing in German",
    campusLead: "Programmes, entry requirements, language, Studienkolleg where needed, deadlines and the application process.",
    campusCommitment: "Dossier, required documents, useful translations or legalisations, applications and follow-up. After admission, we guide you step by step through funding, insurance, visa, housing and arrival.",
    priority: "Your next step",
    language: "Language progress",
    reassurance: "You keep one clear next action. We keep the full project in view.",
    journey: "Your path to Germany",
    journeyCurrent: "Current stage",
    journeyCurrentText: [
      "We clarify your project and the options that fit it.",
      "You work on your preparation while we finish checking the programmes.",
      "We compare verified paths and narrow them down for your project.",
      "We prepare and follow your applications with you.",
      "After admission, we move through funding, insurance, visa, housing and arrival in order.",
    ],
    journeySteps: ["Orientation", "Preparation", "Final selection", "Applications", "Administrative steps"],
    next: "Continue my orientation",
    details: "View verified information and official sources",
    reviewText: "Campus Allemagne keeps the facts and sources behind this orientation and continues useful checks in the background.",
    verified: "Verified",
    reviewNeeded: "To confirm",
    source: "Source",
    checked: "Checked on",
    noFacts: "No additional publishable facts are currently available for this path.",
    germanLabel: "German",
    pathsCount: "paths",
  },
  de: {
    heroEyebrow: "Deine Orientierung mit Campus Allemagne",
    heroTitle: "Hier ist deine Orientierung für dein Studium in Deutschland.",
    summaryTitle: "Dein Projekt auf einen Blick",
    summaryLead: "Du gehst Schritt für Schritt weiter. Wir halten mit dir den Kurs.",
    summaryText: "Deine nächste Priorität ist klar. Während du weitergehst, prüft Campus Allemagne die Bedingungen der Studiengänge und bereitet mit dir die nächsten Schritte vor.",
    options: "Studiengänge, die wir für dein Projekt prüfen",
    why: "Warum wir diese Option prüfen",
    confirmed: "Geprüfte Entscheidungspunkte",
    checking: "Noch zu klären",
    verifiedStatus: "Infos geprüft",
    progressStatus: "Analyse läuft",
    unknownStatus: "Zu klären",
    roles: "Deine Priorität ist klar. Unsere Rolle auch.",
    roleYou: "Deine Priorität",
    roleCampus: "Was wir prüfen",
    roleTogether: "Was wir mit dir vorbereiten",
    languagePaths: "Deine Wege für den Deutschfortschritt",
    campusLead: "Studiengänge, Zugangsvoraussetzungen, Sprache, Studienkolleg falls nötig, Fristen und Bewerbungsverfahren.",
    campusCommitment: "Unterlagen, notwendige Dokumente, Übersetzungen oder Legalisierungen, Bewerbungen und Nachverfolgung. Nach der Zulassung begleiten wir dich Schritt für Schritt durch Finanzierung, Versicherung, Visum, Wohnen und Ankunft.",
    priority: "Dein nächster Schritt",
    language: "Sprachfortschritt",
    reassurance: "Du behältst einen klaren nächsten Schritt. Wir behalten das Gesamtprojekt im Blick.",
    journey: "Dein Weg nach Deutschland",
    journeyCurrent: "Aktuelle Etappe",
    journeyCurrentText: [
      "Wir klären dein Projekt und passende Optionen.",
      "Du arbeitest an deiner Vorbereitung, während wir die Studiengänge weiter prüfen.",
      "Wir vergleichen geprüfte Optionen und grenzen sie für dein Projekt ein.",
      "Wir bereiten deine Bewerbungen mit dir vor und verfolgen sie.",
      "Nach der Zulassung gehen wir Finanzierung, Versicherung, Visum, Wohnen und Ankunft der Reihe nach an.",
    ],
    journeySteps: ["Orientierung", "Vorbereitung", "Finale Auswahl", "Bewerbungen", "Administrative Schritte"],
    next: "Orientierung fortsetzen",
    details: "Geprüfte Informationen und offizielle Quellen anzeigen",
    reviewText: "Campus Allemagne bewahrt Fakten und Quellen dieser Orientierung auf und führt sinnvolle Prüfungen im Hintergrund weiter.",
    verified: "Geprüft",
    reviewNeeded: "Zu bestätigen",
    source: "Quelle",
    checked: "Geprüft am",
    noFacts: "Für diese Option sind derzeit keine weiteren veröffentlichbaren Fakten verfügbar.",
    germanLabel: "Deutsch",
    pathsCount: "Optionen",
  },
} as const;

const factLabels: Record<Locale, Record<OrientationVerificationFactKey, string>> = {
  fr: {
    programme_exists: "Programme actuellement proposé",
    degree_level: "Niveau du diplôme",
    city: "Ville",
    teaching_language: "Langue d’enseignement",
    german_language_requirement: "Niveau d’allemand demandé",
    english_language_requirement: "Niveau d’anglais demandé",
    accepted_language_certificates: "Certificats de langue acceptés",
    intake_terms: "Rentrées disponibles",
    winter_deadline: "Date limite — hiver",
    summer_deadline: "Date limite — été",
    application_route: "Voie de candidature",
    application_url: "Page de candidature",
    studienkolleg_requirement: "Condition Studienkolleg",
    tuition_or_semester_fees: "Frais publiés",
  },
  ar: {
    programme_exists: "البرنامج متاح حاليًا",
    degree_level: "مستوى الشهادة",
    city: "المدينة",
    teaching_language: "لغة الدراسة",
    german_language_requirement: "مستوى الألمانية المطلوب",
    english_language_requirement: "مستوى الإنجليزية المطلوب",
    accepted_language_certificates: "شهادات اللغة المقبولة",
    intake_terms: "فترات بدء الدراسة",
    winter_deadline: "آخر موعد — الشتاء",
    summer_deadline: "آخر موعد — الصيف",
    application_route: "طريقة التقديم",
    application_url: "صفحة التقديم",
    studienkolleg_requirement: "شرط Studienkolleg",
    tuition_or_semester_fees: "الرسوم المنشورة",
  },
  en: {
    programme_exists: "Programme currently offered",
    degree_level: "Degree level",
    city: "City",
    teaching_language: "Teaching language",
    german_language_requirement: "German requirement",
    english_language_requirement: "English requirement",
    accepted_language_certificates: "Accepted language certificates",
    intake_terms: "Available intakes",
    winter_deadline: "Winter deadline",
    summer_deadline: "Summer deadline",
    application_route: "Application route",
    application_url: "Application page",
    studienkolleg_requirement: "Studienkolleg condition",
    tuition_or_semester_fees: "Published fees",
  },
  de: {
    programme_exists: "Studiengang aktuell angeboten",
    degree_level: "Abschlussniveau",
    city: "Stadt",
    teaching_language: "Unterrichtssprache",
    german_language_requirement: "Deutschanforderung",
    english_language_requirement: "Englischanforderung",
    accepted_language_certificates: "Akzeptierte Sprachnachweise",
    intake_terms: "Verfügbare Studienstarts",
    winter_deadline: "Bewerbungsfrist — Winter",
    summer_deadline: "Bewerbungsfrist — Sommer",
    application_route: "Bewerbungsweg",
    application_url: "Bewerbungsseite",
    studienkolleg_requirement: "Studienkolleg-Bedingung",
    tuition_or_semester_fees: "Veröffentlichte Gebühren",
  },
};

const factPriority: OrientationVerificationFactKey[] = [
  "teaching_language",
  "german_language_requirement",
  "english_language_requirement",
  "winter_deadline",
  "summer_deadline",
  "application_route",
  "tuition_or_semester_fees",
  "intake_terms",
  "degree_level",
];

const compactFactPrefixes: Record<Locale, Partial<Record<OrientationVerificationFactKey, string>>> = {
  fr: {
    degree_level: "Diplôme",
    teaching_language: "Langue",
    german_language_requirement: "Allemand",
    english_language_requirement: "Anglais",
    intake_terms: "Rentrée",
    winter_deadline: "Date limite",
    summer_deadline: "Date limite",
    application_route: "Candidature",
    tuition_or_semester_fees: "Frais",
  },
  ar: {
    degree_level: "الشهادة",
    teaching_language: "اللغة",
    german_language_requirement: "الألمانية",
    english_language_requirement: "الإنجليزية",
    intake_terms: "الدخول",
    winter_deadline: "آخر موعد",
    summer_deadline: "آخر موعد",
    application_route: "التقديم",
    tuition_or_semester_fees: "الرسوم",
  },
  en: {
    degree_level: "Degree",
    teaching_language: "Language",
    german_language_requirement: "German",
    english_language_requirement: "English",
    intake_terms: "Intake",
    winter_deadline: "Deadline",
    summer_deadline: "Deadline",
    application_route: "Application",
    tuition_or_semester_fees: "Fees",
  },
  de: {
    degree_level: "Abschluss",
    teaching_language: "Sprache",
    german_language_requirement: "Deutsch",
    english_language_requirement: "Englisch",
    intake_terms: "Start",
    winter_deadline: "Frist",
    summer_deadline: "Frist",
    application_route: "Bewerbung",
    tuition_or_semester_fees: "Gebühren",
  },
};

const teachingLanguageNames: Record<Locale, Record<string, string>> = {
  fr: { english: "anglais", german: "allemand", french: "français" },
  ar: { english: "الإنجليزية", german: "الألمانية", french: "الفرنسية" },
  en: { english: "English", german: "German", french: "French" },
  de: { english: "Englisch", german: "Deutsch", french: "Französisch" },
};

function formatFactValue(value: OrientationPublicPersonalizedFact["value"], locale: Locale) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") {
    if (locale === "ar") return value ? "نعم" : "لا";
    if (locale === "de") return value ? "Ja" : "Nein";
    if (locale === "en") return value ? "Yes" : "No";
    return value ? "Oui" : "Non";
  }
  return value;
}

function formatDate(value: string | null, locale: Locale) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function localizedValue(locale: Locale, value: string, options: readonly SelectOption[]) {
  if (!value) return "";
  return localizeProfileOptions(locale, options).find((option) => option.value === value)?.label || value;
}

function buildProfileHighlights(
  answers: PublicOrientationAnswers | null,
  locale: Locale,
) {
  const t = copy[locale];
  const items: string[] = [];

  if (answers) {
    const track = localizedValue(locale, answers.bacTrack, tunisianBacTrackOptions);
    if (answers.bacStatus === "obtained" && track) {
      items.push(
        answers.generalAverage
          ? `Bac ${track} · ${answers.generalAverage}/20`
          : `Bac ${track}`,
      );
    }

    if (answers.targetDegree) {
      items.push(localizedValue(locale, answers.targetDegree, degreeOptions));
    }

    const field = answers.engineeringSpecialty
      ? localizedValue(locale, answers.engineeringSpecialty, engineeringSpecialtyOptions)
      : localizedValue(locale, answers.targetField, studyFieldOptions);
    if (field) items.push(field);

    if (answers.germanLevel && answers.germanLevel !== "none") {
      items.push(`${t.germanLabel} · ${localizedValue(locale, answers.germanLevel, languageLevelOptions)}`);
    }
  }

  return items.slice(0, 4);
}

function optionStatus(
  option: OrientationPublicPersonalizedOption,
  locale: Locale,
) {
  const t = copy[locale];

  if (option.overallStatus === "verified") {
    return {
      label: t.verifiedStatus,
      className: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
    };
  }
  if (option.overallStatus === "needs_review") {
    return {
      label: t.progressStatus,
      className: "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200",
    };
  }
  return {
    label: t.unknownStatus,
    className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  };
}

function highlightedFacts(option: OrientationPublicPersonalizedOption) {
  return option.facts
    .filter((fact) => fact.status === "verified" && factPriority.includes(fact.field))
    .sort((a, b) => factPriority.indexOf(a.field) - factPriority.indexOf(b.field))
    .slice(0, 4);
}

function determineJourneyStep(
  result: OrientationPublicPersonalizedResult,
  answers: PublicOrientationAnswers | null,
) {
  const actionId = result.content.cta.actionId.toLowerCase();
  if (/visa|insurance|finance|arrival|administrative/.test(actionId)) return 4;
  if (/application|apply|candidate|candidature/.test(actionId)) return 3;

  const allProgrammesVerified =
    result.selected.length > 0
    && result.selected.every((option) => option.overallStatus === "verified");
  const languageStillProgressing =
    result.content.languagePlan.show
    && Boolean(result.content.languagePlan.nextLevel);
  const academicPreparationStillOpen =
    answers?.bacStatus !== "obtained"
    || result.status !== "ready"
    || !allProgrammesVerified;

  if (!languageStillProgressing && !academicPreparationStillOpen) return 2;
  return 1;
}

function compactFactLabel(
  fact: OrientationPublicPersonalizedFact,
  locale: Locale,
) {
  const value = formatFactValue(fact.value, locale);
  if (!value) return factLabels[locale][fact.field];

  let text = String(value);
  if (fact.field === "degree_level") {
    if (/bachelor/i.test(text)) text = "Bachelor";
    if (/master/i.test(text)) text = "Master";
  } else if (fact.field === "teaching_language") {
    text = text.replace(/\b(English|German|French)\b/gi, (language) =>
      teachingLanguageNames[locale][language.toLowerCase()] || language
    );
  } else if (
    fact.field === "german_language_requirement"
    || fact.field === "english_language_requirement"
  ) {
    const level = text.match(/\b(A1|A2|B1|B2|C1|C2)\b/i)?.[1];
    if (level) text = level.toUpperCase();
  }

  const conciseValue = text.length > 26 ? `${text.slice(0, 23).trim()}…` : text;
  const prefix = compactFactPrefixes[locale][fact.field];
  return prefix ? `${prefix} : ${conciseValue}` : conciseValue;
}

function splitGuidanceChoice(choice: string, locale: Locale) {
  const separator = choice.indexOf(":");
  const title = separator < 0 ? choice.trim() : choice.slice(0, separator).trim();

  const concise: Record<Locale, Record<string, string>> = {
    fr: {
      Tunisie: "Nous pouvons vous orienter vers une école de langue partenaire en Tunisie lorsqu’une solution adaptée est réellement disponible.",
      "En ligne": "Nous pouvons vous proposer une préparation à distance adaptée à votre niveau, lorsqu’elle est disponible.",
      Allemagne: "Si votre situation le permet, nous pouvons vous orienter vers une école de langue partenaire en Allemagne et vous expliquer quelles démarches sont possibles dans votre situation.",
    },
    ar: {
      تونس: "يمكننا توجيهك إلى مدرسة لغة شريكة في تونس عندما تتوفر صيغة مناسبة فعلًا.",
      "عبر الإنترنت": "يمكننا اقتراح تحضير عن بُعد مناسب لمستواك عندما يكون متاحًا.",
      ألمانيا: "إذا سمحت وضعيتك، يمكننا توجيهك إلى مدرسة لغة شريكة في ألمانيا وشرح الخطوات الممكنة في حالتك.",
    },
    en: {
      Tunisia: "We can direct you to a partner language school in Tunisia when a suitable option is genuinely available.",
      Online: "We can offer remote preparation suited to your level when available.",
      Germany: "If your situation allows it, we can direct you to a partner language school in Germany and explain which steps are possible in your situation.",
    },
    de: {
      Tunesien: "Wir können dich an eine Partnersprachschule in Tunesien vermitteln, wenn eine passende Möglichkeit tatsächlich verfügbar ist.",
      Online: "Wir können eine Online-Vorbereitung anbieten, die zu deinem Niveau passt, wenn sie verfügbar ist.",
      Deutschland: "Wenn deine Situation es erlaubt, können wir dich an eine Partnersprachschule in Deutschland vermitteln und erklären, welche Schritte in deiner Situation möglich sind.",
    },
  };

  const fallback = separator < 0 ? "" : choice.slice(separator + 1).trim();
  return {
    title,
    text: concise[locale][title] || fallback,
  };
}

export function OrientationPersonalizedWriterCard({
  result,
  locale,
  answers = null,
  showCta = false,
}: {
  result: OrientationPublicPersonalizedResult;
  locale: Locale;
  answers?: PublicOrientationAnswers | null;
  showCta?: boolean;
}) {
  const t = copy[locale];
  const content = result.content;
  const profileHighlights = buildProfileHighlights(answers, locale);
  const guidance = answers ? buildUniversalOrientationGuidance(answers, locale) : null;
  const roleTexts = [
    content.roadmap[0]?.text || content.mainPriority.nextStep,
    content.roadmap[2]?.text || content.reassurance,
  ];
  const languageChoices = guidance?.languageChoices.map((choice) => splitGuidanceChoice(choice, locale)) || [];
  const journeyStep = determineJourneyStep(result, answers);

  return (
    <article className="space-y-7 sm:space-y-8">
      <header className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--foreground)] px-5 py-6 text-white shadow-[var(--shadow-card)] sm:px-8 sm:py-7">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-[var(--brand)]" />
        <div className="relative max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/[0.55]">
            {t.heroEyebrow}
          </p>
          <h3 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-[2rem]">
            {t.heroTitle}
          </h3>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/[0.9] sm:text-base sm:leading-7">
            {content.opening}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/[0.66]">
            {content.projectStatus}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profileHighlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/[0.12] bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-white/[0.88]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section
        aria-labelledby="orientation-summary"
        className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-4 sm:px-5"
      >
        <div className="max-w-4xl">
          <h4 id="orientation-summary" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)]">
            {t.summaryTitle}
          </h4>
          <p className="mt-1.5 text-base font-semibold leading-6 text-[var(--foreground)]">
            {t.summaryLead}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
            {t.summaryText}
          </p>
        </div>
      </section>

      <section aria-labelledby="orientation-premium-options">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h4 id="orientation-premium-options" className="text-2xl font-semibold tracking-tight">
            {t.options}
          </h4>
          <span className="text-xs font-semibold text-[var(--muted)]">
            {result.selected.length} {t.pathsCount}
          </span>
        </div>

        <div className="mt-4 grid items-start gap-3 lg:grid-cols-2">
          {content.studyOptions.map((option) => {
            const selected = result.selected.find((item) => item.optionId === option.optionId);
            const status = selected ? optionStatus(selected, locale) : null;
            const facts = selected ? highlightedFacts(selected) : [];

            return (
              <article
                key={option.optionId}
                className="professional-hover rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.035)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--brand-strong)]">
                      {String(option.position).padStart(2, "0")}
                    </p>
                    <h5 className="mt-1 text-lg font-semibold leading-6 tracking-tight">{option.programme}</h5>
                    <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                      {option.institution}{option.city ? ` · ${option.city}` : ""}
                    </p>
                  </div>
                  {status ? (
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  ) : null}
                </div>

                {facts.length ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[var(--muted)]">{t.confirmed}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {facts.map((fact) => (
                        <span
                          key={fact.field}
                          title={`${factLabels[locale][fact.field]}: ${formatFactValue(fact.value, locale)}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-100"
                        >
                          <span aria-hidden="true">✓</span>
                          {compactFactLabel(fact, locale)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4">
                  <p className="text-xs font-semibold text-[var(--muted)]">{t.why}</p>
                  <p className="mt-1.5 text-sm leading-6">{option.whyItFits}</p>
                </div>

                <div className="mt-4 border-t border-[var(--border)] pt-3">
                  <div className="hidden sm:block">
                    {selected?.overallStatus === "verified" ? (
                      <p className="text-xs font-semibold text-blue-800">{t.checking}</p>
                    ) : null}
                    <p className={`${selected?.overallStatus === "verified" ? "mt-1.5" : ""} text-sm leading-6 text-[var(--muted)]`}>
                      {option.verificationNote}
                    </p>
                  </div>
                  <details className="sm:hidden">
                    <summary className="cursor-pointer text-xs font-semibold text-blue-800">
                      {selected?.overallStatus === "verified" ? t.checking : status?.label || t.checking}
                    </summary>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {option.verificationNote}
                    </p>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="orientation-main-priority"
        className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5 sm:p-6"
      >
        <div aria-hidden="true" className="absolute inset-y-0 start-0 w-0.5 bg-[var(--brand)]" />
        <p className="text-xs font-semibold text-[var(--brand-strong)]">{t.priority}</p>
        <h4 id="orientation-main-priority" className="mt-2 text-2xl font-semibold tracking-tight">
          {content.mainPriority.title}
        </h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {content.mainPriority.text}
        </p>

        {content.languagePlan.show ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--muted)]">{t.language}</span>
              {content.languagePlan.currentLevel ? (
                <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-[var(--border)]">
                  {content.languagePlan.currentLevel}
                </span>
              ) : null}
              {content.languagePlan.currentLevel && content.languagePlan.nextLevel ? (
                <span aria-hidden="true" className="text-[var(--muted)]">→</span>
              ) : null}
              {content.languagePlan.nextLevel ? (
                <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-strong)]">
                  {content.languagePlan.nextLevel}
                </span>
              ) : null}
            </div>

            {languageChoices.length ? (
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <p className="text-xs font-semibold text-[var(--muted)]">{t.languagePaths}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {languageChoices.map((choice) => (
                    <div key={choice.title} className="rounded-[var(--radius-control)] bg-[var(--surface)] p-3 ring-1 ring-inset ring-[var(--border)]">
                      <p className="text-sm font-semibold">{choice.title}</p>
                      {choice.text ? (
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{choice.text}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm font-semibold leading-6">
            {content.mainPriority.nextStep}
          </p>
        )}

        {showCta ? (
          <a
            href="#orientation-prospect-capture"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
          >
            {content.cta.label || t.next}
          </a>
        ) : null}
      </section>

      <section aria-labelledby="orientation-responsibilities">
        <h4 id="orientation-responsibilities" className="text-2xl font-semibold tracking-tight">
          {t.roles}
        </h4>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-bold text-[var(--brand-strong)]">01</p>
            <h5 className="mt-1.5 text-base font-semibold">{t.roleYou}</h5>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{roleTexts[0]}</p>
          </div>

          <div className="rounded-[var(--radius-panel)] bg-[var(--foreground)] p-4 text-white sm:p-5">
            <p className="text-xs font-bold text-white/[0.55]">02</p>
            <h5 className="mt-1.5 text-base font-semibold">{t.roleCampus}</h5>
            <p className="mt-2 text-sm leading-6 text-white/[0.78]">{t.campusLead}</p>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
            <p className="text-xs font-bold text-[var(--brand-strong)]">03</p>
            <h5 className="mt-1.5 text-base font-semibold">{t.roleTogether}</h5>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.campusCommitment}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="orientation-journey">
        <h4 id="orientation-journey" className="text-2xl font-semibold tracking-tight">
          {t.journey}
        </h4>

        <ol className="mt-4 hidden grid-cols-5 gap-2 sm:grid">
          {t.journeySteps.map((step, index) => {
            const completed = index < journeyStep;
            const current = index === journeyStep;
            return (
              <li key={step} aria-current={current ? "step" : undefined}>
                <div
                  className={`h-1.5 rounded-full ${completed
                    ? "bg-emerald-500"
                    : current
                      ? "bg-[var(--brand)]"
                      : "bg-[var(--border)]"}`}
                />
                <div className="mt-3 flex items-start gap-2">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${completed
                      ? "bg-emerald-100 text-emerald-800"
                      : current
                        ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                        : "bg-[var(--surface-subtle)] text-[var(--muted)]"}`}
                  >
                    {completed ? "✓" : index + 1}
                  </span>
                  <div>
                    <p className={`text-xs leading-5 ${current ? "font-bold" : "text-[var(--muted)]"}`}>
                      {step}
                    </p>
                    {current ? (
                      <>
                        <p className="mt-0.5 text-[10px] font-semibold text-[var(--brand-strong)]">{t.journeyCurrent}</p>
                        <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">{t.journeyCurrentText[journeyStep]}</p>
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <ol className="mt-4 space-y-0 sm:hidden">
          {t.journeySteps.map((step, index) => {
            const completed = index < journeyStep;
            const current = index === journeyStep;
            return (
              <li
                key={step}
                aria-current={current ? "step" : undefined}
                className="relative flex min-h-14 gap-3 ps-1"
              >
                {index < t.journeySteps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`absolute start-[0.83rem] top-7 h-[calc(100%-0.25rem)] w-px ${index < journeyStep ? "bg-emerald-300" : "bg-[var(--border)]"}`}
                  />
                ) : null}
                <span
                  className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${completed
                    ? "bg-emerald-100 text-emerald-800"
                    : current
                      ? "bg-[var(--brand)] text-white"
                      : "bg-[var(--surface-subtle)] text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]"}`}
                >
                  {completed ? "✓" : index + 1}
                </span>
                <div className="pb-5">
                  <p className={`text-sm leading-6 ${current ? "font-bold" : "text-[var(--muted)]"}`}>
                    {step}
                  </p>
                  {current ? (
                    <>
                      <p className="mt-0.5 text-xs font-semibold text-[var(--brand-strong)]">{t.journeyCurrent}</p>
                      <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--muted)]">{t.journeyCurrentText[journeyStep]}</p>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <details className="border-t border-[var(--border)] pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
          {t.details}
        </summary>
        <div className="mt-5 space-y-6">
          {result.humanReview.mode === "post_result_audit" ? (
            <p className="max-w-3xl text-xs leading-5 text-[var(--muted)]">{t.reviewText}</p>
          ) : null}

          {result.selected.map((option) => (
            <section key={option.optionId} className="border-t border-[var(--border)] pt-5 first:border-t-0 first:pt-0">
              <h5 className="font-semibold">{option.programme}</h5>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {option.institution}{option.city ? ` · ${option.city}` : ""}
              </p>
              {option.facts.length ? (
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {option.facts.map((fact, index) => (
                    <div key={`${fact.field}-${index}`} className="text-sm">
                      <dt className="font-semibold">{factLabels[locale][fact.field]}</dt>
                      <dd className="mt-1 leading-6 text-[var(--muted)]">
                        <span>{formatFactValue(fact.value, locale)}</span>
                        <span className="ms-2 text-xs font-semibold">
                          {fact.status === "verified" ? t.verified : t.reviewNeeded}
                        </span>
                        {fact.sourceUrl ? (
                          <>
                            {" · "}
                            <a
                              href={fact.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-[var(--foreground)] underline underline-offset-2"
                            >
                              {t.source}
                            </a>
                          </>
                        ) : null}
                        {fact.verifiedAt ? (
                          <span className="block text-xs">
                            {t.checked}: {formatDate(fact.verifiedAt, locale)}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{t.noFacts}</p>
              )}
            </section>
          ))}
        </div>
      </details>
    </article>
  );
}
