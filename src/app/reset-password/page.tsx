import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { accountStateCopy } from "@/content/account-state-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { resolveOrientationActivation } from "@/lib/orientation/account-activation";
import { isPhase2AccountLinkingEnabled } from "@/lib/phase2/config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = accountStateCopy[locale].reset;

  return {
    title: t.formTitle,
    description: t.formText,
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ orientation_token?: string | string[] }>;
}) {
  const [locale, params] = await Promise.all([getRequestLocale(), searchParams]);
  const rawToken = Array.isArray(params.orientation_token)
    ? params.orientation_token[0]
    : params.orientation_token;
  const orientationActivation = isPhase2AccountLinkingEnabled()
    ? await resolveOrientationActivation(rawToken)
    : null;
  const t = accountStateCopy[locale].reset;
  const loginHref = orientationActivation
    ? `/login?orientation_token=${encodeURIComponent(orientationActivation.token)}`
    : "/login";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_48%,#f1ece4_100%)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-7xl items-center gap-7 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <section className="hidden min-h-[620px] overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_28px_70px_-52px_rgba(28,33,36,0.55)] lg:flex lg:flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] p-7">
            <Link href="/" className="inline-flex items-center" aria-label={t.homeAria}>
              <BrandLogo className="h-auto w-56" />
            </Link>
            <LanguageSwitcher compact />
          </div>

          <div className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">{t.eyebrow}</p>
            <h1 className="editorial-accent mt-4 max-w-xl text-3xl leading-[1.08] text-[var(--foreground)]">
              {t.storyTitle}
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">{t.storyText}</p>

            <div className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span className="text-xs font-bold tracking-[0.14em] text-[var(--accent-strong)]">01</span>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{t.securityTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{t.securityText}</p>
                </div>
              </div>
              <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span className="text-xs font-bold tracking-[0.14em] text-[var(--accent-strong)]">02</span>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{t.accessTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{t.accessText}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[36rem]">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex min-h-11 items-center" aria-label={t.homeAria}>
              <BrandLogo className="h-auto w-32 sm:w-44" />
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher compact />
              <Link href={loginHref} className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]">
                {t.login}
              </Link>
            </div>
          </div>
          <ResetPasswordForm orientationToken={orientationActivation?.token} />
        </section>
      </div>
    </main>
  );
}
