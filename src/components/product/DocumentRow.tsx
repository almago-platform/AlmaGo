import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

type DocumentStatus = "approved" | "pending" | "replacement" | "missing" | "optional";

const statusConfig = {
  approved: { label: "Validé", variant: "success" as const },
  pending: { label: "À vérifier", variant: "warning" as const },
  replacement: { label: "À remplacer", variant: "error" as const },
  missing: { label: "Manquant", variant: "warning" as const },
  optional: { label: "Facultatif", variant: "neutral" as const },
};

export function DocumentRow({
  title,
  description,
  status,
  metadata,
  note,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  status: DocumentStatus;
  metadata?: ReactNode;
  note?: ReactNode;
  action?: ReactNode;
}) {
  const current = statusConfig[status];

  return (
    <article className="border-b border-[var(--premium-border)] py-4 last:border-b-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-6 text-[var(--foreground)]">{title}</h3>
            <Badge variant={current.variant}>{current.label}</Badge>
          </div>
          {description ? (
            <div className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">{description}</div>
          ) : null}
          {metadata ? <div className="mt-2 text-xs leading-5 text-[var(--muted)]">{metadata}</div> : null}
          {note ? (
            <div className="mt-3 rounded-[var(--radius-control)] bg-[var(--premium-cream)] px-3 py-2 text-xs leading-5 text-[var(--foreground-soft)]">
              {note}
            </div>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </article>
  );
}
