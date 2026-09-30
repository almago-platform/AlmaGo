"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentSharedCopy } from "@/content/student-shared-copy";

export type StudentJourneyStage = {
  label: string;
  detail: string;
  href?: string;
  tone?: "done" | "active" | "neutral";
};

export function StudentJourneyOverview({
  stages,
  showProgressSummary = true,
}: {
  stages: StudentJourneyStage[];
  showProgressSummary?: boolean;
}) {
  const { locale, direction } = useLocale();
  const copy = studentSharedCopy[locale].overview;
  const totalStages = stages.length;
  const completedStages = stages.filter((stage) => stage.tone === "done");
  const activeStage = stages.find((stage) => stage.tone === "active");
  const progressPercent = totalStages > 0 ? Math.round((completedStages.length / totalStages) * 100) : 0;
  const openArrow = direction === "rtl" ? "←" : "→";

  return (
    <section aria-labelledby="student-journey-title" className="mt-7 overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_64px_-54px_rgba(28,33,36,0.45)]">
      <div className={`grid gap-5 border-b border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-5 sm:px-6 ${showProgressSummary ? "lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end" : ""}`}>
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand-strong)]">{copy.eyebrow}</p>
          <h2 id="student-journey-title" className="editorial-accent mt-2 text-[1.7rem] leading-[1.08] text-[var(--foreground)] sm:text-[2rem]">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.intro}</p>
        </div>

        {showProgressSummary && (
          <div>
            <div className="flex items-center justify-between gap-4 text-xs font-semibold text-[var(--muted)]">
              <span>{completedStages.length} / {totalStages} {copy.completed}</span>
              <span className="font-bold text-[var(--brand)]">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-full rounded-full bg-[var(--brand)] transition-[width]" style={{ width: `${progressPercent}%` }} />
            </div>
            {activeStage && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                {copy.active}: <span className="font-bold text-[var(--foreground)]">{activeStage.label}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <ol className="grid gap-0 sm:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage, index) => {
          const status =
            stage.tone === "done"
              ? { label: copy.done, className: "border-emerald-200 bg-emerald-50 text-emerald-800", marker: "✓" }
              : stage.tone === "active"
                ? { label: copy.inProgress, className: "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand)]", marker: String(index + 1) }
                : { label: copy.upcoming, className: "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--muted)]", marker: String(index + 1) };

          const content = (
            <div className="flex min-h-40 flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-full border text-xs font-bold ${status.className}`}>
                  {status.marker}
                </span>
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{status.label}</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[var(--foreground)]">{stage.label}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{stage.detail}</p>
              <span className="mt-auto pt-4 text-xs font-bold text-[var(--brand)]">{stage.href ? `${copy.open} ${openArrow}` : status.label}</span>
            </div>
          );

          return (
            <li key={stage.label} className="student-journey-cell border-b border-[var(--border)]">
              {stage.href ? (
                <Link
                  href={stage.href}
                  className="block h-full transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]"
                >
                  {content}
                </Link>
              ) : content}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
