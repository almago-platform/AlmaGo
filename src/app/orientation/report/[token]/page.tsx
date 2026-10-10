import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { rebrandCopy } from "@/lib/brand";
import { OrientationReportActions } from "@/components/orientation/OrientationReportActions";
import { OrientationRouteCard } from "@/components/orientation/OrientationRouteCard";
import { OrientationOnePagePrintReport } from "@/components/orientation/OrientationOnePagePrintReport";
import { OrientationDetailedPrintReport } from "@/components/orientation/OrientationDetailedPrintReport";
import { OrientationCandidatePrintReport } from "@/components/orientation/OrientationCandidatePrintReport";
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
import {
  restorePublicOrientationAnswers,
  restorePublicOrientationIdentity,
} from "@/lib/orientation/public";
import { hashOrientationResumeToken } from "@/lib/orientation/resume-token";
import {
  projectOrientationHumanReviewBundleToPublicResult,
} from "@/lib/orientation-engine/review/core";
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
  scienceSpecialtyOptions,
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
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ document?: string }>;
}) {
  if (!isPhase2AccessEnabled()) notFound();

  const { token } = await params;
  const query = await searchParams;
  const documentMode = query.document === "candidate" ? "candidate" : query.document === "detailed" ? "detailed" : "orientation";
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
    .select("id,engine_version,input,result,created_at,resume_token_expires_at")
    .eq("resume_token_hash", tokenHash)
    .gt("resume_token_expires_at", now)
    .maybeSingle();

  if (error || !data || data.engine_version !== "public-orientation-v1") notFound();
  if (!validDiagnostic(data.result)) notFound();

  const { data: linkedReview } = await supabase
    .from("orientation_human_reviews")
    .select("id,bundle")
    .eq("orientation_id", data.id)
    .maybeSingle();
  const personalized = linkedReview
    ? projectOrientationHumanReviewBundleToPublicResult(
        linkedReview.bundle,
        String(linkedReview.id),
      )
    : null;
  if (documentMode === "detailed" && !personalized?.selected.length) notFound();

  const input = data.input && typeof data.input === "object"
    ? data.input as Record<string, unknown>
    : {};
  const locale = normalizeLocale(typeof input.locale === "string" ? input.locale : null);
  const direction = localeDirection(locale);
  const detailedDocumentLabel = { fr: "Dossier détaillé (PDF)", ar: "الملف المفصل (PDF)", en: "Detailed dossier (PDF)", de: "Ausführliches Dossier (PDF)" }[locale];
  const answers = restorePublicOrientationAnswers(input.answers);
  const identity = restorePublicOrientationIdentity(input.identity);
  const copy = rebrandCopy(orientationCopy[locale]);
  const prospectCopy = rebrandCopy(orientationProspectCopy[locale]);
  const resumeCopy = rebrandCopy(orientationResumeCopy[locale]);
  const candidateCopy = {
    fr: {
      report: "Rapport candidat",
      title: "Profil du candidat",
      subtitle: "Synthèse des informations déclarées pour préparer le projet d’études en Allemagne.",
      orientationTab: "Orientation (PDF)",
      candidateTab: "Rapport candidat (PDF)",
      print: "Enregistrer le rapport candidat (PDF)",
      identity: "Identité",
      studies: "Parcours scolaire",
      languages: "Langues",
      project: "Projet d’études",
      firstName: "Prénom",
      lastName: "Nom",
      birthDate: "Date de naissance",
      email: "Adresse e-mail",
      currentField: "Études actuelles",
      semesters: "Semestres universitaires",
      intake: "Rentrée souhaitée",
    },
    ar: {
      report: "تقرير المترشح",
      title: "ملف المترشح",
      subtitle: "ملخص المعلومات المصرح بها لإعداد مشروع الدراسة في ألمانيا.",
      orientationTab: "التوجيه (PDF)",
      candidateTab: "تقرير المترشح (PDF)",
      print: "حفظ تقرير المترشح (PDF)",
      identity: "الهوية",
      studies: "المسار الدراسي",
      languages: "اللغات",
      project: "مشروع الدراسة",
      firstName: "الاسم",
      lastName: "اللقب",
      birthDate: "تاريخ الميلاد",
      email: "البريد الإلكتروني",
      currentField: "الدراسة الحالية",
      semesters: "الفصول الجامعية",
      intake: "موعد بدء الدراسة",
    },
    en: {
      report: "Candidate report",
      title: "Candidate profile",
      subtitle: "Summary of the information provided to prepare the study project in Germany.",
      orientationTab: "Orientation (PDF)",
      candidateTab: "Candidate report (PDF)",
      print: "Save candidate report (PDF)",
      identity: "Identity",
      studies: "Education",
      languages: "Languages",
      project: "Study project",
      firstName: "First name",
      lastName: "Last name",
      birthDate: "Date of birth",
      email: "Email address",
      currentField: "Current studies",
      semesters: "University semesters",
      intake: "Preferred intake",
    },
    de: {
      report: "Bewerberbericht",
      title: "Bewerberprofil",
      subtitle: "Zusammenfassung der Angaben zur Vorbereitung des Studienprojekts in Deutschland.",
      orientationTab: "Orientierung (PDF)",
      candidateTab: "Bewerberbericht (PDF)",
      print: "Bewerberbericht speichern (PDF)",
      identity: "Identität",
      studies: "Ausbildung",
      languages: "Sprachen",
      project: "Studienprojekt",
      firstName: "Vorname",
      lastName: "Nachname",
      birthDate: "Geburtsdatum",
      email: "E-Mail-Adresse",
      currentField: "Aktuelles Studium",
      semesters: "Hochschulsemester",
      intake: "Gewünschter Studienstart",
    },
  }[locale];

  const bacTracks = localizeProfileOptions(locale, tunisianBacTrackOptions);
  const diplomas = localizeProfileOptions(locale, diplomaOptions);
  const degrees = localizeProfileOptions(locale, degreeOptions);
  const fields = localizeProfileOptions(locale, studyFieldOptions);
  const engineeringSpecialties = localizeProfileOptions(locale, engineeringSpecialtyOptions);
  const scienceSpecialties = localizeProfileOptions(locale, scienceSpecialtyOptions);
  const levels = localizeProfileOptions(locale, languageLevelOptions);
  const studyLanguages = localizeProfileOptions(locale, studyLanguageOptions);
  const budgets = localizeProfileOptions(locale, budgetOptions);

  const engineeringSpecialtyLabel = {
    fr: "Spécialité d’ingénierie",
    ar: "تخصص الهندسة",
    en: "Engineering specialisation",
    de: "Ingenieurfachrichtung",
  }[locale];
  const scienceSpecialtyLabel = {
    fr: "Branche scientifique",
    ar: "الفرع العلمي",
    en: "Science subject",
    de: "Naturwissenschaftliches Fach",
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
    ...(answers.targetField === "Sciences" && answers.scienceSpecialty
      ? [[scienceSpecialtyLabel, localizedValue(answers.scienceSpecialty, scienceSpecialties)]]
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
  const birthDate = identity.birthDate
    ? dateFormatter.format(new Date(`${identity.birthDate}T00:00:00Z`))
    : "—";
  const candidateName = [identity.firstName, identity.lastName].filter(Boolean).join(" ") || "—";
  const intakeSeason = answers.targetIntakeSeason
    ? {
        fr: { winter: "Semestre d’hiver", summer: "Semestre d’été" },
        ar: { winter: "الفصل الشتوي", summer: "الفصل الصيفي" },
        en: { winter: "Winter semester", summer: "Summer semester" },
        de: { winter: "Wintersemester", summer: "Sommersemester" },
      }[locale][answers.targetIntakeSeason]
    : "—";
  const intakeValue = answers.targetIntakeYear
    ? `${intakeSeason} · ${answers.targetIntakeYear}`
    : intakeSeason;
  const candidateSections = [
    {
      title: candidateCopy.identity,
      rows: [
        { label: candidateCopy.firstName, value: identity.firstName || "—" },
        { label: candidateCopy.lastName, value: identity.lastName || "—" },
        { label: candidateCopy.birthDate, value: birthDate },
        { label: candidateCopy.email, value: identity.email || "—" },
      ],
    },
    {
      title: candidateCopy.studies,
      rows: [
        { label: copy.summary.labels.bacStatus, value: answers.bacStatus ? copy.bacStatus[answers.bacStatus] : "—" },
        { label: copy.summary.labels.bacYear, value: answers.bacYear || "—" },
        { label: copy.summary.labels.bacTrack, value: localizedValue(answers.bacTrack, bacTracks) },
        { label: copy.summary.labels.average, value: answers.generalAverage ? `${answers.generalAverage}/20` : "—" },
        { label: copy.summary.labels.diploma, value: localizedValue(answers.lastDiploma, diplomas) },
        { label: candidateCopy.currentField, value: answers.currentStudyField || "—" },
        { label: candidateCopy.semesters, value: answers.universitySemesters || "—" },
      ],
    },
    {
      title: candidateCopy.languages,
      rows: [
        { label: copy.summary.labels.german, value: localizedValue(answers.germanLevel, levels) },
        { label: copy.summary.labels.english, value: localizedValue(answers.englishLevel, levels) },
        { label: copy.summary.labels.studyLanguage, value: localizedValue(answers.studyLanguage, studyLanguages) },
      ],
    },
    {
      title: candidateCopy.project,
      rows: [
        { label: copy.summary.labels.degree, value: localizedValue(answers.targetDegree, degrees) },
        { label: copy.summary.labels.field, value: localizedValue(answers.targetField, fields) },
        ...(answers.targetField === "Ingénierie"
          ? [{ label: engineeringSpecialtyLabel, value: localizedValue(answers.engineeringSpecialty, engineeringSpecialties) }]
          : []),
        ...(answers.targetField === "Sciences" && answers.scienceSpecialty
          ? [{ label: scienceSpecialtyLabel, value: localizedValue(answers.scienceSpecialty, scienceSpecialties) }]
          : []),
        { label: candidateCopy.intake, value: intakeValue },
        { label: copy.summary.labels.budget, value: localizedValue(answers.budgetRange, budgets) },
        {
          label: copy.summary.labels.cities,
          value: answers.preferredCities.length
            ? answers.preferredCities.map((city) => localizePreferredCity(locale, city)).join(", ")
            : "—",
        },
      ],
    },
  ];
  const accountLinkingEnabled = isPhase2AccountLinkingEnabled();
  const signupHref = `/signup?orientation_token=${encodeURIComponent(token)}`;

  return (
    <div className={"orientation-print-page orientation-color-theme min-h-screen bg-[var(--background)] text-[var(--foreground)]" + (documentMode === "detailed" ? " orientation-detailed-document" : "")} dir={direction}>
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

      <main id="orientation-main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <article id="orientation-report" className="orientation-print-report">
          {documentMode === "candidate" ? (
            <OrientationCandidatePrintReport
              locale={locale}
              candidateName={candidateName}
              candidateEmail={identity.email}
              birthDate={birthDate}
              generatedAt={created}
              sections={candidateSections}
            />
          ) : documentMode === "detailed" && personalized ? (
            <OrientationDetailedPrintReport answers={answers} locale={locale} personalized={personalized} identity={identity} />
          ) : (
            <OrientationOnePagePrintReport answers={answers} locale={locale} personalized={personalized} identity={identity} />
          )}
          <div className="orientation-screen-report">
          <nav className="orientation-print-hide mb-6 flex flex-wrap gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-2">
            <Link
              href={`/orientation/report/${encodeURIComponent(token)}`}
              className={`rounded-[var(--radius-control)] px-4 py-2 text-sm font-bold ${documentMode === "orientation" ? "bg-[var(--brand)] text-white" : "bg-[var(--surface)] text-[var(--foreground)]"}`}
            >
              {candidateCopy.orientationTab}
            </Link>
            {personalized?.selected.length ? (
              <Link href={"/orientation/report/" + encodeURIComponent(token) + "?document=detailed"} className={"rounded-[var(--radius-control)] px-4 py-2 text-sm font-bold " + (documentMode === "detailed" ? "bg-[var(--brand)] text-white" : "bg-[var(--surface)] text-[var(--foreground)]")}>
                {detailedDocumentLabel}
              </Link>
            ) : null}
            <Link
              href={`/orientation/report/${encodeURIComponent(token)}?document=candidate`}
              className={`rounded-[var(--radius-control)] px-4 py-2 text-sm font-bold ${documentMode === "candidate" ? "bg-[var(--brand)] text-white" : "bg-[var(--surface)] text-[var(--foreground)]"}`}
            >
              {candidateCopy.candidateTab}
            </Link>
          </nav>
          <div className="orientation-print-only mb-6 items-center justify-between gap-6 border-b border-slate-300 pb-5">
            <BrandLogo className="h-10 w-auto" priority />
            <div className="text-end text-xs leading-5 text-slate-600">
              <p className="font-bold text-slate-900">{prospectCopy.report.label}</p>
              <p>{resumeCopy.created} <bdi dir="auto">{created}</bdi></p>
            </div>
          </div>

          <div className="mb-6 border-b border-[var(--border)] pb-5">
            <p className="eyebrow">{documentMode === "candidate" ? candidateCopy.report : documentMode === "detailed" ? detailedDocumentLabel : prospectCopy.report.label}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {documentMode === "candidate" ? candidateCopy.title : documentMode === "detailed" ? detailedDocumentLabel : prospectCopy.report.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {documentMode === "candidate" ? candidateCopy.subtitle : documentMode === "detailed" ? personalized?.content.projectStatus : prospectCopy.report.subtitle}
            </p>
            <div className="mt-3 text-xs leading-5 text-[var(--muted)]">
              <p>{resumeCopy.created} <bdi dir="auto">{created}</bdi></p>
              <p>{resumeCopy.validUntil} <bdi dir="auto">{expires}</bdi></p>
            </div>
          </div>

          {documentMode === "candidate" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {candidateSections.map((section) => (
                <section key={section.title} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <h2 className="text-lg font-bold">{section.title}</h2>
                  <dl className="mt-3 divide-y divide-[var(--border)]">
                    {section.rows.map((row) => (
                      <div key={`${section.title}-${row.label}`} className="grid gap-1 py-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                        <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{row.label}</dt>
                        <dd className="font-semibold"><bdi dir="auto">{row.value}</bdi></dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          ) : (
            <>
              <dl className="grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
                {summaryRows.map(([label, value]) => (
                  <div key={label} className="bg-[var(--surface)] p-4">
                    <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                    <dd className="mt-1 font-semibold"><bdi dir="auto">{value}</bdi></dd>
                  </div>
                ))}
              </dl>

              <OrientationRouteCard answers={answers} locale={locale} />
            </>
          )}

          <div className="orientation-print-hide mt-7 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
            <OrientationReportActions printLabel={documentMode === "candidate" ? candidateCopy.print : documentMode === "detailed" ? detailedDocumentLabel : prospectCopy.report.print} mode={documentMode === "detailed" ? "detailed" : "summary"} />
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
