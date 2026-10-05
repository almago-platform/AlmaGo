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
  allFacts: Array<readonly [ReactNode, ReactNode]>;
}) {
  return (
    <section className="orientation-print-hide">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--success-strong)]">
        <span aria-hidden="true">✓</span>
        <span>{completionLabel}</span>
      </div>

      <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--brand-border)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-4xl">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--foreground)] sm:text-[2.65rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>

        <dl className="mt-6 grid overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] sm:grid-cols-2 xl:grid-cols-4">
          {facts.map((fact, index) => (
            <div
              key={index}
              className="min-w-0 border-b border-[var(--border)] px-4 py-3 last:border-b-0 sm:border-e sm:[&:nth-child(even)]:border-e-0 xl:border-b-0 xl:[&:nth-child(even)]:border-e xl:last:border-e-0"
            >
              <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
                {fact.label}
              </dt>
              <dd className="m-0 mt-1 text-sm font-semibold leading-5 text-[var(--foreground)] [overflow-wrap:anywhere]">
                <bdi dir="auto">{fact.value}</bdi>
              </dd>
            </div>
          ))}
        </dl>

        <details className="mt-5 border-t border-[var(--border)] pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
            {profileDetailsLabel}
          </summary>
          {profileDetailsHelp ? (
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{profileDetailsHelp}</p>
          ) : null}
          <dl className="mt-4 grid gap-x-7 gap-y-0 sm:grid-cols-2">
            {allFacts.map(([label, value], index) => (
              <div key={index} className="border-b border-[var(--border)] py-3">
                <dt className="text-xs font-semibold leading-5 text-[var(--muted)]">{label}</dt>
                <dd className="m-0 mt-1 text-sm font-semibold leading-6 text-[var(--foreground)] [overflow-wrap:anywhere]">
                  <bdi dir="auto">{value}</bdi>
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </section>
  );
}
