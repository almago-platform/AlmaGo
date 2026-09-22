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

function recommendationVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "recommended" || status === "possible") return "success";
  if (status === "missing_requirements") return "warning";
  if (status === "ambitious") return "info";
  return "neutral";
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
      const program = Array.isArray(recommendation.programs)
        ? recommendation.programs[0]
        : recommendation.programs;
      return applicationProgramIds.includes(program?.id || "")
        ? { ...recommendation, student_interest_at: recommendation.student_interest_at || "persisted" }
        : recommendation;
    }),
  );
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const interestedCount = items.filter((item) => Boolean(item.student_interest_at)).length;
  const actionable = applicationStateError
    ? undefined
    : items.find((item) => !item.student_interest_at && item.status !== "not_recommended");

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
        message: "Ton intérêt est enregistré. La candidature est maintenant visible dans ton espace.",
        kind: "success",
      });
    } catch {
      setFeedback({ message: "Erreur réseau. Vérifie ta connexion puis réessaie.", kind: "error" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-7">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {applicationStateError && (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {applicationStateError}
        </div>
      )}

      {feedback && (
        <div
          role={feedback.kind === "error" ? "alert" : "status"}
          className={`rounded-2xl p-4 text-sm ${
            feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section aria-label="Résumé de l’orientation" className="grid gap-4 sm:grid-cols-3">
        <Card aria-labelledby="orientation-recommendations-title">
          <h2 id="orientation-recommendations-title" className="text-sm font-semibold text-slate-700">Recommandations</h2>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{items.length}</p>
          <div className="mt-3"><Badge variant="neutral">Préparées par AlmaGo</Badge></div>
        </Card>
        <Card aria-labelledby="orientation-interests-title">
          <h2 id="orientation-interests-title" className="text-sm font-semibold text-slate-700">Intérêts enregistrés</h2>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{applicationStateError ? "—" : interestedCount}</p>
          <div className="mt-3"><Badge variant={applicationStateError ? "neutral" : interestedCount ? "success" : "neutral"}>{applicationStateError ? "Indisponible" : interestedCount ? "Suivi démarré" : "Aucun pour l’instant"}</Badge></div>
        </Card>
        <Card aria-labelledby="orientation-next-step-title">
          <h2 id="orientation-next-step-title" className="text-sm font-semibold text-slate-700">Prochaine étape</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
            {applicationStateError ? "Réessaie plus tard pour vérifier tes choix enregistrés." : actionable ? "Choisis un programme qui correspond à ton projet." : items.length ? "Tes choix actuels sont enregistrés." : "Attends les recommandations AlmaGo."}
          </p>
        </Card>
      </section>

      {!loadError && items.length === 0 ? (
        <Card aria-labelledby="orientation-empty-title" className="border-dashed text-center">
          <h2 id="orientation-empty-title" className="text-lg font-semibold text-slate-950">Tes recommandations arrivent bientôt</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            L’équipe AlmaGo analyse ton profil avant de publier des pistes adaptées à ton projet.
          </p>
          <div className="mt-5">
            <ButtonLink href="/student/profile" variant="secondary">Vérifier mon profil</ButtonLink>
          </div>
        </Card>
      ) : (
        <section aria-labelledby="recommended-programs-title">
          <div className="mb-4">
            <h2 id="recommended-programs-title" className="text-xl font-semibold text-slate-950">Programmes à comparer</h2>
            <p className="mt-1 text-sm text-slate-600">Consulte les critères avant d’enregistrer ton intérêt.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {items.map((recommendation) => {
              const program = Array.isArray(recommendation.programs)
                ? recommendation.programs[0]
                : recommendation.programs;
              const university = Array.isArray(program?.universities)
                ? program?.universities[0]
                : program?.universities;

              if (!program) return null;

              return (
                <Card as="article" key={recommendation.id} aria-labelledby={`student-recommendation-title-${recommendation.id}`}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-emerald-700">
                        {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                      </p>
                      <h3 id={`student-recommendation-title-${recommendation.id}`} className="mt-2 text-xl font-semibold text-slate-950">{program.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {program.degree_level} · {program.field || "Domaine à préciser"}
                      </p>
                    </div>
                    <Badge variant={recommendationVariant(recommendation.status)}>
                      {recommendationStatusLabels[recommendation.status] || recommendation.status}
                    </Badge>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-700">
                    {recommendation.note || "L’équipe AlmaGo a identifié ce programme comme une piste pertinente pour ton projet."}
                  </p>

                  <dl className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Langue d’enseignement</dt>
                      <dd className="mt-1 font-medium text-slate-900">{program.teaching_language || "À confirmer"}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Deadline hiver</dt>
                      <dd className="mt-1 font-medium text-slate-900">{formatDeadline(program.winter_deadline)}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 sm:col-span-2">
                      <dt className="text-slate-500">Conditions principales</dt>
                      <dd className="mt-1 text-slate-900">
                        {[
                          program.diploma_required,
                          program.german_level_required && `Allemand ${program.german_level_required}`,
                          program.english_level_required && `Anglais ${program.english_level_required}`,
                        ].filter(Boolean).join(" · ") || "À confirmer avec AlmaGo"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {program.application_url && (
                      <a
                        href={program.application_url}
                        aria-label={`Site officiel de ${program.name} (nouvel onglet)`}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonClassName("secondary")}
                      >
                        Site officiel
                      </a>
                    )}
                    <Button
                      type="button"
                      disabled={Boolean(applicationStateError) || Boolean(recommendation.student_interest_at) || busy === recommendation.id || recommendation.status === "not_recommended"}
                      onClick={() => interested(recommendation.id)}
                    >
                      {recommendation.student_interest_at
                        ? "Intérêt enregistré"
                        : busy === recommendation.id
                          ? "Enregistrement…"
                          : "Ce programme m’intéresse"}
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
