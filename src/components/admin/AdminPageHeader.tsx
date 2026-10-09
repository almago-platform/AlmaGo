import type { ReactNode } from "react";

export function AdminPageHeader({
  section,
  title,
  description,
  actions,
}: {
  section: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header mb-5 sm:mb-6">
      <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-5xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.11em] text-[var(--brand-strong)]">
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              {section}
            </p>
            <h1 className="mt-1.5 break-words text-[clamp(1.55rem,2.4vw,2rem)] font-semibold leading-tight tracking-[-0.03em] text-slate-950">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="admin-page-actions flex w-full shrink-0 flex-wrap gap-2 lg:w-auto lg:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
