"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { prospectOffersCopy } from "@/content/prospect-offers-copy";
import type { Locale } from "@/lib/i18n";

const loadingLabel: Record<Locale, string> = {
  fr: "Chargement des offres…",
  ar: "جارٍ تحميل العروض…",
  en: "Loading offers…",
  de: "Angebote werden geladen…",
};

export default function ProspectOffersLoading() {
  const { locale, direction } = useLocale();
  const copy = prospectOffersCopy[locale];

  return (
    <main
      dir={direction}
      aria-busy="true"
      aria-live="polite"
      role="status"
      className="min-w-0"
    >
      <span className="sr-only">{loadingLabel[locale]}</span>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
          {copy.title}
        </h1>
        <div
          className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--surface-muted)]"
          aria-hidden="true"
        />
      </header>

      <div className="grid gap-5 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <article
            key={index}
            className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
          >
            <div className="h-4 w-20 animate-pulse rounded bg-[var(--brand-soft)]" />
            <div className="mt-3 h-7 w-2/3 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[var(--surface-muted)]" />

            <div className="mt-6 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-[var(--surface-subtle)]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--surface-subtle)]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--surface-subtle)]" />
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-muted)]" />
              <div className="mt-2 h-8 w-32 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" />
            </div>

            <div className="mt-5 h-11 w-full animate-pulse rounded-[var(--radius-control)] bg-[var(--brand-soft)]" />
          </article>
        ))}
      </div>
    </main>
  );
}
