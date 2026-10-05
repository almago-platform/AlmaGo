"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { orientationProspectCopy } from "@/content/orientation-prospect-copy";
import {
  isAdultPublicOrientationIdentity,
  type PublicOrientationAnswers,
  type PublicOrientationIdentity,
} from "@/lib/orientation/public";
import type { AcquisitionContext } from "@/lib/phase2/acquisition";

type ProspectCaptureResponse = {
  saved?: boolean;
  delivery?: "sent" | "disabled" | "unavailable" | "failed";
  interestToken?: string;
  signupPath?: string | null;
};

type InterestResponse = {
  recorded?: boolean;
};

export function ProspectCaptureCard({
  answers,
  identity,
  initialEmail = "",
  reviewId = null,
  emailDeliveryEnabled = false,
  accountLinkingEnabled = false,
  acquisitionContext = null,
}: {
  answers: PublicOrientationAnswers;
  identity?: PublicOrientationIdentity | null;
  initialEmail?: string;
  reviewId?: string | null;
  emailDeliveryEnabled?: boolean;
  accountLinkingEnabled?: boolean;
  acquisitionContext?: AcquisitionContext | null;
}) {
  const { locale } = useLocale();
  const copy = orientationProspectCopy[locale].capture;
  const [email, setEmail] = useState(initialEmail);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [interestToken, setInterestToken] = useState<string | null>(null);
  const [interestStatus, setInterestStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

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
          ...(identity
            ? { identity: { ...identity, email: normalized } }
            : {}),
          privacyAcknowledged: true,
          contactConsent: false,
          ...(reviewId ? { reviewId } : {}),
          ...(acquisitionContext ? { acquisition: acquisitionContext } : {}),
        }),
      });

      const payload = await response.json().catch(() => null) as ProspectCaptureResponse | null;
      if (!response.ok || !payload?.saved) throw new Error("save_failed");

      setStatus("success");
      setInterestToken(
        typeof payload.interestToken === "string" && payload.interestToken.length > 0
          ? payload.interestToken
          : null,
      );

      if (
        accountLinkingEnabled
        && typeof payload.signupPath === "string"
        && payload.signupPath.startsWith("/signup?orientation_token=")
      ) {
        window.location.assign(payload.signupPath);
        return;
      }

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


  async function submitInterest() {
    if (!interestToken || interestStatus === "saving" || interestStatus === "success") return;

    setInterestStatus("saving");

    try {
      const response = await fetch("/api/orientation/interest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: interestToken }),
      });
      const payload = await response.json().catch(() => null) as InterestResponse | null;

      if (!response.ok || !payload?.recorded) throw new Error("interest_failed");
      setInterestStatus("success");
    } catch {
      setInterestStatus("error");
    }
  }

  const persistentCaptureAllowed = identity
    ? isAdultPublicOrientationIdentity(identity)
    : false;

  if (!persistentCaptureAllowed) {
    return (
      <section id="orientation-prospect-capture" className="orientation-print-hide mt-8 scroll-mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5 sm:p-6">
        <p className="eyebrow">{copy.ageRestrictionEyebrow}</p>
        <h3 className="mt-2 text-xl font-bold">{copy.ageRestrictionTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {copy.ageRestrictionText}
        </p>
      </section>
    );
  }

  const submitLabel = accountLinkingEnabled
    ? copy.continueSubmit
    : emailDeliveryEnabled
      ? copy.emailSubmit
      : copy.submit;
  const pendingLabel = accountLinkingEnabled
    ? copy.continueSaving
    : emailDeliveryEnabled
      ? copy.sendingEmail
      : copy.sending;
  const eyebrow = accountLinkingEnabled ? copy.continueEyebrow : copy.eyebrow;
  const title = accountLinkingEnabled ? copy.continueTitle : copy.title;
  const textCopy = accountLinkingEnabled ? copy.continueText : copy.text;
  const privacyLabel = accountLinkingEnabled
    ? copy.continuePrivacyLabel
    : copy.privacyLabel;

  return (
    <section
      id="orientation-prospect-capture"
      className={`orientation-print-hide mt-8 scroll-mt-6 rounded-[var(--radius-lg)] border p-5 sm:p-6 ${
        accountLinkingEnabled
          ? "border-[var(--brand-border)] bg-[var(--surface)]"
          : "border-[var(--border)] bg-[var(--surface-subtle)]"
      }`}
    >
      {accountLinkingEnabled ? (
        <div className="mb-5 flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--success)] font-bold text-white"
            aria-hidden="true"
          >
            ✓
          </span>
          <span className="font-medium text-[var(--foreground)]">{copy.continueReady}</span>
        </div>
      ) : null}
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{textCopy}</p>

      {accountLinkingEnabled ? (
        <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-3 text-xs leading-5 text-[var(--foreground-soft)]">
          <strong className="text-[var(--foreground)]">{copy.continueBoundary}</strong>
        </div>
      ) : null}

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

        <label className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6">
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
            {privacyLabel}{" "}
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
          className={
            accountLinkingEnabled
              ? "w-full rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              : "rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          }
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

      {status === "success" && interestToken ? (
        <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4">
          <p className="eyebrow">{copy.interestEyebrow}</p>
          <h4 className="mt-2 text-lg font-bold">{copy.interestTitle}</h4>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            {copy.interestText}
          </p>
          <button
            type="button"
            onClick={submitInterest}
            disabled={interestStatus === "saving" || interestStatus === "success"}
            className="mt-4 rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {interestStatus === "saving" ? copy.interestSaving : copy.interestSubmit}
          </button>
          {interestStatus === "success" ? (
            <p role="status" className="mt-3 text-sm font-semibold text-[var(--foreground)]">
              {copy.interestSuccess}
            </p>
          ) : null}
          {interestStatus === "error" ? (
            <p role="alert" className="mt-3 text-sm font-semibold text-[var(--danger)]">
              {copy.interestFailure}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
