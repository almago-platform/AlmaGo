import type { ReactNode } from "react";

const variants = { success: "bg-emerald-50 text-emerald-800 ring-emerald-600/20", info: "bg-blue-50 text-blue-800 ring-blue-600/20", warning: "bg-amber-50 text-amber-900 ring-amber-600/20", neutral: "bg-slate-100 text-slate-700 ring-slate-500/20" };

export function Badge({ children, variant = "neutral" }: { children: ReactNode; variant?: keyof typeof variants }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${variants[variant]}`}>
      {children}
    </span>
  );
}
