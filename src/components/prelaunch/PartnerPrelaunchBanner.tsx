"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

export function PartnerPrelaunchBanner({ enabled }: { enabled: boolean }) {
  const { locale } = useLocale();
  if (!enabled) return null;

  const copy = locale === "ar"
    ? {
        label: "نسخة تجريبية للشركاء",
        text: "بيئة عرض ببيانات اختبار فقط. الخدمة ليست مفتوحة للجمهور بعد.",
      }
    : {
        label: "Pré-lancement partenaire",
        text: "Environnement de démonstration avec données de test uniquement. Le service n’est pas encore ouvert au public.",
      };

  return (
    <aside
      role="status"
      data-partner-prelaunch="true"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold leading-5 text-amber-950 sm:text-sm"
    >
      <strong>{copy.label}</strong>
      <span aria-hidden="true"> · </span>
      <span>{copy.text}</span>
    </aside>
  );
}
