"use client";

import { useState } from "react";

type SandboxState =
  | "offer_selected"
  | "payment_pending"
  | "paid_pending_validation"
  | "client_active"
  | "refunded";

const labels: Record<SandboxState, string> = {
  offer_selected: "Offre sélectionnée",
  payment_pending: "Paiement en attente",
  paid_pending_validation: "Paiement sandbox confirmé — validation interne requise",
  client_active: "Client actif (simulation)",
  refunded: "Remboursé — accès révoqué (simulation)",
};

const nextActions: Record<SandboxState, Array<{ label: string; next: SandboxState }>> = {
  offer_selected: [{ label: "Créer la tentative sandbox", next: "payment_pending" }],
  payment_pending: [
    { label: "Simuler un paiement réussi", next: "paid_pending_validation" },
    { label: "Simuler une annulation", next: "offer_selected" },
  ],
  paid_pending_validation: [
    { label: "Simuler la validation admin", next: "client_active" },
    { label: "Simuler un remboursement", next: "refunded" },
  ],
  client_active: [{ label: "Simuler un remboursement", next: "refunded" }],
  refunded: [{ label: "Réinitialiser la démonstration", next: "offer_selected" }],
};

export function PartnerPaymentSandbox() {
  const [state, setState] = useState<SandboxState>("offer_selected");
  const [history, setHistory] = useState<SandboxState[]>(["offer_selected"]);

  function transition(next: SandboxState) {
    setState(next);
    setHistory((current) =>
      next === "offer_selected" && state === "refunded"
        ? ["offer_selected"]
        : [...current, next],
    );
  }

  return (
    <section
      data-partner-payment-sandbox="true"
      className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
            Paiement sandbox
          </p>
          <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
            Démontrer le cycle de paiement sans argent réel
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Cette simulation reste entièrement dans le navigateur. Elle ne contacte aucun prestataire,
            ne crée aucune transaction et ne modifie aucun accès en base.
          </p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
          SANDBOX · 0 €
        </span>
      </div>

      <div className="mt-5 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--foreground)]">État courant</p>
        <p role="status" className="mt-2 text-base font-bold text-[var(--foreground)]">
          {labels[state]}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {nextActions[state].map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => transition(action.next)}
            className="min-h-11 rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white"
          >
            {action.label}
          </button>
        ))}
      </div>

      <ol className="mt-5 space-y-2 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
        {history.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3">
            <span aria-hidden="true" className="font-bold text-[var(--brand)]">{index + 1}.</span>
            <span>{labels[item]}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
