import type { ElementType, ReactNode } from "react";

type CardProps = { as?: ElementType; children: ReactNode; className?: string };

export function Card({ as: Component = "section", children, className = "" }: CardProps) {
  return (
    <Component className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] ${className}`}>
      {children}
    </Component>
  );
}
