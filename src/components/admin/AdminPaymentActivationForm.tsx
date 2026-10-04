"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PaymentActionStatus = "payment_pending" | "paid_pending_validation";

export function AdminPaymentActivationForm({
  purchaseId,
  enabled,
  status,
}: Readonly<{
  purchaseId: string;
  enabled: boolean;
  status: PaymentActionStatus;
}>) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [reference, setReference] = useState("");

  async function submit() {
    if (!enabled || state === "saving") return;
    setState("saving");

    const manualConfirmation = status === "payment_pending";
    const endpoint = manualConfirmation
      ? "/api/admin/payments/manual-confirm"
      : "/api/admin/payments/activate";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          manualConfirmation
            ? { purchaseId, reference: reference.trim() }
            : { purchaseId },
        ),
      });

      if (!response.ok) {
        setState("error");
        return;
      }

      setState("idle");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  if (!enabled) {
    return (
      <p className="mt-4 text-xs leading-5 text-slate-700">
        La gestion des paiements est désactivée dans cet environnement.
      </p>
    );
  }

  const manualConfirmation = status === "payment_pending";

  return (
    <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4">
      {manualConfirmation ? (
        <>
          <p className="text-sm font-bold text-slate-950">Validation manuelle du paiement</p>
          <p className="mt-1 text-xs leading-5 text-slate-700">
            Utilisez cette action uniquement après avoir vérifié que le paiement a réellement été reçu.
          </p>
          <label
            htmlFor={`payment-reference-${purchaseId}`}
            className="mt-3 block text-xs font-bold text-slate-700"
          >
            Référence ou note de paiement · facultatif
          </label>
          <input
            id={`payment-reference-${purchaseId}`}
            value={reference}
            maxLength={80}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Ex. virement du 04/10/2026"
            className="mt-1.5 w-full max-w-xl rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950"
          />
        </>
      ) : (
        <>
          <p className="text-sm font-bold text-slate-950">Paiement reçu et enregistré</p>
          <p className="mt-1 text-xs leading-5 text-slate-700">
            La validation finale crée la procédure et active l’espace client.
          </p>
        </>
      )}

      <button
        type="button"
        disabled={state === "saving"}
        onClick={submit}
        className="mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "saving"
          ? "Enregistrement…"
          : manualConfirmation
            ? "Confirmer le paiement reçu"
            : "Valider et activer le client"}
      </button>

      {state === "error" ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-[var(--danger)]">
          {manualConfirmation
            ? "Confirmation impossible. Vérifiez l’état de l’achat puis réessayez."
            : "Activation impossible. Vérifiez l’état du paiement puis réessayez."}
        </p>
      ) : null}
    </div>
  );
}
