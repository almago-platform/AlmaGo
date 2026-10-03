"use client";

import type { Locale } from "@/lib/i18n";
import type {
  OrientationPublicPersonalizedFact,
  OrientationPublicPersonalizedResult,
} from "@/lib/orientation-engine/result/types";
import type { OrientationVerificationFactKey } from "@/lib/orientation-engine/verification/types";

const copy = {
  fr: {
    priority: "Votre prochaine action",
    language: "Votre progression en langue",
    campus: "Pendant ce temps, Campus Allemagne avance pour vous",
    options: "Vos pistes universitaires",
    optionsHelp: "Nous avons identifié ces pistes à partir de votre profil et des informations disponibles. Elles constituent une base de travail pour votre dossier, pas une admission.",
    why: "Pourquoi cette piste",
    progress: "Ce que nous vérifions pour vous",
    roadmap: "Qui fait quoi maintenant",
    next: "Votre prochaine action",
    review: "Suivi Campus Allemagne",
    reviewText: "Nous conservons les faits et les sources de cette orientation et poursuivons les contrôles en arrière-plan, sans bloquer votre résultat.",
    details: "Voir les faits et sources",
    verified: "Vérifié",
    reviewNeeded: "À confirmer",
    source: "Source",
    checked: "Vérifié le",
    noFacts: "Aucun fait publiable supplémentaire n’est disponible pour cette piste.",
  },
  ar: {
    priority: "خطوتك التالية",
    language: "تقدمك في اللغة",
    campus: "في الوقت نفسه، يواصل Campus Allemagne العمل من أجلك",
    options: "مساراتك الجامعية",
    optionsHelp: "حددنا هذه المسارات انطلاقًا من ملفك والمعلومات المتاحة. هي قاعدة عمل لملفك وليست قبولًا جامعيًا.",
    why: "لماذا هذا المسار",
    progress: "ما نتحقق منه من أجلك",
    roadmap: "من يقوم بماذا الآن",
    next: "خطوتك التالية",
    review: "متابعة Campus Allemagne",
    reviewText: "نحتفظ بالحقائق والمصادر ونواصل التحقق في الخلفية من دون تعطيل نتيجتك.",
    details: "عرض الحقائق والمصادر",
    verified: "موثّق",
    reviewNeeded: "يحتاج إلى تأكيد",
    source: "المصدر",
    checked: "تم التحقق في",
    noFacts: "لا توجد حقائق إضافية قابلة للعرض لهذه المسار حاليًا.",
  },
  en: {
    priority: "Your next action",
    language: "Your language progress",
    campus: "Meanwhile, Campus Allemagne keeps your project moving",
    options: "Your university paths",
    optionsHelp: "We identified these paths from your profile and the information currently available. They are a working shortlist for your file, not an admission decision.",
    why: "Why this path",
    progress: "What we are checking for you",
    roadmap: "Who does what now",
    next: "Your next action",
    review: "Campus Allemagne follow-up",
    reviewText: "We keep the facts and sources behind this orientation and continue the checks in the background without blocking your result.",
    details: "View facts and sources",
    verified: "Verified",
    reviewNeeded: "To confirm",
    source: "Source",
    checked: "Checked on",
    noFacts: "No additional publishable facts are currently available for this path.",
  },
  de: {
    priority: "Dein nächster Schritt",
    language: "Dein Sprachfortschritt",
    campus: "Währenddessen bringt Campus Allemagne dein Projekt weiter",
    options: "Deine Studienoptionen",
    optionsHelp: "Wir haben diese Optionen aus deinem Profil und den derzeit verfügbaren Informationen abgeleitet. Sie sind eine Arbeitsauswahl für dein Dossier, keine Zulassungsentscheidung.",
    why: "Warum diese Option",
    progress: "Was wir für dich noch prüfen",
    roadmap: "Wer macht jetzt was",
    next: "Dein nächster Schritt",
    review: "Campus-Allemagne-Begleitung",
    reviewText: "Wir behalten die Fakten und Quellen dieser Orientierung im Blick und führen die Prüfungen im Hintergrund weiter, ohne dein Ergebnis zu blockieren.",
    details: "Fakten und Quellen anzeigen",
    verified: "Geprüft",
    reviewNeeded: "Zu bestätigen",
    source: "Quelle",
    checked: "Geprüft am",
    noFacts: "Für diese Option sind derzeit keine weiteren veröffentlichbaren Fakten verfügbar.",
  },
} satisfies Record<Locale, Record<string, string>>;

const factLabels: Record<Locale, Record<OrientationVerificationFactKey, string>> = {
  fr: {
    programme_exists: "Programme actuellement proposé",
    degree_level: "Niveau du diplôme",
    city: "Ville",
    teaching_language: "Langue d’enseignement",
    german_language_requirement: "Niveau d’allemand demandé",
    english_language_requirement: "Niveau d’anglais demandé",
    accepted_language_certificates: "Certificats de langue acceptés",
    intake_terms: "Rentrées disponibles",
    winter_deadline: "Date limite — hiver",
    summer_deadline: "Date limite — été",
    application_route: "Voie de candidature",
    application_url: "Page de candidature",
    studienkolleg_requirement: "Condition Studienkolleg",
    tuition_or_semester_fees: "Frais publiés",
  },
  ar: {
    programme_exists: "البرنامج متاح حاليًا",
    degree_level: "مستوى الشهادة",
    city: "المدينة",
    teaching_language: "لغة الدراسة",
    german_language_requirement: "مستوى الألمانية المطلوب",
    english_language_requirement: "مستوى الإنجليزية المطلوب",
    accepted_language_certificates: "شهادات اللغة المقبولة",
    intake_terms: "فترات بدء الدراسة",
    winter_deadline: "آخر موعد — الشتاء",
    summer_deadline: "آخر موعد — الصيف",
    application_route: "طريقة التقديم",
    application_url: "صفحة التقديم",
    studienkolleg_requirement: "شرط Studienkolleg",
    tuition_or_semester_fees: "الرسوم المنشورة",
  },
  en: {
    programme_exists: "Programme currently offered",
    degree_level: "Degree level",
    city: "City",
    teaching_language: "Teaching language",
    german_language_requirement: "German requirement",
    english_language_requirement: "English requirement",
    accepted_language_certificates: "Accepted language certificates",
    intake_terms: "Available intakes",
    winter_deadline: "Winter deadline",
    summer_deadline: "Summer deadline",
    application_route: "Application route",
    application_url: "Application page",
    studienkolleg_requirement: "Studienkolleg condition",
    tuition_or_semester_fees: "Published fees",
  },
  de: {
    programme_exists: "Studiengang aktuell angeboten",
    degree_level: "Abschlussniveau",
    city: "Stadt",
    teaching_language: "Unterrichtssprache",
    german_language_requirement: "Deutschanforderung",
    english_language_requirement: "Englischanforderung",
    accepted_language_certificates: "Akzeptierte Sprachnachweise",
    intake_terms: "Verfügbare Studienstarts",
    winter_deadline: "Bewerbungsfrist — Winter",
    summer_deadline: "Bewerbungsfrist — Sommer",
    application_route: "Bewerbungsweg",
    application_url: "Bewerbungsseite",
    studienkolleg_requirement: "Studienkolleg-Bedingung",
    tuition_or_semester_fees: "Veröffentlichte Gebühren",
  },
};

function formatFactValue(value: OrientationPublicPersonalizedFact["value"], locale: Locale) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") {
    if (locale === "ar") return value ? "نعم" : "لا";
    if (locale === "de") return value ? "Ja" : "Nein";
    if (locale === "en") return value ? "Yes" : "No";
    return value ? "Oui" : "Non";
  }
  return value;
}

function formatDate(value: string | null, locale: Locale) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function OrientationPersonalizedWriterCard({
  result,
  locale,
  showCta = false,
}: {
  result: OrientationPublicPersonalizedResult;
  locale: Locale;
  showCta?: boolean;
}) {
  const t = copy[locale];
  const content = result.content;

  return (
    <article className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--surface)] p-5 sm:p-6">
      <p className="text-lg font-semibold leading-8 text-[var(--foreground)]">
        {content.opening}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
        {content.projectStatus}
      </p>

      <section className="mt-6 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4">
        <p className="eyebrow">{t.priority}</p>
        <h4 className="mt-2 text-lg font-bold">{content.mainPriority.title}</h4>
        <p className="mt-2 text-sm leading-6">{content.mainPriority.text}</p>
        <p className="mt-2 text-sm font-semibold leading-6">{content.mainPriority.nextStep}</p>
      </section>

      {content.languagePlan.show ? (
        <section className="mt-5">
          <p className="eyebrow">{t.language}</p>
          <p className="mt-2 text-sm leading-6">{content.languagePlan.text}</p>
          {content.languagePlan.availablePaths.length ? (
            <ul className="mt-2 space-y-1 text-sm leading-6">
              {content.languagePlan.availablePaths.map((path) => (
                <li key={path}>• {path}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="mt-5 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4">
        <p className="eyebrow">{t.campus}</p>
        <p className="mt-2 text-sm leading-6">{content.campusValue}</p>
      </section>

      <section className="mt-7" aria-labelledby="orientation-personalized-options">
        <h4 id="orientation-personalized-options" className="text-xl font-bold">
          {t.options}
        </h4>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{t.optionsHelp}</p>
        <div className="mt-4 grid gap-4">
          {content.studyOptions.map((option) => (
            <article
              key={option.optionId}
              className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-strong)]">
                {option.position}
              </p>
              <h5 className="mt-1 text-lg font-bold">{option.programme}</h5>
              <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                {option.institution}{option.city ? ` · ${option.city}` : ""}
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                {t.why}
              </p>
              <p className="mt-1 text-sm leading-6">{option.whyItFits}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                {t.progress}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                {option.verificationNote}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h4 className="text-lg font-bold">{t.roadmap}</h4>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {content.roadmap.map((item, index) => (
            <li
              key={item.id}
              className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
            >
              <span className="text-xs font-bold text-[var(--brand-strong)]">{index + 1}</span>
              <p className="mt-1 text-sm font-bold">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-sm font-semibold leading-6">{content.reassurance}</p>

      <section className="mt-6 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4">
        <p className="eyebrow">{t.next}</p>
        <h4 className="mt-2 text-lg font-bold">{content.cta.label}</h4>
        <p className="mt-1 text-sm leading-6">{content.cta.text}</p>
        {showCta ? (
          <a
            href="#orientation-prospect-capture"
            className="mt-4 inline-flex rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
          >
            {content.cta.label}
          </a>
        ) : null}
      </section>

      {result.humanReview.mode === "post_result_audit" ? (
        <aside className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-[var(--foreground)]">
          <p className="text-sm font-bold">{t.review}</p>
          <p className="mt-1 text-xs leading-5">{t.reviewText}</p>
        </aside>
      ) : null}

      <details className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <summary className="cursor-pointer text-sm font-bold">{t.details}</summary>
        <div className="mt-4 space-y-4">
          {result.selected.map((option) => (
            <section
              key={option.optionId}
              className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
            >
              <h5 className="font-bold">{option.programme}</h5>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {option.institution}{option.city ? ` · ${option.city}` : ""}
              </p>
              {option.facts.length ? (
                <dl className="mt-3 grid gap-3">
                  {option.facts.map((fact, index) => (
                    <div key={`${fact.field}-${index}`} className="text-sm">
                      <dt className="font-bold">{factLabels[locale][fact.field]}</dt>
                      <dd className="mt-1 leading-6">
                        <span>{formatFactValue(fact.value, locale)}</span>
                        <span className="ms-2 text-xs font-semibold text-[var(--muted)]">
                          {fact.status === "verified" ? t.verified : t.reviewNeeded}
                        </span>
                        {fact.sourceUrl ? (
                          <>
                            {" · "}
                            <a
                              href={fact.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold underline underline-offset-2"
                            >
                              {t.source}
                            </a>
                          </>
                        ) : null}
                        {fact.verifiedAt ? (
                          <span className="block text-xs text-[var(--muted)]">
                            {t.checked}: {formatDate(fact.verifiedAt, locale)}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{t.noFacts}</p>
              )}
            </section>
          ))}
        </div>
      </details>
    </article>
  );
}
