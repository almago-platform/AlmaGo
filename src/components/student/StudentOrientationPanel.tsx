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

type University = { name: string; city: string; bundesland?: string | null };
type Program = {
  id?: string;
  name: string;
  degree_level: string;
  field: string | null;
  teaching_language: string | null;
  winter_deadline: string | null;
  summer_deadline?: string | null;
  application_url: string | null;
  german_level_required: string | null;
  english_level_required: string | null;
  diploma_required: string | null;
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

function recommendationVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "recommended" || status === "possible") return "success";
  if (status === "missing_requirements") return "warning";
  if (status === "ambitious") return "info";
  return "neutral";
}

function firstProgram(recommendation: Recommendation) {
  return Array.isArray(recommendation.programs) ? recommendation.programs[0] : recommendation.programs;
}

function firstUniversity(program: Program | null | undefined) {
  return Array.isArray(program?.universities) ? program?.universities[0] : program?.universities;
}

export function StudentOrientationPanel({
  recommendations,
  applicationProgramIds,
  loadError,
  applicationStateError,
  criteriaStateError,
}: {
  recommendations: Recommendation[];
  applicationProgramIds: string[];
  loadError?: string;
  applicationStateError?: string;
  criteriaStateError?: string;
}) {
  const { locale } = useLocale();
  const t = studentOrientationCopy[locale].panel;
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

  const interestedCount = items.filter((item) => Boolean(item.student_interest_at)).length;
  const comparableItems = items.filter((item) => firstProgram(item));
  const actionable = applicationStateError
    ? undefined
    : items.find((item) => !item.student_interest_at && item.status !== "not_recommended");
  const nextProgram = actionable ? firstProgram(actionable) : undefined;

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
        setFeedback({ message: result.error || t.addError, kind: "error" });
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
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
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
                <p className="mt-2 font-bold text-slate-950">{nextProgram.name}</p>
                <p className="mt-1 text-sm text-slate-600">{nextProgram.degree_level} · {nextProgram.field || t.fieldUnknown}</p>
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
            <ButtonLink href="/student">Retour à mon dossier</ButtonLink>
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

          <div className="space-y-4">
            {items.map((recommendation) => {
              const program = firstProgram(recommendation);
              const university = firstUniversity(program);

              if (!program) return null;

              return (
                <Card
                  as="article"
                  key={recommendation.id}
                  aria-labelledby={`student-recommendation-title-${recommendation.id}`}
                  className={`shadow-none ${recommendation.student_interest_at ? "border-[var(--brand-border)] bg-[var(--brand-soft)]/55" : ""}`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.institution}</p>
                        <p className="mt-1 text-sm font-bold leading-5 text-slate-900 [overflow-wrap:anywhere]">
                          {university?.name || t.universityUnknown}{university?.city ? ` · ${university.city}` : ""}
                        </p>
                      </div>
                      <Badge variant={recommendation.student_interest_at ? "success" : recommendationVariant(recommendation.status)}>
                        {recommendation.student_interest_at ? t.addedToApplications : t.recommendationLabels[recommendation.status] || recommendation.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 id={`student-recommendation-title-${recommendation.id}`} className="text-xl font-bold leading-7 tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]">
                        {program.name}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                        <span className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1.5">{program.degree_level}</span>
                        <span className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1.5">{program.field || t.fieldUnknown}</span>
                        {program.teaching_language && <span className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1.5">{program.teaching_language}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/45 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.whyProgram}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                      {recommendation.note || t.proposedBoundary}
                    </p>
                  </div>

                  <div className="mt-5">
                    <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t.recordedCriteria}</h4>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <InfoItem label={t.teachingLanguage} value={program.teaching_language || studentOrientationCopy[locale].panel.routeUnknown} />
                    <InfoItem label={t.winterDeadline} value={formatDeadline(program.winter_deadline, locale)} />
                    <InfoItem label={t.summerDeadline} value={formatDeadline(program.summer_deadline || null, locale)} />
                    <InfoItem label={t.diplomaRequired} value={program.diploma_required || t.routeUnknown} />
                    <div className="rounded-[var(--radius-control)] bg-[var(--surface-muted)] p-3 sm:col-span-2">
                      <dt className="text-slate-500">{t.languageLevels}</dt>
                      <dd className="mt-1 text-slate-900">
                        {[
                          program.german_level_required && `${t.german} ${program.german_level_required}`,
                          program.english_level_required && `${t.english} ${program.english_level_required}`,
                        ].filter(Boolean).join(" · ") || t.officialCheck}
                      </dd>
                    </div>
                    </dl>
                  </div>

                  <RequirementAssessment match={recommendation.requirement_match} programName={program.name} copy={t} />

                  <div className="mt-5 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50/60 p-3 text-xs leading-5 text-amber-900">
                    {t.programLeadBoundary}
                  </div>

                  <div className="mt-auto flex flex-col gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:flex-wrap">
                    {program.application_url && (
                      <a
                        href={program.application_url}
                        aria-label={t.officialSourceAria(program.name)}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonClassName("secondary", "w-full sm:w-auto")}
                      >
                        {t.officialVerify}
                      </a>
                    )}
                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      disabled={Boolean(applicationStateError) || Boolean(recommendation.student_interest_at) || busy === recommendation.id || recommendation.status === "not_recommended"}
                      onClick={() => interested(recommendation.id)}
                    >
                      {recommendation.student_interest_at
                        ? t.addedToApplications
                        : busy === recommendation.id
                          ? t.saving
                          : recommendation.status === "not_recommended"
                            ? t.unavailableAction
                            : t.addToApplications}
                    </Button>
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

function SummaryCard({ title, value, badge, tone }: { title: string; value: number | string; badge: string; tone: "success" | "info" | "warning" | "neutral" }) {
  return (
    <Card as="article" className="shadow-none">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900 [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}


function RequirementAssessment({
  match,
  programName,
  copy,
}: {
  match?: MasterRequirementsMatch | null;
  programName: string;
  copy: (typeof studentOrientationCopy)["fr"]["panel"];
}) {
  if (!match) return null;

  const summary = match.has_blocking_mismatch
    ? { label: copy.pointToComplete, tone: "warning" as const }
    : match.needs_manual_review
      ? { label: copy.verificationNeeded, tone: "info" as const }
      : match.has_unknowns
        ? { label: copy.missingInformation, tone: "neutral" as const }
        : { label: copy.criteriaCompared, tone: "success" as const };

  return (
    <section
      className="mt-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4"
      aria-label={`${copy.comparisonAria} - ${programName}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{copy.comparisonAria}</h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">{copy.comparisonBoundary}</p>
        </div>
        <Badge variant={summary.tone}>{summary.label}</Badge>
      </div>

      {match.criteria.length > 0 && (
        <div className="mt-4 space-y-2">
          {match.criteria.map((item, index) => (
            <div key={`${item.criterion}-${index}`} className="rounded-[var(--radius-control)] bg-[var(--surface-muted)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{criterionLabel(item.criterion, copy)}</p>
                <Badge variant={criterionTone(item)}>{criterionStatusLabel(item, copy)}</Badge>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{criterionExplanation(item, copy)}</p>
              {(item.student_value !== null || item.required_value !== null) && (
                <p className="mt-1 text-xs text-slate-500">
                  {item.student_value !== null ? `${copy.yourInformation}: ${item.student_value}` : ""}
                  {item.student_value !== null && item.required_value !== null ? " · " : ""}
                  {item.required_value !== null ? `${copy.publishedCriterion}: ${item.required_value}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {match.application_route && (
        <div className="mt-3 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/40 p-3 text-sm">
          <span className="font-semibold text-slate-900">{copy.applicationRoute}: </span>
          <span className="text-slate-700">{applicationRouteLabel(match.application_route, copy)}</span>
        </div>
      )}
    </section>
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

function criterionStatusLabel(
  item: RequirementMatchResult,
  copy: (typeof studentOrientationCopy)["fr"]["panel"],
) {
  if (item.criterion === "deadline") {
    if (item.status === "satisfied") return copy.deadlineOpen;
    if (item.status === "not_satisfied") return copy.deadlinePassed;
  }
  return copy.statusLabels[item.status] || copy.missing;
}

function criterionTone(item: RequirementMatchResult): "success" | "warning" | "info" | "neutral" {
  if (item.status === "satisfied") return "success";
  if (item.status === "not_satisfied") return "warning";
  if (item.status === "needs_manual_review") return "info";
  return "neutral";
}

function criterionExplanation(
  item: RequirementMatchResult,
  copy: (typeof studentOrientationCopy)["fr"]["panel"],
) {
  let userFacingFrench: string | null = null;

  if (item.criterion === "minimum_ects" && item.status === "unknown") {
    userFacingFrench = "Nous n’avons pas encore assez d’informations pour comparer vos ECTS.";
  } else if (item.criterion === "minimum_grade" && item.status === "unknown") {
    userFacingFrench = "Votre note n’est pas encore disponible dans un format comparable.";
  } else if (item.criterion.startsWith("subject_credits:") && item.status === "unknown") {
    userFacingFrench = "Vos crédits par matière ne sont pas encore disponibles pour cette comparaison.";
  } else if (item.criterion.startsWith("language:") && item.status === "unknown") {
    userFacingFrench = "Votre niveau dans cette langue n’est pas encore disponible pour la comparaison.";
  } else if (item.criterion === "prior_degree" && item.status === "needs_manual_review") {
    userFacingFrench = "La compatibilité de votre diplôme doit être vérifiée avant de conclure.";
  }

  if (!userFacingFrench) {
    userFacingFrench = ({
      "Les ECTS totaux de l’étudiant ne sont pas structurés dans le projet.": "Le total de vos ECTS n’est pas encore indiqué dans votre projet.",
      "Les crédits par matière de l’étudiant ne sont pas structurés dans le projet.": "Vos crédits par matière ne sont pas encore renseignés de manière structurée dans votre projet.",
      "Aucune note étudiante comparable et normalisée n’est disponible.": "Votre moyenne n’est pas encore indiquée dans un format utilisable pour la comparaison.",
      "Diplôme actuel non renseigné.": "Votre diplôme actuel n’est pas encore renseigné dans votre profil.",
      "La compatibilité du diplôme doit être confirmée manuellement.": "L’université doit confirmer si votre diplôme correspond à ce programme.",
      "Le niveau étudiant pour cette langue n’est pas structuré.": "Votre niveau de langue n’est pas encore structuré dans votre projet.",
      "Niveau d’allemand étudiant absent ou non comparable.": "Votre niveau d’allemand n’est pas renseigné ou n’est pas sous un format comparable.",
      "Le niveau requis n’est pas un niveau CEFR comparable.": "Le niveau demandé n’utilise pas les niveaux A1–C2. Vérifiez la source officielle.",
      "Rentrée étudiante absente ou non structurée.": "Votre période de rentrée souhaitée n’est pas renseignée ou structurée.",
      "La rentrée du programme n’est pas comparable automatiquement.": "La date de rentrée du programme nécessite une analyse manuelle.",
      "La deadline vérifiée n’est pas une date structurée comparable.": "La date limite de candidature n’est pas disponible sous un format comparable.",
      "Information non renseignée.": "Cette information n’est pas encore disponible ou renseignée.",
      "Source ou vérification à revalider.": "Les sources officielles de cette information doivent être vérifiées à nouveau.",
      "Le prérequis est disponible uniquement en texte libre.": "La source donne ce critère en texte. Lisez-la avant de décider.",
      "Valeur vérifiée absente.": "L’information vérifiée n’est pas disponible.",
      "Valeur numérique non exploitable.": "La valeur chiffrée présente un format non exploitable.",
    } as Record<string, string>)[item.reason] || item.reason;
  }

  return copy.reasonLabels[userFacingFrench] || userFacingFrench;
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

