import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StudentJourneyOverview, type StudentJourneyStage } from "@/components/student/StudentJourneyOverview";
import { createClient } from "@/lib/supabase/server";
import { getRequestCopy } from "@/lib/i18n-server";
import { studentDashboardCopy } from "@/content/student-dashboard-copy";
import { studentChecklistCopy } from "@/content/student-checklist-copy";
import { formatDeadline, isActiveApplication, isPastDeadline, nextActiveDeadline } from "@/lib/phase4";

export const dynamic = "force-dynamic";

export default async function StudentEntry() {
  const { locale, copy } = await getRequestCopy();
  const t = studentDashboardCopy[locale];
  const checklistCopy = studentChecklistCopy[locale];
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
    supabase.from("student_checklist_items").select("title,status,checklist_templates(key)").order("created_at"),
    supabase.from("documents").select("id,status"),
    supabase.from("program_recommendations").select("id,programs(name,universities(name))").eq("is_archived", false),
    supabase.from("applications").select("id,status,deadline,next_action,programs(name)").order("deadline", { ascending: true, nullsFirst: false }),
    supabase.from("student_projects").select("path").eq("student_id", user.id).maybeSingle(),
  ]);

  if (itemsError || documentsError || recommendationsError || applicationsError || projectError) {
    return <DashboardUnavailable copy={t} />;
  }

  const checklist = (items || []).map((item) => {
    const relation = Array.isArray(item.checklist_templates)
      ? item.checklist_templates[0]
      : item.checklist_templates;
    const localizedTemplate = relation?.key ? checklistCopy.recorded.items[relation.key] : undefined;
    return {
      ...item,
      title: localizedTemplate?.title || item.title,
    };
  });
  const studentDocuments = documents || [];
  const studentRecommendations = recommendations || [];
  const studentApplications = applications || [];
  const hasProjectGoal = Boolean(project?.path);

  const completed = checklist.filter((item) => item.status === "completed").length;
  const progression = checklist.length ? Math.round((completed / checklist.length) * 100) : 0;
  const actionableChecklist = checklist.filter((item) => ["waiting_student", "todo", "in_progress", "not_started"].includes(item.status));
  const waitingAlmaGo = checklist.filter((item) => item.status === "waiting_almago");
  const nextItem = actionableChecklist.find((item) => item.status === "waiting_student") || actionableChecklist[0];

  const approvedDocuments = studentDocuments.filter((document) => document.status === "approved").length;
  const documentsNeedingAction = studentDocuments.filter((document) => ["rejected", "replace_required"].includes(document.status)).length;

  const activeApplications = studentApplications.filter((application) => isActiveApplication(application.status));
  const nextApplication = nextActiveDeadline(activeApplications);
  const deadlineOverdue = nextApplication?.deadline ? isPastDeadline(nextApplication.deadline) : false;
  const actionableApplications = activeApplications.filter((application) => Boolean(application.next_action));
  const actionableApplication = actionableApplications[0];

  const studentActionCount = actionableChecklist.length + documentsNeedingAction + actionableApplications.length;
  const hasActionRequired = studentActionCount > 0;

  const nextAction = documentsNeedingAction
    ? {
        label: t.documentsAction,
        detail: t.documentsActionDetail(documentsNeedingAction),
        href: "/student/documents",
        owner: t.ownerStudent,
        cta: t.documentsAction,
      }
    : actionableApplication?.next_action
      ? {
          label: t.applicationAction,
          detail: actionableApplication.next_action,
          href: "/student/applications",
          owner: t.ownerStudent,
          cta: t.applicationAction,
        }
      : nextItem
        ? {
            label: nextItem.title,
            detail: t.checklistAction,
            href: "/student/checklist",
            owner: t.ownerStudent,
            cta: t.openStep,
          }
        : {
            label: t.stepsAction,
            detail: t.noPriorityDetail,
            href: "/student/checklist",
            owner: waitingAlmaGo.length ? t.ownerAlmaGo : t.ownerFile,
            cta: t.stepsAction,
          };

  const welcomeMessage = hasActionRequired
    ? t.actionCount(studentActionCount)
    : waitingAlmaGo.length
      ? t.waitingCount(waitingAlmaGo.length)
      : t.noPriority;

  const journeyStages: StudentJourneyStage[] = [
    {
      label: t.profileStage,
      detail: t.profileStageDetail,
      href: "/student/profile",
      tone: "done",
    },
    {
      label: t.documentsStage,
      detail: studentDocuments.length
        ? t.documentsCount(studentDocuments.length)
        : t.noDocuments,
      href: "/student/documents",
      tone: documentsNeedingAction ? "active" : studentDocuments.length ? "done" : "neutral",
    },
    {
      label: t.programmesStage,
      detail: studentRecommendations.length
        ? t.programmesCount(studentRecommendations.length)
        : t.noProgrammes,
      href: "/student/orientation",
      tone: studentRecommendations.length ? "active" : "neutral",
    },
    {
      label: t.preparationStage,
      detail: checklist.length ? t.stepsCount(completed, checklist.length) : t.noSteps,
      href: "/student/checklist",
      tone: checklist.length && completed === checklist.length ? "done" : checklist.length ? "active" : "neutral",
    },
    {
      label: t.applicationsStage,
      detail: studentApplications.length
        ? t.applicationsCount(studentApplications.length)
        : t.noApplications,
      href: "/student/applications",
      tone: activeApplications.length ? "active" : studentApplications.length ? "done" : "neutral",
    },
    {
      label: t.nextStage,
      detail: activeApplications.length ? t.nextStageActive : t.nextStageLater,
      href: "/student/pathway",
      tone: activeApplications.length ? "active" : "neutral",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <section className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_28px_70px_-58px_rgba(28,33,36,0.5)]">
        <div className="grid gap-6 bg-[linear-gradient(115deg,#1c2124_0%,#252b2f_65%,#332a22_100%)] px-5 py-6 text-white sm:px-7 sm:py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#fcb50a]">{t.heroEyebrow}</p>
            <h1 className="editorial-accent mt-2 text-[2rem] leading-[1.05] sm:text-[2.7rem]">
              {copy.shell.hello} <bdi dir="auto">{profile.first_name || t.studentFallback}</bdi>{locale === "ar" ? "،" : "."}
              <br />
              <span className="text-[#f7f4ec]">{t.heroLead}</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d9d3c7] sm:text-base sm:leading-7">
              {welcomeMessage}
            </p>
          </div>

          <div className={`grid gap-2 lg:min-w-[17rem] ${waitingAlmaGo.length ? "grid-cols-2" : "grid-cols-1"}`}>
            <StatusPill label={t.statusTodo} value={studentActionCount} tone={studentActionCount ? "warning" : "neutral"} />
            {waitingAlmaGo.length > 0 && <StatusPill label={t.statusTracked} value={waitingAlmaGo.length} tone="info" />}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
          <section className="student-split-border relative border-b border-[var(--border)] p-5 sm:p-6">
            <div aria-hidden="true" className="student-accent-edge absolute inset-y-5 w-1 bg-[var(--brand)]" />
            <div className="student-accent-content">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{t.nextActionEyebrow}</p>
                <Badge variant={hasActionRequired ? "warning" : waitingAlmaGo.length ? "info" : "neutral"}>
                  {hasActionRequired ? t.now : waitingAlmaGo.length ? t.tracking : t.upToDate}
                </Badge>
              </div>
              <h2 className="editorial-accent mt-3 text-[1.7rem] leading-[1.08] text-[var(--foreground)] sm:text-[2.15rem]">
                {hasActionRequired ? nextAction.label : t.fileUpToDate}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                {nextAction.detail}
              </p>

              <div className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 text-xs font-bold text-[var(--muted)]">
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${hasActionRequired ? "bg-[var(--accent)]" : "bg-[var(--brand)]"}`} />
                {nextAction.owner}
              </div>

              <div className="mt-5 [&_a]:w-full sm:[&_a]:w-auto">
                <ButtonLink href={nextAction.href}>{nextAction.cta || (hasActionRequired ? nextAction.label : t.stepsAction)}</ButtonLink>
              </div>
            </div>
          </section>

          <section className="bg-[var(--surface-subtle)] p-5 sm:p-6">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">{t.preparation}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
                  {checklist.length ? `${completed}/${checklist.length}` : "—"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">{t.completedSteps}</p>
              </div>
              {checklist.length > 0 && <span className="text-lg font-bold text-[var(--brand)]">{progression}%</span>}
            </div>

            {checklist.length > 0 && (
              <div className="mt-4">
                <ProgressBar value={progression} label={t.progressLabel} />
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              {t.progressBoundary}
            </p>

            <div className="mt-4 [&_a]:w-full">
              <ButtonLink href="/student/checklist" variant="secondary">{t.stepsAction}</ButtonLink>
            </div>
          </section>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-labelledby="overview-title">
        <h2 id="overview-title" className="sr-only">{t.overviewAria}</h2>
        <OverviewCard
          href="/student/documents"
          title={t.documentsCard}
          value={studentDocuments.length}
          detail={documentsNeedingAction ? t.documentsFix(documentsNeedingAction) : approvedDocuments ? t.documentsApproved(approvedDocuments) : t.documentsRecorded}
          tone={documentsNeedingAction ? "warning" : "neutral"}
          arrow={locale === "ar" ? "←" : "→"}
        />
        <OverviewCard
          href="/student/orientation"
          title={t.programmesCard}
          value={studentRecommendations.length}
          detail={t.programmesCompare}
          arrow={locale === "ar" ? "←" : "→"}
        />
        <OverviewCard
          href="/student/applications"
          title={t.applicationsCard}
          value={studentApplications.length}
          detail={activeApplications.length ? t.activeApplications(activeApplications.length) : t.applicationsRecorded}
          arrow={locale === "ar" ? "←" : "→"}
        />
        <OverviewCard
          href="/student/checklist"
          title={t.stepsCard}
          value={checklist.length}
          detail={checklist.length ? t.completedCount(completed) : t.stepsRecorded}
          arrow={locale === "ar" ? "←" : "→"}
        />
      </section>

      <StudentJourneyOverview stages={journeyStages} showProgressSummary={false} />

      <section className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <Card className="border-[var(--brand-border)] bg-[var(--brand-soft)]/55 shadow-none">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{t.germanyEyebrow}</p>
          <h2 className="editorial-accent mt-2 text-[1.55rem] leading-[1.1] text-[var(--foreground)]">
            {hasProjectGoal ? t.germanyReadyTitle : t.germanyTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {hasProjectGoal ? t.germanyReadyText : t.germanyText}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {hasProjectGoal ? (
              <>
                <ButtonLink href="/student/pathway">{t.pathwayCta}</ButtonLink>
                <ButtonLink href="/student/project" variant="secondary">{t.editProjectCta}</ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink href="/student/project">{t.projectCta}</ButtonLink>
                <ButtonLink href="/student/pathway" variant="secondary">{t.pathwayCta}</ButtonLink>
              </>
            )}
          </div>
        </Card>

        <Card className="shadow-none">
          <Badge variant={deadlineOverdue ? "warning" : "neutral"}>
            {deadlineOverdue ? t.deadlineOverdue : t.nextDeadline}
          </Badge>
          <h2 className="mt-3 text-xl font-bold text-[var(--foreground)]">
            {nextApplication?.deadline ? formatDeadline(nextApplication.deadline, locale) : t.noDeadline}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {nextApplication?.next_action || (nextApplication
              ? t.applicationFallback
              : t.noActiveDeadline)}
          </p>
          <div className="mt-5 [&_a]:w-full">
            <ButtonLink href="/student/applications" variant="secondary">{t.applicationsCta}</ButtonLink>
          </div>
        </Card>
      </section>

      <section className="mt-7 rounded-[1rem] border border-[var(--border)] bg-[#1c2124] px-5 py-5 text-white sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[#fcb50a]">{t.dossierEyebrow}</p>
            <h2 className="mt-2 text-lg font-bold sm:text-xl">{t.dossierTitle}</h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-[#d9d3c7] sm:text-sm sm:leading-6">
              {t.dossierText}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {t.dossierPills.map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#f7f4ec]">{item}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "info" | "neutral";
}) {
  const toneClass =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "info"
        ? "border-blue-200 bg-blue-50 text-blue-900"
        : "border-[var(--border)] bg-white text-slate-700";

  return (
    <div className={`inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border px-3.5 py-2 text-sm font-semibold ${toneClass}`}>
      <span className="text-lg font-bold">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function OverviewCard({
  href,
  title,
  value,
  detail,
  tone = "neutral",
  arrow = "→",
}: {
  href: string;
  title: string;
  value: number;
  detail: string;
  tone?: "warning" | "neutral";
  arrow?: string;
}) {
  return (
    <Link
      href={href}
      className="student-overview-card professional-hover group rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span
          aria-hidden="true"
          className={`student-overview-arrow grid h-9 w-9 place-items-center rounded-full text-sm transition-transform group-hover:translate-x-0.5 ${
            tone === "warning"
              ? "bg-amber-50 text-amber-800"
              : "bg-[var(--brand-soft)] text-[var(--brand)]"
          }`}
        >
          {arrow}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
    </Link>
  );
}

function DashboardUnavailable({ copy }: { copy: (typeof studentDashboardCopy)["fr"] }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader badge={copy.unavailableBadge} title={copy.dossierEyebrow} />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">{copy.unavailableTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.unavailableText}</p>
        </div>
        <div className="mt-5">
          <ButtonLink href="/student">{copy.retry}</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
