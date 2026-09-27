import type { ReactNode } from "react";

const variants = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  info: "bg-[var(--brand-soft)] text-[var(--brand-strong)] ring-[var(--brand-border)]",
  warning: "bg-amber-50 text-amber-900 ring-amber-600/20",
  neutral: "bg-[var(--surface-muted)] text-[var(--foreground)] ring-[var(--brand-border)]",
};

export function Badge({ children, variant = "neutral" }: { children: ReactNode; variant?: keyof typeof variants }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 ring-1 ring-inset ${variants[variant]}`}>
      {children}
    </span>
  );
}
