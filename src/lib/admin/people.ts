export type AdminPersonSegment = "prospect" | "candidate" | "student" | "archived";

const candidateAccessStatuses = new Set([
  "qualified_prospect",
  "payment_pending",
  "paid_pending_validation",
]);

export function classifyAdminPerson(
  accessStatus: string | null | undefined,
  hasIntake: boolean,
): AdminPersonSegment {
  if (accessStatus === "client_completed") return "archived";
  if (accessStatus === "client_active") return "student";
  if (candidateAccessStatuses.has(accessStatus || "") || hasIntake) return "candidate";
  return "prospect";
}

export const adminPersonSegmentLabels: Record<AdminPersonSegment, string> = {
  prospect: "Prospect",
  candidate: "Candidat",
  student: "Étudiant",
  archived: "Terminé / archivé",
};

export function adminActionOwnerLabel(owner: string | null | undefined) {
  if (owner === "student") return "Étudiant";
  if (owner === "almago") return "Campus Allemagne";
  if (owner === "external") return "Externe";
  if (owner === "joint") return "Campus + étudiant";
  return "Non attribué";
}

export function adminActionStatusLabel(status: string | null | undefined) {
  if (status === "waiting_student") return "En attente étudiant";
  if (status === "waiting_almago") return "À traiter par Campus";
  if (status === "waiting_external") return "En attente externe";
  if (status === "in_progress") return "En cours";
  if (status === "ready") return "Prêt à traiter";
  if (status === "blocked") return "Bloqué";
  if (status === "completed") return "Terminé";
  if (status === "not_applicable") return "Non applicable";
  if (status === "not_started" || status === "todo") return "À faire";
  return status || "À confirmer";
}

export const openAdminActionStatuses = new Set([
  "todo",
  "not_started",
  "ready",
  "waiting_student",
  "waiting_almago",
  "waiting_external",
  "in_progress",
  "blocked",
]);

export function isOpenAdminAction(status: string | null | undefined) {
  return openAdminActionStatuses.has(status || "");
}

export function isSystemManagedAdminAction(item: {
  template_id?: string | null;
  procedure_step_template_id?: string | null;
}) {
  return Boolean(item.template_id || item.procedure_step_template_id);
}

export function isHumanAdminAction(item: {
  status: string | null | undefined;
  template_id?: string | null;
  procedure_step_template_id?: string | null;
}) {
  return isOpenAdminAction(item.status) && !isSystemManagedAdminAction(item);
}

export function adminActionWaiting(status: string | null | undefined) {
  return status === "waiting_student" || status === "waiting_external";
}

export function defaultAdminActionStatus(owner: string) {
  if (owner === "student") return "waiting_student";
  if (owner === "external") return "waiting_external";
  if (owner === "joint") return "in_progress";
  return "waiting_almago";
}
