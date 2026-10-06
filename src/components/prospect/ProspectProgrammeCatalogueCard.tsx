import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";
import { ProspectUniversityCover } from "@/components/prospect/ProspectUniversityCover";
import { buttonClassName } from "@/components/ui/Button";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M4.5 10h10M11 6.5 14.5 10 11 13.5" />
    </svg>
  );
}

export function ProspectProgrammeCatalogueCard({
  programme,
  projectMatch,
  labels,
  wide = false,
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
  wide?: boolean;
}) {
  return (
    <article
      className={
        "pc-card pc-card-interactive group min-w-0 overflow-hidden bg-[var(--surface)] " +
        (wide
          ? "lg:grid lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)]"
          : "flex flex-col")
      }
    >
      <div className="min-w-0 overflow-hidden">
        <ProspectUniversityCover
          universityName={programme.university.name}
          city={programme.university.city}
          media={programme.university.media}
          compact={!wide && !projectMatch}
          wide={wide}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ring-1 ring-inset ${projectMatch ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] ring-[var(--brand-border)]/60" : "bg-[var(--premium-cream)] text-[#555b60] ring-black/[.06]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${projectMatch ? "bg-[var(--brand)]" : "bg-[#92979b]"}`} aria-hidden="true" />
            {projectMatch ? labels.projectMatch : labels.generalCatalogue}
          </span>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--premium-cream)] px-2.5 py-1 text-[11px] font-semibold text-[var(--premium-ink-muted)]">
              {programme.degreeLevel}
            </span>
            {programme.teachingLanguage ? (
              <span className="rounded-full bg-[var(--premium-cream)] px-2.5 py-1 text-[11px] font-semibold text-[var(--premium-ink-muted)]">
                <bdi dir="auto">{programme.teachingLanguage}</bdi>
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="mt-3.5 text-[1.18rem] font-bold leading-tight tracking-[-0.03em] text-[#1b1e20] [overflow-wrap:anywhere]">
          <bdi dir="auto">{programme.name}</bdi>
        </h3>
        <p className="mt-1.5 text-sm leading-5 text-[var(--muted)]">
          <bdi dir="auto">{programme.university.name}</bdi>
          {programme.university.city ? (
            <> · <bdi dir="auto">{programme.university.city}</bdi></>
          ) : null}
        </p>

        <dl className="mt-4 grid overflow-hidden rounded-2xl border border-[var(--premium-border)] bg-[var(--premium-cream)] sm:grid-cols-3">
          <div className="min-w-0 border-b border-[var(--premium-border)] px-4 py-3 sm:border-b-0 sm:border-e">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.field}</dt>
            <dd className="mt-1.5 truncate text-sm font-semibold text-[var(--foreground)]" title={programme.field || "—"}>
              <bdi dir="auto">{programme.field || "—"}</bdi>
            </dd>
          </div>
          <div className="min-w-0 border-b border-[var(--premium-border)] px-4 py-3 sm:border-b-0 sm:border-e">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.german}</dt>
            <dd className="mt-1.5 text-sm font-semibold text-[var(--foreground)]">
              {programme.germanLevelRequired || labels.requirementCheck}
            </dd>
          </div>
          <div className="min-w-0 px-4 py-3">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.uniAssist}</dt>
            <dd className="mt-1.5 text-sm font-semibold text-[var(--foreground)]">
              {programme.uniAssistRequired ? labels.yes : labels.requirementCheck}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-4">
          {programme.programmeSourceUrl ? (
            <a
              href={programme.programmeSourceUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName("secondary", "min-h-10 gap-2 px-4 py-2")}
            >
              {labels.source}
              <ArrowIcon />
            </a>
          ) : null}
          {programme.applicationUrl ? (
            <a
              href={programme.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName("primary", "min-h-10 gap-2 px-4 py-2")}
            >
              {labels.applyLink}
              <ArrowIcon />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
