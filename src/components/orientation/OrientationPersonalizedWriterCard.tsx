"use client";

import { localizeProfileOptions } from "@/content/student-profile-copy";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationPublicPersonalizedFact,
  OrientationPublicPersonalizedOption,
  OrientationPublicPersonalizedResult,
} from "@/lib/orientation-engine/result/types";
import type { OrientationVerificationFactKey } from "@/lib/orientation-engine/verification/types";
import {
  degreeOptions,
  engineeringSpecialtyOptions,
  languageLevelOptions,
  studyFieldOptions,
  tunisianBacTrackOptions,
  type SelectOption,
} from "@/lib/student/profile-options";

const copy = {
  fr: {
    heroEyebrow: "Votre orientation Campus Allemagne",
    options: "Les programmes retenus pour vous",
    optionsHelp: "Une shortlist de travail construite à partir de votre profil. Elle évolue à mesure que nos vérifications avancent.",
    why: "Pourquoi nous gardons cette piste",
    confirmed: "Déjà confirmé",
    checking: "Ce que nous vérifions encore",
    verifiedStatus: "Base vérifiée",
    progressStatus: "Vérification en cours",
    unknownStatus: "À clarifier",
    roles: "Comment nous avançons ensemble",
    roleYou: "Vous",
    roleCampus: "Campus Allemagne",
    roleTogether: "Ensemble",
    priority: "Votre priorité du moment",
    language: "Progression linguistique",
    reassurance: "Vous gardez une prochaine action claire. Nous gardons la vue d’ensemble.",
    journey: "Votre parcours vers l’Allemagne",
    journeyCurrent: "Vous êtes ici",
    journeySteps: ["Orientation", "Préparation", "Sélection finale", "Candidatures", "Étapes administratives"],
    next: "Continuer mon orientation",
    details: "Voir les informations vérifiées et les sources officielles",
    reviewText: "Campus Allemagne conserve les faits et les sources de cette orientation et poursuit les contrôles utiles en arrière-plan.",
    verified: "Vérifié",
    reviewNeeded: "À confirmer",
    source: "Source",
    checked: "Vérifié le",
    noFacts: "Aucun fait publiable supplémentaire n’est disponible pour cette piste.",
    germanLabel: "Allemand",
    pathsCount: "pistes",
  },
  ar: {
    heroEyebrow: "توجيهك مع Campus Allemagne",
    options: "البرامج التي اخترناها مبدئيًا لك",
    optionsHelp: "قائمة عمل مبنية على ملفك، وتتطور كلما تقدمت عمليات التحقق.",
    why: "لماذا نحتفظ بهذا المسار",
    confirmed: "ما تم تأكيده",
    checking: "ما نواصل التحقق منه",
    verifiedStatus: "قاعدة موثقة",
    progressStatus: "التحقق جارٍ",
    unknownStatus: "بحاجة إلى توضيح",
    roles: "كيف نتقدم معًا",
    roleYou: "أنت",
    roleCampus: "Campus Allemagne",
    roleTogether: "معًا",
    priority: "أولويتك الآن",
    language: "التقدم اللغوي",
    reassurance: "لديك خطوة واضحة الآن، ونحن نحتفظ بالصورة الكاملة للمشروع.",
    journey: "مسارك نحو ألمانيا",
    journeyCurrent: "أنت هنا",
    journeySteps: ["التوجيه", "التحضير", "الاختيار النهائي", "التقديم", "الخطوات الإدارية"],
    next: "متابعة توجيهي",
    details: "عرض المعلومات الموثقة والمصادر الرسمية",
    reviewText: "يحتفظ Campus Allemagne بالحقائق والمصادر ويواصل عمليات التحقق المفيدة في الخلفية.",
    verified: "موثّق",
    reviewNeeded: "يحتاج إلى تأكيد",
    source: "المصدر",
    checked: "تم التحقق في",
    noFacts: "لا توجد حقائق إضافية قابلة للعرض لهذا المسار حاليًا.",
    germanLabel: "الألمانية",
    pathsCount: "مسارات",
  },
  en: {
    heroEyebrow: "Your Campus Allemagne orientation",
    options: "The programmes selected for your shortlist",
    optionsHelp: "A working shortlist built from your profile. It evolves as our checks progress.",
    why: "Why we are keeping this path",
    confirmed: "Already supported",
    checking: "What we are still checking",
    verifiedStatus: "Verified base",
    progressStatus: "Checks in progress",
    unknownStatus: "To clarify",
    roles: "How we move forward together",
    roleYou: "You",
    roleCampus: "Campus Allemagne",
    roleTogether: "Together",
    priority: "Your priority now",
    language: "Language progress",
    reassurance: "You keep one clear next action. We keep the full project in view.",
    journey: "Your path to Germany",
    journeyCurrent: "You are here",
    journeySteps: ["Orientation", "Preparation", "Final selection", "Applications", "Administrative steps"],
    next: "Continue my orientation",
    details: "View verified information and official sources",
    reviewText: "Campus Allemagne keeps the facts and sources behind this orientation and continues useful checks in the background.",
    verified: "Verified",
    reviewNeeded: "To confirm",
    source: "Source",
    checked: "Checked on",
    noFacts: "No additional publishable facts are currently available for this path.",
    germanLabel: "German",
    pathsCount: "paths",
  },
  de: {
    heroEyebrow: "Deine Orientierung mit Campus Allemagne",
    options: "Die für dich ausgewählten Studienoptionen",
    optionsHelp: "Eine Arbeitsauswahl auf Basis deines Profils. Sie entwickelt sich mit unseren Prüfungen weiter.",
    why: "Warum wir diese Option behalten",
    confirmed: "Bereits bestätigt",
    checking: "Was wir noch prüfen",
    verifiedStatus: "Geprüfte Basis",
    progressStatus: "Prüfung läuft",
    unknownStatus: "Zu klären",
    roles: "Wie wir gemeinsam vorankommen",
    roleYou: "Du",
    roleCampus: "Campus Allemagne",
    roleTogether: "Gemeinsam",
    priority: "Deine Priorität jetzt",
    language: "Sprachfortschritt",
    reassurance: "Du behältst einen klaren nächsten Schritt. Wir behalten das Gesamtprojekt im Blick.",
    journey: "Dein Weg nach Deutschland",
    journeyCurrent: "Du bist hier",
    journeySteps: ["Orientierung", "Vorbereitung", "Finale Auswahl", "Bewerbungen", "Administrative Schritte"],
    next: "Orientierung fortsetzen",
    details: "Geprüfte Informationen und offizielle Quellen anzeigen",
    reviewText: "Campus Allemagne bewahrt Fakten und Quellen dieser Orientierung auf und führt sinnvolle Prüfungen im Hintergrund weiter.",
    verified: "Geprüft",
    reviewNeeded: "Zu bestätigen",
    source: "Quelle",
    checked: "Geprüft am",
    noFacts: "Für diese Option sind derzeit keine weiteren veröffentlichbaren Fakten verfügbar.",
    germanLabel: "Deutsch",
    pathsCount: "Optionen",
  },
} as const;

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

const factPriority: OrientationVerificationFactKey[] = [
  "degree_level",
  "teaching_language",
  "german_language_requirement",
  "english_language_requirement",
  "intake_terms",
  "application_route",
  "tuition_or_semester_fees",
];

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

function localizedValue(locale: Locale, value: string, options: readonly SelectOption[]) {
  if (!value) return "";
  return localizeProfileOptions(locale, options).find((option) => option.value === value)?.label || value;
}

function buildProfileHighlights(
  answers: PublicOrientationAnswers | null,
  locale: Locale,
  selectedCount: number,
) {
  const t = copy[locale];
  const items: string[] = [];

  if (answers) {
    const track = localizedValue(locale, answers.bacTrack, tunisianBacTrackOptions);
    if (answers.bacStatus === "obtained" && track) {
      items.push(
        answers.generalAverage
          ? `Bac ${track} · ${answers.generalAverage}/20`
          : `Bac ${track}`,
      );
    }

    if (answers.targetDegree) {
      items.push(localizedValue(locale, answers.targetDegree, degreeOptions));
    }

    const field = answers.engineeringSpecialty
      ? localizedValue(locale, answers.engineeringSpecialty, engineeringSpecialtyOptions)
      : localizedValue(locale, answers.targetField, studyFieldOptions);
    if (field) items.push(field);

    if (answers.germanLevel && answers.germanLevel !== "none") {
      items.push(`${t.germanLabel} · ${localizedValue(locale, answers.germanLevel, languageLevelOptions)}`);
    }
  }

  items.push(`${selectedCount} ${t.pathsCount}`);
  return items.slice(0, 5);
}

function optionStatus(
  option: OrientationPublicPersonalizedOption,
  locale: Locale,
) {
  const t = copy[locale];

  if (option.overallStatus === "verified") {
    return {
      label: t.verifiedStatus,
      className: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
    };
  }
  if (option.overallStatus === "needs_review") {
    return {
      label: t.progressStatus,
      className: "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200",
    };
  }
  return {
    label: t.unknownStatus,
    className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  };
}

function highlightedFacts(option: OrientationPublicPersonalizedOption) {
  return option.facts
    .filter((fact) => fact.status === "verified" && factPriority.includes(fact.field))
    .sort((a, b) => factPriority.indexOf(a.field) - factPriority.indexOf(b.field))
    .slice(0, 3);
}

export function OrientationPersonalizedWriterCard({
  result,
  locale,
  answers = null,
  showCta = false,
}: {
  result: OrientationPublicPersonalizedResult;
  locale: Locale;
  answers?: PublicOrientationAnswers | null;
  showCta?: boolean;
}) {
  const t = copy[locale];
  const content = result.content;
  const profileHighlights = buildProfileHighlights(answers, locale, result.selected.length);
  const roleTexts = [
    content.roadmap[0]?.text || content.mainPriority.nextStep,
    content.campusValue,
    content.roadmap[2]?.text || content.reassurance,
  ];

  return (
    <article className="space-y-12 sm:space-y-16">
      <header className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--foreground)] px-5 py-7 text-white shadow-[var(--shadow-card)] sm:px-8 sm:py-9">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 start-0 w-1 bg-[var(--brand)]"
        />
        <div className="relative max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
            {t.heroEyebrow}
          </p>
          <h3 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {content.opening}
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
            {content.projectStatus}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {profileHighlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/90"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section aria-labelledby="orientation-premium-options">
        <div className="max-w-3xl">
          <h4 id="orientation-premium-options" className="text-2xl font-semibold tracking-tight">
            {t.options}
          </h4>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.optionsHelp}</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {content.studyOptions.map((option) => {
            const selected = result.selected.find((item) => item.optionId === option.optionId);
            const status = selected ? optionStatus(selected, locale) : null;
            const facts = selected ? highlightedFacts(selected) : [];

            return (
              <article
                key={option.optionId}
                className="professional-hover rounded-[var(--radius-panel)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] ring-1 ring-inset ring-[var(--border)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-[var(--brand-strong)]">
                      {String(option.position).padStart(2, "0")}
                    </p>
                    <h5 className="mt-1 text-lg font-semibold tracking-tight">{option.programme}</h5>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {option.institution}{option.city ? ` · ${option.city}` : ""}
                    </p>
                  </div>
                  {status ? (
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  ) : null}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {t.why}
                  </p>
                  <p className="mt-2 text-sm leading-6">{option.whyItFits}</p>
                </div>

                {facts.length ? (
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">
                      {t.confirmed}
                    </p>
                    <dl className="mt-2 space-y-2">
                      {facts.map((fact) => (
                        <div key={fact.field} className="flex gap-2 text-xs leading-5">
                          <span aria-hidden="true" className="mt-0.5 text-emerald-700">✓</span>
                          <div>
                            <dt className="inline font-semibold">{factLabels[locale][fact.field]}: </dt>
                            <dd className="inline text-[var(--muted)]">{formatFactValue(fact.value, locale)}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}

                <div className="mt-5 border-t border-[var(--border)] pt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-800">
                    {t.checking}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    {option.verificationNote}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="orientation-responsibilities">
        <h4 id="orientation-responsibilities" className="text-2xl font-semibold tracking-tight">
          {t.roles}
        </h4>
        <div className="mt-5 grid border-y border-[var(--border)] sm:grid-cols-3">
          {[t.roleYou, t.roleCampus, t.roleTogether].map((label, index) => (
            <div
              key={label}
              className="py-5 sm:px-6 sm:py-6 sm:first:ps-0 sm:last:pe-0 sm:[&:not(:first-child)]:border-s sm:[&:not(:first-child)]:border-[var(--border)]"
            >
              <p className="text-xs font-bold text-[var(--brand-strong)]">0{index + 1}</p>
              <h5 className="mt-2 text-base font-semibold">{label}</h5>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{roleTexts[index]}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-sm font-semibold leading-6">
          {content.reassurance || t.reassurance}
        </p>
      </section>

      <section
        aria-labelledby="orientation-main-priority"
        className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--foreground)] p-5 text-white shadow-[var(--shadow-card)] sm:p-7"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--brand)]" />
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
          {t.priority}
        </p>
        <h4 id="orientation-main-priority" className="mt-3 text-2xl font-semibold tracking-tight">
          {content.mainPriority.title}
        </h4>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">
          {content.mainPriority.text}
        </p>

        {content.languagePlan.show ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
              {t.language}
            </span>
            {content.languagePlan.currentLevel ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                {content.languagePlan.currentLevel}
              </span>
            ) : null}
            {content.languagePlan.currentLevel && content.languagePlan.nextLevel ? (
              <span aria-hidden="true" className="text-white/45">→</span>
            ) : null}
            {content.languagePlan.nextLevel ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                {content.languagePlan.nextLevel}
              </span>
            ) : null}
            <p className="basis-full text-sm leading-6 text-white/70">
              {content.languagePlan.text}
            </p>
          </div>
        ) : null}

        <p className="mt-5 text-sm font-semibold leading-6 text-white">
          {content.mainPriority.nextStep}
        </p>

        {showCta ? (
          <a
            href="#orientation-prospect-capture"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
          >
            {content.cta.label || t.next}
          </a>
        ) : null}
      </section>

      <section aria-labelledby="orientation-journey">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h4 id="orientation-journey" className="text-2xl font-semibold tracking-tight">
            {t.journey}
          </h4>
          <span className="rounded-full bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
            {t.journeyCurrent}
          </span>
        </div>

        <ol className="mt-6 hidden grid-cols-5 gap-2 sm:grid">
          {t.journeySteps.map((step, index) => {
            const completed = index === 0;
            const current = index === 1;
            return (
              <li key={step} aria-current={current ? "step" : undefined}>
                <div
                  className={`h-1.5 rounded-full ${completed
                    ? "bg-emerald-500"
                    : current
                      ? "bg-[var(--brand)]"
                      : "bg-[var(--border)]"}`}
                />
                <div className="mt-3 flex items-start gap-2">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${completed
                      ? "bg-emerald-100 text-emerald-800"
                      : current
                        ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                        : "bg-[var(--surface-subtle)] text-[var(--muted)]"}`}
                  >
                    {completed ? "✓" : index + 1}
                  </span>
                  <p className={`text-xs leading-5 ${current ? "font-bold" : "text-[var(--muted)]"}`}>
                    {step}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <ol className="mt-5 space-y-0 sm:hidden">
          {t.journeySteps.map((step, index) => {
            const completed = index === 0;
            const current = index === 1;
            return (
              <li
                key={step}
                aria-current={current ? "step" : undefined}
                className="relative flex min-h-14 gap-3 ps-1"
              >
                {index < t.journeySteps.length - 1 ? (
                  <span aria-hidden="true" className="absolute start-[0.83rem] top-7 h-[calc(100%-0.25rem)] w-px bg-[var(--border)]" />
                ) : null}
                <span
                  className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${completed
                    ? "bg-emerald-100 text-emerald-800"
                    : current
                      ? "bg-[var(--brand)] text-white"
                      : "bg-[var(--surface-subtle)] text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]"}`}
                >
                  {completed ? "✓" : index + 1}
                </span>
                <div className="pb-5">
                  <p className={`text-sm leading-6 ${current ? "font-bold" : "text-[var(--muted)]"}`}>
                    {step}
                  </p>
                  {current ? (
                    <p className="mt-0.5 text-xs font-semibold text-[var(--brand-strong)]">{t.journeyCurrent}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <details className="border-t border-[var(--border)] pt-5">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
          {t.details}
        </summary>
        <div className="mt-5 space-y-6">
          {result.humanReview.mode === "post_result_audit" ? (
            <p className="max-w-3xl text-xs leading-5 text-[var(--muted)]">{t.reviewText}</p>
          ) : null}

          {result.selected.map((option) => (
            <section key={option.optionId} className="border-t border-[var(--border)] pt-5 first:border-t-0 first:pt-0">
              <h5 className="font-semibold">{option.programme}</h5>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {option.institution}{option.city ? ` · ${option.city}` : ""}
              </p>
              {option.facts.length ? (
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {option.facts.map((fact, index) => (
                    <div key={`${fact.field}-${index}`} className="text-sm">
                      <dt className="font-semibold">{factLabels[locale][fact.field]}</dt>
                      <dd className="mt-1 leading-6 text-[var(--muted)]">
                        <span>{formatFactValue(fact.value, locale)}</span>
                        <span className="ms-2 text-xs font-semibold">
                          {fact.status === "verified" ? t.verified : t.reviewNeeded}
                        </span>
                        {fact.sourceUrl ? (
                          <>
                            {" · "}
                            <a
                              href={fact.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-[var(--foreground)] underline underline-offset-2"
                            >
                              {t.source}
                            </a>
                          </>
                        ) : null}
                        {fact.verifiedAt ? (
                          <span className="block text-xs">
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
