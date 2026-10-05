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
    <header className="prospect-page-hero overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] border-t-[3px] border-t-[var(--brand)] bg-[var(--surface)] px-5 py-5 shadow-[var(--shadow-card)] sm:px-6 sm:py-6">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
        {eyebrow}
      </p>
      <h1 className="mt-1.5 max-w-4xl text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)] sm:text-[1.9rem] sm:leading-tight">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--muted)] sm:text-[0.95rem]">
          {subtitle}
        </p>
      ) : null}
      {children}
    </header>
  );
}
