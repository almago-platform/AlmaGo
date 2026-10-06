import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";
import { ProspectUniversityCover } from "@/components/prospect/ProspectUniversityCover";
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

export function ProspectProgrammeCatalogueCard({
  programme,
  projectMatch,
  labels,
  locale,
  wide = false,
  showUniversityPhoto = true,
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
  locale: ProspectLocale;
  wide?: boolean;
  showUniversityPhoto?: boolean;
}) {
  const teachingLanguage = programme.teachingLanguage
    ? localizedTeachingLanguage(programme.teachingLanguage, locale)
    : null;
  const programmeField = localizedProgrammeField(programme.field, locale);
  const verificationRows = [
    [labels.german, programme.germanLevelRequired || labels.requirementCheck],
    [labels.uniAssist, programme.uniAssistRequired ? labels.yes : labels.requirementCheck],
  ] as const;
  const verificationCount = verificationRows.filter(([, value]) => value === labels.requirementCheck).length;

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
          usePhoto={showUniversityPhoto}
          programmeLabel={programmeField}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ring-1 ring-inset ${projectMatch ? "bg-[var(--premium-green-wash)] text-[var(--success-strong)] ring-[var(--success-border)]" : "bg-[var(--premium-cream)] text-[#555b60] ring-black/[.06]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${projectMatch ? "bg-[var(--success)]" : "bg-[#92979b]"}`} aria-hidden="true" />
            {projectMatch ? labels.projectMatch : labels.generalCatalogue}
          </span>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--premium-cream)] px-2.5 py-1 text-[11px] font-semibold text-[var(--premium-ink-muted)]">
              {programme.degreeLevel}
            </span>
            {teachingLanguage ? (
              <span className="rounded-full bg-[var(--premium-cream)] px-2.5 py-1 text-[11px] font-semibold text-[var(--premium-ink-muted)]">
                <bdi dir="auto">{teachingLanguage}</bdi>
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

        <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(13rem,0.78fr)]">
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
                <span className="text-[var(--warning-strong)]" aria-hidden="true">＋</span>
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
