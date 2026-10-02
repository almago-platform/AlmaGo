import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { getAcademicAccessConclusion } from "@/lib/orientation/verified-academic-options";
import { evaluateOrientationDeadline } from "@/lib/orientation-engine/deadline";
import {
  matchMasterRequirements,
  type MasterRequirementProfile,
} from "@/lib/master-requirements";
import type {
  OrientationInformationConfidence,
  OrientationProgrammeEvaluation,
  OrientationProgrammeRecord,
  OrientationRecommendationCategory,
  OrientationRuleCode,
  OrientationRuleResult,
  OrientationRuleStatus,
  OrientationSource,
} from "@/lib/orientation-engine/types";

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
  Informatique: ["computer science", "informatics", "informatik", "computer engineering"],
  "Économie/Gestion": ["economics", "business", "management", "wirtschaft"],
  Architecture: ["architecture", "architektur"],
  Sciences: ["science", "sciences", "mathematics", "physics", "chemistry", "biology"],
  "Médecine/Santé": ["medicine", "medical", "health", "medizin", "gesundheit"],
  "Lettres/Langues": ["language", "languages", "literature", "linguistics", "lettres", "langues"],
};

const engineeringAliases: Record<string, readonly string[]> = {
  computer_engineering: ["computer engineering", "computer science", "informatics", "informatik"],
  electrical_electronics: ["electrical", "electronics", "elektro", "information technology"],
  mechanical: ["mechanical", "maschinenbau"],
  mechatronics_robotics: ["mechatronics", "robotics", "mechatronik", "robotik"],
  civil: ["civil", "bauingenieur", "building engineering"],
  industrial_production: ["industrial", "production", "manufacturing", "produktion"],
  automotive: ["automotive", "vehicle", "fahrzeug"],
  aerospace: ["aerospace", "aeronaut", "luft", "raumfahrt"],
  energy: ["energy", "energie"],
};

function sourceFromProgramme(programme: OrientationProgrammeRecord): OrientationSource | null {
  if (!programme.programmeSourceUrl) return null;
  return {
    kind: "university",
    label: programme.university.name,
    url: programme.programmeSourceUrl,
    verifiedAt: programme.programmeVerifiedAt,
  };
}

function sourceFromUniversity(programme: OrientationProgrammeRecord): OrientationSource | null {
  const url = programme.university.sourceUrl || programme.university.websiteUrl;
  if (!url) return null;
  return {
    kind: "university",
    label: programme.university.name,
    url,
    verifiedAt: programme.university.verifiedAt,
  };
}

function uniqueSources(sources: Array<OrientationSource | null>) {
  const map = new Map<string, OrientationSource>();
  for (const source of sources) {
    if (!source) continue;
    map.set(`${source.kind}:${source.url}`, source);
  }
  return [...map.values()];
}

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function canonicalCity(value: string | null | undefined) {
  const normalized = normalize(value);
  const aliases: Record<string, string> = {
    sarrebruck: "saarbrücken",
    saarbrucken: "saarbrücken",
  };
  return aliases[normalized] || normalized;
}

function requiredLevel(value: string | null) {
  if (!value) return null;
  const match = value.toUpperCase().match(/\b(A1|A2|B1|B2|C1|C2)\b/);
  return match?.[1] || null;
}

function levelSatisfied(current: string, required: string) {
  const currentRank = levelRank[current] ?? -1;
  const requiredRank = levelRank[required] ?? Number.POSITIVE_INFINITY;
  return currentRank >= requiredRank;
}

function degreeMatches(profile: PublicOrientationAnswers, programme: OrientationProgrammeRecord) {
  return normalize(profile.targetDegree) === normalize(programme.degreeLevel);
}

function desiredFieldAliases(profile: PublicOrientationAnswers) {
  if (profile.targetField === "Ingénierie") {
    return engineeringAliases[profile.engineeringSpecialty] || [];
  }
  return fieldAliases[profile.targetField] || [normalize(profile.targetField)];
}

function fieldMatches(profile: PublicOrientationAnswers, programme: OrientationProgrammeRecord) {
  const haystack = normalize(`${programme.field || ""} ${programme.name}`);
  const aliases = desiredFieldAliases(profile).map(normalize).filter(Boolean);
  if (!haystack || aliases.length === 0) return null;
  return aliases.some((alias) => haystack.includes(alias));
}

function programmeTeachingLanguages(programme: OrientationProgrammeRecord) {
  const language = normalize(programme.teachingLanguage);
  return {
    german: language.includes("german") || language.includes("deutsch"),
    english: language.includes("english") || language.includes("englisch"),
  };
}

function teachingLanguagePreference(
  profile: PublicOrientationAnswers,
  programme: OrientationProgrammeRecord,
) {
  const available = programmeTeachingLanguages(programme);

  if (!programme.teachingLanguage) return null;
  if (profile.studyLanguage === "À définir") return true;
  if (profile.studyLanguage === "Allemand") return available.german;
  if (profile.studyLanguage === "Anglais") return available.english;
  if (profile.studyLanguage === "Allemand et anglais") return available.german || available.english;

  return null;
}

function academicAccessRule(profile: PublicOrientationAnswers): OrientationRuleResult {
  const access = getAcademicAccessConclusion(profile);

  if (access.status === "direct_subject_restricted") {
    return {
      code: "academic_access_supported",
      status: "likely_eligible",
      value: access.status,
      source: {
        kind: "daad_zab",
        label: "DAAD/ZAB",
        url: access.sourceUrl,
        verifiedAt: access.verifiedAt,
      },
    };
  }

  if (access.status === "verified_subject_mismatch") {
    return {
      code: "academic_access_review",
      status: "conditional",
      value: access.status,
      source: {
        kind: "daad_zab",
        label: "DAAD/ZAB",
        url: access.sourceUrl,
        verifiedAt: access.verifiedAt,
      },
    };
  }

  return {
    code: "academic_access_review",
    status: "missing_information",
    value: access.status,
    source: {
      kind: "daad_zab",
      label: "DAAD/ZAB",
      url: access.sourceUrl,
      verifiedAt: access.verifiedAt,
    },
  };
}

function languageRules(
  profile: PublicOrientationAnswers,
  programme: OrientationProgrammeRecord,
): OrientationRuleResult[] {
  const rules: OrientationRuleResult[] = [];
  const available = programmeTeachingLanguages(programme);
  const preference = teachingLanguagePreference(profile, programme);

  if (preference === true) {
    rules.push({ code: "teaching_language_match", status: "eligible", value: programme.teachingLanguage });
  } else if (preference === false) {
    rules.push({ code: "teaching_language_other", status: "conditional", value: programme.teachingLanguage });
  } else {
    rules.push({ code: "teaching_language_other", status: "unknown", value: programme.teachingLanguage });
  }

  if (available.german) {
    const required = requiredLevel(programme.germanLevelRequired);
    if (!required) {
      rules.push({
        code: "language_missing",
        status: "missing_information",
        value: "german_requirement",
      });
    } else if (levelSatisfied(profile.germanLevel, required)) {
      rules.push({ code: "language_satisfied", status: "eligible", value: `DE ${required}` });
    } else {
      rules.push({ code: "language_insufficient", status: "conditional", value: `DE ${required}` });
    }
  }

  if (available.english) {
    const required = requiredLevel(programme.englishLevelRequired);
    if (!required) {
      rules.push({
        code: "language_missing",
        status: "missing_information",
        value: "english_requirement",
      });
    } else if (levelSatisfied(profile.englishLevel, required)) {
      rules.push({ code: "language_satisfied", status: "eligible", value: `EN ${required}` });
    } else {
      rules.push({ code: "language_insufficient", status: "conditional", value: `EN ${required}` });
    }
  }

  return rules;
}

function sourceRule(programme: OrientationProgrammeRecord): OrientationRuleResult {
  const source = sourceFromProgramme(programme) || sourceFromUniversity(programme);
  if (!source) return { code: "source_incomplete", status: "unknown" };

  return {
    code: source.verifiedAt ? "source_verified" : "source_incomplete",
    status: source.verifiedAt ? "eligible" : "missing_information",
    source,
  };
}

function masterCurriculumRules(
  profile: PublicOrientationAnswers,
  programme: OrientationProgrammeRecord,
  now: Date,
): OrientationRuleResult[] {
  if (profile.targetDegree !== "Master" || !degreeMatches(profile, programme)) return [];

  const source = sourceFromProgramme(programme) || sourceFromUniversity(programme) || undefined;
  const academicPrerequisites = programme.masterAcademicPrerequisites || [];
  if (academicPrerequisites.length === 0) {
    return [{
      code: "master_curriculum_unknown",
      status: "missing_information",
      value: null,
      source,
    }];
  }

  const requirements: MasterRequirementProfile = {
    subject_credits: academicPrerequisites.map((item) => ({
      subject: item.subject,
      value: item.ects,
      source_url: source?.url || null,
      verified_at: source?.verifiedAt || null,
    })),
  };

  const subjectCredits = Object.fromEntries(
    Object.entries(profile.masterSubjectCredits || {})
      .map(([subject, rawCredits]) => [subject, Number(rawCredits)])
      .filter((entry): entry is [string, number] => Number.isFinite(entry[1])),
  );

  const match = matchMasterRequirements(
    {
      current_diploma: profile.lastDiploma || null,
      current_german_level: profile.germanLevel || null,
      subject_credits: subjectCredits,
    },
    requirements,
    now,
  );

  return match.criteria
    .filter((criterion) => criterion.criterion.startsWith("subject_credits:"))
    .map((criterion): OrientationRuleResult => {
      const subject = criterion.criterion.slice("subject_credits:".length);
      if (criterion.status === "satisfied") {
        return {
          code: "master_subject_credits_satisfied",
          status: "eligible",
          value: subject,
          source,
        };
      }
      if (criterion.status === "not_satisfied") {
        return {
          code: "master_subject_credits_insufficient",
          status: "conditional",
          value: subject,
          source,
        };
      }
      return {
        code: "master_subject_credits_missing",
        status: "missing_information",
        value: subject,
        source,
      };
    });
}

function intakeDeadlineRules(
  profile: PublicOrientationAnswers,
  programme: OrientationProgrammeRecord,
  now: Date,
): OrientationRuleResult[] {
  const source = sourceFromProgramme(programme) || sourceFromUniversity(programme) || undefined;
  const hasProgrammeTiming = programme.intakeTerms.length > 0
    || Boolean(programme.winterDeadline || programme.summerDeadline);
  const result = evaluateOrientationDeadline(
    {
      targetIntakeSeason: profile.targetIntakeSeason,
      targetIntakeYear: profile.targetIntakeYear,
      intakeTerms: programme.intakeTerms,
      winterDeadline: programme.winterDeadline,
      summerDeadline: programme.summerDeadline,
      sourceUrl: source?.url || null,
      verifiedAt: source?.verifiedAt || null,
    },
    now,
  );

  const rules: OrientationRuleResult[] = [];

  if (result.intakeStatus === "match") {
    rules.push({
      code: "intake_match",
      status: "eligible",
      value: profile.targetIntakeSeason,
      source,
    });
  } else if (result.intakeStatus === "unavailable") {
    rules.push({
      code: "intake_unavailable",
      status: "not_eligible",
      value: profile.targetIntakeSeason,
      source,
    });
  } else if (result.intakeStatus === "missing_target") {
    rules.push({
      code: "intake_unknown",
      status: hasProgrammeTiming ? "missing_information" : "unknown",
      value: "target_intake",
      source,
    });
  } else {
    rules.push({
      code: "intake_unknown",
      status: "unknown",
      value: profile.targetIntakeSeason || null,
      source,
    });
  }

  if (result.deadlineStatus === "open") {
    rules.push({
      code: "deadline_open",
      status: "eligible",
      value: result.deadline,
      source,
    });
  } else if (result.deadlineStatus === "closed") {
    rules.push({
      code: "deadline_closed",
      status: "not_eligible",
      value: result.deadline,
      source,
    });
  } else if (result.deadlineStatus === "to_verify") {
    rules.push({
      code: "deadline_to_verify",
      status: "missing_information",
      value: result.deadline,
      source,
    });
  } else if (result.deadlineStatus === "missing_target") {
    rules.push({
      code: "deadline_unknown",
      status: hasProgrammeTiming ? "missing_information" : "unknown",
      value: null,
      source,
    });
  } else {
    rules.push({
      code: "deadline_unknown",
      status: "unknown",
      value: null,
      source,
    });
  }

  return rules;
}


function overallStatus(rules: OrientationRuleResult[]): OrientationRuleStatus {
  const eligibilityCodes = new Set<OrientationRuleCode>([
    "degree_match",
    "field_match",
    "academic_access_supported",
    "academic_access_review",
    "master_subject_credits_satisfied",
    "master_subject_credits_missing",
    "master_subject_credits_insufficient",
    "master_curriculum_unknown",
    "language_satisfied",
    "language_missing",
    "language_insufficient",
    "intake_unavailable",
    "deadline_closed",
    "studienkolleg_required",
  ]);
  const critical = rules.filter((rule) => eligibilityCodes.has(rule.code));

  if (critical.some((rule) => rule.status === "not_eligible")) return "not_eligible";
  if (critical.some((rule) => rule.status === "conditional")) return "conditional";
  if (critical.some((rule) => rule.status === "missing_information")) return "missing_information";
  if (critical.some((rule) => rule.status === "unknown")) return "unknown";

  const allEligible = critical.length > 0 && critical.every(
    (rule) => rule.status === "eligible" || rule.status === "likely_eligible",
  );
  return allEligible ? "likely_eligible" : "unknown";
}

function informationConfidence(
  programme: OrientationProgrammeRecord,
  rules: OrientationRuleResult[],
): OrientationInformationConfidence {
  const source = sourceFromProgramme(programme) || sourceFromUniversity(programme);
  const hasUnknownCritical = rules.some(
    (rule) =>
      ["language_missing", "source_incomplete"].includes(rule.code)
      && ["missing_information", "unknown"].includes(rule.status),
  );

  if (!source || hasUnknownCritical) return "incomplete";
  if (!source.verifiedAt) return "medium";
  return "high";
}

function recommendationCategory(
  profile: PublicOrientationAnswers,
  rules: OrientationRuleResult[],
): OrientationRecommendationCategory {
  const cityMatched = rules.some((rule) => rule.code === "preferred_city" && rule.status === "eligible");
  const conditionCodes = new Set<OrientationRuleCode>([
    "academic_access_review",
    "master_subject_credits_missing",
    "master_subject_credits_insufficient",
    "master_curriculum_unknown",
    "language_missing",
    "language_insufficient",
    "intake_unknown",
    "deadline_to_verify",
    "deadline_unknown",
    "studienkolleg_required",
  ]);
  const hasCondition = rules.some(
    (rule) =>
      conditionCodes.has(rule.code)
      && ["conditional", "missing_information", "unknown"].includes(rule.status),
  );

  if (hasCondition) return "conditions_to_complete";
  if (profile.preferredCities.length > 0 && cityMatched) return "fits_preferences";
  return "conditions_well_covered";
}

function relevanceScore(rules: OrientationRuleResult[]) {
  let score = 0;
  if (rules.some((rule) => rule.code === "degree_match" && rule.status === "eligible")) score += 40;
  if (rules.some((rule) => rule.code === "field_match" && rule.status === "eligible")) score += 30;
  if (rules.some((rule) => rule.code === "language_satisfied" && rule.status === "eligible")) score += 15;
  if (rules.some((rule) => rule.code === "preferred_city" && rule.status === "eligible")) score += 10;
  if (rules.some((rule) => rule.code === "source_verified" && rule.status === "eligible")) score += 5;
  return score;
}

function classifyCodes(
  rules: OrientationRuleResult[],
  statuses: OrientationRuleStatus[],
): OrientationRuleCode[] {
  return [...new Set(
    rules
      .filter((rule) => statuses.includes(rule.status))
      .map((rule) => rule.code),
  )];
}

export function evaluateProgramme(
  profile: PublicOrientationAnswers,
  programme: OrientationProgrammeRecord,
  now: Date = new Date(),
): OrientationProgrammeEvaluation {
  const rules: OrientationRuleResult[] = [];

  rules.push({
    code: "degree_match",
    status: degreeMatches(profile, programme) ? "eligible" : "not_eligible",
    value: programme.degreeLevel,
  });

  const fieldMatch = fieldMatches(profile, programme);
  rules.push({
    code: "field_match",
    status: fieldMatch === true ? "eligible" : fieldMatch === false ? "not_eligible" : "unknown",
    value: programme.field,
  });

  rules.push(academicAccessRule(profile));
  rules.push(...masterCurriculumRules(profile, programme, now));
  rules.push(...languageRules(profile, programme));

  if (profile.preferredCities.length === 0) {
    rules.push({ code: "other_city", status: "unknown", value: programme.university.city });
  } else if (
    programme.university.city
    && profile.preferredCities.some((city) => canonicalCity(city) === canonicalCity(programme.university.city))
  ) {
    rules.push({ code: "preferred_city", status: "eligible", value: programme.university.city });
  } else {
    rules.push({ code: "other_city", status: "conditional", value: programme.university.city });
  }

  if (programme.studienkollegRequired) {
    rules.push({ code: "studienkolleg_required", status: "conditional", value: true });
  }

  if (programme.uniAssistRequired) {
    rules.push({ code: "uni_assist_required", status: "eligible", value: true });
  }

  rules.push(...intakeDeadlineRules(profile, programme, now));

  rules.push({ code: "budget_not_verified", status: "unknown" });
  rules.push(sourceRule(programme));

  const status = overallStatus(rules);
  const sources = uniqueSources([
    ...rules.map((rule) => rule.source || null),
    sourceFromProgramme(programme),
    sourceFromUniversity(programme),
  ]);

  return {
    programme,
    status,
    category: recommendationCategory(profile, rules),
    relevanceScore: relevanceScore(rules),
    rules,
    why: classifyCodes(rules, ["eligible", "likely_eligible"]),
    missingInformation: classifyCodes(rules, ["missing_information", "unknown"]),
    warnings: classifyCodes(rules, ["conditional"]),
    sources,
    informationConfidence: informationConfidence(programme, rules),
  };
}

export function rankProgrammeEvaluations(evaluations: OrientationProgrammeEvaluation[]) {
  return evaluations
    .filter((evaluation) => evaluation.status !== "not_eligible")
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
      const cityA = a.programme.university.city || "";
      const cityB = b.programme.university.city || "";
      const cityCompare = cityA.localeCompare(cityB);
      if (cityCompare !== 0) return cityCompare;
      return a.programme.name.localeCompare(b.programme.name);
    });
}
