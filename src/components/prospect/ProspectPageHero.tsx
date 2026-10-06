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
    <header className="prospect-page-hero pc-hero px-5 py-5 sm:px-7 sm:py-6 lg:px-8 lg:py-7">
      <div className="pc-hero-orbit" aria-hidden="true" />
      <div className="absolute -end-5 -top-4 h-24 w-24 rounded-full border border-white/[.05]" aria-hidden="true" />

      <div className="relative max-w-5xl">
        <p className="pc-kicker pc-kicker-inverse">{eyebrow}</p>

        <h1 className="mt-2.5 max-w-4xl text-[clamp(1.85rem,3.35vw,3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-white">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/66 sm:text-[0.95rem] sm:leading-6">
            {subtitle}
          </p>
        ) : null}

        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </header>
  );
}
