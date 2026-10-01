"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminPaymentActivationForm({
  purchaseId,
  enabled,
}: Readonly<{
  purchaseId: string;
  enabled: boolean;
}>) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function activate() {
    if (!enabled || state === "saving") return;
    setState("saving");

    try {
      const response = await fetch("/api/admin/payments/activate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ purchaseId }),
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
        L’activation paiement est désactivée dans cet environnement.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={state === "saving"}
        onClick={activate}
        className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "saving" ? "Activation…" : "Valider et activer le client"}
      </button>
      {state === "error" ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-[var(--danger)]">
          Activation impossible. Vérifiez l’état du paiement puis réessayez.
        </p>
      ) : null}
    </div>
  );
}
