"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { formatDeadline, recommendationStatusLabels } from "@/lib/phase4";
import { hasVerifiedProgramSource, isHttpSourceUrl } from "@/lib/source-verification";

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
  source_url: string | null;
  verified_at: string | null;
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
};

type Feedback = { message: string; kind: "success" | "error" } | null;

const studentRecommendationLabels: Record<string, string> = {
  recommended: "Piste recommandée",
  possible: "Piste possible",
  ambitious: "Piste ambitieuse",
  missing_requirements: "Prérequis à compléter",
  not_recommended: "Piste non recommandée",
};

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

function officialSourceUrl(program: Program) {
  if (isHttpSourceUrl(program.source_url)) return program.source_url?.trim() || null;
  if (isHttpSourceUrl(program.application_url)) return program.application_url?.trim() || null;
  return null;
}

function formatVerificationDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function StudentOrientationPanel({
  recommendations,
  applicationProgramIds,
  loadError,
  applicationStateError,
}: {
  recommendations: Recommendation[];
  applicationProgramIds: string[];
  loadError?: string;
  applicationStateError?: string;
}) {
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
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  const interestedCount = items.filter((item) => Boolean(item.student_interest_at)).length;
  const comparableItems = items.filter((item) => firstProgram(item));
  const actionable = applicationStateError
    ? undefined
    : items.find((item) => !item.student_interest_at && item.status !== "not_recommended");
  const nextProgram = actionable ? firstProgram(actionable) : undefined;
  const comparisonItems = items.filter(
    (item) => comparisonIds.includes(item.id) && Boolean(firstProgram(item)),
  );

  function toggleComparison(id: string) {
    setComparisonIds((current) => {
      if (current.includes(id)) return current.filter((itemId) => itemId !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
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
        setFeedback({ message: result.error || "Impossible de créer la candidature.", kind: "error" });
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, student_interest_at: new Date().toISOString() } : item,
        ),
      );
      setFeedback({
        message: "Votre intérêt est bien enregistré. Cette piste est maintenant visible dans vos candidatures.",
        kind: "success",
      });
    } catch {
      setFeedback({ message: "Erreur réseau. Vérifiez votre connexion puis réessayez.", kind: "error" });
    } finally {
      setBusy(null);
    }
  }

  if (loadError) {
    return (
      <Card>
        <div role="alert">
          <h2 className="text-lg font-semibold text-slate-950">Pistes d’orientation indisponibles</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{loadError}</p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/student/orientation">Réessayer</ButtonLink>
          <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
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
            Vos pistes d’orientation restent visibles, mais les boutons d’intérêt sont désactivés jusqu’à ce que l’état puisse être revérifié.
          </p>
          <div className="mt-3">
            <ButtonLink href="/student/orientation" variant="secondary">Réessayer la vérification</ButtonLink>
          </div>
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

      <section aria-label="Synthèse orientation" className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-[0_24px_55px_-38px_rgba(41,48,139,0.5)]">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Votre orientation</p>
              <Badge variant={items.length ? "info" : "neutral"}>{items.length ? "Pistes disponibles" : "Aucune piste publiée"}</Badge>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-slate-950">Comparez avant de décider.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {applicationStateError
                ? "Vos pistes d’orientation restent visibles, mais nous ne pouvons pas confirmer l’état de vos intérêts enregistrés pour le moment."
                : nextProgram
                  ? `Commencez par ${nextProgram.name}. Vérifiez les critères visibles et la source officielle avant d’enregistrer votre intérêt.`
                  : items.length
                    ? "Vos intérêts enregistrés sont déjà visibles dans vos candidatures."
                    : "Aucune piste d’orientation n’est publiée pour le moment. Vérifiez que votre profil contient les informations utiles à l’orientation."}
            </p>
            {nextProgram && (
              <div className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-muted)]/55 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">À regarder maintenant</p>
                <p className="mt-2 font-bold text-slate-950">{nextProgram.name}</p>
                <p className="mt-1 text-sm text-slate-600">{nextProgram.degree_level} · {nextProgram.field || "Domaine à préciser"}</p>
              </div>
            )}
          </div>
        </Card>

        <section aria-label="Résumé de l’orientation" className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <SummaryCard title="Pistes d’orientation" value={items.length} badge="Publiées" tone="info" />
          <SummaryCard title="À comparer" value={comparableItems.length - interestedCount} badge="À décider" tone={comparableItems.length - interestedCount > 0 ? "warning" : "success"} />
          <SummaryCard title="Intérêts enregistrés" value={applicationStateError ? "—" : interestedCount} badge={applicationStateError ? "Indisponible" : interestedCount ? "Suivi démarré" : "Aucun intérêt"} tone={applicationStateError ? "neutral" : interestedCount ? "success" : "neutral"} />
        </section>
      </section>

      {comparisonIds.length > 0 && (
        <section id="programme-comparison" aria-labelledby="programme-comparison-title">
          <Card className="border-[var(--brand-border)] bg-white">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Votre comparaison</p>
                <h2 id="programme-comparison-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                  Comparer mes programmes
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Comparez jusqu’à trois pistes sur les informations enregistrées. AlmaGo ne désigne pas de gagnant : vérifiez les critères importants sur chaque source officielle.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setComparisonIds([])} className="w-full justify-center sm:w-auto">
                Effacer la sélection
              </Button>
            </div>

            {comparisonItems.length < 2 ? (
              <div className="mt-6 rounded-[var(--radius-control)] border border-dashed border-[var(--brand-border)] bg-[var(--brand-soft)]/35 p-4 text-sm leading-6 text-slate-700">
                Ajoutez encore un programme pour afficher une comparaison côte à côte.
              </div>
            ) : (
              <div className={`mt-6 grid gap-4 ${comparisonItems.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
                {comparisonItems.map((item) => {
                  const program = firstProgram(item);
                  const university = firstUniversity(program);
                  if (!program) return null;

                  return (
                    <article key={item.id} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-muted)]/35 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                        {university?.name || "Établissement à confirmer"}
                      </p>
                      <h3 className="mt-2 text-lg font-bold leading-6 text-slate-950">{program.name}</h3>
                      <dl className="mt-4 space-y-2 text-sm">
                        <ComparisonFact label="Niveau" value={program.degree_level} />
                        <ComparisonFact label="Domaine" value={program.field || "À confirmer"} />
                        <ComparisonFact label="Langue d’enseignement" value={program.teaching_language || "À confirmer"} />
                        <ComparisonFact label="Échéance hiver" value={formatDeadline(program.winter_deadline)} />
                        <ComparisonFact label="Échéance été" value={formatDeadline(program.summer_deadline || null)} />
                        <ComparisonFact label="Diplôme demandé" value={program.diploma_required || "À confirmer"} />
                        <ComparisonFact
                          label="Langues demandées"
                          value={[
                            program.german_level_required && `Allemand ${program.german_level_required}`,
                            program.english_level_required && `Anglais ${program.english_level_required}`,
                          ].filter(Boolean).join(" · ") || "À confirmer"}
                        />
                      </dl>
                      <div className="mt-4 border-t border-[var(--border)] pt-4">
                        {officialSourceUrl(program) ? (
                          <>
                            <a
                              href={officialSourceUrl(program) || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-bold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
                            >
                              Consulter la source officielle
                            </a>
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {hasVerifiedProgramSource(program) && formatVerificationDate(program.verified_at)
                                ? `Dernière vérification enregistrée dans AlmaGo : ${formatVerificationDate(program.verified_at)}. Vérifiez toujours les informations sur la source officielle.`
                                : "Aucune date de vérification fiable n’est enregistrée pour cette fiche."}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs leading-5 text-slate-500">Source officielle à vérifier auprès de l’établissement.</p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Card>
        </section>
      )}

      {!loadError && items.length === 0 ? (
        <Card aria-labelledby="orientation-empty-title" className="border-dashed bg-white/70 py-9 text-center">
          <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">⌁</span>
          <h2 id="orientation-empty-title" className="mt-4 text-lg font-bold text-slate-950">Aucune piste d’orientation n’est publiée pour le moment.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Cela peut être normal pendant la préparation du dossier. Vérifiez que votre profil est à jour ; les nouvelles pistes apparaîtront ici lorsqu’elles seront enregistrées.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/student/profile" variant="secondary">Vérifier mon profil</ButtonLink>
            <ButtonLink href="/student">Retour à mon dossier</ButtonLink>
          </div>
        </Card>
      ) : (
        <section aria-labelledby="recommended-programs-title">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Vos pistes</p>
              <h2 id="recommended-programs-title" className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">Programmes à comparer</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Chaque fiche reprend uniquement les critères enregistrés dans AlmaGo. Vérifiez toujours les informations importantes auprès de la source officielle.</p>
            </div>
            <ButtonLink href="/student/applications" variant="secondary">Mes candidatures</ButtonLink>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {items.map((recommendation) => {
              const program = firstProgram(recommendation);
              const university = firstUniversity(program);
              const selectedForComparison = comparisonIds.includes(recommendation.id);

              if (!program) return null;

              return (
                <Card
                  as="article"
                  key={recommendation.id}
                  aria-labelledby={`student-recommendation-title-${recommendation.id}`}
                  className={`flex h-full flex-col transition-shadow duration-150 hover:shadow-[var(--shadow-soft)] ${recommendation.student_interest_at ? "border-[var(--brand-border)] bg-[var(--brand-soft)]" : ""}`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Établissement</p>
                        <p className="mt-1 text-sm font-bold leading-5 text-slate-900 [overflow-wrap:anywhere]">
                          {university?.name || "Université à confirmer"}{university?.city ? ` · ${university.city}` : ""}
                        </p>
                      </div>
                      <Badge variant={recommendation.student_interest_at ? "success" : recommendationVariant(recommendation.status)}>
                        {recommendation.student_interest_at ? "Intérêt enregistré" : studentRecommendationLabels[recommendation.status] || recommendationStatusLabels[recommendation.status] || recommendation.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 id={`student-recommendation-title-${recommendation.id}`} className="text-xl font-bold leading-7 tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]">
                        {program.name}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1.5">{program.degree_level}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5">{program.field || "Domaine à préciser"}</span>
                        {program.teaching_language && <span className="rounded-full bg-slate-100 px-3 py-1.5">{program.teaching_language}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/45 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Pourquoi cette piste apparaît ?</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                      {recommendation.note || "Cette piste a été enregistrée dans votre orientation. Consultez les critères ci-dessous et vérifiez les informations officielles avant de décider."}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Critères enregistrés</p>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <InfoItem label="Langue d’enseignement" value={program.teaching_language || "À confirmer"} />
                    <InfoItem label="Échéance hiver" value={formatDeadline(program.winter_deadline)} />
                    <InfoItem label="Échéance été" value={formatDeadline(program.summer_deadline || null)} />
                    <InfoItem label="Diplôme demandé" value={program.diploma_required || "À confirmer"} />
                    <div className="rounded-[var(--radius-control)] bg-[var(--surface-muted)] p-3 sm:col-span-2">
                      <dt className="text-slate-500">Niveaux linguistiques demandés</dt>
                      <dd className="mt-1 text-slate-900">
                        {[
                          program.german_level_required && `Allemand ${program.german_level_required}`,
                          program.english_level_required && `Anglais ${program.english_level_required}`,
                        ].filter(Boolean).join(" · ") || "À confirmer avec AlmaGo"}
                      </dd>
                    </div>
                    </dl>
                  </div>

                  <div className="mt-5 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50/60 p-3 text-xs leading-5 text-amber-900">
                    Cette piste d’orientation ne garantit ni l’éligibilité finale ni l’admission.
                  </div>

                  <div className={`mt-4 rounded-[var(--radius-control)] border p-4 ${
                    officialSourceUrl(program)
                      ? "border-[var(--brand-border)] bg-[var(--brand-soft)]/45"
                      : "border-[var(--border)] bg-[var(--surface-muted)]"
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Source officielle</p>
                      <Badge variant={hasVerifiedProgramSource(program) ? "success" : "neutral"}>
                        {hasVerifiedProgramSource(program) && formatVerificationDate(program.verified_at)
                          ? `Vérification enregistrée · ${formatVerificationDate(program.verified_at)}`
                          : "Vérification à confirmer"}
                      </Badge>
                    </div>
                    {officialSourceUrl(program) ? (
                      <>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          Consultez la page officielle avant de vous appuyer sur une condition, une date limite ou une procédure de candidature.
                        </p>
                        <a
                          href={officialSourceUrl(program) || "#"}
                          aria-label={`Consulter la source officielle de ${program.name} (nouvel onglet)`}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonClassName("secondary", "mt-3 w-full sm:w-auto")}
                        >
                          Consulter la source officielle
                        </a>
                        {!program.verified_at && (
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            La source est enregistrée, mais aucune date de vérification n’est encore indiquée dans AlmaGo.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Aucun lien officiel n’est enregistré dans AlmaGo pour cette fiche. Vérifiez directement les informations auprès de l’établissement avant toute démarche.
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex flex-col gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:flex-wrap">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto"
                      aria-pressed={selectedForComparison}
                      disabled={!selectedForComparison && comparisonIds.length >= 3}
                      onClick={() => toggleComparison(recommendation.id)}
                    >
                      {selectedForComparison
                        ? "Retirer de la comparaison"
                        : comparisonIds.length >= 3
                          ? "Comparaison complète"
                          : "Comparer"}
                    </Button>
                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      disabled={Boolean(applicationStateError) || Boolean(recommendation.student_interest_at) || busy === recommendation.id || recommendation.status === "not_recommended"}
                      onClick={() => interested(recommendation.id)}
                    >
                      {recommendation.student_interest_at
                        ? "Intérêt enregistré"
                        : busy === recommendation.id
                          ? "Enregistrement…"
                          : recommendation.status === "not_recommended"
                            ? "Non disponible"
                            : "Cette piste m’intéresse"}
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
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}

function ComparisonFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--border)]/70 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[60%] text-right font-semibold text-slate-900 [overflow-wrap:anywhere]">{value}</dd>
    </div>
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
