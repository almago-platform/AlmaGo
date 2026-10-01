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

export function isSmartOrientationPriorityState(
  value: string,
): value is SmartOrientationPriorityState {
  return smartOrientationPriorityStates.includes(
    value as SmartOrientationPriorityState,
  );
}
