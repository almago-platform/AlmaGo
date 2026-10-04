import type { ReactNode } from "react";

export function ProspectPageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  children?: ReactNode;
}) {
  return (
    <header className="prospect-page-hero relative overflow-hidden rounded-[var(--radius-panel)] border border-slate-800 bg-[var(--foreground)] px-5 py-7 text-white shadow-[var(--shadow-soft)] sm:px-7 sm:py-8">
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-[var(--brand)]/14 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-amber-300/10 blur-3xl" aria-hidden="true" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
          {eyebrow}
        </p>
        <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/72 sm:text-base">
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>
    </header>
  );
}
