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
      aria-labelledby="next-action-title"
      className={
        waiting
          ? "rounded-[var(--radius-lg)] border border-[var(--info-border)] bg-[var(--info-soft)] p-5 sm:p-6"
          : "rounded-[var(--radius-lg)] border border-[var(--foreground)] bg-[var(--foreground)] p-5 text-white sm:p-6"
      }
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p
            className={
              waiting
                ? "text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--info-strong)]"
                : "text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--accent)]"
            }
          >
            {eyebrow}
          </p>
          <h2
            id="next-action-title"
            className={
              waiting
                ? "mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]"
                : "mt-2 text-2xl font-semibold tracking-[-0.03em] text-white"
            }
          >
            {title}
          </h2>
          {description ? (
            <p
              className={
                waiting
                  ? "mt-2 text-sm leading-6 text-[var(--foreground-soft)]"
                  : "mt-2 text-sm leading-6 text-white/75"
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
                  : "mt-4 text-xs leading-5 text-white/65"
              }
            >
              {metadata}
            </div>
          ) : null}
        </div>
        {action ? <div className="shrink-0 [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">{action}</div> : null}
      </div>
    </section>
  );
}
