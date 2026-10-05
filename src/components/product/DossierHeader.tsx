import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

export function DossierHeader({
  eyebrow,
  title,
  description,
  status,
  statusVariant = "neutral",
  facts,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  statusVariant?: "success" | "info" | "warning" | "error" | "neutral";
  facts?: Array<{ label: ReactNode; value: ReactNode }>;
  actions?: ReactNode;
}) {
  return (
    <header className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow ? (
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                {eyebrow}
              </p>
            ) : null}
            {status ? <Badge variant={statusVariant}>{status}</Badge> : null}
          </div>
          <h1 className="mt-2 text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--foreground)] sm:text-[2.5rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      {facts?.length ? (
        <dl className="mt-5 grid overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] sm:grid-cols-2 xl:grid-cols-4">
          {facts.map((fact, index) => (
            <div
              key={index}
              className="min-w-0 border-b border-[var(--border)] px-4 py-3 last:border-b-0 sm:border-e sm:[&:nth-child(even)]:border-e-0 xl:border-b-0 xl:[&:nth-child(even)]:border-e xl:last:border-e-0"
            >
              <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
                {fact.label}
              </dt>
              <dd className="m-0 mt-1 text-sm font-semibold text-[var(--foreground)] [overflow-wrap:anywhere]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </header>
  );
}
