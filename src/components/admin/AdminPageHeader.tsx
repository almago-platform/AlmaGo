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
    <header className="admin-page-header mb-5 sm:mb-6">
      <div
        className="relative overflow-hidden rounded-[1.1rem] border border-black/10 bg-[#17191b] px-5 py-4 text-white shadow-[0_18px_48px_-38px_rgba(0,0,0,.72)] sm:px-6 sm:py-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 92% 4%, rgba(244,180,0,.13), transparent 17rem), radial-gradient(circle at 4% 120%, rgba(216,6,33,.16), transparent 20rem)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#d80621_0_62%,#f4b400_62%_78%,transparent_78%)]" aria-hidden="true" />
        <div className="absolute -end-10 -top-14 h-36 w-36 rounded-full border border-white/[.05]" aria-hidden="true" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-2.5 py-1">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_rgba(244,180,0,.1)]" />
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-white/65">{section}</p>
            </div>
            <h1 className="mt-2 break-words text-[clamp(1.7rem,2.8vw,2.45rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-white">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/64">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="admin-page-actions flex w-full shrink-0 flex-wrap gap-2 lg:w-auto lg:justify-end [&_a]:shadow-sm [&_button]:shadow-sm">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
