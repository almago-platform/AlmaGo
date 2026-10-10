"use client";

import type { Locale } from "@/lib/i18n";
import { explainDocumentedProgramme } from "@/lib/orientation-engine/letter/programme-explanations";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationLetterOutput,
  OrientationProgrammeEvaluation,
  OrientationScoutResult,
} from "@/lib/orientation-engine/types";

const copy = {
  fr: {
    label: "Lettre d’orientation",
    pistes: "Des formations à découvrir pour votre avenir en Allemagne",
    pisteNote: "Voici des formations en lien avec votre projet. Vous nous confiez vos envies, vos moyens et vos préférences ; si vous choisissez de poursuivre, notre équipe étudiera les conditions et vous accompagnera dans la sélection des candidatures.",
    source: "Site officiel",
    closing: "Prochaine étape",
    verified: "Formation à découvrir",
    research: "Autre piste à explorer",
    why: "Ce qui rend cette piste intéressante",
    researchReason: "Une autre formation à découvrir pour élargir vos possibilités d'études en Allemagne.",
  },
  ar: {
    label: "رسالة التوجيه",
    pistes: "اكتشف برامج دراسية لمستقبلك في ألمانيا",
    pisteNote: "هذه برامج مرتبطة بمشروعك الدراسي. شاركنا طموحاتك وإمكاناتك وتفضيلاتك، وإذا اخترت مواصلة الطريق معنا فسيتولى فريقنا دراسة الشروط ومرافقتك في اختيار طلبات التقديم.",
    source: "الموقع الرسمي",
    closing: "الخطوة القادمة",
    verified: "برنامج يستحق الاستكشاف",
    research: "خيار آخر للاستكشاف",
    why: "ما الذي يميز هذا الخيار؟",
    researchReason: "برنامج آخر يمكنك اكتشافه لتوسيع خيارات الدراسة في ألمانيا.",
  },
  en: {
    label: "Orientation letter",
    pistes: "Explore study programmes for your future in Germany",
    pisteNote: "Here are programmes connected to your study plans. Tell us your goals, budget and preferences; if you choose to continue, our team will review the requirements and guide you through choosing applications.",
    source: "Official website",
    closing: "Next step",
    verified: "Explore this programme",
    research: "Another option to explore",
    why: "What makes this option interesting",
    researchReason: "Another course to discover as you explore study opportunities in Germany.",
  },
  de: {
    label: "Orientierungsschreiben",
    pistes: "Entdecke Studiengänge für deine Zukunft in Deutschland",
    pisteNote: "Hier findest du Studiengänge, die zu deinem Vorhaben passen könnten. Teile uns deine Ziele, Möglichkeiten und Wünsche mit. Wenn du mit uns weitermachst, prüft unser Team die Voraussetzungen und begleitet dich bei der Auswahl deiner Bewerbungen.",
    source: "Offizielle Website",
    closing: "Nächster Schritt",
    verified: "Studiengang entdecken",
    research: "Weitere Möglichkeit entdecken",
    why: "Warum diese Möglichkeit interessant ist",
    researchReason: "Ein weiterer Studiengang, den du bei der Suche nach passenden Möglichkeiten entdecken kannst.",
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

function firstContactPreferenceScore(
  answers: PublicOrientationAnswers,
  recommendation: OrientationProgrammeEvaluation,
) {
  let score = 0;
  if (!studyLanguageMismatch(answers, recommendation.programme.teachingLanguage)) score += 2;
  if (
    answers.preferredCities.length > 0
    && recommendation.programme.university.city
    && answers.preferredCities.some(
      (city) => city.toLowerCase() === recommendation.programme.university.city?.toLowerCase(),
    )
  ) score += 3;
  return score;
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

  const verifiedPistes = recommendations
    .map((recommendation, index) => ({ recommendation, index }))
    .sort((a, b) =>
      firstContactPreferenceScore(answers, b.recommendation)
      - firstContactPreferenceScore(answers, a.recommendation)
      || a.index - b.index
    )
    .slice(0, 3)
    .map(({ recommendation }) => ({
    key: `verified-${recommendation.programme.id}`,
    institution: recommendation.programme.university.name,
    programme: recommendation.programme.name,
    city: recommendation.programme.university.city,
    language: recommendation.programme.teachingLanguage,
    source: recommendation.programme.programmeSourceUrl || recommendation.programme.university.websiteUrl,
    badge: t.verified,
    ...explainDocumentedProgramme(recommendation, answers, locale),
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
          reason: t.researchReason,
        }))
    : [];

  const pistes = [...verifiedPistes, ...researchPistes].slice(0, 3);


  return (
    <article className="orientation-letter-card overflow-hidden rounded-[var(--radius-panel)] border border-[var(--premium-border)] bg-[var(--surface)] shadow-[0_12px_35px_-32px_rgba(19,33,49,0.30)]">
      <div className="px-5 pb-7 pt-7 sm:px-8 sm:pb-9 sm:pt-9 lg:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M6.5 4.5h8l3 3v10h-11v-13Zm8 0v3h3M9 11h6M9 14h5" /></svg>
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--brand-strong)]">
            {t.label}
          </p>
        </div>
        <h3 className="mt-4 max-w-[45rem] text-[1.6rem] font-semibold leading-[1.18] tracking-[-0.025em] text-[var(--foreground)] sm:text-[2rem]">
          {letter.title}
        </h3>

        <div className="mt-7 max-w-[71ch] space-y-5 text-[15px] leading-[1.85] text-[var(--foreground)] sm:space-y-6 sm:text-[16px]">
          {letter.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={index === 0
                ? "border-s-[3px] border-[var(--accent)] ps-4 font-medium leading-[1.85] sm:ps-5"
                : ""}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {pistes.length ? (
        <section className="border-t border-[var(--border)] bg-[var(--premium-cream-soft)] px-5 py-7 sm:px-8 sm:py-8 lg:px-10" aria-labelledby="orientation-programme-pistes-heading">
          <div className="max-w-[62rem]">
            <h4 id="orientation-programme-pistes-heading" className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">{t.pistes}</h4>
            <p className="mt-2 max-w-[68ch] text-sm leading-6 text-[var(--muted)]">{t.pisteNote}</p>
          </div>
          <div className="mt-6 grid gap-3 sm:gap-4">
            {pistes.map((piste, index) => (
              <article
                key={piste.key}
                className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--brand-border)] sm:p-5"
              >
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-xs font-bold tabular-nums text-[var(--foreground)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-2">
                      <h5 dir="auto" className="min-w-0 max-w-[42rem] text-base font-semibold leading-6 [overflow-wrap:anywhere]">{piste.institution} — {piste.programme}</h5>
                      <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]">
                        {piste.badge}
                      </span>
                    </div>
                    {piste.city || piste.language ? (
                      <p className="mt-2 text-[13px] font-medium leading-5 text-[var(--muted)]">
                        {[piste.city, piste.language ? languageLabel(locale, piste.language) : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                    <p className="mt-3 max-w-[73ch] text-sm leading-6 text-[var(--foreground)]">
                      <span className="font-semibold">{t.why} : </span>{piste.reason}
                    </p>
                    {piste.source ? (
                      <a
                        href={piste.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[var(--brand-strong)] underline decoration-[var(--brand-border)] underline-offset-4 hover:decoration-current"
                      >
                        {t.source}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4 shrink-0" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M8 7h9v9" /></svg>
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-6 sm:px-8 sm:py-7 lg:px-10" aria-label={t.closing}>
        <div className="max-w-[76ch] border-s-[3px] border-[var(--brand)] ps-4 sm:ps-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)]">{t.closing}</p>
          <p className="mt-2 text-base font-semibold leading-7 text-[var(--foreground)]">{letter.closing}</p>
        </div>
      </section>
    </article>
  );
}
