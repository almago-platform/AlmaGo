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
    average_scale: 20 | null;
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
    average_scale: profile.generalAverage ? 20 as const : null,
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
    opening: (profile: OrientationWriterContext["PROFIL_ETUDIANT"]) => {
      const bac = profile.bac_track ? `Bac ${profile.bac_track}` : "Bac";
      if (profile.bac_status === "obtained" && profile.average_out_of_20) {
        return `Bravo pour votre ${bac} obtenu avec ${profile.average_out_of_20}/20. Vous avez posé une base solide ; Campus Allemagne va maintenant transformer votre objectif en plan concret pour l’Allemagne.`;
      }
      if (profile.bac_status === "obtained") {
        return `Bravo pour votre ${bac}. Vous avez franchi une étape importante ; Campus Allemagne va maintenant structurer la suite de votre projet en Allemagne.`;
      }
      return "Votre projet Allemagne peut déjà avancer. Campus Allemagne va vous donner une prochaine action claire et organiser en parallèle les vérifications nécessaires.";
    },
    projectReady: "Votre projet est suffisamment clair pour que nous commencions à structurer les prochaines étapes et à consolider les pistes universitaires adaptées.",
    projectPartial: "Nous avons déjà identifié des pistes utiles. Notre équipe complète maintenant les informations manquantes avant de resserrer la sélection.",
    projectEmpty: "Nous allons d’abord consolider les informations académiques essentielles afin de construire une sélection universitaire fiable.",
    priorityTitle: "Votre prochaine action",
    priorityText: "Concentrez-vous sur ce qui dépend directement de vous. Campus Allemagne garde la vue d’ensemble et fait avancer le reste du parcours en parallèle.",
    priorityStep: "Avancez sur cette étape ; nous poursuivons les vérifications et la préparation du dossier.",
    language: "La langue et le projet universitaire avancent en parallèle. Concentrez-vous seulement sur le prochain niveau utile ; nous continuons à travailler sur les universités et le dossier.",
    campusGeneric: "Pendant que vous avancez sur votre prochaine action, Campus Allemagne compare les pistes, vérifie les conditions et organise les prochaines étapes du dossier. Nous vous demandons uniquement les éléments qui nécessitent réellement votre intervention.",
    reassurance: "Vous n’avez pas à gérer seul tout le parcours. Vous avancez sur une prochaine action claire ; Campus Allemagne garde le contrôle des vérifications et de la suite du dossier.",
    roadmap: [
      ["you", "Vous", "Avancer sur la prochaine action qui dépend directement de vous."],
      ["campus", "Campus Allemagne", "Nous vérifions les conditions, comparons les pistes et organisons les prochaines étapes du dossier."],
      ["together", "Ensemble", "Nous transformons les informations confirmées en une prochaine décision simple et concrète."],
    ],
  },
  ar: {
    opening: (profile: OrientationWriterContext["PROFIL_ETUDIANT"]) =>
      profile.bac_status === "obtained" && profile.average_out_of_20
        ? `مبروك على الباكالوريا بمعدل ${profile.average_out_of_20}/20. لديك أساس جيد، وCampus Allemagne سيحوّل هدفك الآن إلى خطة واضحة للدراسة في ألمانيا.`
        : "مشروعك للدراسة في ألمانيا يمكن أن يبدأ من الآن. سنعطيك خطوة واضحة ونواصل نحن بالتوازي تنظيم التحقق والملف.",
    projectReady: "مشروعك واضح بما يكفي لنبدأ في تنظيم الخطوات القادمة وتثبيت الخيارات الجامعية المناسبة.",
    projectPartial: "حددنا بالفعل خيارات مفيدة، وفريقنا يكمل الآن المعلومات الناقصة قبل تضييق الاختيار.",
    projectEmpty: "سنثبت أولًا المعلومات الأكاديمية الأساسية حتى نبني اختيارًا جامعيًا موثوقًا.",
    priorityTitle: "خطوتك التالية",
    priorityText: "ركّز على ما يعتمد عليك مباشرة، بينما يتولى Campus Allemagne متابعة الصورة الكاملة ودفع بقية المسار إلى الأمام.",
    priorityStep: "تقدّم في هذه الخطوة، ونحن نواصل التحقق وتنظيم الملف.",
    language: "اللغة والمشروع الجامعي يتقدمان معًا. ركّز فقط على المستوى التالي المفيد، ونحن نواصل العمل على الجامعات والملف.",
    campusGeneric: "بينما تتقدم في خطوتك التالية، يقوم Campus Allemagne بمقارنة الخيارات والتحقق من الشروط وتنظيم المراحل القادمة. نطلب منك فقط ما يحتاج فعلًا إلى تدخلك.",
    reassurance: "لست مطالبًا بإدارة كل المسار وحدك. لديك خطوة واضحة الآن، وCampus Allemagne يتابع التحقق وتنظيم ما يأتي بعدها.",
    roadmap: [
      ["you", "أنت", "تتقدم في الخطوة التي تعتمد عليك مباشرة."],
      ["campus", "Campus Allemagne", "نتحقق من الشروط ونقارن الخيارات وننظم المراحل القادمة من الملف."],
      ["together", "معًا", "نحوّل المعلومات المؤكدة إلى قرار وخطوة تالية واضحة."],
    ],
  },
  en: {
    opening: (profile: OrientationWriterContext["PROFIL_ETUDIANT"]) =>
      profile.bac_status === "obtained" && profile.average_out_of_20
        ? `Congratulations on your secondary diploma with ${profile.average_out_of_20}/20. You already have a solid base; Campus Allemagne can now turn your Germany goal into a concrete plan.`
        : "Your Germany project can start moving now. Campus Allemagne will give you one clear next action while we organise the complex checks in parallel.",
    projectReady: "Your project is clear enough for us to structure the next steps and consolidate suitable university paths.",
    projectPartial: "We have already identified useful paths. Our team is completing the missing information before narrowing the shortlist.",
    projectEmpty: "We will first consolidate the essential academic information so we can build a reliable university shortlist.",
    priorityTitle: "Your next action",
    priorityText: "Focus on what depends directly on you. Campus Allemagne keeps the full picture under control and moves the rest of the process forward in parallel.",
    priorityStep: "Move this step forward while we continue the checks and file preparation.",
    language: "Language and the university project move in parallel. Focus only on the next useful level; we continue working on the universities and your file.",
    campusGeneric: "While you work on your next action, Campus Allemagne compares paths, checks requirements and organises the next dossier steps. We ask you only for the items that genuinely require your input.",
    reassurance: "You do not have to manage the whole process alone. You have one clear next action; Campus Allemagne keeps the checks and next steps coordinated.",
    roadmap: [
      ["you", "You", "Move forward on the next action that depends directly on you."],
      ["campus", "Campus Allemagne", "We check requirements, compare paths and organise the next dossier steps."],
      ["together", "Together", "We turn confirmed information into one clear next decision."],
    ],
  },
  de: {
    opening: (profile: OrientationWriterContext["PROFIL_ETUDIANT"]) =>
      profile.bac_status === "obtained" && profile.average_out_of_20
        ? `Glückwunsch zu deinem Schulabschluss mit ${profile.average_out_of_20}/20. Du hast eine gute Grundlage; Campus Allemagne macht daraus jetzt einen konkreten Plan für Deutschland.`
        : "Dein Deutschland-Projekt kann jetzt vorankommen. Campus Allemagne gibt dir einen klaren nächsten Schritt und koordiniert parallel die komplexeren Prüfungen.",
    projectReady: "Dein Projekt ist klar genug, damit wir die nächsten Schritte strukturieren und passende Hochschuloptionen festigen können.",
    projectPartial: "Wir haben bereits sinnvolle Optionen gefunden. Unser Team ergänzt jetzt die fehlenden Informationen, bevor wir die Auswahl weiter eingrenzen.",
    projectEmpty: "Wir klären zuerst die wesentlichen akademischen Informationen, damit wir eine verlässliche Hochschulauswahl aufbauen können.",
    priorityTitle: "Dein nächster Schritt",
    priorityText: "Konzentriere dich auf das, was direkt von dir abhängt. Campus Allemagne behält den Gesamtprozess im Blick und bringt den Rest parallel voran.",
    priorityStep: "Bringe diesen Schritt voran; wir führen die Prüfungen und die Vorbereitung deines Dossiers weiter.",
    language: "Sprache und Hochschulprojekt laufen parallel. Konzentriere dich nur auf das nächste sinnvolle Niveau; wir arbeiten währenddessen an Hochschulen und Dossier weiter.",
    campusGeneric: "Während du deinen nächsten Schritt angehst, vergleicht Campus Allemagne Optionen, prüft Bedingungen und organisiert die nächsten Dossier-Schritte. Wir fragen dich nur nach Dingen, die wirklich deine Mitwirkung brauchen.",
    reassurance: "Du musst den gesamten Prozess nicht allein steuern. Du hast einen klaren nächsten Schritt; Campus Allemagne koordiniert Prüfungen und die weitere Vorbereitung.",
    roadmap: [
      ["you", "Du", "Den nächsten Schritt angehen, der direkt von dir abhängt."],
      ["campus", "Campus Allemagne", "Wir prüfen Bedingungen, vergleichen Optionen und organisieren die nächsten Dossier-Schritte."],
      ["together", "Gemeinsam", "Wir machen aus bestätigten Informationen eine klare nächste Entscheidung."],
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
      ? "Campus Allemagne a déjà confirmé plusieurs éléments clés de cette piste. Nous complétons encore les conditions non confirmées avant de passer à une candidature."
      : "Cette piste est pertinente, mais Campus Allemagne poursuit encore les vérifications nécessaires avant toute candidature.",
    ar: verified
      ? "أكد Campus Allemagne بالفعل عدة عناصر أساسية في هذا المسار، ونواصل التحقق من الشروط غير المؤكدة قبل أي تقديم."
      : "هذا المسار مناسب مبدئيًا، ويواصل Campus Allemagne التحقق من الشروط اللازمة قبل أي تقديم.",
    en: verified
      ? "Campus Allemagne has already confirmed several key elements of this path. We are completing the remaining checks before any application."
      : "This path is relevant, but Campus Allemagne is still completing the checks required before any application.",
    de: verified
      ? "Campus Allemagne hat bereits mehrere Kernelemente dieser Option bestätigt. Wir ergänzen die offenen Prüfungen vor einer Bewerbung."
      : "Diese Option ist grundsätzlich relevant; Campus Allemagne führt vor einer Bewerbung noch die nötigen Prüfungen durch.",
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

  const expectedOptions = input.selection.selected;
  const returnedOptions = rawStudyOptions(payload.study_options);
  if (returnedOptions.length !== expectedOptions.length) return null;

  const studyOptions = expectedOptions.flatMap((selected, index) => {
    const item = returnedOptions[index] as Record<string, unknown>;
    const why = requiredString(item.why_it_fits, 500);
    const note = requiredString(item.verification_note, 500);
    if (!why || !note) return [];
    return [{
      optionId: optionId(selected),
      position: selected.position,
      institution: selected.verification.candidate.institution,
      programme: selected.verification.candidate.programme,
      city: selected.verification.candidate.city,
      whyItFits: why,
      verificationNote: note,
    }];
  });

  if (studyOptions.length !== expectedOptions.length) return null;

  const roadmap = rawRoadmap(payload.roadmap).flatMap((raw) => {
    const item = raw as Record<string, unknown>;
    const id = sanitizeCode(item.id);
    const label = requiredString(item.label, 120);
    const text = requiredString(item.text, 360);
    return id && label && text ? [{ id, label, text }] : [];
  }).slice(0, MAX_ROADMAP_ITEMS);

  if (roadmap.length < 2) return null;
  const seenRoadmapIds = new Set<string>();
  const normalizedRoadmap = roadmap.map((item, index) => {
    if (!seenRoadmapIds.has(item.id)) {
      seenRoadmapIds.add(item.id);
      return item;
    }
    return {
      ...item,
      id: `${item.id}_${index + 1}`,
    };
  });

  const focus = context.LANGUAGE_FOCUS;

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
    roadmap: normalizedRoadmap,
    reassurance,
    cta: {
      actionId: allowedAction.id,
      label: ctaLabel,
      text: ctaText,
    },
  };
}
