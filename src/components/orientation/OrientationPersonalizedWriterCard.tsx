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
    heroEyebrow: "Votre projet avec Campus Allemagne",
    heroTitle: "Votre projet pour l’Allemagne prend forme.",
    summaryTitle: "Ce que nous retenons de votre dossier",
    summaryLead: "Votre dossier est encourageant.",
    summaryText: "Une piste ressort déjà. Votre priorité maintenant : avancer vers B1. Nous continuons le reste avec vous.",
    summarySignal: "Ce qui ressort",
    summaryAction: "Votre priorité maintenant",
    summaryCampus: "Pendant ce temps, nous",
    summaryCampusText: "Nous vérifions les programmes et préparons avec vous la sélection finale.",
    outlookEyebrow: "Première estimation Campus Allemagne",
    outlookStrong: "Fortes chances d’admission",
    outlookGood: "Bon potentiel d’admission",
    outlookNote: "Nous confirmerons cette première estimation avec vous lors de la vérification finale.",
    options: "Les programmes que nous étudions pour votre projet",
    featuredOption: "La piste qui ressort le plus aujourd’hui",
    otherOptions: "Autres pistes que nous continuons à étudier",
    outlookSectionNote: "Aujourd’hui, une piste ressort clairement. Les autres restent ouvertes pendant que nous finissons les vérifications. Nous en reparlerons avec vous avant de décider.",
    languageIntro: "Nous regarderons avec vous la solution de préparation B1 la plus adaptée à votre situation.",
    togetherLabel: "Puis, on décide ensemble",
    togetherText: "Nous reprenons la shortlist avec vous, puis nous avançons sur le dossier, les candidatures et la suite.",
    humanTitle: "On reprend ce rapport avec vous.",
    humanText: "Vous ne restez pas seul avec ce résultat. Un membre de l’équipe Campus Allemagne reprend avec vous les programmes qui ressortent, les points à confirmer et la prochaine décision.",
    humanCta: "Parler de mon orientation avec Campus Allemagne",
    why: "Pourquoi elle ressort pour vous",
    confirmed: "Repères vérifiés pour votre décision",
    checking: "Ce que nous vérifions encore",
    verifiedStatus: "Infos vérifiées",
    progressStatus: "Vérification en cours",
    unknownStatus: "À clarifier",
    roles: "Vous avancez sur le B1. Nous avançons sur le reste.",
    withYouEyebrow: "Campus Allemagne avec vous",
    roleYou: "Vous",
    roleCampus: "Nous",
    roleTogether: "Ce que nous préparons ensuite avec vous",
    languagePaths: "Vos options pour avancer en allemand",
    campusLead: "Programmes, conditions d’accès, langue, Studienkolleg si nécessaire, dates limites et procédure de candidature.",
    campusCommitment: "Dossier, documents nécessaires, traductions ou légalisations utiles, candidatures et suivi. Après l’admission, nous vous guidons étape par étape pour le financement, l’assurance, le visa, le logement et l’arrivée.",
    priority: "Votre priorité maintenant",
    language: "Progression linguistique",
    priorityParallelTitle: "Nous avançons en parallèle",
    priorityParallelText: "Pendant que vous progressez en allemand, nous vérifions les programmes et préparons la sélection finale.",
    reassurance: "Vous n’avez pas besoin de tout régler aujourd’hui. Votre prochaine étape est claire, et nous gardons le reste du projet en vue.",
    closingEyebrow: "À retenir aujourd’hui",
    closingText: "Ce rapport est notre point de départ. Avant la sélection finale, nous reprenons avec vous les points importants et nous confirmons la stratégie.",
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
    heroEyebrow: "مشروعك مع Campus Allemagne",
    heroTitle: "مشروعك للدراسة في ألمانيا بدأ يتضح.",
    summaryTitle: "ما نراه اليوم في ملفك",
    summaryLead: "ملفك يحمل مؤشرات مشجعة.",
    summaryText: "هناك مسار يبرز بالفعل. أولويتك الآن هي التقدم نحو B1، ونحن نتابع بقية المشروع معك.",
    summarySignal: "ما يبرز اليوم",
    summaryAction: "أولويتك الآن",
    summaryCampus: "وفي الوقت نفسه، نحن",
    summaryCampusText: "نراجع البرامج ونحضّر معك الاختيار النهائي.",
    outlookEyebrow: "التقدير الأولي من Campus Allemagne",
    outlookStrong: "فرص قبول قوية",
    outlookGood: "فرصة قبول جيدة",
    outlookNote: "سنؤكد هذا التقدير الأولي معك خلال المراجعة النهائية.",
    options: "البرامج التي ندرسها لمشروعك",
    featuredOption: "المسار الذي يبرز أكثر اليوم",
    otherOptions: "مسارات أخرى نواصل دراستها",
    outlookSectionNote: "اليوم يبرز مسار بوضوح، بينما تبقى المسارات الأخرى مفتوحة إلى أن ننهي التحقق. ثم نراجعها معك قبل القرار.",
    languageIntro: "سنبحث معك عن أفضل طريقة مناسبة لوضعك للتقدم إلى مستوى B1.",
    togetherLabel: "ثم نقرر معًا",
    togetherText: "نراجع معك القائمة المختصرة، ثم ننتقل إلى الملف والتقديمات والخطوات التالية.",
    humanTitle: "نراجع هذا التقرير معك.",
    humanText: "لن تبقى وحدك مع هذه النتيجة. يراجع معك أحد أعضاء فريق Campus Allemagne البرامج التي برزت، والنقاط التي تحتاج إلى تأكيد، والقرار التالي.",
    humanCta: "التحدث عن توجيهي مع Campus Allemagne",
    why: "لماذا يبرز هذا المسار لك",
    confirmed: "معلومات موثقة تساعدك على الاختيار",
    checking: "ما زال يحتاج إلى تأكيد",
    verifiedStatus: "موثّق",
    progressStatus: "التحقق جارٍ",
    unknownStatus: "بحاجة إلى توضيح",
    roles: "أنت تتقدم نحو B1، ونحن نتقدم في بقية المشروع.",
    withYouEyebrow: "Campus Allemagne معك",
    roleYou: "أنت",
    roleCampus: "نحن",
    roleTogether: "ما سنحضّره معك بعد ذلك",
    languagePaths: "خياراتك للتقدم في الألمانية",
    campusLead: "البرامج، شروط القبول، اللغة، Studienkolleg عند الحاجة، المواعيد وطريقة التقديم.",
    campusCommitment: "الملف، الوثائق المطلوبة، الترجمات أو التصديقات اللازمة، طلبات التقديم ومتابعتها. وبعد القبول نرافقك خطوة بخطوة في التمويل والتأمين والتأشيرة والسكن والوصول.",
    priority: "أولويتك الآن",
    language: "التقدم اللغوي",
    priorityParallelTitle: "ونحن نتقدم بالتوازي",
    priorityParallelText: "بينما تتقدم في الألمانية، نراجع البرامج ونحضّر الاختيار النهائي.",
    reassurance: "لا تحتاج إلى حل كل شيء اليوم. خطوتك التالية واضحة، ونحن نحافظ على رؤية المشروع كاملًا.",
    closingEyebrow: "ما يجب أن تتذكره اليوم",
    closingText: "هذا التقرير هو نقطة البداية. قبل الاختيار النهائي، نراجع معك النقاط المهمة ونؤكد معك الخطة الأنسب.",
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
    heroEyebrow: "Your project with Campus Allemagne",
    heroTitle: "Your Germany study project is taking shape.",
    summaryTitle: "What we see in your file today",
    summaryLead: "Your file is encouraging.",
    summaryText: "One path already stands out. Your priority now is B1. We keep moving the rest forward with you.",
    summarySignal: "What stands out",
    summaryAction: "Your priority now",
    summaryCampus: "Meanwhile, we",
    summaryCampusText: "We check the programmes and prepare the final selection with you.",
    outlookEyebrow: "Initial Campus Allemagne estimate",
    outlookStrong: "Strong admission chances",
    outlookGood: "Good admission potential",
    outlookNote: "We will confirm this initial estimate with you during the final review.",
    options: "Programmes we are reviewing for your project",
    featuredOption: "The path that stands out most today",
    otherOptions: "Other paths we are continuing to review",
    outlookSectionNote: "One path stands out today. The others stay open while we finish the checks. We review them with you before deciding.",
    languageIntro: "We will look with you for the B1 preparation option that best fits your situation.",
    togetherLabel: "Then, we decide together",
    togetherText: "We review the shortlist with you, then move on to the dossier, applications and the next steps.",
    humanTitle: "We review this report with you.",
    humanText: "You are not left alone with this result. A Campus Allemagne team member reviews the programmes that stand out, the remaining checks and the next decision with you.",
    humanCta: "Talk about my orientation with Campus Allemagne",
    why: "Why it stands out for you",
    confirmed: "Verified decision points",
    checking: "Still to confirm",
    verifiedStatus: "Info verified",
    progressStatus: "Verification in progress",
    unknownStatus: "To clarify",
    roles: "You move toward B1. We move the rest forward.",
    withYouEyebrow: "Campus Allemagne with you",
    roleYou: "You",
    roleCampus: "We",
    roleTogether: "What we prepare next with you",
    languagePaths: "Your options for progressing in German",
    campusLead: "Programmes, entry requirements, language, Studienkolleg where needed, deadlines and the application process.",
    campusCommitment: "Dossier, required documents, useful translations or legalisations, applications and follow-up. After admission, we guide you step by step through funding, insurance, visa, housing and arrival.",
    priority: "Your priority now",
    language: "Language progress",
    priorityParallelTitle: "We move forward in parallel",
    priorityParallelText: "While you progress in German, we check the programmes and prepare the final selection.",
    reassurance: "You do not need to solve everything today. Your next step is clear, and we keep the whole project in view.",
    closingEyebrow: "What to remember today",
    closingText: "This report is our starting point. Before the final selection, we review the important points with you and confirm the strategy.",
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
    heroEyebrow: "Dein Projekt mit Campus Allemagne",
    heroTitle: "Dein Studienprojekt für Deutschland nimmt Form an.",
    summaryTitle: "Was wir heute in deinem Profil sehen",
    summaryLead: "Dein Profil ist ermutigend.",
    summaryText: "Eine Option fällt bereits auf. Deine Priorität ist jetzt B1. Den Rest bringen wir mit dir weiter voran.",
    summarySignal: "Was heute auffällt",
    summaryAction: "Deine Priorität jetzt",
    summaryCampus: "Währenddessen wir",
    summaryCampusText: "Wir prüfen die Studiengänge und bereiten mit dir die finale Auswahl vor.",
    outlookEyebrow: "Erste Einschätzung von Campus Allemagne",
    outlookStrong: "Gute bis sehr gute Zulassungschancen",
    outlookGood: "Gutes Zulassungspotenzial",
    outlookNote: "Diese erste Einschätzung bestätigen wir mit dir in der abschließenden Prüfung.",
    options: "Studiengänge, die wir für dein Projekt prüfen",
    featuredOption: "Die Option, die heute am stärksten hervorsticht",
    otherOptions: "Weitere Optionen, die wir weiter prüfen",
    outlookSectionNote: "Heute fällt eine Option klar auf. Die anderen bleiben offen, während wir die Prüfungen abschließen. Vor der Entscheidung gehen wir alles mit dir durch.",
    languageIntro: "Wir schauen mit dir, welche B1-Vorbereitung am besten zu deiner Situation passt.",
    togetherLabel: "Dann entscheiden wir gemeinsam",
    togetherText: "Wir gehen die Shortlist mit dir durch und machen danach mit Unterlagen, Bewerbungen und den nächsten Schritten weiter.",
    humanTitle: "Wir gehen diesen Bericht mit dir durch.",
    humanText: "Du bleibst mit diesem Ergebnis nicht allein. Ein Mitglied des Campus-Allemagne-Teams geht mit dir die auffälligen Optionen, offenen Punkte und die nächste Entscheidung durch.",
    humanCta: "Meine Orientierung mit Campus Allemagne besprechen",
    why: "Warum sie für dich auffällt",
    confirmed: "Geprüfte Entscheidungspunkte",
    checking: "Noch zu klären",
    verifiedStatus: "Infos geprüft",
    progressStatus: "Prüfung läuft",
    unknownStatus: "Zu klären",
    roles: "Du gehst Richtung B1. Wir bringen den Rest weiter.",
    withYouEyebrow: "Campus Allemagne an deiner Seite",
    roleYou: "Du",
    roleCampus: "Wir",
    roleTogether: "Was wir als Nächstes mit dir vorbereiten",
    languagePaths: "Deine Wege für den Deutschfortschritt",
    campusLead: "Studiengänge, Zugangsvoraussetzungen, Sprache, Studienkolleg falls nötig, Fristen und Bewerbungsverfahren.",
    campusCommitment: "Unterlagen, notwendige Dokumente, Übersetzungen oder Legalisierungen, Bewerbungen und Nachverfolgung. Nach der Zulassung begleiten wir dich Schritt für Schritt durch Finanzierung, Versicherung, Visum, Wohnen und Ankunft.",
    priority: "Deine Priorität jetzt",
    language: "Sprachfortschritt",
    priorityParallelTitle: "Wir arbeiten parallel weiter",
    priorityParallelText: "Während du dein Deutsch verbesserst, prüfen wir die Studiengänge und bereiten die finale Auswahl vor.",
    reassurance: "Du musst heute nicht alles lösen. Dein nächster Schritt ist klar, und wir behalten das Gesamtprojekt im Blick.",
    closingEyebrow: "Was heute wichtig ist",
    closingText: "Dieser Bericht ist unser Ausgangspunkt. Vor der finalen Auswahl gehen wir die wichtigen Punkte mit dir durch und bestätigen die Strategie.",
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
      className: "bg-[var(--accent-light)] text-[var(--accent-strong)] ring-1 ring-inset ring-[var(--accent)]",
    };
  }
  if (option.overallStatus === "needs_review") {
    return {
      label: t.progressStatus,
      className: "bg-[var(--surface-subtle)] text-[var(--foreground)] ring-1 ring-inset ring-[var(--border)]",
    };
  }
  return {
    label: t.unknownStatus,
    className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  };
}

function highlightedFacts(
  option: OrientationPublicPersonalizedOption,
  answers: PublicOrientationAnswers | null,
) {
  const targetDeadline =
    answers?.targetIntakeSeason === "winter"
      ? "winter_deadline"
      : answers?.targetIntakeSeason === "summer"
        ? "summer_deadline"
        : null;

  return option.facts
    .filter((fact) => {
      if (fact.status !== "verified" || !factPriority.includes(fact.field)) return false;
      if (
        targetDeadline
        && (fact.field === "winter_deadline" || fact.field === "summer_deadline")
        && fact.field !== targetDeadline
      ) {
        return false;
      }
      if (
        fact.field === "winter_deadline"
        || fact.field === "summer_deadline"
      ) {
        const value = String(fact.value || "");
        if (
          value.length > 44
          || /applicants?|candidates?|bewerber|non[- ]?eu|eu applicants?/i.test(value)
        ) {
          return false;
        }
      }
      return true;
    })
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

function decisionFactParts(
  fact: OrientationPublicPersonalizedFact,
  locale: Locale,
) {
  const value = formatFactValue(fact.value, locale);
  let text = value ? String(value) : factLabels[locale][fact.field];

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
  } else if (fact.field === "application_route") {
    const direct = /^direct(?:e|ly)?$/i.test(text.trim());
    if (direct) {
      text = { fr: "directe", ar: "مباشر", en: "direct", de: "direkt" }[locale];
    }
  } else if (fact.field === "tuition_or_semester_fees") {
    const euro = text.match(/€\s?([\d.,]+)|([\d.,]+)\s?€/i);
    const amount = euro?.[1] || euro?.[2];
    if (amount) {
      const cleanAmount = amount.replace(/,(?=\d{3}\b)/g, ".");
      text = {
        fr: `env. ${cleanAmount} € / semestre`,
        ar: `حوالي ${cleanAmount} € / فصل دراسي`,
        en: `about €${cleanAmount} / semester`,
        de: `ca. ${cleanAmount} € / Semester`,
      }[locale];
    }
  }

  return {
    label: compactFactPrefixes[locale][fact.field] || factLabels[locale][fact.field],
    value: text,
  };
}

function admissionOutlook(
  text: string,
  locale: Locale,
) {
  const patterns: Record<Locale, { strong: RegExp; good: RegExp }> = {
    fr: {
      strong: /première estimation Campus Allemagne\s*:\s*fortes chances d[’']admission[^.]*\.?/i,
      good: /première estimation Campus Allemagne\s*:\s*bon potentiel d[’']admission[^.]*\.?/i,
    },
    ar: {
      strong: /التقدير الأولي من Campus Allemagne[^.؟!]*فرص القبول قوية[^.؟!]*[.؟!]?/i,
      good: /التقدير الأولي من Campus Allemagne[^.؟!]*(?:فرصة قبول جيدة|إمكانات جيدة للقبول)[^.؟!]*[.؟!]?/i,
    },
    en: {
      strong: /initial Campus Allemagne estimate\s*:\s*strong admission chances[^.]*\.?/i,
      good: /initial Campus Allemagne estimate\s*:\s*good admission potential[^.]*\.?/i,
    },
    de: {
      strong: /erste Einschätzung von Campus Allemagne\s*:\s*(?:gute bis sehr gute|starke) Zulassungschancen[^.]*\.?/i,
      good: /erste Einschätzung von Campus Allemagne\s*:\s*gutes Zulassungspotenzial[^.]*\.?/i,
    },
  };

  const strong = patterns[locale].strong.test(text);
  const good = !strong && patterns[locale].good.test(text);
  const cleaned = text
    .replace(patterns[locale].strong, "")
    .replace(patterns[locale].good, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s*[.,;:]\s*/, "")
    .trim();

  return {
    level: strong ? "strong" as const : good ? "good" as const : null,
    cleanWhy: cleaned || text,
  };
}

function summarySignalText(
  locale: Locale,
  strongCount: number,
  total: number,
) {
  if (locale === "ar") {
    return strongCount > 0
      ? `${strongCount} من المسارات تظهر فرص قبول قوية في التقدير الأولي.`
      : `${total} مسارات تحمل مؤشرات إيجابية نواصل دراستها.`;
  }
  if (locale === "en") {
    return strongCount > 0
      ? `${strongCount} path${strongCount > 1 ? "s" : ""} stand out with strong admission chances in the initial estimate.`
      : `${total} paths show positive signals that we are continuing to develop.`;
  }
  if (locale === "de") {
    return strongCount > 0
      ? `${strongCount} Option${strongCount > 1 ? "en" : ""} ${strongCount > 1 ? "fallen" : "fällt"} in der ersten Einschätzung mit guten bis sehr guten Zulassungschancen auf.`
      : `${total} Optionen zeigen positive Signale, die wir weiter vertiefen.`;
  }
  return strongCount > 0
    ? `${strongCount} piste${strongCount > 1 ? "s" : ""} ressort${strongCount > 1 ? "ent" : ""} avec de fortes chances d’admission en première estimation.`
    : `${total} pistes présentent des signaux positifs que nous continuons à approfondir.`;
}

function splitGuidanceChoice(choice: string, locale: Locale) {
  const separator = choice.indexOf(":");
  const title = separator < 0 ? choice.trim() : choice.slice(0, separator).trim();

  const concise: Record<Locale, Record<string, string>> = {
    fr: {
      Tunisie: "Préparation avec une solution partenaire disponible en Tunisie.",
      "En ligne": "Préparation à distance adaptée à votre niveau.",
      Allemagne: "Préparation en Allemagne lorsque votre situation le permet.",
    },
    ar: {
      تونس: "تحضير مع حل شريك متاح في تونس.",
      "عبر الإنترنت": "تحضير عن بُعد مناسب لمستواك.",
      ألمانيا: "تحضير في ألمانيا عندما تسمح وضعيتك بذلك.",
    },
    en: {
      Tunisia: "Preparation with an available partner option in Tunisia.",
      Online: "Remote preparation suited to your level.",
      Germany: "Preparation in Germany when your situation allows it.",
    },
    de: {
      Tunesien: "Vorbereitung mit einer verfügbaren Partnerlösung in Tunesien.",
      Online: "Online-Vorbereitung passend zu deinem Niveau.",
      Deutschland: "Vorbereitung in Deutschland, wenn deine Situation es erlaubt.",
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
  const optionOutlooks = new Map(
    content.studyOptions.map((option) => [
      option.optionId,
      admissionOutlook(option.whyItFits, locale),
    ]),
  );
  const strongOutlookCount = [...optionOutlooks.values()].filter(
    (outlook) => outlook.level === "strong",
  ).length;
  const featuredOption =
    content.studyOptions.find(
      (option) => optionOutlooks.get(option.optionId)?.level === "strong",
    )
    || content.studyOptions[0]
    || null;
  const otherOptions = featuredOption
    ? content.studyOptions.filter((option) => option.optionId !== featuredOption.optionId)
    : content.studyOptions;

  return (
    <article className="space-y-7 sm:space-y-8">
      <header className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--foreground)] px-5 py-6 text-white shadow-[var(--shadow-card)] sm:px-8 sm:py-7">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-[var(--brand)]" />
        <div className="relative max-w-4xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--brand)]" />
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
        className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5"
      >
        <div className="max-w-4xl">
          <h4 id="orientation-summary" className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)]">
            {t.summaryTitle}
          </h4>
          <p className="mt-1.5 max-w-3xl text-base font-semibold leading-6 text-[var(--foreground)]">
            {t.summaryLead}
          </p>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            {t.summaryText}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-[var(--radius-control)] bg-[var(--surface)] p-3.5 ring-1 ring-inset ring-[var(--border)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent-strong)]">{t.summarySignal}</p>
              <p className="mt-1.5 text-sm font-semibold leading-5 text-[var(--foreground)]">
                {summarySignalText(locale, strongOutlookCount, content.studyOptions.length)}
              </p>
            </div>
            <div className="rounded-[var(--radius-control)] bg-[var(--surface)] p-3.5 ring-1 ring-inset ring-[var(--border)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--brand-strong)]">{t.summaryAction}</p>
              <p className="mt-1.5 text-sm font-semibold leading-5 text-[var(--foreground)]">
                {content.mainPriority.title}
              </p>
            </div>
            <div className="rounded-[var(--radius-control)] bg-[var(--brand-soft)] p-3.5 ring-1 ring-inset ring-[var(--brand-border)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--brand-strong)]">{t.summaryCampus}</p>
              <p className="mt-1.5 text-sm font-medium leading-5 text-[var(--foreground)]">
                {t.summaryCampusText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="orientation-premium-options">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
              {t.options}
            </p>
            <h4 id="orientation-premium-options" className="mt-1 text-2xl font-semibold tracking-tight">
              {t.featuredOption}
            </h4>
          </div>
          <span className="text-xs font-semibold text-[var(--muted)]">
            {result.selected.length} {t.pathsCount}
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {t.outlookSectionNote}
        </p>

        {featuredOption ? (() => {
          const selected = result.selected.find((item) => item.optionId === featuredOption.optionId);
          const status = selected ? optionStatus(selected, locale) : null;
          const facts = selected ? highlightedFacts(selected, answers) : [];
          const outlook = optionOutlooks.get(featuredOption.optionId) || {
            level: null,
            cleanWhy: featuredOption.whyItFits,
          };

          return (
            <article
              className="mt-5 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
            >
              <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(17rem,0.92fr)]">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--brand-strong)]">
                        {String(featuredOption.position).padStart(2, "0")}
                      </p>
                      <h5 className="mt-1 text-2xl font-semibold leading-tight tracking-tight">
                        {featuredOption.programme}
                      </h5>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        {featuredOption.institution}{featuredOption.city ? ` · ${featuredOption.city}` : ""}
                      </p>
                    </div>
                    {status ? (
                      <span className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    ) : null}
                  </div>

                  {outlook.level ? (
                    <div className="mt-5 border-s-4 border-[var(--brand)] ps-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--brand-strong)]">
                        {t.outlookEyebrow}
                      </p>
                      <p className="mt-1 text-xl font-bold leading-6 text-[var(--foreground)]">
                        {outlook.level === "strong" ? t.outlookStrong : t.outlookGood}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{t.why}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{outlook.cleanWhy}</p>
                  </div>

                  <div className="mt-5 border-t border-[var(--border)] pt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--brand-strong)]">{t.checking}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {featuredOption.verificationNote}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] bg-[var(--surface-subtle)] p-5 sm:p-6 lg:border-s lg:border-t-0">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent-strong)]">
                    {t.confirmed}
                  </p>
                  {facts.length ? (
                    <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {facts.map((fact) => {
                        const parts = decisionFactParts(fact, locale);
                        return (
                          <div
                            key={fact.field}
                            className="rounded-[var(--radius-control)] bg-[var(--surface)] px-3.5 py-3 ring-1 ring-inset ring-[var(--border)]"
                          >
                            <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--accent-strong)]">
                              {parts.label}
                            </dt>
                            <dd className="mt-1 break-words text-sm font-semibold leading-5 text-[var(--foreground)]">
                              {parts.value}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t.noFacts}</p>
                  )}
                </div>
              </div>
            </article>
          );
        })() : null}

        {otherOptions.length ? (
          <div className="mt-7">
            <h5 className="text-lg font-semibold tracking-tight">{t.otherOptions}</h5>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {otherOptions.map((option) => {
                const selected = result.selected.find((item) => item.optionId === option.optionId);
                const status = selected ? optionStatus(selected, locale) : null;
                const outlook = optionOutlooks.get(option.optionId) || {
                  level: null,
                  cleanWhy: option.whyItFits,
                };

                return (
                  <article
                    key={option.optionId}
                    className="professional-hover flex flex-col rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--brand-strong)]">
                          {String(option.position).padStart(2, "0")}
                        </p>
                        <h6 className="mt-1 text-base font-semibold leading-5">{option.programme}</h6>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {option.institution}{option.city ? ` · ${option.city}` : ""}
                        </p>
                      </div>
                      {status ? (
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      ) : null}
                    </div>

                    {outlook.level ? (
                      <div
                        className={`mt-4 rounded-[var(--radius-control)] px-3 py-2.5 ${
                          outlook.level === "strong"
                            ? "bg-[var(--brand-soft)]"
                            : "bg-[var(--accent-light)]"
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
                          {t.outlookEyebrow}
                        </p>
                        <p className="mt-1 text-sm font-bold leading-5 text-[var(--foreground)]">
                          {outlook.level === "strong" ? t.outlookStrong : t.outlookGood}
                        </p>
                      </div>
                    ) : null}

                    <p className="mt-4 text-sm leading-6 text-[var(--foreground)]">{outlook.cleanWhy}</p>

                    <div className="mt-auto border-t border-[var(--border)] pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--brand-strong)]">{t.checking}</p>
                      <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">{option.verificationNote}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section
        aria-labelledby="orientation-main-priority"
        className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5 sm:p-6"
      >
        <div aria-hidden="true" className="absolute inset-y-0 start-0 w-0.5 bg-[var(--brand)]" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)]">
          <div>
            <p className="text-xs font-semibold text-[var(--brand-strong)]">{t.priority}</p>
            <h4 id="orientation-main-priority" className="mt-2 text-2xl font-semibold tracking-tight">
              {content.mainPriority.title}
            </h4>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {content.mainPriority.text}
            </p>

            {content.languagePlan.show ? (
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
            ) : (
              <p className="mt-4 text-sm font-semibold leading-6">
                {content.mainPriority.nextStep}
              </p>
            )}
          </div>

          <aside className="rounded-[var(--radius-control)] bg-[var(--surface)] p-4 ring-1 ring-inset ring-[var(--border)]">
            <p className="text-xs font-bold text-[var(--foreground)]">{t.priorityParallelTitle}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.priorityParallelText}</p>
          </aside>
        </div>

        {content.languagePlan.show && languageChoices.length ? (
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent-strong)]">{t.languagePaths}</p>
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.languageIntro}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {languageChoices.map((choice) => (
                <div
                  key={choice.title}
                  className="rounded-[var(--radius-control)] bg-[var(--surface)] p-3.5 ring-1 ring-inset ring-[var(--border)]"
                >
                  <p className="text-sm font-semibold">{choice.title}</p>
                  {choice.text ? (
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{choice.text}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

      </section>

      <section aria-labelledby="orientation-responsibilities">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
          {t.withYouEyebrow}
        </p>
        <h4 id="orientation-responsibilities" className="mt-1 max-w-3xl text-2xl font-semibold tracking-tight">
          {t.roles}
        </h4>

        <div className="mt-5 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--brand-strong)]">
              {t.roleYou}
            </p>
            <p className="mt-3 text-base font-semibold leading-6 text-[var(--foreground)]">{roleTexts[0]}</p>
          </div>

          <div className="hidden items-center justify-center px-1 text-xl font-bold text-[var(--accent-strong)] md:flex" aria-hidden="true">
            →
          </div>

          <div className="rounded-[var(--radius-panel)] bg-[var(--foreground)] p-5 text-white sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
              {t.roleCampus}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/[0.82]">{t.priorityParallelText}</p>
          </div>
        </div>

        <div className="mt-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--accent-light)] px-4 py-4 sm:px-5">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent-strong)]">{t.togetherLabel}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">{t.togetherText}</p>
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
                  className={`h-1.5 rounded-full ${
                    completed
                      ? "bg-[var(--accent)]"
                      : current
                        ? "bg-[var(--brand)]"
                        : "bg-[var(--border)]"
                  }`}
                />
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      completed
                        ? "bg-[var(--accent-light)] text-[var(--accent-strong)]"
                        : current
                          ? "bg-[var(--brand)] text-white"
                          : "bg-[var(--surface-subtle)] text-[var(--muted)]"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </span>
                  <p className={`text-xs leading-5 ${current ? "font-bold text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                    {step}
                  </p>
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
                className="relative flex min-h-12 gap-3 ps-1"
              >
                {index < t.journeySteps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`absolute start-[0.83rem] top-7 h-[calc(100%-0.25rem)] w-px ${index < journeyStep ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  />
                ) : null}
                <span
                  className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    completed
                      ? "bg-[var(--accent-light)] text-[var(--accent-strong)]"
                      : current
                        ? "bg-[var(--brand)] text-white"
                        : "bg-[var(--surface-subtle)] text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </span>
                <p className={`pb-4 text-sm leading-6 ${current ? "font-bold" : "text-[var(--muted)]"}`}>
                  {step}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--brand-strong)]">{t.journeyCurrent}</p>
          <p className="mt-1.5 text-base font-semibold text-[var(--foreground)]">{t.journeySteps[journeyStep]}</p>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.journeyCurrentText[journeyStep]}</p>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--foreground)] px-5 py-5 text-white sm:px-6 sm:py-6">
        <div aria-hidden="true" className="absolute inset-y-0 start-0 w-1 bg-[var(--brand)]" />
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{t.closingEyebrow}</p>
        <h4 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight">{t.humanTitle}</h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/[0.78]">{t.humanText}</p>
        {showCta ? (
          <a
            href="#orientation-prospect-capture"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
          >
            {t.humanCta}
          </a>
        ) : null}
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
