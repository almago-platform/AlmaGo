import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{eyebrow}</p>
        ) : null}
        <h2 className={`${eyebrow ? "mt-2" : ""} text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]`}>
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
