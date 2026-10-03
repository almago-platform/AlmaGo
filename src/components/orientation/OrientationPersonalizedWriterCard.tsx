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
    heroTitle: "Votre projet Allemagne prend forme.",
    options: "Programmes sélectionnés pour votre projet",
    why: "Pourquoi cette piste",
    confirmed: "Informations confirmées",
    checking: "Analyse en cours",
    verifiedStatus: "Vérifié",
    progressStatus: "Analyse en cours",
    unknownStatus: "À clarifier",
    roles: "Qui fait quoi maintenant",
    roleYou: "Vous",
    roleCampus: "Campus Allemagne",
    roleTogether: "Ensemble",
    priority: "Votre prochaine étape",
    language: "Progression linguistique",
    reassurance: "Vous gardez une prochaine action claire. Nous gardons la vue d’ensemble.",
    journey: "Votre parcours vers l’Allemagne",
    journeyCurrent: "Étape actuelle",
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
    heroTitle: "مشروعك نحو ألمانيا يتضح.",
    options: "البرامج المختارة لمشروعك",
    why: "لماذا هذا المسار",
    confirmed: "معلومات مؤكدة",
    checking: "التحليل جارٍ",
    verifiedStatus: "موثّق",
    progressStatus: "التحليل جارٍ",
    unknownStatus: "بحاجة إلى توضيح",
    roles: "من يقوم بماذا الآن",
    roleYou: "أنت",
    roleCampus: "Campus Allemagne",
    roleTogether: "معًا",
    priority: "خطوتك التالية",
    language: "التقدم اللغوي",
    reassurance: "لديك خطوة واضحة الآن، ونحن نحتفظ بالصورة الكاملة للمشروع.",
    journey: "مسارك نحو ألمانيا",
    journeyCurrent: "المرحلة الحالية",
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
    heroTitle: "Your Germany project is taking shape.",
    options: "Programmes selected for your project",
    why: "Why this path",
    confirmed: "Confirmed information",
    checking: "Analysis in progress",
    verifiedStatus: "Verified",
    progressStatus: "Analysis in progress",
    unknownStatus: "To clarify",
    roles: "Who does what now",
    roleYou: "You",
    roleCampus: "Campus Allemagne",
    roleTogether: "Together",
    priority: "Your next step",
    language: "Language progress",
    reassurance: "You keep one clear next action. We keep the full project in view.",
    journey: "Your path to Germany",
    journeyCurrent: "Current stage",
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
    heroTitle: "Dein Deutschland-Projekt nimmt Form an.",
    options: "Ausgewählte Programme für dein Projekt",
    why: "Warum diese Option",
    confirmed: "Bestätigte Informationen",
    checking: "Analyse läuft",
    verifiedStatus: "Geprüft",
    progressStatus: "Analyse läuft",
    unknownStatus: "Zu klären",
    roles: "Wer macht jetzt was",
    roleYou: "Du",
    roleCampus: "Campus Allemagne",
    roleTogether: "Gemeinsam",
    priority: "Dein nächster Schritt",
    language: "Sprachfortschritt",
    reassurance: "Du behältst einen klaren nächsten Schritt. Wir behalten das Gesamtprojekt im Blick.",
    journey: "Dein Weg nach Deutschland",
    journeyCurrent: "Aktuelle Etappe",
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

  return items.slice(0, 4);
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

function determineJourneyStep(
  result: OrientationPublicPersonalizedResult,
  answers: PublicOrientationAnswers | null,
) {
  const actionId = result.content.cta.actionId.toLowerCase();
  if (/visa|insurance|finance|arrival|administrative/.test(actionId)) return 4;
  if (/application|apply|candidate|candidature/.test(actionId)) return 3;

  const allProgrammesVerified =
    result.selected.length > 0
    && result.selected.every((option) => option.overallStatus === "verified");
  const languageStillProgressing =
    result.content.languagePlan.show
    && Boolean(result.content.languagePlan.nextLevel);
  const academicPreparationStillOpen =
    answers?.bacStatus !== "obtained"
    || result.status !== "ready"
    || !allProgrammesVerified;

  if (!languageStillProgressing && !academicPreparationStillOpen) return 2;
  return 1;
}

function compactFactLabel(
  fact: OrientationPublicPersonalizedFact,
  locale: Locale,
) {
  const value = formatFactValue(fact.value, locale);
  if (!value) return factLabels[locale][fact.field];

  const text = String(value);
  if (fact.field === "degree_level") {
    if (/bachelor/i.test(text)) return "Bachelor";
    if (/master/i.test(text)) return "Master";
  }
  if (
    fact.field === "german_language_requirement"
    || fact.field === "english_language_requirement"
  ) {
    const level = text.match(/\b(A1|A2|B1|B2|C1|C2)\b/i)?.[1];
    if (level) return level.toUpperCase();
  }

  return text.length > 34 ? `${text.slice(0, 31).trim()}…` : text;
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
  const profileHighlights = buildProfileHighlights(answers, locale);
  const roleTexts = [
    content.roadmap[0]?.text || content.mainPriority.nextStep,
    content.roadmap[1]?.text || content.campusValue,
    content.roadmap[2]?.text || content.reassurance,
  ];
  const journeyStep = determineJourneyStep(result, answers);

  return (
    <article className="space-y-10 sm:space-y-12">
      <header className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--foreground)] px-5 py-6 text-white shadow-[var(--shadow-card)] sm:px-8 sm:py-7">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-[var(--brand)]" />
        <div className="relative max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/[0.55]">
            {t.heroEyebrow}
          </p>
          <h3 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-[2rem]">
            {t.heroTitle}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/[0.78] sm:text-base sm:leading-7">
            {content.opening}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profileHighlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/[0.12] bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-white/[0.88]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section aria-labelledby="orientation-premium-options">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h4 id="orientation-premium-options" className="text-2xl font-semibold tracking-tight">
            {t.options}
          </h4>
          <span className="text-xs font-semibold text-[var(--muted)]">
            {result.selected.length} {t.pathsCount}
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {content.studyOptions.map((option) => {
            const selected = result.selected.find((item) => item.optionId === option.optionId);
            const status = selected ? optionStatus(selected, locale) : null;
            const facts = selected ? highlightedFacts(selected) : [];

            return (
              <article
                key={option.optionId}
                className="professional-hover rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.035)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--brand-strong)]">
                      {String(option.position).padStart(2, "0")}
                    </p>
                    <h5 className="mt-1 text-lg font-semibold leading-6 tracking-tight">{option.programme}</h5>
                    <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                      {option.institution}{option.city ? ` · ${option.city}` : ""}
                    </p>
                  </div>
                  {status ? (
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  ) : null}
                </div>

                {facts.length ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[var(--muted)]">{t.confirmed}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {facts.map((fact) => (
                        <span
                          key={fact.field}
                          title={`${factLabels[locale][fact.field]}: ${formatFactValue(fact.value, locale)}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-100"
                        >
                          <span aria-hidden="true">✓</span>
                          {compactFactLabel(fact, locale)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4">
                  <p className="text-xs font-semibold text-[var(--muted)]">{t.why}</p>
                  <p className="mt-1.5 text-sm leading-6">{option.whyItFits}</p>
                </div>

                <div className="mt-4 border-t border-[var(--border)] pt-3">
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-blue-800">{t.checking}</p>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                      {option.verificationNote}
                    </p>
                  </div>
                  <details className="sm:hidden">
                    <summary className="cursor-pointer text-xs font-semibold text-blue-800">
                      {t.checking}
                    </summary>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {option.verificationNote}
                    </p>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="orientation-main-priority"
        className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5 sm:p-6"
      >
        <div aria-hidden="true" className="absolute inset-y-0 start-0 w-0.5 bg-[var(--brand)]" />
        <p className="text-xs font-semibold text-[var(--brand-strong)]">{t.priority}</p>
        <h4 id="orientation-main-priority" className="mt-2 text-2xl font-semibold tracking-tight">
          {content.mainPriority.title}
        </h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {content.mainPriority.text}
        </p>

        {content.languagePlan.show ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--muted)]">{t.language}</span>
            {content.languagePlan.currentLevel ? (
              <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-[var(--border)]">
                {content.languagePlan.currentLevel}
              </span>
            ) : null}
            {content.languagePlan.currentLevel && content.languagePlan.nextLevel ? (
              <span aria-hidden="true" className="text-[var(--muted)]">→</span>
            ) : null}
            {content.languagePlan.nextLevel ? (
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-strong)]">
                {content.languagePlan.nextLevel}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold leading-6">
            {content.mainPriority.nextStep}
          </p>
        )}

        {showCta ? (
          <a
            href="#orientation-prospect-capture"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
          >
            {content.cta.label || t.next}
          </a>
        ) : null}
      </section>

      <section aria-labelledby="orientation-responsibilities">
        <h4 id="orientation-responsibilities" className="text-2xl font-semibold tracking-tight">
          {t.roles}
        </h4>
        <div className="mt-4 grid border-y border-[var(--border)] sm:grid-cols-3">
          {[t.roleYou, t.roleCampus, t.roleTogether].map((label, index) => (
            <div
              key={label}
              className="py-4 sm:px-5 sm:py-5 sm:first:ps-0 sm:last:pe-0 sm:[&:not(:first-child)]:border-s sm:[&:not(:first-child)]:border-[var(--border)]"
            >
              <p className="text-[11px] font-bold text-[var(--brand-strong)]">0{index + 1}</p>
              <h5 className="mt-1.5 text-base font-semibold">{label}</h5>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">{roleTexts[index]}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm font-semibold leading-6">
          {content.reassurance || t.reassurance}
        </p>
      </section>

      <section aria-labelledby="orientation-journey">
        <h4 id="orientation-journey" className="text-2xl font-semibold tracking-tight">
          {t.journey}
        </h4>

        <ol className="mt-5 hidden grid-cols-5 gap-2 sm:grid">
          {t.journeySteps.map((step, index) => {
            const completed = index < journeyStep;
            const current = index === journeyStep;
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
                  <div>
                    <p className={`text-xs leading-5 ${current ? "font-bold" : "text-[var(--muted)]"}`}>
                      {step}
                    </p>
                    {current ? (
                      <p className="mt-0.5 text-[10px] font-semibold text-[var(--brand-strong)]">{t.journeyCurrent}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <ol className="mt-5 space-y-0 sm:hidden">
          {t.journeySteps.map((step, index) => {
            const completed = index < journeyStep;
            const current = index === journeyStep;
            return (
              <li
                key={step}
                aria-current={current ? "step" : undefined}
                className="relative flex min-h-14 gap-3 ps-1"
              >
                {index < t.journeySteps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`absolute start-[0.83rem] top-7 h-[calc(100%-0.25rem)] w-px ${index < journeyStep ? "bg-emerald-300" : "bg-[var(--border)]"}`}
                  />
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
