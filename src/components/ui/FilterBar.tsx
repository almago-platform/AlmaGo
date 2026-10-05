import type { ReactNode } from "react";

export function FilterBar({
  label = "Filtres",
  children,
  actions,
  className = "",
}: {
  label?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={typeof label === "string" ? label : undefined}
      className={`rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            {label}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-end">
            {children}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
