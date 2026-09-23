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
    <header className="mb-7 flex flex-col gap-5 border-b border-[var(--border)] pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
      <div className="min-w-0 max-w-3xl">
        {badge && <Badge variant="success">{badge}</Badge>}
        <h1
          className={`${badge ? "mt-4" : ""} break-words font-semibold tracking-[-0.03em] text-slate-950`}
          style={{ fontSize: "var(--text-page-title)", lineHeight: "var(--page-leading)" }}
        >
          {title}
        </h1>
        {description && <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">{description}</p>}
      </div>
      {actions && <div className="flex w-full shrink-0 flex-wrap gap-3 sm:w-auto">{actions}</div>}
    </header>
  );
}
