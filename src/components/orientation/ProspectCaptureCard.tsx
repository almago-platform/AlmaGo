"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { orientationProspectCopy } from "@/content/orientation-prospect-copy";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";

type ProspectCaptureResponse = {
  saved?: boolean;
  delivery?: "sent" | "disabled" | "unavailable" | "failed";
};

export function ProspectCaptureCard({
  answers,
  emailDeliveryEnabled = false,
}: {
  answers: PublicOrientationAnswers;
  emailDeliveryEnabled?: boolean;
}) {
  const { locale } = useLocale();
  const copy = orientationProspectCopy[locale].capture;
  const [email, setEmail] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setStatus("error");
      setMessage(copy.invalidEmail);
      return;
    }

    if (!privacyAcknowledged) return;

    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/orientation/prospect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: normalized,
          locale,
          answers,
          privacyAcknowledged: true,
        }),
      });

      const payload = await response.json().catch(() => null) as ProspectCaptureResponse | null;
      if (!response.ok || !payload?.saved) throw new Error("save_failed");

      setStatus("success");
      if (payload.delivery === "sent") {
        setMessage(copy.emailSent);
      } else if (emailDeliveryEnabled) {
        setMessage(copy.deliveryFailure);
      } else {
        setMessage(copy.success);
      }
    } catch {
      setStatus("error");
      setMessage(copy.failure);
    }
  }

  const submitLabel = emailDeliveryEnabled ? copy.emailSubmit : copy.submit;
  const pendingLabel = emailDeliveryEnabled ? copy.sendingEmail : copy.sending;

  return (
    <section className="orientation-print-hide mt-8 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5 sm:p-6">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h3 className="mt-2 text-xl font-bold">{copy.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.text}</p>

      <form className="mt-5 space-y-4" onSubmit={submit} noValidate aria-busy={status === "saving"}>
        <label className="block text-sm font-semibold">
          {copy.emailLabel}
          <input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={status === "error" && message === copy.invalidEmail}
            aria-describedby={message ? "orientation-capture-message" : undefined}
            className="field"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status === "error" && message === copy.invalidEmail) {
                setStatus("idle");
                setMessage("");
              }
            }}
            disabled={status === "saving" || status === "success"}
          />
        </label>

        <label className="flex items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
            name="privacyAcknowledged"
            required
            className="mt-1"
            checked={privacyAcknowledged}
            onChange={(event) => setPrivacyAcknowledged(event.target.checked)}
            disabled={status === "saving" || status === "success"}
          />
          <span>
            {copy.privacyLabel}{" "}
            <Link
              className="font-semibold underline"
              href="/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.privacyLink}
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={!privacyAcknowledged || status === "saving" || status === "success"}
          className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "saving" ? pendingLabel : submitLabel}
        </button>
      </form>

      {message ? (
        <p
          id="orientation-capture-message"
          role={status === "error" ? "alert" : "status"}
          className="mt-4 text-sm font-medium"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
