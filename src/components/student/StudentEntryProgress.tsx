"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

type EntryStage = 1 | 2 | 3;

const progressCopy = {
  fr: {
    aria: "Progression de création du dossier",
    title: "Parcours de démarrage",
    step: "Étape",
    of: "sur",
    stages: [
      ["Compte", "Créer votre accès"],
      ["Dossier initial", "Renseigner votre profil"],
      ["Espace étudiant", "Suivre votre parcours"],
    ],
  },
  ar: {
    aria: "تقدّم إعداد الملف",
    title: "ابدأ في ثلاث خطوات",
    step: "الخطوة",
    of: "من",
    stages: [
      ["الحساب", "أنشئ بيانات الدخول"],
      ["معلوماتك", "أضف بياناتك الأساسية"],
      ["ملفك", "تابع مشروعك وخطواتك"],
    ],
  },
  en: {
    aria: "File setup progress",
    title: "Getting started",
    step: "Step",
    of: "of",
    stages: [
      ["Account", "Create your access"],
      ["Initial file", "Add your profile"],
      ["Student space", "Follow your journey"],
    ],
  },
  de: {
    aria: "Fortschritt bei der Einrichtung",
    title: "Erste Schritte",
    step: "Schritt",
    of: "von",
    stages: [
      ["Konto", "Zugang erstellen"],
      ["Erste Angaben", "Profil ausfüllen"],
      ["Studierendenbereich", "Studienweg verfolgen"],
    ],
  },
} as const;

export function StudentEntryProgress({
  current,
  compact = false,
}: {
  current: EntryStage;
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const copy = progressCopy[locale];

  return (
    <div aria-label={copy.aria}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
          {copy.title}
        </p>
        <span className="text-xs font-semibold text-[var(--muted)]">
          {copy.step} {current} {copy.of} 3
        </span>
      </div>

      <ol className={compact ? "mt-2 grid grid-cols-3 gap-1.5" : "mt-3 grid gap-2 sm:grid-cols-3"}>
        {copy.stages.map(([label, detail], index) => {
          const id = (index + 1) as EntryStage;
          const active = id === current;
          const done = id < current;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className={
                compact
                  ? "min-w-0"
                  : `rounded-[var(--radius-control)] border px-3 py-3 ${
                      active
                        ? "border-[var(--brand-border)] bg-[var(--brand-soft)]"
                        : done
                          ? "border-[var(--border)] bg-[var(--surface-subtle)]"
                          : "border-[var(--border)] bg-[var(--surface)]"
                    }`
              }
            >
              {compact ? (
                <div
                  className={
                    "h-1.5 rounded-full " +
                    (active || done ? "bg-[var(--brand)]" : "bg-[var(--border)]")
                  }
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold " +
                      (active || done
                        ? "bg-[var(--brand)] text-white"
                        : "bg-[var(--surface-muted)] text-[var(--muted)]")
                    }
                  >
                    {done ? "✓" : id}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--foreground)]">{label}</p>
                    <p className="mt-0.5 text-[0.68rem] leading-4 text-[var(--muted)]">{detail}</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
