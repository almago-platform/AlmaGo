"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { provisionalCopy } from "@/content/prospect-provisional-copy";
import type { Locale } from "@/lib/i18n";

export function ProvisionalEmailVerification({ locale, initialEmail = "" }: { locale: Locale; initialEmail?: string }) {
  const t = provisionalCopy[locale];
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function requestResend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state !== "idle" || !email.trim()) return;
    setState("sending");
    try {
      // Never disclose whether an email corresponds to a known account, or
      // whether Supabase suppresses sending to already-confirmed addresses.
      await createClient().auth.resend({
        type: "signup",
        email: email.trim(),
        // Keep the confirmation on this site's secured callback. The Prospect
        // page can recover an orientation only after the account is verified.
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/prospect")}`,
        },
      });
    } catch {
      // Generic response also covers transport failures; user can retry via Auth.
    }
    setState("sent");
  }

  const guidance = {
    fr: "Si une confirmation est nécessaire, elle peut arriver par e-mail. Vérifiez aussi les spams. Aucun compte n’est confirmé par cette demande.",
    ar: "إذا كان التأكيد مطلوبًا فقد تصلك رسالة. تحقق أيضًا من الرسائل غير المرغوب فيها. لا يتم تأكيد أي حساب بهذا الطلب.",
    en: "If confirmation is required, an email may arrive. Check spam too. This request does not verify any account.",
    de: "Falls eine Bestätigung nötig ist, kann eine E-Mail eintreffen. Prüfe auch Spam. Diese Anfrage bestätigt kein Konto.",
  }[locale];

  return (
    <form onSubmit={requestResend} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="min-w-0 flex-1 text-sm font-semibold">
        E-mail
        <input
          type="email"
          required
          autoComplete="email"
          readOnly={Boolean(initialEmail)}
          dir="ltr"
          className="field mt-2 min-h-11 w-full"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={state !== "idle"}
        />
      </label>
      <button type="submit" disabled={state !== "idle"} className="min-h-11 rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60">
        {state === "sending" ? "…" : t.resend}
      </button>
      {state === "sent" ? <p className="text-sm text-[var(--muted)]" role="status">{guidance}</p> : null}
    </form>
  );
}
