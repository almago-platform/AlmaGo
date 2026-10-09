"use client";

import { useEffect, useState } from "react";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { prospectDashboardCopy } from "@/content/prospect-dashboard-copy";
import type { Locale } from "@/lib/i18n";

const loadingLabel: Record<Locale, string> = {
  fr: "Chargement de votre espace gratuit…",
  ar: "جارٍ تحميل مساحتك المجانية…",
  en: "Loading your free space…",
  de: "Dein kostenloser Bereich wird geladen…",
};

const slowLoadingCopy: Record<Locale, { message: string; retry: string; home: string }> = {
  fr: {
    message: "Le chargement prend plus de temps que prévu. Vous pouvez réessayer ou retourner à votre tableau de bord.",
    retry: "Réessayer",
    home: "Tableau de bord",
  },
  ar: {
    message: "التحميل يستغرق وقتًا أطول من المتوقع. يمكنك إعادة المحاولة أو الرجوع إلى لوحة التحكم.",
    retry: "إعادة المحاولة",
    home: "لوحة التحكم",
  },
  en: {
    message: "This page is taking longer than expected. You can try again or return to your dashboard.",
    retry: "Try again",
    home: "Dashboard",
  },
  de: {
    message: "Das Laden dauert länger als erwartet. Du kannst es erneut versuchen oder zum Dashboard zurückkehren.",
    retry: "Erneut versuchen",
    home: "Dashboard",
  },
};

export default function ProspectLoading() {
  const { locale, direction } = useLocale();
  const t = prospectDashboardCopy[locale].page;
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 12_000);
    return () => window.clearTimeout(timer);
  }, []);
  const recovery = slowLoadingCopy[locale];

  return (
    <main
      dir={direction}
      aria-busy="true"
      aria-live="polite"
      role="status"
      className="min-w-0"
    >
      <span className="sr-only">{loadingLabel[locale]}</span>

      {slow ? (
        <section
          role="alert"
          aria-busy="false"
          className="mb-5 rounded-[var(--radius-panel)] border border-amber-300 bg-amber-50 p-4 text-slate-900"
        >
          <p className="text-sm leading-6">{recovery.message}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
            >
              {recovery.retry}
            </button>
            <a href="/prospect" className="rounded-[var(--radius-control)] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
              {recovery.home}
            </a>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]" aria-hidden="true">
        <div className="bg-[linear-gradient(115deg,#1c2124_0%,#252b2f_68%,#332a22_100%)] px-5 py-7 sm:px-7 sm:py-9">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#fcb50a]">
            {t.eyebrow}
          </p>
          <div className="mt-3 h-10 w-full max-w-2xl animate-pulse rounded-[var(--radius-control)] bg-white/15" />
          <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-5 w-4/5 max-w-lg animate-pulse rounded bg-white/10" />
        </div>
        <div className="border-t border-[var(--border)] bg-[var(--brand-soft)] p-5 sm:p-6">
          <div className="h-5 w-56 animate-pulse rounded bg-[var(--surface-muted)]" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--surface-muted)]" />
        </div>
      </section>

      <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6" aria-hidden="true">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="mt-3 h-7 w-full max-w-lg animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-muted)]" />
            <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--surface-muted)]" />
          </div>
          <div className="h-8 w-28 animate-pulse rounded-full bg-[var(--brand-soft)]" />
        </div>
      </section>

      <div className="mt-6 grid gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <section
            key={index}
            className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
            aria-hidden="true"
          >
            <div className="h-6 w-48 animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="mt-4 grid gap-3">
              <div className="h-24 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-subtle)]" />
              <div className="h-24 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-subtle)]" />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
