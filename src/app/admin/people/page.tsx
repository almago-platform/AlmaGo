import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminWorkspaceSummary } from "@/components/admin/AdminWorkspaceSummary";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import {
  adminDossierLifecycle,
  adminDossierNextAction,
  adminDossierStageIndex,
} from "@/lib/admin/student-dossier";
import {
  adminActionOwnerLabel,
  adminPersonSegmentLabels,
  classifyAdminPerson,
  isOpenAdminAction,
  type AdminPersonSegment,
} from "@/lib/admin/people";
import {
  adminActionDateIsTrusted,
  applicationDateIsTrusted,
  applicationOfficialDeadlineUrgency,
  applicationOfficialDeadlineUrgencyLabel,
  applicationRouteRisk,
  campusTodayDateKey,
  type ApplicationOfficialDeadlineUrgency,
} from "@/lib/admin/application-risk";
import { isActiveApplication } from "@/lib/application-workflow";
import { customerLifecycleStatusLabel } from "@/lib/phase2/access";
import { createClient } from "@/lib/supabase/server";

type ProspectRow = {
  id: string;
  email: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

type AccessRow = {
  user_id: string;
  status: string;
  status_changed_at: string | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
};

type IntakeRow = {
  student_id: string;
  status: string;
  updated_at: string;
};

type DocumentRow = {
  student_id: string;
  status: string;
};

type ApplicationRow = {
  id: string;
  student_id: string;
  status: string;
  deadline: string | null;
  deadline_kind: string | null;
  deadline_source_url: string | null;
  deadline_verified_at: string | null;
  deadline_cycle: string | null;
  application_method: string | null;
  next_action: string | null;
  created_at: string;
};

type ActionRow = {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  status: string;
  owner: string | null;
  due_date: string | null;
  template_id: string | null;
  requires_student_action: boolean;
  student_action_reason: string | null;
  deadline_kind: string | null;
  official_source_url: string | null;
  official_source_verified_at: string | null;
  deadline_cycle: string | null;
  created_at: string;
};

type OrientationRow = {
  id: string;
  prospect_id: string;
  created_at: string;
};

type AssignmentRow = {
  student_id: string;
  assigned_admin_id: string | null;
  assigned_at: string;
  updated_at: string;
};

type CaseNoteRow = {
  student_id: string;
  kind: string;
  occurred_at: string;
};

type PersonView = "all" | AdminPersonSegment;
type WorkView =
  | "all"
  | "blocked"
  | "waiting_campus"
  | "waiting_student"
  | "waiting_external"
  | "deadline_verify"
  | "application_risk"
  | "official_overdue"
  | "official_3"
  | "official_7"
  | "official_14"
  | "official_30"
  | "overdue"
  | "today"
  | "week"
  | "messages"
  | "no_action"
  | "stale"
  | "unassigned"
  | "mine";

type PersonRecord = {
  key: string;
  userId: string | null;
  prospectId: string | null;
  name: string;
  email: string;
  segment: AdminPersonSegment;
  accessStatus: string | null;
  stage: string;
  orientationCount: number;
  pendingDocuments: number;
  activeApplications: number;
  openActions: number;
  blockedActions: number;
  waitingOnCampus: number;
  waitingOnStudent: number;
  waitingOnExternal: number;
  nextAction: string;
  nextActionOwner: string;
  dueDate: string | null;
  dueKind: "official" | "internal" | null;
  hasUnverifiedDeadline: boolean;
  applicationRouteRisks: number;
  officialDeadlineUrgency: ApplicationOfficialDeadlineUrgency | null;
  assignedAdminId: string | null;
  assignedAdminName: string | null;
  lastContactAt: string | null;
  lastContactKind: string | null;
  unreadMessages: number;
  hasExplicitNextAction: boolean;
  needsAttention: boolean;
  updatedAt: string;
};

const validViews = new Set<PersonView>(["all", "prospect", "candidate", "student", "archived"]);
const validWorkViews = new Set<WorkView>([
  "all",
  "blocked",
  "waiting_campus",
  "waiting_student",
  "waiting_external",
  "deadline_verify",
  "application_risk",
  "official_overdue",
  "official_3",
  "official_7",
  "official_14",
  "official_30",
  "overdue",
  "today",
  "week",
  "messages",
  "no_action",
  "stale",
  "unassigned",
  "mine",
]);

const viewLabels: Record<PersonView, string> = {
  all: "Tous",
  prospect: "Prospects",
  candidate: "Candidats",
  student: "Étudiants",
  archived: "Terminés",
};

const workLabels: Record<WorkView, string> = {
  all: "Tous les dossiers",
  blocked: "Bloqués",
  waiting_campus: "Attend Campus",
  waiting_student: "Attend étudiant",
  waiting_external: "Attend externe",
  deadline_verify: "Dates à vérifier",
  application_risk: "VPD / uni-assist à risque",
  official_overdue: "Deadline officielle dépassée",
  official_3: "Deadline officielle ≤ 3 j",
  official_7: "Deadline officielle ≤ 7 j",
  official_14: "Deadline officielle ≤ 14 j",
  official_30: "Deadline officielle ≤ 30 j",
  overdue: "En retard",
  today: "Aujourd’hui",
  week: "7 prochains jours",
  messages: "Réponses non lues",
  no_action: "Sans prochaine action",
  stale: "Sans contact 14 j",
  unassigned: "Non attribués",
  mine: "Mes dossiers",
};

const segmentBadgeVariant: Record<AdminPersonSegment, "neutral" | "info" | "success" | "warning"> = {
  prospect: "neutral",
  candidate: "info",
  student: "success",
  archived: "neutral",
};

const attentionDocumentStatuses = new Set(["pending", "reviewed"]);

function displayName(profile: ProfileRow | undefined, email: string) {
  const split = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  if (split) return split;
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  const prefix = email.split("@")[0]?.trim();
  return prefix || "Personne AlmaGo";
}

function compareDue(left: ActionRow, right: ActionRow) {
  if (left.due_date && right.due_date) return left.due_date.localeCompare(right.due_date);
  if (left.due_date) return -1;
  if (right.due_date) return 1;
  const ownerPriority = (owner: string | null) =>
    owner === "almago" ? 0 : owner === "joint" ? 1 : owner === "student" ? 2 : 3;
  return ownerPriority(left.owner) - ownerPriority(right.owner)
    || left.created_at.localeCompare(right.created_at);
}

function compareApplications(left: ApplicationRow, right: ApplicationRow) {
  if (left.deadline && right.deadline) return left.deadline.localeCompare(right.deadline);
  if (left.deadline) return -1;
  if (right.deadline) return 1;
  return left.created_at.localeCompare(right.created_at);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const timestamp = Date.parse(value + (value.length === 10 ? "T12:00:00Z" : ""));
  if (!Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(timestamp));
}

function dateKey(value: string | null) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : null;
}

function shiftDateKey(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function applicationDeadlineIsVerified(application: ApplicationRow) {
  return applicationDateIsTrusted(application);
}

function actionDeadlineIsVerified(action: ActionRow) {
  return adminActionDateIsTrusted(action);
}

function contactKindLabel(kind: string | null) {
  if (kind === "call") return "Appel";
  if (kind === "email") return "E-mail";
  if (kind === "whatsapp") return "WhatsApp";
  if (kind === "meeting") return "Rendez-vous";
  if (kind === "document_request") return "Demande document";
  if (kind === "university_contact") return "Contact université";
  return "Contact";
}

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; work?: string; advisor?: string; q?: string }>;
}) {
  const params = await searchParams;
  const requestedView = params.view as PersonView | undefined;
  const requestedWork = params.work as WorkView | undefined;
  const view: PersonView = requestedView && validViews.has(requestedView) ? requestedView : "all";
  const work: WorkView = requestedWork && validWorkViews.has(requestedWork) ? requestedWork : "all";
  const advisorFilter = (params.advisor || "").trim();
  const search = (params.q || "").trim().toLocaleLowerCase("fr");

  const supabase = await createClient();
  const { data: { user: currentAdmin } } = await supabase.auth.getUser();

  const [prospectsResult, accessResult, adminRolesResult] = await Promise.all([
    supabase
      .from("prospects")
      .select("id,email,user_id,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(500),
    supabase
      .from("customer_access")
      .select("user_id,status,status_changed_at")
      .order("status_changed_at", { ascending: false })
      .limit(500),
    supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin"),
  ]);

  const prospects = (prospectsResult.data || []) as ProspectRow[];
  const accessRows = (accessResult.data || []) as AccessRow[];
  const adminIds = (adminRolesResult.data || []).map((item) => item.user_id);

  const userIds = [...new Set([
    ...prospects.flatMap((item) => item.user_id ? [item.user_id] : []),
    ...accessRows.map((item) => item.user_id),
  ])];
  const prospectIds = prospects.map((item) => item.id);
  const profileIds = [...new Set([...userIds, ...adminIds])];

  const [profilesResult, intakeResult, documentsResult, applicationsResult, actionsResult, orientationsResult, assignmentsResult, caseNotesResult, messagesResult] =
    await Promise.all([
      profileIds.length
        ? supabase.from("profiles").select("id,first_name,last_name,full_name").in("id", profileIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("student_intake_cases").select("student_id,status,updated_at").in("student_id", userIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("documents").select("student_id,status").in("student_id", userIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("applications").select("id,student_id,status,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,application_method,next_action,created_at").in("student_id", userIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("student_checklist_items").select("id,student_id,title,description,status,owner,due_date,template_id,requires_student_action,student_action_reason,deadline_kind,official_source_url,official_source_verified_at,deadline_cycle,created_at").in("student_id", userIds)
        : Promise.resolve({ data: [], error: null }),
      prospectIds.length
        ? supabase.from("orientations").select("id,prospect_id,created_at").in("prospect_id", prospectIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("student_case_assignments").select("student_id,assigned_admin_id,assigned_at,updated_at").in("student_id", userIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("student_case_notes").select("student_id,kind,occurred_at").in("student_id", userIds).neq("kind", "internal_note").order("occurred_at", { ascending: false }).limit(3000)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("student_dossier_messages").select("student_id").in("student_id", userIds).eq("sender_role", "student").is("admin_read_at", null).limit(3000)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const fatalError =
    prospectsResult.error
    || accessResult.error
    || adminRolesResult.error
    || profilesResult.error
    || intakeResult.error
    || documentsResult.error
    || applicationsResult.error
    || actionsResult.error
    || orientationsResult.error
    || assignmentsResult.error
    || caseNotesResult.error
    || messagesResult.error;

  if (fatalError) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader
          section="Personnes"
          title="Prospects, candidats et étudiants"
          description="Le centre des personnes est temporairement indisponible. Aucune donnée n’a été modifiée."
        />
      </main>
    );
  }

  const profiles = (profilesResult.data || []) as ProfileRow[];
  const intakes = (intakeResult.data || []) as IntakeRow[];
  const documents = (documentsResult.data || []) as DocumentRow[];
  const applications = (applicationsResult.data || []) as ApplicationRow[];
  const actions = (actionsResult.data || []) as ActionRow[];
  const orientations = (orientationsResult.data || []) as OrientationRow[];
  const assignments = (assignmentsResult.data || []) as AssignmentRow[];
  const caseNotes = (caseNotesResult.data || []) as CaseNoteRow[];
  const unreadMessagesByUser = new Map<string, number>();
  for (const item of messagesResult.data || []) {
    unreadMessagesByUser.set(item.student_id, (unreadMessagesByUser.get(item.student_id) || 0) + 1);
  }

  const profileByUser = new Map(profiles.map((item) => [item.id, item]));
  const accessByUser = new Map(accessRows.map((item) => [item.user_id, item]));
  const intakeByUser = new Map(intakes.map((item) => [item.student_id, item]));
  const assignmentByUser = new Map(assignments.map((item) => [item.student_id, item]));
  const prospectByUser = new Map(
    prospects.flatMap((item) => item.user_id ? [[item.user_id, item] as const] : []),
  );

  const advisorOptions = adminIds
    .map((id, index) => {
      const profile = profileByUser.get(id);
      const split = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
      return {
        id,
        name: split || profile?.full_name?.trim() || `Conseiller Campus ${index + 1}`,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, "fr"));
  const advisorNameById = new Map(advisorOptions.map((item) => [item.id, item.name]));
  const selectedAdvisor = advisorFilter && advisorNameById.has(advisorFilter) ? advisorFilter : "";

  const docsByUser = new Map<string, DocumentRow[]>();
  for (const item of documents) docsByUser.set(item.student_id, [...(docsByUser.get(item.student_id) || []), item]);

  const applicationsByUser = new Map<string, ApplicationRow[]>();
  for (const item of applications) applicationsByUser.set(item.student_id, [...(applicationsByUser.get(item.student_id) || []), item]);

  const actionsByUser = new Map<string, ActionRow[]>();
  for (const item of actions) actionsByUser.set(item.student_id, [...(actionsByUser.get(item.student_id) || []), item]);

  const orientationCountByProspect = new Map<string, number>();
  for (const item of orientations) {
    orientationCountByProspect.set(item.prospect_id, (orientationCountByProspect.get(item.prospect_id) || 0) + 1);
  }

  const latestContactByUser = new Map<string, CaseNoteRow>();
  for (const item of caseNotes) {
    if (!latestContactByUser.has(item.student_id)) latestContactByUser.set(item.student_id, item);
  }

  const today = campusTodayDateKey();
  const weekEnd = shiftDateKey(today, 7);
  const staleContactCutoff = shiftDateKey(today, -14);

  const records: PersonRecord[] = userIds.map((userId) => {
    const profile = profileByUser.get(userId);
    const prospect = prospectByUser.get(userId);
    const access = accessByUser.get(userId);
    const intake = intakeByUser.get(userId);
    const assignment = assignmentByUser.get(userId);
    const latestContact = latestContactByUser.get(userId);
    const unreadMessages = unreadMessagesByUser.get(userId) || 0;
    const personDocuments = docsByUser.get(userId) || [];
    const personApplications = applicationsByUser.get(userId) || [];
    const activeApplications = personApplications.filter((item) => isActiveApplication(item.status)).sort(compareApplications);
    const personActions = actionsByUser.get(userId) || [];
    const openActions = personActions.filter((item) => isOpenAdminAction(item.status)).sort(compareDue);
    const blockedActions = personActions.filter((item) => item.status === "blocked").length;
    const waitingOnCampus = openActions.filter((item) => item.status === "waiting_almago").length;
    const waitingOnStudent = openActions.filter((item) =>
      item.status === "waiting_student"
      && item.requires_student_action
      && Boolean(item.student_action_reason?.trim())
    ).length;
    const waitingOnExternal = openActions.filter((item) => item.status === "waiting_external").length;
    const humanOpenActions = openActions.filter((item) => item.template_id === null);
    const pendingDocuments = personDocuments.filter((item) => attentionDocumentStatuses.has(item.status)).length;
    const segment = classifyAdminPerson(access?.status, Boolean(intake));
    const email = prospect?.email || "Adresse non enregistrée";
    const currentStage = adminDossierStageIndex(intake?.status, activeApplications.length > 0);
    const recordedAction = humanOpenActions[0] || null;
    const applicationAction = activeApplications.find((item) => Boolean(item.next_action)) || null;
    const hasExplicitNextAction = Boolean(recordedAction || applicationAction);
    const fallback = adminDossierNextAction(intake?.status, activeApplications.length > 0);

    const nextAction = recordedAction?.title
      || applicationAction?.next_action
      || fallback.title;
    const nextActionOwner = recordedAction
      ? adminActionOwnerLabel(recordedAction.owner)
      : applicationAction
        ? "Campus Allemagne"
        : fallback.waiting
          ? "En attente"
          : "Campus Allemagne";

    const datedActions = humanOpenActions.flatMap((item) => {
      const date = dateKey(item.due_date);
      if (!date || !actionDeadlineIsVerified(item)) return [];
      const official = item.deadline_kind === "official_hard_deadline"
        || item.deadline_kind === "official_external_date";
      return [{ date, kind: official ? "official" as const : "internal" as const }];
    });
    const datedApplications = activeApplications.flatMap((item) => {
      const date = dateKey(item.deadline);
      if (!date || !applicationDeadlineIsVerified(item)) return [];
      const official = item.deadline_kind === "official_hard_deadline"
        || item.deadline_kind === "official_external_date";
      return [{ date, kind: official ? "official" as const : "internal" as const }];
    });
    const dateCandidates = [...datedActions, ...datedApplications]
      .sort((left, right) => left.date.localeCompare(right.date));
    const nearestDate = dateCandidates[0] || null;
    const hasUnverifiedDeadline =
      humanOpenActions.some((item) => Boolean(item.due_date) && !actionDeadlineIsVerified(item))
      || activeApplications.some((item) => Boolean(item.deadline) && !applicationDeadlineIsVerified(item));
    const applicationRouteRisks = activeApplications.filter((item) =>
      Boolean(applicationRouteRisk({
        status: item.status,
        application_method: item.application_method,
        deadline: item.deadline,
        deadline_kind: item.deadline_kind,
        deadlineTrusted: applicationDeadlineIsVerified(item),
      }, today))
    ).length;
    const officialDeadlineUrgency = activeApplications
      .flatMap((item) => {
        const urgency = applicationOfficialDeadlineUrgency({
          status: item.status,
          deadline: item.deadline,
          deadline_kind: item.deadline_kind,
          deadlineTrusted: applicationDeadlineIsVerified(item),
        }, today);
        return urgency ? [urgency] : [];
      })
      .sort((left, right) => left.daysRemaining - right.daysRemaining)[0] || null;

    const dueDate = nearestDate?.date || null;
    const dueKind = nearestDate?.kind || null;
    const campusActions = humanOpenActions.filter((item) => item.owner === "almago" || item.owner === "joint").length;
    const needsAttention = segment !== "archived" && (
      pendingDocuments > 0
      || campusActions > 0
      || Boolean(dueDate && dueDate < today)
      || hasUnverifiedDeadline
    );

    return {
      key: userId,
      userId,
      prospectId: prospect?.id || null,
      name: displayName(profile, email),
      email,
      segment,
      accessStatus: access?.status || null,
      stage: adminDossierLifecycle[currentStage] || "Orientation",
      orientationCount: prospect ? orientationCountByProspect.get(prospect.id) || 0 : 0,
      pendingDocuments,
      activeApplications: activeApplications.length,
      openActions: humanOpenActions.length,
      blockedActions,
      waitingOnCampus,
      waitingOnStudent,
      waitingOnExternal,
      nextAction,
      nextActionOwner,
      dueDate,
      dueKind,
      hasUnverifiedDeadline,
      applicationRouteRisks,
      officialDeadlineUrgency,
      assignedAdminId: assignment?.assigned_admin_id || null,
      assignedAdminName: assignment?.assigned_admin_id
        ? advisorNameById.get(assignment.assigned_admin_id) || "Conseiller Campus"
        : null,
      lastContactAt: latestContact?.occurred_at || null,
      lastContactKind: latestContact?.kind || null,
      unreadMessages,
      hasExplicitNextAction,
      needsAttention: needsAttention
        || blockedActions > 0
        || waitingOnCampus > 0
        || applicationRouteRisks > 0
        || Boolean(officialDeadlineUrgency)
        || unreadMessages > 0
        || (segment !== "archived" && !hasExplicitNextAction),
      updatedAt: intake?.updated_at || prospect?.updated_at || access?.status_changed_at || "",
    };
  });

  const linkedProspectIds = new Set(records.flatMap((item) => item.prospectId ? [item.prospectId] : []));
  for (const prospect of prospects) {
    if (prospect.user_id || linkedProspectIds.has(prospect.id)) continue;
    records.push({
      key: prospect.id,
      userId: null,
      prospectId: prospect.id,
      name: prospect.email.split("@")[0] || "Prospect",
      email: prospect.email,
      segment: "prospect",
      accessStatus: null,
      stage: "Compte à lier",
      orientationCount: orientationCountByProspect.get(prospect.id) || 0,
      pendingDocuments: 0,
      activeApplications: 0,
      openActions: 0,
      blockedActions: 0,
      waitingOnCampus: 0,
      waitingOnStudent: 0,
      waitingOnExternal: 0,
      nextAction: "Lier le prospect à un compte vérifié pour ouvrir son dossier 360°",
      nextActionOwner: "Prospect",
      dueDate: null,
      dueKind: null,
      hasUnverifiedDeadline: false,
      applicationRouteRisks: 0,
      officialDeadlineUrgency: null,
      assignedAdminId: null,
      assignedAdminName: null,
      lastContactAt: null,
      lastContactKind: null,
      unreadMessages: 0,
      hasExplicitNextAction: false,
      needsAttention: false,
      updatedAt: prospect.updated_at,
    });
  }

  records.sort((left, right) => {
    const leftRank = left.dueDate && left.dueDate < today ? 0
      : left.dueDate === today ? 1
        : left.needsAttention ? 2
          : 3;
    const rightRank = right.dueDate && right.dueDate < today ? 0
      : right.dueDate === today ? 1
        : right.needsAttention ? 2
          : 3;
    if (leftRank !== rightRank) return leftRank - rightRank;
    if (left.dueDate && right.dueDate && left.dueDate !== right.dueDate) {
      return left.dueDate.localeCompare(right.dueDate);
    }
    if (left.dueDate && !right.dueDate) return -1;
    if (!left.dueDate && right.dueDate) return 1;
    return right.updatedAt.localeCompare(left.updatedAt);
  });

  const counts = {
    all: records.length,
    prospect: records.filter((item) => item.segment === "prospect").length,
    candidate: records.filter((item) => item.segment === "candidate").length,
    student: records.filter((item) => item.segment === "student").length,
    archived: records.filter((item) => item.segment === "archived").length,
  };

  const operationalRecords = records.filter((item) => item.userId && item.segment !== "archived");
  const workCounts: Record<WorkView, number> = {
    all: records.length,
    blocked: operationalRecords.filter((item) => item.blockedActions > 0).length,
    waiting_campus: operationalRecords.filter((item) => item.waitingOnCampus > 0).length,
    waiting_student: operationalRecords.filter((item) => item.waitingOnStudent > 0).length,
    waiting_external: operationalRecords.filter((item) => item.waitingOnExternal > 0).length,
    deadline_verify: operationalRecords.filter((item) => item.hasUnverifiedDeadline).length,
    application_risk: operationalRecords.filter((item) => item.applicationRouteRisks > 0).length,
    official_overdue: operationalRecords.filter((item) => item.officialDeadlineUrgency?.kind === "overdue").length,
    official_3: operationalRecords.filter((item) =>
      Boolean(item.officialDeadlineUrgency && item.officialDeadlineUrgency.daysRemaining >= 0 && item.officialDeadlineUrgency.daysRemaining <= 3)
    ).length,
    official_7: operationalRecords.filter((item) =>
      Boolean(item.officialDeadlineUrgency && item.officialDeadlineUrgency.daysRemaining >= 0 && item.officialDeadlineUrgency.daysRemaining <= 7)
    ).length,
    official_14: operationalRecords.filter((item) =>
      Boolean(item.officialDeadlineUrgency && item.officialDeadlineUrgency.daysRemaining >= 0 && item.officialDeadlineUrgency.daysRemaining <= 14)
    ).length,
    official_30: operationalRecords.filter((item) =>
      Boolean(item.officialDeadlineUrgency && item.officialDeadlineUrgency.daysRemaining >= 0 && item.officialDeadlineUrgency.daysRemaining <= 30)
    ).length,
    overdue: operationalRecords.filter((item) => Boolean(item.dueDate && item.dueDate < today)).length,
    today: operationalRecords.filter((item) => item.dueDate === today).length,
    week: operationalRecords.filter((item) => Boolean(item.dueDate && item.dueDate >= today && item.dueDate <= weekEnd)).length,
    messages: operationalRecords.filter((item) => item.unreadMessages > 0).length,
    no_action: operationalRecords.filter((item) => !item.hasExplicitNextAction).length,
    stale: operationalRecords.filter((item) => {
      const contactDate = dateKey(item.lastContactAt);
      return !contactDate || contactDate < staleContactCutoff;
    }).length,
    unassigned: operationalRecords.filter((item) => !item.assignedAdminId).length,
    mine: currentAdmin
      ? operationalRecords.filter((item) => item.assignedAdminId === currentAdmin.id).length
      : 0,
  };

  const filtered = records.filter((item) => {
    if (view !== "all" && item.segment !== view) return false;
    if (selectedAdvisor && item.assignedAdminId !== selectedAdvisor) return false;

    if (work === "blocked" && (!item.userId || item.segment === "archived" || item.blockedActions < 1)) return false;
    if (work === "waiting_campus" && (!item.userId || item.segment === "archived" || item.waitingOnCampus < 1)) return false;
    if (work === "waiting_student" && (!item.userId || item.segment === "archived" || item.waitingOnStudent < 1)) return false;
    if (work === "waiting_external" && (!item.userId || item.segment === "archived" || item.waitingOnExternal < 1)) return false;
    if (work === "deadline_verify" && (!item.userId || item.segment === "archived" || !item.hasUnverifiedDeadline)) return false;
    if (work === "application_risk" && (!item.userId || item.segment === "archived" || item.applicationRouteRisks < 1)) return false;
    if (work === "official_overdue" && (!item.userId || item.segment === "archived" || item.officialDeadlineUrgency?.kind !== "overdue")) return false;
    if (work === "official_3" && (!item.userId || item.segment === "archived" || !item.officialDeadlineUrgency || item.officialDeadlineUrgency.daysRemaining < 0 || item.officialDeadlineUrgency.daysRemaining > 3)) return false;
    if (work === "official_7" && (!item.userId || item.segment === "archived" || !item.officialDeadlineUrgency || item.officialDeadlineUrgency.daysRemaining < 0 || item.officialDeadlineUrgency.daysRemaining > 7)) return false;
    if (work === "official_14" && (!item.userId || item.segment === "archived" || !item.officialDeadlineUrgency || item.officialDeadlineUrgency.daysRemaining < 0 || item.officialDeadlineUrgency.daysRemaining > 14)) return false;
    if (work === "official_30" && (!item.userId || item.segment === "archived" || !item.officialDeadlineUrgency || item.officialDeadlineUrgency.daysRemaining < 0 || item.officialDeadlineUrgency.daysRemaining > 30)) return false;
    if (work === "overdue" && !(item.dueDate && item.dueDate < today)) return false;
    if (work === "today" && item.dueDate !== today) return false;
    if (work === "week" && !(item.dueDate && item.dueDate >= today && item.dueDate <= weekEnd)) return false;
    if (work === "messages" && (!item.userId || item.segment === "archived" || item.unreadMessages < 1)) return false;
    if (work === "no_action" && (!item.userId || item.segment === "archived" || item.hasExplicitNextAction)) return false;
    if (work === "stale") {
      const contactDate = dateKey(item.lastContactAt);
      if (!item.userId || item.segment === "archived" || (contactDate && contactDate >= staleContactCutoff)) return false;
    }
    if (work === "unassigned" && (!item.userId || item.segment === "archived" || item.assignedAdminId)) return false;
    if (work === "mine" && (!currentAdmin || item.assignedAdminId !== currentAdmin.id)) return false;

    if (!search) return true;
    return [
      item.name,
      item.email,
      item.stage,
      item.nextAction,
      item.assignedAdminName || "",
      item.accessStatus ? customerLifecycleStatusLabel(item.accessStatus) : "",
    ].some((value) => value.toLocaleLowerCase("fr").includes(search));
  });

  const filteredOperational = filtered.filter((item) => item.userId && item.segment !== "archived");
  const attentionCount = filteredOperational.filter((item) => item.needsAttention).length;
  const campusActionCount = filteredOperational.filter((item) => item.nextActionOwner === "Campus Allemagne").length;

  const peopleHref = (overrides: Partial<{ view: PersonView; work: WorkView; advisor: string; q: string }>) => {
    const query = new URLSearchParams();
    const nextView = overrides.view ?? view;
    const nextWork = overrides.work ?? work;
    const nextAdvisor = overrides.advisor ?? selectedAdvisor;
    const nextQuery = overrides.q ?? (params.q || "");

    if (nextView !== "all") query.set("view", nextView);
    if (nextWork !== "all") query.set("work", nextWork);
    if (nextAdvisor) query.set("advisor", nextAdvisor);
    if (nextQuery.trim()) query.set("q", nextQuery.trim());

    const serialized = query.toString();
    return serialized ? `/admin/people?${serialized}` : "/admin/people";
  };

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Personnes"
        title="Prospects, candidats et étudiants"
        description="Une seule liste pour retrouver une personne, comprendre son étape actuelle et ouvrir son dossier 360°."
      />

      <AdminWorkspaceSummary
        eyebrow="Cockpit quotidien"
        title="Portefeuille équipe"
        description="Attribuez chaque dossier à un conseiller et traitez d’abord les dates vérifiées ou les cibles internes qui approchent."
        metrics={[
          { label: "En retard", value: workCounts.overdue, tone: workCounts.overdue ? "warning" : "neutral" },
          { label: "Aujourd’hui", value: workCounts.today, tone: workCounts.today ? "brand" : "neutral" },
          { label: "7 jours", value: workCounts.week, tone: workCounts.week ? "brand" : "neutral" },
          { label: "Non attribués", value: workCounts.unassigned, tone: workCounts.unassigned ? "warning" : "success" },
        ]}
        action={
          <Link
            href={peopleHref({ work: "mine", advisor: "" })}
            className={buttonClassName("secondary", "min-h-9 px-3 py-1.5 text-xs")}
          >
            Mes dossiers · {workCounts.mine}
          </Link>
        }
      />

      <section className="mb-5 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white">
        <div className="grid gap-5 border-b border-[var(--border)] p-4 sm:p-5 xl:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Segments</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(viewLabels) as PersonView[]).map((item) => (
                <Link
                  key={item}
                  href={peopleHref({ view: item })}
                  className={
                    item === view
                      ? "rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand-strong)]"
                      : "rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[var(--brand-border)] hover:text-[var(--brand)]"
                  }
                >
                  {viewLabels[item]} · {counts[item]}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Travail</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(workLabels) as WorkView[]).map((item) => (
                <Link
                  key={item}
                  href={peopleHref({
                    work: item,
                    advisor: item === "mine" || item === "unassigned" ? "" : selectedAdvisor,
                  })}
                  className={
                    item === work
                      ? "rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand-strong)]"
                      : "rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[var(--brand-border)] hover:text-[var(--brand)]"
                  }
                >
                  {workLabels[item]} · {workCounts[item]}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <form method="get" className="grid gap-3 border-b border-[var(--border)] p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_16rem_auto]">
          <input type="hidden" name="view" value={view} />
          <input type="hidden" name="work" value={work} />

          <label className="text-sm font-semibold text-slate-700">
            Recherche
            <input
              name="q"
              type="search"
              defaultValue={params.q || ""}
              placeholder="Nom, e-mail, étape, conseiller ou prochaine action"
              className="field mt-2 bg-white"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Conseiller
            <select name="advisor" defaultValue={selectedAdvisor} className="field mt-2 bg-white">
              <option value="">Tous les conseillers</option>
              {advisorOptions.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>{advisor.name}</option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button className={buttonClassName("secondary", "shrink-0 px-4")} type="submit">
              Appliquer
            </button>
            <Link href="/admin/people" className={buttonClassName("ghost", "shrink-0 px-3")}>
              Réinitialiser
            </Link>
          </div>
        </form>

        <div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-xs text-slate-600 sm:px-5">
          {filtered.length} personne{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
          {" · "}
          {attentionCount} dossier{attentionCount > 1 ? "s" : ""} à surveiller
          {" · "}
          {campusActionCount} prochaine{campusActionCount > 1 ? "s" : ""} action{campusActionCount > 1 ? "s" : ""} Campus
        </div>

        {filtered.length ? (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((person) => {
              const overdue = Boolean(person.dueDate && person.dueDate < today);
              const dueToday = person.dueDate === today;
              const lastContactDate = dateKey(person.lastContactAt);
              const staleContact = Boolean(
                person.userId
                && person.segment !== "archived"
                && (!lastContactDate || lastContactDate < staleContactCutoff),
              );
              return (
                <article
                  key={person.key}
                  className="grid gap-4 px-4 py-5 transition-colors hover:bg-[var(--surface-subtle)] sm:px-5 2xl:grid-cols-[minmax(13rem,1.15fr)_10rem_9rem_9rem_minmax(14rem,1fr)_9rem_auto] 2xl:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={segmentBadgeVariant[person.segment]}>
                        {adminPersonSegmentLabels[person.segment]}
                      </Badge>
                      {person.blockedActions > 0 ? <Badge variant="error">Bloqué · {person.blockedActions}</Badge> : null}
                      {person.waitingOnCampus > 0 ? <Badge variant="warning">Attend Campus · {person.waitingOnCampus}</Badge> : null}
                      {person.waitingOnStudent > 0 ? <Badge variant="info">Attend étudiant · {person.waitingOnStudent}</Badge> : null}
                      {person.waitingOnExternal > 0 ? <Badge variant="neutral">Attend externe · {person.waitingOnExternal}</Badge> : null}
                      {person.hasUnverifiedDeadline ? <Badge variant="warning">Source/date non vérifiée</Badge> : null}
                      {person.applicationRouteRisks > 0 ? <Badge variant="warning">VPD / uni-assist à risque · {person.applicationRouteRisks}</Badge> : null}
                      {person.officialDeadlineUrgency ? (
                        <Badge variant={
                          person.officialDeadlineUrgency.kind === "overdue" || person.officialDeadlineUrgency.kind === "d3"
                            ? "error"
                            : person.officialDeadlineUrgency.kind === "d7" || person.officialDeadlineUrgency.kind === "d14"
                              ? "warning"
                              : "info"
                        }>
                          {applicationOfficialDeadlineUrgencyLabel(person.officialDeadlineUrgency)}
                        </Badge>
                      ) : null}
                      {overdue ? <Badge variant="error">En retard</Badge> : null}
                      {!overdue && dueToday ? <Badge variant="warning">Aujourd’hui</Badge> : null}
                      {!overdue && !dueToday && person.needsAttention ? <Badge variant="warning">Attention</Badge> : null}
                      {person.unreadMessages ? <Badge variant="info">{person.unreadMessages} réponse{person.unreadMessages > 1 ? "s" : ""}</Badge> : null}
                      {!person.hasExplicitNextAction && person.userId && person.segment !== "archived" ? <Badge variant="neutral">Sans action</Badge> : null}
                    </div>
                    <h2 className="mt-2 truncate text-base font-bold text-slate-950">{person.name}</h2>
                    <p className="mt-1 truncate text-xs text-slate-600"><bdi dir="auto">{person.email}</bdi></p>
                  </div>

                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Conseiller</p>
                    <p className={`mt-1 text-sm font-semibold ${person.assignedAdminName ? "text-slate-900" : "text-amber-800"}`}>
                      {person.assignedAdminName || "Non attribué"}
                    </p>
                    <p className={`mt-1 text-[11px] font-semibold ${staleContact ? "text-amber-800" : "text-slate-500"}`}>
                      {person.lastContactAt
                        ? `${contactKindLabel(person.lastContactKind)} · ${formatDate(person.lastContactAt)}`
                        : "Aucun contact journalisé"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Étape</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{person.stage}</p>
                    <p className="mt-1 text-xs text-slate-500">{person.orientationCount} orientation{person.orientationCount > 1 ? "s" : ""}</p>
                  </div>

                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">À traiter</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {person.pendingDocuments} doc. · {person.activeApplications} cand.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{person.openActions} action{person.openActions > 1 ? "s" : ""}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Prochaine action</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{person.nextAction}</p>
                    <p className="mt-1 text-xs text-slate-500">Responsable · {person.nextActionOwner}</p>
                  </div>

                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Échéance / date clé</p>
                    {person.dueDate ? (
                      <>
                        <p className={`mt-1 text-sm font-semibold ${overdue ? "text-red-700" : "text-slate-900"}`}>
                          {formatDate(person.dueDate)}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500">
                          {person.dueKind === "official" ? "Officielle vérifiée" : "Cible interne"}
                        </p>
                      </>
                    ) : person.hasUnverifiedDeadline ? (
                      <>
                        <p className="mt-1 text-sm font-semibold text-amber-800">À vérifier</p>
                        <p className="mt-1 text-[11px] text-slate-500">Source/date non vérifiée</p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-slate-500">—</p>
                    )}
                  </div>

                  <div className="flex 2xl:justify-end">
                    {person.userId ? (
                      <Link
                        href={`/admin/dossiers/${person.userId}`}
                        className={buttonClassName("secondary", "w-full whitespace-nowrap px-4 2xl:w-auto")}
                      >
                        Dossier 360°
                      </Link>
                    ) : (
                      <Link
                        href="/admin/prospects"
                        className={buttonClassName("ghost", "w-full whitespace-nowrap px-3 2xl:w-auto")}
                      >
                        Ouvrir Prospects
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <h2 className="text-lg font-bold text-slate-950">Aucun dossier dans cette vue</h2>
            <p className="mt-2 text-sm text-slate-600">
              Modifiez les filtres, le conseiller ou la recherche. Aucune donnée n’a été supprimée.
            </p>
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-500">
        « Candidat » correspond ici à une personne qualifiée, engagée dans le parcours Campus ou en phase de paiement. « Étudiant » correspond à un accès client actif. Les personnes terminées restent consultables sans être mélangées aux files actives.
      </p>
    </main>
  );
}
