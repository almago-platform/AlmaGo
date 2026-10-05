import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";
import { ProspectUniversityCover } from "@/components/prospect/ProspectUniversityCover";

export function ProspectProgrammeCatalogueCard({
  programme,
  projectMatch,
  labels,
}: {
  programme: OrientationProgrammeRecord;
  projectMatch: boolean;
  labels: {
    projectMatch: string;
    generalCatalogue: string;
    requirementCheck: string;
    field: string;
    german: string;
    uniAssist: string;
    yes: string;
    source: string;
    applyLink: string;
  };
}) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-border)] hover:shadow-[var(--shadow-soft)]">
      <ProspectUniversityCover
        universityName={programme.university.name}
        city={programme.university.city}
        media={programme.university.media}
      />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
            projectMatch ? "text-[var(--brand)]" : "text-[var(--muted)]"
          }`}>
            {projectMatch ? labels.projectMatch : labels.generalCatalogue}
          </p>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-[11px] font-semibold">
              {programme.degreeLevel}
            </span>
            {programme.teachingLanguage ? (
              <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-[11px] font-semibold">
                <bdi dir="auto">{programme.teachingLanguage}</bdi>
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="mt-3 text-xl font-bold leading-tight tracking-[-0.02em] [overflow-wrap:anywhere]">
          <bdi dir="auto">{programme.name}</bdi>
        </h3>
        <p className="mt-1.5 text-sm leading-5 text-[var(--muted)]">
          <bdi dir="auto">{programme.university.name}</bdi>
          {programme.university.city ? (
            <> · <bdi dir="auto">{programme.university.city}</bdi></>
          ) : null}
        </p>

        <dl className="mt-4 grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
          <div className="min-w-0 bg-[var(--surface-subtle)] p-3">
            <dt className="text-[11px] font-semibold text-[var(--muted)]">{labels.field}</dt>
            <dd className="mt-1 truncate text-sm font-semibold" title={programme.field || "—"}>
              <bdi dir="auto">{programme.field || "—"}</bdi>
            </dd>
          </div>
          <div className="min-w-0 bg-[var(--surface-subtle)] p-3">
            <dt className="text-[11px] font-semibold text-[var(--muted)]">{labels.german}</dt>
            <dd className="mt-1 text-sm font-semibold">
              {programme.germanLevelRequired || labels.requirementCheck}
            </dd>
          </div>
          <div className="min-w-0 bg-[var(--surface-subtle)] p-3">
            <dt className="text-[11px] font-semibold text-[var(--muted)]">{labels.uniAssist}</dt>
            <dd className="mt-1 text-sm font-semibold">
              {programme.uniAssistRequired ? labels.yes : labels.requirementCheck}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap gap-2.5 pt-4">
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
          {programme.applicationUrl ? (
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
      </div>
    </article>
  );
}
