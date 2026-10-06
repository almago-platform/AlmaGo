import type { ReactNode } from "react";

function DefaultVisual() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={
            "flex items-center gap-3 rounded-xl border px-3.5 py-3 " +
            (index === 0
              ? "border-white/15 bg-white/[.08]"
              : "border-white/[.08] bg-white/[.035]")
          }
        >
          <span
            className={
              "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-extrabold " +
              (index === 0
                ? "bg-[var(--brand)] text-white"
                : "bg-white/10 text-white/55")
            }
          >
            {index + 1}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <span
              className={
                "block h-full rounded-full " +
                (index === 0
                  ? "w-3/5 bg-[var(--accent)]"
                  : index === 1
                    ? "w-2/5 bg-white/20"
                    : "w-1/4 bg-white/15")
              }
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function PremiumEmptyState({
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  visual,
  compact = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  visual?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={
        "pc-empty-state " +
        (compact ? "lg:grid-cols-[minmax(0,1fr)_18rem]" : "lg:grid-cols-[minmax(0,1fr)_22rem]")
      }
    >
      <div className={compact ? "p-4 sm:p-5" : "p-5 sm:p-6"}>
        {eyebrow ? <div className="pc-kicker">{eyebrow}</div> : null}
        <h2 className="mt-2 max-w-3xl text-[clamp(1.35rem,2.3vw,1.8rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-[var(--foreground)]">
          {title}
        </h2>
        {description ? (
          <div className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {description}
          </div>
        ) : null}
        {action || secondaryAction ? (
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {action}
            {secondaryAction}
          </div>
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="pc-empty-state-visual hidden p-5 lg:flex lg:flex-col lg:justify-center"
      >
        {visual ?? <DefaultVisual />}
      </div>
    </section>
  );
}
