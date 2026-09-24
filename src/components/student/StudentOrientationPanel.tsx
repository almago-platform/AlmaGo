"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { formatDeadline, recommendationStatusLabels } from "@/lib/phase4";

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
          <h2 className="text-lg font-semibold text-slate-950">Recommandations indisponibles</h2>
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
            Vos recommandations restent visibles, mais les boutons d’intérêt sont désactivés jusqu’à ce que l’état puisse être revérifié.
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
                ? "Vos recommandations restent visibles, mais nous ne pouvons pas confirmer l’état de vos intérêts enregistrés pour le moment."
                : nextProgram
                  ? `Commencez par ${nextProgram.name}. Vérifiez les critères visibles et la source officielle avant d’enregistrer votre intérêt.`
                  : items.length
                    ? "Vos intérêts enregistrés sont déjà visibles dans vos candidatures."
                    : "Aucune recommandation n’est publiée pour le moment. Vérifiez que votre profil contient les informations utiles à l’orientation."}
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
          <SummaryCard title="Recommandations" value={items.length} badge="Publiées" tone="info" />
          <SummaryCard title="À comparer" value={comparableItems.length - interestedCount} badge="À décider" tone={comparableItems.length - interestedCount > 0 ? "warning" : "success"} />
          <SummaryCard title="Intérêts enregistrés" value={applicationStateError ? "—" : interestedCount} badge={applicationStateError ? "Indisponible" : interestedCount ? "Suivi démarré" : "Aucun intérêt"} tone={applicationStateError ? "neutral" : interestedCount ? "success" : "neutral"} />
        </section>
      </section>

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
                        <p className="mt-1 text-sm font-bold leading-5 text-slate-900">
                          {university?.name || "Université à confirmer"}{university?.city ? ` · ${university.city}` : ""}
                        </p>
                      </div>
                      <Badge variant={recommendation.student_interest_at ? "success" : recommendationVariant(recommendation.status)}>
                        {recommendation.student_interest_at ? "Intérêt enregistré" : studentRecommendationLabels[recommendation.status] || recommendationStatusLabels[recommendation.status] || recommendation.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 id={`student-recommendation-title-${recommendation.id}`} className="text-xl font-bold leading-7 tracking-[-0.02em] text-slate-950">
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
                    <p className="mt-2 text-sm leading-6 text-slate-700">
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
                    Cette recommandation est une piste d’orientation. Elle ne garantit ni l’éligibilité finale ni l’admission.
                  </div>

                  <div className="mt-auto flex flex-col gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:flex-wrap">
                    {program.application_url && (
                      <a
                        href={program.application_url}
                        aria-label={`Site officiel de ${program.name} (nouvel onglet)`}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonClassName("secondary", "w-full sm:w-auto")}
                      >
                        Vérifier la source officielle
                      </a>
                    )}
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
