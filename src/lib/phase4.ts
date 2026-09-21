export const universityTypes = ["Universität", "TU", "Hochschule", "FH"] as const;
export const degreeLevels = ["Bachelor", "Master", "Studienkolleg"] as const;
export const recommendationStatuses = ["recommended", "possible", "ambitious", "missing_requirements", "not_recommended"] as const;
export const applicationStatuses = ["interested", "preparing", "documents_missing", "ready_to_submit", "submitted", "waiting_university", "admission", "rejection", "withdrawn"] as const;

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

export function formatDeadline(value: string | null | undefined) {
  if (!value) return "Date à confirmer";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00`));
}

export function statusTone(status: string) {
  if (["admission", "recommended", "possible"].includes(status)) return "bg-emerald-100 text-emerald-800";
  if (["ambitious", "preparing", "waiting_university"].includes(status)) return "bg-blue-100 text-blue-800";
  if (["missing_requirements", "documents_missing", "interested"].includes(status)) return "bg-amber-100 text-amber-900";
  if (["rejection", "rejected", "not_recommended"].includes(status)) return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-700";
}
