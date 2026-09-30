"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProspectQualificationReviewForm({
  orientationId,
  qualificationId,
}: Readonly<{
  orientationId: string;
  qualificationId: string;
}>) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<"qualified_prospect" | "needs_verification" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(decision: "qualified_prospect" | "needs_verification") {
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setMessage("Ajoutez un motif de revue d’au moins 10 caractères.");
      return;
    }

    setPending(decision);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/prospects/qualification-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orientationId,
          expectedQualificationId: qualificationId,
          decision,
          reason: trimmed,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          typeof payload.error === "string"
            ? payload.error
            : "Impossible d’enregistrer la revue.",
        );
        return;
      }

      setReason("");
      setMessage("Revue enregistrée.");
      router.refresh();
    } catch {
      setMessage("Impossible de contacter le service de revue.");
    } finally {
      setPending(null);
    }
  }

  const fieldId = "qualification-review-" + qualificationId;

  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4">
      <label
        htmlFor={fieldId}
        className="text-sm font-semibold text-slate-900"
      >
        Motif de la revue
      </label>
      <textarea
        id={fieldId}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={3}
        maxLength={1000}
        disabled={pending !== null}
        placeholder="Expliquez brièvement les éléments vérifiés et la décision."
        className="mt-2 w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] disabled:opacity-60"
      />

      {message ? (
        <p className="mt-2 text-sm text-slate-700" role="status">
          {message}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit("qualified_prospect")}
          disabled={pending !== null}
          className="min-h-10 rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending === "qualified_prospect" ? "Enregistrement…" : "Qualifier le projet"}
        </button>
        <button
          type="button"
          onClick={() => submit("needs_verification")}
          disabled={pending !== null}
          className="min-h-10 rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-4 text-sm font-bold text-slate-900 disabled:opacity-60"
        >
          {pending === "needs_verification" ? "Enregistrement…" : "Demander une vérification"}
        </button>
      </div>
    </div>
  );
}
