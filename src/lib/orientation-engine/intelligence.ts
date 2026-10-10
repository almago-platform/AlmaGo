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

function personalBudgetNote(locale: Locale, budget: string): string {
  const amounts: Record<string, Record<Locale, string>> = {
    "Moins de 800 € / mois": {
      fr: "moins de 800 € par mois", ar: "أقل من 800 يورو شهريًا",
      en: "under €800 per month", de: "unter 800 € pro Monat",
    },
    "800–1 000 € / mois": {
      fr: "800 à 1 000 € par mois", ar: "بين 800 و1 000 يورو شهريًا",
      en: "€800–1,000 per month", de: "800 bis 1.000 € pro Monat",
    },
    "1 000–1 200 € / mois": {
      fr: "1 000 à 1 200 € par mois", ar: "بين 1 000 و1 200 يورو شهريًا",
      en: "€1,000–1,200 per month", de: "1.000 bis 1.200 € pro Monat",
    },
    "Plus de 1 200 € / mois": {
      fr: "plus de 1 200 € par mois", ar: "أكثر من 1 200 يورو شهريًا",
      en: "over €1,200 per month", de: "über 1.200 € pro Monat",
    },
  };
  const amount = amounts[budget]?.[locale];
  if (!amount) return "";
  return {
    fr: `Vous prévoyez un budget de ${amount}. Nous en tiendrons compte dans la recherche des options à étudier, sans présumer du coût réel de chaque ville.`,
    ar: `ميزانيتك المعلنة هي ${amount}. سنأخذها في الاعتبار عند دراسة الخيارات، دون افتراض تكلفة المعيشة في أي مدينة.`,
    en: `You have indicated a budget of ${amount}. We will take it into account when exploring options, without assuming the actual cost of any city.`,
    de: `Du hast ein Budget von ${amount} angegeben. Wir beziehen es in die Suche nach Möglichkeiten ein, ohne die tatsächlichen Kosten einer Stadt vorauszusetzen.`,
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
  const budgetNote = personalBudgetNote(locale, profile.budgetRange);

  const copy = {
    fr: {
      title: "Votre orientation pour étudier en Allemagne",
      intro: `${opening} Vous souhaitez poursuivre en ${project}. Votre profil scolaire, votre niveau de langue et vos préférences nous donnent déjà une base concrète pour organiser la suite.`,
      academic: engineResult.academicAccessStatus === "likely_eligible"
        ? "Votre accès académique dispose déjà d’une base officielle vérifiée. La décision finale reste toujours celle de l’université."
        : "Votre projet mérite une étude adaptée à votre diplôme. L’accès universitaire n’est pas encore confirmé ; si vous poursuivez avec Campus Allemagne, notre équipe examinera les critères avant toute candidature.",
      language: `Vous indiquez un niveau ${profile.germanLevel || "à préciser"} en allemand et ${profile.englishLevel || "à préciser"} en anglais. Ces informations nous aideront à explorer les programmes et à étudier les certificats demandés si vous poursuivez avec nous.`,
      city: city
        ? `Vous préférez étudier à ${city}. Nous gardons cette ville comme priorité, tout en restant ouverts à d’autres villes si elles offrent une meilleure piste pour votre projet.`
        : "Vous n’avez pas encore fixé de ville. C’est un avantage à ce stade : nous pouvons comparer plusieurs villes avant de retenir les meilleures pistes.",
      option: hasVerifiedOption
        ? "Nous avons déjà identifié des premières pistes à examiner. Elles servent de point de départ ; nous les comparerons avec vous avant de choisir les candidatures."
        : "Nous allons maintenant chercher des premières pistes adaptées à votre projet. L’objectif n’est pas de vous faire choisir seul, mais de préparer ensemble une sélection sérieuse avant les candidatures.",
      closing: "Vous nous avez présenté votre projet. Si vous choisissez de continuer avec Campus Allemagne, notre équipe étudiera les possibilités et vous accompagnera vers les candidatures adaptées.",
    },
    ar: {
      title: "توجيهك للدراسة في ألمانيا",
      intro: `${opening} ترغب في متابعة ${project}. ملفك الدراسي ومستواك اللغوي وتفضيلاتك تعطينا أساسًا عمليًا لتنظيم الخطوات القادمة.`,
      academic: engineResult.academicAccessStatus === "likely_eligible"
        ? "يوجد أساس رسمي موثّق لمسارك الأكاديمي. ويبقى قرار القبول النهائي دائمًا من اختصاص الجامعة."
        : "مشروعك يستحق دراسة تناسب شهادتك. لم يتأكد بعد حق الالتحاق بالجامعة؛ وإذا اخترت المتابعة معنا فسيدرس فريقنا الشروط قبل أي تقديم.",
      language: `ذكرت أن مستواك في الألمانية هو ${profile.germanLevel || "بحاجة إلى تحديد"} وفي الإنجليزية ${profile.englishLevel || "بحاجة إلى تحديد"}. ستساعدنا هذه المعلومات على استكشاف البرامج ودراسة الشهادات المطلوبة إذا واصلت معنا.`,
      city: city
        ? `تفضّل الدراسة في ${city}. سنعتبر هذه المدينة أولوية، مع إبقاء مدن أخرى مفتوحة إذا كانت توفر مسارًا أفضل لمشروعك.`
        : "لم تحدد مدينة بعد، وهذا مفيد في هذه المرحلة لأنه يسمح لنا بمقارنة عدة مدن قبل اختيار أفضل المسارات.",
      option: hasVerifiedOption
        ? "لدينا بالفعل مسارات أولية تستحق المراجعة. هي نقطة انطلاق، وسنقارنها معك قبل اختيار طلبات التقديم."
        : "سنبدأ الآن بالبحث عن مسارات أولية تناسب مشروعك. الهدف ليس أن تختار وحدك، بل أن نبني معًا قائمة جدية قبل التقديم.",
      closing: "لقد شاركتنا مشروعك الدراسي. إذا اخترت مواصلة الطريق مع Campus Allemagne، فسيدرس فريقنا الخيارات الممكنة ويرافقك نحو طلبات التقديم المناسبة.",
    },
    en: {
      title: "Your orientation for studying in Germany",
      intro: `${opening} You want to continue with ${project}. Your academic profile, language level and preferences already give us a concrete base for the next steps.`,
      academic: engineResult.academicAccessStatus === "likely_eligible"
        ? "Your academic route already has a verified official basis. The final admission decision always remains with the university."
        : "Your study plans deserve a review tailored to your diploma. University access is not yet confirmed; if you continue with Campus Allemagne, our team can examine the requirements before any application.",
      language: `You have indicated German ${profile.germanLevel || "to be confirmed"} and English ${profile.englishLevel || "to be confirmed"}. These levels help us explore courses; if you continue, our team can review the certificates they require.`,
      city: city
        ? `You prefer ${city}. We will keep it as a priority while staying open to other cities if they offer a stronger path for your project.`
        : "You have not fixed a city yet. That is useful at this stage because we can compare several places before selecting the strongest paths.",
      option: hasVerifiedOption
        ? "We have already identified first paths worth examining. They are a starting point; we will compare them with you before choosing applications."
        : "We will now look for first programme paths that fit your project. The goal is not to make you choose alone, but to prepare a serious shortlist together before applications.",
      closing: "You have shared your study plans with us. If you choose to continue with Campus Allemagne, our team will review your options and guide you towards suitable applications.",
    },
    de: {
      title: "Deine Orientierung für ein Studium in Deutschland",
      intro: `${opening} Du möchtest mit ${project} weitermachen. Dein schulisches Profil, deine Sprachen und deine Wünsche geben uns bereits eine konkrete Grundlage für die nächsten Schritte.`,
      academic: engineResult.academicAccessStatus === "likely_eligible"
        ? "Für deinen Hochschulzugang gibt es bereits eine geprüfte offizielle Grundlage. Die endgültige Zulassungsentscheidung trifft immer die Hochschule."
        : "Dein Studienwunsch verdient eine Prüfung, die zu deinem Abschluss passt. Der Hochschulzugang ist noch nicht bestätigt; wenn du mit uns weitermachst, klärt unser Team die Voraussetzungen vor einer Bewerbung.",
      language: `Du hast Deutsch ${profile.germanLevel || "noch zu klären"} und Englisch ${profile.englishLevel || "noch zu klären"} angegeben. Diese Angaben helfen uns bei der Suche; wenn du weitermachst, kann unser Team die benötigten Nachweise prüfen.`,
      city: city
        ? `Du bevorzugst ${city}. Diese Stadt bleibt Priorität, aber wir halten andere Städte offen, wenn sie eine bessere Studienoption für dein Projekt bieten.`
        : "Du hast noch keine Stadt festgelegt. Das ist in dieser Phase hilfreich, weil wir mehrere Orte vergleichen können, bevor wir die besten Optionen auswählen.",
      option: hasVerifiedOption
        ? "Wir haben bereits erste Studienoptionen identifiziert, die wir gemeinsam prüfen können. Sie sind ein Ausgangspunkt; vor Bewerbungen vergleichen wir weitere Möglichkeiten."
        : "Wir suchen jetzt nach ersten Studienoptionen, die zu deinem Projekt passen. Du sollst nicht allein entscheiden; wir erstellen gemeinsam eine seriöse Auswahl vor den Bewerbungen.",
      closing: "Du hast uns von deinem Studienwunsch erzählt. Wenn du mit Campus Allemagne weitermachst, prüft unser Team die Möglichkeiten und begleitet dich zu passenden Bewerbungen.",
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
        fr: "Votre parcours mérite une étude adaptée. Si vous continuez avec Campus Allemagne, notre équipe explorera les voies possibles et vous guidera pour la suite.",
        ar: "مشروعك يستحق دراسة تناسب مسارك. إذا واصلت مع Campus Allemagne، سيبحث فريقنا عن الطرق الممكنة ويرافقك في الخطوات القادمة.",
        en: "Your study project deserves a review suited to your background. If you continue with Campus Allemagne, our team will explore the available paths and guide you from there.",
        de: "Dein Studienwunsch verdient eine Prüfung, die zu deinem Werdegang passt. Wenn du mit Campus Allemagne weitermachst, sucht unser Team nach möglichen Wegen und begleitet dich weiter.",
      }[locale]
    : copy.closing;

  return {
    provider: "deterministic-letter-v1",
    mode: "deterministic",
    title: copy.title,
    paragraphs: [copy.intro, copy.academic, copy.language, [copy.city, budgetNote].filter(Boolean).join(" "), routeOption],
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
