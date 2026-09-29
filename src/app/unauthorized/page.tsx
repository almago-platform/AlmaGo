import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { accountStateCopy } from "@/content/account-state-copy";
import { getRequestLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function UnauthorizedPage() {
  const locale = await getRequestLocale();
  const t = accountStateCopy[locale].unauthorized;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_55%,#f1ece4_100%)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] p-7 text-center shadow-[0_24px_70px_-54px_rgba(28,33,36,0.45)] sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-h-11 items-center" aria-label={t.homeAria}>
              <BrandLogo className="h-auto w-64" />
            </Link>
            <LanguageSwitcher compact />
          </div>

          <p className="mx-auto mt-10 inline-flex rounded-full border border-[#f2d37b] bg-[#fff0bf] px-4 py-2 text-sm font-bold text-[#8b6200]">
            {t.badge}
          </p>
          <h1 className="mx-auto mt-4 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">{t.text}</p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/student">{t.back}</ButtonLink>
            <ButtonLink href="/login" variant="secondary">{t.switchAccount}</ButtonLink>
          </div>
        </section>
      </div>
    </main>
  );
}
