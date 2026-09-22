import type { ElementType, ReactNode } from "react";

type CardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  "aria-labelledby"?: string;
};

export function Card({ as: Component = "section", children, className = "", "aria-labelledby": labelledBy }: CardProps) {
  return (
    <Component aria-labelledby={labelledBy} className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] sm:p-6 ${className}`}>
      {children}
    </Component>
  );
}
