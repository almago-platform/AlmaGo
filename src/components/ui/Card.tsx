import type { ElementType, ReactNode } from "react";

type CardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  "aria-labelledby"?: string;
};

export function Card({
  as: Component = "section",
  children,
  className = "",
  interactive = false,
  "aria-labelledby": labelledBy,
}: CardProps) {
  return (
    <Component
      aria-labelledby={labelledBy}
      className={`ds-card rounded-[var(--radius-panel)] p-5 sm:p-6 ${interactive ? "ds-card-interactive" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
