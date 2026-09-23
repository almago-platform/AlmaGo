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
        message: "Votre intérêt est enregistré. La candidature est maintenant visible dans votre espace.",
        kind: "success",
      });
    } catch {
      setFeedback({ message: "Erreur réseau. Vérifiez votre connexion puis réessayez.", kind: "error" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8">
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
          className={`rounded-2xl border p-4 text-sm ${
            feedback.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section aria-label="Synthèse orientation" className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Card className="bg-slate-950 text-white">
          <Badge variant={items.length ? "info" : "neutral"}>{items.length ? "Pistes disponibles" : "En préparation"}</Badge>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">Choix de programme</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {applicationStateError
              ? "Vos recommandations sont visibles, mais l’état des intérêts enregistrés n’a pas pu être vérifié."
              : nextProgram
                ? `Prochaine piste à examiner : ${nextProgram.name}. Vérifiez les critères avant d’enregistrer votre intérêt.`
                : items.length
                  ? "Vos intérêts actuels sont enregistrés. Continuez à suivre les candidatures depuis votre espace."
                  : "AlmaGo publiera ici les pistes adaptées après analyse de votre profil."}
          </p>
          {nextProgram && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-light)]">À comparer</p>
              <p className="mt-2 font-semibold">{nextProgram.name}</p>
              <p className="mt-1 text-sm text-slate-300">{nextProgram.degree_level} · {nextProgram.field || "Domaine à préciser"}</p>
            </div>
          )}
        </Card>

        <section aria-label="Résumé de l’orientation" className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <SummaryCard title="Recommandations" value={items.length} badge="Préparées" tone="info" />
          <SummaryCard title="À comparer" value={comparableItems.length - interestedCount} badge="À décider" tone={comparableItems.length - interestedCount > 0 ? "warning" : "success"} />
          <SummaryCard title="Intérêts" value={applicationStateError ? "—" : interestedCount} badge={applicationStateError ? "Indisponible" : interestedCount ? "Suivi démarré" : "Aucun"} tone={applicationStateError ? "neutral" : interestedCount ? "success" : "neutral"} />
        </section>
      </section>

      {!loadError && items.length === 0 ? (
        <Card aria-labelledby="orientation-empty-title" className="border-dashed text-center">
          <h2 id="orientation-empty-title" className="text-lg font-semibold text-slate-950">Vos recommandations arrivent bientôt</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            L’équipe AlmaGo analyse votre profil avant de publier des pistes adaptées à votre projet.
          </p>
          <div className="mt-5">
            <ButtonLink href="/student/profile" variant="secondary">Vérifier mon profil</ButtonLink>
          </div>
        </Card>
      ) : (
        <section aria-labelledby="recommended-programs-title">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Comparaison</p>
              <h2 id="recommended-programs-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Programmes à examiner</h2>
              <p className="mt-1 text-sm text-slate-600">Consultez les critères visibles avant d’enregistrer votre intérêt.</p>
            </div>
            <ButtonLink href="/student/applications" variant="secondary">Candidatures suivies</ButtonLink>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {items.map((recommendation) => {
              const program = firstProgram(recommendation);
              const university = firstUniversity(program);

              if (!program) return null;

              return (
                <Card as="article" key={recommendation.id} aria-labelledby={`student-recommendation-title-${recommendation.id}`} className={recommendation.student_interest_at ? "border-[var(--brand-border)] bg-[var(--brand-soft)]" : ""}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--brand)]">
                        {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                      </p>
                      <h3 id={`student-recommendation-title-${recommendation.id}`} className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{program.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {program.degree_level} · {program.field || "Domaine à préciser"}
                      </p>
                    </div>
                    <Badge variant={recommendation.student_interest_at ? "success" : recommendationVariant(recommendation.status)}>
                      {recommendation.student_interest_at ? "Intérêt enregistré" : recommendationStatusLabels[recommendation.status] || recommendation.status}
                    </Badge>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-700">
                    {recommendation.note || "L’équipe AlmaGo a identifié ce programme comme une piste pertinente pour votre projet."}
                  </p>

                  <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    <InfoItem label="Langue" value={program.teaching_language || "À confirmer"} />
                    <InfoItem label="Deadline hiver" value={formatDeadline(program.winter_deadline)} />
                    <InfoItem label="Deadline été" value={formatDeadline(program.summer_deadline || null)} />
                    <InfoItem label="Diplôme demandé" value={program.diploma_required || "À confirmer"} />
                    <div className="rounded-2xl bg-slate-50 p-3 sm:col-span-2">
                      <dt className="text-slate-500">Niveaux linguistiques demandés</dt>
                      <dd className="mt-1 text-slate-900">
                        {[
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
    <div className="rounded-2xl bg-slate-50 p-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-900">{value}</dd>
    </div>
  );
}
