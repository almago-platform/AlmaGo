import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import {
  applicationStatusLabels,
  daysUntilDeadline,
  formatDeadline,
  isActiveApplication,
} from "@/lib/phase4";

export const dynamic = "force-dynamic";

type DeadlineApplication = {
  id: string;
  status: string;
  deadline: string | null;
  next_action: string | null;
  programs:
    | {
        name: string;
        degree_level: string | null;
        source_url: string | null;
        application_url: string | null;
        verified_at: string | null;
        universities:
          | { name: string; city: string }
          | { name: string; city: string }[]
          | null;
      }
    | {
        name: string;
        degree_level: string | null;
        source_url: string | null;
        application_url: string | null;
        verified_at: string | null;
        universities:
          | { name: string; city: string }
          | { name: string; city: string }[]
          | null;
      }[]
    | null;
};

function firstProgram(application: DeadlineApplication) {
  return Array.isArray(application.programs) ? application.programs[0] : application.programs;
}

function firstUniversity(program: ReturnType<typeof firstProgram>) {
  return Array.isArray(program?.universities) ? program?.universities[0] : program?.universities;
}

function countdownLabel(days: number) {
  if (days < 0) {
    const elapsed = Math.abs(days);
    return `Dépassée de ${elapsed} jour${elapsed > 1 ? "s" : ""}`;
  }
  if (days === 0) return "Aujourd’hui";
  if (days === 1) return "Demain";
  return `Dans ${days} jours`;
}

function officialSourceUrl(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (!value?.trim()) continue;
    try {
      const url = new URL(value.trim());
      if (url.protocol === "https:" || url.protocol === "http:") return value.trim();
    } catch {
      // Ignore malformed catalogue links instead of presenting them as official sources.
    }
  }
  return null;
}

function verificationDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export default async function StudentDeadlinesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id,status,deadline,next_action,programs(name,degree_level,source_url,application_url,verified_at,universities(name,city))",
    )
    .not("deadline", "is", null)
    .order("deadline", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Mes échéances" title="Mes échéances" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">Échéances temporairement indisponibles</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Nous n’arrivons pas à charger les dates enregistrées dans votre dossier pour le moment. Aucune candidature n’a été modifiée.
            </p>
          </div>
          <div className="mt-5">
            <ButtonLink href="/student/echeances">Réessayer</ButtonLink>
          </div>
        </Card>
      </main>
    );
  }

  const now = new Date();
  const deadlines = ((data || []) as unknown as DeadlineApplication[])
    .filter((application) => isActiveApplication(application.status))
    .map((application) => ({
      application,
      days: application.deadline ? daysUntilDeadline(application.deadline, now) : null,
    }))
    .filter(
      (entry): entry is { application: DeadlineApplication; days: number } =>
        entry.days !== null && Boolean(entry.application.deadline),
    );

  const overdueCount = deadlines.filter((entry) => entry.days < 0).length;
  const futureDeadlines = deadlines.filter((entry) => entry.days >= 0);
  const nextDeadline = futureDeadlines[0] || null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Mes échéances"
        title="Mes échéances"
        description="Retrouvez les dates enregistrées pour vos candidatures actives, ce qui est prévu ensuite et la source officielle disponible pour le programme."
        actions={
          <ButtonLink href="/student/applications" variant="secondary">
            Voir mes candidatures
          </ButtonLink>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Résumé des échéances">
        <SummaryCard
          title="Échéances connues"
          value={deadlines.length}
          detail="Candidatures actives avec une date enregistrée"
          tone="neutral"
        />
        <SummaryCard
          title="Dépassées"
          value={overdueCount}
          detail="Dates passées qui demandent une vérification"
          tone={overdueCount ? "warning" : "success"}
        />
        <Card className="shadow-none">
          <p className="text-sm font-bold text-slate-700">Prochaine date</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {nextDeadline?.application.deadline
              ? formatDeadline(nextDeadline.application.deadline)
              : "Aucune date à venir"}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {nextDeadline ? countdownLabel(nextDeadline.days) : "Aucune échéance future n’est enregistrée."}
          </p>
        </Card>
      </section>

      <section className="mt-8" aria-labelledby="deadlines-list-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Calendrier du dossier</p>
          <h2 id="deadlines-list-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Dates enregistrées pour vos candidatures
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Les dates sont classées chronologiquement. Une date enregistrée dans AlmaGo doit toujours être confirmée sur la page officielle du programme ou de l’établissement.
          </p>
        </div>

        {deadlines.length === 0 ? (
          <Card className="border-dashed bg-white/70 py-9 text-center shadow-none">
            <h3 className="text-lg font-bold text-slate-950">Aucune échéance active n’est enregistrée.</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Lorsqu’une candidature active possède une date limite enregistrée, elle apparaît ici automatiquement.
            </p>
            <div className="mt-5">
              <ButtonLink href="/student/applications">Voir mes candidatures</ButtonLink>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {deadlines.map(({ application, days }) => {
              const program = firstProgram(application);
              const university = firstUniversity(program);
              const sourceUrl = officialSourceUrl(program?.source_url, program?.application_url);
              const checkedAt = sourceUrl ? verificationDate(program?.verified_at || null) : null;

              return (
                <Card
                  as="article"
                  key={application.id}
                  className={days < 0 ? "border-amber-300 bg-amber-50/30" : ""}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={days < 0 ? "warning" : days <= 7 ? "info" : "neutral"}>
                          {countdownLabel(days)}
                        </Badge>
                        <Badge variant="neutral">
                          {applicationStatusLabels[application.status] || "Candidature active"}
                        </Badge>
                      </div>

                      <h3 className="mt-4 text-xl font-bold tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]">
                        {program?.name || "Programme"}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
                        {university?.name || "Université à confirmer"}
                        {university?.city ? ` · ${university.city}` : ""}
                        {program?.degree_level ? ` · ${program.degree_level}` : ""}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 lg:text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Échéance enregistrée</p>
                      <time
                        dateTime={application.deadline || undefined}
                        className="mt-1 block text-lg font-bold text-slate-950"
                      >
                        {formatDeadline(application.deadline)}
                      </time>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.65fr)]">
                    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Ce qui vient ensuite</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                        {application.next_action ||
                          (days < 0
                            ? "La date enregistrée est dépassée. Vérifiez le statut de cette candidature et la source officielle."
                            : "Aucune prochaine action spécifique n’est enregistrée pour cette candidature.")}
                      </p>
                      <div className="mt-4">
                        <ButtonLink href="/student/applications" variant="secondary">
                          Ouvrir la candidature
                        </ButtonLink>
                      </div>
                    </div>

                    <div className="rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/35 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Source officielle</p>
                      {sourceUrl ? (
                        <>
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Consulter la page officielle de ${program?.name || "ce programme"} (nouvel onglet)`}
                            className="mt-2 inline-flex min-h-10 items-center text-sm font-bold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
                          >
                            Consulter la page officielle
                          </a>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {checkedAt
                              ? `Dernière date de vérification enregistrée dans AlmaGo : ${checkedAt}. Confirmez toujours l’échéance sur la source officielle.`
                              : "Aucune date de vérification de la fiche programme n’est enregistrée."}
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Aucun lien officiel n’est enregistré dans AlmaGo pour ce programme. Vérifiez directement auprès de l’établissement.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-xs leading-5 text-slate-500">
          Ce calendrier reprend uniquement les dates actuellement enregistrées dans AlmaGo. Il ne remplace pas les délais publiés par l’université, uni-assist ou tout autre organisme compétent.
        </p>
        <ButtonLink href="/aide" variant="secondary">
          Besoin d’aide pour une échéance ?
        </ButtonLink>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: number;
  detail: string;
  tone: "neutral" | "warning" | "success";
}) {
  return (
    <Card className="shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-700">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span
          aria-hidden="true"
          className={`mt-1 h-2.5 w-2.5 rounded-full ${
            tone === "warning"
              ? "bg-amber-500"
              : tone === "success"
                ? "bg-emerald-600"
                : "bg-slate-300"
          }`}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </Card>
  );
}
