export const phase2RetentionStates = [
  "none",
  "orientation_incomplete",
  "orientation_complete_no_account",
  "account_active_project_stale",
] as const;

export type Phase2RetentionState = (typeof phase2RetentionStates)[number];

export type Phase2RetentionInput = {
  orientationStarted: boolean;
  orientationCompleted: boolean;
  accountActivated: boolean;
  projectIsStale: boolean;
  clientActive: boolean;
};

/**
 * Derives a bounded lifecycle state for product UX.
 *
 * This is state classification only. It does not contact users, schedule
 * messages, or grant permission for outreach.
 */
export function getPhase2RetentionState(
  input: Phase2RetentionInput,
): Phase2RetentionState {
  if (input.clientActive) return "none";

  if (input.accountActivated && input.projectIsStale) {
    return "account_active_project_stale";
  }

  if (input.orientationCompleted && !input.accountActivated) {
    return "orientation_complete_no_account";
  }

  if (input.orientationStarted && !input.orientationCompleted) {
    return "orientation_incomplete";
  }

  return "none";
}
