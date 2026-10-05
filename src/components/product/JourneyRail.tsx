import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type JourneyRailStep = {
  label: ReactNode;
  detail?: ReactNode;
  status: "done" | "active" | "upcoming" | "locked";
  href?: string;
};

const statusStyle = {
  done: {
    marker: "bg-[#17191b] text-white border-[#17191b]",
    label: "text-[#17191b]",
    shell: "bg-[#f7f4ee]",
  },
  active: {
    marker: "bg-[var(--brand)] text-white border-[var(--brand)] shadow-[0_0_0_5px_rgba(216,6,33,.08)]",
    label: "text-[var(--brand-strong)]",
    shell: "bg-[var(--brand-soft)]",
  },
  upcoming: {
    marker: "bg-white text-[var(--muted)] border-black/10",
    label: "text-[#25292c]",
    shell: "bg-white",
  },
  locked: {
    marker: "bg-[#efede8] text-[#8a8f93] border-black/[.06]",
    label: "text-[#777d81]",
    shell: "bg-[#faf8f4]",
  },
} as const;

export function JourneyRail({
  steps,
  ariaLabel = "Progression du dossier",
}: {
  steps: JourneyRailStep[];
  ariaLabel?: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="overflow-hidden rounded-[1.35rem] border border-black/[.07] bg-white shadow-[0_22px_60px_-42px_rgba(0,0,0,.34)]"
    >
      <ol
        className="grid sm:grid-cols-2 xl:grid-cols-[repeat(var(--journey-count),minmax(0,1fr))]"
        style={{ "--journey-count": steps.length } as CSSProperties}
      >
        {steps.map((step, index) => {
          const style = statusStyle[step.status];
          const content = (
            <div className={`relative flex min-h-24 items-start gap-3 border-b border-black/[.06] p-4 transition-colors sm:border-e sm:last:border-e-0 xl:border-b-0 ${style.shell}`}>
              {step.status === "active" ? <span className="absolute inset-x-0 top-0 h-[3px] bg-[var(--brand)]" aria-hidden="true" /> : null}
              <span
                aria-hidden="true"
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px] font-extrabold ${style.marker}`}
              >
                {step.status === "done" ? "✓" : index + 1}
              </span>
              <span className="min-w-0 pt-0.5">
                <span className={`block text-xs font-extrabold leading-5 ${style.label}`}>
                  {step.label}
                </span>
                {step.detail ? (
                  <span className="mt-1 block text-[11px] leading-4 text-[var(--muted)]">
                    {step.detail}
                  </span>
                ) : null}
              </span>
            </div>
          );

          return (
            <li key={index} className="min-w-0">
              {step.href && step.status !== "locked" ? (
                <Link
                  href={step.href}
                  className="block h-full transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]"
                >
                  {content}
                </Link>
              ) : content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
