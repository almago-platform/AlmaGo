"use client";

import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationLetterOutput,
  OrientationProgrammeEvaluation,
  OrientationScoutResult,
} from "@/lib/orientation-engine/types";

const copy = {
  fr: {
    label: "Lettre d’orientation",
    pistes: "Premières pistes à examiner ensemble",
    pisteNote: "Ces pistes servent de point de départ. Campus Allemagne vérifiera avec vous les conditions officielles avant de choisir les candidatures.",
    source: "Page officielle",
    closing: "Prochaine étape",
    verified: "Piste vérifiée",
    research: "Piste à vérifier ensemble",
    verifiedReason: "Cette piste est proche de votre projet. Nous vérifierons ensemble les conditions de langue et de candidature.",
    alternativeLanguage: (language: string) => `Alternative intéressante en ${language}. Elle diffère de votre préférence actuelle, mais mérite d’être comparée.`,
  },
  ar: {
    label: "رسالة التوجيه",
    pistes: "مسارات أولية نراجعها معًا",
    pisteNote: "هذه المسارات هي نقطة بداية. سيتحقق Campus Allemagne معك من الشروط الرسمية قبل اختيار طلبات التقديم.",
    source: "الصفحة الرسمية",
    closing: "الخطوة التالية",
    verified: "مسار موثّق",
    research: "مسار نتحقق منه معًا",
    verifiedReason: "هذا المسار قريب من مشروعك. سنتحقق معك من شروط اللغة والتقديم.",
    alternativeLanguage: (language: string) => `مسار بديل مثير للاهتمام باللغة ${language}. يختلف عن تفضيلك الحالي، لكنه يستحق المقارنة.`,
  },
  en: {
    label: "Orientation letter",
    pistes: "First paths to review together",
    pisteNote: "These paths are a starting point. Campus Allemagne will verify the official conditions with you before applications are chosen.",
    source: "Official page",
    closing: "Next step",
    verified: "Verified path",
    research: "Path to verify together",
    verifiedReason: "This path is close to your project. We will verify the language and application conditions together.",
    alternativeLanguage: (language: string) => `An interesting alternative in ${language}. It differs from your current preference, but is worth comparing.`,
  },
  de: {
    label: "Orientierungsschreiben",
    pistes: "Erste Optionen, die wir gemeinsam prüfen",
    pisteNote: "Diese Optionen sind ein Ausgangspunkt. Campus Allemagne prüft mit dir die offiziellen Bedingungen, bevor Bewerbungen ausgewählt werden.",
    source: "Offizielle Seite",
    closing: "Nächster Schritt",
    verified: "Geprüfte Option",
    research: "Gemeinsam zu prüfende Option",
    verifiedReason: "Diese Option passt grundsätzlich zu deinem Projekt. Sprache und Bewerbungsbedingungen prüfen wir gemeinsam.",
    alternativeLanguage: (language: string) => `Eine interessante Alternative auf ${language}. Sie weicht von deiner aktuellen Präferenz ab, ist aber einen Vergleich wert.`,
  },
} as const;

function languageKind(value: string | null) {
  const normalized = (value || "").toLowerCase();
  const german = /german|deutsch|allemand/.test(normalized);
  const english = /english|englisch|anglais/.test(normalized);
  if (german && english) return "mixed";
  if (german) return "german";
  if (english) return "english";
  return "unknown";
}

function languageLabel(locale: Locale, value: string | null) {
  const kind = languageKind(value);
  const labels = {
    fr: { german: "allemand", english: "anglais", mixed: "allemand / anglais", unknown: "langue à vérifier" },
    ar: { german: "الألمانية", english: "الإنجليزية", mixed: "الألمانية / الإنجليزية", unknown: "لغة يجب التحقق منها" },
    en: { german: "German", english: "English", mixed: "German / English", unknown: "language to verify" },
    de: { german: "Deutsch", english: "Englisch", mixed: "Deutsch / Englisch", unknown: "Sprache zu prüfen" },
  }[locale];
  return labels[kind];
}

function studyLanguageMismatch(answers: PublicOrientationAnswers, teachingLanguage: string | null) {
  const programme = languageKind(teachingLanguage);
  if (programme === "unknown" || programme === "mixed") return false;
  if (answers.studyLanguage === "Allemand") return programme === "english";
  if (answers.studyLanguage === "Anglais") return programme === "german";
  return false;
}

export function OrientationLetterCard({
  letter,
  scout,
  recommendations,
  answers,
  locale,
}: {
  letter: OrientationLetterOutput;
  scout: OrientationScoutResult;
  recommendations: OrientationProgrammeEvaluation[];
  answers: PublicOrientationAnswers;
  locale: Locale;
}) {
  const t = copy[locale];

  const verifiedPistes = recommendations.slice(0, 3).map((recommendation) => ({
    key: `verified-${recommendation.programme.id}`,
    institution: recommendation.programme.university.name,
    programme: recommendation.programme.name,
    city: recommendation.programme.university.city,
    language: recommendation.programme.teachingLanguage,
    source: recommendation.programme.programmeSourceUrl || recommendation.programme.university.websiteUrl,
    badge: t.verified,
    reason: studyLanguageMismatch(answers, recommendation.programme.teachingLanguage)
      ? t.alternativeLanguage(languageLabel(locale, recommendation.programme.teachingLanguage))
      : t.verifiedReason,
  }));

  const seen = new Set(
    verifiedPistes.map((item) => `${item.institution}|${item.programme}`.toLowerCase()),
  );
  const researchPistes = scout.status === "ready"
    ? scout.candidates
        .filter((candidate) => {
          const key = `${candidate.institution}|${candidate.programme}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((candidate) => ({
          key: `research-${candidate.institution}-${candidate.programme}`,
          institution: candidate.institution,
          programme: candidate.programme,
          city: candidate.city,
          language: null,
          source: candidate.officialUrl,
          badge: t.research,
          reason: candidate.reason,
        }))
    : [];

  const pistes = [...verifiedPistes, ...researchPistes].slice(0, 3);

  return (
    <article className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-strong)]">
        {t.label}
      </p>
      <h3 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
        {letter.title}
      </h3>

      <div className="mt-5 space-y-4 text-[15px] leading-7 text-[var(--foreground)] sm:text-base">
        {letter.paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>

      {pistes.length ? (
        <section className="mt-7 border-t border-[var(--brand-border)] pt-5">
          <h4 className="text-lg font-bold">{t.pistes}</h4>
          <div className="mt-4 grid gap-3">
            {pistes.map((piste) => (
              <article
                key={piste.key}
                className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h5 className="font-bold">{piste.institution} — {piste.programme}</h5>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {[piste.city, piste.language ? languageLabel(locale, piste.language) : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-semibold">
                    {piste.badge}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6">{piste.reason}</p>
                {piste.source ? (
                  <a
                    href={piste.source}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-semibold underline underline-offset-2"
                  >
                    {t.source}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{t.pisteNote}</p>
        </section>
      ) : null}

      <div className="mt-7 border-t border-[var(--brand-border)] pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-strong)]">
          {t.closing}
        </p>
        <p className="mt-2 text-base font-semibold leading-7">{letter.closing}</p>
      </div>
    </article>
  );
}
