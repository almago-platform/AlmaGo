import type { ElementType, ReactNode } from "react";

type CardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  "aria-labelledby"?: string;
};

export function Card({ as: Component = "section", children, className = "", "aria-labelledby": labelledBy }: CardProps) {
  return (
    <Component
      aria-labelledby={labelledBy}
      className={`rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6 ${className}`}
    >
      {children}
    </Component>
  );
}
