export const universityTypes = ["Universität", "TU", "Hochschule", "FH"] as const;
export const degreeLevels = ["Bachelor", "Master", "Studienkolleg"] as const;
export const recommendationStatuses = ["recommended", "possible", "ambitious", "missing_requirements", "not_recommended"] as const;
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

export const legacyApplicationStatuses = [
  "draft",
  "planned",
  "in_review",
  "accepted",
  "rejected",
] as const;

export const databaseApplicationStatuses = [
  ...applicationStatuses,
  ...legacyApplicationStatuses,
] as const;

export type UniversityType = (typeof universityTypes)[number];
export type DegreeLevel = (typeof degreeLevels)[number];
export type RecommendationStatus = (typeof recommendationStatuses)[number];
export type ApplicationStatus = (typeof applicationStatuses)[number];

export const recommendationStatusLabels: Record<string, string> = {
  recommended: "Recommandé",
  possible: "Possible",
  ambitious: "Ambitieux",
  missing_requirements: "Prérequis à compléter",
  not_recommended: "Non recommandé",
};

export const applicationStatusLabels: Record<string, string> = {
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

export const terminalApplicationStatuses = new Set(["admission", "accepted", "rejection", "rejected", "withdrawn"]);
export const activeApplicationStatuses = new Set([
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

export function isActiveApplication(status: string) {
  return activeApplicationStatuses.has(status);
}

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
}

export function nextActiveDeadline<T extends { status: string; deadline: string | null }>(applications: T[]): T | undefined {
  return applications
    .filter((application) => Boolean(application.deadline)
      && isValidDateOnly(String(application.deadline))
      && isActiveApplication(application.status))
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)))[0];
}

export function isPastDeadline(deadline: string, now = new Date()) {
  if (!isValidDateOnly(deadline)) return false;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  return deadline < today;
}

export function formatDeadline(value: string | null | undefined) {
  if (!value || !isValidDateOnly(value)) return "Date à confirmer";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function daysUntilDeadline(deadline: string, now = new Date()) {
  if (!isValidDateOnly(deadline)) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  const today = `${part("year")}-${part("month")}-${part("day")}`;

  const [targetYear, targetMonth, targetDay] = deadline.split("-").map(Number);
  const [todayYear, todayMonth, todayDay] = today.split("-").map(Number);
  const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const todayUtc = Date.UTC(todayYear, todayMonth - 1, todayDay);

  return Math.round((targetUtc - todayUtc) / 86_400_000);
}

export function studentHistoryDisplayMessage(message: string | null | undefined) {
  if (!message) return "Mise à jour du dossier.";

  return message
    .replace("AlmaGo a approuvé ton document", "AlmaGo a validé votre document")
    .replace("AlmaGo a rejeté ton document", "AlmaGo a demandé une correction pour votre document")
    .replace("AlmaGo te demande de remplacer ton document", "AlmaGo vous demande de remplacer votre document");
}

export function applicationEventDisplayMessage(
  eventType: string,
  message: string | null | undefined,
) {
  if (eventType !== "application_status_changed") {
    return message || "Mise à jour du dossier.";
  }

  const rawStatus = message?.split(" : ").at(-1)?.trim() || "";
  const label = applicationStatusLabels[rawStatus];
  return label
    ? `Nouveau statut : ${label}`
    : "Le statut de cette candidature a été mis à jour.";
}

export function statusTone(status: string) {
  if (["admission", "accepted", "recommended", "possible"].includes(status)) return "bg-emerald-100 text-emerald-800";
  if (["ambitious", "preparing", "ready_to_submit", "submitted", "waiting_university", "in_review"].includes(status)) return "bg-blue-100 text-blue-800";
  if (["missing_requirements", "documents_missing", "interested", "draft", "planned"].includes(status)) return "bg-amber-100 text-amber-900";
  if (["rejection", "rejected", "not_recommended"].includes(status)) return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-700";
}
