"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { applicationStatusLabels, formatDeadline, isActiveApplication, isPastDeadline, nextActiveDeadline } from "@/lib/phase4";

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

const submittedStatuses = new Set(["submitted", "in_review", "waiting_university", "admission", "accepted", "rejection", "rejected"]);

export function StudentApplicationsPanel({
  applications,
  loadError,
}: {
  applications: any[];
  loadError?: string;
}) {
  const actionable = applications.filter((application) => isActiveApplication(application.status) && Boolean(application.next_action));
  const submitted = applications.filter(
    (application) => Boolean(application.submitted_at) || submittedStatuses.has(application.status),
  );
  const activeApplications = applications.filter((application) => isActiveApplication(application.status));
  const nextDeadlineApplication = nextActiveDeadline(applications);
  const overdue = nextDeadlineApplication?.deadline && isPastDeadline(nextDeadlineApplication.deadline);
  const priorityApplication = actionable[0] || nextDeadlineApplication || activeApplications[0];
  const priorityProgram = firstProgram(priorityApplication);

  return (
    <div className="space-y-8">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}
        </div>
      )}

      <section aria-label="Priorité candidature" className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Card className="bg-slate-950 text-white">
          <Badge variant={loadError ? "neutral" : actionable.length ? "warning" : "info"}>
            {loadError ? "Indisponible" : actionable.length ? "Action requise" : "Suivi des candidatures"}
          </Badge>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">Prochaine priorité</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {loadError
              ? "Les candidatures n’ont pas pu être chargées pour le moment."
              : priorityApplication?.next_action
                ? priorityApplication.next_action
                : priorityApplication
                  ? "Aucune action urgente n’est enregistrée, mais cette candidature reste à suivre."
                  : "Aucune candidature n’est encore enregistrée. Consultez vos recommandations pour choisir un programme à suivre."}
          </p>
          {priorityApplication && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-light)]">Candidature suivie</p>
              <p className="mt-2 font-semibold">{priorityProgram?.name || "Programme"}</p>
              <p className="mt-1 text-sm text-slate-300">
                {priorityApplication.intake_term || "Semestre à confirmer"} · Échéance {formatDeadline(priorityApplication.deadline)}
              </p>
            </div>
          )}
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
        <Card aria-labelledby="applications-empty-title" className="border-dashed text-center">
          <h2 id="applications-empty-title" className="text-lg font-semibold text-slate-950">Aucune candidature pour le moment</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Consultez vos recommandations et enregistrez votre intérêt pour démarrer un suivi.
          </p>
          <div className="mt-5">
            <ButtonLink href="/student/orientation">Voir mes recommandations</ButtonLink>
          </div>
        </Card>
      ) : (
        <section aria-labelledby="applications-list-title">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Candidatures</p>
              <h2 id="applications-list-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Mes candidatures</h2>
              <p className="mt-1 text-sm text-slate-600">{applications.length} candidature{applications.length > 1 ? "s" : ""} dans votre espace.</p>
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
                  className={active && application.next_action ? "border-amber-300 bg-amber-50/30" : ""}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--brand)]">
                        {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                      </p>
                      <h3 id={`student-application-title-${application.id}`} className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{program?.name || "Programme"}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {application.intake_term || "Semestre à confirmer"} · Échéance {formatDeadline(application.deadline)}
                      </p>
                    </div>
                    <Badge variant={applicationVariant(application.status)}>
                      {applicationStatusLabels[application.status] || application.status}
                    </Badge>
                  </div>

                  <section
                    aria-label="Prochaine action"
                    className={`mt-6 rounded-[var(--radius-panel)] border p-4 sm:p-5 ${active ? "border-amber-200 bg-amber-50" : "border-[var(--border)] bg-[var(--surface-muted)]"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Prochaine action</h4>
                      {active && applicationOverdue && <Badge variant="warning">Échéance dépassée</Badge>}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{nextAction}</p>
                  </section>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <InfoCard title="Documents nécessaires" value={application.required_documents?.length ? application.required_documents.join(", ") : "À confirmer"} />
                    <InfoCard title="Résultat" value={application.result || "Aucun résultat détaillé enregistré."} />
                  </div>

                  {application.student_notes && (
                    <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                      <h4 className="text-sm font-semibold text-slate-900">Notes</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{application.student_notes}</p>
                    </div>
                  )}

                  <section aria-labelledby={`application-history-title-${application.id}`} className="mt-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 id={`application-history-title-${application.id}`} className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Historique<span className="sr-only"> de la candidature {program?.name || "Programme"}</span></h4>
                      <span className="text-xs text-slate-500">{events.length} événement{events.length > 1 ? "s" : ""}</span>
                    </div>
                    {events.length === 0 ? (
                      <p className="rounded-[var(--radius-control)] bg-[var(--surface-muted)] p-4 text-sm text-slate-600">Aucun événement enregistré pour le moment.</p>
                    ) : (
                      <div className="space-y-3 border-l-2 border-[var(--brand-border)] pl-4">
                        {events.map((event: any) => (
                          <div key={event.id} className="relative">
                            <p className="text-sm font-medium text-slate-900">
                              {applicationStatusLabels[event.event_type] || event.event_type}
                            </p>
                            {event.message && <p className="mt-1 text-sm leading-6 text-slate-700">{event.message}</p>}
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
