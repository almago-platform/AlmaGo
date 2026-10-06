import type { OrientationProgrammeEvaluation } from "@/lib/orientation-engine/types";
import { ProspectUniversityCover } from "@/components/prospect/ProspectUniversityCover";
import { recommendationMatchesPreferredCity } from "@/lib/prospect/programmes";
import { buttonClassName } from "@/components/ui/Button";

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
  showUniversityPhoto = true,
  visualIndex = 1,
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
  showUniversityPhoto?: boolean;
  visualIndex?: number;
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--premium-green-wash)] px-2.5 py-1 text-[10px] font-bold text-[#17603c] ring-1 ring-inset ring-[#c7ead6]">
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
        <span className="rounded-full bg-[var(--premium-cream)] px-3 py-1.5 text-xs font-semibold text-[var(--premium-ink-muted)]">
          {programme.degreeLevel}
        </span>
        {programme.teachingLanguage ? (
          <span className="rounded-full bg-[var(--premium-cream)] px-3 py-1.5 text-xs font-semibold text-[var(--premium-ink-muted)]">
            <bdi dir="auto">{programme.teachingLanguage}</bdi>
          </span>
        ) : null}
      </div>

      {!compact ? (
        <dl className="mt-5 grid gap-2 rounded-2xl border border-[var(--premium-border)] bg-[var(--premium-cream)] p-2.5">
          {[
            [labels.field, programme.field || "—"],
            [labels.german, programme.germanLevelRequired || labels.requirementCheck],
            [labels.uniAssist, programme.uniAssistRequired ? labels.yes : labels.requirementCheck],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="grid min-w-0 grid-cols-[minmax(6.5rem,0.7fr)_minmax(0,1.3fr)] items-start gap-3 rounded-xl bg-white/55 px-3 py-2.5"
            >
              <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</dt>
              <dd className="min-w-0 text-sm font-semibold leading-5 text-[var(--foreground)] [overflow-wrap:normal]">
                <bdi dir="auto">{value}</bdi>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {programme.programmeSourceUrl ? (
          <a
            href={programme.programmeSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
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
            className={buttonClassName("primary", "min-h-10 gap-2 px-4 py-2")}
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
      <article className="pc-card pc-card-interactive group bg-[rgba(255,254,250,.88)] p-4">
        {body}
      </article>
    );
  }

  return (
    <article className="pc-card pc-card-interactive group overflow-hidden bg-[var(--surface)]">
      <div className="overflow-hidden">
        <ProspectUniversityCover
          universityName={programme.university.name}
          city={programme.university.city}
          media={programme.university.media}
          compact
          usePhoto={showUniversityPhoto}
          editorialIndex={visualIndex}
        />
      </div>
      <div className="p-5 sm:p-6">{body}</div>
    </article>
  );
}
