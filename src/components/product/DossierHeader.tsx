import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

export function DossierHeader({
  eyebrow,
  title,
  description,
  status,
  statusVariant = "neutral",
  facts,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  statusVariant?: "success" | "info" | "warning" | "error" | "neutral";
  facts?: Array<{ label: ReactNode; value: ReactNode }>;
  actions?: ReactNode;
}) {
  return (
    <header
      className="relative overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#17191b] p-5 text-white shadow-[0_32px_80px_-46px_rgba(0,0,0,.72)] sm:p-7 lg:p-8"
      style={{
        backgroundImage:
          "radial-gradient(circle at 88% 8%, rgba(244,180,0,.15), transparent 19rem), radial-gradient(circle at 5% 108%, rgba(216,6,33,.18), transparent 22rem)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#d80621_0_62%,#f4b400_62%_78%,transparent_78%)]" aria-hidden="true" />
      <div className="absolute -end-16 -top-20 h-52 w-52 rounded-full border border-white/[.05]" aria-hidden="true" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5">
            {eyebrow ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_rgba(244,180,0,.11)]" aria-hidden="true" />
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-white/66">
                  {eyebrow}
                </p>
              </div>
            ) : null}
            {status ? <Badge variant={statusVariant}>{status}</Badge> : null}
          </div>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3.45rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/66 sm:text-base sm:leading-7">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2 [&_a]:shadow-sm [&_button]:shadow-sm">
            {actions}
          </div>
        ) : null}
      </div>

      {facts?.length ? (
        <dl className="relative mt-7 grid overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[.055] backdrop-blur-sm sm:grid-cols-2 xl:grid-cols-4">
          {facts.map((fact, index) => (
            <div
              key={index}
              className="min-w-0 border-b border-white/10 px-4 py-4 last:border-b-0 sm:border-e sm:[&:nth-child(even)]:border-e-0 xl:border-b-0 xl:[&:nth-child(even)]:border-e xl:last:border-e-0"
            >
              <dt className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-white/45">
                {fact.label}
              </dt>
              <dd className="m-0 mt-1.5 text-sm font-semibold text-white [overflow-wrap:anywhere]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </header>
  );
}
