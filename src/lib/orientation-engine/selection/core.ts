import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationProgrammeVerification,
  OrientationVerificationFact,
  OrientationVerificationFactKey,
} from "@/lib/orientation-engine/verification/types";
import {
  ORIENTATION_SELECTION_MAX_TARGET,
  ORIENTATION_SELECTION_MIN_TARGET,
  type OrientationSelectionCandidateEvaluation,
  type OrientationSelectionExclusionCode,
  type OrientationSelectionReasonCode,
  type OrientationSelectionResult,
  type OrientationSelectionScoreBreakdown,
  type OrientationSelectionWarningCode,
} from "@/lib/orientation-engine/selection/types";

const levelRank: Record<string, number> = {
  none: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

const fieldAliases: Record<string, readonly string[]> = {
  Informatique: [
    "computer science",
    "informatics",
    "informatik",
    "computer engineering",
    "software engineering",
  ],
  "Économie/Gestion": [
    "economics",
    "business",
    "management",
    "wirtschaft",
  ],
  Architecture: ["architecture", "architektur"],
  Sciences: [
    "science",
    "sciences",
    "mathematics",
    "physics",
    "chemistry",
    "biology",
  ],
  "Médecine/Santé": [
    "medicine",
    "medical",
    "health",
    "medizin",
    "gesundheit",
  ],
  "Lettres/Langues": [
    "language",
    "languages",
    "literature",
    "linguistics",
    "lettres",
    "langues",
  ],
};

const engineeringAliases: Record<string, readonly string[]> = {
  computer_engineering: [
    "computer engineering",
    "computer science",
    "informatics",
    "informatik",
    "information engineering",
  ],
  electrical_electronics: [
    "electrical",
    "electronics",
    "elektro",
    "information technology",
  ],
  mechanical: ["mechanical", "maschinenbau"],
  mechatronics_robotics: [
    "mechatronics",
    "robotics",
    "mechatronik",
    "robotik",
  ],
  civil: ["civil", "bauingenieur", "building engineering"],
  industrial_production: [
    "industrial",
    "production",
    "manufacturing",
    "produktion",
  ],
  automotive: [
    "automotive",
    "vehicle",
    "fahrzeug",
    "mobility engineering",
  ],
  aerospace: [
    "aerospace",
    "aeronaut",
    "luft",
    "raumfahrt",
  ],
  energy: ["energy", "energie"],
};

const genericEngineeringAliases = [
  "engineering",
  "ingenieur",
  "ingenieurwesen",
] as const;

function normalize(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function canonicalDegree(value: string | null | undefined) {
  const normalized = normalize(value);
  if (normalized.includes("bachelor") || /\bb\.?sc\.?\b/.test(normalized)) {
    return "bachelor";
  }
  if (normalized.includes("master") || /\bm\.?sc\.?\b/.test(normalized)) {
    return "master";
  }
  return normalized;
}

function canonicalCity(value: string | null | undefined) {
  const normalized = normalize(value);
  const aliases: Record<string, string> = {
    "cologne": "koln",
    "munich": "munchen",
    "nuremberg": "nurnberg",
    "francfort": "frankfurt",
    "hanovre": "hannover",
    "breme": "bremen",
    "dresde": "dresden",
    "fribourg": "freiburg",
    "iena": "jena",
    "mayence": "mainz",
    "sarrebruck": "saarbrucken",
    "saarbrucken": "saarbrucken",
  };
  return aliases[normalized] || normalized;
}

function fact(
  verification: OrientationProgrammeVerification,
  field: OrientationVerificationFactKey,
) {
  return verification.facts.find((item) => item.field === field) || null;
}

function factString(item: OrientationVerificationFact | null) {
  return typeof item?.value === "string" ? item.value : null;
}

function factStrings(item: OrientationVerificationFact | null) {
  return Array.isArray(item?.value)
    ? item.value.filter((value): value is string => typeof value === "string")
    : [];
}

function includesAny(haystack: string, aliases: readonly string[]) {
  const normalizedAliases = aliases.map(normalize).filter(Boolean);
  return normalizedAliases.some((alias) => haystack.includes(alias));
}

function fieldMatch(
  profile: PublicOrientationAnswers,
  verification: OrientationProgrammeVerification,
) {
  const programme = normalize(verification.candidate.programme);
  if (!profile.targetField || profile.targetField === "other") {
    return "unknown" as const;
  }

  if (profile.targetField === "Ingénierie") {
    const specialty = profile.engineeringSpecialty;
    if (
      specialty
      && specialty !== "undecided"
      && specialty !== "other"
      && engineeringAliases[specialty]
    ) {
      if (includesAny(programme, engineeringAliases[specialty])) {
        return "specialty" as const;
      }
    }

    if (
      includesAny(programme, genericEngineeringAliases)
      || Object.values(engineeringAliases).some((aliases) =>
        includesAny(programme, aliases)
      )
    ) {
      return "field" as const;
    }

    return "none" as const;
  }

  const aliases = fieldAliases[profile.targetField];
  if (!aliases) return "unknown" as const;
  return includesAny(programme, aliases) ? "field" as const : "none" as const;
}

function teachingLanguages(value: string | null) {
  const normalized = normalize(value);
  return {
    german:
      normalized.includes("german")
      || normalized.includes("deutsch")
      || normalized.includes("allemand"),
    english:
      normalized.includes("english")
      || normalized.includes("englisch")
      || normalized.includes("anglais"),
  };
}

function studyLanguageMatches(
  preference: string,
  teachingLanguage: string | null,
) {
  if (!preference || preference === "À définir") return null;

  const available = teachingLanguages(teachingLanguage);
  if (preference === "Allemand") return available.german;
  if (preference === "Anglais") return available.english;
  if (preference === "Allemand et anglais") {
    return available.german || available.english;
  }
  return null;
}

function requiredLevel(value: string | null) {
  if (!value) return null;
  return value.toUpperCase().match(/\b(A1|A2|B1|B2|C1|C2)\b/)?.[1] || null;
}

function levelSatisfied(current: string, required: string) {
  return (levelRank[current] ?? -1) >= (levelRank[required] ?? Number.POSITIVE_INFINITY);
}

function targetLanguageRequirement(
  profile: PublicOrientationAnswers,
  verification: OrientationProgrammeVerification,
) {
  const teaching = teachingLanguages(
    factString(fact(verification, "teaching_language"))
    || verification.candidate.teachingLanguage,
  );

  const german = fact(verification, "german_language_requirement");
  const english = fact(verification, "english_language_requirement");

  if (profile.studyLanguage === "Allemand") {
    return teaching.german ? { language: "german" as const, fact: german } : null;
  }
  if (profile.studyLanguage === "Anglais") {
    return teaching.english ? { language: "english" as const, fact: english } : null;
  }

  if (profile.studyLanguage === "Allemand et anglais" || profile.studyLanguage === "À définir") {
    if (teaching.german && german?.value) {
      return { language: "german" as const, fact: german };
    }
    if (teaching.english && english?.value) {
      return { language: "english" as const, fact: english };
    }
  }

  return null;
}

function intakeMatches(target: string, values: readonly string[]) {
  if (!target || values.length === 0) return null;
  const normalized = values.map(normalize);

  if (target === "winter") {
    return normalized.some((value) =>
      value.includes("winter")
      || value === "ws"
      || value.includes("wintersemester")
    );
  }

  if (target === "summer") {
    return normalized.some((value) =>
      value.includes("summer")
      || value.includes("sommer")
      || value === "ss"
      || value.includes("sommersemester")
    );
  }

  return null;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function addReason(
  reasons: OrientationSelectionReasonCode[],
  reason: OrientationSelectionReasonCode,
) {
  if (!reasons.includes(reason)) reasons.push(reason);
}

function addWarning(
  warnings: OrientationSelectionWarningCode[],
  warning: OrientationSelectionWarningCode,
) {
  if (!warnings.includes(warning)) warnings.push(warning);
}

function emptyBreakdown(): OrientationSelectionScoreBreakdown {
  return {
    verification: 0,
    degree: 0,
    field: 0,
    language: 0,
    city: 0,
    intake: 0,
    readiness: 0,
    diversity: 0,
  };
}

function totalScore(breakdown: OrientationSelectionScoreBreakdown) {
  return Object.values(breakdown).reduce((total, value) => total + value, 0);
}

export function evaluateOrientationSelectionCandidate(
  profile: PublicOrientationAnswers,
  verification: OrientationProgrammeVerification,
): OrientationSelectionCandidateEvaluation {
  const breakdown = emptyBreakdown();
  const reasons: OrientationSelectionReasonCode[] = [];
  const warnings: OrientationSelectionWarningCode[] = [];
  const exclusionCodes: OrientationSelectionExclusionCode[] = [];

  if (verification.overallStatus === "verified") {
    breakdown.verification += 35;
    addReason(reasons, "core_verified");
  } else if (verification.overallStatus === "needs_review") {
    breakdown.verification += 15;
    addWarning(warnings, "core_needs_review");
  } else {
    addWarning(warnings, "core_unknown");
  }

  const exists = fact(verification, "programme_exists");
  if (
    exists?.status === "verified"
    && exists.value === false
  ) {
    exclusionCodes.push("programme_not_current");
  }

  const degree = fact(verification, "degree_level");
  if (typeof degree?.value === "string" && profile.targetDegree) {
    const matches =
      canonicalDegree(degree.value) === canonicalDegree(profile.targetDegree);

    if (degree.status === "verified" && !matches) {
      exclusionCodes.push("degree_mismatch");
    } else if (matches && degree.status === "verified") {
      breakdown.degree += 20;
      addReason(reasons, "degree_match");
    } else if (matches && degree.status === "needs_review") {
      breakdown.degree += 8;
      addReason(reasons, "degree_match");
      addWarning(warnings, "degree_needs_review");
    } else if (degree.status !== "verified") {
      addWarning(warnings, "degree_needs_review");
    }
  } else if (profile.targetDegree) {
    addWarning(warnings, "degree_needs_review");
  }

  const field = fieldMatch(profile, verification);
  if (field === "specialty") {
    breakdown.field += 25;
    addReason(reasons, "specialty_match");
    addReason(reasons, "field_match");
  } else if (field === "field") {
    breakdown.field += 18;
    addReason(reasons, "field_match");
  } else if (field === "none") {
    addWarning(warnings, "field_needs_review");
  }

  const teaching = fact(verification, "teaching_language");
  const teachingValue =
    factString(teaching)
    || verification.candidate.teachingLanguage;
  const languageMatch = studyLanguageMatches(
    profile.studyLanguage,
    teachingValue,
  );

  if (
    languageMatch === true
    && teaching?.status === "verified"
  ) {
    breakdown.language += 12;
    addReason(reasons, "study_language_match");
  } else if (
    languageMatch === true
    && teaching?.status === "needs_review"
  ) {
    breakdown.language += 5;
    addReason(reasons, "study_language_match");
    addWarning(warnings, "core_needs_review");
  } else if (languageMatch === false) {
    breakdown.language -= 8;
    addWarning(warnings, "study_language_other");
  }

  const city = fact(verification, "city");
  const cityValue = factString(city) || verification.candidate.city;
  if (profile.preferredCities.length > 0 && cityValue) {
    const preferred = profile.preferredCities.some(
      (value) => canonicalCity(value) === canonicalCity(cityValue),
    );

    if (preferred && city?.status === "verified") {
      breakdown.city += 8;
      addReason(reasons, "preferred_city_match");
    } else if (preferred && city?.status === "needs_review") {
      breakdown.city += 3;
      addReason(reasons, "preferred_city_match");
    } else if (!preferred) {
      breakdown.city -= 2;
      addWarning(warnings, "preferred_city_other");
    }
  }

  const intake = fact(verification, "intake_terms");
  if (profile.targetIntakeSeason) {
    const intakeMatch = intakeMatches(
      profile.targetIntakeSeason,
      factStrings(intake),
    );

    if (intake?.status === "verified" && intakeMatch === false) {
      exclusionCodes.push("intake_unavailable");
    } else if (intake?.status === "verified" && intakeMatch === true) {
      breakdown.intake += 8;
      addReason(reasons, "intake_match");
    } else if (intake?.status === "needs_review") {
      if (intakeMatch === true) {
        breakdown.intake += 3;
        addReason(reasons, "intake_match");
      }
      addWarning(warnings, "intake_needs_review");
    } else {
      addWarning(warnings, "intake_unknown");
    }
  }

  const languageRequirement = targetLanguageRequirement(profile, verification);
  if (languageRequirement) {
    const required = requiredLevel(factString(languageRequirement.fact));
    const current =
      languageRequirement.language === "german"
        ? profile.germanLevel
        : profile.englishLevel;

    if (required) {
      if (levelSatisfied(current, required)) {
        breakdown.readiness += 6;
        addReason(reasons, "current_language_sufficient");
      } else {
        breakdown.readiness -= 3;
        addWarning(warnings, "language_requirement_to_complete");
      }
    } else {
      addWarning(warnings, "language_requirement_unknown");
    }
  } else if (teachingValue) {
    addWarning(warnings, "language_requirement_unknown");
  }

  const applicationRoute = fact(verification, "application_route");
  if (
    applicationRoute
    && applicationRoute.status !== "unknown"
    && typeof applicationRoute.value === "string"
  ) {
    breakdown.readiness += applicationRoute.status === "verified" ? 3 : 1;
    addReason(reasons, "application_route_known");
  } else {
    addWarning(warnings, "application_route_unknown");
  }

  const deadlineField =
    profile.targetIntakeSeason === "summer"
      ? "summer_deadline"
      : profile.targetIntakeSeason === "winter"
        ? "winter_deadline"
        : null;
  const deadline = deadlineField ? fact(verification, deadlineField) : null;
  if (
    deadline
    && deadline.status !== "unknown"
    && typeof deadline.value === "string"
  ) {
    breakdown.readiness += deadline.status === "verified" ? 3 : 1;
    addReason(reasons, "deadline_known");
  } else if (deadlineField) {
    addWarning(warnings, "deadline_unknown");
  }

  const studienkolleg = fact(verification, "studienkolleg_requirement");
  if (
    studienkolleg?.value === true
    && studienkolleg.status !== "unknown"
  ) {
    addWarning(warnings, "studienkolleg_review");
  }

  const fees = fact(verification, "tuition_or_semester_fees");
  if (!fees || fees.status === "unknown" || fees.value === null) {
    addWarning(warnings, "fees_unknown");
  }

  const missingFacts = verification.facts
    .filter((item) => item.status === "unknown")
    .map((item) => item.field);

  const baseScore = totalScore(breakdown);

  return {
    verification,
    excluded: exclusionCodes.length > 0,
    exclusionCodes: unique(exclusionCodes),
    baseScore,
    finalScore: baseScore,
    breakdown,
    reasons: unique(reasons),
    warnings: unique(warnings),
    missingFacts: unique(missingFacts),
  };
}

function evaluationTieKey(item: OrientationSelectionCandidateEvaluation) {
  return [
    normalize(item.verification.candidate.institution),
    normalize(item.verification.candidate.programme),
  ].join("::");
}

function verificationRank(item: OrientationSelectionCandidateEvaluation) {
  if (item.verification.overallStatus === "verified") return 2;
  if (item.verification.overallStatus === "needs_review") return 1;
  return 0;
}

function sortedByBaseScore(
  evaluations: readonly OrientationSelectionCandidateEvaluation[],
) {
  return [...evaluations].sort((a, b) => {
    if (b.baseScore !== a.baseScore) return b.baseScore - a.baseScore;
    const verificationDiff = verificationRank(b) - verificationRank(a);
    if (verificationDiff !== 0) return verificationDiff;
    return evaluationTieKey(a).localeCompare(evaluationTieKey(b));
  });
}

function candidateCity(item: OrientationSelectionCandidateEvaluation) {
  return canonicalCity(
    factString(fact(item.verification, "city"))
    || item.verification.candidate.city,
  );
}

function withDiversity(
  item: OrientationSelectionCandidateEvaluation,
  selected: readonly OrientationSelectionCandidateEvaluation[],
) {
  const copy: OrientationSelectionCandidateEvaluation = {
    ...item,
    breakdown: { ...item.breakdown },
    reasons: [...item.reasons],
    warnings: [...item.warnings],
    exclusionCodes: [...item.exclusionCodes],
    missingFacts: [...item.missingFacts],
  };

  if (selected.length === 0) return copy;

  const institutions = new Set(
    selected.map((current) =>
      normalize(current.verification.candidate.institution)
    ),
  );
  const institution = normalize(copy.verification.candidate.institution);
  if (institution && !institutions.has(institution)) {
    copy.breakdown.diversity += 5;
    addReason(copy.reasons, "institution_diversity");
  }

  const selectedCities = new Set(
    selected.map(candidateCity).filter(Boolean),
  );
  const city = candidateCity(copy);
  if (city && selectedCities.size > 0 && !selectedCities.has(city)) {
    copy.breakdown.diversity += 3;
    addReason(copy.reasons, "city_diversity");
  }

  copy.finalScore = copy.baseScore + copy.breakdown.diversity;
  return copy;
}

export function buildOrientationSelection(
  profile: PublicOrientationAnswers,
  programmes: readonly OrientationProgrammeVerification[],
): OrientationSelectionResult {
  const evaluations = programmes.map((programme) =>
    evaluateOrientationSelectionCandidate(profile, programme)
  );

  const excluded = sortedByBaseScore(
    evaluations.filter((item) => item.excluded),
  );

  const pool = sortedByBaseScore(
    evaluations.filter(
      (item) =>
        !item.excluded
        && item.verification.overallStatus !== "unknown",
    ),
  );

  const selected: OrientationSelectionCandidateEvaluation[] = [];
  const remaining = [...pool];

  while (
    selected.length < ORIENTATION_SELECTION_MAX_TARGET
    && remaining.length > 0
  ) {
    const rescored = remaining
      .map((item) => withDiversity(item, selected))
      .sort((a, b) => {
        if (b.finalScore !== a.finalScore) {
          return b.finalScore - a.finalScore;
        }
        const verificationDiff = verificationRank(b) - verificationRank(a);
        if (verificationDiff !== 0) return verificationDiff;
        return evaluationTieKey(a).localeCompare(evaluationTieKey(b));
      });

    const choice = rescored[0];
    selected.push(choice);

    const key = evaluationTieKey(choice);
    const index = remaining.findIndex(
      (item) => evaluationTieKey(item) === key,
    );
    if (index >= 0) remaining.splice(index, 1);
  }

  const selectedKeys = new Set(selected.map(evaluationTieKey));
  const unselected = pool.filter(
    (item) => !selectedKeys.has(evaluationTieKey(item)),
  );

  const status =
    selected.length >= ORIENTATION_SELECTION_MIN_TARGET
      ? "ready"
      : selected.length > 0
        ? "partial"
        : "insufficient_evidence";

  return {
    profile,
    status,
    selected: selected.map((item, index) => ({
      ...item,
      position: index + 1,
    })),
    considered: programmes.length,
    excluded,
    unselected,
    targetSize: {
      min: ORIENTATION_SELECTION_MIN_TARGET,
      max: ORIENTATION_SELECTION_MAX_TARGET,
    },
    generatedBy: "deterministic_selection_v1",
  };
}
