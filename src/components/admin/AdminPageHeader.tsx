import type { ReactNode } from "react";

export function AdminPageHeader({
  section,
  title,
  description,
  actions,
}: {
  section: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header mb-7 sm:mb-8">
      <div
        className="relative overflow-hidden rounded-[1.4rem] border border-black/10 bg-[#17191b] px-5 py-5 text-white shadow-[0_28px_70px_-44px_rgba(0,0,0,.68)] sm:px-7 sm:py-6"
        style={{
          backgroundImage:
            "radial-gradient(circle at 92% 4%, rgba(244,180,0,.13), transparent 17rem), radial-gradient(circle at 4% 120%, rgba(216,6,33,.16), transparent 20rem)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#d80621_0_62%,#f4b400_62%_78%,transparent_78%)]" aria-hidden="true" />
        <div className="absolute -end-14 -top-16 h-44 w-44 rounded-full border border-white/[.05]" aria-hidden="true" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_rgba(244,180,0,.1)]" />
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-white/65">{section}</p>
            </div>
            <h1 className="mt-3 break-words text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-white">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62 sm:text-[0.95rem] sm:leading-7">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="admin-page-actions flex w-full shrink-0 flex-wrap gap-2.5 xl:w-auto xl:justify-end [&_a]:shadow-sm [&_button]:shadow-sm">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
