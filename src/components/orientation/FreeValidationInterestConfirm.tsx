"use client";

import { useState } from "react";
import { freeValidationInterestConfirmationCopy } from "@/content/free-validation-interest-copy";
import type { Locale } from "@/lib/i18n";

export function FreeValidationInterestConfirm({
  token,
  locale,
}: {
  token: string;
  locale: Locale;
}) {
  const copy = freeValidationInterestConfirmationCopy[locale];
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  async function confirmInterest() {
    if (status === "saving" || status === "success") return;
    setStatus("saving");

    try {
      const response = await fetch("/api/orientation/interest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, source: "email_followup" }),
      });
      const payload = await response.json().catch(() => null) as { recorded?: boolean } | null;

      if (!response.ok || !payload?.recorded) {
        throw new Error("interest_confirmation_failed");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4">
        <h2 className="text-lg font-bold">{copy.successTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
          {copy.successText}
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={confirmInterest}
        disabled={status === "saving"}
        className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "saving" ? copy.saving : copy.button}
      </button>

      {status === "error" ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-[var(--danger)]">
          {copy.error}
        </p>
      ) : null}
    </>
  );
}
