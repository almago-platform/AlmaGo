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
          ? "relative overflow-hidden rounded-[1.35rem] border border-[#ead59a] bg-[#fff9e9] p-5 shadow-[0_20px_55px_-40px_rgba(139,98,0,.34)] sm:p-6"
          : "relative overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#17191b] p-5 text-white shadow-[0_28px_70px_-40px_rgba(0,0,0,.65)] sm:p-6"
      }
      style={waiting ? undefined : {
        backgroundImage:
          "radial-gradient(circle at 88% 15%, rgba(244,180,0,.15), transparent 17rem), radial-gradient(circle at 5% 120%, rgba(216,6,33,.18), transparent 20rem)",
      }}
    >
      <div className={waiting ? "absolute inset-y-0 start-0 w-1 bg-[var(--accent)]" : "absolute inset-y-0 start-0 w-1 bg-[var(--brand)]"} aria-hidden="true" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p
            className={
              waiting
                ? "text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[#7c5900]"
                : "text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]"
            }
          >
            {eyebrow}
          </p>
          <h2
            className={
              waiting
                ? "mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#202326]"
                : "mt-2 text-2xl font-semibold tracking-[-0.035em] text-white"
            }
          >
            {title}
          </h2>
          {description ? (
            <p
              className={
                waiting
                  ? "mt-2 text-sm leading-6 text-[#5f615f]"
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
                  ? "mt-4 text-xs leading-5 text-[#6d6f6d]"
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
