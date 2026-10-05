import type { OrientationProgrammeEvaluation } from "@/lib/orientation-engine/types";
import { recommendationMatchesPreferredCity } from "@/lib/prospect/programmes";

export function ProspectProgrammeRecommendationCard({
  recommendation,
  labels,
  compact = false,
}: {
  recommendation: OrientationProgrammeEvaluation;
  labels: {
    projectMatch: string;
    preferredCity: string;
    requirementCheck: string;
    field: string;
    german: string;
    uniAssist: string;
    yes: string;
    source: string;
    applyLink: string;
  };
  compact?: boolean;
}) {
  const programme = recommendation.programme;
  const preferredCity = recommendationMatchesPreferredCity(recommendation);
  const cardClass = compact
    ? "group rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--brand-border)]"
    : "group rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--brand-border)] sm:p-5";
  const headingClass = compact
    ? "mt-2.5 text-lg font-bold [overflow-wrap:anywhere]"
    : "mt-3 text-xl font-bold [overflow-wrap:anywhere]";

  return (
    <article className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--brand-strong)]">
              {labels.projectMatch}
            </span>
            {preferredCity ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                {labels.preferredCity}
              </span>
            ) : null}
          </div>

          <h3 className={headingClass}>
            <bdi dir="auto">{programme.name}</bdi>
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            <bdi dir="auto">{programme.university.name}</bdi>
            {programme.university.city ? <> · <bdi dir="auto">{programme.university.city}</bdi></> : null}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold">
            {programme.degreeLevel}
          </span>
          {programme.teachingLanguage ? (
            <span className="rounded-full bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold">
              <bdi dir="auto">{programme.teachingLanguage}</bdi>
            </span>
          ) : null}
        </div>
      </div>

      {!compact ? (
        <dl className="mt-4 grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
          <div className="bg-[var(--surface-subtle)] p-3">
            <dt className="text-xs font-semibold text-[var(--muted)]">{labels.field}</dt>
            <dd className="mt-1 text-sm font-semibold"><bdi dir="auto">{programme.field || "—"}</bdi></dd>
          </div>
          <div className="bg-[var(--surface-subtle)] p-3">
            <dt className="text-xs font-semibold text-[var(--muted)]">{labels.german}</dt>
            <dd className="mt-1 text-sm font-semibold">{programme.germanLevelRequired || labels.requirementCheck}</dd>
          </div>
          <div className="bg-[var(--surface-subtle)] p-3">
            <dt className="text-xs font-semibold text-[var(--muted)]">{labels.uniAssist}</dt>
            <dd className="mt-1 text-sm font-semibold">
              {programme.uniAssistRequired ? labels.yes : labels.requirementCheck}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2.5">
        {programme.programmeSourceUrl ? (
          <a
            href={programme.programmeSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:border-[var(--brand-border)] hover:bg-[var(--surface-subtle)]"
          >
            {labels.source}
          </a>
        ) : null}
        {programme.applicationUrl && !compact ? (
          <a
            href={programme.applicationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
          >
            {labels.applyLink}
          </a>
        ) : null}
      </div>
    </article>
  );
}
