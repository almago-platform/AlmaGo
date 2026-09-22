"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { applicationStatusLabels, formatDeadline } from "@/lib/phase4";

function applicationVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "admission" || status === "accepted") return "success";
  if (["documents_missing", "interested", "rejection", "rejected"].includes(status)) return "warning";
  if (["preparing", "ready_to_submit", "submitted", "waiting_university", "in_review"].includes(status)) return "info";
  return "neutral";
}

function dateValue(value: string | null | undefined) {
  if (!value) return Number.POSITIVE_INFINITY;
  return new Date(`${value}T12:00:00`).getTime();
}

const submittedStatuses = new Set(["submitted", "in_review", "waiting_university", "admission", "accepted", "rejection", "rejected"]);
const terminalStatuses = new Set(["admission", "accepted", "rejection", "rejected", "withdrawn"]);

export function StudentApplicationsPanel({
  applications,
  loadError,
}: {
  applications: any[];
  loadError?: string;
}) {
  const actionable = applications.filter((application) => Boolean(application.next_action));
  const submitted = applications.filter(
    (application) => Boolean(application.submitted_at) || submittedStatuses.has(application.status),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDeadlineApplication = [...applications]
    .filter(
      (application) =>
        application.deadline &&
        !terminalStatuses.has(application.status) &&
        dateValue(application.deadline) >= today.getTime(),
    )
    .sort((a, b) => dateValue(a.deadline) - dateValue(b.deadline))[0];

  return (
    <div className="space-y-7">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}
        </div>
      )}

      <section aria-label="Résumé des candidatures" className="grid gap-4 sm:grid-cols-3">
        <Card aria-labelledby="applications-actions-title">
          <h2 id="applications-actions-title" className="text-sm font-semibold text-slate-700">Actions pour toi</h2>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{loadError ? "—" : actionable.length}</p>
          <div className="mt-3">
            <Badge variant={loadError ? "neutral" : actionable.length ? "warning" : "success"}>
              {loadError ? "Indisponible" : actionable.length ? "À traiter" : "À jour"}
            </Badge>
          </div>
        </Card>
        <Card aria-labelledby="applications-submitted-title">
          <h2 id="applications-submitted-title" className="text-sm font-semibold text-slate-700">Dossiers déposés</h2>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{loadError ? "—" : submitted.length}</p>
          <div className="mt-3"><Badge variant={loadError ? "neutral" : "info"}>{loadError ? "Indisponible" : "Suivis par AlmaGo"}</Badge></div>
        </Card>
        <Card aria-labelledby="applications-deadline-title">
          <h2 id="applications-deadline-title" className="text-sm font-semibold text-slate-700">Prochaine échéance</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
            {loadError
              ? "Indisponible"
              : nextDeadlineApplication
                ? formatDeadline(nextDeadlineApplication.deadline)
                : "Aucune date confirmée"}
          </p>
          {!loadError && nextDeadlineApplication && (
            <p className="mt-1 text-xs text-slate-500">
              {Array.isArray(nextDeadlineApplication.programs)
                ? nextDeadlineApplication.programs[0]?.name
                : nextDeadlineApplication.programs?.name}
            </p>
          )}
        </Card>
      </section>

      {!loadError && applications.length === 0 ? (
        <Card aria-labelledby="applications-empty-title" className="border-dashed text-center">
          <h2 id="applications-empty-title" className="text-lg font-semibold text-slate-950">Aucune candidature pour le moment</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Consulte tes recommandations et enregistre ton intérêt pour démarrer un suivi.
          </p>
          <div className="mt-5">
            <ButtonLink href="/student/orientation">Voir mes recommandations</ButtonLink>
          </div>
        </Card>
      ) : (
        <section aria-labelledby="applications-list-title">
          <div className="mb-4">
            <h2 id="applications-list-title" className="text-xl font-semibold text-slate-950">Mes dossiers</h2>
            <p className="mt-1 text-sm text-slate-600">{applications.length} candidature{applications.length > 1 ? "s" : ""} suivie{applications.length > 1 ? "s" : ""}.</p>
          </div>

          <div className="space-y-5">
            {applications.map((application) => {
              const program = Array.isArray(application.programs)
                ? application.programs[0]
                : application.programs;
              const university = Array.isArray(program?.universities)
                ? program.universities[0]
                : program?.universities;
              const events = [...(application.application_events || [])].sort(
                (a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at)),
              );

              return (
                <Card as="article" key={application.id} aria-labelledby={`student-application-title-${application.id}`}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-emerald-700">
                        {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                      </p>
                      <h3 id={`student-application-title-${application.id}`} className="mt-1 text-xl font-semibold text-slate-950">{program?.name || "Programme"}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {application.intake_term || "Semestre à confirmer"} · Deadline {formatDeadline(application.deadline)}
                      </p>
                    </div>
                    <Badge variant={applicationVariant(application.status)}>
                      {applicationStatusLabels[application.status] || application.status}
                    </Badge>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <Card aria-labelledby={`application-action-title-${application.id}`} className={`shadow-none ${application.next_action ? "bg-amber-50" : "bg-slate-50"}`}>
                      <h4 id={`application-action-title-${application.id}`} className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prochaine action</h4>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                        {application.next_action || "AlmaGo reviendra vers toi."}
                      </p>
                    </Card>
                    <Card aria-labelledby={`application-documents-title-${application.id}`} className="bg-slate-50 shadow-none">
                      <h4 id={`application-documents-title-${application.id}`} className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents nécessaires</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {application.required_documents?.length
                          ? application.required_documents.join(", ")
                          : "À confirmer"}
                      </p>
                    </Card>
                    <Card aria-labelledby={`application-result-title-${application.id}`} className="bg-slate-50 shadow-none">
                      <h4 id={`application-result-title-${application.id}`} className="text-xs font-semibold uppercase tracking-wide text-slate-500">Résultat</h4>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{application.result || "En attente"}</p>
                    </Card>
                  </div>

                  {application.student_notes && (
                    <Card aria-labelledby={`application-notes-title-${application.id}`} className="mt-5 bg-slate-50 shadow-none">
                      <h4 id={`application-notes-title-${application.id}`} className="text-sm font-semibold text-slate-900">Notes</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{application.student_notes}</p>
                    </Card>
                  )}

                  <section aria-labelledby={`application-history-title-${application.id}`} className="mt-6 border-l-2 border-emerald-200 pl-4">
                    <h4 id={`application-history-title-${application.id}`} className="text-xs font-semibold uppercase tracking-wide text-slate-500">Historique<span className="sr-only"> de la candidature {program?.name || "Programme"}</span></h4>
                    {events.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-600">Aucun événement enregistré pour le moment.</p>
                    ) : (
                      events.map((event: any) => (
                        <div key={event.id} className="relative mt-4">
                          <p className="text-sm font-medium text-slate-900">
                            {applicationStatusLabels[event.event_type] || event.event_type}
                          </p>
                          {event.message && <p className="mt-1 text-sm text-slate-700">{event.message}</p>}
                          <time dateTime={event.created_at} className="mt-1 block text-xs text-slate-500">
                            {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(event.created_at))}
                          </time>
                        </div>
                      ))
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
