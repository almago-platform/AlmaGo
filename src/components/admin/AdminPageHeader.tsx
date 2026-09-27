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
    <header className="mb-6 border-b border-[var(--border)] pb-5 sm:mb-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 max-w-4xl">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{section}</p>
          <h1 className="mt-1.5 break-words text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--foreground)] sm:text-[2.35rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[0.95rem]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex w-full shrink-0 flex-wrap gap-2 xl:w-auto xl:justify-end">{actions}</div>}
      </div>
    </header>
  );
}
