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
    <header
      className="prospect-page-hero relative overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#17191b] px-5 py-5 text-white shadow-[0_28px_70px_-44px_rgba(0,0,0,.68)] sm:px-7 sm:py-6 lg:px-8 lg:py-7"
      style={{
        backgroundImage:
          "radial-gradient(circle at 86% 12%, rgba(244,180,0,.16), transparent 18rem), radial-gradient(circle at 8% 100%, rgba(216,6,33,.18), transparent 20rem)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#d80621_0_62%,#f4b400_62%_78%,transparent_78%)]" aria-hidden="true" />
      <div className="absolute -end-12 -top-14 h-40 w-40 rounded-full border border-white/[.06]" aria-hidden="true" />
      <div className="absolute -end-5 -top-4 h-24 w-24 rounded-full border border-white/[.05]" aria-hidden="true" />

      <div className="relative max-w-5xl">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_rgba(244,180,0,.11)]" aria-hidden="true" />
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-white/68">
            {eyebrow}
          </p>
        </div>

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
