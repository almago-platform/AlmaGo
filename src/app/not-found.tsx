import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { publicStateCopy } from "@/content/public-state-copy";
import { rebrandCopy } from "@/lib/brand";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function NotFoundPage() {
  const locale = await getRequestLocale();
  const t = rebrandCopy(publicStateCopy[locale].notFound);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_55%,#f1ece4_100%)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] p-7 text-center shadow-[0_24px_70px_-54px_rgba(28,33,36,0.45)] sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-h-11 items-center" aria-label={t.homeAria}>
              <BrandLogo className="h-auto w-40 sm:w-56" />
            </Link>
            <LanguageSwitcher compact />
          </div>

          <p className="mx-auto mt-10 inline-flex rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-2 text-sm font-bold text-[var(--brand-strong)]">
            404 · {t.eyebrow}
          </p>
          <h1 className="mx-auto mt-4 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">{t.text}</p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/">{t.home}</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">{t.contact}</ButtonLink>
          </div>
        </section>
      </div>
    </main>
  );
}
