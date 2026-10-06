"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentOrientationCopy } from "@/content/student-orientation-copy";
import type { MasterRequirementsMatch, RequirementMatchResult } from "@/lib/master-requirements";
import { formatDeadline } from "@/lib/phase4";
import { localizeCatalogueLabel, localizeProgramRequirement } from "@/lib/student/arabic-display";

type University = { name: string; city: string; bundesland?: string | null; tuition_notes?: string | null };
type Program = {
  id?: string;
  name: string;
  degree_level: string;
  field: string | null;
  teaching_language: string | null;
  intake_terms?: string[] | null;
  winter_deadline: string | null;
  summer_deadline?: string | null;
  application_url: string | null;
  german_level_required: string | null;
  english_level_required: string | null;
  diploma_required: string | null;
  application_fee_notes?: string | null;
  universities: University | University[] | null;
};

type Recommendation = {
  id: string;
  status: string;
  note: string | null;
  student_interest_at: string | null;
  programs: Program | Program[] | null;
  requirement_match?: MasterRequirementsMatch | null;
};

type Feedback = { message: string; kind: "success" | "error" } | null;

function firstProgram(recommendation: Recommendation) {
  return Array.isArray(recommendation.programs) ? recommendation.programs[0] : recommendation.programs;
}

function firstUniversity(program: Program | null | undefined) {
  return Array.isArray(program?.universities) ? program?.universities[0] : program?.universities;
}

export function StudentOrientationPanel({
  recommendations,
  applicationProgramIds,
  applicationStatuses = {},
  loadError,
  applicationStateError,
  criteriaStateError,
}: {
  recommendations: Recommendation[];
  applicationProgramIds: string[];
  applicationStatuses?: Record<string, string>;
  loadError?: string;
  applicationStateError?: string;
  criteriaStateError?: string;
}) {
  const { locale } = useLocale();
  const t = studentOrientationCopy[locale].panel;
  const copy = t;
  const [items, setItems] = useState(() =>
    recommendations.map((recommendation) => {
      const program = firstProgram(recommendation);
      return applicationProgramIds.includes(program?.id || "")
        ? { ...recommendation, student_interest_at: recommendation.student_interest_at || "persisted" }
        : recommendation;
    }),
  );
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const ui = programCardCopy[locale];
  const visibleItems = items.filter((item) => {
    const program = firstProgram(item);
    const university = firstUniversity(program);
    if (!program) return false;
    const haystack = [program.name, program.field, university?.name, university?.city].filter(Boolean).join(" ").toLocaleLowerCase(locale);
    const matchesQuery = !searchQuery.trim() || haystack.includes(searchQuery.trim().toLocaleLowerCase(locale));
    const matchesDegree = degreeFilter === "all" || program.degree_level === degreeFilter;
    const matchesLanguage = languageFilter === "all" || program.teaching_language === languageFilter;
    return matchesQuery && matchesDegree && matchesLanguage;
  });

  const compareItems = compareIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is Recommendation => Boolean(item && firstProgram(item)));

  const interestedCount = items.filter((item) => Boolean(item.student_interest_at)).length;
  const comparableItems = items.filter((item) => firstProgram(item));
  const actionable = applicationStateError
    ? undefined
    : items.find((item) => !item.student_interest_at && item.status !== "not_recommended");
  const nextProgram = actionable ? firstProgram(actionable) : undefined;

  function toggleCompare(id: string) {
    setCompareIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= 3
          ? [...current.slice(1), id]
          : [...current, id],
    );
  }

  async function interested(id: string) {
    setBusy(id);
    setFeedback(null);

    try {
      const response = await fetch("/api/student/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recommendation_id: id }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({ message: locale === "fr" && typeof result.error === "string" ? result.error : t.addError, kind: "error" });
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, student_interest_at: new Date().toISOString() } : item,
        ),
      );
      setFeedback({
        message: t.addSuccess,
        kind: "success",
      });
    } catch {
      setFeedback({ message: t.networkError, kind: "error" });
    } finally {
      setBusy(null);
    }
  }

  if (loadError) {
    return (
      <Card>
        <div role="alert">
          <h2 className="text-lg font-semibold text-slate-950">{t.loadTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{loadError}</p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/student/orientation">{studentOrientationCopy[locale].page.retry}</ButtonLink>
          <ButtonLink href="/student" variant="secondary">{studentOrientationCopy[locale].page.back}</ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {applicationStateError && (
        <div role="alert" className="rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>{applicationStateError}</p>
          <p className="mt-1 leading-6">
            {t.applicationStateDetail}
          </p>
          <div className="mt-3">
            <ButtonLink href="/student/orientation" variant="secondary">{t.retryVerification}</ButtonLink>
          </div>
        </div>
      )}

      {criteriaStateError && (
        <div role="alert" className="rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>{criteriaStateError}</p>
          <p className="mt-1 leading-6">
            {t.criteriaStateDetail}
          </p>
        </div>
      )}

      {feedback && (
        <div
          role={feedback.kind === "error" ? "alert" : "status"}
          className={`rounded-[var(--radius-control)] border p-4 text-sm ${
            feedback.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section aria-label={t.summaryAria} className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-none">
          <div aria-hidden="true" className="student-accent-edge absolute inset-y-0 w-1 bg-[var(--brand)]" />
          <div className="student-accent-content student-accent-content-wide">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{t.programsEyebrow}</p>
              <Badge variant={items.length ? "info" : "neutral"}>{items.length ? t.programsAvailable : t.noPrograms}</Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{t.compareTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {applicationStateError
                ? t.interestStateUnknown
                : nextProgram
                  ? t.startWith(nextProgram.name)
                  : items.length
                    ? t.selectedPrograms
                    : t.noProgramsText}
            </p>
            {nextProgram && (
              <div className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">{t.lookNow}</p>
                <p className="mt-2 font-bold text-slate-950"><bdi dir="auto">{nextProgram.name}</bdi></p>
                <p className="mt-1 text-sm text-slate-600"><bdi dir="auto">{localizeCatalogueLabel(locale, nextProgram.degree_level)}</bdi> · <bdi dir="auto">{localizeCatalogueLabel(locale, nextProgram.field) || t.fieldUnknown}</bdi></p>
              </div>
            )}
          </div>
        </Card>

        <section aria-label={t.orientationSummaryAria} className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <SummaryCard title={t.summaryPrograms} value={items.length} badge={t.proposed} tone="info" />
          <SummaryCard title={t.compare} value={comparableItems.length - interestedCount} badge={t.decide} tone={comparableItems.length - interestedCount > 0 ? "warning" : "success"} />
          <SummaryCard title={t.added} value={applicationStateError ? "—" : interestedCount} badge={applicationStateError ? t.unavailable : interestedCount ? t.trackingStarted : t.none} tone={applicationStateError ? "neutral" : interestedCount ? "success" : "neutral"} />
        </section>
      </section>

      {!loadError && items.length === 0 ? (
        <Card aria-labelledby="orientation-empty-title" className="border-dashed bg-white/70 py-9 text-center">
          <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">⌁</span>
          <h2 id="orientation-empty-title" className="mt-4 text-lg font-bold text-slate-950">{t.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            {t.emptyText}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/student/profile" variant="secondary">{t.profile}</ButtonLink>
            <ButtonLink href="/student">{studentOrientationCopy[locale].page.back}</ButtonLink>
          </div>
        </Card>
      ) : (
        <section aria-labelledby="recommended-programs-title">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{t.programsEyebrow}</p>
              <h2 id="recommended-programs-title" className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{t.listEyebrow}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{t.listDescription}</p>
            </div>
            <ButtonLink href="/student/applications" variant="secondary">{studentOrientationCopy[locale].page.applications}</ButtonLink>
          </div>

          <div className="mb-4 grid gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
            <label className="text-sm font-semibold text-slate-700">
              <span className="sr-only">{ui.searchLabel}</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={ui.searchPlaceholder}
                className="field mt-0"
              />
            </label>
            <select aria-label={ui.degreeFilter} value={degreeFilter} onChange={(event) => setDegreeFilter(event.target.value)} className="field mt-0 min-w-40">
              <option value="all">{ui.allDegrees}</option>
              {[...new Set(items.map((item) => firstProgram(item)?.degree_level).filter(Boolean))].map((value) => <option key={value} value={value}>{localizeCatalogueLabel(locale, value)}</option>)}
            </select>
            <select aria-label={ui.languageFilter} value={languageFilter} onChange={(event) => setLanguageFilter(event.target.value)} className="field mt-0 min-w-40">
              <option value="all">{ui.allLanguages}</option>
              {[...new Set(items.map((item) => firstProgram(item)?.teaching_language).filter((value): value is string => Boolean(value)))].map((value) => <option key={value} value={value}>{localizeCatalogueLabel(locale, value)}</option>)}
            </select>
            <Button type="button" variant="secondary" onClick={() => { setSearchQuery(""); setDegreeFilter("all"); setLanguageFilter("all"); }}>
              {ui.reset}
            </Button>
            <p className="text-xs text-slate-500 lg:col-span-4">
              {ui.results(visibleItems.length)}
            </p>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
            <p className="text-sm text-slate-600">{ui.scanHint}</p>
            <Badge variant={compareIds.length > 1 ? "info" : "neutral"}>
              {ui.compareCount(compareIds.length)}
            </Badge>
          </div>

          {compareItems.length >= 2 ? (
            <section
              aria-labelledby="program-comparison-title"
              className="mb-5 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/25 p-4 sm:p-5"
              data-program-comparison
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">{ui.quickCompareEyebrow}</p>
                  <h3 id="program-comparison-title" className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950">{ui.quickCompareTitle}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{ui.quickCompareDescription}</p>
                </div>
                <Badge variant="info">{ui.compareCount(compareItems.length)}</Badge>
              </div>

              <div className={`mt-4 grid gap-3 ${compareItems.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
                {compareItems.map((recommendation) => {
                  const program = firstProgram(recommendation);
                  if (!program) return null;
                  const university = firstUniversity(program);
                  const compatibility = compatibilityPresentation(recommendation.requirement_match, locale);
                  const semester = semesterSummary(program.intake_terms, locale);
                  const deadline = programmeDeadline(program, locale);
                  const fees = programmeFees(program, university, ui.verify);

                  return (
                    <article key={`compare-${recommendation.id}`} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500"><bdi dir="auto">{university?.name || t.universityUnknown}</bdi></p>
                          <h4 className="mt-1 text-base font-bold leading-6 text-slate-950"><bdi dir="auto">{program.name}</bdi></h4>
                        </div>
                        <Button type="button" variant="secondary" className="shrink-0" onClick={() => toggleCompare(recommendation.id)}>
                          {ui.removeComparison}
                        </Button>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-[var(--border)] pt-4 text-sm">
                        <CompareFact label={ui.degree} value={localizeCatalogueLabel(locale, program.degree_level)} />
                        <CompareFact label={ui.language} value={localizeCatalogueLabel(locale, program.teaching_language) || t.routeUnknown} />
                        <CompareFact label={ui.semester} value={semester} />
                        <CompareFact label={ui.deadline} value={deadline} />
                        <div className="col-span-2">
                          <CompareFact label={ui.fees} value={fees} />
                        </div>
                      </dl>

                      <div className={`mt-4 rounded-xl border px-3 py-2.5 ${compatibility.containerClass}`}>
                        <p className="text-sm font-bold text-slate-950">
                          <span aria-hidden="true" className={compatibility.iconClass}>{compatibility.icon} </span>
                          {compatibility.label}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((recommendation) => {
              const program = firstProgram(recommendation);
              const university = firstUniversity(program);

              if (!program) return null;

              const ui = programCardCopy[locale];
              const programName = program.name;
              const applicationStatus = applicationStatusPresentation(
                program.id ? applicationStatuses[program.id] : undefined,
                Boolean(recommendation.student_interest_at),
                locale,
              );
              const compatibility = compatibilityPresentation(recommendation.requirement_match, locale);
              const compatibilityRows = compactCompatibilityCriteria(recommendation.requirement_match);
              const semester = semesterSummary(program.intake_terms, locale);
              const deadline = programmeDeadline(program, locale);
              const fees = programmeFees(program, university, ui.verify);
              const isCompared = compareIds.includes(recommendation.id);

              return (
                <Card
                  as="article"
                  key={recommendation.id}
                  aria-labelledby={`student-recommendation-title-${recommendation.id}`}
                  className={`flex h-full flex-col overflow-hidden p-0 shadow-none transition ${isCompared ? "border-[var(--brand)] ring-2 ring-[var(--brand-soft)]" : "border-[var(--border)]"}`}
                >
                  <div className="border-b border-[var(--border)] bg-[linear-gradient(135deg,var(--surface-subtle),white)] px-5 py-5 sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                          <bdi dir="auto">{university?.name || t.universityUnknown}</bdi>
                        </p>
                        <h3
                          id={`student-recommendation-title-${recommendation.id}`}
                          className="mt-2 text-xl font-bold leading-7 tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]"
                        >
                          <bdi dir="auto">{program.name}</bdi>
                        </h3>
                      </div>
                      <Badge variant={applicationStatus.tone}>{applicationStatus.label}</Badge>
                    </div>

                    {university?.city ? (
                      <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                        <span aria-hidden="true">⌖</span>
                        <bdi dir="ltr">{university.city}</bdi>
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                      <span className="rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-xs)]">
                        {localizeCatalogueLabel(locale, program.degree_level)}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-xs)]">
                        {localizeCatalogueLabel(locale, program.teaching_language) || t.routeUnknown}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-xs)]">
                        {semester}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-5 py-5 sm:px-6">
                    <dl className="grid grid-cols-2 gap-3 border-b border-[var(--border)] pb-5">
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{ui.fees}</dt>
                        <dd className="mt-1 text-sm font-semibold leading-5 text-slate-900 [overflow-wrap:anywhere]">{fees}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{ui.deadline}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-900">{deadline}</dd>
                      </div>
                    </dl>

                    <section
                      aria-label={`${copy.comparisonAria} - ${programName}`}
                      className={`mt-5 rounded-[var(--radius-control)] border p-4 ${compatibility.containerClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <span aria-hidden="true" className={`mt-0.5 text-lg font-black ${compatibility.iconClass}`}>
                          {compatibility.icon}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-950">{compatibility.label}</h4>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{compatibility.description}</p>
                        </div>
                      </div>
                    </section>

                    <div className="mt-4 space-y-2.5">
                      {program.diploma_required ? (
                        <div className="flex items-start gap-2.5 text-sm">
                          <span aria-hidden="true" className="w-4 shrink-0 font-black text-slate-400">•</span>
                          <span className="leading-5 text-slate-700">
                            {t.diplomaRequired}: <bdi dir="auto">{localizeProgramRequirement(locale, program.diploma_required)}</bdi>
                          </span>
                        </div>
                      ) : null}
                      {program.german_level_required ? (
                        <div className="flex items-start gap-2.5 text-sm">
                          <span aria-hidden="true" className="w-4 shrink-0 font-black text-slate-400">•</span>
                          <span className="leading-5 text-slate-700">
                            {t.german}: <bdi dir="auto">{`\u2066${program.german_level_required}\u2069`}</bdi>
                          </span>
                        </div>
                      ) : null}
                      {program.english_level_required ? (
                        <div className="flex items-start gap-2.5 text-sm">
                          <span aria-hidden="true" className="w-4 shrink-0 font-black text-slate-400">•</span>
                          <span className="leading-5 text-slate-700">
                            {t.english}: <bdi dir="auto">{`\u2066${program.english_level_required}\u2069`}</bdi>
                          </span>
                        </div>
                      ) : null}
                      {compatibilityRows.length ? compatibilityRows.map((item, index) => {
                        const signal = criterionSignal(item.status);
                        return (
                          <div key={`${item.criterion}-${index}`} className="flex items-start gap-2.5 text-sm">
                            <span aria-hidden="true" className={`w-4 shrink-0 font-black ${signal.className}`}>{signal.icon}</span>
                            <span className="min-w-0 flex-1 leading-5 text-slate-700">{criterionLabel(item.criterion, t)}</span>
                            <span className="shrink-0 text-xs font-semibold text-slate-500">
                              {copy.statusLabels[item.status] || t.check}
                            </span>
                          </div>
                        );
                      }) : (
                        <div className="flex items-start gap-2.5 text-sm">
                          <span aria-hidden="true" className="w-4 shrink-0 font-black text-amber-600">⚠</span>
                          <span className="leading-5 text-slate-700">{ui.detailsToVerify}</span>
                        </div>
                      )}
                    </div>

                    {recommendation.requirement_match?.application_route ? (
                      <div className="mt-4 border-t border-[var(--border)] pt-3 text-xs text-slate-600">
                        <span className="font-bold text-slate-700">{t.applicationRoute}: </span>
                        {applicationRouteLabel(recommendation.requirement_match.application_route, t)}
                      </div>
                    ) : null}

                    <div className="mt-auto pt-6">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          disabled={Boolean(applicationStateError) || Boolean(recommendation.student_interest_at) || busy === recommendation.id || recommendation.status === "not_recommended"}
                          onClick={() => interested(recommendation.id)}
                        >
                          <span aria-hidden="true">♡</span>
                          {recommendation.student_interest_at
                            ? ui.saved
                            : busy === recommendation.id
                              ? t.saving
                              : ui.save}
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          className={`w-full ${isCompared ? "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)]" : ""}`}
                          aria-pressed={isCompared}
                          onClick={() => toggleCompare(recommendation.id)}
                        >
                          <span aria-hidden="true">⇄</span>
                          {isCompared ? ui.comparing : ui.compare}
                        </Button>
                      </div>

                      {program.application_url ? (
                        <a
                          href={program.application_url}
                          aria-label={t.officialSourceAria(program.name)}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonClassName("primary", "mt-2 w-full")}
                        >
                          {ui.viewProgramme}
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span className={buttonClassName("secondary", "mt-2 w-full cursor-not-allowed opacity-60")}>
                          {ui.viewProgramme}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}


const programCardCopy = {
  fr: {
    scanHint: "Scannez rapidement l’essentiel avant d’ouvrir le détail.",
    fees: "Frais / tuition",
    deadline: "Deadline",
    verify: "À vérifier",
    save: "Enregistrer",
    saved: "Enregistré",
    compare: "Comparer",
    comparing: "Comparé",
    viewProgramme: "Voir le programme",
    detailsToVerify: "Compatibilité détaillée à vérifier",
    compareCount: (count: number) => count ? `${count}/3 à comparer` : "Sélectionnez jusqu’à 3",
  },
  ar: {
    scanHint: "راجع المعلومات الأساسية بسرعة قبل فتح التفاصيل.",
    fees: "الرسوم",
    deadline: "آخر موعد",
    verify: "يجب التحقق",
    save: "حفظ",
    saved: "محفوظ",
    compare: "مقارنة",
    comparing: "محدد للمقارنة",
    viewProgramme: "عرض البرنامج",
    detailsToVerify: "يجب التحقق من تفاصيل التوافق",
    compareCount: (count: number) => count ? `${count}/3 للمقارنة` : "اختر حتى 3",
  },
  en: {
    scanHint: "Scan the essentials quickly before opening the full programme.",
    fees: "Tuition / fees",
    deadline: "Deadline",
    verify: "To verify",
    save: "Save",
    saved: "Saved",
    compare: "Compare",
    comparing: "Selected",
    viewProgramme: "View programme",
    detailsToVerify: "Detailed compatibility needs checking",
    compareCount: (count: number) => count ? `${count}/3 to compare` : "Select up to 3",
  },
  de: {
    scanHint: "Die wichtigsten Angaben schnell prüfen, bevor du das Programm öffnest.",
    fees: "Gebühren",
    deadline: "Frist",
    verify: "Zu prüfen",
    save: "Speichern",
    saved: "Gespeichert",
    compare: "Vergleichen",
    comparing: "Ausgewählt",
    viewProgramme: "Studiengang ansehen",
    detailsToVerify: "Detaillierte Passung muss geprüft werden",
    compareCount: (count: number) => count ? `${count}/3 zum Vergleich` : "Bis zu 3 auswählen",
  },
} as const;

function applicationStatusPresentation(status: string | undefined, saved: boolean, locale: keyof typeof programCardCopy) {
  const labels = {
    fr: {
      draft: "À préparer",
      planned: "À préparer",
      preparing: "En préparation",
      documents_missing: "Pièces manquantes",
      ready_to_submit: "Prête à déposer",
      submitted: "Soumise",
      waiting_university: "En attente",
      in_review: "En cours",
      admitted: "Admission",
      rejected: "Refusée",
      saved: "Enregistré",
      none: "Non démarrée",
    },
    ar: { draft: "للتحضير", planned: "للتحضير", preparing: "قيد التحضير", documents_missing: "وثائق ناقصة", ready_to_submit: "جاهز للإرسال", submitted: "تم الإرسال", waiting_university: "في الانتظار", in_review: "قيد المعالجة", admitted: "قبول", rejected: "مرفوض", saved: "محفوظ", none: "لم يبدأ" },
    en: { draft: "To prepare", planned: "To prepare", preparing: "Preparing", documents_missing: "Documents missing", ready_to_submit: "Ready to submit", submitted: "Submitted", waiting_university: "Waiting", in_review: "In progress", admitted: "Admitted", rejected: "Rejected", saved: "Saved", none: "Not started" },
    de: { draft: "Vorbereiten", planned: "Vorbereiten", preparing: "In Vorbereitung", documents_missing: "Unterlagen fehlen", ready_to_submit: "Einreichbereit", submitted: "Eingereicht", waiting_university: "Warten", in_review: "In Bearbeitung", admitted: "Zulassung", rejected: "Abgelehnt", saved: "Gespeichert", none: "Nicht begonnen" },
  }[locale];

  const label = status ? labels[status as keyof typeof labels] || status : saved ? labels.saved : labels.none;
  const tone: "success" | "warning" | "info" | "neutral" =
    ["submitted", "admitted"].includes(status || "") ? "success"
      : ["documents_missing", "rejected"].includes(status || "") ? "warning"
        : ["preparing", "ready_to_submit", "waiting_university", "in_review"].includes(status || "") ? "info"
          : "neutral";
  return { label, tone };
}

function compatibilityPresentation(match: MasterRequirementsMatch | null | undefined, locale: keyof typeof programCardCopy) {
  const copy = {
    fr: {
      good: ["Bonne compatibilité", "Les critères disponibles correspondent bien à votre profil."],
      partial: ["Compatibilité à vérifier", "Votre profil semble adapté, avec quelques points à confirmer."],
      limited: ["Compatibilité limitée", "Au moins une exigence connue n’est pas satisfaite."],
      unknown: ["Compatibilité à vérifier", "Nous n’avons pas encore assez d’informations pour conclure."],
    },
    ar: {
      good: ["توافق جيد", "المعايير المتوفرة متوافقة جيدًا مع ملفك."],
      partial: ["التوافق يحتاج إلى تحقق", "ملفك مناسب مبدئيًا مع بعض النقاط التي يجب تأكيدها."],
      limited: ["توافق محدود", "هناك شرط معروف واحد على الأقل غير مستوفى."],
      unknown: ["التوافق يحتاج إلى تحقق", "لا توجد معلومات كافية بعد للوصول إلى نتيجة."],
    },
    en: {
      good: ["Good compatibility", "The available criteria align well with your profile."],
      partial: ["Compatibility to verify", "Your profile appears suitable, with a few points to confirm."],
      limited: ["Limited compatibility", "At least one known requirement is not satisfied."],
      unknown: ["Compatibility to verify", "There is not enough information yet to conclude."],
    },
    de: {
      good: ["Gute Passung", "Die verfügbaren Kriterien passen gut zu deinem Profil."],
      partial: ["Passung zu prüfen", "Dein Profil wirkt passend, einige Punkte müssen noch bestätigt werden."],
      limited: ["Begrenzte Passung", "Mindestens eine bekannte Voraussetzung ist nicht erfüllt."],
      unknown: ["Passung zu prüfen", "Für eine klare Einschätzung fehlen noch Informationen."],
    },
  }[locale];

  if (!match) return { label: copy.unknown[0], description: copy.unknown[1], icon: "⚠", iconClass: "text-amber-600", containerClass: "border-amber-200 bg-amber-50/55" };
  if (match.has_blocking_mismatch) return { label: copy.limited[0], description: copy.limited[1], icon: "✕", iconClass: "text-red-600", containerClass: "border-red-200 bg-red-50/55" };
  if (match.needs_manual_review || match.has_unknowns) return { label: copy.partial[0], description: copy.partial[1], icon: "!", iconClass: "text-amber-600", containerClass: "border-amber-200 bg-amber-50/55" };
  return { label: copy.good[0], description: copy.good[1], icon: "✓", iconClass: "text-emerald-600", containerClass: "border-emerald-200 bg-emerald-50/55" };
}

function compactCompatibilityCriteria(match: MasterRequirementsMatch | null | undefined) {
  if (!match?.criteria?.length) return [];
  const priorities = [
    (item: RequirementMatchResult) => item.criterion.startsWith("language:"),
    (item: RequirementMatchResult) => item.criterion === "prior_degree",
    (item: RequirementMatchResult) => item.criterion === "minimum_ects" || item.criterion.startsWith("subject_credits:"),
    (item: RequirementMatchResult) => item.status === "not_satisfied" || item.status === "needs_manual_review",
  ];
  const selected: RequirementMatchResult[] = [];
  for (const pick of priorities) {
    const item = match.criteria.find((candidate) => pick(candidate) && !selected.includes(candidate));
    if (item) selected.push(item);
  }
  for (const item of match.criteria) {
    if (selected.length >= 4) break;
    if (!selected.includes(item)) selected.push(item);
  }
  return selected.slice(0, 4);
}

function applicationRouteLabel(
  route: MasterRequirementsMatch["application_route"],
  copy: (typeof studentOrientationCopy)["fr"]["panel"],
) {
  if (route === "direct") return copy.routeDirect;
  if (route === "uni_assist") return copy.routeUniAssist;
  if (route === "vpd") return copy.routeVpd;
  return copy.routeUnknown;
}

function criterionSignal(status: RequirementMatchResult["status"]) {
  if (status === "satisfied") return { icon: "✓", className: "text-emerald-600" };
  if (status === "not_satisfied") return { icon: "✕", className: "text-red-600" };
  return { icon: "⚠", className: "text-amber-600" };
}

function semesterSummary(terms: string[] | null | undefined, locale: keyof typeof programCardCopy) {
  const values = (terms || []).map((term) => term.toLowerCase());
  const winter = values.some((term) => term.includes("winter"));
  const summer = values.some((term) => term.includes("summer"));
  const labels = {
    fr: { winter: "Semestre d’hiver", summer: "Semestre d’été", both: "Hiver & été", unknown: "Semestre à vérifier" },
    ar: { winter: "الفصل الشتوي", summer: "الفصل الصيفي", both: "شتاء وصيف", unknown: "الفصل يحتاج إلى تحقق" },
    en: { winter: "Winter semester", summer: "Summer semester", both: "Winter & summer", unknown: "Semester to verify" },
    de: { winter: "Wintersemester", summer: "Sommersemester", both: "Winter & Sommer", unknown: "Semester prüfen" },
  }[locale];
  if (winter && summer) return labels.both;
  if (winter) return labels.winter;
  if (summer) return labels.summer;
  return labels.unknown;
}

function programmeDeadline(program: Program, locale: keyof typeof programCardCopy) {
  const candidates = [program.winter_deadline, program.summer_deadline].filter((value): value is string => Boolean(value));
  if (!candidates.length) return studentOrientationCopy[locale].panel.officialCheck;
  const today = new Date().toISOString().slice(0, 10);
  const future = candidates.filter((value) => value >= today).sort()[0];
  const selected = future || [...candidates].sort().at(-1) || null;
  return formatDeadline(selected, locale);
}

function SummaryCard({ title, value, badge, tone }: { title: string; value: number | string; badge: string; tone: "success" | "info" | "warning" | "neutral" }) {
  return (
    <Card as="article" className="shadow-none">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}

function criterionLabel(criterion: string, copy: (typeof studentOrientationCopy)["fr"]["panel"]) {
  if (copy.requirementLabels[criterion]) return copy.requirementLabels[criterion];
  if (criterion.startsWith("language:")) {
    const lang = criterion.slice("language:".length).toLowerCase().trim();
    const displayLang = copy.languageNames[lang] || lang;
    return `${copy.languagePrefix} · ${displayLang}`;
  }
  if (criterion.startsWith("subject_credits:")) {
    const subject = criterion.slice("subject_credits:".length).toLowerCase().trim();
    const displaySubject = copy.subjectNames[subject] || subject;
    return `${copy.creditsPrefix} · ${displaySubject}`;
  }
  return copy.requirementLabels.other;
}
