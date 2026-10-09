import type { ReactNode } from "react";

type SummaryMetric = {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "brand" | "warning" | "success";
};

export function AdminWorkspaceSummary({
  eyebrow,
  title,
  description,
  metrics,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  metrics: SummaryMetric[];
  action?: ReactNode;
}) {
  return (
    <section className="mb-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>

        <div className="grid w-full grid-cols-2 overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-flow-col sm:auto-cols-fr xl:w-auto xl:min-w-[32rem]">
          {metrics.map((metric) => {
            const toneClass =
              metric.tone === "brand"
                ? "bg-[var(--brand-soft)]/55"
                : metric.tone === "warning"
                  ? "bg-amber-50/70"
                  : metric.tone === "success"
                    ? "bg-emerald-50/55"
                    : "bg-white";

            return (
              <div key={metric.label} className={`${toneClass} min-w-0 p-3 sm:p-4`}>
                <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-700">{metric.label}</p>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{metric.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
