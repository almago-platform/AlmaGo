import type { OrientationProgrammeEvaluation } from "@/lib/orientation-engine/types";
import { ProspectUniversityCover } from "@/components/prospect/ProspectUniversityCover";
import { recommendationMatchesPreferredCity } from "@/lib/prospect/programmes";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M4.5 10h10M11 6.5 14.5 10 11 13.5" />
    </svg>
  );
}

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

  const badge = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--brand-strong)] ring-1 ring-inset ring-[var(--brand-border)]/60">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
      {labels.projectMatch}
    </span>
  );

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {badge}
        {preferredCity ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff9f3] px-2.5 py-1 text-[10px] font-bold text-[#17603c] ring-1 ring-inset ring-[#c7ead6]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1d8b58]" aria-hidden="true" />
            {labels.preferredCity}
          </span>
        ) : null}
      </div>

      <div className="mt-3.5">
        <h3 className={compact ? "text-[1.02rem] font-bold leading-tight tracking-[-0.025em] [overflow-wrap:anywhere]" : "text-[1.32rem] font-bold leading-tight tracking-[-0.03em] [overflow-wrap:anywhere]"}>
          <bdi dir="auto">{programme.name}</bdi>
        </h3>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          <bdi dir="auto">{programme.university.name}</bdi>
          {programme.university.city ? <> · <bdi dir="auto">{programme.university.city}</bdi></> : null}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#f1eee8] px-3 py-1.5 text-xs font-semibold text-[#34383b]">
          {programme.degreeLevel}
        </span>
        {programme.teachingLanguage ? (
          <span className="rounded-full bg-[#f1eee8] px-3 py-1.5 text-xs font-semibold text-[#34383b]">
            <bdi dir="auto">{programme.teachingLanguage}</bdi>
          </span>
        ) : null}
      </div>

      {!compact ? (
        <dl className="mt-5 grid overflow-hidden rounded-2xl border border-black/[.07] bg-[#f6f3ed] sm:grid-cols-3">
          <div className="min-w-0 border-b border-black/[.06] px-4 py-3 sm:border-b-0 sm:border-e">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.field}</dt>
            <dd className="mt-1.5 text-sm font-semibold text-[#202326]"><bdi dir="auto">{programme.field || "—"}</bdi></dd>
          </div>
          <div className="min-w-0 border-b border-black/[.06] px-4 py-3 sm:border-b-0 sm:border-e">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.german}</dt>
            <dd className="mt-1.5 text-sm font-semibold text-[#202326]">{programme.germanLevelRequired || labels.requirementCheck}</dd>
          </div>
          <div className="min-w-0 px-4 py-3">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.uniAssist}</dt>
            <dd className="mt-1.5 text-sm font-semibold text-[#202326]">
              {programme.uniAssistRequired ? labels.yes : labels.requirementCheck}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
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
        {programme.applicationUrl && !compact ? (
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
    </>
  );

  if (compact) {
    return (
      <article className="group rounded-[1.25rem] border border-black/[.07] bg-[rgba(255,254,250,.88)] p-4 shadow-[0_18px_50px_-36px_rgba(0,0,0,.32)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-border)] hover:bg-white hover:shadow-[0_26px_60px_-36px_rgba(0,0,0,.4)]">
        {body}
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-black/[.07] bg-[var(--surface)] shadow-[0_22px_60px_-38px_rgba(0,0,0,.42)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-border)] hover:shadow-[0_32px_76px_-40px_rgba(0,0,0,.5)]">
      <div className="overflow-hidden">
        <ProspectUniversityCover
          universityName={programme.university.name}
          city={programme.university.city}
          media={programme.university.media}
          compact
        />
      </div>
      <div className="p-5 sm:p-6">{body}</div>
    </article>
  );
}
