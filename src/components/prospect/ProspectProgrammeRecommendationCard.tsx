import type { OrientationProgrammeEvaluation } from "@/lib/orientation-engine/types";
import { ProspectUniversityCover } from "@/components/prospect/ProspectUniversityCover";
import { recommendationMatchesPreferredCity } from "@/lib/prospect/programmes";
import { buttonClassName } from "@/components/ui/Button";
import { localizedProgrammeField, localizedTeachingLanguage } from "@/lib/prospect/catalogue-presentation";

type ProspectLocale = "fr" | "ar" | "en" | "de";

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
  locale,
  compact = false,
  showUniversityPhoto = true,
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
  locale: ProspectLocale;
  compact?: boolean;
  showUniversityPhoto?: boolean;
}) {
  const programme = recommendation.programme;
  const preferredCity = recommendationMatchesPreferredCity(recommendation);
  const teachingLanguage = programme.teachingLanguage
    ? localizedTeachingLanguage(programme.teachingLanguage, locale)
    : null;
  const programmeField = localizedProgrammeField(programme.field, locale);
  const verificationRows = [
    [labels.german, programme.germanLevelRequired || labels.requirementCheck],
    [labels.uniAssist, programme.uniAssistRequired ? labels.yes : labels.requirementCheck],
  ] as const;
  const verificationCount = verificationRows.filter(([, value]) => value === labels.requirementCheck).length;

  const badge = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--premium-green-wash)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--success-strong)] ring-1 ring-inset ring-[var(--success-border)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
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
        {teachingLanguage ? (
          <span className="rounded-full bg-[var(--premium-cream)] px-3 py-1.5 text-xs font-semibold text-[var(--premium-ink-muted)]">
            <bdi dir="auto">{teachingLanguage}</bdi>
          </span>
        ) : null}
      </div>

      {!compact ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(13rem,0.78fr)]">
          <div className="rounded-2xl border border-[var(--premium-border)] bg-[var(--premium-cream)] px-4 py-3.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{labels.field}</p>
            <p className="mt-1.5 text-sm font-semibold leading-5 text-[var(--foreground)] [overflow-wrap:normal]">
              <bdi dir="auto">{programmeField || "—"}</bdi>
            </p>
          </div>
          <details className="rounded-2xl border border-[var(--premium-border)] bg-white/70 px-4 py-3.5">
            <summary className="cursor-pointer list-none text-sm font-bold text-[var(--foreground)] marker:content-none">
              <span className="flex items-center justify-between gap-3">
                <span>{verificationCount ? `${verificationCount} · ${labels.requirementCheck}` : labels.requirementCheck}</span>
                <span className="text-[var(--brand)]" aria-hidden="true">＋</span>
              </span>
            </summary>
            <dl className="mt-3 grid gap-2 border-t border-[var(--premium-border)] pt-3">
              {verificationRows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 text-sm">
                  <dt className="font-semibold text-[var(--muted)]">{label}</dt>
                  <dd className="text-end font-semibold text-[var(--foreground)]"><bdi dir="auto">{value}</bdi></dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
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
          programmeLabel={programmeField}
        />
      </div>
      <div className="p-5 sm:p-6">{body}</div>
    </article>
  );
}
