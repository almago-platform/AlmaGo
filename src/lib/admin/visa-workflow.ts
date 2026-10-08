export const visaStatuses = [
  "collecting",
  "ready_for_review",
  "submitted",
  "appointment",
  "awaiting_decision",
  "approved",
  "refused",
] as const;

export type VisaStatus = (typeof visaStatuses)[number];
export type VisaTrack = "studies" | "study_preparation" | "study_place_search";

export const visaStatusLabels: Record<VisaStatus, string> = {
  collecting: "Constitution du dossier",
  ready_for_review: "Dossier à contrôler",
  submitted: "Dépôt déclaré, preuve contrôlée",
  appointment: "Rendez-vous confirmé par une preuve",
  awaiting_decision: "Décision de la représentation attendue",
  approved: "Visa accordé, preuve contrôlée",
  refused: "Visa refusé, preuve contrôlée",
};

export const visaTransitions: Record<VisaStatus, readonly VisaStatus[]> = {
  collecting: ["ready_for_review"],
  ready_for_review: ["collecting", "submitted"],
  submitted: ["appointment", "awaiting_decision"],
  appointment: ["awaiting_decision"],
  awaiting_decision: ["approved", "refused"],
  approved: ["collecting"],
  refused: ["collecting"],
};

export function isVisaStatus(value: unknown): value is VisaStatus {
  return typeof value === "string" && (visaStatuses as readonly string[]).includes(value);
}

export function requiresVisaProof(status: VisaStatus): boolean {
  return ["submitted", "appointment", "awaiting_decision", "approved", "refused"].includes(status);
}

export function requiresNewVisaProof(status: VisaStatus): boolean {
  return ["submitted", "appointment", "approved", "refused"].includes(status);
}

export function canTransitionVisa(from: VisaStatus, to: VisaStatus) {
  return to === from || visaTransitions[from].includes(to);
}

export function normalizeVisaSourceUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 500) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !url.hostname.includes(".")) return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function validVisaSourceDate(value: unknown, now: Date = new Date()): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(value + "T12:00:00Z");
  const upper = now.getTime() + 24 * 60 * 60 * 1000;
  return Number.isFinite(timestamp)
    && timestamp <= upper
    && timestamp >= now.getTime() - 365 * 24 * 60 * 60 * 1000
    && new Date(timestamp).toISOString().slice(0, 10) === value;
}

export function cleanVisaText(value: unknown, length: number): string {
  return typeof value === "string" ? value.trim().slice(0, length) : "";
}
