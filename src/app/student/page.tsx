import Link from "next/link";
import { StudentPageFrame } from "@/components/student/StudentPageFrame";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { StudentPageState } from "@/components/student/StudentPageState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AlmagoJourney } from "@/components/student/AlmagoJourney";
import { DossierHeader } from "@/components/product/DossierHeader";
import { JourneyRail, type JourneyRailStep } from "@/components/product/JourneyRail";
import { NextActionPanel } from "@/components/product/NextActionPanel";
import { ResponsibilityStrip } from "@/components/product/ResponsibilityStrip";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { buttonClassName } from "@/components/ui/Button";
import { buildAlmagoJourney } from "@/lib/student/almago-journey";
import { createClient } from "@/lib/supabase/server";
import { getRequestCopy } from "@/lib/i18n-server";
import { studentDashboardCopy } from "@/content/student-dashboard-copy";
import { studentDashboardCockpitCopy } from "@/content/student-dashboard-cockpit-copy";
import { studentChecklistCopy } from "@/content/student-checklist-copy";
import { studentApplicationsCopy } from "@/content/student-applications-copy";
import { almagoJourneyCopy } from "@/content/almago-journey-copy";
import { rebrandCopy } from "@/lib/brand";
import { normalizeApplicationStatus } from "@/lib/application-workflow";
import { formatDeadline, isActiveApplication, isPastDeadline } from "@/lib/phase4";
import { localizeApplicationStoredText, localizeCatalogueLabel } from "@/lib/student/arabic-display";

export const dynamic = "force-dynamic";

function firstRelation<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function daysUntilDeadline(value: string) {
  const target = new Date(`${value}T12:00:00Z`).getTime();
  return Math.ceil((target - Date.now()) / 86400000);
}

function compareDeadlineUrgency(a: string, b: string) {
  const aDays = daysUntilDeadline(a);
  const bDays = daysUntilDeadline(b);
  const aBucket = aDays < 0 ? 0 : 1;
  const bBucket = bDays < 0 ? 0 : 1;
  if (aBucket !== bBucket) return aBucket - bBucket;
  return Math.abs(aDays) - Math.abs(bDays);
}


const studentV2Copy = {
  fr: {
    space: "Espace Étudiant",
    active: "Étudiant actif",
    overview: "Vue d’ensemble du dossier",
    responsibility: "Qui fait quoi maintenant ?",
    you: "Vous",
    campus: "Campus Allemagne",
    official: "Organismes officiels",
    campusWorking: "Campus Allemagne poursuit les vérifications et la préparation des étapes qui ne nécessitent pas votre intervention.",
    officialBoundary: "Les décisions d’admission, de visa et les confirmations officielles restent du ressort des organismes compétents.",
    detailedJourney: "Voir le détail du parcours",
    detailedJourneyHint: "Ouvrez cette vue seulement si vous souhaitez consulter les huit étapes historiques du dossier.",
    procedure: "Ouvrir ma procédure",
  },
  ar: {
    space: "مساحة الطالب",
    active: "حساب الطالب مفعّل",
    overview: "نظرة عامة على الملف",
    responsibility: "من يقوم بماذا الآن؟",
    you: "أنت",
    campus: "Campus Allemagne",
    official: "الجهات الرسمية",
    campusWorking: "تواصل Campus Allemagne التحقق من الملف وتحضير الخطوات التي لا تتطلب تدخلك.",
    officialBoundary: "تبقى قرارات القبول والتأشيرة والتأكيدات الرسمية من اختصاص الجهات المختصة.",
    detailedJourney: "عرض تفاصيل المسار",
    detailedJourneyHint: "افتح هذه النظرة فقط إذا أردت الاطلاع على المراحل التاريخية الثماني للملف.",
    procedure: "فتح إجراءاتي",
  },
  en: {
    space: "Student space",
    active: "Student active",
    overview: "Dossier overview",
    responsibility: "Who is doing what now?",
    you: "You",
    campus: "Campus Allemagne",
    official: "Official organisations",
    campusWorking: "Campus Allemagne continues the checks and preparation that do not require your intervention.",
    officialBoundary: "Admission, visa and other official decisions remain with the competent organisations.",
    detailedJourney: "View detailed journey",
    detailedJourneyHint: "Open this view only if you want to inspect the eight historical stages of the dossier.",
    procedure: "Open my procedure",
  },
  de: {
    space: "Studierendenbereich",
    active: "Studierendenzugang aktiv",
    overview: "Dossier-Übersicht",
    responsibility: "Wer macht jetzt was?",
    you: "Sie",
    campus: "Campus Allemagne",
    official: "Offizielle Stellen",
    campusWorking: "Campus Allemagne führt die Prüfungen und Vorbereitungen fort, für die Ihre Mitwirkung nicht erforderlich ist.",
    officialBoundary: "Zulassung, Visum und andere offizielle Entscheidungen liegen bei den zuständigen Stellen.",
    detailedJourney: "Detaillierten Weg anzeigen",
    detailedJourneyHint: "Öffnen Sie diese Ansicht nur, wenn Sie die acht historischen Dossier-Schritte sehen möchten.",
    procedure: "Mein Verfahren öffnen",
  },
} as const;

export default async function StudentEntry() {
  const { locale, copy } = await getRequestCopy();
  const t = rebrandCopy(studentDashboardCopy[locale]);
  const cockpit = rebrandCopy(studentDashboardCockpitCopy[locale]);
  const checklistCopy = rebrandCopy(studentChecklistCopy[locale]);
  const applicationsCopy = rebrandCopy(studentApplicationsCopy[locale].panel);
  const journeyCopy = almagoJourneyCopy[locale];
  const v2 = studentV2Copy[locale];
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
      templateKey: relation?.key || null,
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
  const urgentApplication = actionableApplications
    .filter((application) => application.deadline && daysUntilDeadline(application.deadline) <= 14)
    .sort((a, b) => compareDeadlineUrgency(a.deadline as string, b.deadline as string))[0];
  const urgentChecklistItem = actionableChecklist
    .filter((item) => item.due_date && daysUntilDeadline(item.due_date) <= 14)
    .sort((a, b) => compareDeadlineUrgency(a.due_date as string, b.due_date as string))[0];

  const applicationsMissingDocuments = activeApplications.filter(
    (application) => normalizeApplicationStatus(application.status) === "documents_missing",
  ).length;

  const studentActionCount = actionableChecklist.length + documentsNeedingAction + actionableApplications.length;
  const hasActionRequired = studentActionCount > 0;

  const almagoJourney = buildAlmagoJourney({
    projectDefined: Boolean(project?.path || project?.target_degree || project?.target_field || project?.target_intake),
    profileCompleted: Boolean(profile.onboarding_completed),
    documentsNeedingAction,
    documentChecklistOpen,
    savedProgrammes: studentRecommendations.length,
    applicationStatuses: studentApplications.map((application) => application.status),
    applicationsMissingDocuments,
    applicationNextActions: actionableApplications.length,
    germanyPreparationStatus: checklistStatusByKey.get("germany_preparation") || null,
  });


  const v2JourneySteps: JourneyRailStep[] = almagoJourney.steps.map((step) => ({
    label: journeyCopy.steps[step.key],
    detail: journeyCopy.statuses[step.status],
    status:
      step.status === "completed"
        ? "done"
        : step.status === "current"
          ? "active"
          : step.status === "blocked"
            ? "locked"
            : "upcoming",
    href: step.status === "blocked" ? undefined : step.href,
  }));

  const nextAction = urgentApplication?.next_action
    ? {
        label: t.applicationAction,
        detail: localizeApplicationStoredText(locale, urgentApplication.next_action),
        reason: cockpit.urgentDeadlineReason,
        duration: cockpit.durationApplication,
        href: "/student/applications",
      }
    : urgentChecklistItem
      ? {
          label: urgentChecklistItem.title,
          detail: t.checklistAction,
          reason: cockpit.urgentDeadlineReason,
          duration: cockpit.durationChecklist,
          href: ["passport", "translation"].includes(urgentChecklistItem.templateKey || "")
            ? "/student/documents"
            : "/student/checklist",
        }
      : documentsNeedingAction
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
                href: ["passport", "translation"].includes(nextItem.templateKey || "")
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

  const allImportantDeadlines = [
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
  ].sort((a, b) => compareDeadlineUrgency(a.date, b.date));

  const importantDeadlines = allImportantDeadlines.slice(0, 3);
  const overdueDeadlineCount = allImportantDeadlines.filter((deadline) => isPastDeadline(deadline.date)).length;
  const dueSoonDeadlineCount = allImportantDeadlines.filter((deadline) => {
    const days = daysUntilDeadline(deadline.date);
    return days >= 0 && days <= 14;
  }).length;

  const allMissingRequiredDocuments = [...new Set(
    activeApplications
      .filter((application) => normalizeApplicationStatus(application.status) === "documents_missing")
      .flatMap((application) =>
        Array.isArray(application.required_documents)
          ? application.required_documents.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
          : [],
      ),
  )];

  const allDocumentsToFix = studentDocuments
    .filter((document) => ["rejected", "replace_required"].includes(document.status));

  const missingRequiredDocuments = allMissingRequiredDocuments.slice(0, 4);
  const documentsToFix = allDocumentsToFix.slice(0, 4);
  const documentAttentionCount = allMissingRequiredDocuments.length + allDocumentsToFix.length;

  const attentionItems = [
    overdueDeadlineCount
      ? { label: cockpit.overdueDeadlines, value: overdueDeadlineCount, href: "/student/calendar", tone: "error" as const }
      : null,
    dueSoonDeadlineCount
      ? { label: cockpit.dueSoonDeadlines, value: dueSoonDeadlineCount, href: "/student/calendar", tone: "warning" as const }
      : null,
    documentAttentionCount
      ? { label: cockpit.documentsAttention, value: documentAttentionCount, href: "/student/documents", tone: "warning" as const }
      : null,
    applicationsMissingDocuments
      ? { label: cockpit.blockedApplications, value: applicationsMissingDocuments, href: "/student/applications", tone: "error" as const }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

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
    <StudentPageFrame className="space-y-7">
      <DossierHeader
        eyebrow={v2.space}
        title={<>{cockpit.greeting} <bdi dir="auto">{profile.first_name || t.studentFallback}</bdi></>}
        description={<><span className="font-semibold text-[var(--foreground-soft)]">{cockpit.projectLabel} :</span>{" "}<bdi dir="auto">{projectSummary}</bdi></>}
        status={hasActionRequired ? t.now : waitingAlmaGo.length ? t.tracking : v2.active}
        statusVariant={hasActionRequired ? "warning" : waitingAlmaGo.length ? "info" : "success"}
        facts={[
          {
            label: cockpit.progressEyebrow,
            value: checklist.length ? (
              <div className="min-w-[11rem]">
                <div className="flex items-baseline justify-between gap-3">
                  <strong className="text-xl font-semibold text-white">{progression}%</strong>
                  <span className="text-[10px] font-medium leading-4 text-white/55">
                    {cockpit.progressMeta(completed, checklist.length)}
                  </span>
                </div>
                <div className="mt-2 [&>div]:h-1.5 [&>div]:bg-white/15">
                  <ProgressBar value={progression} label={t.progressLabel} />
                </div>
              </div>
            ) : "—",
          },
          { label: cockpit.programmesTitle, value: studentRecommendations.length },
          { label: cockpit.deadlinesTitle, value: allImportantDeadlines.length },
          { label: cockpit.documentsTitle, value: documentAttentionCount },
        ]}
        actions={
          <>
            <Link
              href="/student/procedure"
              className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
            >
              {v2.procedure}
            </Link>
            <Link
              href="/student/pathway"
              className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-white/20 bg-white/[.06] px-4 text-sm font-semibold text-white transition hover:bg-white/[.1]"
            >
              {t.pathwayCta}
            </Link>
          </>
        }
      />

      <NextActionPanel
        eyebrow={t.nextActionEyebrow}
        title={nextAction.label}
        description={nextAction.detail}
        metadata={<>{cockpit.nextActionReason}: {nextAction.reason} · {cockpit.duration}: {nextAction.duration}</>}
        waiting={!hasActionRequired}
        action={
          hasActionRequired ? (
            <ButtonLink href={nextAction.href}>{cockpit.continue}</ButtonLink>
          ) : undefined
        }
      />

      {attentionItems.length ? (
        <section
          className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
          aria-labelledby="dashboard-attention-title"
          data-dashboard-attention
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
                {cockpit.attentionEyebrow}
              </p>
              <h2 id="dashboard-attention-title" className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[var(--foreground)]">
                {cockpit.attentionTitle}
              </h2>
            </div>
            <p className="max-w-xl text-xs leading-5 text-[var(--muted)]">{cockpit.attentionDescription}</p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {attentionItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex min-h-16 items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3.5 py-3 transition hover:border-[var(--brand-border)]"
              >
                <span className="text-sm font-semibold leading-5 text-[var(--foreground-soft)]">{item.label}</span>
                <Badge variant={item.tone}>{item.value}</Badge>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <PremiumSectionHeader
          eyebrow={cockpit.progressEyebrow}
          title={journeyCopy.title}
          description={t.progressBoundary}
        />
        <JourneyRail steps={v2JourneySteps} ariaLabel={journeyCopy.title} />
      </section>

      <section
        className="pc-panel grid overflow-hidden sm:grid-cols-3"
        aria-label={t.overviewAria}
        data-dashboard-metrics
      >
        <DashboardMetric
          value={studentRecommendations.length}
          label={cockpit.programmesTitle}
          href="/student/orientation"
        />
        <DashboardMetric
          value={allImportantDeadlines.length}
          label={cockpit.deadlinesTitle}
          href="/student/applications"
        />
        <DashboardMetric
          value={documentAttentionCount}
          label={cockpit.documentsTitle}
          href="/student/documents"
        />
      </section>

      <section className="mt-8" aria-labelledby="deadlines-title">
        <PremiumSectionHeader
          title={<span id="deadlines-title">{cockpit.deadlinesTitle}</span>}
          actions={
            <Link href="/student/applications" className={buttonClassName("ghost", "min-h-9 px-3 py-1.5 text-xs")}>
              {cockpit.viewAll}
            </Link>
          }
        />

        {importantDeadlines.length ? (
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {importantDeadlines.map((deadline) => {
              const overdue = isPastDeadline(deadline.date);
              const days = daysUntilDeadline(deadline.date);
              const dueSoon = !overdue && days <= 14;
              return (
                <Link key={`${deadline.type}-${deadline.date}-${deadline.label}`} href={deadline.href} className="grid gap-2 py-5 transition-colors hover:bg-[var(--surface-subtle)] sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center sm:px-2">
                  <time className={`text-sm font-bold ${overdue ? "text-[var(--danger)]" : dueSoon ? "text-[var(--warning-strong)]" : "text-[var(--foreground)]"}`}>
                    {formatDeadline(deadline.date, locale)}
                  </time>
                  <span className="min-w-0 truncate text-sm font-semibold text-[var(--foreground-soft)]" dir="auto">
                    {deadline.label}
                  </span>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="text-[11px] font-semibold text-[var(--muted)]">{deadline.type}</span>
                    <Badge variant={overdue ? "error" : dueSoon ? "warning" : "neutral"}>
                      {overdue ? cockpit.overdue : dueSoon ? cockpit.dueSoon : cockpit.upcoming}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <PremiumEmptyState title={cockpit.deadlinesEmpty} compact />
          </div>
        )}
      </section>

      <section className="mt-8 grid items-start gap-4 xl:grid-cols-[1.2fr_1fr_1fr]" aria-label={t.overviewAria}>
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

      <section className="mt-8 border-t border-[var(--premium-border)] pt-7" aria-labelledby="activity-title">
        <PremiumSectionHeader
          title={<span id="activity-title">{cockpit.activityTitle}</span>}
          actions={
            approvedDocuments ? (
              <span className="rounded-full bg-[var(--premium-cream)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)]">
                {t.documentsApproved(approvedDocuments)}
              </span>
            ) : undefined
          }
        />

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
          <div className="mt-4"><PremiumEmptyState title={cockpit.activityEmpty} compact /></div>
        )}
      </section>

      <section className="mt-8 space-y-4 border-t border-[var(--premium-border)] pt-7">
        <ResponsibilityStrip
          title={v2.responsibility}
          items={[
            {
              label: v2.you,
              detail: hasActionRequired ? nextAction.label : t.upToDate,
              tone: "user",
            },
            {
              label: v2.campus,
              detail: waitingAlmaGo.length ? v2.campusWorking : cockpit.noActionReason,
              tone: "campus",
            },
            {
              label: v2.official,
              detail: v2.officialBoundary,
              tone: "external",
            },
          ]}
        />

        <details className="pc-panel">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-[var(--foreground)]">
            {v2.detailedJourney}
            <span className="mt-1 block text-xs font-normal leading-5 text-[var(--muted)]">{v2.detailedJourneyHint}</span>
          </summary>
          <div className="border-t border-[var(--premium-border)] p-4 sm:p-5">
            <AlmagoJourney
              model={almagoJourney}
              nextAction={{ label: nextAction.label, detail: nextAction.detail, href: nextAction.href }}
            />
          </div>
        </details>
      </section>

    </StudentPageFrame>
  );
}

function DashboardMetric({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-24 items-end justify-between gap-4 border-b border-[var(--premium-border)] px-4 py-4 transition-colors hover:bg-[var(--premium-cream-soft)] sm:border-b-0 sm:border-e sm:px-5 sm:last:border-e-0"
    >
      <span>
        <strong className="block text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-[-0.05em] text-[var(--foreground)]">
          {value}
        </strong>
        <span className="mt-2 block text-xs font-bold uppercase tracking-[0.11em] text-[var(--muted)]">
          {label}
        </span>
      </span>
      <span className="pb-1 text-lg font-semibold text-[var(--brand)] transition-transform group-hover:translate-x-1" aria-hidden="true">
        →
      </span>
    </Link>
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
    <section className="pc-card min-w-0 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
        <Link href={href} className={buttonClassName("ghost", "min-h-8 px-2.5 py-1 text-xs")}>{cta}</Link>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="pc-soft-strip border-dashed px-3 py-5 text-sm leading-6 text-[var(--muted)]">
      {children}
    </p>
  );
}

function DashboardUnavailable({ copy }: { copy: (typeof studentDashboardCopy)["fr"] }) {
  return (
    <StudentPageFrame>
      <DossierHeader
        eyebrow={copy.unavailableBadge}
        title={copy.dossierEyebrow}
        status={copy.unavailableTitle}
        statusVariant="warning"
      />
      <div className="mt-7">
        <StudentPageState
          variant="warning"
          title={copy.unavailableTitle}
          description={copy.unavailableText}
          actions={<ButtonLink href="/student">{copy.retry}</ButtonLink>}
        />
      </div>
    </StudentPageFrame>
  );
}
