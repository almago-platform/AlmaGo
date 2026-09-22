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
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {badge && <Badge variant="success">{badge}</Badge>}
        <h1 className={`${badge ? "mt-4" : ""} text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl`}>{title}</h1>
        {description && <p className="mt-2 text-base leading-7 text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
