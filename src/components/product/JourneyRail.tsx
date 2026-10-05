import Link from "next/link";
import type { ReactNode } from "react";

export type JourneyRailStep = {
  label: ReactNode;
  detail?: ReactNode;
  status: "done" | "active" | "upcoming" | "locked";
  href?: string;
};

const statusStyle = {
  done: {
    marker: "bg-[var(--success-soft)] text-[var(--success-strong)] border-[var(--success-border)]",
    label: "text-[var(--success-strong)]",
  },
  active: {
    marker: "bg-[var(--brand)] text-white border-[var(--brand)]",
    label: "text-[var(--brand-strong)]",
  },
  upcoming: {
    marker: "bg-[var(--surface-subtle)] text-[var(--muted)] border-[var(--border)]",
    label: "text-[var(--foreground)]",
  },
  locked: {
    marker: "bg-[var(--surface-disabled)] text-[var(--muted)] border-[var(--border)]",
    label: "text-[var(--muted)]",
  },
} as const;

export function JourneyRail({
  steps,
  ariaLabel = "Progression du dossier",
}: {
  steps: JourneyRailStep[];
  ariaLabel?: string;
}) {
  return (
    <nav aria-label={ariaLabel} className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]">
      <ol className="grid sm:grid-cols-2 xl:grid-cols-[repeat(var(--journey-count),minmax(0,1fr))]" style={{ "--journey-count": steps.length } as React.CSSProperties}>
        {steps.map((step, index) => {
          const style = statusStyle[step.status];
          const content = (
            <div className="flex min-h-24 items-start gap-3 border-b border-[var(--border)] p-4 sm:border-e sm:last:border-e-0 xl:border-b-0">
              <span
                aria-hidden="true"
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${style.marker}`}
              >
                {step.status === "done" ? "✓" : index + 1}
              </span>
              <span className="min-w-0">
                <span className={`block text-xs font-bold leading-5 ${style.label}`}>
                  {step.label}
                </span>
                {step.detail ? (
                  <span className="mt-1 block text-[11px] leading-4 text-[var(--muted)]">
                    {step.detail}
                  </span>
                ) : null}
              </span>
            </div>
          );

          return (
            <li key={index} className="min-w-0">
              {step.href && step.status !== "locked" ? (
                <Link
                  href={step.href}
                  className="block h-full transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]"
                >
                  {content}
                </Link>
              ) : content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
