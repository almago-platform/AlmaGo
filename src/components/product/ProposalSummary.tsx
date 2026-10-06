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
    <section className="pc-panel overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.38fr)]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              {eyebrow}
            </p>
            <Badge variant={statusVariant}>{status}</Badge>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {route}
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-[var(--foreground-soft)]">{service}</p>
          {rationale ? (
            <div className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">{rationale}</div>
          ) : null}
          {included?.length ? (
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{includedLabel}</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--foreground-soft)] sm:grid-cols-2">
                {included.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--success-strong)]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {boundaries ? (
            <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--warning-border)] bg-[var(--premium-gold-wash)] px-4 py-3 text-xs leading-5 text-[var(--foreground-soft)]">
              {boundaries}
            </div>
          ) : null}
        </div>
        <aside className="border-t border-[var(--border)] bg-[var(--premium-ink)] p-5 text-white sm:p-6 lg:border-s lg:border-t-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">{totalLabel}</p>
          <div className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            {price}{currency ? <span className="ms-2 text-base font-semibold text-white/70">{currency}</span> : null}
          </div>
          <p className="mt-3 text-xs leading-5 text-white/70">
            {paymentNote}
          </p>
          {actions ? <div className="mt-5 flex flex-col gap-2 [&_a]:w-full [&_button]:w-full">{actions}</div> : null}
        </aside>
      </div>
    </section>
  );
}
