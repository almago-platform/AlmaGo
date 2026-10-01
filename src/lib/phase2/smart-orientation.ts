import type { PublicOrientationAnswers } from "@/lib/orientation/public";

export const SMART_ORIENTATION_PRIORITY_ENGINE_VERSION =
  "smart-orientation-priority-v1";

export const SMART_ORIENTATION_HIGH_PRIORITY_AVERAGE_THRESHOLD = 12;

export const smartOrientationPriorityStates = [
  "priority_ready",
  "priority_prepare_now",
  "priority_standard",
  "priority_follow_up",
] as const;

export type SmartOrientationPriorityState =
  (typeof smartOrientationPriorityStates)[number];

export const smartOrientationPriorityReasonCodes = [
  "bac_obtained",
  "bac_preparing",
  "average_above_12",
  "average_12_or_below",
  "average_missing",
  "target_degree_defined",
  "target_field_defined",
  "project_information_missing",
  "sensitive_field_human_review",
  "language_preparation_needed",
  "ready_for_priority_review",
  "prepare_now_before_bac",
] as const;

export type SmartOrientationPriorityReasonCode =
  (typeof smartOrientationPriorityReasonCodes)[number];

export type SmartOrientationPriorityResult = {
  engineVersion: typeof SMART_ORIENTATION_PRIORITY_ENGINE_VERSION;
  state: SmartOrientationPriorityState;
  reasonCodes: SmartOrientationPriorityReasonCode[];
  requiresHumanReview: boolean;
};

const cefrOrder = ["none", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
const sensitiveFields = new Set(["Médecine/Santé"]);

function pushUnique<T>(items: T[], item: T) {
  if (!items.includes(item)) items.push(item);
}

function isDefined(value: string) {
  return value.trim().length > 0;
}

function averageValue(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 20
    ? parsed
    : null;
}

function languageRank(value: string) {
  const rank = cefrOrder.indexOf(value as (typeof cefrOrder)[number]);
  return rank >= 0 ? rank : null;
}

function isBelowB2(value: string) {
  const rank = languageRank(value);
  return rank !== null && rank < cefrOrder.indexOf("B2");
}

function wantsGerman(value: string) {
  return value === "Allemand" || value === "Allemand et anglais";
}

function wantsEnglish(value: string) {
  return value === "Anglais" || value === "Allemand et anglais";
}

function needsLanguagePreparation(answers: PublicOrientationAnswers) {
  return (
    (wantsGerman(answers.studyLanguage) && isBelowB2(answers.germanLevel))
    || (wantsEnglish(answers.studyLanguage) && isBelowB2(answers.englishLevel))
  );
}

export function evaluateSmartOrientationPriority(
  answers: PublicOrientationAnswers,
): SmartOrientationPriorityResult {
  const reasonCodes: SmartOrientationPriorityReasonCode[] = [];

  if (answers.bacStatus === "obtained") {
    pushUnique(reasonCodes, "bac_obtained");
  } else if (answers.bacStatus === "preparing") {
    pushUnique(reasonCodes, "bac_preparing");
  }

  const targetDegreeDefined = isDefined(answers.targetDegree);
  const targetFieldDefined = isDefined(answers.targetField);

  if (targetDegreeDefined) {
    pushUnique(reasonCodes, "target_degree_defined");
  }
  if (targetFieldDefined) {
    pushUnique(reasonCodes, "target_field_defined");
  }

  const average = averageValue(answers.generalAverage);
  if (average === null) {
    pushUnique(reasonCodes, "average_missing");
  } else if (average > SMART_ORIENTATION_HIGH_PRIORITY_AVERAGE_THRESHOLD) {
    pushUnique(reasonCodes, "average_above_12");
  } else {
    pushUnique(reasonCodes, "average_12_or_below");
  }

  const projectInformationComplete =
    (answers.bacStatus === "obtained" || answers.bacStatus === "preparing")
    && targetDegreeDefined
    && targetFieldDefined;

  if (!projectInformationComplete) {
    pushUnique(reasonCodes, "project_information_missing");
  }

  if (needsLanguagePreparation(answers)) {
    pushUnique(reasonCodes, "language_preparation_needed");
  }

  const requiresHumanReview = sensitiveFields.has(answers.targetField);
  if (requiresHumanReview) {
    pushUnique(reasonCodes, "sensitive_field_human_review");
  }

  let state: SmartOrientationPriorityState = "priority_standard";

  if (!projectInformationComplete) {
    state = "priority_follow_up";
  } else if (
    average !== null
    && average > SMART_ORIENTATION_HIGH_PRIORITY_AVERAGE_THRESHOLD
    && answers.bacStatus === "obtained"
  ) {
    state = "priority_ready";
    pushUnique(reasonCodes, "ready_for_priority_review");
  } else if (
    average !== null
    && average > SMART_ORIENTATION_HIGH_PRIORITY_AVERAGE_THRESHOLD
    && answers.bacStatus === "preparing"
  ) {
    state = "priority_prepare_now";
    pushUnique(reasonCodes, "prepare_now_before_bac");
  }

  return {
    engineVersion: SMART_ORIENTATION_PRIORITY_ENGINE_VERSION,
    state,
    reasonCodes,
    requiresHumanReview,
  };
}

export function isSmartOrientationPriorityState(
  value: string,
): value is SmartOrientationPriorityState {
  return smartOrientationPriorityStates.includes(
    value as SmartOrientationPriorityState,
  );
}
