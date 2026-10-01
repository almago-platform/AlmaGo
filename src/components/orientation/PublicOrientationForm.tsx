"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { orientationCopy } from "@/content/orientation-copy";
import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import { orientationProspectCopy } from "@/content/orientation-prospect-copy";
import { ProspectCaptureCard } from "@/components/orientation/ProspectCaptureCard";
import { ProspectOrientationUpdateCard } from "@/components/orientation/ProspectOrientationUpdateCard";
import { prospectDashboardCopy } from "@/content/prospect-dashboard-copy";
import { prospectOrientationUpdateCopy } from "@/content/prospect-orientation-update-copy";
import {
  localizePreferredCity,
  localizeProfileOptions,
  studentProfileCopy,
} from "@/content/student-profile-copy";
import { buildPublicOrientationDiagnostic, type PublicDiagnosticStatus } from "@/lib/orientation/diagnostic";
import {
  PUBLIC_ORIENTATION_SESSION_KEY as SESSION_KEY,
  createEmptyPublicOrientationAnswers,
  restorePublicOrientationAnswers,
  type PublicOrientationAnswers as Answers,
} from "@/lib/orientation/public";
import {
  budgetOptions,
  degreeOptions,
  diplomaOptions,
  languageLevelOptions,
  preferredCityOptions,
  studyFieldOptions,
  studyLanguageOptions,
  tunisianBacTrackOptions,
  type SelectOption,
} from "@/lib/student/profile-options";

type Step = 1 | 2 | 3 | 4 | 5;

function localizedValue(value: string, options: readonly SelectOption[]) {
  return options.find((option) => option.value === value)?.label || value || "—";
}

function DiagnosticStatusBadge({ status, label }: { status: PublicDiagnosticStatus; label: string }) {
  const className = status === "needs_verification"
    ? "bg-amber-100 text-amber-900"
    : status === "known_gap"
      ? "bg-orange-100 text-orange-900"
      : status === "needs_information"
        ? "bg-slate-100 text-slate-700"
        : "bg-blue-100 text-blue-900";

  return <span className={`status-badge ${className}`}>{label}</span>;
}

function DiagnosticSection({
  title,
  items,
  copy,
}: {
  title: string;
  items: ReturnType<typeof buildPublicOrientationDiagnostic>["paths"];
  copy: (typeof orientationDiagnosticCopy)[keyof typeof orientationDiagnosticCopy];
}) {
  if (!items.length) return null;

  return (
    <section>
      <h3 className="text-base font-bold">{title}</h3>
      <div className="mt-3 grid gap-3">
        {items.map((item) => {
          const message = copy.items[item.code];
          return (
            <article key={item.code} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h4 className="font-semibold">{message.title}</h4>
                <DiagnosticStatusBadge status={item.status} label={copy.status[item.status]} />
              </div>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{message.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function PublicOrientationForm({
  prospectCaptureEnabled = false,
  emailDeliveryEnabled = false,
  initialAnswers = null,
  authenticatedUpdate = false,
}: {
  prospectCaptureEnabled?: boolean;
  emailDeliveryEnabled?: boolean;
  initialAnswers?: Answers | null;
  authenticatedUpdate?: boolean;
}) {
  const { locale, direction } = useLocale();
  const copy = orientationCopy[locale];
  const profileCopy = studentProfileCopy[locale];
  const diagnosticCopy = orientationDiagnosticCopy[locale];
  const prospectCopy = orientationProspectCopy[locale];
  const prospectDashboard = prospectDashboardCopy[locale];
  const updateCopy = prospectOrientationUpdateCopy[locale];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [answers, setAnswers] = useState<Answers>(() =>
    initialAnswers
      ? restorePublicOrientationAnswers(initialAnswers)
      : createEmptyPublicOrientationAnswers(),
  );
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(authenticatedUpdate);

  const bacTracks = useMemo(() => localizeProfileOptions(locale, tunisianBacTrackOptions), [locale]);
  const diplomas = useMemo(() => localizeProfileOptions(locale, diplomaOptions), [locale]);
  const degrees = useMemo(() => localizeProfileOptions(locale, degreeOptions), [locale]);
  const fields = useMemo(() => localizeProfileOptions(locale, studyFieldOptions), [locale]);
  const levels = useMemo(() => localizeProfileOptions(locale, languageLevelOptions), [locale]);
  const studyLanguages = useMemo(() => localizeProfileOptions(locale, studyLanguageOptions), [locale]);
  const budgets = useMemo(() => localizeProfileOptions(locale, budgetOptions), [locale]);
  const diagnostic = useMemo(() => buildPublicOrientationDiagnostic(answers), [answers]);
  const selectedCitiesLabel =
    locale === "ar"
      ? `${copy.controls.selected} ${answers.preferredCities.length}`
      : `${answers.preferredCities.length} ${copy.controls.selected}`;

  useEffect(() => {
    if (authenticatedUpdate) return;

    const timer = window.setTimeout(() => {
      try {
        const stored = window.sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { answers?: unknown; step?: unknown };
          setAnswers(restorePublicOrientationAnswers(parsed.answers));
          if (typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 5) {
            setStep(parsed.step as Step);
          }
        }
      } catch {
        window.sessionStorage.removeItem(SESSION_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authenticatedUpdate]);

  useEffect(() => {
    if (!hydrated || authenticatedUpdate) return;
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ answers, step }));
  }, [answers, step, hydrated, authenticatedUpdate]);

  useEffect(() => {
    if (hydrated) headingRef.current?.focus();
  }, [step, hydrated]);

  function setField<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function validateCurrentStep() {
    if (step === 1) {
      if (!answers.bacStatus || !answers.bacYear || !answers.bacTrack) return copy.validation.required;
      const year = Number(answers.bacYear);
      if (!Number.isInteger(year) || year < 2000 || year > 2035) return copy.validation.year;
      if (answers.generalAverage) {
        const average = Number(answers.generalAverage);
        if (!Number.isFinite(average) || average < 0 || average > 20) return copy.validation.average;
      }
    }

    if (step === 2 && (!answers.targetDegree || !answers.targetField)) return copy.validation.required;
    if (step === 3 && (!answers.germanLevel || !answers.englishLevel || !answers.studyLanguage)) return copy.validation.required;
    if (step === 4 && !answers.budgetRange) return copy.validation.required;

    return "";
  }

  function next() {
    const validation = validateCurrentStep();
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    setStep((step === 4 ? 5 : step + 1) as Step);
  }

  function previous() {
    setError("");
    setStep((Math.max(1, step - 1)) as Step);
  }

  function toggleCity(city: string) {
    setAnswers((current) => {
      const selected = current.preferredCities.includes(city);
      if (!selected && current.preferredCities.length >= 3) return current;
      return {
        ...current,
        preferredCities: selected
          ? current.preferredCities.filter((item) => item !== city)
          : [...current.preferredCities, city],
      };
    });
  }

  function restart() {
    setAnswers(
      authenticatedUpdate && initialAnswers
        ? restorePublicOrientationAnswers(initialAnswers)
        : createEmptyPublicOrientationAnswers(),
    );
    setStep(1);
    setError("");
    if (!authenticatedUpdate) window.sessionStorage.removeItem(SESSION_KEY);
  }

  const stepCopy = [
    copy.steps.situation,
    copy.steps.project,
    copy.steps.languages,
    copy.steps.resources,
  ];

  const summaryRows = [
    [copy.summary.labels.bacStatus, answers.bacStatus ? copy.bacStatus[answers.bacStatus] : "—"],
    [copy.summary.labels.bacYear, answers.bacYear || "—"],
    [copy.summary.labels.bacTrack, localizedValue(answers.bacTrack, bacTracks)],
    [copy.summary.labels.average, answers.generalAverage ? `${answers.generalAverage}/20` : "—"],
    [copy.summary.labels.diploma, localizedValue(answers.lastDiploma, diplomas)],
    [copy.summary.labels.degree, localizedValue(answers.targetDegree, degrees)],
    [copy.summary.labels.field, localizedValue(answers.targetField, fields)],
    [copy.summary.labels.german, localizedValue(answers.germanLevel, levels)],
    [copy.summary.labels.english, localizedValue(answers.englishLevel, levels)],
    [copy.summary.labels.studyLanguage, localizedValue(answers.studyLanguage, studyLanguages)],
    [copy.summary.labels.budget, localizedValue(answers.budgetRange, budgets)],
    [
      copy.summary.labels.cities,
      answers.preferredCities.length
        ? answers.preferredCities.map((city) => localizePreferredCity(locale, city)).join(", ")
        : "—",
    ],
  ] as const;

  return (
    <div className="orientation-print-page min-h-screen bg-[var(--background)] text-[var(--foreground)]" dir={direction}>
      <a className="skip-link" href="#orientation-main">{copy.header.skip}</a>

      <header className="orientation-print-hide border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label={copy.header.home} className="inline-flex items-center">
            <BrandLogo className="h-9 w-auto" priority />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher compact />
            <Link
              href={authenticatedUpdate ? "/prospect" : "/login"}
              className="text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              {authenticatedUpdate ? prospectDashboard.shell.area : copy.header.login}
            </Link>
          </div>
        </div>
      </header>

      <main id="orientation-main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="orientation-print-hide mx-auto max-w-3xl">
          <p className="eyebrow">
            {authenticatedUpdate ? updateCopy.introEyebrow : copy.intro.eyebrow}
          </p>
          <h1 className="page-title max-w-3xl">
            {authenticatedUpdate ? updateCopy.introTitle : copy.intro.title}
          </h1>
          <p className="page-subtitle">
            {authenticatedUpdate ? updateCopy.introLead : copy.intro.lead}
          </p>
          <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-3 text-sm leading-6">
            {authenticatedUpdate ? updateCopy.introNotice : copy.intro.privacy}
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-3xl">
          <div
            role="progressbar"
            aria-label={copy.progress.label}
            aria-valuemin={1}
            aria-valuemax={4}
            aria-valuenow={Math.min(step, 4)}
            className="orientation-print-hide mb-6"
          >
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
              <span>{copy.progress.step} {Math.min(step, 4)} / 4</span>
              <span>{Math.min(step, 4) * 25}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-[width]"
                style={{ width: `${Math.min(step, 4) * 25}%` }}
              />
            </div>
          </div>

          <div className="professional-panel rounded-[var(--radius-panel)] p-5 sm:p-7">
            {step <= 4 ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  next();
                }}
              >
                <p className="eyebrow">{copy.progress.step} {step}</p>
                <h2 ref={headingRef} tabIndex={-1} className="section-title mt-2 mb-1">
                  {stepCopy[step - 1].title}
                </h2>
                <p className="mb-6 text-sm leading-6 text-[var(--muted)]">{stepCopy[step - 1].text}</p>

                {step === 1 ? (
                  <div className="space-y-5">
                    <fieldset>
                      <legend className="mb-2 text-sm font-semibold">{copy.bacStatus.label}</legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(["obtained", "preparing"] as const).map((status) => (
                          <label key={status} className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                            <input
                              type="radio"
                              name="bacStatus"
                              value={status}
                              checked={answers.bacStatus === status}
                              onChange={() => setField("bacStatus", status)}
                              className="mt-1"
                            />
                            <span className="font-medium">{copy.bacStatus[status]}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.bac_year}
                        <input
                          className="field"
                          type="number"
                          inputMode="numeric"
                          min="2000"
                          max="2035"
                          value={answers.bacYear}
                          onChange={(event) => setField("bacYear", event.target.value)}
                        />
                        <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{copy.fields.yearHelp}</span>
                      </label>
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.bac_track}
                        <select className="field" value={answers.bacTrack} onChange={(event) => setField("bacTrack", event.target.value)}>
                          <option value="">{copy.controls.choose}</option>
                          {bacTracks.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                    </div>

                    <label className="block text-sm font-semibold">
                      {profileCopy.form.fields.general_average} <span className="font-normal text-[var(--muted)]">({copy.controls.optional})</span>
                      <input
                        className="field"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="20"
                        step="0.01"
                        value={answers.generalAverage}
                        onChange={(event) => setField("generalAverage", event.target.value)}
                      />
                      <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{copy.fields.averageHelp}</span>
                    </label>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-5">
                    <label className="block text-sm font-semibold">
                      {profileCopy.form.fields.last_diploma} <span className="font-normal text-[var(--muted)]">({copy.controls.optional})</span>
                      <select className="field" value={answers.lastDiploma} onChange={(event) => setField("lastDiploma", event.target.value)}>
                        <option value="">{copy.controls.choose}</option>
                        {diplomas.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{copy.fields.lastDiplomaHelp}</span>
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.target_degree}
                        <select className="field" value={answers.targetDegree} onChange={(event) => setField("targetDegree", event.target.value)}>
                          <option value="">{copy.controls.choose}</option>
                          {degrees.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.target_field}
                        <select className="field" value={answers.targetField} onChange={(event) => setField("targetField", event.target.value)}>
                          <option value="">{copy.controls.choose}</option>
                          {fields.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.german_level}
                        <select className="field" value={answers.germanLevel} onChange={(event) => setField("germanLevel", event.target.value)}>
                          <option value="">{copy.controls.choose}</option>
                          {levels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.english_level}
                        <select className="field" value={answers.englishLevel} onChange={(event) => setField("englishLevel", event.target.value)}>
                          <option value="">{copy.controls.choose}</option>
                          {levels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                    </div>
                    <label className="block text-sm font-semibold">
                      {profileCopy.form.fields.study_language}
                      <select className="field" value={answers.studyLanguage} onChange={(event) => setField("studyLanguage", event.target.value)}>
                        <option value="">{copy.controls.choose}</option>
                        {studyLanguages.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div className="space-y-5">
                    <label className="block text-sm font-semibold">
                      {profileCopy.form.fields.budget_range}
                      <select className="field" value={answers.budgetRange} onChange={(event) => setField("budgetRange", event.target.value)}>
                        <option value="">{copy.controls.choose}</option>
                        {budgets.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>

                    <details className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)]">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                        {copy.fields.cities} · {selectedCitiesLabel}
                      </summary>
                      <div className="border-t border-[var(--border)] p-4">
                        <p className="mb-3 text-xs leading-5 text-[var(--muted)]">{copy.fields.citiesHelp}</p>
                        <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                          {preferredCityOptions.map((city) => {
                            const selected = answers.preferredCities.includes(city);
                            const disabled = !selected && answers.preferredCities.length >= 3;
                            return (
                              <label key={city} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  disabled={disabled}
                                  onChange={() => toggleCity(city)}
                                />
                                <span>{localizePreferredCity(locale, city)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </details>
                  </div>
                ) : null}

                {error ? (
                  <p role="alert" aria-live="polite" className="mt-5 rounded-[var(--radius-control)] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                    {error}
                  </p>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={previous}
                    disabled={step === 1}
                    className="rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copy.controls.previous}
                  </button>
                  <button
                    type="submit"
                    className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
                  >
                    {step === 4 ? copy.controls.summary : copy.controls.next}
                  </button>
                </div>
              </form>
            ) : (
              <div id="orientation-report" className="orientation-print-report">
                <div className="mb-6 border-b border-[var(--border)] pb-5">
                  <p className="eyebrow">{prospectCopy.report.label}</p>
                  <h2 className="mt-2 text-2xl font-bold">{prospectCopy.report.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{prospectCopy.report.subtitle}</p>
                </div>
                <p className="eyebrow">{copy.summary.eyebrow}</p>
                <h2 ref={headingRef} tabIndex={-1} className="section-title mt-2 mb-1">{copy.summary.title}</h2>
                <p className="mb-6 text-sm leading-6 text-[var(--muted)]">{copy.summary.text}</p>

                <dl className="grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
                  {summaryRows.map(([label, value]) => (
                    <div key={label} className="bg-[var(--surface)] p-4">
                      <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                      <dd className="mt-1 font-semibold"><bdi dir="auto">{value}</bdi></dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 space-y-7">
                  <section aria-labelledby="orientation-diagnostic-title">
                    <p className="eyebrow">{diagnosticCopy.sections.headline}</p>
                    <div className="mt-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 id="orientation-diagnostic-title" className="text-lg font-bold">
                          {diagnosticCopy.headlines[diagnostic.headlineCode].title}
                        </h3>
                        <DiagnosticStatusBadge
                          status={diagnostic.overallStatus}
                          label={diagnosticCopy.status[diagnostic.overallStatus]}
                        />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {diagnosticCopy.headlines[diagnostic.headlineCode].body}
                      </p>
                    </div>
                  </section>

                  <DiagnosticSection
                    title={diagnosticCopy.sections.paths}
                    items={diagnostic.paths}
                    copy={diagnosticCopy}
                  />
                  <DiagnosticSection
                    title={diagnosticCopy.sections.priorities}
                    items={diagnostic.priorities}
                    copy={diagnosticCopy}
                  />
                  <DiagnosticSection
                    title={diagnosticCopy.sections.checks}
                    items={diagnostic.checks}
                    copy={diagnosticCopy}
                  />

                  <div className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 text-sm leading-6">
                    {diagnosticCopy.disclaimer}
                  </div>
                </div>

                <div className="orientation-print-hide mt-7 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
                  >
                    {prospectCopy.report.print}
                  </button>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{prospectCopy.report.printHelp}</p>
                </div>

                {authenticatedUpdate ? (
                  <ProspectOrientationUpdateCard answers={answers} />
                ) : prospectCaptureEnabled ? (
                  <ProspectCaptureCard
                    answers={answers}
                    emailDeliveryEnabled={emailDeliveryEnabled}
                  />
                ) : null}

                <div className="orientation-print-hide mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
                  >
                    {copy.summary.edit}
                  </button>
                  <button
                    type="button"
                    onClick={restart}
                    className="rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold"
                  >
                    {copy.summary.restart}
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] underline underline-offset-4"
                  >
                    {copy.summary.home}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
