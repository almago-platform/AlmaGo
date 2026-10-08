"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

export type LinkedAdmissionLetter = {
  id: string;
  application_id: string | null;
  document_id: string | null;
  evidence_type: string;
  verification_status: string;
};

const copy = {
  fr: {
    title: "Lettre universitaire reçue",
    final: "Admission définitive",
    conditional: "Admission conditionnelle",
    pending: "Vérification Campus en attente",
    verified: "Preuve vérifiée par Campus",
    open: "Lire le PDF",
    missing: "Fichier à vérifier",
    unavailable: "Lettres momentanément indisponibles",
    note: "La vérification d’un PDF ne modifie pas automatiquement le statut de candidature.",
  },
  ar: {
    title: "رسالة من الجامعة",
    final: "قبول نهائي",
    conditional: "قبول مشروط",
    pending: "قيد المراجعة لدى Campus",
    verified: "تم التحقق من الوثيقة لدى Campus",
    open: "عرض PDF",
    missing: "الملف يحتاج إلى مراجعة",
    unavailable: "الرسائل الجامعية غير متاحة مؤقتًا",
    note: "التحقق من ملف PDF لا يغيّر تلقائيًا حالة الطلب الجامعي.",
  },
  de: {
    title: "Schreiben der Hochschule",
    final: "Endgültige Zulassung",
    conditional: "Bedingte Zulassung",
    pending: "Prüfung durch Campus ausstehend",
    verified: "Nachweis von Campus geprüft",
    open: "PDF ansehen",
    missing: "Datei erneut prüfen",
    unavailable: "Schreiben derzeit nicht verfügbar",
    note: "Die PDF-Prüfung ändert den Bewerbungsstatus nicht automatisch.",
  },
  en: {
    title: "University letter",
    final: "Definitive admission",
    conditional: "Conditional admission",
    pending: "Campus review pending",
    verified: "Evidence reviewed by Campus",
    open: "View PDF",
    missing: "File needs review",
    unavailable: "Letters temporarily unavailable",
    note: "Reviewing a PDF does not automatically change the application status.",
  },
} as const;

export function StudentApplicationLetters({
  applicationId,
  letters,
  unavailable = false,
}: {
  applicationId: string;
  letters: LinkedAdmissionLetter[];
  unavailable?: boolean;
}) {
  const { locale } = useLocale();
  const t = copy[locale];
  const selected = letters.filter((letter) => letter.application_id === applicationId);

  if (unavailable) {
    return <p className="mt-3 text-xs text-slate-600">{t.unavailable}</p>;
  }
  if (!selected.length) return null;

  return (
    <section aria-label={t.title} className="mt-4 rounded-[var(--premium-radius-control)] border border-[var(--premium-border)] bg-white p-4">
      <h4 className="text-sm font-bold text-slate-950">{t.title}</h4>
      <div className="mt-2 space-y-3">
        {selected.map((letter) => (
          <div key={letter.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--premium-border)] pt-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {letter.evidence_type === "conditional_admission" ? t.conditional : t.final}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {letter.verification_status === "accepted_for_pathway" ? t.verified : t.pending}
              </p>
            </div>
            {letter.document_id ? (
              <a href={`/api/documents/${letter.document_id}/view`} target="_blank" rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] px-2 text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">
                {t.open} →
              </a>
            ) : (
              <p className="text-xs text-slate-600">{t.missing}</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600">{t.note}</p>
    </section>
  );
}
