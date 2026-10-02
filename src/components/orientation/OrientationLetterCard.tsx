"use client";

import type { Locale } from "@/lib/i18n";
import type {
  OrientationLetterOutput,
  OrientationScoutResult,
} from "@/lib/orientation-engine/types";

const copy = {
  fr: {
    label: "Lettre d’orientation",
    pistes: "Premières pistes à examiner ensemble",
    pisteNote: "Ces pistes servent à préparer notre échange. Campus Allemagne vérifiera les conditions officielles avant toute candidature.",
    source: "Page officielle",
    closing: "Prochaine étape",
  },
  ar: {
    label: "رسالة التوجيه",
    pistes: "مسارات أولية نراجعها معًا",
    pisteNote: "هذه المسارات تساعد على تحضير النقاش معنا. سيتحقق Campus Allemagne من الشروط الرسمية قبل أي تقديم.",
    source: "الصفحة الرسمية",
    closing: "الخطوة التالية",
  },
  en: {
    label: "Orientation letter",
    pistes: "First paths to review together",
    pisteNote: "These paths prepare our discussion. Campus Allemagne will verify the official conditions before any application.",
    source: "Official page",
    closing: "Next step",
  },
  de: {
    label: "Orientierungsschreiben",
    pistes: "Erste Optionen, die wir gemeinsam prüfen",
    pisteNote: "Diese Optionen dienen der Vorbereitung. Campus Allemagne prüft die offiziellen Bedingungen vor jeder Bewerbung.",
    source: "Offizielle Seite",
    closing: "Nächster Schritt",
  },
} satisfies Record<Locale, unknown>;

export function OrientationLetterCard({
  letter,
  scout,
  locale,
}: {
  letter: OrientationLetterOutput;
  scout: OrientationScoutResult;
  locale: Locale;
}) {
  const t = copy[locale] as (typeof copy)["fr"];

  return (
    <article className="mt-5 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-strong)]">
        {t.label}
      </p>
      <h4 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
        {letter.title}
      </h4>

      <div className="mt-4 space-y-4 text-[15px] leading-7 text-[var(--foreground)]">
        {letter.paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>

      {scout.status === "ready" && scout.candidates.length ? (
        <section className="mt-6 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <h5 className="text-base font-bold">{t.pistes}</h5>
          <div className="mt-3 space-y-3">
            {scout.candidates.map((candidate) => (
              <div
                key={`${candidate.institution}-${candidate.programme}`}
                className="border-s-2 border-[var(--brand-border)] ps-3"
              >
                <p className="font-bold">
                  {candidate.institution} — {candidate.programme}
                </p>
                {candidate.city ? (
                  <p className="mt-0.5 text-sm text-[var(--muted)]">{candidate.city}</p>
                ) : null}
                <p className="mt-1 text-sm leading-6">{candidate.reason}</p>
                <a
                  href={candidate.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm font-semibold underline underline-offset-2"
                >
                  {t.source}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{t.pisteNote}</p>
        </section>
      ) : null}

      <div className="mt-6 border-t border-[var(--brand-border)] pt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-strong)]">
          {t.closing}
        </p>
        <p className="mt-1 text-[15px] font-semibold leading-7">{letter.closing}</p>
      </div>
    </article>
  );
}
