import { BrandLogo } from "@/components/brand/BrandLogo";
import type { Locale } from "@/lib/i18n";

export type CandidateReportRow = {
  label: string;
  value: string;
};

export type CandidateReportSection = {
  title: string;
  rows: CandidateReportRow[];
};

const copy: Record<Locale, {
  report: string;
  title: string;
  subtitle: string;
  generated: string;
  confidentiality: string;
}> = {
  fr: {
    report: "Rapport candidat",
    title: "Synthèse du profil candidat",
    subtitle: "Informations déclarées par le candidat pour préparer son projet d’études en Allemagne.",
    generated: "Généré le",
    confidentiality: "Document personnel · Campus Allemagne",
  },
  ar: {
    report: "تقرير المترشح",
    title: "ملخص ملف المترشح",
    subtitle: "المعلومات التي صرّح بها المترشح لإعداد مشروعه الدراسي في ألمانيا.",
    generated: "تم الإنشاء في",
    confidentiality: "وثيقة شخصية · Campus Allemagne",
  },
  en: {
    report: "Candidate report",
    title: "Candidate profile summary",
    subtitle: "Information provided by the candidate to prepare their study project in Germany.",
    generated: "Generated on",
    confidentiality: "Personal document · Campus Allemagne",
  },
  de: {
    report: "Bewerberbericht",
    title: "Zusammenfassung des Bewerberprofils",
    subtitle: "Angaben der Bewerberin oder des Bewerbers zur Vorbereitung des Studienprojekts in Deutschland.",
    generated: "Erstellt am",
    confidentiality: "Persönliches Dokument · Campus Allemagne",
  },
};

export function OrientationCandidatePrintReport({
  locale,
  candidateName,
  candidateEmail,
  birthDate,
  generatedAt,
  sections,
}: {
  locale: Locale;
  candidateName: string;
  candidateEmail: string;
  birthDate: string;
  generatedAt: string;
  sections: CandidateReportSection[];
}) {
  const t = copy[locale];

  return (
    <section
      className="orientation-one-page-print orientation-candidate-pdf"
      aria-label={t.report}
    >
      <header className="candidate-pdf-header">
        <BrandLogo className="h-9 w-auto" priority />
        <div>
          <p className="candidate-pdf-kicker">{t.report}</p>
          <p className="candidate-pdf-date">{t.generated} · {generatedAt}</p>
        </div>
      </header>

      <section className="candidate-pdf-hero">
        <div>
          <p className="candidate-pdf-eyebrow">Campus Allemagne</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="candidate-pdf-identity">
          <strong>{candidateName || "—"}</strong>
          <span>{birthDate || "—"}</span>
          <span>{candidateEmail || "—"}</span>
        </div>
      </section>

      <div className="candidate-pdf-sections">
        {sections.map((section) => (
          <section key={section.title} className="candidate-pdf-section">
            <h2>{section.title}</h2>
            <dl>
              {section.rows.map((row) => (
                <div key={`${section.title}-${row.label}`}>
                  <dt>{row.label}</dt>
                  <dd><bdi dir="auto">{row.value || "—"}</bdi></dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <footer className="candidate-pdf-footer">
        <strong>{t.confidentiality}</strong>
        <span>{candidateEmail}</span>
      </footer>
    </section>
  );
}
