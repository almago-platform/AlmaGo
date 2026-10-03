import { normalizeApplicationStatus } from "@/lib/application-workflow";

export type AlmagoJourneyStatus = "completed" | "current" | "upcoming" | "blocked";

export type AlmagoJourneyKey =
  | "project"
  | "profile"
  | "documents"
  | "programmes"
  | "applications"
  | "admission"
  | "visa"
  | "departure";

export type AlmagoJourneyStepModel = {
  key: AlmagoJourneyKey;
  status: AlmagoJourneyStatus;
  href: string;
  taskCount?: number;
  blocker?: "documents" | "applications" | "admission";
};

export type AlmagoJourneyFacts = {
  projectDefined: boolean;
  profileCompleted: boolean;
  documentsNeedingAction: number;
  documentChecklistOpen: number;
  savedProgrammes: number;
  applicationStatuses: string[];
  applicationsMissingDocuments: number;
  applicationNextActions: number;
  germanyPreparationStatus?: string | null;
};

export type AlmagoJourneyModel = {
  steps: AlmagoJourneyStepModel[];
  completedCount: number;
  remainingTasks: number;
  currentKey: AlmagoJourneyKey;
};

export function buildAlmagoJourney(facts: AlmagoJourneyFacts): AlmagoJourneyModel {
  const normalizedStatuses = facts.applicationStatuses
    .map((status) => normalizeApplicationStatus(status))
    .filter((status): status is NonNullable<ReturnType<typeof normalizeApplicationStatus>> => Boolean(status));

  const hasAdmission = normalizedStatuses.includes("admission");
  const hasSubmittedApplication = normalizedStatuses.some((status) =>
    ["submitted", "waiting_university", "admission"].includes(status),
  );
  const hasAnyApplication = normalizedStatuses.length > 0;
  const hasActiveApplication = normalizedStatuses.some((status) =>
    ["interested", "preparing", "documents_missing", "ready_to_submit", "submitted", "waiting_university"].includes(status),
  );
  const allApplicationsClosedWithoutAdmission =
    hasAnyApplication
    && !hasAdmission
    && normalizedStatuses.every((status) => ["rejection", "withdrawn"].includes(status));

  const documentsBlocked = facts.documentsNeedingAction > 0;
  const documentsComplete =
    !documentsBlocked
    && facts.projectDefined
    && facts.profileCompleted
    && facts.documentChecklistOpen === 0;

  const programmesComplete = facts.savedProgrammes > 0;
  const applicationsBlocked = facts.applicationsMissingDocuments > 0;
  const germanyPreparationCompleted = facts.germanyPreparationStatus === "completed";

  const projectStatus: AlmagoJourneyStatus = facts.projectDefined ? "completed" : "current";
  const profileStatus: AlmagoJourneyStatus = facts.profileCompleted
    ? "completed"
    : facts.projectDefined
      ? "current"
      : "upcoming";
  const documentsStatus: AlmagoJourneyStatus = documentsBlocked
    ? "blocked"
    : documentsComplete
      ? "completed"
      : facts.profileCompleted
        ? "current"
        : "upcoming";
  const programmesStatus: AlmagoJourneyStatus = programmesComplete
    ? "completed"
    : documentsComplete || facts.profileCompleted
      ? "current"
      : "upcoming";
  const applicationsStatus: AlmagoJourneyStatus = hasAdmission
    ? "completed"
    : applicationsBlocked
      ? "blocked"
      : hasActiveApplication
        ? "current"
        : programmesComplete
          ? "current"
          : "upcoming";
  const admissionStatus: AlmagoJourneyStatus = hasAdmission
    ? "completed"
    : hasSubmittedApplication
      ? "current"
      : allApplicationsClosedWithoutAdmission
        ? "blocked"
        : "upcoming";
  const visaStatus: AlmagoJourneyStatus = germanyPreparationCompleted
    ? "completed"
    : hasAdmission
      ? "current"
      : "blocked";
  const departureStatus: AlmagoJourneyStatus = germanyPreparationCompleted
    ? "current"
    : "upcoming";

  const steps: AlmagoJourneyStepModel[] = [
    { key: "project", status: projectStatus, href: "/student/project", taskCount: facts.projectDefined ? 0 : 1 },
    { key: "profile", status: profileStatus, href: "/student/profile", taskCount: facts.profileCompleted ? 0 : 1 },
    {
      key: "documents",
      status: documentsStatus,
      href: "/student/documents",
      taskCount: facts.documentsNeedingAction + facts.documentChecklistOpen,
      blocker: documentsBlocked ? "documents" : undefined,
    },
    { key: "programmes", status: programmesStatus, href: "/student/orientation", taskCount: programmesComplete ? 0 : 1 },
    {
      key: "applications",
      status: applicationsStatus,
      href: "/student/applications",
      taskCount: Math.max(facts.applicationNextActions, facts.applicationsMissingDocuments, hasAnyApplication ? 0 : 1),
      blocker: applicationsBlocked ? "applications" : undefined,
    },
    {
      key: "admission",
      status: admissionStatus,
      href: "/student/applications",
      taskCount: hasAdmission ? 0 : 1,
      blocker: allApplicationsClosedWithoutAdmission ? "admission" : undefined,
    },
    {
      key: "visa",
      status: visaStatus,
      href: "/student/pathway",
      taskCount: germanyPreparationCompleted ? 0 : 1,
      blocker: !hasAdmission ? "admission" : undefined,
    },
    { key: "departure", status: departureStatus, href: "/student/pathway", taskCount: departureStatus === "current" ? 1 : 0 },
  ];

  const current =
    steps.find((step) => step.status === "current")
    || steps.find((step) => step.status === "blocked")
    || steps[steps.length - 1];

  return {
    steps,
    completedCount: steps.filter((step) => step.status === "completed").length,
    remainingTasks: steps.reduce((total, step) => total + (step.taskCount || 0), 0),
    currentKey: current.key,
  };
}
