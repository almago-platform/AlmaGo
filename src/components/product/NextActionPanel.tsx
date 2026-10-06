import type { ReactNode } from "react";

export function NextActionPanel({
  eyebrow = "Prochaine action",
  title,
  description,
  metadata,
  action,
  waiting = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  metadata?: ReactNode;
  action?: ReactNode;
  waiting?: boolean;
}) {
  return (
    <section
      className={
        waiting
          ? "relative overflow-hidden rounded-[var(--premium-radius-panel)] border border-[var(--warning-border)] bg-[var(--premium-gold-wash)] p-4 shadow-[var(--premium-shadow-card)] sm:p-5"
          : "relative overflow-hidden rounded-[var(--premium-radius-panel)] border border-black/10 bg-[var(--premium-ink)] p-4 text-white shadow-[var(--premium-shadow-action)] sm:p-5"
      }
      style={waiting ? undefined : {
        backgroundImage:
          "radial-gradient(circle at 88% 15%, rgba(252,181,10,.15), transparent 17rem), radial-gradient(circle at 5% 120%, rgba(219,4,35,.18), transparent 20rem)",
      }}
    >
      <div className={waiting ? "absolute inset-y-0 start-0 w-1 bg-[var(--accent)]" : "absolute inset-y-0 start-0 w-1 bg-[var(--brand)]"} aria-hidden="true" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p
            className={
              waiting
                ? "text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--warning-strong)]"
                : "text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]"
            }
          >
            {eyebrow}
          </p>
          <h2
            className={
              waiting
                ? "mt-1.5 text-[1.45rem] font-semibold tracking-[-0.035em] text-[var(--foreground)]"
                : "mt-1.5 text-[1.45rem] font-semibold tracking-[-0.035em] text-white"
            }
          >
            {title}
          </h2>
          {description ? (
            <p
              className={
                waiting
                  ? "mt-2 text-sm leading-6 text-[var(--muted-strong)]"
                  : "mt-2 text-sm leading-6 text-white/68"
              }
            >
              {description}
            </p>
          ) : null}
          {metadata ? (
            <div
              className={
                waiting
                  ? "mt-4 text-xs leading-5 text-[var(--muted)]"
                  : "mt-4 text-xs leading-5 text-white/52"
              }
            >
              {metadata}
            </div>
          ) : null}
        </div>
        {action ? (
          <div className="shrink-0 [&_a]:w-full [&_button]:w-full [&_a]:rounded-xl [&_button]:rounded-xl sm:[&_a]:w-auto sm:[&_button]:w-auto">
            {action}
          </div>
        ) : null}
      </div>
    </section>
  );
}
