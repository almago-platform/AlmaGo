import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

export function PageHeader({
  badge,
  title,
  description,
  actions,
}: {
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-[var(--border)] pb-7 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="min-w-0 max-w-3xl">
        {badge && <Badge variant="neutral">{badge}</Badge>}
        <h1 className={`${badge ? "mt-4" : ""} ds-h1 break-words`}>{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex w-full shrink-0 flex-wrap gap-3 lg:w-auto">{actions}</div>}
    </header>
  );
}
