import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { orientationRouteCopy } from "@/content/orientation-route-copy";
import {
  localizePreferredCity,
  localizeProfileOptions,
} from "@/content/student-profile-copy";
import {
  degreeOptions,
  languageLevelOptions,
  studyFieldOptions,
} from "@/lib/student/profile-options";

type Owner = "student" | "campus" | "official";

const nextLevel: Record<string, string | null> = {
  none: "A1",
  A1: "A2",
  A2: "B1",
  B1: "B2",
  B2: "C1",
  C1: null,
  C2: null,
};

function localizedValue(
  value: string,
  locale: Locale,
  options: readonly { value: string; label: string }[],
) {
  return localizeProfileOptions(locale, options).find((option) => option.value === value)?.label
    || value
    || "—";
}

function languageName(locale: Locale, studyLanguage: string) {
  if (studyLanguage === "Allemand") {
    return { fr: "allemand", ar: "الألمانية", en: "German", de: "Deutsch" }[locale];
  }
  if (studyLanguage === "Anglais") {
    return { fr: "anglais", ar: "الإنجليزية", en: "English", de: "Englisch" }[locale];
  }
  if (studyLanguage === "Allemand et anglais") {
    return { fr: "allemand", ar: "الألمانية", en: "German", de: "Deutsch" }[locale];
  }
  return "";
}

function selectedLanguageLevel(answers: PublicOrientationAnswers) {
  if (answers.studyLanguage === "Anglais") return answers.englishLevel;
  if (answers.studyLanguage === "Allemand" || answers.studyLanguage === "Allemand et anglais") {
    return answers.germanLevel;
  }
  return "";
}

function OwnerBadge({
  owner,
  locale,
}: {
  owner: Owner;
  locale: Locale;
}) {
  const copy = orientationRouteCopy[locale];
  const className = owner === "campus"
    ? "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)]"
    : owner === "official"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--foreground)]";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {copy.owners[owner]}
    </span>
  );
}

function ResponsibilityLine({
  owner,
  locale,
  children,
}: {
  owner: Owner;
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-start gap-2 text-sm leading-6 text-[var(--foreground)]">
      <OwnerBadge owner={owner} locale={locale} />
      <p className="min-w-0 flex-1">{children}</p>
    </div>
  );
}

export function OrientationRouteCard({
  answers,
  locale,
}: {
  answers: PublicOrientationAnswers;
  locale: Locale;
}) {
  const copy = orientationRouteCopy[locale];
  const cities = answers.preferredCities
    .map((city) => localizePreferredCity(locale, city))
    .join(", ");
  const degree = localizedValue(answers.targetDegree, locale, degreeOptions);
  const field = localizedValue(answers.targetField, locale, studyFieldOptions);
  const language = languageName(locale, answers.studyLanguage);
  const rawLevel = selectedLanguageLevel(answers);
  const currentLevel = localizedValue(rawLevel, locale, languageLevelOptions);
  const targetLevel = rawLevel ? nextLevel[rawLevel] : null;
  const hasDefinedLanguage = Boolean(language && rawLevel);

  const languageBody = !hasDefinedLanguage
    ? copy.steps.language.undecided
    : targetLevel
      ? copy.steps.language.active(language, currentLevel, targetLevel)
      : copy.steps.language.advanced(language, currentLevel);

  const nextAction = !hasDefinedLanguage
    ? copy.next.undecided(cities)
    : targetLevel
      ? copy.next.active(language, currentLevel, targetLevel, cities)
      : copy.next.advanced(language, currentLevel, cities);

  const programBody = cities
    ? copy.steps.programs.withCities(degree, field, cities)
    : copy.steps.programs.withoutCities(degree, field);

  const steps = [
    {
      key: "language",
      title: copy.steps.language.title,
      body: languageBody,
      responsibilities: [
        ["student", copy.steps.language.student],
        ["campus", copy.steps.language.campus],
      ] as const,
    },
    {
      key: "academic",
      title: copy.steps.academic.title,
      body: copy.steps.academic.body,
      responsibilities: [
        ["student", copy.steps.academic.student],
        ["campus", copy.steps.academic.campus],
      ] as const,
    },
    {
      key: "programs",
      title: copy.steps.programs.title,
      body: programBody,
      responsibilities: [
        ["student", copy.steps.programs.student],
        ["campus", copy.steps.programs.campus],
      ] as const,
    },
    {
      key: "application",
      title: copy.steps.application.title,
      body: copy.steps.application.body,
      responsibilities: [
        ["student", copy.steps.application.student],
        ["campus", copy.steps.application.campus],
      ] as const,
    },
    {
      key: "after-admission",
      title: copy.steps.afterAdmission.title,
      body: copy.steps.afterAdmission.body,
      responsibilities: [
        ["campus", copy.steps.afterAdmission.campus],
        ["official", copy.steps.afterAdmission.official],
      ] as const,
    },
  ];

  return (
    <section aria-labelledby="orientation-route-title" className="mt-8">
      <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h3 id="orientation-route-title" className="mt-2 text-xl font-bold">
          {copy.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
          {copy.intro}
        </p>

        <div className="mt-6 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-strong)]">
            {copy.routeLabel}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[var(--foreground)]">
            {steps.map((step) => step.title).join(" → ")}
          </p>
        </div>

        <ol className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <li
              key={step.key}
              className="orientation-route-step rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--foreground)] px-2 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold">{step.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                    {step.body}
                  </p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    {copy.responsibility}
                  </p>
                  {step.responsibilities.map(([owner, text]) => (
                    <ResponsibilityLine key={owner} owner={owner} locale={locale}>
                      {text}
                    </ResponsibilityLine>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="eyebrow">{copy.alternatives.eyebrow}</p>
        <h3 className="mt-2 text-lg font-bold">{copy.alternatives.title}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
            <h4 className="font-bold">{copy.alternatives.tunisia.title}</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{copy.alternatives.tunisia.body}</p>
          </article>
          <article className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
            <h4 className="font-bold">{copy.alternatives.germany.title}</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{copy.alternatives.germany.body}</p>
          </article>
          <article className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
            <h4 className="font-bold">{copy.alternatives.city.title}</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
              {cities ? copy.alternatives.city.withCities(cities) : copy.alternatives.city.withoutCities}
            </p>
          </article>
        </div>
      </div>

      <div className="mt-5 rounded-[var(--radius-panel)] border-2 border-[var(--brand)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="eyebrow">{copy.next.eyebrow}</p>
        <h3 className="mt-2 text-lg font-bold">{copy.next.title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">
          {nextAction}
        </p>
      </div>

      <p className="mt-4 text-xs leading-5 text-[var(--foreground)]">
        {copy.note}
      </p>
    </section>
  );
}
