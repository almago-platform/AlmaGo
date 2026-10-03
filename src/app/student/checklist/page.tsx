import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import { AlmagoJourney } from "@/components/student/AlmagoJourney";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/server";
import { summarizeAcademicEvidence, type AcademicEvidenceRecord } from "@/lib/academic-evidence";
import { buildGermanyChecklist, type GermanyChecklistItem } from "@/lib/germany-checklist";
import { determineRegulatoryPath } from "@/lib/regulatory-path-engine";
import { getRequestLocale } from "@/lib/i18n-server";
import { studentChecklistCopy } from "@/content/student-checklist-copy";
import { rebrandCopy } from "@/lib/brand";
import { buildAlmagoJourney } from "@/lib/student/almago-journey";
import { normalizeApplicationStatus } from "@/lib/application-workflow";

const badgeVariants = {
  completed: "success",
  waiting_student: "warning",
  waiting_almago: "info",
  todo: "neutral",
  in_progress: "info",
  not_started: "neutral",
} as const;

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const locale = await getRequestLocale();
  const t = rebrandCopy(studentChecklistCopy[locale]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return <ChecklistUnavailable copy={t} />;
  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  const now = new Date();
  const [
    itemsResult,
    projectResult,
    documentsResult,
    evidenceResult,
    selectionResult,
    recommendationsResult,
    applicationsResult,
  ] = await Promise.all([
    supabase
      .from("student_checklist_items")
      .select("id,title,description,status,completed_at,checklist_templates(key,category,sort_order)")
      .order("created_at"),
    supabase
      .from("student_projects")
      .select("path")
      .eq("student_id", user.id)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("id,status")
      .eq("student_id", user.id),
    supabase
      .from("academic_evidence")
      .select("evidence_type,institution,evidence_date,origin,verification_status,document_id,verified_at")
      .eq("student_id", user.id),
    supabase
      .from("student_language_course_selections")
      .select("language_course_id")
      .eq("student_id", user.id)
      .maybeSingle(),
    supabase
      .from("program_recommendations")
      .select("id")
      .eq("student_id", user.id)
      .eq("is_archived", false),
    supabase
      .from("applications")
      .select("status,next_action,required_documents")
      .eq("student_id", user.id),
  ]);

  if (
    itemsResult.error
    || projectResult.error
    || documentsResult.error
    || evidenceResult.error
    || selectionResult.error
    || recommendationsResult.error
    || applicationsResult.error
  ) return <ChecklistUnavailable copy={t} />;

  let selectedCourse: {
    id: string;
    title: string;
    provider_name: string;
    language: string;
    purpose: "study_preparation" | "standalone_language";
    source_url: string | null;
    application_url: string | null;
    verified_at: string | null;
    is_active: boolean;
  } | null = null;

  if (selectionResult.data?.language_course_id) {
    const { data, error } = await supabase
      .from("language_courses")
      .select("id,title,provider_name,language,purpose,source_url,application_url,verified_at,is_active")
      .eq("id", selectionResult.data.language_course_id)
      .maybeSingle();
    if (error) return <ChecklistUnavailable copy={t} />;
    selectedCourse = data
      ? {
          id: data.id,
          title: data.title,
          provider_name: data.provider_name,
          language: data.language,
          purpose: data.purpose as "study_preparation" | "standalone_language",
          source_url: data.source_url,
          application_url: data.application_url,
          verified_at: data.verified_at,
          is_active: data.is_active,
        }
      : null;
  }

  const documentStatusById = new Map(
    (documentsResult.data || []).map((document) => [document.id, document.status]),
  );
  const evidence = (evidenceResult.data || []).map((item) => ({
    type: item.evidence_type,
    institution: item.institution,
    evidence_date: item.evidence_date,
    origin: item.origin,
    verification_status: item.verification_status,
    document_id: item.document_id,
    document_status: item.document_id
      ? documentStatusById.get(item.document_id) || null
      : null,
    verified_at: item.verified_at,
  })) as AcademicEvidenceRecord[];
  const evidenceSummary = summarizeAcademicEvidence(evidence, now);

  // Student RLS on language_courses exposes only active, currently verified,
  // source-valid catalogue rows. A stale/non-publishable selected course therefore
  // resolves to null here and fails closed.
  const hasPublishableStudyPreparationCourse =
    selectedCourse?.purpose === "study_preparation";
  const hasPublishableStandaloneLanguageCourse =
    selectedCourse?.purpose === "standalone_language";

  const regulatoryDecision = determineRegulatoryPath({
    project_path: projectResult.data?.path || null,
    accepted_definitive_admission: evidenceSummary.accepted_definitive_admission,
    accepted_preparatory_basis: evidenceSummary.accepted_preparatory_basis,
    has_publishable_study_preparation_course: hasPublishableStudyPreparationCourse,
    has_pending_academic_review: evidenceSummary.has_pending_review,
    has_replacement_required: evidenceSummary.has_replacement_required,
  });

  const personalizedItems = buildGermanyChecklist({
    project_path: projectResult.data?.path || null,
    decision: regulatoryDecision,
    accepted_definitive_admission: evidenceSummary.accepted_definitive_admission,
    accepted_preparatory_basis: evidenceSummary.accepted_preparatory_basis,
    has_publishable_study_preparation_course: hasPublishableStudyPreparationCourse,
    has_publishable_standalone_language_course: hasPublishableStandaloneLanguageCourse,
    has_pending_academic_review: evidenceSummary.has_pending_review,
    has_replacement_required: evidenceSummary.has_replacement_required,
  });

  const checklistItems = (itemsResult.data || [])
    .map((item) => {
      const relation = Array.isArray(item.checklist_templates)
        ? item.checklist_templates[0]
        : item.checklist_templates;
      const templateKey = relation?.key || null;
      const localizedTemplate = templateKey ? t.recorded.items[templateKey] : undefined;
      const categoryKey = relation?.category || "Autre";
      return {
        ...item,
        localizedTitle: localizedTemplate?.title || item.title,
        localizedDescription: localizedTemplate?.description || item.description,
        localizedCategory:
          t.recorded.categories[categoryKey]
          || (categoryKey === "Autre" ? t.recorded.otherCategory : categoryKey),
        sortOrder: relation?.sort_order ?? 9999,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const completedCount = checklistItems.filter((item) => item.status === "completed").length;
  const progression = checklistItems.length ? Math.round((completedCount / checklistItems.length) * 100) : 0;
  const actionableItems = checklistItems.filter((item) =>
    ["waiting_student", "todo", "in_progress", "not_started"].includes(item.status),
  );
  const waitingAlmaGoCount = checklistItems.filter((item) => item.status === "waiting_almago").length;
  const nextItem =
    actionableItems.find((item) => item.status === "waiting_student") ||
    actionableItems[0];

  const checklistStatusByKey = new Map(
    checklistItems.flatMap((item) => {
      const relation = Array.isArray(item.checklist_templates)
        ? item.checklist_templates[0]
        : item.checklist_templates;
      return relation?.key ? [[relation.key, item.status] as const] : [];
    }),
  );
  const documentChecklistOpen = checklistItems.filter((item) => {
    const relation = Array.isArray(item.checklist_templates)
      ? item.checklist_templates[0]
      : item.checklist_templates;
    return ["passport", "translation"].includes(relation?.key || "") && item.status !== "completed";
  }).length;
  const documentsNeedingAction = (documentsResult.data || []).filter((document) =>
    ["rejected", "replace_required"].includes(document.status),
  ).length;
  const applications = applicationsResult.data || [];
  const applicationNextActions = applications.filter((application) => Boolean(application.next_action)).length;
  const applicationsMissingDocuments = applications.filter(
    (application) => normalizeApplicationStatus(application.status) === "documents_missing",
  ).length;

  const almagoJourney = buildAlmagoJourney({
    projectDefined: Boolean(projectResult.data?.path),
    profileCompleted: Boolean(profile.onboarding_completed),
    documentsNeedingAction,
    documentChecklistOpen,
    savedProgrammes: (recommendationsResult.data || []).length,
    applicationStatuses: applications.map((application) => application.status),
    applicationsMissingDocuments,
    applicationNextActions,
    germanyPreparationStatus: checklistStatusByKey.get("germany_preparation") || null,
  });

  const groups = new Map<string, (typeof checklistItems)[number][]>();
  for (const item of checklistItems) {
    groups.set(item.localizedCategory, [...(groups.get(item.localizedCategory) || []), item]);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader
        current="checklist"
        eyebrow={t.page.eyebrow}
        title={t.page.title}
        description={t.page.description}
        actions={<ButtonLink href="/student/documents" variant="secondary">{t.page.documents}</ButtonLink>}
      />

      <div className="mb-8">
        <AlmagoJourney
          model={almagoJourney}
          nextAction={nextItem ? { label: nextItem.localizedTitle, detail: nextItem.localizedDescription || undefined, href: "/student/checklist" } : undefined}
          variant="compact"
        />
      </div>

      <section className="mb-8" aria-labelledby="germany-plan-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{t.page.planEyebrow}</p>
          <h2 id="germany-plan-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            {t.page.planTitle}
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            {t.page.planDescription}
          </p>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
          {personalizedItems.map((item) => (
            <PersonalizedChecklistCard key={item.key} item={item} copy={t} />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card aria-labelledby="checklist-progress-title" className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-none">
          <div aria-hidden="true" className="student-accent-edge absolute inset-y-0 w-1 bg-[var(--brand)]" />
          <div className="student-accent-content student-accent-content-wide">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{t.page.progressEyebrow}</p>
                <h2 id="checklist-progress-title" className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">{t.page.progressTitle}</h2>
              </div>
              <Badge variant={checklistItems.length > 0 && progression === 100 ? "success" : "info"}>
                {checklistItems.length ? t.page.completedBadge(completedCount, checklistItems.length) : t.page.noStep}
              </Badge>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-end justify-between gap-4">
                <p className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl"><bdi dir="ltr">{checklistItems.length ? `${progression}%` : "—"}</bdi></p>
                <p className="max-w-xs text-end text-sm leading-6 text-slate-600">{t.page.recordedSteps}</p>
              </div>
              {checklistItems.length > 0 && <ProgressBar value={progression} label={t.page.progressLabel} />}
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              {t.page.progressBoundary}
            </p>
          </div>
        </Card>

        <Card aria-labelledby="checklist-next-action-title" className={nextItem ? "border-amber-200 bg-amber-50/25 shadow-none" : "shadow-none"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant={nextItem ? "warning" : waitingAlmaGoCount ? "info" : "neutral"}>
              {nextItem ? t.page.doNow : waitingAlmaGoCount ? t.page.tracking : t.page.noAction}
            </Badge>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
              {nextItem ? t.page.ownerStudent : waitingAlmaGoCount ? t.page.ownerAlmaGo : t.page.file}
            </span>
          </div>
          {nextItem ? (
            <>
              <h2 id="checklist-next-action-title" dir="auto" className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950">{nextItem.localizedTitle}</h2>
              {nextItem.localizedDescription && <p dir="auto" className="mt-3 text-sm leading-6 text-slate-700">{nextItem.localizedDescription}</p>}
              <div className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-900">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                {t.statusLabels[nextItem.status] || t.page.ownerStudent}
              </div>
            </>
          ) : (
            <>
              <h2 id="checklist-next-action-title" className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                {waitingAlmaGoCount ? t.page.nothingNow : t.page.nothingRequested}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {waitingAlmaGoCount
                  ? t.page.waitingText
                  : t.page.noActionText}
              </p>
            </>
          )}
        </Card>
      </div>

      <section aria-label={t.page.summaryAria} className="mt-5 grid gap-4 sm:grid-cols-3">
        <SummaryCard title={t.page.todo} value={actionableItems.length} badge={actionableItems.length ? t.page.todoBadge : t.page.nothingBadge} tone={actionableItems.length ? "warning" : "success"} />
        <SummaryCard title={t.page.tracked} value={waitingAlmaGoCount} badge={waitingAlmaGoCount ? t.page.inProgress : t.page.noStep} tone="info" />
        <SummaryCard title={t.page.completed} value={completedCount} badge={t.page.completedSteps} tone="success" />
      </section>

      {checklistItems.length === 0 ? (
        <Card aria-labelledby="checklist-empty-title" className="mt-6 border-dashed bg-white/70 py-9 text-center">
          <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">✓</span>
          <h2 id="checklist-empty-title" className="mt-4 text-lg font-bold text-slate-950">{t.page.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            {t.page.emptyText}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <ButtonLink href="/student">{t.page.back}</ButtonLink>
            <ButtonLink href="/student/documents" variant="secondary">{t.page.documents}</ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {[...groups.entries()].map(([category, group]) => {
            const categoryId = `category-${category.replace(/\s+/g, "-").toLowerCase()}`;
            const groupCompleted = group.filter((item) => item.status === "completed").length;
            return (
              <section key={category} aria-labelledby={categoryId}>
                <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border)] pb-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{t.page.categoryEyebrow}</p>
                    <h2 id={categoryId} dir="auto" className="mt-1 text-xl font-bold tracking-[-0.02em] text-slate-950">{category}</h2>
                  </div>
                  <Badge variant={groupCompleted === group.length ? "success" : "neutral"}>{t.page.groupDone(groupCompleted, group.length)}</Badge>
                </div>
                <div className="space-y-3">
                  {group.map((item) => (
                    <Card as="article" key={item.id} aria-labelledby={`checklist-item-title-${item.id}`} className={item.status === "waiting_student" || item.status === "todo" || item.status === "not_started" ? "border-amber-200 bg-amber-50/25 shadow-none" : item.status === "waiting_almago" ? "border-blue-200 bg-blue-50/20 shadow-none" : "shadow-none"}>
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={badgeVariants[item.status as keyof typeof badgeVariants] || "neutral"}>
                              {t.statusLabels[item.status] || item.status}
                            </Badge>
                            {["waiting_student", "todo", "not_started"].includes(item.status) && <span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">{t.page.responsibleStudent}</span>}
                            {item.status === "waiting_almago" && <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">{t.page.responsibleAlmaGo}</span>}
                          </div>
                          <h3 id={`checklist-item-title-${item.id}`} dir="auto" className="mt-3 font-bold text-slate-950">{item.localizedTitle}</h3>
                          {item.localizedDescription && <p dir="auto" className="mt-1 text-sm leading-6 text-slate-600">{item.localizedDescription}</p>}
                          {item.completed_at && (
                            <p className="mt-3 text-xs text-slate-500">
                              {t.page.completedOn}{" "}
                              <time dateTime={item.completed_at}>
                                <bdi dir="auto">{new Intl.DateTimeFormat(t.page.intlLocale, { dateStyle: "medium" }).format(new Date(item.completed_at))}</bdi>
                              </time>
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

function SummaryCard({ title, value, badge, tone }: { title: string; value: number; badge: string; tone: "success" | "info" | "warning" | "neutral" }) {
  return (
    <Card as="article" className="shadow-none">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}

function ChecklistUnavailable({ copy }: { copy: (typeof studentChecklistCopy)["fr"] }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader current="checklist" eyebrow={copy.page.eyebrow} title={copy.page.title} />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">{copy.page.unavailableTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.page.unavailableText}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/student/checklist">{copy.page.retry}</ButtonLink>
          <ButtonLink href="/student" variant="secondary">{copy.page.back}</ButtonLink>
        </div>
      </Card>
    </main>
  );
}

function PersonalizedChecklistCard({
  item,
  copy,
}: {
  item: GermanyChecklistItem;
  copy: (typeof studentChecklistCopy)["fr"];
}) {
  const variant =
    item.status === "completed"
      ? "success"
      : item.status === "waiting_almago"
        ? "info"
        : "warning";
  const localized = copy.personalized.items[item.key];
  const statusLabel = copy.statusLabels[item.status] || item.status;

  return (
    <article className="grid gap-4 p-5 sm:grid-cols-[9rem_minmax(12rem,0.7fr)_minmax(0,1.3fr)] sm:items-start sm:p-6">
      <div>
        <Badge variant={variant}>{statusLabel}</Badge>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {copy.personalized.owner}: {item.owner === "student" ? copy.personalized.you : copy.personalized.almago}
        </p>
      </div>
      <h3 className="text-base font-bold text-slate-950">{localized?.title || item.title}</h3>
      <p className="text-sm leading-6 text-slate-600">{localized?.explanation || item.explanation}</p>
    </article>
  );
}
