"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { accountStateCopy } from "@/content/account-state-copy";

export function ResetPasswordForm({ orientationToken }: { orientationToken?: string }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { locale } = useLocale();
  const t = accountStateCopy[locale].reset;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });

      if (updateError) {
        setError(t.invalid);
      } else {
        setMessage(t.saved);
        const next = orientationToken
          ? `/orientation/claim/${encodeURIComponent(orientationToken)}`
          : "/student";
        setTimeout(() => router.push(next), 700);
      }
    } catch {
      setError(t.genericError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="w-full rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] shadow-none">
      <div className="border-b border-[var(--border)] px-6 py-6 sm:px-8">
        <BrandLogo className="h-auto w-36" />
        <h1 className="editorial-accent mt-3 text-3xl text-[var(--foreground)]">{t.formTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t.formText}</p>
      </div>

      <form onSubmit={submit} aria-busy={saving} className="space-y-5 px-6 py-6 sm:px-8">
        <label className="block text-sm font-semibold text-[var(--foreground)]">
          {t.password}
          <span className="relative mt-2 block">
            <input
              required
              minLength={8}
              dir="ltr"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-describedby="reset-password-hint"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-0 min-h-12 pr-24 text-left"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? t.hidePassword : t.showPassword}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-2 my-auto min-h-10 rounded-[var(--radius-control)] px-2 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-strong)]"
            >
              {showPassword ? t.hidePassword : t.showPassword}
            </button>
          </span>
        </label>

        <p id="reset-password-hint" className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm leading-6 text-[var(--muted)]">
          {t.hint}
        </p>

        <p
          role="alert"
          className={
            error
              ? "rounded-[var(--radius-control)] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              : "sr-only"
          }
        >
          {error}
        </p>

        <p
          role="status"
          className={
            message
              ? "rounded-[var(--radius-control)] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              : "sr-only"
          }
        >
          {message}
        </p>

        <Button type="submit" disabled={saving} className="min-h-12 w-full justify-center">
          {saving ? t.saving : t.save}
        </Button>
      </form>
    </section>
  );
}
