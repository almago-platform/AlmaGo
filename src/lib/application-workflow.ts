export const applicationStatuses = [
  "interested",
  "preparing",
  "documents_missing",
  "ready_to_submit",
  "submitted",
  "waiting_university",
  "admission",
  "rejection",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const historicalApplicationStatuses = [
  "draft",
  "planned",
  "in_review",
  "accepted",
  "rejected",
] as const;

export type HistoricalApplicationStatus = (typeof historicalApplicationStatuses)[number];
export type KnownApplicationStatus = ApplicationStatus | HistoricalApplicationStatus;

export const applicationStatusLabels: Record<KnownApplicationStatus, string> = {
  interested: "Intéressé",
  preparing: "Préparation",
  documents_missing: "Documents manquants",
  ready_to_submit: "Prêt à envoyer",
  submitted: "Envoyée",
  waiting_university: "Réponse attendue",
  admission: "Admission",
  rejection: "Refus",
  withdrawn: "Retirée",
  draft: "Brouillon",
  planned: "Planifiée",
  in_review: "En revue",
  accepted: "Acceptée",
  rejected: "Refusée",
};

export const terminalApplicationStatuses = new Set<KnownApplicationStatus>([
  "admission",
  "rejection",
  "withdrawn",
  "accepted",
  "rejected",
]);

export const activeApplicationStatuses = new Set<KnownApplicationStatus>([
  "interested",
  "preparing",
  "documents_missing",
  "ready_to_submit",
  "submitted",
  "waiting_university",
  "draft",
  "planned",
  "in_review",
]);

const historicalToCanonical: Record<HistoricalApplicationStatus, ApplicationStatus> = {
  draft: "interested",
  planned: "preparing",
  in_review: "waiting_university",
  accepted: "admission",
  rejected: "rejection",
};

const transitions: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  interested: ["preparing", "documents_missing", "withdrawn"],
  preparing: ["documents_missing", "ready_to_submit", "withdrawn"],
  documents_missing: ["preparing", "ready_to_submit", "withdrawn"],
  ready_to_submit: ["preparing", "documents_missing", "submitted", "withdrawn"],
  submitted: ["waiting_university", "withdrawn"],
  waiting_university: ["admission", "rejection", "withdrawn"],
  admission: [],
  rejection: [],
  withdrawn: [],
};

export type ApplicationTransitionRequirement =
  | "documents_complete"
  | "submission_confirmed"
  | "university_decision_confirmed";

export function isCanonicalApplicationStatus(value: string): value is ApplicationStatus {
  return applicationStatuses.includes(value as ApplicationStatus);
}

export function isHistoricalApplicationStatus(value: string): value is HistoricalApplicationStatus {
  return historicalApplicationStatuses.includes(value as HistoricalApplicationStatus);
}

export function normalizeApplicationStatus(value: string): ApplicationStatus | null {
  if (isCanonicalApplicationStatus(value)) return value;
  if (isHistoricalApplicationStatus(value)) return historicalToCanonical[value];
  return null;
}

export function isActiveApplication(status: string) {
  return activeApplicationStatuses.has(status as KnownApplicationStatus);
}

export function canTransitionApplication(from: string, to: string) {
  const source = normalizeApplicationStatus(from);
  if (!source || !isCanonicalApplicationStatus(to) || source === to) return false;
  return transitions[source].includes(to);
}

export function allowedApplicationTransitions(from: string): readonly ApplicationStatus[] {
  const source = normalizeApplicationStatus(from);
  return source ? transitions[source] : [];
}

export function transitionRequirements(
  from: string,
  to: string,
): readonly ApplicationTransitionRequirement[] {
  if (!canTransitionApplication(from, to)) return [];
  if (to === "ready_to_submit") return ["documents_complete"];
  if (to === "submitted") return ["submission_confirmed"];
  if (to === "admission" || to === "rejection") return ["university_decision_confirmed"];
  return [];
}

export function transitionSetsSubmittedAt(from: string, to: string) {
  return canTransitionApplication(from, to) && to === "submitted";
}

export function isUniversityDecisionStatus(status: string) {
  return status === "admission" || status === "rejection" || status === "accepted" || status === "rejected";
}
