import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

export function CandidateOrientationResultHeader({
  eyebrow,
  title,
  description,
  completionLabel,
  statusLabel,
  statusVariant = "neutral",
  facts,
  profileDetailsLabel,
  profileDetailsHelp,
  allFacts,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  completionLabel: ReactNode;
  statusLabel: ReactNode;
  statusVariant?: "success" | "info" | "warning" | "error" | "neutral";
  facts: Array<{ label: ReactNode; value: ReactNode }>;
  profileDetailsLabel: ReactNode;
  profileDetailsHelp?: ReactNode;
  allFacts: readonly (readonly ReactNode[])[];
}) {
  return (
    <section className="orientation-print-hide orientation-result-hero">
      <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[var(--success-border)] bg-[var(--success-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--success-strong)]">
        <span aria-hidden="true" className="flex size-4 items-center justify-center rounded-full bg-[var(--success)] text-[10px] text-white">✓</span>
        <span>{completionLabel}</span>
      </div>

      <div className="mt-4 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--surface)] p-5 shadow-[0_18px_40px_-35px_rgba(19,33,49,0.45)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 max-w-[48rem]">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-[clamp(1.95rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[var(--foreground)]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-[68ch] text-[15px] leading-7 text-[var(--muted)] sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>

        <dl className="mt-7 grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 xl:grid-cols-4">
          {facts.map((fact, index) => (
            <div
              key={index}
              className="min-w-0 bg-[var(--surface-subtle)] px-4 py-4 sm:px-5"
            >
              <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
                {fact.label}
              </dt>
              <dd className="m-0 mt-1.5 text-sm font-semibold leading-6 text-[var(--foreground)] [overflow-wrap:anywhere]">
                <bdi dir="auto">{fact.value}</bdi>
              </dd>
            </div>
          ))}
        </dl>

        <details className="group mt-6 border-t border-[var(--border)] pt-5">
          <summary className="min-h-10 cursor-pointer py-2 text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline">
            {profileDetailsLabel}
          </summary>
          {profileDetailsHelp ? (
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{profileDetailsHelp}</p>
          ) : null}
          <dl className="mt-4 grid gap-x-7 gap-y-0 sm:grid-cols-2">
            {allFacts.map((fact, index) => (
              <div key={index} className="border-b border-[var(--border)] py-3">
                <dt className="text-xs font-semibold leading-5 text-[var(--muted)]">{fact[0]}</dt>
                <dd className="m-0 mt-1 text-sm font-semibold leading-6 text-[var(--foreground)] [overflow-wrap:anywhere]">
                  <bdi dir="auto">{fact[1]}</bdi>
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </section>
  );
}
