import type { ReactNode } from "react";

type AdminWorkflowSectionProps = {
  step: string;
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  tone?: "neutral" | "brand" | "warning";
};

export function AdminWorkflowSection({
  step,
  title,
  description,
  badge,
  children,
  defaultOpen = false,
  tone = "neutral",
}: AdminWorkflowSectionProps) {
  const toneClass =
    tone === "brand"
      ? "border-[var(--brand-border)] bg-[var(--brand-soft)]/30"
      : tone === "warning"
        ? "border-[var(--warning-border)] bg-[var(--premium-gold-wash)]"
        : "border-[var(--border)] bg-[var(--surface-subtle)]";

  return (
    <details
      open={defaultOpen}
      className={`group rounded-[var(--radius-control)] border p-4 ${toneClass}`}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-[.55rem] outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-950">
            <span className="text-[var(--brand)]">{step}</span>
            {" — "}
            {title}
          </p>
          {description ? (
            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-700">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {badge}
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-full border border-[var(--border)] bg-white text-sm font-bold text-slate-500 transition-transform group-open:rotate-180"
          >
            ↓
          </span>
        </div>
      </summary>

      <div className="mt-4 border-t border-[var(--border)] pt-4">
        {children}
      </div>
    </details>
  );
}
