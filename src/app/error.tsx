"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { buttonClassName } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { publicStateCopy } from "@/content/public-state-copy";
import { rebrandCopy } from "@/lib/brand";

export default function PublicErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useLocale();
  const t = rebrandCopy(publicStateCopy[locale].error);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_55%,#f1ece4_100%)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <section className="pc-panel w-full rounded-[1rem] p-7 text-center sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-h-11 items-center" aria-label={t.homeAria}>
              <BrandLogo className="h-auto w-40 sm:w-56" />
            </Link>
            <LanguageSwitcher compact />
          </div>

          <p className="mx-auto mt-10 inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-800">
            {t.eyebrow}
          </p>
          <h1 className="mx-auto mt-4 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">{t.text}</p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={reset} className={buttonClassName("primary")}>
              {t.retry}
            </button>
            <ButtonLink href="/" variant="secondary">{t.home}</ButtonLink>
          </div>
        </section>
      </div>
    </main>
  );
}
