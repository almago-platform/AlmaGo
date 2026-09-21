import Link from "next/link";
import type { ReactNode } from "react";

const variants = { primary: "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800", secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50" };

export function ButtonLink({ children, href, variant = "primary" }: { children: ReactNode; href: string; variant?: keyof typeof variants }) {
  return <Link href={href} className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${variants[variant]}`}>{children}</Link>;
}
