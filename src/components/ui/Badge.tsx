import type { ReactNode } from "react";

const variants = {
  success: "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success-strong)]",
  info: "border-[var(--info-border)] bg-[var(--info-soft)] text-[var(--info-strong)]",
  warning: "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning-strong)]",
  error: "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger-strong)]",
  neutral: "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--foreground-soft)]",
} as const;

export function Badge({ children, variant = "neutral" }: { children: ReactNode; variant?: keyof typeof variants }) {
  return (
    <span className={`ds-badge inline-flex items-center border px-2.5 py-1 leading-5 ${variants[variant]}`}>
      {children}
    </span>
  );
}
