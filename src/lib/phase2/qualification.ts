import type {
  PublicDiagnosticCode,
  PublicOrientationDiagnostic,
} from "@/lib/orientation/diagnostic";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";

export const PROSPECT_QUALIFICATION_ENGINE_VERSION = "prospect-qualification-v1";

export const prospectQualificationStates = [
  "not_evaluated",
  "too_early",
  "needs_information",
  "needs_verification",
  "ready_for_review",
  "qualified_prospect",
] as const;

export type ProspectQualificationState = (typeof prospectQualificationStates)[number];
export type AutomatedProspectQualificationState = Exclude<
  ProspectQualificationState,
  "qualified_prospect"
>;

export const prospectQualificationReasonCodes = [
  "orientation_missing",
  "bac_status_missing",
  "target_degree_missing",
  "target_field_missing",
  "study_language_missing",
  "german_level_missing",
  "english_level_missing",
  "average_missing",
  "prior_diploma_missing",
  "bac_in_preparation",
  "no_bac_academic_access",
  "first_degree_incomplete",
  "german_language_gap",
  "english_language_gap",
  "unsupported_project",
  "verification_required",
  "ready_for_human_review",
] as const;

export type ProspectQualificationReasonCode =
  (typeof prospectQualificationReasonCodes)[number];

export const prospectQualificationMissingFields = [
  "bacStatus",
  "targetDegree",
  "targetField",
  "studyLanguage",
  "germanLevel",
  "englishLevel",
  "generalAverage",
  "lastDiploma",
] as const;

export type ProspectQualificationMissingField =
  (typeof prospectQualificationMissingFields)[number];

export const prospectQualificationNextActions = [
  "complete_project_information",
  "continue_preparation",
  "resolve_project_verification",
  "request_human_review",
] as const;

export type ProspectQualificationNextAction =
  (typeof prospectQualificationNextActions)[number];

export type ProspectQualificationResult = {
  engineVersion: typeof PROSPECT_QUALIFICATION_ENGINE_VERSION;
  state: AutomatedProspectQualificationState;
  reasonCodes: ProspectQualificationReasonCode[];
  missingFields: ProspectQualificationMissingField[];
  verificationRequirements: PublicDiagnosticCode[];
  nextAction: ProspectQualificationNextAction;
};

const cefrOrder = ["none", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
const completedFirstDegrees = new Set(["Licence", "Master"]);

function pushUnique<T>(items: T[], item: T) {
  if (!items.includes(item)) items.push(item);
}

function languageRank(value: string) {
  const rank = cefrOrder.indexOf(value as (typeof cefrOrder)[number]);
  return rank >= 0 ? rank : null;
}

function isBelowB2(value: string) {
  const rank = languageRank(value);
  return rank === null || rank < cefrOrder.indexOf("B2");
}

function wantsGerman(value: string) {
  return value === "Allemand" || value === "Allemand et anglais";
}

function wantsEnglish(value: string) {
  return value === "Anglais" || value === "Allemand et anglais";
}

function verificationCodes(diagnostic: PublicOrientationDiagnostic) {
  return [...new Set(diagnostic.checks.map((item) => item.code))];
}

export function evaluateProspectQualification(
  answers: PublicOrientationAnswers,
  diagnostic: PublicOrientationDiagnostic | null,
): ProspectQualificationResult {
  const reasonCodes: ProspectQualificationReasonCode[] = [];
  const missingFields: ProspectQualificationMissingField[] = [];
  const verificationRequirements = diagnostic ? verificationCodes(diagnostic) : [];

  if (!diagnostic) {
    return {
      engineVersion: PROSPECT_QUALIFICATION_ENGINE_VERSION,
      state: "not_evaluated",
      reasonCodes: ["orientation_missing"],
      missingFields: [],
      verificationRequirements: [],
      nextAction: "complete_project_information",
    };
  }

  if (!answers.bacStatus) {
    pushUnique(missingFields, "bacStatus");
    pushUnique(reasonCodes, "bac_status_missing");
  }
  if (!answers.targetDegree) {
    pushUnique(missingFields, "targetDegree");
    pushUnique(reasonCodes, "target_degree_missing");
  }
  if (!answers.targetField) {
    pushUnique(missingFields, "targetField");
    pushUnique(reasonCodes, "target_field_missing");
  }
  if (!answers.studyLanguage) {
    pushUnique(missingFields, "studyLanguage");
    pushUnique(reasonCodes, "study_language_missing");
  }

  if (wantsGerman(answers.studyLanguage) && !answers.germanLevel) {
    pushUnique(missingFields, "germanLevel");
    pushUnique(reasonCodes, "german_level_missing");
  }
  if (wantsEnglish(answers.studyLanguage) && !answers.englishLevel) {
    pushUnique(missingFields, "englishLevel");
    pushUnique(reasonCodes, "english_level_missing");
  }

  if (answers.bacStatus !== "no_bac" && !answers.generalAverage) {
    pushUnique(missingFields, "generalAverage");
    pushUnique(reasonCodes, "average_missing");
  }

  if (
    (answers.targetDegree === "Master" || answers.bacStatus === "no_bac")
    && !answers.lastDiploma
  ) {
    pushUnique(missingFields, "lastDiploma");
    pushUnique(reasonCodes, "prior_diploma_missing");
  }

  if (missingFields.length > 0) {
    return {
      engineVersion: PROSPECT_QUALIFICATION_ENGINE_VERSION,
      state: "needs_information",
      reasonCodes,
      missingFields,
      verificationRequirements,
      nextAction: "complete_project_information",
    };
  }

  if (answers.bacStatus === "preparing") {
    return {
      engineVersion: PROSPECT_QUALIFICATION_ENGINE_VERSION,
      state: "too_early",
      reasonCodes: ["bac_in_preparation"],
      missingFields: [],
      verificationRequirements,
      nextAction: "continue_preparation",
    };
  }

  if (answers.bacStatus === "no_bac") {
    pushUnique(reasonCodes, "no_bac_academic_access");
  }

  if (
    answers.targetDegree === "Master"
    && !completedFirstDegrees.has(answers.lastDiploma)
  ) {
    return {
      engineVersion: PROSPECT_QUALIFICATION_ENGINE_VERSION,
      state: "too_early",
      reasonCodes: ["first_degree_incomplete"],
      missingFields: [],
      verificationRequirements,
      nextAction: "continue_preparation",
    };
  }

  if (answers.targetDegree !== "Bachelor" && answers.targetDegree !== "Master") {
    pushUnique(reasonCodes, "unsupported_project");
  }

  if (wantsGerman(answers.studyLanguage) && isBelowB2(answers.germanLevel)) {
    pushUnique(reasonCodes, "german_language_gap");
  }
  if (wantsEnglish(answers.studyLanguage) && isBelowB2(answers.englishLevel)) {
    pushUnique(reasonCodes, "english_language_gap");
  }

  if (reasonCodes.length > 0) {
    if (verificationRequirements.length > 0) {
      pushUnique(reasonCodes, "verification_required");
    }

    return {
      engineVersion: PROSPECT_QUALIFICATION_ENGINE_VERSION,
      state: "needs_verification",
      reasonCodes,
      missingFields: [],
      verificationRequirements,
      nextAction: "resolve_project_verification",
    };
  }

  return {
    engineVersion: PROSPECT_QUALIFICATION_ENGINE_VERSION,
    state: "ready_for_review",
    reasonCodes: [
      ...(verificationRequirements.length > 0
        ? (["verification_required"] as ProspectQualificationReasonCode[])
        : []),
      "ready_for_human_review",
    ],
    missingFields: [],
    verificationRequirements,
    nextAction: "request_human_review",
  };
}
