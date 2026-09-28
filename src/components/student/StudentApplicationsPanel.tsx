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
import { formatDeadline, isActiveApplication, isPastDeadline, nextActiveDeadline } from "@/lib/phase4";

function applicationVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "admission" || status === "accepted") return "success";
  if (["documents_missing", "interested", "rejection", "rejected"].includes(status)) return "warning";
  if (["preparing", "ready_to_submit", "submitted", "waiting_university", "in_review"].includes(status)) return "info";
  return "neutral";
}

function firstProgram(application: any) {
  return Array.isArray(application.programs) ? application.programs[0] : application.programs;
}

function firstUniversity(program: any) {
  return Array.isArray(program?.universities) ? program.universities[0] : program?.universities;
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
}: {
  status: string;
  copy: (typeof studentApplicationsCopy)["fr"]["panel"];
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
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-[var(--brand)] transition-all duration-300"
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
  const { locale } = useLocale();
  const t = studentApplicationsCopy[locale].panel;
  const actionable = applications.filter((application) => isActiveApplication(application.status) && Boolean(application.next_action));
  const submitted = applications.filter(
    (application) => Boolean(application.submitted_at) || isSubmittedApplicationStatus(application.status),
  );
  const activeApplications = applications.filter((application) => isActiveApplication(application.status));
  const nextDeadlineApplication = nextActiveDeadline(applications);
  const overdue = nextDeadlineApplication?.deadline && isPastDeadline(nextDeadlineApplication.deadline);
  const priorityApplication = actionable[0] || nextDeadlineApplication || activeApplications[0];
  const priorityProgram = firstProgram(priorityApplication);

  return (
    <div className="space-y-8">
      {loadError && (
        <Card className="border-red-200 bg-red-50/50">
          <div role="alert">
            <h2 className="text-lg font-semibold text-red-950">Suivi des candidatures indisponible</h2>
            <p className="mt-2 text-sm leading-6 text-red-800">{loadError}</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/student/applications">Réessayer le chargement</ButtonLink>
            <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
          </div>
        </Card>
      )}

      <section aria-label="Priorité candidature" className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-none">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <Badge variant={loadError ? "neutral" : actionable.length ? "warning" : "info"}>
              {loadError ? "Indisponible" : actionable.length ? "Action à faire" : "Suivi en cours"}
            </Badge>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              {actionable.length ? "Votre prochaine action" : "Vos candidatures sont suivies"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {loadError
                ? "Les candidatures n’ont pas pu être chargées pour le moment."
                : priorityApplication?.next_action
                  ? priorityApplication.next_action
                  : priorityApplication
                    ? "Aucune action précise n’est enregistrée de votre côté pour cette candidature. Consultez son statut et son historique ci-dessous."
                    : "Aucune candidature n’est encore enregistrée. Ajoutez un programme depuis « Mes programmes » pour le suivre ici."}
            </p>
            {priorityApplication && (
              <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Candidature suivie</p>
                <p className="mt-2 font-bold text-slate-950">{priorityProgram?.name || "Programme"}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {priorityApplication.intake_term || "Semestre à confirmer"} · Échéance {formatDeadline(priorityApplication.deadline)}
                </p>
              </div>
            )}
            <div className="mt-5 rounded-[var(--radius-control)] border border-blue-200 bg-blue-50/70 p-3.5 text-xs leading-5 text-blue-900">
              Le statut AlmaGo reflète le suivi enregistré dans votre espace. Il ne remplace pas le statut officiel communiqué par l’université.
            </div>
          </div>
        </Card>

        <section aria-label="Résumé des candidatures" className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <SummaryCard title="À traiter" value={loadError ? "—" : actionable.length} badge={loadError ? "Indisponible" : actionable.length ? "À traiter" : "À jour"} tone={loadError ? "neutral" : actionable.length ? "warning" : "success"} />
          <SummaryCard title="Candidatures déposées" value={loadError ? "—" : submitted.length} badge={loadError ? "Indisponible" : "Déposées"} tone={loadError ? "neutral" : "info"} />
          <SummaryCard title="Candidatures actives" value={loadError ? "—" : activeApplications.length} badge="Actives" tone={loadError ? "neutral" : "info"} />
        </section>
      </section>

      <Card aria-labelledby="applications-deadline-title" className="shadow-none">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Badge variant={nextDeadlineApplication ? "warning" : "neutral"}>{overdue ? "Échéance dépassée" : "Prochaine échéance"}</Badge>
            <h2 id="applications-deadline-title" className="mt-3 text-xl font-semibold text-slate-950">
              {loadError
                ? "Indisponible"
                : nextDeadlineApplication
                  ? formatDeadline(nextDeadlineApplication.deadline)
                  : "Aucune date confirmée"}
            </h2>
            {!loadError && nextDeadlineApplication && (
              <p className="mt-1 text-sm text-slate-600">{firstProgram(nextDeadlineApplication)?.name || "Programme"}{overdue ? " · Vérifiez cette candidature" : ""}</p>
            )}
          </div>
          <ButtonLink href="/student/checklist" variant="secondary">Voir mes étapes</ButtonLink>
        </div>
      </Card>

      {!loadError && applications.length === 0 ? (
        <Card aria-labelledby="applications-empty-title" className="border-dashed bg-white/70 py-9 text-center">
          <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">＋</span>
          <h2 id="applications-empty-title" className="mt-4 text-lg font-bold text-slate-950">Vous n’avez encore aucune candidature enregistrée.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Ajoutez un programme depuis « Mes programmes » pour le suivre ici. Cette action n’envoie pas votre candidature.
          </p>
          <div className="mt-5">
            <ButtonLink href="/student/orientation">Voir mes programmes</ButtonLink>
          </div>
        </Card>
      ) : (
        <section aria-labelledby="applications-list-title">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Vos dossiers suivis</p>
              <h2 id="applications-list-title" className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Mes candidatures</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{applications.length} candidature{applications.length > 1 ? "s" : ""} enregistrée{applications.length > 1 ? "s" : ""} dans votre espace.</p>
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
              const applicationOverdue = Boolean(application.deadline && isPastDeadline(application.deadline));
              const nextAction = active
                ? application.next_action ||
                  (applicationOverdue
                    ? "Échéance dépassée : vérifiez cette candidature et les informations enregistrées."
                    : "Aucune action spécifique n’est enregistrée. Vérifiez le statut et l’échéance de cette candidature.")
                : "Le suivi de cette candidature est terminé dans AlmaGo. Consultez le résultat et l’historique.";

              return (
                <Card
                  as="article"
                  key={application.id}
                  aria-labelledby={`student-application-title-${application.id}`}
                  className={active && application.next_action ? "border-amber-300 bg-amber-50/20 shadow-none" : "shadow-none"}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Établissement</p>
                      <p className="mt-1 text-sm font-bold text-slate-900 [overflow-wrap:anywhere]">
                        {university?.name || "Université à confirmer"}{university?.city ? ` · ${university.city}` : ""}
                      </p>
                      <h3 id={`student-application-title-${application.id}`} className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]">{program?.name || "Programme"}</h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                        {program?.degree_level && <span className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1.5">{program.degree_level}</span>}
                        <span className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1.5">{application.intake_term || "Semestre à confirmer"}</span>
                        <span className={`rounded-full px-3 py-1.5 ${applicationOverdue ? "bg-amber-100 text-amber-900" : "bg-slate-100"}`}>
                          Échéance {formatDeadline(application.deadline)}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                      <Badge variant={applicationVariant(application.status)}>
                        {studentApplicationStatusLabel(application.status)}
                      </Badge>
                      <p className="mt-2 text-xs text-slate-500">
                        Étape du suivi : {studentApplicationStageLabel(application.status)}
                      </p>
                    </div>
                  </div>

                  <ApplicationStepper status={application.status} />

                  <section
                    aria-label="Prochaine action"
                    className={`mt-6 rounded-[var(--radius-panel)] border p-4 sm:p-5 ${active ? "border-amber-200 bg-amber-50" : "border-[var(--border)] bg-[var(--surface-muted)]"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">Ce qui vient ensuite</h4>
                      {active && applicationOverdue && <Badge variant="warning">Échéance dépassée</Badge>}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-950 [overflow-wrap:anywhere]">{nextAction}</p>
                  </section>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <InfoCard title="Documents nécessaires" value={application.required_documents?.length ? application.required_documents.join(", ") : "À confirmer"} />
                    <InfoCard title="Résultat" value={application.result || "Aucun résultat détaillé enregistré."} />
                  </div>

                  {application.student_notes && (
                    <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                      <h4 className="text-sm font-semibold text-slate-900">Message pour vous</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{application.student_notes}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Ce message est partagé dans votre espace étudiant. Les notes internes de l’équipe ne sont pas affichées ici.
                      </p>
                    </div>
                  )}

                  <section aria-labelledby={`application-history-title-${application.id}`} className="mt-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 id={`application-history-title-${application.id}`} className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                        Ce qui a été fait
                        <span className="sr-only"> de la candidature {program?.name || "Programme"}</span>
                      </h4>
                      <span className="text-xs text-slate-500">{events.length} événement{events.length > 1 ? "s" : ""}</span>
                    </div>
                    {events.length === 0 ? (
                      <p className="rounded-[var(--radius-control)] bg-[var(--surface-muted)] p-4 text-sm text-slate-600">
                        Aucun événement visible n’est enregistré pour le moment.
                      </p>
                    ) : (
                      <div className="space-y-3 border-l-2 border-[var(--brand-border)] pl-4">
                        {events.map((event: any) => (
                          <div key={event.id} className="relative">
                            <p className="text-sm font-medium text-slate-900">
                              {studentEventLabel(event.event_type)}
                            </p>
                            {event.message && <p className="mt-1 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{event.message}</p>}
                            <time dateTime={event.created_at} className="mt-1 block text-xs text-slate-500">
                              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(event.created_at))}
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
    <Card as="article" className="shadow-none">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</h4>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{value}</p>
    </div>
  );
}
