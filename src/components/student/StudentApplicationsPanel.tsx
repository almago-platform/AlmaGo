"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentApplicationsCopy } from "@/content/student-applications-copy";
import {
  isSubmittedApplicationStatus,
  normalizeApplicationStatus,
} from "@/lib/application-workflow";
import { formatDeadline, isActiveApplication } from "@/lib/phase4";
import { evaluateCampusApplicationDeadline } from "@/lib/student/procedure-deadline";
import { localizeApplicationStoredText, localizeCatalogueLabel } from "@/lib/student/arabic-display";

function applicationVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "admission" || status === "accepted") return "success";
  if (["documents_missing", "interested", "rejection", "rejected"].includes(status)) return "warning";
  if (["preparing", "ready_to_submit", "submitted", "waiting_university", "in_review"].includes(status)) return "info";
  return "neutral";
}

function firstProgram(application: any) {
  return Array.isArray(application?.programs) ? application.programs[0] : application?.programs;
}

function firstUniversity(program: any) {
  return Array.isArray(program?.universities) ? program.universities[0] : program?.universities;
}

function localizedApplicationStatus(
  status: string,
  copy: (typeof studentApplicationsCopy)["fr"]["panel"],
) {
  const normalized = normalizeApplicationStatus(status);
  return copy.statusLabels[status] || (normalized ? copy.statusLabels[normalized] : undefined) || copy.statusLabels.other;
}

function localizedApplicationStage(
  status: string,
  copy: (typeof studentApplicationsCopy)["fr"]["panel"],
) {
  const normalized = normalizeApplicationStatus(status);
  return (normalized ? copy.stageLabels[normalized] : undefined) || copy.stageLabels.other;
}


function studentEventLabel(
  eventType: string,
  copy: (typeof studentApplicationsCopy)["fr"]["panel"],
) {
  if (eventType === "application_status_changed") return copy.eventStatusChanged;
  return copy.eventUpdate;
}

function ApplicationStepper({
  status,
  copy,
  direction,
}: {
  status: string;
  copy: (typeof studentApplicationsCopy)["fr"]["panel"];
  direction: "ltr" | "rtl";
}) {
  const normalizedStatus = normalizeApplicationStatus(status);
  
  if (normalizedStatus === "withdrawn") {
    return (
      <div className="mt-4 mb-2 rounded-[var(--radius-control)] bg-slate-100/60 border border-slate-200/80 p-3 text-xs text-slate-600 flex items-center justify-between">
        <span className="font-medium text-slate-700">{copy.withdrawnText}</span>
        <Badge variant="neutral">{copy.withdrawnBadge}</Badge>
      </div>
    );
  }

  const stages = [
    { label: copy.stepper[0], active: true },
    { label: copy.stepper[1], active: ["preparing", "documents_missing"].includes(normalizedStatus || "") },
    { label: copy.stepper[2], active: normalizedStatus === "ready_to_submit" },
    { label: copy.stepper[3], active: ["submitted", "waiting_university"].includes(normalizedStatus || "") },
    { label: copy.stepper[4], active: ["admission", "rejection"].includes(normalizedStatus || "") },
  ];

  // Let's determine the current index
  let currentIndex = 0;
  if (["preparing", "documents_missing"].includes(normalizedStatus || "")) currentIndex = 1;
  else if (normalizedStatus === "ready_to_submit") currentIndex = 2;
  else if (["submitted", "waiting_university"].includes(normalizedStatus || "")) currentIndex = 3;
  else if (["admission", "rejection"].includes(normalizedStatus || "")) currentIndex = 4;

  return (
    <div className="mt-5 mb-2" aria-hidden="true">
      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-100" />
        {/* Active line */}
        <div 
          className={`absolute top-1/2 h-0.5 -translate-y-1/2 bg-[var(--brand)] transition-all duration-300 ${direction === "rtl" ? "right-0" : "left-0"}`}
          style={{ width: `${(currentIndex / 4) * 100}%` }}
        />
        {stages.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          return (
            <div key={stage.label} className="relative flex flex-col items-center">
              <span 
                className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold border transition-all duration-150 ${
                  isDone 
                    ? "bg-[var(--brand)] border-[var(--brand)] text-white"
                    : isActive
                      ? "bg-white border-[var(--brand)] text-[var(--brand)] ring-2 ring-[var(--brand-soft)]"
                      : "bg-white border-slate-200 text-slate-400"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </span>
              <span className={`mt-1.5 text-[10px] font-semibold hidden sm:block ${isActive ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StudentApplicationsPanel({
  applications,
  loadError,
}: {
  applications: any[];
  loadError?: string;
}) {
  const { locale, direction } = useLocale();
  const t = studentApplicationsCopy[locale].panel;
  const actionable = applications.filter((application) => isActiveApplication(application.status) && Boolean(application.next_action));
  const submitted = applications.filter(
    (application) => Boolean(application.submitted_at) || isSubmittedApplicationStatus(application.status),
  );
  const activeApplications = applications.filter((application) => isActiveApplication(application.status));
  const verifiedDeadlineApplications = activeApplications
    .filter((application) => {
      const status = evaluateCampusApplicationDeadline(application).status;
      return Boolean(application.deadline) && (status === "open" || status === "closed");
    })
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
  const nextDeadlineApplication = verifiedDeadlineApplications[0];
  const overdue = nextDeadlineApplication
    ? evaluateCampusApplicationDeadline(nextDeadlineApplication).status === "closed"
    : false;
  const priorityApplication = actionable[0] || nextDeadlineApplication || activeApplications[0];
  const priorityProgram = firstProgram(priorityApplication);

  return (
    <div className="space-y-7">
      {loadError && (
        <Card className="border-red-200 bg-red-50/50">
          <div role="alert">
            <h2 className="text-lg font-semibold text-red-950">{t.loadTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-red-800">{loadError}</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/student/applications">{t.reload}</ButtonLink>
            <ButtonLink href="/student" variant="secondary">{t.back}</ButtonLink>
          </div>
        </Card>
      )}

      <section aria-label={t.priorityAria} className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="relative overflow-hidden rounded-[1.35rem] border-black/[.07] bg-white shadow-[0_24px_64px_-44px_rgba(0,0,0,.36)]">
          <div aria-hidden="true" className="student-accent-edge absolute inset-y-0 w-1 bg-[var(--brand)]" />
          <div className="student-accent-content student-accent-content-wide">
            <Badge variant={loadError ? "neutral" : actionable.length ? "warning" : "info"}>
              {loadError ? t.unavailable : actionable.length ? t.actionNeeded : t.tracking}
            </Badge>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              {actionable.length ? t.nextAction : t.followed}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {loadError
                ? t.loadText
                : priorityApplication?.next_action
                  ? localizeApplicationStoredText(locale, priorityApplication.next_action)
                  : priorityApplication
                    ? t.noSpecificAction
                    : t.noApplicationsText}
            </p>
            {priorityApplication && (
              <div className="mt-5 rounded-[1.1rem] border border-black/[.06] bg-[#f6f3ed] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.trackedApplication}</p>
                <p className="mt-2 font-bold text-slate-950"><bdi dir="auto">{priorityProgram?.name || t.programFallback}</bdi></p>
                <p className="mt-1 text-sm text-slate-600">
                  <bdi dir="auto">{localizeCatalogueLabel(locale, priorityApplication.intake_term) || t.intakeUnknown}</bdi> · {t.deadlineWord}{" "}
                  <bdi dir="auto">
                    {["open", "closed"].includes(evaluateCampusApplicationDeadline(priorityApplication).status)
                      ? formatDeadline(priorityApplication.deadline, locale)
                      : t.noConfirmedDate}
                  </bdi>
                </p>
              </div>
            )}
            <div className="mt-5 rounded-[1.1rem] border border-[#c9d9e8] bg-[#f1f7fb] p-4 text-xs leading-5 text-[#294d69]">
              {t.statusBoundary}
            </div>
          </div>
        </Card>

        <section aria-label={t.summaryAria} className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <SummaryCard title={t.todo} value={loadError ? "—" : actionable.length} badge={loadError ? t.unavailable : actionable.length ? t.todo : t.upToDate} tone={loadError ? "neutral" : actionable.length ? "warning" : "success"} />
          <SummaryCard title={t.submittedApplications} value={loadError ? "—" : submitted.length} badge={loadError ? t.unavailable : t.submitted} tone={loadError ? "neutral" : "info"} />
          <SummaryCard title={t.activeApplications} value={loadError ? "—" : activeApplications.length} badge={t.active} tone={loadError ? "neutral" : "info"} />
        </section>
      </section>

      <Card aria-labelledby="applications-deadline-title" className="rounded-[1.3rem] border-black/[.07] bg-white shadow-[0_20px_55px_-42px_rgba(0,0,0,.32)]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Badge variant={nextDeadlineApplication ? "warning" : "neutral"}>{overdue ? t.deadlinePassed : t.nextDeadline}</Badge>
            <h2 id="applications-deadline-title" className="mt-3 text-xl font-semibold text-slate-950">
              {loadError
                ? t.unavailable
                : nextDeadlineApplication
                  ? formatDeadline(nextDeadlineApplication.deadline, locale)
                  : t.noConfirmedDate}
            </h2>
            {!loadError && nextDeadlineApplication && (
              <p className="mt-1 text-sm text-slate-600"><bdi dir="auto">{firstProgram(nextDeadlineApplication)?.name || t.programFallback}</bdi>{overdue ? ` · ${t.checkApplication}` : ""}</p>
            )}
          </div>
          <ButtonLink href="/student/procedure" variant="secondary">{t.steps}</ButtonLink>
        </div>
      </Card>

      {!loadError && applications.length === 0 ? (
        <Card aria-labelledby="applications-empty-title" className="rounded-[1.3rem] border-dashed border-black/15 bg-white/75 py-10 text-center shadow-[0_18px_50px_-40px_rgba(0,0,0,.28)]">
          <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">＋</span>
          <h2 id="applications-empty-title" className="mt-4 text-lg font-bold text-slate-950">{t.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            {t.emptyText}
          </p>
          <div className="mt-5">
            <ButtonLink href="/student/orientation">{t.programmesCta}</ButtonLink>
          </div>
        </Card>
      ) : (
        <section aria-labelledby="applications-list-title">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{t.listEyebrow}</p>
              <h2 id="applications-list-title" className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{t.listTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{t.count(applications.length)}</p>
            </div>
          </div>

          <div className="space-y-5">
            {applications.map((application) => {
              const program = firstProgram(application);
              const university = firstUniversity(program);
              const events = [...(application.application_events || [])].sort(
                (a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at)),
              );
              const active = isActiveApplication(application.status);
              const deadlineEvaluation = evaluateCampusApplicationDeadline(application);
              const applicationOverdue = deadlineEvaluation.status === "closed";
              const nextAction = active
                ? localizeApplicationStoredText(locale, application.next_action) ||
                  (applicationOverdue
                    ? t.overdueAction
                    : t.noAction)
                : t.finishedAction;

              return (
                <Card
                  as="article"
                  key={application.id}
                  aria-labelledby={`student-application-title-${application.id}`}
                  className={active && application.next_action ? "rounded-[1.3rem] border-[#ead59a] bg-[#fff9e9] shadow-[0_22px_60px_-42px_rgba(139,98,0,.24)]" : "rounded-[1.3rem] border-black/[.07] bg-white shadow-[0_22px_60px_-42px_rgba(0,0,0,.3)]"}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.institution}</p>
                      <p className="mt-1 text-sm font-bold text-slate-900 [overflow-wrap:anywhere]">
                        <bdi dir="auto">{university?.name || t.universityUnknown}</bdi>{university?.city ? <> · <bdi dir="ltr">{university.city}</bdi></> : ""}
                      </p>
                      <h3 id={`student-application-title-${application.id}`} className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]"><bdi dir="auto">{program?.name || t.programFallback}</bdi></h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                        {program?.degree_level && <span className="rounded-full border border-black/[.06] bg-[#f3f0ea] px-2.5 py-1.5"><bdi dir="auto">{localizeCatalogueLabel(locale, program.degree_level)}</bdi></span>}
                        <span className="rounded-full border border-black/[.06] bg-[#f3f0ea] px-2.5 py-1.5"><bdi dir="auto">{localizeCatalogueLabel(locale, application.intake_term) || t.intakeUnknown}</bdi></span>
                        <span className={`rounded-full px-3 py-1.5 ${applicationOverdue ? "bg-amber-100 text-amber-900" : "bg-slate-100"}`}>
                          {t.deadlineWord}{" "}
                          <bdi dir="auto">
                            {["open", "closed"].includes(deadlineEvaluation.status)
                              ? formatDeadline(application.deadline, locale)
                              : t.noConfirmedDate}
                          </bdi>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start text-start">
                      <Badge variant={applicationVariant(application.status)}>
                        {localizedApplicationStatus(application.status, t)}
                      </Badge>
                      <p className="mt-2 text-xs text-slate-500">
                        {t.trackingStep}: {localizedApplicationStage(application.status, t)}
                      </p>
                    </div>
                  </div>

                  <ApplicationStepper status={application.status} copy={t} direction={direction} />

                  <section
                    aria-label={t.nextAction}
                    className={`mt-6 rounded-[1.15rem] border p-4 sm:p-5 ${active ? "border-[#ead59a] bg-[#fff9e9]" : "border-black/[.06] bg-[#f6f3ed]"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">{t.whatNext}</h4>
                      {active && applicationOverdue && <Badge variant="warning">{t.deadlinePassed}</Badge>}
                    </div>
                    <p dir="auto" className="mt-2 text-sm font-semibold leading-6 text-slate-950 [overflow-wrap:anywhere]">{nextAction}</p>
                  </section>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <InfoCard title={t.requiredDocuments} value={application.required_documents?.length ? application.required_documents.join(", ") : t.unknown} />
                    <InfoCard title={t.result} value={application.result || t.noResult} />
                  </div>

                  {application.student_notes && (
                    <div className="mt-5 rounded-[1.1rem] border border-black/[.06] bg-[#f6f3ed] p-4">
                      <h4 className="text-sm font-semibold text-slate-900">{t.messageForYou}</h4>
                      <p dir="auto" className="mt-1 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{application.student_notes}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {t.messageBoundary}
                      </p>
                    </div>
                  )}

                  <section aria-labelledby={`application-history-title-${application.id}`} className="mt-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 id={`application-history-title-${application.id}`} className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                        {t.historyTitle}
                        <span className="sr-only"> · {program?.name || t.programFallback}</span>
                      </h4>
                      <span className="text-xs text-slate-500">{t.eventCount(events.length)}</span>
                    </div>
                    {events.length === 0 ? (
                      <p className="rounded-[1.05rem] border border-black/[.05] bg-[#f6f3ed] p-4 text-sm text-slate-600">
                        {t.noEvents}
                      </p>
                    ) : (
                      <div className={direction === "rtl" ? "space-y-3 border-r-2 border-[var(--brand-border)] pr-4" : "space-y-3 border-l-2 border-[var(--brand-border)] pl-4"}>
                        {events.map((event: any) => (
                          <div key={event.id} className="relative">
                            <p className="text-sm font-medium text-slate-900">
                              {studentEventLabel(event.event_type, t)}
                            </p>
                            {event.message && <p dir="auto" className="mt-1 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{localizeApplicationStoredText(locale, event.message)}</p>}
                            <time dateTime={event.created_at} className="mt-1 block text-xs text-slate-500">
                              {new Intl.DateTimeFormat(t.intlLocale, { dateStyle: "medium" }).format(new Date(event.created_at))}
                            </time>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function SummaryCard({ title, value, badge, tone }: { title: string; value: number | string; badge: string; tone: "success" | "info" | "warning" | "neutral" }) {
  return (
    <Card as="article" className="rounded-[1.2rem] border-black/[.07] bg-white shadow-[0_18px_50px_-42px_rgba(0,0,0,.28)]">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.05rem] border border-black/[.06] bg-[#f6f3ed] p-4">
      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</h4>
      <p dir="auto" className="mt-2 text-sm font-medium leading-6 text-slate-900">{value}</p>
    </div>
  );
}
