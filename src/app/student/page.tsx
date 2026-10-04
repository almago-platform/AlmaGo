import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AlmagoJourney } from "@/components/student/AlmagoJourney";
import { buildAlmagoJourney } from "@/lib/student/almago-journey";
import { createClient } from "@/lib/supabase/server";
import { getRequestCopy } from "@/lib/i18n-server";
import { studentDashboardCopy } from "@/content/student-dashboard-copy";
import { studentDashboardCockpitCopy } from "@/content/student-dashboard-cockpit-copy";
import { studentChecklistCopy } from "@/content/student-checklist-copy";
import { studentApplicationsCopy } from "@/content/student-applications-copy";
import { rebrandCopy } from "@/lib/brand";
import { normalizeApplicationStatus } from "@/lib/application-workflow";
import { formatDeadline, isActiveApplication, isPastDeadline } from "@/lib/phase4";
import { localizeApplicationStoredText, localizeCatalogueLabel } from "@/lib/student/arabic-display";

export const dynamic = "force-dynamic";

function firstRelation<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

export default async function StudentEntry() {
  const { locale, copy } = await getRequestCopy();
  const t = rebrandCopy(studentDashboardCopy[locale]);
  const cockpit = rebrandCopy(studentDashboardCockpitCopy[locale]);
  const checklistCopy = rebrandCopy(studentChecklistCopy[locale]);
  const applicationsCopy = rebrandCopy(studentApplicationsCopy[locale].panel);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name,onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return <DashboardUnavailable copy={t} />;
  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  const [
    { data: items, error: itemsError },
    { data: documents, error: documentsError },
    { data: recommendations, error: recommendationsError },
    { data: applications, error: applicationsError },
    { data: project, error: projectError },
  ] = await Promise.all([
    supabase
      .from("student_checklist_items")
      .select("title,status,due_date,updated_at,checklist_templates(key)")
      .order("created_at"),
    supabase
      .from("documents")
      .select("id,status,original_filename,created_at,updated_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("program_recommendations")
      .select("id,created_at,programs(name,degree_level,universities(name,city))")
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id,status,deadline,next_action,required_documents,created_at,updated_at,programs(name,universities(name,city)),application_events(id,event_type,message,created_at)")
      .order("deadline", { ascending: true, nullsFirst: false }),
    supabase
      .from("student_projects")
      .select("path,target_degree,target_field,target_intake")
      .eq("student_id", user.id)
      .maybeSingle(),
  ]);

  if (itemsError || documentsError || recommendationsError || applicationsError || projectError) {
    return <DashboardUnavailable copy={t} />;
  }

  const checklist = (items || []).map((item) => {
    const relation = firstRelation(item.checklist_templates);
    const localizedTemplate = relation?.key ? checklistCopy.recorded.items[relation.key] : undefined;
    return {
      ...item,
      title: localizedTemplate?.title || item.title,
    };
  });

  const studentDocuments = documents || [];
  const studentRecommendations = recommendations || [];
  const studentApplications = applications || [];

  const completed = checklist.filter((item) => item.status === "completed" || item.status === "done").length;
  const progression = checklist.length ? Math.round((completed / checklist.length) * 100) : 0;
  const actionableChecklist = checklist.filter((item) =>
    ["waiting_student", "todo", "in_progress", "not_started"].includes(item.status),
  );
  const waitingAlmaGo = checklist.filter((item) => item.status === "waiting_almago");
  const nextItem = actionableChecklist.find((item) => item.status === "waiting_student") || actionableChecklist[0];

  const checklistStatusByKey = new Map(
    checklist.flatMap((item) => {
      const relation = firstRelation(item.checklist_templates);
      return relation?.key ? [[relation.key, item.status] as const] : [];
    }),
  );
  const documentChecklistOpen = checklist.filter((item) => {
    const relation = firstRelation(item.checklist_templates);
    return ["passport", "translation"].includes(relation?.key || "") && item.status !== "completed";
  }).length;

  const approvedDocuments = studentDocuments.filter((document) => document.status === "approved").length;
  const documentsNeedingAction = studentDocuments.filter((document) =>
    ["rejected", "replace_required"].includes(document.status),
  ).length;

  const activeApplications = studentApplications.filter((application) => isActiveApplication(application.status));
  const actionableApplications = activeApplications.filter((application) => Boolean(application.next_action));
  const actionableApplication = actionableApplications[0];

  const studentActionCount = actionableChecklist.length + documentsNeedingAction + actionableApplications.length;
  const hasActionRequired = studentActionCount > 0;

  const almagoJourney = buildAlmagoJourney({
    projectDefined: Boolean(project?.path || project?.target_degree || project?.target_field || project?.target_intake),
    profileCompleted: Boolean(profile.onboarding_completed),
    documentsNeedingAction,
    documentChecklistOpen,
    savedProgrammes: studentRecommendations.length,
    applicationStatuses: studentApplications.map((application) => application.status),
    applicationsMissingDocuments: studentApplications.filter(
      (application) => normalizeApplicationStatus(application.status) === "documents_missing",
    ).length,
    applicationNextActions: actionableApplications.length,
    germanyPreparationStatus: checklistStatusByKey.get("germany_preparation") || null,
  });

  const nextAction = documentsNeedingAction
    ? {
        label: t.documentsAction,
        detail: t.documentsActionDetail(documentsNeedingAction),
        reason: cockpit.documentsReason(documentsNeedingAction),
        duration: cockpit.durationDocuments,
        href: "/student/documents",
      }
    : actionableApplication?.next_action
      ? {
          label: t.applicationAction,
          detail: localizeApplicationStoredText(locale, actionableApplication.next_action),
          reason: cockpit.applicationReason,
          duration: cockpit.durationApplication,
          href: "/student/applications",
        }
      : nextItem
        ? {
            label: nextItem.title,
            detail: t.checklistAction,
            reason: cockpit.checklistReason,
            duration: cockpit.durationChecklist,
            href: ["passport", "translation"].includes(firstRelation(nextItem.checklist_templates)?.key || "")
              ? "/student/documents"
              : "/student/checklist",
          }
        : {
            label: t.fileUpToDate,
            detail: t.noPriorityDetail,
            reason: cockpit.noActionReason,
            duration: cockpit.durationReview,
            href: "/student/checklist",
          };

  const projectMain = [project?.target_degree, project?.target_field].filter(Boolean).join(" · ");
  const projectSummary = [
    projectMain || cockpit.projectFallback,
    cockpit.germany,
    project?.target_intake ? localizeCatalogueLabel(locale, project.target_intake) : null,
  ].filter(Boolean).join(" · ");

  const importantDeadlines = [
    ...activeApplications
      .filter((application) => Boolean(application.deadline))
      .map((application) => ({
        date: application.deadline as string,
        label: firstRelation(application.programs)?.name || applicationsCopy.programFallback,
        type: cockpit.applicationDeadline,
        href: "/student/applications",
      })),
    ...actionableChecklist
      .filter((item) => Boolean(item.due_date))
      .map((item) => ({
        date: item.due_date as string,
        label: item.title,
        type: cockpit.stepDeadline,
        href: "/student/checklist",
      })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const missingRequiredDocuments = [...new Set(
    activeApplications
      .filter((application) => normalizeApplicationStatus(application.status) === "documents_missing")
      .flatMap((application) =>
        Array.isArray(application.required_documents)
          ? application.required_documents.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
          : [],
      ),
  )].slice(0, 4);

  const documentsToFix = studentDocuments
    .filter((document) => ["rejected", "replace_required"].includes(document.status))
    .slice(0, 4);

  const recentActivities = [
    ...studentApplications.flatMap((application) => {
      const program = firstRelation(application.programs);
      return (application.application_events || []).map((event) => ({
        timestamp: event.created_at,
        label: cockpit.activityApplication,
        detail: localizeApplicationStoredText(locale, event.message) || program?.name || applicationsCopy.programFallback,
        href: "/student/applications",
      }));
    }),
    ...studentDocuments.map((document) => ({
      timestamp: document.created_at,
      label: cockpit.activityDocument,
      detail: document.original_filename,
      href: "/student/documents",
    })),
    ...studentRecommendations.map((recommendation) => ({
      timestamp: recommendation.created_at,
      label: cockpit.activityProgramme,
      detail: firstRelation(recommendation.programs)?.name || t.programmesCard,
      href: "/student/orientation",
    })),
  ]
    .filter((activity) => Boolean(activity.timestamp))
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
    .slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <header className="border-b border-[var(--border)] pb-7 sm:pb-8">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
          {t.heroEyebrow}
        </p>
        <h1 className="mt-2 text-[2.25rem] font-semibold tracking-[-0.045em] text-[var(--foreground)] sm:text-[3rem]">
          {cockpit.greeting} <bdi dir="auto">{profile.first_name || t.studentFallback}</bdi>
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="max-w-4xl text-sm font-medium leading-6 text-[var(--muted)] sm:text-base">
            <span className="font-bold text-[var(--foreground-soft)]">{cockpit.projectLabel} :</span>{" "}
            <bdi dir="auto">{projectSummary}</bdi>
          </p>
          <Link href="/student/pathway" className="text-xs font-bold text-[var(--brand)] hover:underline">
            {t.pathwayCta}
          </Link>
        </div>
      </header>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.34fr)] lg:items-stretch">
        <article className="rounded-[var(--radius-lg)] border border-[var(--brand-border)] bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{t.nextActionEyebrow}</p>
            <Badge variant={hasActionRequired ? "warning" : waitingAlmaGo.length ? "info" : "neutral"}>
              {hasActionRequired ? t.now : waitingAlmaGo.length ? t.tracking : t.upToDate}
            </Badge>
          </div>

          <h2 className="mt-4 max-w-3xl text-[1.8rem] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--foreground)] sm:text-[2.35rem]">
            {nextAction.label}
          </h2>
          <p dir="auto" className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
            {nextAction.detail}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                {cockpit.nextActionReason}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">{nextAction.reason}</p>
            </div>
            <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                {cockpit.duration}
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--foreground)]">{nextAction.duration}</p>
            </div>
          </div>

          <div className="mt-6 [&_a]:w-full sm:[&_a]:w-auto">
            <ButtonLink href={nextAction.href}>{cockpit.continue}</ButtonLink>
          </div>
        </article>

        <aside className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5 sm:p-6">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand-strong)]">
            {cockpit.progressEyebrow}
          </p>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-semibold tracking-[-0.045em] text-[var(--foreground)]">
                {checklist.length ? `${progression}%` : "—"}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground-soft)]">{cockpit.progressTitle}</p>
            </div>
            {checklist.length > 0 && (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
                {completed}/{checklist.length}
              </span>
            )}
          </div>

          {checklist.length > 0 && (
            <div className="mt-5">
              <ProgressBar value={progression} label={t.progressLabel} />
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                {cockpit.progressMeta(completed, checklist.length)}
              </p>
            </div>
          )}

          <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[#626669]">
            {t.progressBoundary}
          </p>
        </aside>
      </section>

      <div className="mt-7">
        <AlmagoJourney
          model={almagoJourney}
          nextAction={{ label: nextAction.label, detail: nextAction.detail, href: nextAction.href }}
        />
      </div>

      <section className="mt-7" aria-labelledby="deadlines-title">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 id="deadlines-title" className="text-xl font-semibold tracking-[-0.025em] text-[var(--foreground)]">
            {cockpit.deadlinesTitle}
          </h2>
          <Link href="/student/applications" className="text-xs font-bold text-[var(--brand)] hover:underline">
            {cockpit.viewAll}
          </Link>
        </div>

        {importantDeadlines.length ? (
          <div className="divide-y divide-[var(--border)] rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-raised)]">
            {importantDeadlines.map((deadline) => {
              const overdue = isPastDeadline(deadline.date);
              return (
                <Link key={`${deadline.type}-${deadline.date}-${deadline.label}`} href={deadline.href} className="grid gap-2 px-4 py-4 transition-colors hover:bg-[var(--surface-subtle)] sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center sm:px-5">
                  <time className={`text-sm font-bold ${overdue ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}>
                    {formatDeadline(deadline.date, locale)}
                  </time>
                  <span className="min-w-0 truncate text-sm font-semibold text-[var(--foreground-soft)]" dir="auto">
                    {deadline.label}
                  </span>
                  <Badge variant={overdue ? "error" : "neutral"}>{deadline.type}</Badge>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="rounded-[var(--radius-panel)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-sm text-[var(--muted)]">
            {cockpit.deadlinesEmpty}
          </p>
        )}
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-3" aria-label={t.overviewAria}>
        <CockpitPanel title={cockpit.programmesTitle} href="/student/orientation" cta={cockpit.programmesCta}>
          {studentRecommendations.length ? (
            <div className="divide-y divide-[var(--border)]">
              {studentRecommendations.slice(0, 3).map((recommendation) => {
                const program = firstRelation(recommendation.programs);
                const university = firstRelation(program?.universities);
                return (
                  <div key={recommendation.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-bold text-[var(--foreground)]" dir="auto">{program?.name || t.programmesCard}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      <bdi dir="auto">{university?.name || "—"}</bdi>
                      {university?.city ? <> · <bdi dir="ltr">{university.city}</bdi></> : null}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState>{cockpit.programmesEmpty}</EmptyState>
          )}
        </CockpitPanel>

        <CockpitPanel title={cockpit.documentsTitle} href="/student/documents" cta={cockpit.documentsCta}>
          {missingRequiredDocuments.length || documentsToFix.length ? (
            <div className="space-y-2.5">
              {missingRequiredDocuments.map((document) => (
                <div key={`missing-${document}`} className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-[var(--warning-soft)] px-3 py-2.5">
                  <span className="min-w-0 truncate text-sm font-semibold text-[var(--foreground)]" dir="auto">{document}</span>
                  <Badge variant="warning">{cockpit.missing}</Badge>
                </div>
              ))}
              {documentsToFix.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-[var(--danger-soft)] px-3 py-2.5">
                  <span className="min-w-0 truncate text-sm font-semibold text-[var(--foreground)]" dir="auto">{document.original_filename}</span>
                  <Badge variant="error">{cockpit.toFix}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>{cockpit.documentsEmpty}</EmptyState>
          )}
        </CockpitPanel>

        <CockpitPanel title={cockpit.applicationsTitle} href="/student/applications" cta={cockpit.applicationsCta}>
          {activeApplications.length ? (
            <div className="divide-y divide-[var(--border)]">
              {activeApplications.slice(0, 3).map((application) => {
                const program = firstRelation(application.programs);
                const normalized = normalizeApplicationStatus(application.status);
                const status = applicationsCopy.statusLabels[application.status]
                  || (normalized ? applicationsCopy.statusLabels[normalized] : undefined)
                  || applicationsCopy.statusLabels.other;
                return (
                  <div key={application.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-bold text-[var(--foreground)]" dir="auto">
                        {program?.name || applicationsCopy.programFallback}
                      </p>
                      <Badge variant="info">{status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {application.deadline ? formatDeadline(application.deadline, locale) : applicationsCopy.noConfirmedDate}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState>{cockpit.applicationsEmpty}</EmptyState>
          )}
        </CockpitPanel>
      </section>

      <section className="mt-8 border-t border-[var(--border)] pt-7" aria-labelledby="activity-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 id="activity-title" className="text-xl font-semibold tracking-[-0.025em] text-[var(--foreground)]">
            {cockpit.activityTitle}
          </h2>
          <span className="text-xs text-[var(--muted)]">
            {approvedDocuments ? t.documentsApproved(approvedDocuments) : ""}
          </span>
        </div>

        {recentActivities.length ? (
          <ol className="space-y-0">
            {recentActivities.map((activity, index) => (
              <li key={`${activity.timestamp}-${activity.label}-${index}`} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--brand)]" />
                  {index < recentActivities.length - 1 && <span className="w-px flex-1 bg-[var(--border)]" />}
                </div>
                <Link href={activity.href} className="pb-5">
                  <p className="text-sm font-bold text-[var(--foreground)]">{activity.label}</p>
                  <p dir="auto" className="mt-1 text-sm leading-5 text-[var(--muted)]">{activity.detail}</p>
                  <time className="mt-1.5 block text-xs text-[var(--muted)]">
                    {new Intl.DateTimeFormat(applicationsCopy.intlLocale, { dateStyle: "medium" }).format(new Date(activity.timestamp))}
                  </time>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState>{cockpit.activityEmpty}</EmptyState>
        )}
      </section>
    </main>
  );
}

function CockpitPanel({
  title,
  href,
  cta,
  children,
}: {
  title: string;
  href: string;
  cta: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-xs)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
        <Link href={href} className="text-xs font-bold text-[var(--brand)] hover:underline">{cta}</Link>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--radius-control)] border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-5 text-sm leading-6 text-[var(--muted)]">
      {children}
    </p>
  );
}

function DashboardUnavailable({ copy }: { copy: (typeof studentDashboardCopy)["fr"] }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader badge={copy.unavailableBadge} title={copy.dossierEyebrow} />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{copy.unavailableTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.unavailableText}</p>
        </div>
        <div className="mt-5">
          <ButtonLink href="/student">{copy.retry}</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
