"use client";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { orientationCopy } from "@/content/orientation-copy";
import type { Locale } from "@/lib/i18n";

const loadingLabel: Record<Locale, string> = {
  fr: "Chargement de votre orientation…",
  ar: "جارٍ تحميل التوجيه…",
  en: "Loading your orientation…",
  de: "Deine Orientierung wird geladen…",
};

export default function OrientationLoading() {
  const { locale, direction } = useLocale();
  const copy = orientationCopy[locale];

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"
      dir={direction}
      aria-busy="true"
    >
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-4 sm:px-6">
          <BrandLogo className="h-9 w-auto" priority />
        </div>
      </header>

      <main
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">{loadingLabel[locale]}</span>

        <section className="mx-auto max-w-3xl">
          <p className="eyebrow">{copy.intro.eyebrow}</p>
          <div className="mt-3 h-11 w-full max-w-2xl animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" />
          <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" />
          <div className="mt-2 h-5 w-4/5 max-w-lg animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" />
        </section>

        <section className="mx-auto mt-8 max-w-3xl" aria-hidden="true">
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="h-4 w-28 animate-pulse rounded bg-[var(--surface-muted)]" />
              <div className="h-4 w-12 animate-pulse rounded bg-[var(--surface-muted)]" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-full w-1/4 rounded-full bg-[var(--brand-soft)]" />
            </div>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
            <div className="h-7 w-2/3 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[var(--surface-muted)]" />

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)]"
                />
              ))}
            </div>

            <div className="mt-7 flex justify-between gap-3">
              <div className="h-11 w-28 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" />
              <div className="h-11 w-32 animate-pulse rounded-[var(--radius-control)] bg-[var(--brand-soft)]" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
