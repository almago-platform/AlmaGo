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
    pistes: "Premières pistes à examiner ensemble",
    pisteNote: "Ces pistes servent de point de départ. Campus Allemagne vérifiera avec vous les conditions officielles avant de choisir les candidatures.",
    source: "Page officielle",
    closing: "Prochaine étape",
    verified: "Piste documentée",
    research: "Piste à vérifier ensemble",
    why: "Pourquoi cette piste",
    toCheck: "À vérifier avant de candidater",
    researchReason: "Cette piste vient d’une recherche exploratoire. Son adéquation à votre profil n’est pas encore confirmée.",
    researchChecks: ["Vérifier si votre diplôme donne accès à ce programme.", "Vérifier la langue, le certificat demandé et la date limite."],
    alternativeLanguage: (language: string) => `Alternative intéressante en ${language}. Elle diffère de votre préférence actuelle, mais mérite d’être comparée.`,
  },
  ar: {
    label: "رسالة التوجيه",
    pistes: "مسارات أولية نراجعها معًا",
    pisteNote: "هذه المسارات هي نقطة بداية. سيتحقق Campus Allemagne معك من الشروط الرسمية قبل اختيار طلبات التقديم.",
    source: "الصفحة الرسمية",
    closing: "الخطوة التالية",
    verified: "مسار موثّق بالمصادر",
    research: "مسار نتحقق منه معًا",
    why: "لماذا هذا البرنامج؟",
    toCheck: "ما يجب التحقق منه قبل التقديم",
    researchReason: "هذا مسار ظهر أثناء بحث أولي، ولم يتم تأكيد ملاءمته لملفك بعد.",
    researchChecks: ["التأكد من أن شهادتك تتيح الالتحاق بهذا البرنامج.", "التحقق من لغة الدراسة والشهادة المقبولة وموعد التقديم."],
    alternativeLanguage: (language: string) => `مسار بديل مثير للاهتمام باللغة ${language}. يختلف عن تفضيلك الحالي، لكنه يستحق المقارنة.`,
  },
  en: {
    label: "Orientation letter",
    pistes: "First paths to review together",
    pisteNote: "These paths are a starting point. Campus Allemagne will verify the official conditions with you before applications are chosen.",
    source: "Official page",
    closing: "Next step",
    verified: "Documented path",
    research: "Path to verify together",
    why: "Why this option",
    toCheck: "Check before applying",
    researchReason: "This option came from exploratory research. Its fit with your profile has not been confirmed.",
    researchChecks: ["Check whether your diploma gives access to this programme.", "Check the teaching language, accepted certificate and deadline."],
    alternativeLanguage: (language: string) => `An interesting alternative in ${language}. It differs from your current preference, but is worth comparing.`,
  },
  de: {
    label: "Orientierungsschreiben",
    pistes: "Erste Optionen, die wir gemeinsam prüfen",
    pisteNote: "Diese Optionen sind ein Ausgangspunkt. Campus Allemagne prüft mit dir die offiziellen Bedingungen, bevor Bewerbungen ausgewählt werden.",
    source: "Offizielle Seite",
    closing: "Nächster Schritt",
    verified: "Dokumentierte Option",
    research: "Gemeinsam zu prüfende Option",
    why: "Warum diese Option?",
    toCheck: "Vor der Bewerbung prüfen",
    researchReason: "Diese Option stammt aus einer ersten Recherche. Ob sie zu deinem Profil passt, ist noch nicht bestätigt.",
    researchChecks: ["Prüfen, ob dein Abschluss Zugang zu diesem Studiengang ermöglicht.", "Unterrichtssprache, Zertifikat und Bewerbungsfrist prüfen."],
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
          checks: [...t.researchChecks],
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
                    <div className="mt-3 max-w-[73ch] rounded-[var(--radius-control)] bg-[var(--surface-subtle)] px-3 py-3">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t.toCheck}</p>
                      <ul className="mt-1 list-disc space-y-1 ps-5 text-sm leading-6 text-[var(--muted)]">
                        {piste.checks.map((check) => <li key={check}>{check}</li>)}
                      </ul>
                    </div>
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
