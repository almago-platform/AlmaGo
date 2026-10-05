import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

export function ProposalSummary({
  route,
  service,
  price,
  currency,
  status,
  statusVariant = "warning",
  rationale,
  included,
  boundaries,
  actions,
  eyebrow = "Proposition Campus Allemagne",
  includedLabel = "Inclus",
  totalLabel = "Total",
  paymentNote = "Le paiement active l’accompagnement prévu dans cette proposition après validation. Il ne garantit pas une admission.",
}: {
  route: ReactNode;
  service: ReactNode;
  price: ReactNode;
  currency?: ReactNode;
  status: ReactNode;
  statusVariant?: "success" | "info" | "warning" | "error" | "neutral";
  rationale?: ReactNode;
  included?: ReactNode[];
  boundaries?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  includedLabel?: ReactNode;
  totalLabel?: ReactNode;
  paymentNote?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[1.45rem] border border-black/[.07] bg-white shadow-[0_30px_80px_-48px_rgba(0,0,0,.42)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.38fr)]">
        <div className="relative p-5 sm:p-7">
          <span className="absolute inset-y-0 start-0 w-1 bg-[var(--brand)]" aria-hidden="true" />

          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-strong)]">
              {eyebrow}
            </p>
            <Badge variant={statusVariant}>{status}</Badge>
          </div>

          <h2 className="mt-3 text-[clamp(1.7rem,3vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#191c1e]">
            {route}
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#4f5559]">{service}</p>

          {rationale ? (
            <div className="mt-5 max-w-3xl text-sm leading-6 text-[var(--muted)]">{rationale}</div>
          ) : null}

          {included?.length ? (
            <div className="mt-6">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#73787c]">
                {includedLabel}
              </h3>
              <ul className="mt-3 grid gap-3 text-sm leading-6 text-[#34383b] sm:grid-cols-2">
                {included.map((item, index) => (
                  <li key={index} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eff9f3] text-[11px] font-extrabold text-[#17603c]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {boundaries ? (
            <div className="mt-6 rounded-2xl border border-[#ead59a] bg-[#fff9e9] px-4 py-3 text-xs leading-5 text-[#4f4631]">
              {boundaries}
            </div>
          ) : null}
        </div>

        <aside
          className="relative overflow-hidden border-t border-black/10 bg-[#17191b] p-5 text-white sm:p-7 lg:border-s lg:border-t-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, rgba(244,180,0,.16), transparent 14rem), radial-gradient(circle at 10% 100%, rgba(216,6,33,.18), transparent 17rem)",
          }}
        >
          <div className="relative">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">{totalLabel}</p>
            <div className="mt-2 text-[clamp(2.4rem,4vw,3.4rem)] font-semibold tracking-[-0.05em]">
              {price}{currency ? <span className="ms-2 text-base font-semibold text-white/62">{currency}</span> : null}
            </div>
            <p className="mt-4 text-xs leading-5 text-white/62">
              {paymentNote}
            </p>
            {actions ? <div className="mt-6 flex flex-col gap-2 [&_a]:w-full [&_button]:w-full [&_button]:rounded-xl">{actions}</div> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
