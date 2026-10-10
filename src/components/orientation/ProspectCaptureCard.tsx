"use client";

import Link from "next/link";
import { OrientationRealPhoto } from "@/components/orientation/OrientationRealPhoto";
import { selectStudentLifePhoto } from "@/lib/orientation/media/student-life";
import { useCallback, useEffect, useRef, useState } from "react";
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
  detailedPdfAttached?: boolean;
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
  automaticEmailConsent = false,
  includedEmailDelivery = false,
  claimAutoEmailAttempt,
  acquisitionContext = null,
}: {
  answers: PublicOrientationAnswers;
  identity?: PublicOrientationIdentity | null;
  initialEmail?: string;
  reviewId?: string | null;
  emailDeliveryEnabled?: boolean;
  accountLinkingEnabled?: boolean;
  automaticEmailConsent?: boolean;
  includedEmailDelivery?: boolean;
  claimAutoEmailAttempt?: () => boolean;
  acquisitionContext?: AcquisitionContext | null;
}) {
  const { locale } = useLocale();
  const copy = orientationProspectCopy[locale].capture;
  const [email, setEmail] = useState(initialEmail);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [previouslyRequested, setPreviouslyRequested] = useState(false);
  const [detailedPdfAttached, setDetailedPdfAttached] = useState(false);
  const [message, setMessage] = useState("");
  const [interestToken, setInterestToken] = useState<string | null>(null);
  const [signupPath, setSignupPath] = useState<string | null>(null);
  const [interestStatus, setInterestStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const autoStarted = useRef(false);
  const submitting = useRef(false);
  const persistentCaptureAllowed = identity ? isAdultPublicOrientationIdentity(identity) : false;
  const autoEmailRequested = (includedEmailDelivery || automaticEmailConsent) && emailDeliveryEnabled && persistentCaptureAllowed;

  const submit = useCallback(async (event?: React.FormEvent<HTMLFormElement>, automated = false) => {
    event?.preventDefault();
    if (submitting.current) return;
    if (automated && !autoEmailRequested) return;
    if (!automated && !privacyAcknowledged) return;
    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setStatus("error");
      setMessage(copy.invalidEmail);
      return;
    }

    submitting.current = true;
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
          // For an included service, notice is presented before starting; this
          // does not assert that a separate checkbox consent was obtained.
          privacyAcknowledged: automated && includedEmailDelivery ? false : true,
          ...(automated
            ? includedEmailDelivery
              ? { deliveryMode: "included", emailNoticeShown: true }
              : { deliveryMode: "automatic", emailDeliveryConsent: true }
            : {}),
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

      const verifiedSignupPath = accountLinkingEnabled
        && typeof payload.signupPath === "string"
        && payload.signupPath.startsWith("/signup?orientation_token=")
          ? payload.signupPath
          : null;
      setSignupPath(verifiedSignupPath);

      // In the no-email flow the explicit account CTA also requests support.
      // Record the intent first. On failure, keep the saved orientation and
      // offer the same action again in the unified continuation panel.
      if (!emailDeliveryEnabled && verifiedSignupPath && typeof payload.interestToken === "string" && payload.interestToken.length > 0) {
        try {
          const interestResponse = await fetch("/api/orientation/interest", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token: payload.interestToken }),
          });
          const interestPayload = await interestResponse.json().catch(() => null) as InterestResponse | null;
          if (!interestResponse.ok || !interestPayload?.recorded) throw new Error("interest_failed");
          window.location.assign(verifiedSignupPath);
          return;
        } catch {
          setInterestStatus("error");
        }
      }

      if (payload.delivery === "sent") {
        setDetailedPdfAttached(payload.detailedPdfAttached === true);
        setMessage(copy.emailSent);
      } else if (emailDeliveryEnabled) {
        setMessage(copy.deliveryFailure);
      } else {
        setMessage(copy.success);
      }
    } catch {
      setStatus("error");
      setMessage(copy.failure);
    } finally {
      submitting.current = false;
    }
  }, [
    email, locale, answers, identity, privacyAcknowledged, reviewId, acquisitionContext,
    emailDeliveryEnabled, accountLinkingEnabled, includedEmailDelivery, autoEmailRequested, copy,
  ]);

  useEffect(() => {
    if (!autoEmailRequested || autoStarted.current) return;
    autoStarted.current = true;
    if (!claimAutoEmailAttempt?.()) {
      // A previous mount already started sending. React state is updated
      // asynchronously to avoid cascading synchronous effect renders.
      queueMicrotask(() => setPreviouslyRequested(true));
      return;
    }
    // Schedule the network request after the effect; never trigger a
    // synchronous state update from a React effect body.
    queueMicrotask(() => {
      void submit(undefined, true);
    });
  }, [autoEmailRequested, claimAutoEmailAttempt, submit, copy.automaticEmailAlreadyRequested]);

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
      if (signupPath) window.location.assign(signupPath);
    } catch {
      setInterestStatus("error");
    }
  }

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

  const submitLabel = emailDeliveryEnabled
    ? copy.emailSubmit
    : accountLinkingEnabled ? copy.continueSubmit : copy.submit;
  const pendingLabel = emailDeliveryEnabled
    ? copy.sendingEmail
    : accountLinkingEnabled ? copy.continueSaving : copy.sending;
  const eyebrow = includedEmailDelivery
    ? copy.includedEmailEyebrow
    : emailDeliveryEnabled ? copy.emailEyebrow
    : accountLinkingEnabled ? copy.continueEyebrow : copy.eyebrow;
  const title = includedEmailDelivery
    ? copy.includedEmailTitle
    : emailDeliveryEnabled ? copy.emailTitle
    : accountLinkingEnabled ? copy.continueTitle : copy.title;
  const textCopy = includedEmailDelivery
    ? copy.includedEmailText
    : emailDeliveryEnabled ? copy.emailText
    : accountLinkingEnabled ? copy.continueText : copy.text;
  const privacyLabel = emailDeliveryEnabled
    ? copy.emailPrivacyLabel
    : accountLinkingEnabled ? copy.continuePrivacyLabel : copy.privacyLabel;
  const autoEmailSent = autoEmailRequested && status === "success" && message === copy.emailSent;
  const autoEmailFailed = autoEmailRequested && status === "success" && message === copy.deliveryFailure;
  const detailedSent = autoEmailSent && detailedPdfAttached;
  const detailedSuccess = {
    fr: { title: "Vos deux rapports ont été envoyés", text: "Vous avez reçu le résumé A4 et le dossier détaillé, dans les mêmes versions que celles enregistrables sur Campus Allemagne." },
    ar: { title: "تم إرسال التقريرين", text: "أرسلنا ملخص التوجيه والملف المفصل بصيغة PDF، بنفس النسخة المتاحة على Campus Allemagne." },
    en: { title: "Your two reports have been sent", text: "Your A4 summary and detailed dossier have been emailed in the same format as the PDFs available on Campus Allemagne." },
    de: { title: "Deine zwei Berichte wurden versendet", text: "Dein A4-Kurzbericht und das ausführliche Dossier wurden in derselben Form wie auf Campus Allemagne per E-Mail verschickt." },
  }[locale];
  const displayTitle = autoEmailSent
    ? detailedSent ? detailedSuccess.title : copy.includedEmailSuccessTitle
    : autoEmailFailed ? copy.includedEmailFailureTitle : title;
  const displayText = autoEmailSent
    ? detailedSent ? detailedSuccess.text : copy.includedEmailSuccessText
    : textCopy;

  return (
    <section
      id="orientation-prospect-capture"
      className={`orientation-print-hide mt-8 scroll-mt-6 overflow-hidden rounded-[var(--radius-panel)] border p-5 sm:p-7 ${
        accountLinkingEnabled && !emailDeliveryEnabled
          ? "border-[var(--brand-border)] bg-[var(--surface)]"
          : "border-[var(--border)] bg-[var(--premium-cream-soft)]"
      }`}
    >
      {accountLinkingEnabled && !emailDeliveryEnabled ? (
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
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
          autoEmailSent
            ? "bg-[var(--success-soft)] text-[var(--success-strong)]"
            : "bg-[var(--surface)] text-[var(--brand-strong)]"
        }`}>
          {autoEmailSent ? (
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" /></svg>
          ) : (
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" /></svg>
          )}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--accent-strong)]">{eyebrow}</p>
          <h3 className="mt-1 text-[1.4rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--foreground)] sm:text-[1.6rem]">{displayTitle}</h3>
          <p className="mt-2 max-w-[67ch] text-sm leading-6 text-[var(--muted)]">{displayText}</p>
        </div>
      </div>

      {accountLinkingEnabled && !emailDeliveryEnabled ? (
        <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-3 text-xs leading-5 text-[var(--foreground-soft)]">
          <strong className="text-[var(--foreground)]">{copy.continueBoundary}</strong>
        </div>
      ) : null}

      {autoEmailRequested ? (
        <div className={`mt-5 rounded-[var(--radius-control)] border px-4 py-3.5 text-sm leading-6 ${
          autoEmailSent
            ? "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success-strong)]"
            : status === "error" || autoEmailFailed
              ? "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--foreground)]"
              : "border-[var(--info-border)] bg-[var(--info-soft)] text-[var(--foreground)]"
        }`}>
          <p role={status === "error" ? "alert" : "status"} className="flex items-start gap-2 font-medium">
            <span className="mt-0.5 shrink-0" aria-hidden="true">{autoEmailSent ? "✓" : status === "error" || autoEmailFailed ? "!" : "↗"}</span>
            <span>
            {previouslyRequested
              ? copy.automaticEmailAlreadyRequested
              : status === "saving" || status === "idle" ? copy.automaticEmailPreparing : autoEmailSent ? copy.success : message}
            </span>
          </p>
          {status === "error" || (status === "success" && message === copy.deliveryFailure) ? (
            <button
              type="button"
              onClick={() => void submit(undefined, true)}
              className="mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2.5 font-semibold text-white hover:bg-[var(--brand-strong)] disabled:opacity-50"
            >
              {copy.automaticEmailRetry}
            </button>
          ) : null}
        </div>
      ) : (
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
            accountLinkingEnabled && !emailDeliveryEnabled
              ? "w-full rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              : "rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          {status === "saving" ? pendingLabel : submitLabel}
        </button>
      </form>
      )}

      {message && !autoEmailRequested ? (
        <p
          id="orientation-capture-message"
          role={status === "error" ? "alert" : "status"}
          className="mt-4 text-sm font-medium"
        >
          {message}
        </p>
      ) : null}

      {status === "success" && interestToken ? (
        <section className="relative mt-6 overflow-hidden rounded-[var(--radius-panel)] bg-[var(--foreground)] p-5 text-white shadow-[var(--shadow-card)] sm:p-7" aria-labelledby="orientation-continue-title">
          <div aria-hidden="true" className="absolute inset-y-0 start-0 w-1 bg-[var(--accent)]" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.47fr)] lg:items-center lg:gap-7">
            <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#f4cc78]">{signupPath ? copy.continueEyebrow : copy.interestEyebrow}</p>
          <h4 id="orientation-continue-title" className="mt-2 max-w-[54rem] text-balance text-xl font-semibold leading-snug tracking-tight sm:text-[1.55rem]">{signupPath ? copy.continueTitle : copy.interestTitle}</h4>
          <p className="mt-3 max-w-[67ch] text-sm leading-7 text-white/85">
            {signupPath ? copy.continueText : copy.interestText}
          </p>
          {interestStatus === "success" && !signupPath ? (
            <p role="status" className="mt-5 rounded-[var(--radius-control)] border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success-strong)]">
              {copy.interestSuccess}
            </p>
          ) : (
            <button
              type="button"
              onClick={submitInterest}
              disabled={interestStatus === "saving"}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {interestStatus === "saving"
                ? (signupPath ? copy.continueSaving : copy.interestSaving)
                : (signupPath ? copy.continueSubmit : copy.interestSubmit)}
            </button>
          )}
          {signupPath ? (
            <p className="mt-4 max-w-[67ch] text-xs leading-6 text-white/75">
              {copy.continueBoundary} {copy.optionalAccountNote}
            </p>
          ) : null}
          {interestStatus === "error" ? (
            <p role="alert" className="mt-3 text-sm font-semibold text-[#ffc1cb]">
              {copy.interestFailure}
            </p>
          ) : null}
            </div>
            <OrientationRealPhoto
              locale={locale}
              kind="student-life"
              lifePhoto={selectStudentLifePhoto(answers)}
              className="h-44 sm:h-48 lg:h-64"
            />
          </div>
        </section>
      ) : null}

    </section>
  );
}
