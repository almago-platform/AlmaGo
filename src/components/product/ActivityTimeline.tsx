import type { ReactNode } from "react";

export type ActivityTimelineItem = {
  title: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  tone?: "brand" | "success" | "warning" | "info" | "neutral";
};

const markerTone = {
  brand: "border-[var(--brand-border)] bg-[var(--brand-soft)]",
  success: "border-[var(--success-border)] bg-[var(--success-soft)]",
  warning: "border-[var(--warning-border)] bg-[var(--warning-soft)]",
  info: "border-[var(--info-border)] bg-[var(--info-soft)]",
  neutral: "border-[var(--border)] bg-[var(--surface-subtle)]",
} as const;

export function ActivityTimeline({
  items,
  empty,
}: {
  items: ActivityTimelineItem[];
  empty?: ReactNode;
}) {
  if (!items.length) {
    return empty ? <div className="text-sm leading-6 text-[var(--muted)]">{empty}</div> : null;
  }

  return (
    <ol className="relative ms-3 border-s border-[var(--border)]">
      {items.map((item, index) => (
        <li key={index} className="relative pb-5 ps-6 last:pb-0">
          <span
            aria-hidden="true"
            className={`absolute -start-[0.45rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${markerTone[item.tone ?? "neutral"]}`}
          />
          <div className="min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h3 className="text-sm font-semibold leading-6 text-[var(--foreground)]">{item.title}</h3>
              {item.timestamp ? (
                <div className="shrink-0 text-xs leading-5 text-[var(--muted)]">{item.timestamp}</div>
              ) : null}
            </div>
            {item.description ? (
              <div className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">{item.description}</div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
