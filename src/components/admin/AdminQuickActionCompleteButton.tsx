"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Completes an existing manual action through the same admin API used by
 * Dossier 360°. The server owns authorization, transition and audit history.
 */
export function AdminQuickActionCompleteButton({
  studentId,
  actionId,
}: {
  studentId: string;
  actionId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function complete() {
    if (busy || done) return;
    if (!window.confirm("Marquer cette action comme terminée ? Vous pourrez la rouvrir dans le dossier.")) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/dossiers/${studentId}/actions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_id: actionId, operation: "complete" }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Impossible de terminer cette action.");
        return;
      }

      setDone(true);
      router.refresh();
    } catch {
      setError("Connexion indisponible. Réessayez sans modifier le dossier.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[9rem] flex-col items-start gap-1.5">
      <Button type="button" variant="secondary" disabled={busy || done} onClick={complete} className="min-h-9 w-full">
        {done ? "Terminée" : busy ? "Validation…" : "Marquer terminée"}
      </Button>
      {error ? <p role="alert" className="max-w-56 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
