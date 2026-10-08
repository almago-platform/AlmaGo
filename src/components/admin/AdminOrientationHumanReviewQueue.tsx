"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ReviewRow = {
  id: string;
  orientation_id: string | null;
  pipeline_status: string;
  selected_count: number;
  review_status: string;
  approved_selection: string[];
  counselor_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  profile: any;
  bundle: any;
  prospect_email: string | null;
};

const reviewLabels: Record<string, string> = {
  pending: "À auditer",
  approved: "Validée",
  changes_requested: "Corrections demandées",
  rejected: "Rejetée",
};

const pipelineLabels: Record<string, string> = {
  ready: "Pipeline complet",
  partial: "Sélection partielle",
  insufficient_evidence: "Preuves insuffisantes",
  route_requires_review: "Parcours à revoir",
  profile_incomplete: "Profil incomplet",
  provider_unavailable: "Provider indisponible",
};

const verificationStatusLabels: Record<string, string> = {
  verified: "vérifié",
  needs_review: "à vérifier",
  unknown: "inconnu",
};

const verificationFieldLabels: Record<string, string> = {
  programme_exists: "Programme confirmé",
  degree_level: "Niveau du diplôme",
  city: "Ville",
  teaching_language: "Langue d’enseignement",
  german_language_requirement: "Exigence d’allemand",
  english_language_requirement: "Exigence d’anglais",
  accepted_language_certificates: "Certificats de langue acceptés",
  intake_terms: "Rentrées",
  winter_deadline: "Date limite hiver",
  summer_deadline: "Date limite été",
  application_route: "Voie de candidature",
  application_url: "Lien de candidature",
  studienkolleg_requirement: "Studienkolleg",
  tuition_or_semester_fees: "Frais de scolarité / semestre",
};

function initialSelection(review: ReviewRow) {
  if (Array.isArray(review.approved_selection) && review.approved_selection.length) {
    return review.approved_selection;
  }

  const selected = review.bundle?.selection?.selected;
  if (!Array.isArray(selected)) return [];
  return selected
    .map((item: any) => item?.candidateKey)
    .filter((value: unknown): value is string => typeof value === "string")
    .slice(0, 4);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function factValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (value === null || value === undefined || value === "") return "Inconnu";
  return String(value);
}

export function AdminOrientationHumanReviewQueue({
  reviews,
  available = true,
}: {
  reviews: ReviewRow[];
  available?: boolean;
}) {
  const [selectedByReview, setSelectedByReview] = useState<Record<string, string[]>>(
    () => Object.fromEntries(reviews.map((review) => [review.id, initialSelection(review)])),
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    () => Object.fromEntries(reviews.map((review) => [review.id, review.counselor_note || ""])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<Record<string, string>>({});

  function toggleCandidate(reviewId: string, candidateKey: string) {
    setSelectedByReview((current) => {
      const existing = current[reviewId] || [];
      if (existing.includes(candidateKey)) {
        return {
          ...current,
          [reviewId]: existing.filter((key) => key !== candidateKey),
        };
      }
      if (existing.length >= 4) return current;
      return {
        ...current,
        [reviewId]: [...existing, candidateKey],
      };
    });
  }

  async function decide(
    review: ReviewRow,
    decision: "approved" | "changes_requested" | "rejected",
  ) {
    setBusy(review.id);
    setMessage((current) => ({ ...current, [review.id]: "" }));

    try {
      const response = await fetch(`/api/admin/orientation/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decision,
          selectedCandidateKeys:
            decision === "rejected" ? [] : selectedByReview[review.id] || [],
          counselorNote: notes[review.id] || "",
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage((current) => ({
          ...current,
          [review.id]: payload.error || "La décision n’a pas pu être enregistrée.",
        }));
        return;
      }

      window.location.reload();
    } catch {
      setMessage((current) => ({
        ...current,
        [review.id]: "La décision n’a pas pu être enregistrée. Vérifiez la connexion puis réessayez.",
      }));
    } finally {
      setBusy(null);
    }
  }

  if (!available) {
    return (
      <Card className="mb-7 border-amber-200 bg-amber-50/60">
        <p className="text-sm font-bold text-amber-950">Revue Orientation V4 indisponible</p>
        <p className="mt-1 text-xs leading-5 text-amber-900">
          La table de revue F n’est pas disponible. Le workflow manuel de publication ci-dessous reste inchangé.
        </p>
      </Card>
    );
  }

  return (
    <section aria-labelledby="orientation-human-review-title" className="mb-7">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            Orientation V4 · F
          </p>
          <h2
            id="orientation-human-review-title"
            className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl"
          >
            Audits Orientation V4 a posteriori
          </h2>
          <p className="mt-1 max-w-5xl text-sm leading-6 text-slate-600">
            Le candidat a déjà reçu son résultat automatique avant cette étape. Ici, le conseiller audite ensuite A, B, C et D pour le contrôle qualité.
            Cet audit ne bloque ni ne retire rétroactivement le résultat déjà affiché et ne publie jamais automatiquement une recommandation étudiant.
          </p>
        </div>
        <Badge variant={reviews.some((review) => review.review_status === "pending") ? "warning" : "neutral"}>
          {reviews.filter((review) => review.review_status === "pending").length} en attente
        </Badge>
      </div>

      {reviews.length === 0 ? (
        <Card className="border-dashed bg-white/70 py-8 text-center shadow-none">
          <p className="font-bold text-slate-950">Aucune revue F enregistrée pour le moment.</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Les prochains résultats Orientation V4 créeront un bundle interne lorsque la persistance serveur est disponible.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {reviews.map((review, index) => {
            const bundle = review.bundle || {};
            const profile = review.profile || bundle.profile || {};
            const discoveryCandidates = Array.isArray(bundle.discovery?.candidates)
              ? bundle.discovery.candidates
              : [];
            const verificationProgrammes = Array.isArray(bundle.verification?.programmes)
              ? bundle.verification.programmes
              : [];
            const selectionItems = Array.isArray(bundle.selection?.selected)
              ? bundle.selection.selected
              : [];
            const writer = bundle.writer?.content || {};
            const selected = selectedByReview[review.id] || [];

            return (
              <Card key={review.id} as="article" className="min-w-0 overflow-hidden">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={review.review_status === "approved" ? "success" : review.review_status === "pending" ? "warning" : "neutral"}>
                        {reviewLabels[review.review_status] || review.review_status}
                      </Badge>
                      <Badge variant="info">
                        {pipelineLabels[review.pipeline_status] || review.pipeline_status}
                      </Badge>
                      <Badge variant="neutral">{review.selected_count} piste{review.selected_count > 1 ? "s" : ""} C</Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-950">
                      {profile.targetDegree || "Diplôme à confirmer"} · {profile.targetField || "Domaine à confirmer"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {review.prospect_email
                        ? <>Prospect lié : <bdi dir="auto">{review.prospect_email}</bdi></>
                        : "Revue anonyme non encore liée à un prospect sauvegardé"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Créée {formatDate(review.created_at)} · ID interne <code>{review.id.slice(0, 8)}</code>
                    </p>
                  </div>
                  <div className="text-xs leading-5 text-slate-600">
                    <p>Bac : <strong>{profile.bacStatus || "—"}</strong></p>
                    <p>Moyenne : <strong>{profile.generalAverage ? `${profile.generalAverage}/20` : "—"}</strong></p>
                    <p>Allemand : <strong>{profile.germanLevel || "—"}</strong></p>
                    <p>Rentrée : <strong>{profile.targetIntakeSeason || "—"} {profile.targetIntakeYear || ""}</strong></p>
                  </div>
                </div>

                <details open={index === 0 && review.review_status === "pending"} className="group mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)]/35 p-3">
                  <summary className="cursor-pointer list-none text-sm font-bold text-[var(--brand-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
                    {review.review_status === "pending" ? "Examiner et décider" : "Consulter la décision"} · {selected.length} programme(s) présélectionné(s)
                  </summary>

                <section aria-label="Sélection des pistes à valider en interne" className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-950">1. Choisir les programmes à examiner</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Sélectionnez jusqu’à 4 programmes. Si une exigence est incertaine, vérifiez la source officielle avant de valider la revue.
                      </p>
                    </div>
                    <Badge variant={selected.length ? "info" : "warning"}>{selected.length}/4 retenu{selected.length > 1 ? "s" : ""}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    {verificationProgrammes.length ? verificationProgrammes.map((item: any) => {
                      const verification = item.verification || {};
                      const candidate = verification.candidate || {};
                      const selectable = verification.overallStatus !== "unknown";
                      const facts = Array.isArray(verification.facts) ? verification.facts : [];
                      const focusFields = ["teaching_language", "german_language_requirement", "english_language_requirement", "winter_deadline", "summer_deadline", "application_route"];
                      const criticalFacts = focusFields
                        .map((field) => facts.find((fact: any) => fact.field === field && fact.status !== "unknown"))
                        .filter(Boolean)
                        .slice(0, 4);
                      const toCheck = facts.filter((fact: any) => fact.status === "needs_review");
                      const selection = selectionItems.find((entry: any) => entry.candidateKey === item.candidateKey);
                      const unresolved = Array.isArray(selection?.missingFacts) ? selection.missingFacts.length : 0;
                      const warnings = Array.isArray(selection?.warnings) ? selection.warnings.length : 0;
                      const germanRequirement = facts.find((fact: any) => fact.field === "german_language_requirement" && fact.status === "verified");
                      const germanRequirementText = germanRequirement ? factValue(germanRequirement.value) : "";
                      const possibleGermanGap = ["none", "a0", "aucun"].includes(String(profile.germanLevel || "").trim().toLowerCase())
                        && Boolean(germanRequirementText)
                        && !/(no german|not required|aucun|sans allemand)/i.test(germanRequirementText);
                      const needsAttention = verification.overallStatus !== "verified" || toCheck.length > 0 || unresolved > 0 || warnings > 0 || possibleGermanGap;
                      return (
                        <div key={item.candidateKey} className={`rounded-[var(--radius-control)] border p-3 ${selected.includes(item.candidateKey) ? "border-[var(--brand-border)] bg-[var(--brand-soft)]/20" : "border-[var(--border)] bg-white"}`}>
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 shrink-0"
                              checked={selected.includes(item.candidateKey)}
                              disabled={!selectable || (selected.length >= 4 && !selected.includes(item.candidateKey))}
                              onChange={() => toggleCandidate(review.id, item.candidateKey)}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block break-words text-sm font-bold text-slate-950">{candidate.programme || "Programme sans titre"}</span>
                              <span className="mt-0.5 block text-xs text-slate-700">{candidate.institution || "Établissement à confirmer"}{candidate.city ? ` · ${candidate.city}` : ""}</span>
                            </span>
                          </label>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge variant={!selectable ? "warning" : needsAttention ? "warning" : "success"}>
                              {!selectable ? "Preuves insuffisantes" : needsAttention ? "Points à vérifier" : "Faits vérifiés"}
                            </Badge>
                            {needsAttention ? <span className="text-xs text-amber-900">Vérifiez les exigences signalées et les sources</span> : null}
                          </div>
                          {possibleGermanGap ? (
                            <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs font-semibold leading-5 text-amber-950">
                              Profil : aucun allemand déclaré ; ce programme indique « {germanRequirementText} ». Vérifiez la compatibilité linguistique avant toute validation.
                            </p>
                          ) : null}
                          {criticalFacts.length ? (
                            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                              {criticalFacts.map((fact: any) => (
                                <div key={fact.field} className="min-w-0 text-xs leading-5">
                                  <dt className="font-semibold text-slate-800">{verificationFieldLabels[fact.field] || fact.field}</dt>
                                  <dd className="break-words text-slate-700">{factValue(fact.value)}{fact.status !== "verified" ? " · à vérifier" : ""}</dd>
                                </div>
                              ))}
                            </dl>
                          ) : <p className="mt-3 text-xs text-amber-900">Aucune exigence de langue ou date exploitable : vérifiez les sources avant décision.</p>}
                        </div>
                      );
                    }) : <p className="text-sm text-amber-900">Aucun programme vérifié à sélectionner. Demandez une correction plutôt que de confirmer.</p>}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">
                    Le contrôle des informations publiées ne garantit pas l’admission personnelle du candidat. Consultez les sources détaillées si une exigence reste incertaine.
                  </p>
                </section>

                <section className="mt-5 rounded-[var(--radius-control)] border border-slate-300 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-950">2. Prendre une décision</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {selected.length} piste{selected.length > 1 ? "s" : ""} retenue{selected.length > 1 ? "s" : ""} dans la sélection. Maximum 4.
                      </p>
                    </div>
                    {review.reviewed_at ? (
                      <p className="text-xs text-[var(--muted)]">Dernière décision : {formatDate(review.reviewed_at)}</p>
                    ) : null}
                  </div>

                  <label className="mt-4 block text-sm font-semibold text-slate-800">
                    Note interne (obligatoire pour demander une correction ou rejeter)
                    <textarea
                      value={notes[review.id] || ""}
                      onChange={(event) => setNotes((current) => ({ ...current, [review.id]: event.target.value }))}
                      maxLength={2000}
                      placeholder="Précisez une exigence manquante, une source à confirmer ou une raison de rejet."
                      className="field min-h-24 resize-y"
                    />
                  </label>

                  {message[review.id] ? (
                    <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{message[review.id]}</p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={busy === review.id || selected.length < 1}
                      onClick={() => decide(review, "approved")}
                    >
                      Confirmer après audit
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy === review.id || !(notes[review.id] || "").trim()}
                      onClick={() => decide(review, "changes_requested")}
                    >
                      Demander correction
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy === review.id || !(notes[review.id] || "").trim()}
                      onClick={() => decide(review, "rejected")}
                    >
                      Rejeter cette revue
                    </Button>
                  </div>

                  <p className="mt-3 text-xs font-semibold leading-5 text-amber-900">
                    Une validation F reste un acte interne. Pour rendre une recommandation visible à l’étudiant,
                    utilisez ensuite le workflow de publication manuel ci-dessous, qui vérifie le programme publié.
                  </p>
                </section>
                <details className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                  <summary className="cursor-pointer text-sm font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-[var(--brand)]">
                    Afficher les preuves détaillées (A–D) · sources, classement et texte généré
                  </summary>
                  <div className="mt-4">
                <div className="mt-5 grid gap-3">
                  <details className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <summary className="cursor-pointer text-sm font-bold">
                      A — candidats découverts ({discoveryCandidates.length})
                    </summary>
                    <div className="mt-3 space-y-3">
                      {discoveryCandidates.length ? discoveryCandidates.map((item: any) => (
                        <div key={item.candidateKey} className="rounded-lg border border-[var(--border)] bg-white p-3">
                          <p className="text-sm font-bold">{item.candidate?.programme || "Programme"}</p>
                          <p className="text-xs text-slate-600">
                            {item.candidate?.institution || "Établissement"}
                            {item.candidate?.city ? ` · ${item.candidate.city}` : ""}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-slate-600">
                            {item.candidate?.discoveryReason || "Raison de découverte non disponible."}
                          </p>
                          {Array.isArray(item.candidate?.sourceUrls) && item.candidate.sourceUrls.length ? (
                            <div className="mt-2 space-y-1">
                              {item.candidate.sourceUrls.slice(0, 3).map((url: string) => (
                                <a key={url} href={url} target="_blank" rel="noreferrer" className="block truncate text-xs font-semibold underline">
                                  {url}
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )) : (
                        <p className="text-xs leading-5 text-slate-600">Aucun candidat A disponible pour cette revue.</p>
                      )}
                    </div>
                  </details>

                  <details className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <summary className="cursor-pointer text-sm font-bold">
                      B — faits vérifiés ({verificationProgrammes.length})
                    </summary>
                    <div className="mt-3 space-y-3">
                      {verificationProgrammes.length ? verificationProgrammes.map((item: any) => {
                        const verification = item.verification || {};
                        const candidate = verification.candidate || {};
                        return (
                          <div key={item.candidateKey} className="rounded-lg border border-[var(--border)] bg-white p-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <span className="min-w-0">
                                <span className="block text-sm font-bold">{candidate.programme || "Programme"}</span>
                                <span className="block text-xs text-slate-600">
                                  {candidate.institution || "Établissement"}
                                  {candidate.city ? ` · ${candidate.city}` : ""}
                                  {" · "}
                                  <strong>{verificationStatusLabels[verification.overallStatus] || verification.overallStatus || "inconnu"}</strong>
                                </span>
                              </span>
                              <Badge variant={selected.includes(item.candidateKey) ? "info" : "neutral"}>{selected.includes(item.candidateKey) ? "Retenu dans la sélection" : "Non retenu"}</Badge>
                            </div>
                            {Array.isArray(verification.facts) ? (
                              <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                {verification.facts.filter((fact: any) => fact.status !== "unknown").map((fact: any) => (
                                  <div key={fact.field} className="text-xs leading-5">
                                    <dt className="font-bold">{verificationFieldLabels[fact.field] || fact.field}</dt>
                                    <dd className="text-slate-600">
                                      {factValue(fact.value)} · {verificationStatusLabels[fact.status] || fact.status}
                                      {fact.sourceUrl ? (
                                        <>
                                          {" · "}
                                          <a href={fact.sourceUrl} target="_blank" rel="noreferrer" className="underline">source</a>
                                        </>
                                      ) : null}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            ) : null}
                          </div>
                        );
                      }) : (
                        <p className="text-xs leading-5 text-slate-600">Aucun programme n’a atteint B pour cette revue.</p>
                      )}
                    </div>
                  </details>
                </div>

                <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
                  <section className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4">
                    <p className="text-sm font-bold">C — shortlist déterministe</p>
                    <div className="mt-3 space-y-3">
                      {selectionItems.length ? selectionItems.map((item: any) => {
                        const verified = verificationProgrammes.find((candidate: any) => candidate.candidateKey === item.candidateKey);
                        return (
                          <div key={item.candidateKey} className="rounded-lg bg-[var(--surface-subtle)] p-3">
                            <p className="text-sm font-bold">
                              {item.position}. {verified?.verification?.candidate?.programme || item.candidateKey.slice(0, 8)}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              Raisons : {Array.isArray(item.reasons) && item.reasons.length ? item.reasons.join(", ") : "—"}
                            </p>
                            <p className="text-xs leading-5 text-slate-600">
                              Alertes : {Array.isArray(item.warnings) && item.warnings.length ? item.warnings.join(", ") : "—"}
                            </p>
                            <p className="text-xs leading-5 text-slate-600">
                              Inconnus : {Array.isArray(item.missingFacts) && item.missingFacts.length ? item.missingFacts.join(", ") : "—"}
                            </p>
                          </div>
                        );
                      }) : (
                        <p className="text-xs leading-5 text-slate-600">C n’a pas produit de shortlist exploitable.</p>
                      )}
                    </div>
                  </section>

                  <section className="rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/45 p-4">
                    <p className="text-sm font-bold">D — texte généré</p>
                    <p className="mt-2 text-sm font-semibold leading-6">{writer.opening || "Aucun texte D."}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-700">{writer.projectStatus || ""}</p>
                    {writer.mainPriority ? (
                      <div className="mt-3 rounded-lg bg-white p-3">
                        <p className="text-xs font-bold">{writer.mainPriority.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{writer.mainPriority.text}</p>
                        <p className="mt-1 text-xs font-semibold leading-5">{writer.mainPriority.nextStep}</p>
                      </div>
                    ) : null}
                    {Array.isArray(writer.studyOptions) && writer.studyOptions.length ? (
                      <div className="mt-3 space-y-2">
                        {writer.studyOptions.map((option: any) => (
                          <div key={option.optionId} className="rounded-lg bg-white p-3 text-xs">
                            <p className="font-bold">{option.programme} · {option.institution}</p>
                            <p className="mt-1 leading-5 text-slate-600">{option.whyItFits}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                </div>


                  </div>
                </details>
                </details>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
