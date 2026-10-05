import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";
import { ProspectUniversityCover } from "@/components/prospect/ProspectUniversityCover";

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
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[1.4rem] border border-black/[.07] bg-[var(--surface)] shadow-[0_22px_60px_-38px_rgba(0,0,0,.42)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-border)] hover:shadow-[0_32px_76px_-40px_rgba(0,0,0,.5)]">
      <div className="overflow-hidden">
        <ProspectUniversityCover
          universityName={programme.university.name}
          city={programme.university.city}
          media={programme.university.media}
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ring-1 ring-inset ${projectMatch ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] ring-[var(--brand-border)]/60" : "bg-[#f1eee8] text-[#555b60] ring-black/[.06]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${projectMatch ? "bg-[var(--brand)]" : "bg-[#92979b]"}`} aria-hidden="true" />
            {projectMatch ? labels.projectMatch : labels.generalCatalogue}
          </span>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#f1eee8] px-2.5 py-1 text-[11px] font-semibold text-[#34383b]">
              {programme.degreeLevel}
            </span>
            {programme.teachingLanguage ? (
              <span className="rounded-full bg-[#f1eee8] px-2.5 py-1 text-[11px] font-semibold text-[#34383b]">
                <bdi dir="auto">{programme.teachingLanguage}</bdi>
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="mt-4 text-[1.32rem] font-bold leading-tight tracking-[-0.03em] text-[#1b1e20] [overflow-wrap:anywhere]">
          <bdi dir="auto">{programme.name}</bdi>
        </h3>
        <p className="mt-1.5 text-sm leading-5 text-[var(--muted)]">
          <bdi dir="auto">{programme.university.name}</bdi>
          {programme.university.city ? (
            <> · <bdi dir="auto">{programme.university.city}</bdi></>
          ) : null}
        </p>

        <dl className="mt-5 grid overflow-hidden rounded-2xl border border-black/[.07] bg-[#f6f3ed] sm:grid-cols-3">
          <div className="min-w-0 border-b border-black/[.06] px-4 py-3 sm:border-b-0 sm:border-e">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.field}</dt>
            <dd className="mt-1.5 truncate text-sm font-semibold text-[#202326]" title={programme.field || "—"}>
              <bdi dir="auto">{programme.field || "—"}</bdi>
            </dd>
          </div>
          <div className="min-w-0 border-b border-black/[.06] px-4 py-3 sm:border-b-0 sm:border-e">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.german}</dt>
            <dd className="mt-1.5 text-sm font-semibold text-[#202326]">
              {programme.germanLevelRequired || labels.requirementCheck}
            </dd>
          </div>
          <div className="min-w-0 px-4 py-3">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.uniAssist}</dt>
            <dd className="mt-1.5 text-sm font-semibold text-[#202326]">
              {programme.uniAssistRequired ? labels.yes : labels.requirementCheck}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-5">
          {programme.programmeSourceUrl ? (
            <a
              href={programme.programmeSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
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
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-[0_16px_34px_-18px_rgba(216,6,33,.95)]"
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
