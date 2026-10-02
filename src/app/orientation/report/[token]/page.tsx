import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { rebrandCopy } from "@/lib/brand";
import { OrientationReportActions } from "@/components/orientation/OrientationReportActions";
import { OrientationRouteCard } from "@/components/orientation/OrientationRouteCard";
import { OrientationOnePagePrintReport } from "@/components/orientation/OrientationOnePagePrintReport";
import { orientationCopy } from "@/content/orientation-copy";
import { orientationProspectCopy } from "@/content/orientation-prospect-copy";
import { orientationResumeCopy } from "@/content/orientation-resume-copy";
import {
  localizePreferredCity,
  localizeProfileOptions,
} from "@/content/student-profile-copy";
import {
  publicDiagnosticCodes,
  publicDiagnosticHeadlineCodes,
  publicDiagnosticStatuses,
  type PublicDiagnosticItem,
  type PublicOrientationDiagnostic,
} from "@/lib/orientation/diagnostic";
import { localeDirection, normalizeLocale } from "@/lib/i18n";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { hashOrientationResumeToken } from "@/lib/orientation/resume-token";
import {
  isPhase2AccessEnabled,
  isPhase2AccountLinkingEnabled,
} from "@/lib/phase2/config";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import {
  budgetOptions,
  degreeOptions,
  diplomaOptions,
  engineeringSpecialtyOptions,
  languageLevelOptions,
  studyFieldOptions,
  studyLanguageOptions,
  tunisianBacTrackOptions,
  type SelectOption,
} from "@/lib/student/profile-options";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

function localizedValue(value: string, options: readonly SelectOption[]) {
  return options.find((option) => option.value === value)?.label || value || "—";
}

function validDiagnosticItem(value: unknown): value is PublicDiagnosticItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.code === "string"
    && publicDiagnosticCodes.includes(item.code as (typeof publicDiagnosticCodes)[number])
    && typeof item.status === "string"
    && publicDiagnosticStatuses.includes(item.status as (typeof publicDiagnosticStatuses)[number])
  );
}

function validDiagnostic(value: unknown): value is PublicOrientationDiagnostic {
  if (!value || typeof value !== "object") return false;
  const diagnostic = value as Record<string, unknown>;
  return (
    typeof diagnostic.overallStatus === "string"
    && publicDiagnosticStatuses.includes(
      diagnostic.overallStatus as (typeof publicDiagnosticStatuses)[number],
    )
    && typeof diagnostic.headlineCode === "string"
    && publicDiagnosticHeadlineCodes.includes(
      diagnostic.headlineCode as (typeof publicDiagnosticHeadlineCodes)[number],
    )
    && Array.isArray(diagnostic.paths)
    && diagnostic.paths.every(validDiagnosticItem)
    && Array.isArray(diagnostic.priorities)
    && diagnostic.priorities.every(validDiagnosticItem)
    && Array.isArray(diagnostic.checks)
    && diagnostic.checks.every(validDiagnosticItem)
    && Array.isArray(diagnostic.ruleTrace)
  );
}

export default async function OrientationReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (!isPhase2AccessEnabled()) notFound();

  const { token } = await params;
  const tokenHash = hashOrientationResumeToken(token);
  if (!tokenHash) notFound();

  let supabase;
  try {
    supabase = createPrivilegedSupabaseClient();
  } catch {
    notFound();
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("orientations")
    .select("engine_version,input,result,created_at,resume_token_expires_at")
    .eq("resume_token_hash", tokenHash)
    .gt("resume_token_expires_at", now)
    .maybeSingle();

  if (error || !data || data.engine_version !== "public-orientation-v1") notFound();
  if (!validDiagnostic(data.result)) notFound();

  const input = data.input && typeof data.input === "object"
    ? data.input as Record<string, unknown>
    : {};
  const locale = normalizeLocale(typeof input.locale === "string" ? input.locale : null);
  const direction = localeDirection(locale);
  const answers = restorePublicOrientationAnswers(input.answers);
  const copy = rebrandCopy(orientationCopy[locale]);
  const prospectCopy = rebrandCopy(orientationProspectCopy[locale]);
  const resumeCopy = rebrandCopy(orientationResumeCopy[locale]);

  const bacTracks = localizeProfileOptions(locale, tunisianBacTrackOptions);
  const diplomas = localizeProfileOptions(locale, diplomaOptions);
  const degrees = localizeProfileOptions(locale, degreeOptions);
  const fields = localizeProfileOptions(locale, studyFieldOptions);
  const engineeringSpecialties = localizeProfileOptions(locale, engineeringSpecialtyOptions);
  const levels = localizeProfileOptions(locale, languageLevelOptions);
  const studyLanguages = localizeProfileOptions(locale, studyLanguageOptions);
  const budgets = localizeProfileOptions(locale, budgetOptions);

  const engineeringSpecialtyLabel = {
    fr: "Spécialité d’ingénierie",
    ar: "تخصص الهندسة",
    en: "Engineering specialisation",
    de: "Ingenieurfachrichtung",
  }[locale];

  const summaryRows = [
    [copy.summary.labels.bacStatus, answers.bacStatus ? copy.bacStatus[answers.bacStatus] : "—"],
    [copy.summary.labels.bacYear, answers.bacYear || "—"],
    [copy.summary.labels.bacTrack, localizedValue(answers.bacTrack, bacTracks)],
    [copy.summary.labels.average, answers.generalAverage ? `${answers.generalAverage}/20` : "—"],
    [copy.summary.labels.diploma, localizedValue(answers.lastDiploma, diplomas)],
    [copy.summary.labels.degree, localizedValue(answers.targetDegree, degrees)],
    [copy.summary.labels.field, localizedValue(answers.targetField, fields)],
    ...(answers.targetField === "Ingénierie"
      ? [[engineeringSpecialtyLabel, localizedValue(answers.engineeringSpecialty, engineeringSpecialties)]]
      : []),
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

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const created = dateFormatter.format(new Date(data.created_at));
  const expires = dateFormatter.format(new Date(data.resume_token_expires_at));
  const accountLinkingEnabled = isPhase2AccountLinkingEnabled();
  const signupHref = `/signup?orientation_token=${encodeURIComponent(token)}`;

  return (
    <div className="orientation-print-page min-h-screen bg-[var(--background)] text-[var(--foreground)]" dir={direction}>
      <header className="orientation-print-hide border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo className="h-9 w-auto" priority />
          </Link>
          <Link href="/" className="text-sm font-semibold underline-offset-4 hover:underline">
            {resumeCopy.home}
          </Link>
        </div>
      </header>

      <main id="orientation-main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <article id="orientation-report" className="orientation-print-report professional-panel rounded-[var(--radius-panel)] p-5 sm:p-7">
          <OrientationOnePagePrintReport answers={answers} locale={locale} />
          <div className="orientation-screen-report">
          <div className="orientation-print-only mb-6 items-center justify-between gap-6 border-b border-slate-300 pb-5">
            <BrandLogo className="h-10 w-auto" priority />
            <div className="text-end text-xs leading-5 text-slate-600">
              <p className="font-bold text-slate-900">{prospectCopy.report.label}</p>
              <p>{resumeCopy.created} <bdi dir="auto">{created}</bdi></p>
            </div>
          </div>

          <div className="mb-6 border-b border-[var(--border)] pb-5">
            <p className="eyebrow">{prospectCopy.report.label}</p>
            <h1 className="mt-2 text-2xl font-bold">{prospectCopy.report.title}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{prospectCopy.report.subtitle}</p>
            <div className="mt-3 text-xs leading-5 text-[var(--muted)]">
              <p>{resumeCopy.created} <bdi dir="auto">{created}</bdi></p>
              <p>{resumeCopy.validUntil} <bdi dir="auto">{expires}</bdi></p>
            </div>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
            {summaryRows.map(([label, value]) => (
              <div key={label} className="bg-[var(--surface)] p-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                <dd className="mt-1 font-semibold"><bdi dir="auto">{value}</bdi></dd>
              </div>
            ))}
          </dl>

          <OrientationRouteCard answers={answers} locale={locale} />


          <div className="orientation-print-hide mt-7 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
            <OrientationReportActions printLabel={prospectCopy.report.print} />
            <p className="mt-2 text-xs leading-5 text-[var(--foreground)]">{prospectCopy.report.printHelp}</p>
          </div>

          {accountLinkingEnabled ? (
            <div className="orientation-print-hide mt-6 border-t border-[var(--border)] pt-6">
              <Link
                href={signupHref}
                className="inline-flex rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold"
              >
                {resumeCopy.signup}
              </Link>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{resumeCopy.signupNote}</p>
            </div>
          ) : null}
          </div>
        </article>
      </main>
    </div>
  );
}
