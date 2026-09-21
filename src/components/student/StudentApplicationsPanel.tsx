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

export function StudentApplicationsPanel({
  applications,
  loadError,
}: {
  applications: any[];
  loadError?: string;
}) {
  const actionable = applications.filter((application) => Boolean(application.next_action));
  const submitted = applications.filter((application) => Boolean(application.submitted_at));
  const nextDeadlineApplication = [...applications]
    .filter((application) => application.deadline)
    .sort((a, b) => dateValue(a.deadline) - dateValue(b.deadline))[0];

  return (
    <div className="space-y-7">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}
        </div>
      )}

      <section aria-label="Résumé des candidatures" className="grid gap-4 sm:grid-cols-3">
        <Card>
          <h2 className="text-sm font-semibold text-slate-700">Actions pour toi</h2>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{actionable.length}</p>
          <div className="mt-3">
            <Badge variant={actionable.length ? "warning" : "success"}>
              {actionable.length ? "À traiter" : "À jour"}
            </Badge>
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-700">Dossiers déposés</h2>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{submitted.length}</p>
          <div className="mt-3"><Badge variant="info">Suivis par AlmaGo</Badge></div>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-700">Prochaine échéance</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
            {nextDeadlineApplication
              ? formatDeadline(nextDeadlineApplication.deadline)
              : "Aucune date confirmée"}
          </p>
          {nextDeadlineApplication && (
            <p className="mt-1 text-xs text-slate-500">
              {Array.isArray(nextDeadlineApplication.programs)
                ? nextDeadlineApplication.programs[0]?.name
                : nextDeadlineApplication.programs?.name}
            </p>
          )}
        </Card>
      </section>

      {!loadError && applications.length === 0 ? (
        <Card className="border-dashed text-center">
          <h2 className="text-lg font-semibold text-slate-950">Aucune candidature pour le moment</h2>
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
                <Card as="article" key={application.id}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-emerald-700">
                        {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-950">{program?.name || "Programme"}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {application.intake_term || "Semestre à confirmer"} · Deadline {formatDeadline(application.deadline)}
                      </p>
                    </div>
                    <Badge variant={applicationVariant(application.status)}>
                      {applicationStatusLabels[application.status] || application.status}
                    </Badge>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className={`rounded-2xl p-4 ${application.next_action ? "bg-amber-50" : "bg-slate-50"}`}>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prochaine action</h4>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                        {application.next_action || "AlmaGo reviendra vers toi."}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents nécessaires</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {application.required_documents?.length
                          ? application.required_documents.join(", ")
                          : "À confirmer"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Résultat</h4>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{application.result || "En attente"}</p>
                    </div>
                  </div>

                  {application.student_notes && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <h4 className="text-sm font-semibold text-slate-900">Notes</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{application.student_notes}</p>
                    </div>
                  )}

                  <section aria-label={`Historique de la candidature ${program?.name || "Programme"}`} className="mt-6 border-l-2 border-emerald-200 pl-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Historique</h4>
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
