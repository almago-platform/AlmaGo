import type { ElementType, ReactNode } from "react";

type CardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  "aria-labelledby"?: string;
};

export function Card({ as: Component = "section", children, className = "", "aria-labelledby": labelledBy }: CardProps) {
  return (
    <Component aria-labelledby={labelledBy} className={`rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6 ${className}`}>
      {children}
    </Component>
  );
}
