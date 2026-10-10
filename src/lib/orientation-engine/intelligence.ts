import "server-only";

import { writeOrientationLetterWithGemini } from "@/lib/orientation-engine/letter/gemini";

import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { hasPreferredCityCatalogueMatch } from "@/lib/orientation-engine/service";
import type {
  OrientationEngineResult,
  OrientationLetterOutput,
  OrientationScoutCandidate,
  OrientationScoutResult,
} from "@/lib/orientation-engine/types";

type Locale = "fr" | "ar" | "en" | "de";

type IntelligenceResult = {
  scout: OrientationScoutResult;
  letter: OrientationLetterOutput;
};

type GeminiInteraction = {
  output_text?: string;
  steps?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      annotations?: Array<{
        type?: string;
        url?: string;
        uri?: string;
        title?: string;
      }>;
    }>;
  }>;
};

type GeminiPayload = {
  letter?: {
    title?: unknown;
    paragraphs?: unknown;
    closing?: unknown;
  };
  candidates?: unknown;
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const cache = new Map<string, { expiresAt: number; value: IntelligenceResult }>();

const localeInstructions: Record<Locale, string> = {
  fr: "Écris en français simple, naturel et accessible à un lycéen tunisien. Évite le jargon administratif.",
  ar: "اكتب بالعربية الفصحى السهلة والواضحة لطالب تونسي. تجنب الأسلوب الإداري المعقد.",
  en: "Write in simple, natural English suitable for a student. Avoid administrative jargon.",
  de: "Schreibe in einfachem, natürlichem Deutsch für Studierende. Vermeide Verwaltungssprache.",
};

function preferredCity(profile: PublicOrientationAnswers) {
  return profile.preferredCities?.[0] || null;
}

const degreeLabels: Record<Locale, Record<string, string>> = {
  fr: { Bachelor: "Bachelor", Master: "Master" },
  ar: { Bachelor: "بكالوريوس", Master: "ماجستير" },
  en: { Bachelor: "Bachelor", Master: "Master" },
  de: { Bachelor: "Bachelor", Master: "Master" },
};

const fieldLabels: Record<Locale, Record<string, string>> = {
  fr: {
    "Ingénierie": "Ingénierie",
    "Informatique": "Informatique",
    "Économie/Gestion": "Économie / Gestion",
    "Architecture": "Architecture",
    "Sciences": "Sciences",
    "Médecine/Santé": "Médecine / Santé",
    "Lettres/Langues": "Lettres / Langues",
  },
  ar: {
    "Ingénierie": "الهندسة",
    "Informatique": "الإعلامية / علوم الحاسوب",
    "Économie/Gestion": "الاقتصاد / التصرف",
    "Architecture": "الهندسة المعمارية",
    "Sciences": "العلوم",
    "Médecine/Santé": "الطب / الصحة",
    "Lettres/Langues": "الآداب / اللغات",
  },
  en: {
    "Ingénierie": "Engineering",
    "Informatique": "Computer Science",
    "Économie/Gestion": "Economics / Management",
    "Architecture": "Architecture",
    "Sciences": "Sciences",
    "Médecine/Santé": "Medicine / Health",
    "Lettres/Langues": "Languages / Humanities",
  },
  de: {
    "Ingénierie": "Ingenieurwesen",
    "Informatique": "Informatik",
    "Économie/Gestion": "Wirtschaft / Management",
    "Architecture": "Architektur",
    "Sciences": "Naturwissenschaften",
    "Médecine/Santé": "Medizin / Gesundheit",
    "Lettres/Langues": "Sprachen / Geisteswissenschaften",
  },
};

const specialtyLabels: Record<Locale, Record<string, string>> = {
  fr: {
    computer_engineering: "Informatique / Computer Engineering",
    electrical_electronics: "Électrique / Électronique",
    mechanical: "Mécanique",
    mechatronics_robotics: "Mécatronique / Robotique",
    civil: "Génie civil",
    industrial_production: "Industriel / Production",
    automotive: "Automobile",
    aerospace: "Aéronautique / Aérospatial",
    energy: "Énergie",
  },
  ar: {
    computer_engineering: "هندسة الحاسوب / Computer Engineering",
    electrical_electronics: "الهندسة الكهربائية / الإلكترونية",
    mechanical: "الهندسة الميكانيكية",
    mechatronics_robotics: "الميكاترونيك / الروبوتات",
    civil: "الهندسة المدنية",
    industrial_production: "الهندسة الصناعية / الإنتاج",
    automotive: "هندسة السيارات",
    aerospace: "الطيران / الفضاء",
    energy: "الطاقة",
  },
  en: {
    computer_engineering: "Computer Engineering",
    electrical_electronics: "Electrical / Electronics Engineering",
    mechanical: "Mechanical Engineering",
    mechatronics_robotics: "Mechatronics / Robotics",
    civil: "Civil Engineering",
    industrial_production: "Industrial / Production Engineering",
    automotive: "Automotive Engineering",
    aerospace: "Aerospace Engineering",
    energy: "Energy Engineering",
  },
  de: {
    computer_engineering: "Computer Engineering",
    electrical_electronics: "Elektrotechnik / Elektronik",
    mechanical: "Maschinenbau",
    mechatronics_robotics: "Mechatronik / Robotik",
    civil: "Bauingenieurwesen",
    industrial_production: "Industrie / Produktion",
    automotive: "Fahrzeugtechnik",
    aerospace: "Luft- und Raumfahrt",
    energy: "Energietechnik",
  },
};

const scienceSpecialtyLabels: Record<Locale, Record<string, string>> = {
  fr: {
    biology_life_sciences: "Biologie / Sciences de la vie",
    chemistry: "Chimie",
    physics: "Physique",
    mathematics_sciences: "Mathématiques",
    earth_environment: "Sciences de la Terre / Environnement",
    undecided: "Sciences",
  },
  ar: {
    biology_life_sciences: "الأحياء / علوم الحياة",
    chemistry: "الكيمياء",
    physics: "الفيزياء",
    mathematics_sciences: "الرياضيات",
    earth_environment: "علوم الأرض / البيئة",
    undecided: "العلوم",
  },
  en: {
    biology_life_sciences: "Biology / Life Sciences",
    chemistry: "Chemistry",
    physics: "Physics",
    mathematics_sciences: "Mathematics",
    earth_environment: "Earth / Environmental Sciences",
    undecided: "Sciences",
  },
  de: {
    biology_life_sciences: "Biologie / Lebenswissenschaften",
    chemistry: "Chemie",
    physics: "Physik",
    mathematics_sciences: "Mathematik",
    earth_environment: "Geo- / Umweltwissenschaften",
    undecided: "Naturwissenschaften",
  },
};

function degreeAndField(locale: Locale, profile: PublicOrientationAnswers) {
  const engineeringSpecialty =
    profile.targetField === "Ingénierie" && profile.engineeringSpecialty
      ? specialtyLabels[locale][profile.engineeringSpecialty] || profile.engineeringSpecialty
      : "";
  const scienceSpecialty =
    profile.targetField === "Sciences" && profile.scienceSpecialty
      ? scienceSpecialtyLabels[locale][profile.scienceSpecialty] || profile.scienceSpecialty
      : "";
  const specialty = engineeringSpecialty || scienceSpecialty;
  const degree = degreeLabels[locale][profile.targetDegree] || profile.targetDegree;
  const field = fieldLabels[locale][profile.targetField] || profile.targetField;
  return specialty
    ? `${degree} · ${field} — ${specialty}`
    : `${degree} · ${field}`;
}

function academicOpening(locale: Locale, profile: PublicOrientationAnswers) {
  if (profile.bacStatus === "no_bac") {
    const lastDiploma = profile.lastDiploma || "";
    return {
      fr: `Votre point de départ est ${lastDiploma || "à préciser"}.`,
      ar: `نقطة انطلاقك الدراسية هي ${lastDiploma || "بحاجة إلى توضيح"}.`,
      en: `Your current academic starting point is ${lastDiploma || "to be confirmed"}.`,
      de: `Dein aktueller akademischer Ausgangspunkt ist ${lastDiploma || "noch zu klären"}.`,
    }[locale];
  }

  const track = profile.bacTrack || "";
  const year = profile.bacYear || "";
  const average = profile.generalAverage ? `${profile.generalAverage}/20` : "";

  const preparing = profile.bacStatus === "preparing";
  return {
    fr: preparing
      ? `Vous préparez un Bac ${track || "tunisien"}${year ? ` pour ${year}` : ""}${average ? ` avec une moyenne actuelle de ${average}` : ""}. Votre projet peut déjà être organisé de manière concrète.`
      : `Avec votre Bac ${track || "tunisien"}${year ? ` obtenu en ${year}` : ""}${average ? ` avec une moyenne de ${average}` : ""}, votre projet peut déjà être organisé de manière concrète.`,
    ar: preparing
      ? `أنت تستعد لبكالوريا ${track || "التونسية"}${year ? ` لسنة ${year}` : ""}${average ? ` بمعدل حالي ${average}` : ""}. يمكننا بالفعل تنظيم مشروعك بشكل عملي.`
      : `بشهادة البكالوريا ${track || "التونسية"}${year ? ` لسنة ${year}` : ""}${average ? ` وبمعدل ${average}` : ""}، يمكننا بالفعل تنظيم مشروعك بشكل عملي.`,
    en: preparing
      ? `You are preparing a ${track || "Tunisian"} Baccalaureate${year ? ` for ${year}` : ""}${average ? ` with a current average of ${average}` : ""}. Your project can already be organised concretely.`
      : `With your ${track || "Tunisian"} Baccalaureate${year ? ` from ${year}` : ""}${average ? ` and an average of ${average}` : ""}, your project can already be organised concretely.`,
    de: preparing
      ? `Du bereitest ein ${track || "tunesisches"} Baccalauréat${year ? ` für ${year}` : ""}${average ? ` mit einem aktuellen Durchschnitt von ${average}` : ""} vor. Dein Vorhaben kann bereits konkret geplant werden.`
      : `Mit deinem ${track || "tunesischen"} Baccalauréat${year ? ` aus dem Jahr ${year}` : ""}${average ? ` und einem Durchschnitt von ${average}` : ""} kann dein Vorhaben bereits konkret geplant werden.`,
  }[locale];
}

function deterministicLetter(
  locale: Locale,
  profile: PublicOrientationAnswers,
  engineResult: OrientationEngineResult,
): OrientationLetterOutput {
  const city = preferredCity(profile);
  const hasVerifiedOption =
    profile.bacStatus !== "no_bac"
    && engineResult.recommendations.length > 0;
  const project = degreeAndField(locale, profile);
  const opening = academicOpening(locale, profile);

  const copy = {
    fr: {
      title: "Votre orientation pour étudier en Allemagne",
      intro: `${opening} Vous souhaitez poursuivre en ${project}. Votre profil scolaire, votre niveau de langue et vos préférences nous donnent déjà une base concrète pour organiser la suite.`,
      academic: engineResult.academicAccessStatus === "likely_eligible"
        ? "Votre accès académique dispose déjà d’une base officielle vérifiée. La décision finale reste toujours celle de l’université."
        : "Votre accès académique doit encore être confirmé avec la règle officielle correspondant exactement à votre situation. Nous le vérifierons avec vous avant toute candidature.",
      language: `Votre niveau actuel est allemand ${profile.germanLevel || "à préciser"} et anglais ${profile.englishLevel || "à préciser"}. Nous allons comparer ces niveaux avec les exigences réelles des programmes retenus et définir la prochaine étape linguistique.`,
      city: city
        ? `Vous préférez étudier à ${city}. Nous gardons cette ville comme priorité, tout en restant ouverts à d’autres villes si elles offrent une meilleure piste pour votre projet.`
        : "Vous n’avez pas encore fixé de ville. C’est un avantage à ce stade : nous pouvons comparer plusieurs villes avant de retenir les meilleures pistes.",
      option: hasVerifiedOption
        ? "Nous avons déjà identifié des premières pistes à examiner. Elles servent de point de départ ; nous les comparerons avec vous avant de choisir les candidatures."
        : "Nous allons maintenant chercher des premières pistes adaptées à votre projet. L’objectif n’est pas de vous faire choisir seul, mais de préparer ensemble une sélection sérieuse avant les candidatures.",
      closing: "Votre prochaine étape est simple : continuer la préparation de la langue et du dossier, puis choisir avec Campus Allemagne les universités à vérifier et les candidatures à préparer.",
    },
    ar: {
      title: "توجيهك للدراسة في ألمانيا",
      intro: `${opening} ترغب في متابعة ${project}. ملفك الدراسي ومستواك اللغوي وتفضيلاتك تعطينا أساسًا عمليًا لتنظيم الخطوات القادمة.`,
      academic: engineResult.academicAccessStatus === "likely_eligible"
        ? "يوجد أساس رسمي موثّق لمسارك الأكاديمي. ويبقى قرار القبول النهائي دائمًا من اختصاص الجامعة."
        : "يجب تأكيد مسارك الأكاديمي وفق القاعدة الرسمية التي تنطبق بدقة على حالتك، وسنتحقق من ذلك معك قبل أي تقديم.",
      language: `مستواك الحالي هو الألمانية ${profile.germanLevel || "يجب تحديده"} والإنجليزية ${profile.englishLevel || "يجب تحديدها"}. سنقارن ذلك بالشروط الحقيقية للبرامج التي نختارها ونحدد معك الخطوة اللغوية التالية.`,
      city: city
        ? `تفضّل الدراسة في ${city}. سنعتبر هذه المدينة أولوية، مع إبقاء مدن أخرى مفتوحة إذا كانت توفر مسارًا أفضل لمشروعك.`
        : "لم تحدد مدينة بعد، وهذا مفيد في هذه المرحلة لأنه يسمح لنا بمقارنة عدة مدن قبل اختيار أفضل المسارات.",
      option: hasVerifiedOption
        ? "لدينا بالفعل مسارات أولية تستحق المراجعة. هي نقطة انطلاق، وسنقارنها معك قبل اختيار طلبات التقديم."
        : "سنبدأ الآن بالبحث عن مسارات أولية تناسب مشروعك. الهدف ليس أن تختار وحدك، بل أن نبني معًا قائمة جدية قبل التقديم.",
      closing: "الخطوة التالية بسيطة: واصل تحضير اللغة والملف، ثم نختار معك الجامعات التي سنراجعها وطلبات التقديم التي سنجهزها.",
    },
    en: {
      title: "Your orientation for studying in Germany",
      intro: `${opening} You want to continue with ${project}. Your academic profile, language level and preferences already give us a concrete base for the next steps.`,
      academic: engineResult.academicAccessStatus === "likely_eligible"
        ? "Your academic route already has a verified official basis. The final admission decision always remains with the university."
        : "Your academic access still needs to be confirmed against the official rule that applies exactly to your situation. We will verify it with you before any application.",
      language: `Your current levels are German ${profile.germanLevel || "to be confirmed"} and English ${profile.englishLevel || "to be confirmed"}. We will compare them with the real requirements of selected programmes and define the next language step.`,
      city: city
        ? `You prefer ${city}. We will keep it as a priority while staying open to other cities if they offer a stronger path for your project.`
        : "You have not fixed a city yet. That is useful at this stage because we can compare several places before selecting the strongest paths.",
      option: hasVerifiedOption
        ? "We have already identified first paths worth examining. They are a starting point; we will compare them with you before choosing applications."
        : "We will now look for first programme paths that fit your project. The goal is not to make you choose alone, but to prepare a serious shortlist together before applications.",
      closing: "Your next step is simple: continue preparing the language and documents, then choose with Campus Allemagne which universities to verify and which applications to prepare.",
    },
    de: {
      title: "Deine Orientierung für ein Studium in Deutschland",
      intro: `${opening} Du möchtest mit ${project} weitermachen. Dein schulisches Profil, deine Sprachen und deine Wünsche geben uns bereits eine konkrete Grundlage für die nächsten Schritte.`,
      academic: engineResult.academicAccessStatus === "likely_eligible"
        ? "Für deinen Hochschulzugang gibt es bereits eine geprüfte offizielle Grundlage. Die endgültige Zulassungsentscheidung trifft immer die Hochschule."
        : "Dein Hochschulzugang muss noch mit der genau passenden offiziellen Regel bestätigt werden. Das prüfen wir gemeinsam vor einer Bewerbung.",
      language: `Aktuell hast du Deutsch ${profile.germanLevel || "noch zu klären"} und Englisch ${profile.englishLevel || "noch zu klären"}. Wir vergleichen diese Niveaus mit den tatsächlichen Anforderungen der ausgewählten Programme und legen den nächsten Sprachschritt fest.`,
      city: city
        ? `Du bevorzugst ${city}. Diese Stadt bleibt Priorität, aber wir halten andere Städte offen, wenn sie eine bessere Studienoption für dein Projekt bieten.`
        : "Du hast noch keine Stadt festgelegt. Das ist in dieser Phase hilfreich, weil wir mehrere Orte vergleichen können, bevor wir die besten Optionen auswählen.",
      option: hasVerifiedOption
        ? "Wir haben bereits erste Studienoptionen identifiziert, die wir gemeinsam prüfen können. Sie sind ein Ausgangspunkt; vor Bewerbungen vergleichen wir weitere Möglichkeiten."
        : "Wir suchen jetzt nach ersten Studienoptionen, die zu deinem Projekt passen. Du sollst nicht allein entscheiden; wir erstellen gemeinsam eine seriöse Auswahl vor den Bewerbungen.",
      closing: "Der nächste Schritt ist einfach: Sprache und Unterlagen weiter vorbereiten und anschließend gemeinsam mit Campus Allemagne die zu prüfenden Hochschulen und Bewerbungen auswählen.",
    },
  }[locale];

  const routeOption = profile.bacStatus === "no_bac"
    ? {
        fr: "Nous ne proposons pas encore d’université à ce stade. Nous clarifions d’abord avec vous la voie académique qui correspond à votre situation.",
        ar: "لا نقترح جامعة في هذه المرحلة بعد. نوضح أولاً معك المسار الأكاديمي المناسب لوضعك.",
        en: "We are not proposing a university at this stage yet. We first clarify the academic route that fits your situation.",
        de: "In dieser Phase schlagen wir noch keine Hochschule vor. Zuerst klären wir gemeinsam den akademischen Weg, der zu deiner Situation passt.",
      }[locale]
    : copy.option;
  const routeClosing = profile.bacStatus === "no_bac"
    ? {
        fr: "Votre prochaine étape est de clarifier votre situation académique avec Campus Allemagne ; les universités viendront ensuite, lorsque la voie sera suffisamment établie.",
        ar: "خطوتك التالية هي توضيح وضعك الأكاديمي مع Campus Allemagne؛ ننتقل إلى الجامعات بعد تحديد المسار بشكل كافٍ.",
        en: "Your next step is to clarify your academic situation with Campus Allemagne; universities come afterwards, once the route is sufficiently established.",
        de: "Dein nächster Schritt ist, deine akademische Situation mit Campus Allemagne zu klären; Hochschulen folgen erst, wenn der passende Weg ausreichend feststeht.",
      }[locale]
    : copy.closing;

  return {
    provider: "deterministic-letter-v1",
    mode: "deterministic",
    title: copy.title,
    paragraphs: [copy.intro, copy.academic, copy.language, copy.city, routeOption],
    closing: routeClosing,
    scoutUsed: false,
  };
}

function disabledScout(): OrientationScoutResult {
  return {
    provider: "disabled",
    mode: "disabled",
    status: "disabled",
    candidates: [],
    citationUrls: [],
  };
}

function normalizeUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function citedHosts(response: GeminiInteraction) {
  const urls = new Set<string>();
  for (const step of response.steps || []) {
    for (const block of step.content || []) {
      for (const annotation of block.annotations || []) {
        if (annotation.type !== "url_citation") continue;
        const url = normalizeUrl(annotation.url || annotation.uri);
        if (url) urls.add(url);
      }
    }
  }
  return urls;
}

function sameCitationHost(candidateUrl: string, citationUrls: Set<string>) {
  const host = new URL(candidateUrl).hostname.replace(/^www\./, "");
  return [...citationUrls].some((value) => {
    const citationHost = new URL(value).hostname.replace(/^www\./, "");
    return citationHost === host || citationHost.endsWith(`.${host}`) || host.endsWith(`.${citationHost}`);
  });
}

function parseCandidates(value: unknown, citationUrls: Set<string>): OrientationScoutCandidate[] {
  if (!Array.isArray(value)) return [];

  const candidates: OrientationScoutCandidate[] = [];
  for (const raw of value.slice(0, 5)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const institution = typeof item.institution === "string" ? item.institution.trim() : "";
    const programme = typeof item.programme === "string" ? item.programme.trim() : "";
    const city = typeof item.city === "string" && item.city.trim() ? item.city.trim() : null;
    const reason = typeof item.reason === "string" ? item.reason.trim() : "";
    const officialUrl = normalizeUrl(item.official_url);

    if (!institution || !programme || !reason || !officialUrl) continue;
    if (!sameCitationHost(officialUrl, citationUrls)) continue;

    candidates.push({
      institution: institution.slice(0, 160),
      programme: programme.slice(0, 180),
      city: city?.slice(0, 100) || null,
      officialUrl,
      reason: reason.slice(0, 320),
      verificationStatus: "research_candidate",
    });
  }

  return candidates.slice(0, 3);
}

function parseLetter(
  value: GeminiPayload["letter"],
  fallback: OrientationLetterOutput,
  scoutUsed: boolean,
): OrientationLetterOutput {
  if (!value || typeof value !== "object") return fallback;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const closing = typeof value.closing === "string" ? value.closing.trim() : "";
  const paragraphs = Array.isArray(value.paragraphs)
    ? value.paragraphs
        .filter((paragraph): paragraph is string => typeof paragraph === "string")
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .slice(0, 6)
    : [];

  if (!title || !closing || paragraphs.length < 3) return fallback;

  return {
    provider: "gemini-grounded-v1",
    mode: "grounded_ai",
    title: title.slice(0, 180),
    paragraphs: paragraphs.map((paragraph) => paragraph.slice(0, 900)),
    closing: closing.slice(0, 700),
    scoutUsed,
  };
}

function requestKey(locale: Locale, profile: PublicOrientationAnswers, engineResult: OrientationEngineResult) {
  return JSON.stringify({
    locale,
    bacStatus: profile.bacStatus,
    bacYear: profile.bacYear,
    bacTrack: profile.bacTrack,
    generalAverage: profile.generalAverage,
    higherEducationStatus: profile.higherEducationStatus,
    currentStudyField: profile.currentStudyField,
    universitySemesters: profile.universitySemesters,
    studyIntent: profile.studyIntent,
    targetSpecialization: profile.targetSpecialization,
    targetDegree: profile.targetDegree,
    targetField: profile.targetField,
    engineeringSpecialty: profile.engineeringSpecialty,
    scienceSpecialty: profile.scienceSpecialty,
    germanLevel: profile.germanLevel,
    englishLevel: profile.englishLevel,
    studyLanguage: profile.studyLanguage,
    targetIntakeSeason: profile.targetIntakeSeason,
    targetIntakeYear: profile.targetIntakeYear,
    preferredCities: profile.preferredCities,
    verifiedIds: engineResult.recommendations.map((item) => item.programme.id),
  });
}

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
  while (cache.size > MAX_CACHE_ENTRIES) {
    const first = cache.keys().next().value;
    if (!first) break;
    cache.delete(first);
  }
}

function buildPrompt(
  locale: Locale,
  profile: PublicOrientationAnswers,
  engineResult: OrientationEngineResult,
) {
  const verified = engineResult.recommendations.map((item) => ({
    programme: item.programme.name,
    university: item.programme.university.name,
    city: item.programme.university.city,
    teaching_language: item.programme.teachingLanguage,
    programme_source: item.programme.programmeSourceUrl,
    status: item.status,
  }));

  const profileFacts = {
    bac_status: profile.bacStatus,
    bac_year: profile.bacYear,
    bac_track: profile.bacTrack,
    average_out_of_20: profile.generalAverage,
    higher_education_status: profile.higherEducationStatus,
    current_study_field: profile.currentStudyField,
    university_semesters: profile.universitySemesters,
    study_intent: profile.studyIntent,
    target_specialization: profile.targetSpecialization,
    target_degree: profile.targetDegree,
    target_field: profile.targetField,
    engineering_specialty: profile.engineeringSpecialty,
    science_specialty: profile.scienceSpecialty,
    german_level: profile.germanLevel,
    english_level: profile.englishLevel,
    preferred_study_language: profile.studyLanguage,
    preferred_cities: profile.preferredCities,
    target_intake: profile.targetIntakeSeason && profile.targetIntakeYear
      ? `${profile.targetIntakeSeason} ${profile.targetIntakeYear}`
      : null,
  };

  return [
    "You are the research-and-writing assistant for Campus Allemagne.",
    localeInstructions[locale],
    "This is a FIRST-CONTACT orientation for a prospective student, not an admission decision.",
    "Use the structured facts below exactly. Never invent admission eligibility, deadlines, required grades, diploma equivalence, language thresholds, Studienkolleg rules or visa outcomes.",
    "Write a short personalised orientation letter. Do not mention internal catalogue limitations, scores, AI, databases or technical status codes.",
    "Do not promise that admission exists. Use wording such as 'piste à examiner', 'nous vérifierons ensemble', or the equivalent in the requested language.",
    "Use the supplied higher-education status and study intent when present. Never describe interrupted studies as current enrolment, and never promise transfer or credit recognition.",
    "For programme discovery, use Google Search and return up to three Bachelor programme candidates from official German university pages. Search beyond the existing catalogue when useful.",
    "The candidates are research leads only. Do not say the student is eligible for them. Prefer the requested city, but if too narrow you may suggest another German city and explain why.",
    "Do not put university names inside the letter paragraphs; university candidates are displayed separately and will be human-verified.",
    "Student facts:",
    JSON.stringify(profileFacts),
    "Already verified catalogue options (may be empty):",
    JSON.stringify(verified),
  ].join("\n");
}

const responseSchema = {
  type: "object",
  properties: {
    letter: {
      type: "object",
      properties: {
        title: { type: "string" },
        paragraphs: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 6,
        },
        closing: { type: "string" },
      },
      required: ["title", "paragraphs", "closing"],
    },
    candidates: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          programme: { type: "string" },
          city: { type: ["string", "null"] },
          official_url: { type: "string" },
          reason: { type: "string" },
        },
        required: ["institution", "programme", "city", "official_url", "reason"],
      },
    },
  },
  required: ["letter", "candidates"],
} as const;

async function buildLegacyOrientationIntelligence(
  locale: Locale,
  profile: PublicOrientationAnswers,
  engineResult: OrientationEngineResult,
): Promise<IntelligenceResult> {
  const fallbackLetter = deterministicLetter(locale, profile, engineResult);
  const apiKey = process.env.GEMINI_API_KEY;

  if (
    hasPreferredCityCatalogueMatch(engineResult)
    || profile.bacStatus === "no_bac"
    || profile.targetDegree !== "Bachelor"
    || process.env.ALMAGO_ORIENTATION_AI_SCOUT !== "gemini"
    || !apiKey
  ) {
    return {
      scout: disabledScout(),
      letter: fallbackLetter,
    };
  }

  const key = requestKey(locale, profile, engineResult);
  pruneCache();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        model: process.env.ALMAGO_ORIENTATION_AI_MODEL || "gemini-3.8-flash",
        input: buildPrompt(locale, profile, engineResult),
        tools: [{ type: "google_search" }],
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: responseSchema,
        },
        generation_config: {
          temperature: 0.2,
        },
      }),
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });

    if (!response.ok) throw new Error("orientation-ai-provider");

    const interaction = await response.json() as GeminiInteraction;
    if (!interaction.output_text) throw new Error("orientation-ai-empty");

    const parsed = JSON.parse(interaction.output_text) as GeminiPayload;
    const citations = citedHosts(interaction);
    const candidates = parseCandidates(parsed.candidates, citations);
    const letter = parseLetter(parsed.letter, fallbackLetter, candidates.length > 0);
    const value: IntelligenceResult = {
      scout: {
        provider: "gemini-grounded-v1",
        mode: "grounded_ai",
        status: candidates.length > 0 ? "ready" : "unavailable",
        candidates,
        citationUrls: [...citations].slice(0, 12),
      },
      letter,
    };

    cache.set(key, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      value,
    });
    pruneCache();

    return value;
  } catch {
    return {
      scout: {
        provider: "gemini-grounded-v1",
        mode: "grounded_ai",
        status: "unavailable",
        candidates: [],
        citationUrls: [],
      },
      letter: fallbackLetter,
    };
  }
}


/**
 * The exploratory Gemini scout and the user-visible AI letter have independent
 * availability. A catalogue match or scout failure must never by itself
 * disable Gemini copywriting. Keep the verified result as the source of facts.
 */
export async function buildOrientationIntelligence(
  locale: Locale,
  profile: PublicOrientationAnswers,
  engineResult: OrientationEngineResult,
  options: { generateLetter?: boolean } = {},
): Promise<IntelligenceResult> {
  const result = await buildLegacyOrientationIntelligence(locale, profile, engineResult);
  if (options.generateLetter === false || result.letter.mode !== "deterministic") {
    return result;
  }
  const letter = await writeOrientationLetterWithGemini(locale, result.letter);
  return { ...result, letter };
}
