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
    <header className="admin-page-header mb-6 border-b border-[var(--border)] pb-5 sm:mb-7 sm:pb-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--brand-border)] bg-[var(--brand-subtle)] px-3 py-1.5">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand-strong)]">{section}</p>
          </div>
          <h1 className="mt-3 break-words text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--foreground)] sm:text-[2.35rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2.5 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[0.95rem] sm:leading-7">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="admin-page-actions flex w-full shrink-0 flex-wrap gap-2.5 xl:w-auto xl:justify-end">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
