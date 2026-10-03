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
      const higherDiploma =
        profile.target_degree === "Master"
        && profile.last_diploma
        && !["none", "Baccalauréat", "secondary_other"].includes(profile.last_diploma);

      if (higherDiploma) {
        return `Votre parcours universitaire jusqu’à ${profile.last_diploma} représente déjà une étape importante ; nous allons maintenant structurer votre projet de Master en Allemagne.`;
      }
      if (profile.bac_status === "obtained" && profile.average_out_of_20) {
        return `Félicitations pour votre ${bac} obtenu avec ${profile.average_out_of_20}/20. Nous allons maintenant structurer la suite de votre projet d’études en Allemagne.`;
      }
      if (profile.bac_status === "obtained") {
        return `Félicitations pour l’obtention de votre ${bac}. Nous allons maintenant structurer la suite de votre projet d’études en Allemagne.`;
      }
      if (profile.bac_status === "preparing") {
        return "Bon courage pour cette étape vers le Bac. Votre projet d’études en Allemagne peut déjà se préparer dès maintenant.";
      }
      if (profile.bac_status === "no_bac") {
        return "Votre projet d’études en Allemagne peut déjà commencer à se construire ; nous allons d’abord clarifier la prochaine étape académique adaptée.";
      }
      if (profile.german_level === "C1" || profile.german_level === "C2") {
        return `Votre niveau ${profile.german_level} en allemand représente déjà une avancée importante dans votre projet ; nous pouvons maintenant structurer la suite.`;
      }
      return "Votre projet d’études en Allemagne peut commencer à prendre forme dès maintenant ; nous allons avancer étape par étape.";
    },
    projectReady: "Vous avez franchi une étape importante ; Campus Allemagne va maintenant organiser concrètement la suite de votre projet.",
    projectPartial: "La base de votre projet est déjà posée ; nous complétons maintenant les éléments manquants pour organiser la suite avec vous.",
    projectEmpty: "Votre projet peut déjà avancer ; nous allons d’abord clarifier avec vous les éléments académiques essentiels.",
    priorityTitle: "Votre prochaine action",
    priorityText: "Concentrez-vous sur ce qui dépend directement de vous. Campus Allemagne garde la vue d’ensemble et fait avancer le reste du parcours en parallèle.",
    priorityStep: "Avancez sur cette étape ; nous poursuivons les vérifications et la préparation du dossier.",
    language: "La langue et le projet universitaire avancent en parallèle. Concentrez-vous seulement sur le prochain niveau utile ; nous continuons à travailler sur les universités et le dossier.",
    campusGeneric: "Pendant que vous avancez sur votre prochaine action, Campus Allemagne compare les pistes, vérifie les conditions et organise les prochaines étapes du dossier. Nous vous demandons uniquement les éléments qui nécessitent réellement votre intervention.",
    reassurance: "Vous n’avez pas à gérer seul tout le parcours. Vous avancez sur une prochaine action claire ; Campus Allemagne garde le contrôle des vérifications et de la suite du dossier.",
    roadmap: [
      ["you", "Vous", "Avancer sur la prochaine action qui dépend directement de vous."],
      ["campus", "Campus Allemagne", "Nous vérifions les conditions et organisons la suite du dossier."],
      ["together", "Ensemble", "Nous décidons de la prochaine étape à partir des informations confirmées."],
    ],
  },
  ar: {
    opening: (profile: OrientationWriterContext["PROFIL_ETUDIANT"]) => {
      const higherDiploma =
        profile.target_degree === "Master"
        && profile.last_diploma
        && !["none", "Baccalauréat", "secondary_other"].includes(profile.last_diploma);

      if (higherDiploma) {
        return `مسارك الجامعي حتى ${profile.last_diploma} يمثل خطوة مهمة أنجزتها بالفعل، وسنبدأ الآن بتنظيم مشروع الماستر في ألمانيا.`;
      }
      if (profile.bac_status === "obtained" && profile.average_out_of_20) {
        return `مبروك على الحصول على الباكالوريا بمعدل ${profile.average_out_of_20}/20. سننظم الآن معك الخطوة التالية من مشروع الدراسة في ألمانيا.`;
      }
      if (profile.bac_status === "obtained") {
        return "مبروك على الحصول على الباكالوريا. سننظم الآن معك الخطوة التالية من مشروع الدراسة في ألمانيا.";
      }
      if (profile.bac_status === "preparing") {
        return "بالتوفيق في هذه المرحلة نحو الباكالوريا. يمكنك من الآن البدء في تحضير مشروع الدراسة في ألمانيا خطوة بخطوة.";
      }
      if (profile.bac_status === "no_bac") {
        return "يمكن لمشروعك للدراسة في ألمانيا أن يبدأ من الآن؛ سنوضح أولًا الخطوة الأكاديمية التالية المناسبة لوضعك.";
      }
      if (profile.german_level === "C1" || profile.german_level === "C2") {
        return `وصولك إلى مستوى ${profile.german_level} في الألمانية يمثل تقدمًا مهمًا في مشروعك، ويمكننا الآن تنظيم الخطوات التالية.`;
      }
      return "يمكن لمشروعك للدراسة في ألمانيا أن يبدأ من الآن، وسنتقدم معك خطوة بخطوة.";
    },
    projectReady: "لقد أنجزت خطوة مهمة؛ وسيقوم Campus Allemagne الآن بتنظيم بقية مشروعك بشكل عملي.",
    projectPartial: "أساس مشروعك موجود بالفعل؛ ونكمل الآن العناصر الناقصة حتى ننظم معك الخطوات التالية.",
    projectEmpty: "يمكن لمشروعك أن يتقدم من الآن؛ وسنوضح معك أولًا العناصر الأكاديمية الأساسية.",
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
    opening: (profile: OrientationWriterContext["PROFIL_ETUDIANT"]) => {
      const higherDiploma =
        profile.target_degree === "Master"
        && profile.last_diploma
        && !["none", "Baccalauréat", "secondary_other"].includes(profile.last_diploma);

      if (higherDiploma) {
        return `Your academic path through ${profile.last_diploma} is already an important milestone; we can now structure your Master project in Germany.`;
      }
      if (profile.bac_status === "obtained" && profile.average_out_of_20) {
        return `Congratulations on completing your secondary diploma with ${profile.average_out_of_20}/20. We can now structure the next step of your Germany study project.`;
      }
      if (profile.bac_status === "obtained") {
        return "Congratulations on completing your secondary diploma. We can now structure the next step of your Germany study project.";
      }
      if (profile.bac_status === "preparing") {
        return "Good luck with this stage toward your secondary diploma. Your Germany study project can already start taking shape now.";
      }
      if (profile.bac_status === "no_bac") {
        return "Your Germany study project can already start taking shape; we will first clarify the next academic step that fits your situation.";
      }
      if (profile.german_level === "C1" || profile.german_level === "C2") {
        return `Your ${profile.german_level} German level is already meaningful progress in your project; we can now structure the next steps.`;
      }
      return "Your Germany study project can start taking shape now, one clear step at a time.";
    },
    projectReady: "You have already crossed an important milestone; Campus Allemagne will now organise the next part of your project.",
    projectPartial: "The foundation of your project is already in place; we are completing the missing pieces so we can organise the next steps with you.",
    projectEmpty: "Your project can already move forward; we will first clarify the essential academic elements with you.",
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
    opening: (profile: OrientationWriterContext["PROFIL_ETUDIANT"]) => {
      const higherDiploma =
        profile.target_degree === "Master"
        && profile.last_diploma
        && !["none", "Baccalauréat", "secondary_other"].includes(profile.last_diploma);

      if (higherDiploma) {
        return `Dein bisheriger Hochschulweg bis ${profile.last_diploma} ist bereits ein wichtiger Meilenstein; jetzt strukturieren wir dein Master-Projekt in Deutschland.`;
      }
      if (profile.bac_status === "obtained" && profile.average_out_of_20) {
        return `Glückwunsch zu deinem Schulabschluss mit ${profile.average_out_of_20}/20. Jetzt können wir den nächsten Schritt deines Deutschland-Projekts strukturieren.`;
      }
      if (profile.bac_status === "obtained") {
        return "Glückwunsch zu deinem Schulabschluss. Jetzt können wir den nächsten Schritt deines Deutschland-Projekts strukturieren.";
      }
      if (profile.bac_status === "preparing") {
        return "Viel Erfolg auf dem Weg zu deinem Schulabschluss. Dein Studienprojekt für Deutschland kann schon jetzt Schritt für Schritt vorbereitet werden.";
      }
      if (profile.bac_status === "no_bac") {
        return "Dein Studienprojekt für Deutschland kann bereits Gestalt annehmen; zuerst klären wir den passenden nächsten akademischen Schritt.";
      }
      if (profile.german_level === "C1" || profile.german_level === "C2") {
        return `Dein Deutschniveau ${profile.german_level} ist bereits ein wichtiger Fortschritt für dein Projekt; jetzt können wir die nächsten Schritte strukturieren.`;
      }
      return "Dein Studienprojekt für Deutschland kann jetzt Gestalt annehmen – Schritt für Schritt.";
    },
    projectReady: "Du hast bereits einen wichtigen Meilenstein erreicht; Campus Allemagne organisiert jetzt den nächsten Teil deines Projekts.",
    projectPartial: "Die Grundlage deines Projekts steht bereits; wir ergänzen die fehlenden Punkte und organisieren mit dir die nächsten Schritte.",
    projectEmpty: "Dein Projekt kann schon jetzt vorankommen; zuerst klären wir mit dir die wesentlichen akademischen Punkte.",
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

function localizedAdmissionOutlook(
  locale: OrientationWriterLocale,
  item: OrientationSelectionItem,
) {
  const strongSignals = [
    "degree_match",
    "field_match",
    "specialty_match",
    "study_language_match",
    "preferred_city_match",
    "intake_match",
    "current_language_sufficient",
    "deadline_known",
    "application_route_known",
  ].filter((reason) =>
    item.reasons.includes(reason as OrientationSelectionReasonCode)
  ).length;

  const strong =
    item.verification.overallStatus === "verified"
    && strongSignals >= 4;

  const copy = {
    fr: strong
      ? "Première estimation Campus Allemagne : fortes chances d’admission, à confirmer ensemble lors de la vérification finale."
      : "Première estimation Campus Allemagne : bon potentiel d’admission, à confirmer ensemble lors de la vérification finale.",
    ar: strong
      ? "التقدير الأولي من Campus Allemagne: فرص القبول قوية، وسنؤكد ذلك معك بعد المراجعة النهائية."
      : "التقدير الأولي من Campus Allemagne: لديك فرصة قبول جيدة، وسنؤكد ذلك معك بعد المراجعة النهائية.",
    en: strong
      ? "Initial Campus Allemagne estimate: strong admission chances, to be confirmed together during the final review."
      : "Initial Campus Allemagne estimate: good admission potential, to be confirmed together during the final review.",
    de: strong
      ? "Erste Einschätzung von Campus Allemagne: gute bis sehr gute Zulassungschancen, die wir in der Abschlussprüfung gemeinsam bestätigen."
      : "Erste Einschätzung von Campus Allemagne: gutes Zulassungspotenzial, das wir in der Abschlussprüfung gemeinsam bestätigen.",
  };

  return copy[locale];
}

function localizedReason(
  locale: OrientationWriterLocale,
  item: OrientationSelectionItem,
) {
  const city = item.verification.candidate.city;
  const hasSpecialtyMatch = item.reasons.includes("specialty_match");
  const priorities: OrientationSelectionReasonCode[] = [
    "specialty_match",
    "field_match",
    "study_language_match",
    "preferred_city_match",
    "intake_match",
    "current_language_sufficient",
    "deadline_known",
    "application_route_known",
    "degree_match",
    "core_verified",
  ];

  const labels: Record<
    OrientationWriterLocale,
    Partial<Record<OrientationSelectionReasonCode, string>>
  > = {
    fr: {
      specialty_match: "spécialité recherchée",
      field_match: "domaine d’études visé",
      study_language_match: "langue d’enseignement conforme à votre choix",
      preferred_city_match: city ? `${city} fait partie de vos villes préférées` : "ville correspondant à votre préférence",
      intake_match: "rentrée visée disponible",
      current_language_sufficient: "niveau de langue actuel déjà suffisant",
      deadline_known: "date limite de la rentrée visée déjà vérifiée",
      application_route_known: "voie de candidature déjà identifiée",
      degree_match: "niveau de diplôme correspondant",
      core_verified: "informations principales vérifiées sur une source officielle",
    },
    ar: {
      specialty_match: "التخصص الذي تبحث عنه",
      field_match: "مجال الدراسة الذي تستهدفه",
      study_language_match: "لغة تدريس متوافقة مع اختيارك",
      preferred_city_match: city ? `${city} من المدن التي تفضلها` : "مدينة توافق تفضيلك",
      intake_match: "فترة الدخول التي تستهدفها متاحة",
      current_language_sufficient: "مستواك اللغوي الحالي يفي بالشرط الموثق",
      deadline_known: "آخر موعد للفترة المستهدفة تم التحقق منه",
      application_route_known: "طريقة التقديم محددة",
      degree_match: "مستوى الشهادة يطابق هدفك",
      core_verified: "المعلومات الأساسية موثقة من مصدر رسمي",
    },
    en: {
      specialty_match: "your target specialty",
      field_match: "your target study field",
      study_language_match: "teaching language matching your preference",
      preferred_city_match: city ? `${city} is one of your preferred cities` : "a city matching your preference",
      intake_match: "your target intake is available",
      current_language_sufficient: "your current language level already meets the verified requirement",
      deadline_known: "the target-intake deadline is already verified",
      application_route_known: "the application route is already identified",
      degree_match: "the degree level matches your target",
      core_verified: "the main programme information is verified on an official source",
    },
    de: {
      specialty_match: "gewünschte Fachrichtung",
      field_match: "gewünschter Studienbereich",
      study_language_match: "Unterrichtssprache passend zu deiner Wahl",
      preferred_city_match: city ? `${city} gehört zu deinen bevorzugten Städten` : "Stadt passend zu deiner Präferenz",
      intake_match: "gewünschter Studienstart verfügbar",
      current_language_sufficient: "aktuelles Sprachniveau erfüllt bereits die geprüfte Anforderung",
      deadline_known: "Frist für den gewünschten Studienstart bereits geprüft",
      application_route_known: "Bewerbungsweg bereits identifiziert",
      degree_match: "Abschlussniveau passend zu deinem Ziel",
      core_verified: "zentrale Programminformationen aus offizieller Quelle geprüft",
    },
  };

  const selectedReasons = priorities
    .filter((reason) =>
      item.reasons.includes(reason)
      && !(reason === "field_match" && hasSpecialtyMatch)
    )
    .map((reason) => labels[locale][reason])
    .filter((value): value is string => Boolean(value))
    .slice(0, 3);

  if (selectedReasons.length === 0) {
    return labels[locale].core_verified || "";
  }

  const prefix = {
    fr: "Cette piste est étudiée pour des raisons concrètes : ",
    ar: "ندرس هذا المسار لأسباب ملموسة: ",
    en: "We are reviewing this path for concrete reasons: ",
    de: "Wir prüfen diese Option aus konkreten Gründen: ",
  }[locale];

  return `${localizedAdmissionOutlook(locale, item)} ${prefix}${selectedReasons.join(" · ")}.`;
}

function localizedVerificationNote(
  locale: OrientationWriterLocale,
  item: OrientationSelectionItem,
) {
  const verified = item.verification.overallStatus === "verified";
  const copy = {
    fr: verified
      ? "Plusieurs éléments clés sont confirmés ; Campus Allemagne complète les conditions restantes."
      : "Campus Allemagne poursuit les vérifications essentielles avant toute candidature.",
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
