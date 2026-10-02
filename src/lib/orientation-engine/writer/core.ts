import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationSelectionItem,
  OrientationSelectionReasonCode,
  OrientationSelectionWarningCode,
} from "@/lib/orientation-engine/selection/types";
import type {
  OrientationWriterAvailableAction,
  OrientationWriterCampusOption,
  OrientationWriterContent,
  OrientationWriterInput,
  OrientationWriterLocale,
} from "@/lib/orientation-engine/writer/types";

const MAX_CAMPUS_OPTIONS = 8;
const MAX_ACTIONS = 8;
const MAX_ROADMAP_ITEMS = 6;

type SafeFactValue = string | boolean | string[];

export type OrientationWriterContext = {
  locale: OrientationWriterLocale;
  PROFIL_ETUDIANT: {
    bac_status: string | null;
    bac_year: string | null;
    bac_track: string | null;
    average_out_of_20: string | null;
    average_type: string | null;
    last_diploma: string | null;
    target_degree: string | null;
    target_field: string | null;
    engineering_specialty: string | null;
    german_level: string | null;
    english_level: string | null;
    study_language: string | null;
    target_intake: {
      season: string | null;
      year: string | null;
    };
    budget_range: string | null;
    preferred_cities: string[];
  };
  FAITS_VERIFIES: {
    selection_status: string;
    programmes: Array<{
      option_id: string;
      position: number;
      institution: string;
      programme: string;
      city: string | null;
      core_status: string;
      verified_facts: Array<{
        field: string;
        value: SafeFactValue;
      }>;
      facts_to_review: Array<{
        field: string;
        value: SafeFactValue;
      }>;
      reasons: OrientationSelectionReasonCode[];
      warnings: OrientationSelectionWarningCode[];
      missing_facts: string[];
    }>;
  };
  OPTIONS_CAMPUS_ALLEMAGNE: OrientationWriterCampusOption[];
  ACTIONS_DISPONIBLES: OrientationWriterAvailableAction[];
  LANGUAGE_FOCUS: {
    show: boolean;
    current_level: string | null;
    next_level: string | null;
  };
};

export type RawOrientationWriterPayload = {
  opening?: unknown;
  project_status?: unknown;
  main_priority?: {
    title?: unknown;
    text?: unknown;
    next_step?: unknown;
  };
  language_plan?: {
    show?: unknown;
    current_level?: unknown;
    next_level?: unknown;
    text?: unknown;
    available_paths?: unknown;
  };
  campus_value?: unknown;
  study_options?: unknown;
  roadmap?: unknown;
  reassurance?: unknown;
  cta?: {
    action_id?: unknown;
    label?: unknown;
    text?: unknown;
  };
};

function boundedString(value: unknown, max = 700) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return normalized.slice(0, max);
}

function sanitizeCode(value: unknown) {
  const normalized = boundedString(value, 80);
  if (!normalized || !/^[a-z0-9_-]+$/i.test(normalized)) return null;
  return normalized;
}

function sanitizeCampusOptions(
  options: readonly OrientationWriterCampusOption[] | undefined,
) {
  if (!options) return [];
  const seen = new Set<string>();
  const result: OrientationWriterCampusOption[] = [];

  for (const option of options) {
    const code = sanitizeCode(option.code);
    const label = boundedString(option.label, 120);
    const description = boundedString(option.description, 360);
    if (!code || !label || !description || seen.has(code)) continue;
    seen.add(code);
    result.push({ code, label, description });
    if (result.length >= MAX_CAMPUS_OPTIONS) break;
  }

  return result;
}

const defaultActionCopy: Record<
  OrientationWriterLocale,
  OrientationWriterAvailableAction
> = {
  fr: {
    id: "continue_orientation",
    label: "Continuer mon orientation",
    description: "Continuer vers la prochaine étape de l’orientation dans Campus Allemagne.",
  },
  ar: {
    id: "continue_orientation",
    label: "متابعة التوجيه",
    description: "الانتقال إلى الخطوة التالية من التوجيه داخل Campus Allemagne.",
  },
  en: {
    id: "continue_orientation",
    label: "Continue my orientation",
    description: "Continue to the next orientation step inside Campus Allemagne.",
  },
  de: {
    id: "continue_orientation",
    label: "Orientierung fortsetzen",
    description: "Mit dem nächsten Orientierungsschritt in Campus Allemagne fortfahren.",
  },
};

function sanitizeAvailableActions(
  locale: OrientationWriterLocale,
  actions: readonly OrientationWriterAvailableAction[] | undefined,
) {
  const seen = new Set<string>();
  const result: OrientationWriterAvailableAction[] = [];

  for (const action of actions || []) {
    const id = sanitizeCode(action.id);
    const label = boundedString(action.label, 120);
    const description = boundedString(action.description, 360);
    if (!id || !label || !description || seen.has(id)) continue;
    seen.add(id);
    result.push({ id, label, description });
    if (result.length >= MAX_ACTIONS) break;
  }

  return result.length > 0 ? result : [defaultActionCopy[locale]];
}

function nullable(value: string | undefined | null) {
  const normalized = boundedString(value, 160);
  return normalized || null;
}

function safeProfile(profile: PublicOrientationAnswers) {
  return {
    bac_status: nullable(profile.bacStatus),
    bac_year: nullable(profile.bacYear),
    bac_track: nullable(profile.bacTrack),
    average_out_of_20: nullable(profile.generalAverage),
    average_type: nullable(profile.averageType),
    last_diploma: nullable(profile.lastDiploma),
    target_degree: nullable(profile.targetDegree),
    target_field: nullable(profile.targetField),
    engineering_specialty: nullable(profile.engineeringSpecialty),
    german_level: nullable(profile.germanLevel),
    english_level: nullable(profile.englishLevel),
    study_language: nullable(profile.studyLanguage),
    target_intake: {
      season: nullable(profile.targetIntakeSeason),
      year: nullable(profile.targetIntakeYear),
    },
    budget_range: nullable(profile.budgetRange),
    preferred_cities: (profile.preferredCities || [])
      .map((city) => boundedString(city, 80))
      .filter((city): city is string => Boolean(city))
      .slice(0, 3),
  };
}

function safeFactValue(value: unknown): SafeFactValue | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return boundedString(value, 500);
  if (Array.isArray(value)) {
    const items = value
      .map((item) => boundedString(item, 160))
      .filter((item): item is string => Boolean(item))
      .slice(0, 16);
    return items.length > 0 ? items : null;
  }
  return null;
}

function optionId(item: OrientationSelectionItem) {
  return `option_${item.position}`;
}

function safeProgramme(item: OrientationSelectionItem) {
  const verifiedFacts = item.verification.facts.flatMap((fact) => {
    if (fact.status !== "verified") return [];
    const value = safeFactValue(fact.value);
    return value === null ? [] : [{ field: fact.field, value }];
  });

  const factsToReview = item.verification.facts.flatMap((fact) => {
    if (fact.status !== "needs_review") return [];
    const value = safeFactValue(fact.value);
    return value === null ? [] : [{ field: fact.field, value }];
  });

  return {
    option_id: optionId(item),
    position: item.position,
    institution: boundedString(item.verification.candidate.institution, 160) || "",
    programme: boundedString(item.verification.candidate.programme, 180) || "",
    city: nullable(item.verification.candidate.city),
    core_status: item.verification.overallStatus,
    verified_facts: verifiedFacts,
    facts_to_review: factsToReview,
    reasons: [...item.reasons],
    warnings: [...item.warnings],
    missing_facts: [...item.missingFacts],
  };
}

function nextLevel(current: string | null) {
  const order = ["none", "A1", "A2", "B1", "B2", "C1", "C2"];
  if (!current) return null;
  const index = order.indexOf(current);
  if (index < 0 || index >= order.length - 1) return null;
  return order[index + 1];
}

export function orientationWriterLanguageFocus(
  profile: PublicOrientationAnswers,
) {
  const prefersEnglish =
    profile.studyLanguage === "Anglais"
    && profile.englishLevel
    && profile.englishLevel !== "none";

  const current = prefersEnglish
    ? nullable(profile.englishLevel)
    : nullable(profile.germanLevel);

  return {
    show: Boolean(current),
    current_level: current,
    next_level: nextLevel(current),
  };
}

export function buildOrientationWriterContext(
  input: OrientationWriterInput,
): OrientationWriterContext {
  return {
    locale: input.locale,
    PROFIL_ETUDIANT: safeProfile(input.profile),
    FAITS_VERIFIES: {
      selection_status: input.selection.status,
      programmes: input.selection.selected.map(safeProgramme),
    },
    OPTIONS_CAMPUS_ALLEMAGNE: sanitizeCampusOptions(input.campusOptions),
    ACTIONS_DISPONIBLES: sanitizeAvailableActions(
      input.locale,
      input.availableActions,
    ),
    LANGUAGE_FOCUS: orientationWriterLanguageFocus(input.profile),
  };
}

const fallbackCopy = {
  fr: {
    opening: (profile: OrientationWriterContext["PROFIL_ETUDIANT"]) =>
      profile.bac_status === "obtained" && profile.average_out_of_20
        ? `Félicitations pour votre Bac avec ${profile.average_out_of_20}/20. Vous avez déjà franchi une étape importante ; maintenant, on transforme ce résultat en projet concret pour l’Allemagne.`
        : profile.bac_status === "obtained"
          ? "Félicitations pour votre Bac. Vous avez déjà franchi une étape importante ; maintenant, on transforme ce résultat en projet concret pour l’Allemagne."
          : "Votre projet pour l’Allemagne peut avancer étape par étape, sans tout résoudre aujourd’hui.",
    projectReady: "Votre projet est assez clair pour comparer plusieurs pistes universitaires sérieuses.",
    projectPartial: "Nous avons déjà des pistes utiles, mais certaines informations doivent encore être vérifiées avant de réduire la sélection.",
    projectEmpty: "La priorité est d’abord de consolider les informations académiques avant de présenter des universités comme pistes sérieuses.",
    priorityTitle: "Votre priorité maintenant",
    priorityText: "Avancer sur la prochaine étape utile sans perdre de vue le dossier universitaire.",
    priorityStep: "Traiter la prochaine condition connue, puis réévaluer les pistes.",
    language: "Votre langue avance en parallèle du projet universitaire : concentrez-vous sur le prochain niveau utile, pas sur toute la montagne d’un coup.",
    campusGeneric: "Pendant que vous avancez sur la langue, votre projet peut continuer à avancer : comparaison des pistes, vérifications et préparation des prochaines étapes.",
    reassurance: "Vous n’avez pas besoin de tout décider aujourd’hui. L’objectif est de faire avancer une étape claire à la fois.",
    roadmap: [
      ["language", "Langue", "Avancer vers le prochain niveau utile pour les programmes retenus."],
      ["compare", "Universités", "Comparer les pistes retenues et garder visibles les points encore à vérifier."],
      ["prepare", "Dossier", "Préparer progressivement les éléments nécessaires avant les candidatures."],
    ],
  },
  ar: {
    opening: () => "يمكن لمشروعك للدراسة في ألمانيا أن يتقدم خطوة بخطوة، من دون الحاجة إلى حل كل شيء اليوم.",
    projectReady: "مشروعك واضح بما يكفي لمقارنة عدة مسارات جامعية جدية.",
    projectPartial: "لدينا بالفعل مسارات مفيدة، لكن ما زالت بعض المعلومات بحاجة إلى التحقق.",
    projectEmpty: "الأولوية الآن هي تثبيت المعلومات الأكاديمية قبل تقديم جامعات كخيارات جدية.",
    priorityTitle: "أولويتك الآن",
    priorityText: "التقدم في الخطوة المفيدة التالية مع استمرار تجهيز المشروع الجامعي.",
    priorityStep: "إكمال الشرط التالي المعروف ثم إعادة تقييم الخيارات.",
    language: "اللغة والمشروع الجامعي يتقدمان بالتوازي: ركّز الآن على المستوى التالي المفيد فقط.",
    campusGeneric: "أثناء تقدمك في اللغة، يمكن لمشروعك أن يتقدم أيضًا عبر مقارنة الخيارات والتحقق من المعلومات وتحضير الخطوات التالية.",
    reassurance: "لا تحتاج إلى اتخاذ كل القرارات اليوم. المهم هو التقدم بخطوة واضحة في كل مرة.",
    roadmap: [
      ["language", "اللغة", "التقدم نحو المستوى التالي المفيد للبرامج المختارة."],
      ["compare", "الجامعات", "مقارنة الخيارات المختارة وإبقاء النقاط غير المؤكدة واضحة."],
      ["prepare", "الملف", "تحضير عناصر الملف تدريجيًا قبل التقديم."],
    ],
  },
  en: {
    opening: () => "Your Germany study project can move forward step by step without solving everything today.",
    projectReady: "Your project is clear enough to compare several serious university paths.",
    projectPartial: "We already have useful paths, but some information still needs verification.",
    projectEmpty: "The priority is to consolidate the academic facts before presenting universities as serious paths.",
    priorityTitle: "Your priority now",
    priorityText: "Move the next useful step forward while keeping the university file progressing.",
    priorityStep: "Complete the next known condition, then reassess the shortlist.",
    language: "Language and the university project can move in parallel: focus on the next useful level rather than the whole ladder at once.",
    campusGeneric: "While you progress with language, your project can keep moving through comparison, verification and preparation of the next steps.",
    reassurance: "You do not need to decide everything today. The goal is one clear step at a time.",
    roadmap: [
      ["language", "Language", "Move toward the next useful level for the selected programmes."],
      ["compare", "Universities", "Compare the selected paths and keep remaining verification points visible."],
      ["prepare", "Documents", "Prepare the file progressively before applications."],
    ],
  },
  de: {
    opening: () => "Dein Studienprojekt für Deutschland kann Schritt für Schritt vorankommen, ohne dass heute schon alles geklärt sein muss.",
    projectReady: "Dein Projekt ist klar genug, um mehrere seriöse Studienwege zu vergleichen.",
    projectPartial: "Es gibt bereits nützliche Optionen, aber einige Angaben müssen noch geprüft werden.",
    projectEmpty: "Zuerst sollten die akademischen Fakten geklärt werden, bevor Hochschulen als seriöse Optionen dargestellt werden.",
    priorityTitle: "Deine Priorität jetzt",
    priorityText: "Den nächsten sinnvollen Schritt angehen und gleichzeitig das Hochschulprojekt weiter vorbereiten.",
    priorityStep: "Die nächste bekannte Bedingung bearbeiten und danach die Auswahl neu bewerten.",
    language: "Sprache und Hochschulprojekt können parallel vorankommen: Konzentriere dich auf das nächste sinnvolle Niveau, nicht auf die ganze Leiter auf einmal.",
    campusGeneric: "Während du sprachlich vorankommst, kann auch dein Projekt weiterlaufen: Optionen vergleichen, Angaben prüfen und nächste Schritte vorbereiten.",
    reassurance: "Du musst heute noch nicht alles entscheiden. Entscheidend ist jeweils ein klarer nächster Schritt.",
    roadmap: [
      ["language", "Sprache", "Auf das nächste sinnvolle Niveau für die ausgewählten Programme hinarbeiten."],
      ["compare", "Hochschulen", "Die ausgewählten Wege vergleichen und offene Prüfpunkte sichtbar halten."],
      ["prepare", "Unterlagen", "Die Unterlagen schrittweise vor den Bewerbungen vorbereiten."],
    ],
  },
} as const;

function localizedReason(
  locale: OrientationWriterLocale,
  item: OrientationSelectionItem,
) {
  const reason = item.reasons[0];
  const labels: Record<
    OrientationWriterLocale,
    Partial<Record<OrientationSelectionReasonCode, string>>
  > = {
    fr: {
      specialty_match: "Cette piste correspond directement à la spécialité recherchée.",
      field_match: "Cette piste correspond au domaine d’études visé.",
      study_language_match: "La langue d’enseignement correspond à votre préférence.",
      preferred_city_match: "La ville correspond à l’une de vos préférences.",
      current_language_sufficient: "Votre niveau actuel couvre déjà l’exigence linguistique vérifiée.",
      intake_match: "Le semestre visé est proposé d’après les informations vérifiées.",
      core_verified: "Le cœur du programme a été vérifié sur une source officielle.",
    },
    ar: {
      specialty_match: "هذا المسار قريب مباشرة من التخصص الذي تبحث عنه.",
      field_match: "هذا المسار يطابق مجال الدراسة المطلوب.",
      study_language_match: "لغة الدراسة تتوافق مع تفضيلك.",
      preferred_city_match: "المدينة من بين المدن التي تفضلها.",
      current_language_sufficient: "مستواك الحالي يغطي شرط اللغة الذي تم التحقق منه.",
      intake_match: "الفصل المستهدف متاح وفق المعلومات التي تم التحقق منها.",
      core_verified: "تم التحقق من المعلومات الأساسية للبرنامج من مصدر رسمي.",
    },
    en: {
      specialty_match: "This path directly matches the specialty you are targeting.",
      field_match: "This path matches your target study field.",
      study_language_match: "The teaching language matches your preference.",
      preferred_city_match: "The city matches one of your preferences.",
      current_language_sufficient: "Your current level already covers the verified language requirement.",
      intake_match: "The target intake is available according to verified information.",
      core_verified: "The programme core has been verified on an official source.",
    },
    de: {
      specialty_match: "Diese Option passt direkt zur gewünschten Fachrichtung.",
      field_match: "Diese Option passt zum gewünschten Studienbereich.",
      study_language_match: "Die Unterrichtssprache passt zu deiner Präferenz.",
      preferred_city_match: "Die Stadt entspricht einer deiner Präferenzen.",
      current_language_sufficient: "Dein aktuelles Niveau deckt die geprüfte Sprachanforderung bereits ab.",
      intake_match: "Der gewünschte Studienstart ist laut geprüften Angaben verfügbar.",
      core_verified: "Die Kerndaten des Programms wurden auf einer offiziellen Quelle geprüft.",
    },
  };

  return labels[locale][reason]
    || labels[locale].core_verified
    || "";
}

function localizedVerificationNote(
  locale: OrientationWriterLocale,
  item: OrientationSelectionItem,
) {
  const verified = item.verification.overallStatus === "verified";
  const copy = {
    fr: verified
      ? "Piste documentée ; les conditions encore inconnues restent à vérifier avant candidature."
      : "Piste à vérifier ensemble avant toute candidature.",
    ar: verified
      ? "مسار موثق؛ تبقى الشروط غير المعروفة بحاجة إلى التحقق قبل التقديم."
      : "مسار يحتاج إلى مراجعة مشتركة قبل أي تقديم.",
    en: verified
      ? "Documented path; remaining unknown conditions still need verification before application."
      : "Path to review together before any application.",
    de: verified
      ? "Dokumentierte Option; offene Bedingungen müssen vor einer Bewerbung noch geprüft werden."
      : "Option, die vor einer Bewerbung gemeinsam geprüft werden muss.",
  };
  return copy[locale];
}

export function buildDeterministicOrientationWriterContent(
  input: OrientationWriterInput,
): OrientationWriterContent {
  const context = buildOrientationWriterContext(input);
  const copy = fallbackCopy[input.locale];
  const status = input.selection.status;
  const action = context.ACTIONS_DISPONIBLES[0];
  const language = context.LANGUAGE_FOCUS;

  const projectStatus =
    status === "ready"
      ? copy.projectReady
      : status === "partial"
        ? copy.projectPartial
        : copy.projectEmpty;

  const campusValue = context.OPTIONS_CAMPUS_ALLEMAGNE.length > 0
    ? context.OPTIONS_CAMPUS_ALLEMAGNE
        .slice(0, 3)
        .map((option) => option.description)
        .join(" ")
    : copy.campusGeneric;

  return {
    opening: copy.opening(context.PROFIL_ETUDIANT),
    projectStatus,
    mainPriority: {
      title: copy.priorityTitle,
      text: copy.priorityText,
      nextStep: copy.priorityStep,
    },
    languagePlan: {
      show: language.show,
      currentLevel: language.current_level,
      nextLevel: language.next_level,
      text: copy.language,
      availablePaths: [],
    },
    campusValue,
    studyOptions: input.selection.selected.map((item) => ({
      optionId: optionId(item),
      position: item.position,
      institution: item.verification.candidate.institution,
      programme: item.verification.candidate.programme,
      city: item.verification.candidate.city,
      whyItFits: localizedReason(input.locale, item),
      verificationNote: localizedVerificationNote(input.locale, item),
    })),
    roadmap: copy.roadmap.map(([id, label, text]) => ({ id, label, text })),
    reassurance: copy.reassurance,
    cta: {
      actionId: action.id,
      label: action.label,
      text: action.description,
    },
  };
}

function collectText(payload: RawOrientationWriterPayload) {
  const values: string[] = [];
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      values.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value as Record<string, unknown>).forEach(visit);
    }
  };
  visit(payload);
  return values.join(" ");
}

function unsupportedRiskClaim(
  payload: RawOrientationWriterPayload,
  context: OrientationWriterContext,
) {
  const text = collectText(payload);
  const contextText = JSON.stringify(context);

  if (/https?:\/\//i.test(text)) return true;

  const admissionPromises = [
    /admission\s+garantie/i,
    /acceptation\s+garantie/i,
    /vous\s+serez\s+admis/i,
    /garantie\s+d['’]admission/i,
    /guaranteed\s+admission/i,
    /you\s+will\s+be\s+admitted/i,
    /garantierte\s+zulassung/i,
    /du\s+wirst\s+zugelassen/i,
    /قبول\s+مضمون/i,
    /سيتم\s+قبولك/i,
  ];
  if (admissionPromises.some((pattern) => pattern.test(text))) return true;

  const outputLevels = text.match(/\b(?:A1|A2|B1|B2|C1|C2)\b/g) || [];
  if (outputLevels.some((level) => !contextText.includes(`"${level}"`))) {
    return true;
  }

  const outputNumbers = text.match(/\b\d+(?:[.,]\d+)?\b/g) || [];
  if (outputNumbers.some((number) => !contextText.includes(number))) {
    return true;
  }

  if (/studienkolleg/i.test(text) && !/studienkolleg/i.test(contextText)) {
    return true;
  }
  if (/uni[-\s]?assist/i.test(text) && !/uni[_-]?assist/i.test(contextText)) {
    return true;
  }

  return false;
}

function requiredString(value: unknown, max = 700) {
  return boundedString(value, max);
}

function rawStudyOptions(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function rawRoadmap(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

export function parseOrientationWriterPayload(
  input: OrientationWriterInput,
  payload: RawOrientationWriterPayload,
): OrientationWriterContent | null {
  const context = buildOrientationWriterContext(input);
  if (unsupportedRiskClaim(payload, context)) return null;

  const opening = requiredString(payload.opening);
  const projectStatus = requiredString(payload.project_status);
  const priorityTitle = requiredString(payload.main_priority?.title, 180);
  const priorityText = requiredString(payload.main_priority?.text);
  const priorityStep = requiredString(payload.main_priority?.next_step);
  const languageText = requiredString(payload.language_plan?.text);
  const campusValue = requiredString(payload.campus_value);
  const reassurance = requiredString(payload.reassurance);
  const ctaActionId = sanitizeCode(payload.cta?.action_id);
  const ctaLabel = requiredString(payload.cta?.label, 120);
  const ctaText = requiredString(payload.cta?.text, 360);

  if (
    !opening
    || !projectStatus
    || !priorityTitle
    || !priorityText
    || !priorityStep
    || !languageText
    || !campusValue
    || !reassurance
    || !ctaActionId
    || !ctaLabel
    || !ctaText
  ) {
    return null;
  }

  const allowedAction = context.ACTIONS_DISPONIBLES.find(
    (action) => action.id === ctaActionId,
  );
  if (!allowedAction) return null;

  const expectedOptions = new Map(
    input.selection.selected.map((item) => [optionId(item), item]),
  );
  const seenOptions = new Set<string>();
  const studyOptions = rawStudyOptions(payload.study_options).flatMap((raw) => {
    const item = raw as Record<string, unknown>;
    const id = sanitizeCode(item.option_id);
    const why = requiredString(item.why_it_fits, 500);
    const note = requiredString(item.verification_note, 500);
    if (!id || !why || !note || seenOptions.has(id)) return [];
    const selected = expectedOptions.get(id);
    if (!selected) return [];
    seenOptions.add(id);
    return [{
      optionId: id,
      position: selected.position,
      institution: selected.verification.candidate.institution,
      programme: selected.verification.candidate.programme,
      city: selected.verification.candidate.city,
      whyItFits: why,
      verificationNote: note,
    }];
  });

  if (studyOptions.length !== expectedOptions.size) return null;

  const roadmap = rawRoadmap(payload.roadmap).flatMap((raw) => {
    const item = raw as Record<string, unknown>;
    const id = sanitizeCode(item.id);
    const label = requiredString(item.label, 120);
    const text = requiredString(item.text, 360);
    return id && label && text ? [{ id, label, text }] : [];
  }).slice(0, MAX_ROADMAP_ITEMS);

  if (roadmap.length < 2) return null;
  if (new Set(roadmap.map((item) => item.id)).size !== roadmap.length) {
    return null;
  }

  const focus = context.LANGUAGE_FOCUS;
  const rawShow = payload.language_plan?.show;
  const rawCurrent = payload.language_plan?.current_level;
  const rawNext = payload.language_plan?.next_level;

  if (typeof rawShow !== "boolean" || rawShow !== focus.show) return null;
  if ((rawCurrent ?? null) !== focus.current_level) return null;
  if ((rawNext ?? null) !== focus.next_level) return null;

  const availablePaths = Array.isArray(payload.language_plan?.available_paths)
    ? payload.language_plan.available_paths
        .map((item) => requiredString(item, 220))
        .filter((item): item is string => Boolean(item))
        .slice(0, 5)
    : [];

  return {
    opening,
    projectStatus,
    mainPriority: {
      title: priorityTitle,
      text: priorityText,
      nextStep: priorityStep,
    },
    languagePlan: {
      show: focus.show,
      currentLevel: focus.current_level,
      nextLevel: focus.next_level,
      text: languageText,
      availablePaths,
    },
    campusValue,
    studyOptions: studyOptions.sort((a, b) => a.position - b.position),
    roadmap,
    reassurance,
    cta: {
      actionId: allowedAction.id,
      label: ctaLabel,
      text: ctaText,
    },
  };
}
