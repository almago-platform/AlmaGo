import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { FreeValidationInterestConfirm } from "@/components/orientation/FreeValidationInterestConfirm";
import { freeValidationInterestConfirmationCopy } from "@/content/free-validation-interest-copy";
import { localeDirection, normalizeLocale } from "@/lib/i18n";
import { hashFreeValidationInterestToken } from "@/lib/phase2/free-validation-interest-token";
import { isPhase2ProspectCaptureEnabled } from "@/lib/phase2/config";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function FreeValidationInterestPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (!isPhase2ProspectCaptureEnabled()) notFound();

  const { token } = await params;
  const tokenHash = hashFreeValidationInterestToken(token);
  if (!tokenHash) notFound();

  let supabase;
  try {
    supabase = createPrivilegedSupabaseClient();
  } catch {
    notFound();
  }

  const { data, error } = await supabase
    .from("orientations")
    .select("input")
    .eq("free_validation_interest_token_hash", tokenHash)
    .gt("free_validation_interest_token_expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) notFound();

  const input = data.input && typeof data.input === "object"
    ? data.input as Record<string, unknown>
    : {};
  const locale = normalizeLocale(typeof input.locale === "string" ? input.locale : null);
  const direction = localeDirection(locale);
  const copy = freeValidationInterestConfirmationCopy[locale];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]" dir={direction}>
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo className="h-9 w-auto" priority />
          </Link>
          <Link href="/" className="text-sm font-semibold underline-offset-4 hover:underline">
            {copy.home}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <section className="professional-panel rounded-[var(--radius-panel)] p-5 sm:p-7">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
            {copy.text}
          </p>

          <div className="mt-6">
            <FreeValidationInterestConfirm token={token} locale={locale} />
          </div>

          <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--foreground)]">
            {copy.privacyNote}
          </p>
        </section>
      </main>
    </div>
  );
}
