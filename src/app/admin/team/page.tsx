import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminWorkspaceSummary } from "@/components/admin/AdminWorkspaceSummary";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import {
  adminActionDateIsTrusted,
  applicationDateIsTrusted,
  applicationOfficialDeadlineUrgency,
  applicationRouteRisk,
  campusTodayDateKey,
} from "@/lib/admin/application-risk";
import { isOpenAdminAction } from "@/lib/admin/people";
import { isActiveApplication } from "@/lib/application-workflow";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AdminProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
};

type AssignmentRow = {
  student_id: string;
  assigned_admin_id: string | null;
};

type ActionRow = {
  student_id: string;
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
};

type ApplicationRow = {
  student_id: string;
  status: string;
  deadline: string | null;
  deadline_kind: string | null;
  deadline_source_url: string | null;
  deadline_verified_at: string | null;
  deadline_cycle: string | null;
  application_method: string | null;
  next_action: string | null;
};

type ContactRow = {
  student_id: string;
  occurred_at: string;
};

type AdvisorWorkload = {
  id: string;
  name: string;
  assigned: number;
  overdue: number;
  today: number;
  missingAction: number;
  staleContact: number;
};

function profileName(profile: AdminProfile | undefined, index: number) {
  const split = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  return split || profile?.full_name?.trim() || `Conseiller Campus ${index + 1}`;
}

function dateKey(value: string | null) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString().slice(0, 10) : null;
}

function shiftDateKey(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function actionDeadlineIsTrusted(item: ActionRow) {
  return adminActionDateIsTrusted(item);
}

function applicationDeadlineIsTrusted(item: ApplicationRow) {
  return applicationDateIsTrusted(item);
}

export default async function AdminTeamPage() {
  const supabase = await createClient();
  const { data: { user: currentAdmin } } = await supabase.auth.getUser();

  const [
    rolesResult,
    accessResult,
    intakeResult,
    assignmentsResult,
    actionsResult,
    applicationsResult,
    contactsResult,
  ] = await Promise.all([
    supabase.from("user_roles").select("user_id").eq("role", "admin"),
    supabase.from("customer_access").select("user_id,status").limit(1000),
    supabase.from("student_intake_cases").select("student_id,status").limit(1000),
    supabase.from("student_case_assignments").select("student_id,assigned_admin_id").limit(1000),
    supabase
      .from("student_checklist_items")
      .select("student_id,status,owner,due_date,template_id,requires_student_action,student_action_reason,deadline_kind,official_source_url,official_source_verified_at,deadline_cycle")
      .limit(5000),
    supabase
      .from("applications")
      .select("student_id,status,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,application_method,next_action")
      .limit(5000),
    supabase
      .from("student_case_notes")
      .select("student_id,occurred_at")
      .neq("kind", "internal_note")
      .order("occurred_at", { ascending: false })
      .limit(3000),
  ]);

  const firstError = rolesResult.error
    || accessResult.error
    || intakeResult.error
    || assignmentsResult.error
    || actionsResult.error
    || applicationsResult.error
    || contactsResult.error;

  if (firstError) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 xl:px-8">
        <AdminPageHeader
          section="Pilotage"
          title="Équipe"
          description="Charge, attribution et continuité des dossiers."
        />
        <AdminLoadError
          title="La charge de l’équipe est temporairement indisponible"
          description="Aucune attribution n’a été modifiée."
          retryHref="/admin/team"
        />
      </main>
    );
  }

  const adminIds = (rolesResult.data || []).map((item) => item.user_id);
  const profileResult = adminIds.length
    ? await supabase
        .from("profiles")
        .select("id,first_name,last_name,full_name")
        .in("id", adminIds)
    : { data: [], error: null };

  if (profileResult.error) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 xl:px-8">
        <AdminLoadError
          title="Impossible de charger les conseillers"
          description="La répartition actuelle des dossiers reste inchangée."
          retryHref="/admin/team"
        />
      </main>
    );
  }

  const profileById = new Map(
    ((profileResult.data || []) as AdminProfile[]).map((item) => [item.id, item]),
  );
  const advisors = adminIds.map((id, index) => ({
    id,
    name: profileName(profileById.get(id), index),
  }));

  const operationalIds = new Set<string>();
  for (const item of accessResult.data || []) {
    if (item.status !== "client_completed") operationalIds.add(item.user_id);
  }
  for (const item of intakeResult.data || []) operationalIds.add(item.student_id);

  const assignments = (assignmentsResult.data || []) as AssignmentRow[];
  const assignmentByStudent = new Map(assignments.map((item) => [item.student_id, item.assigned_admin_id]));

  const actionsByStudent = new Map<string, ActionRow[]>();
  for (const item of (actionsResult.data || []) as ActionRow[]) {
    actionsByStudent.set(item.student_id, [...(actionsByStudent.get(item.student_id) || []), item]);
  }

  const applicationsByStudent = new Map<string, ApplicationRow[]>();
  for (const item of (applicationsResult.data || []) as ApplicationRow[]) {
    applicationsByStudent.set(item.student_id, [...(applicationsByStudent.get(item.student_id) || []), item]);
  }

  const latestContactByStudent = new Map<string, string>();
  for (const item of (contactsResult.data || []) as ContactRow[]) {
    if (!latestContactByStudent.has(item.student_id)) {
      latestContactByStudent.set(item.student_id, item.occurred_at);
    }
  }

  const today = campusTodayDateKey();
  const staleContactCutoff = shiftDateKey(today, -14);

  const blockedStudentIds = new Set<string>();
  const waitingCampusStudentIds = new Set<string>();
  const waitingStudentStudentIds = new Set<string>();
  const waitingExternalStudentIds = new Set<string>();
  for (const action of (actionsResult.data || []) as ActionRow[]) {
    if (!operationalIds.has(action.student_id)) continue;
    if (action.status === "blocked") blockedStudentIds.add(action.student_id);
    if (action.status === "waiting_almago") waitingCampusStudentIds.add(action.student_id);
    if (
      action.status === "waiting_student"
      && action.requires_student_action
      && action.student_action_reason?.trim()
    ) {
      waitingStudentStudentIds.add(action.student_id);
    }
    if (action.status === "waiting_external") waitingExternalStudentIds.add(action.student_id);
  }

  const unverifiedDeadlineStudentIds = new Set<string>();
  const applicationRiskStudentIds = new Set<string>();
  const officialOverdueStudentIds = new Set<string>();
  const officialD7StudentIds = new Set<string>();
  for (const action of (actionsResult.data || []) as ActionRow[]) {
    if (!operationalIds.has(action.student_id)) continue;
    if (!isOpenAdminAction(action.status) || action.template_id !== null) continue;
    if (action.due_date && !actionDeadlineIsTrusted(action)) {
      unverifiedDeadlineStudentIds.add(action.student_id);
    }
  }
  for (const application of (applicationsResult.data || []) as ApplicationRow[]) {
    if (!operationalIds.has(application.student_id) || !isActiveApplication(application.status)) continue;
    const trusted = applicationDeadlineIsTrusted(application);
    if (application.deadline && !trusted) {
      unverifiedDeadlineStudentIds.add(application.student_id);
    }
    if (applicationRouteRisk({
      status: application.status,
      application_method: application.application_method,
      deadline: application.deadline,
      deadline_kind: application.deadline_kind,
      deadlineTrusted: trusted,
    }, today)) {
      applicationRiskStudentIds.add(application.student_id);
    }

    const officialUrgency = applicationOfficialDeadlineUrgency({
      status: application.status,
      deadline: application.deadline,
      deadline_kind: application.deadline_kind,
      deadlineTrusted: trusted,
    }, today);
    if (officialUrgency?.kind === "overdue") {
      officialOverdueStudentIds.add(application.student_id);
    } else if (officialUrgency && officialUrgency.daysRemaining <= 7) {
      officialD7StudentIds.add(application.student_id);
    }
  }

  const byAdvisor = new Map<string, AdvisorWorkload>(
    advisors.map((advisor) => [
      advisor.id,
      {
        id: advisor.id,
        name: advisor.name,
        assigned: 0,
        overdue: 0,
        today: 0,
        missingAction: 0,
        staleContact: 0,
      },
    ]),
  );

  const unassigned: AdvisorWorkload = {
    id: "unassigned",
    name: "Non attribués",
    assigned: 0,
    overdue: 0,
    today: 0,
    missingAction: 0,
    staleContact: 0,
  };

  for (const studentId of operationalIds) {
    const assignedAdminId = assignmentByStudent.get(studentId) || null;
    const workload = assignedAdminId ? byAdvisor.get(assignedAdminId) : unassigned;
    if (!workload) continue;

    workload.assigned += 1;

    const openActions = (actionsByStudent.get(studentId) || []).filter((item) =>
      isOpenAdminAction(item.status) && item.template_id === null
    );
    const activeApplications = (applicationsByStudent.get(studentId) || []).filter((item) => isActiveApplication(item.status));

    const hasExplicitNextAction = openActions.length > 0
      || activeApplications.some((item) => Boolean(item.next_action?.trim()));
    if (!hasExplicitNextAction) workload.missingAction += 1;

    const contactDate = dateKey(latestContactByStudent.get(studentId) || null);
    if (!contactDate || contactDate < staleContactCutoff) workload.staleContact += 1;

    const dates = [
      ...openActions.flatMap((item) => {
        const key = dateKey(item.due_date);
        return key && actionDeadlineIsTrusted(item) ? [key] : [];
      }),
      ...activeApplications.flatMap((item) => {
        const key = dateKey(item.deadline);
        return key && applicationDeadlineIsTrusted(item) ? [key] : [];
      }),
    ].sort();

    const nearest = dates[0] || null;
    if (nearest && nearest < today) workload.overdue += 1;
    if (nearest === today) workload.today += 1;
  }

  const workloads = [...byAdvisor.values()].sort((left, right) => {
    const leftUrgent = left.overdue * 4 + left.today * 3 + left.missingAction * 2 + left.staleContact;
    const rightUrgent = right.overdue * 4 + right.today * 3 + right.missingAction * 2 + right.staleContact;
    return rightUrgent - leftUrgent || right.assigned - left.assigned || left.name.localeCompare(right.name, "fr");
  });

  const totalAssigned = workloads.reduce((sum, item) => sum + item.assigned, 0);
  const totalOverdue = workloads.reduce((sum, item) => sum + item.overdue, 0) + unassigned.overdue;
  const totalToday = workloads.reduce((sum, item) => sum + item.today, 0) + unassigned.today;
  const totalMissingAction = workloads.reduce((sum, item) => sum + item.missingAction, 0) + unassigned.missingAction;
  const totalStale = workloads.reduce((sum, item) => sum + item.staleContact, 0) + unassigned.staleContact;
  const portfolio = operationalIds.size;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 sm:py-7 xl:px-8">
      <AdminPageHeader
        section="Pilotage"
        title="Équipe"
        description="Voyez qui porte chaque portefeuille, où se concentre la charge et quels dossiers risquent d’être oubliés."
        actions={
          <>
            <Link href="/admin/people?work=unassigned" className={buttonClassName("secondary", "px-4")}>
              Non attribués · {unassigned.assigned}
            </Link>
            <Link href="/admin/people?work=mine" className={buttonClassName("primary", "px-4")}>
              Mes dossiers
            </Link>
          </>
        }
      />

      <AdminWorkspaceSummary
        eyebrow="Répartition"
        title="Charge opérationnelle"
        description="Les indicateurs utilisent seulement les échéances officielles vérifiées ou les cibles internes explicitement enregistrées."
        metrics={[
          { label: "Dossiers actifs", value: portfolio, tone: "neutral" },
          { label: "En retard", value: totalOverdue, tone: totalOverdue ? "warning" : "success" },
          { label: "Aujourd’hui", value: totalToday, tone: totalToday ? "brand" : "neutral" },
          { label: "Sans action", value: totalMissingAction, tone: totalMissingAction ? "warning" : "success" },
        ]}
      />

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="États d’attente, deadlines et risques de l’équipe">
        <TeamStateCard
          href="/admin/people?work=blocked"
          label="Bloqués"
          value={blockedStudentIds.size}
          detail="Étape explicitement bloquée"
          tone={blockedStudentIds.size ? "error" : "success"}
        />
        <TeamStateCard
          href="/admin/people?work=waiting_campus"
          label="Attend Campus"
          value={waitingCampusStudentIds.size}
          detail="Une action Campus Allemagne est attendue"
          tone={waitingCampusStudentIds.size ? "warning" : "success"}
        />
        <TeamStateCard
          href="/admin/people?work=waiting_student"
          label="Attend étudiant"
          value={waitingStudentStudentIds.size}
          detail="Action personnelle ciblée et justifiée"
          tone={waitingStudentStudentIds.size ? "info" : "success"}
        />
        <TeamStateCard
          href="/admin/people?work=waiting_external"
          label="Attend externe"
          value={waitingExternalStudentIds.size}
          detail="Université, autorité ou autre acteur externe"
          tone={waitingExternalStudentIds.size ? "info" : "success"}
        />
        <TeamStateCard
          href="/admin/people?work=deadline_verify"
          label="Dates à vérifier"
          value={unverifiedDeadlineStudentIds.size}
          detail="Date enregistrée sans provenance complète"
          tone={unverifiedDeadlineStudentIds.size ? "warning" : "success"}
        />
        <TeamStateCard
          href="/admin/people?work=application_risk"
          label="VPD / uni-assist à risque"
          value={applicationRiskStudentIds.size}
          detail="Cible interne D-70 ou D-56 atteinte avant soumission"
          tone={applicationRiskStudentIds.size ? "warning" : "success"}
        />
        <TeamStateCard
          href="/admin/people?work=official_overdue"
          label="Deadlines dépassées"
          value={officialOverdueStudentIds.size}
          detail="Deadline officielle vérifiée dépassée avant soumission"
          tone={officialOverdueStudentIds.size ? "error" : "success"}
        />
        <TeamStateCard
          href="/admin/people?work=official_7"
          label="Deadline ≤ 7 j"
          value={officialD7StudentIds.size}
          detail="Dossier à J-7 ou moins d’une deadline officielle vérifiée"
          tone={officialD7StudentIds.size ? "warning" : "success"}
        />
      </section>

      <section className="mt-5 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white" aria-labelledby="team-workload-title">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Conseillers</p>
            <h2 id="team-workload-title" className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950">
              Portefeuilles de l’équipe
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ouvrez un portefeuille pour retrouver immédiatement les personnes rattachées au conseiller.
            </p>
          </div>
          <Badge variant={unassigned.assigned ? "warning" : "success"}>
            {unassigned.assigned ? `${unassigned.assigned} non attribué${unassigned.assigned > 1 ? "s" : ""}` : "Attributions à jour"}
          </Badge>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {workloads.map((advisor) => (
            <AdvisorWorkloadRow
              key={advisor.id}
              workload={advisor}
              isCurrent={advisor.id === currentAdmin?.id}
            />
          ))}

          {unassigned.assigned ? (
            <AdvisorWorkloadRow workload={unassigned} isCurrent={false} unassigned />
          ) : null}
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Continuité</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">Contacts à reprendre</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {totalStale
              ? `${totalStale} dossier${totalStale > 1 ? "s" : ""} actif${totalStale > 1 ? "s" : ""} n’a${totalStale > 1 ? "vent" : ""} aucun contact journalisé depuis 14 jours.`
              : "Chaque dossier actif possède un contact journalisé dans les 14 derniers jours."}
          </p>
          <Link href="/admin/people?work=stale" className={buttonClassName("secondary", "mt-4 px-4")}>
            Voir sans contact 14 j
          </Link>
        </div>

        <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Méthode</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">Rééquilibrer sans perdre le contexte</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pour transférer un dossier, ouvrez son Dossier 360° puis changez le conseiller. Le journal interne, les actions et l’historique restent attachés à la personne.
          </p>
          <Link href="/admin/people" className={buttonClassName("ghost", "mt-4 px-3")}>
            Ouvrir Personnes
          </Link>
        </div>
      </section>
    </main>
  );
}

function AdvisorWorkloadRow({
  workload,
  isCurrent,
  unassigned = false,
}: {
  workload: AdvisorWorkload;
  isCurrent: boolean;
  unassigned?: boolean;
}) {
  const href = unassigned
    ? "/admin/people?work=unassigned"
    : `/admin/people?advisor=${encodeURIComponent(workload.id)}`;

  return (
    <article className="grid gap-4 px-4 py-5 sm:px-5 xl:grid-cols-[minmax(12rem,1fr)_repeat(5,7rem)_auto] xl:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-bold text-slate-950">{workload.name}</h3>
          {isCurrent ? <Badge variant="info">Vous</Badge> : null}
          {unassigned ? <Badge variant="warning">À répartir</Badge> : null}
        </div>
        <p className="mt-1 text-xs text-slate-600">{workload.assigned} dossier{workload.assigned > 1 ? "s" : ""} actif{workload.assigned > 1 ? "s" : ""}</p>
      </div>

      <WorkMetric label="Portefeuille" value={workload.assigned} />
      <WorkMetric label="En retard" value={workload.overdue} warning={workload.overdue > 0} />
      <WorkMetric label="Aujourd’hui" value={workload.today} warning={workload.today > 0} />
      <WorkMetric label="Sans action" value={workload.missingAction} warning={workload.missingAction > 0} />
      <WorkMetric label="Sans contact" value={workload.staleContact} warning={workload.staleContact > 0} />

      <div className="flex xl:justify-end">
        <Link href={href} className={buttonClassName("secondary", "w-full whitespace-nowrap px-3 xl:w-auto")}>
          Ouvrir le portefeuille
        </Link>
      </div>
    </article>
  );
}

function WorkMetric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-600">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${warning ? "text-amber-800" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}


function TeamStateCard({
  href,
  label,
  value,
  detail,
  tone,
}: {
  href: string;
  label: string;
  value: number;
  detail: string;
  tone: "error" | "warning" | "info" | "success";
}) {
  return (
    <Link
      href={href}
      className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <Badge variant={tone}>{value ? "À suivre" : "À jour"}</Badge>
      </div>
      <p className="mt-2 text-sm leading-5 text-slate-600">{detail}</p>
    </Link>
  );
}
