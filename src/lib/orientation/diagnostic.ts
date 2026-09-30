import type { PublicOrientationAnswers } from "@/lib/orientation/public";

export const publicDiagnosticStatuses = [
  "explore",
  "needs_information",
  "needs_verification",
  "known_gap",
] as const;

export type PublicDiagnosticStatus = (typeof publicDiagnosticStatuses)[number];

export const publicDiagnosticHeadlineCodes = [
  "future_bac",
  "bachelor_project",
  "master_project",
  "other_project",
] as const;

export type PublicDiagnosticHeadlineCode = (typeof publicDiagnosticHeadlineCodes)[number];

export const publicDiagnosticCodes = [
  "future_bac_roadmap",
  "bachelor_program_search",
  "master_program_search",
  "other_study_search",
  "german_preparation",
  "english_preparation",
  "finish_bac",
  "add_average",
  "add_prior_diploma",
  "complete_prior_degree",
  "strengthen_german",
  "strengthen_english",
  "compare_verified_programs",
  "academic_access",
  "master_entry_requirements",
  "language_requirement",
  "budget_requirement",
  "application_route_and_deadline",
] as const;

export type PublicDiagnosticCode = (typeof publicDiagnosticCodes)[number];

export type PublicDiagnosticItem = {
  code: PublicDiagnosticCode;
  status: PublicDiagnosticStatus;
};

export type PublicOrientationDiagnostic = {
  overallStatus: PublicDiagnosticStatus;
  headlineCode: PublicDiagnosticHeadlineCode;
  paths: PublicDiagnosticItem[];
  priorities: PublicDiagnosticItem[];
  checks: PublicDiagnosticItem[];
  ruleTrace: string[];
};

const cefrOrder = ["none", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

function cefrRank(value: string) {
  const rank = cefrOrder.indexOf(value as (typeof cefrOrder)[number]);
  return rank >= 0 ? rank : null;
}

function isEarlyLanguageLevel(value: string) {
  const rank = cefrRank(value);
  return rank !== null && rank < cefrOrder.indexOf("B2");
}

function wantsGerman(value: string) {
  return value === "Allemand" || value === "Allemand et anglais";
}

function wantsEnglish(value: string) {
  return value === "Anglais" || value === "Allemand et anglais";
}

function completedFirstDegree(value: string) {
  return value === "Licence" || value === "Master";
}

function pushUnique(items: PublicDiagnosticItem[], item: PublicDiagnosticItem) {
  if (!items.some((current) => current.code === item.code)) items.push(item);
}

export function buildPublicOrientationDiagnostic(
  answers: PublicOrientationAnswers,
): PublicOrientationDiagnostic {
  const paths: PublicDiagnosticItem[] = [];
  const priorities: PublicDiagnosticItem[] = [];
  const checks: PublicDiagnosticItem[] = [];
  const ruleTrace: string[] = [];

  let headlineCode: PublicDiagnosticHeadlineCode = "other_project";
  let hasMaterialGap = false;
  let hasCriticalMissingInformation = false;

  if (answers.bacStatus === "preparing") {
    headlineCode = "future_bac";
    pushUnique(paths, { code: "future_bac_roadmap", status: "explore" });
    pushUnique(priorities, { code: "finish_bac", status: "known_gap" });
    ruleTrace.push("R-BAC-PREPARING");
    hasMaterialGap = true;
  }

  if (answers.targetDegree === "Bachelor") {
    if (answers.bacStatus !== "preparing") headlineCode = "bachelor_project";
    pushUnique(paths, { code: "bachelor_program_search", status: "needs_verification" });
    pushUnique(checks, { code: "academic_access", status: "needs_verification" });
    ruleTrace.push("R-DEGREE-BACHELOR");
  } else if (answers.targetDegree === "Master") {
    if (answers.bacStatus !== "preparing") headlineCode = "master_project";
    pushUnique(paths, { code: "master_program_search", status: "needs_verification" });
    pushUnique(checks, { code: "master_entry_requirements", status: "needs_verification" });
    ruleTrace.push("R-DEGREE-MASTER");

    if (!answers.lastDiploma) {
      pushUnique(priorities, { code: "add_prior_diploma", status: "needs_information" });
      ruleTrace.push("R-MASTER-DIPLOMA-MISSING");
      hasCriticalMissingInformation = true;
    } else if (!completedFirstDegree(answers.lastDiploma)) {
      pushUnique(priorities, { code: "complete_prior_degree", status: "known_gap" });
      ruleTrace.push("R-MASTER-FIRST-DEGREE-NOT-SHOWN");
      hasMaterialGap = true;
    }
  } else {
    pushUnique(paths, { code: "other_study_search", status: "needs_verification" });
    pushUnique(checks, { code: "academic_access", status: "needs_verification" });
    ruleTrace.push("R-DEGREE-OTHER");
  }

  if (!answers.generalAverage) {
    pushUnique(priorities, { code: "add_average", status: "needs_information" });
    ruleTrace.push("R-AVERAGE-MISSING");
  }

  const germanGap = wantsGerman(answers.studyLanguage) && isEarlyLanguageLevel(answers.germanLevel);
  if (germanGap) {
    pushUnique(paths, { code: "german_preparation", status: "known_gap" });
    pushUnique(priorities, { code: "strengthen_german", status: "known_gap" });
    ruleTrace.push("R-LANGUAGE-GERMAN-PREPARATION");
    hasMaterialGap = true;
  }

  const englishGap = wantsEnglish(answers.studyLanguage) && isEarlyLanguageLevel(answers.englishLevel);
  if (englishGap) {
    pushUnique(paths, { code: "english_preparation", status: "known_gap" });
    pushUnique(priorities, { code: "strengthen_english", status: "known_gap" });
    ruleTrace.push("R-LANGUAGE-ENGLISH-PREPARATION");
    hasMaterialGap = true;
  }

  pushUnique(priorities, { code: "compare_verified_programs", status: "needs_verification" });
  pushUnique(checks, { code: "language_requirement", status: "needs_verification" });
  pushUnique(checks, { code: "budget_requirement", status: "needs_verification" });
  pushUnique(checks, { code: "application_route_and_deadline", status: "needs_verification" });
  ruleTrace.push("R-UNIVERSAL-PROGRAM-CHECKS");

  const overallStatus: PublicDiagnosticStatus = hasCriticalMissingInformation
    ? "needs_information"
    : hasMaterialGap
      ? "known_gap"
      : "needs_verification";

  return {
    overallStatus,
    headlineCode,
    paths: paths.slice(0, 3),
    priorities,
    checks,
    ruleTrace,
  };
}
