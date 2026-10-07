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

type PersonView = "all" | AdminPersonSegment;
type WorkView = "all" | "overdue" | "today" | "week" | "unassigned" | "mine";

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
  nextAction: string;
  nextActionOwner: string;
  dueDate: string | null;
  dueKind: "official" | "internal" | null;
  hasUnverifiedDeadline: boolean;
  assignedAdminId: string | null;
  assignedAdminName: string | null;
  needsAttention: boolean;
  updatedAt: string;
};

const validViews = new Set<PersonView>(["all", "prospect", "candidate", "student", "archived"]);
const validWorkViews = new Set<WorkView>(["all", "overdue", "today", "week", "unassigned", "mine"]);

const viewLabels: Record<PersonView, string> = {
  all: "Tous",
  prospect: "Prospects",
  candidate: "Candidats",
  student: "Étudiants",
  archived: "Terminés",
};

const workLabels: Record<WorkView, string> = {
  all: "Tous les dossiers",
  overdue: "En retard",
  today: "Aujourd’hui",
  week: "7 prochains jours",
  unassigned: "Non attribués",
  mine: "Mes dossiers",
};

const segmentBadgeVariant: Record<AdminPersonSegment, "neutral" | "info" | "success" | "warning"> = {
  prospect: "neutral",
  candidate: "info",
  student: "success",
  archived: "neutral",
};

const attentionDocumentStatuses = new Set(["pending", "reviewed", "replace_required", "rejected"]);

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
  if (!application.deadline) return false;
  if (application.deadline_kind === "internal_target" || application.deadline_kind === "source_review_date") {
    return true;
  }
  return Boolean(
    application.deadline_source_url
    && application.deadline_verified_at
    && application.deadline_cycle,
  );
}

function actionDeadlineIsVerified(action: ActionRow) {
  if (!action.due_date) return false;
  if (action.deadline_kind === "internal_target" || action.deadline_kind === "source_review_date") {
    return true;
  }
  return Boolean(
    action.official_source_url
    && action.official_source_verified_at
    && action.deadline_cycle,
  );
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

  const [profilesResult, intakeResult, documentsResult, applicationsResult, actionsResult, orientationsResult, assignmentsResult] =
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
        ? supabase.from("applications").select("id,student_id,status,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,next_action,created_at").in("student_id", userIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("student_checklist_items").select("id,student_id,title,description,status,owner,due_date,deadline_kind,official_source_url,official_source_verified_at,deadline_cycle,created_at").in("student_id", userIds)
        : Promise.resolve({ data: [], error: null }),
      prospectIds.length
        ? supabase.from("orientations").select("id,prospect_id,created_at").in("prospect_id", prospectIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("student_case_assignments").select("student_id,assigned_admin_id,assigned_at,updated_at").in("student_id", userIds)
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
    || assignmentsResult.error;

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

  const profileByUser = new Map(profiles.map((item) => [item.id, item]));
  const accessByUser = new Map(accessRows.map((item) => [item.user_id, item]));
  const intakeByUser = new Map(intakes.map((item) => [item.student_id, item]));
  const prospectByUser = new Map(
    prospects.flatMap((item) => item.user_id ? [[item.user_id, item] as const] : []),
  );

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

  const records: PersonRecord[] = userIds.map((userId) => {
    const profile = profileByUser.get(userId);
    const prospect = prospectByUser.get(userId);
    const access = accessByUser.get(userId);
    const intake = intakeByUser.get(userId);
    const personDocuments = docsByUser.get(userId) || [];
    const personApplications = applicationsByUser.get(userId) || [];
    const activeApplications = personApplications.filter((item) => isActiveApplication(item.status)).sort(compareApplications);
    const openActions = (actionsByUser.get(userId) || []).filter((item) => isOpenAdminAction(item.status)).sort(compareDue);
    const pendingDocuments = personDocuments.filter((item) => attentionDocumentStatuses.has(item.status)).length;
    const segment = classifyAdminPerson(access?.status, Boolean(intake));
    const email = prospect?.email || "Adresse non enregistrée";
    const currentStage = adminDossierStageIndex(intake?.status, activeApplications.length > 0);
    const recordedAction = openActions[0] || null;
    const applicationAction = activeApplications.find((item) => Boolean(item.next_action)) || null;
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
    const dueDate = recordedAction?.due_date || applicationAction?.deadline || null;
    const campusActions = openActions.filter((item) => item.owner === "almago" || item.owner === "joint").length;
    const needsAttention = pendingDocuments > 0
      || campusActions > 0
      || activeApplications.some((item) => isOverdue(item.deadline));

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
      openActions: openActions.length,
      nextAction,
      nextActionOwner,
      dueDate,
      needsAttention,
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
      nextAction: "Lier le prospect à un compte vérifié pour ouvrir son dossier 360°",
      nextActionOwner: "Prospect",
      dueDate: null,
      needsAttention: false,
      updatedAt: prospect.updated_at,
    });
  }

  records.sort((left, right) => {
    if (left.needsAttention !== right.needsAttention) return left.needsAttention ? -1 : 1;
    return right.updatedAt.localeCompare(left.updatedAt);
  });

  const counts = {
    all: records.length,
    prospect: records.filter((item) => item.segment === "prospect").length,
    candidate: records.filter((item) => item.segment === "candidate").length,
    student: records.filter((item) => item.segment === "student").length,
    archived: records.filter((item) => item.segment === "archived").length,
  };

  const filtered = records.filter((item) => {
    if (view !== "all" && item.segment !== view) return false;
    if (!search) return true;
    return [
      item.name,
      item.email,
      item.stage,
      item.nextAction,
      item.accessStatus ? customerLifecycleStatusLabel(item.accessStatus) : "",
    ].some((value) => value.toLocaleLowerCase("fr").includes(search));
  });

  const attentionCount = records.filter((item) => item.needsAttention).length;
  const campusActionCount = records.filter((item) => item.nextActionOwner === "Campus Allemagne").length;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Personnes"
        title="Prospects, candidats et étudiants"
        description="Une seule liste pour retrouver une personne, comprendre son étape actuelle et ouvrir son dossier 360°."
      />

      <AdminWorkspaceSummary
        eyebrow="Portefeuille"
        title="Suivi des personnes"
        description="Le statut commercial classe la personne ; les files métier et les actions enregistrées indiquent ce qui reste à faire."
        metrics={[
          { label: "Personnes", value: counts.all },
          { label: "Candidats", value: counts.candidate, tone: counts.candidate ? "brand" : "neutral" },
          { label: "Étudiants", value: counts.student, tone: counts.student ? "success" : "neutral" },
          { label: "À surveiller", value: attentionCount, tone: attentionCount ? "warning" : "neutral" },
        ]}
      />

      <section className="mb-5 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Listes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(viewLabels) as PersonView[]).map((item) => (
                <Link
                  key={item}
                  href={`/admin/people?view=${item}`}
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

          <form method="get" className="flex w-full gap-2 lg:max-w-xl">
            <input type="hidden" name="view" value={view} />
            <label className="sr-only" htmlFor="people-search">Rechercher une personne</label>
            <input
              id="people-search"
              name="q"
              type="search"
              defaultValue={params.q || ""}
              placeholder="Nom, e-mail, étape ou prochaine action"
              className="field bg-white"
            />
            <button className={buttonClassName("secondary", "shrink-0 px-4")} type="submit">
              Rechercher
            </button>
          </form>
        </div>

        <div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-xs text-slate-600 sm:px-5">
          {filtered.length} personne{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
          {" · "}
          {campusActionCount} dossier{campusActionCount > 1 ? "s" : ""} avec une prochaine action Campus identifiée
        </div>

        {filtered.length ? (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((person) => (
              <article
                key={person.key}
                className="grid gap-4 px-4 py-5 transition-colors hover:bg-[var(--surface-subtle)] sm:px-5 xl:grid-cols-[minmax(14rem,1.25fr)_10rem_10rem_minmax(15rem,1fr)_9rem_auto] xl:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={segmentBadgeVariant[person.segment]}>
                      {adminPersonSegmentLabels[person.segment]}
                    </Badge>
                    {person.needsAttention ? <Badge variant="warning">Attention</Badge> : null}
                  </div>
                  <h2 className="mt-2 truncate text-base font-bold text-slate-950">{person.name}</h2>
                  <p className="mt-1 truncate text-xs text-slate-600"><bdi dir="auto">{person.email}</bdi></p>
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
                  <p className="mt-1 text-xs text-slate-500">{person.openActions} action{person.openActions > 1 ? "s" : ""} ouverte{person.openActions > 1 ? "s" : ""}</p>
                </div>

                <div className="min-w-0">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Prochaine action</p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{person.nextAction}</p>
                  <p className="mt-1 text-xs text-slate-500">Responsable · {person.nextActionOwner}</p>
                </div>

                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Échéance</p>
                  <p className={`mt-1 text-sm font-semibold ${isOverdue(person.dueDate) ? "text-red-700" : "text-slate-900"}`}>
                    {formatDate(person.dueDate)}
                  </p>
                  {isOverdue(person.dueDate) ? <p className="mt-1 text-xs font-bold text-red-700">Dépassée</p> : null}
                </div>

                <div className="flex xl:justify-end">
                  {person.userId ? (
                    <Link
                      href={`/admin/dossiers/${person.userId}`}
                      className={buttonClassName("secondary", "w-full whitespace-nowrap px-4 xl:w-auto")}
                    >
                      Dossier 360°
                    </Link>
                  ) : (
                    <Link
                      href="/admin/prospects"
                      className={buttonClassName("ghost", "w-full whitespace-nowrap px-3 xl:w-auto")}
                    >
                      Ouvrir Prospects
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <h2 className="text-lg font-bold text-slate-950">Aucune personne dans cette vue</h2>
            <p className="mt-2 text-sm text-slate-600">Modifiez la liste ou la recherche. Aucune donnée n’a été supprimée.</p>
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-500">
        « Candidat » correspond ici à une personne qualifiée, engagée dans le parcours Campus ou en phase de paiement. « Étudiant » correspond à un accès client actif. Les personnes terminées restent consultables sans être mélangées aux files actives.
      </p>
    </main>
  );
}
