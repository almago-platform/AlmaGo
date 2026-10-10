"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

const content = {
  fr: {
    title: "Cette page ne s’affiche pas pour le moment",
    body: "Une erreur est survenue pendant le chargement. Votre dossier n’a pas été modifié.",
    retry: "Réessayer",
    home: "Tableau de bord",
  },
  ar: {
    title: "لا يمكن عرض هذه الصفحة حاليًا",
    body: "حدث خطأ أثناء التحميل. لم تتغير بيانات ملفك.",
    retry: "إعادة المحاولة",
    home: "لوحة التحكم",
  },
  en: {
    title: "We couldn't display this page",
    body: "Something went wrong while loading. Your application data was not changed.",
    retry: "Try again",
    home: "Dashboard",
  },
  de: {
    title: "Diese Seite kann gerade nicht angezeigt werden",
    body: "Beim Laden ist ein Fehler aufgetreten. Deine Daten wurden nicht geändert.",
    retry: "Erneut versuchen",
    home: "Dashboard",
  },
} as const;

export default function ProspectError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale, direction } = useLocale();
  const t = content[locale];

  return (
    <main dir={direction} role="alert" className="mx-auto max-w-3xl rounded-[var(--radius-panel)] border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold text-slate-950">{t.title}</h1>
      <p className="mt-3 text-base leading-7 text-slate-700">{t.body}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          {t.retry}
        </button>
        <a href="/prospect" className="rounded-[var(--radius-control)] border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900">
          {t.home}
        </a>
      </div>
    </main>
  );
}
