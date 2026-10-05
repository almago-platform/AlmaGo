"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { campusRouteOptions, campusRouteLabel } from "@/lib/campus-intake";
import { formatMinorCurrency } from "@/lib/money";

type IntakeCase = {
  studentId: string;
  name: string;
  email: string;
  status: string;
  orientation: {
    targetDegree: string;
    targetField: string;
    germanLevel: string;
    bacStatus: string;
    savedAt: string;
  };
  documents: Array<{ category: string; status: string }>;
  proposedRouteKey: string | null;
  proposalReason: string | null;
  proposedOfferVersionId: string | null;
  purchaseId: string | null;
  studentResponseNote: string | null;
  studentRespondedAt: string | null;
};

type PublishedOffer = {
  id: string;
  displayName: string;
  summary: string;
  services: string[];
  priceMinor: number;
  currency: string;
};

function labelForStatus(status: string) {
  if (status === "starter_documents") return "Pièces à compléter / valider";
  if (status === "campus_review") return "Prêt pour décision Campus Allemagne";
  if (status === "route_proposed") return "Proposition envoyée · réponse étudiant attendue";
  if (status === "student_question") return "Étudiant souhaite en discuter";
  if (status === "payment_pending") return "Proposition acceptée · paiement attendu";
  if (status === "paid_pending_validation") return "Paiement reçu · validation Campus";
  if (status === "procedure_created") return "Client actif · phase suivante créée";
  return status;
}


function formatResponseTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function docState(documents: IntakeCase["documents"], category: string) {
  const rows = documents.filter((document) => document.category === category);
  if (rows.some((document) => document.status === "approved")) return "Validé";
  if (rows.some((document) => ["replace_required", "rejected"].includes(document.status))) return "À remplacer";
  if (rows.some((document) => ["pending", "reviewed"].includes(document.status))) return "À vérifier";
  return "Manquant";
}

export function AdminIntakePanel({
  cases,
  offers,
}: {
  cases: IntakeCase[];
  offers: PublishedOffer[];
}) {
  const router = useRouter();
  const [busyStudent, setBusyStudent] = useState<string | null>(null);
  const [routeByStudent, setRouteByStudent] = useState<Record<string, string>>({});
  const [reasonByStudent, setReasonByStudent] = useState<Record<string, string>>({});
  const [offerByStudent, setOfferByStudent] = useState<Record<string, string>>({});
  const [errorByStudent, setErrorByStudent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (busyStudent) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 20_000);

    return () => window.clearInterval(intervalId);
  }, [busyStudent, router]);

  async function propose(item: IntakeCase) {
    const routeKey = routeByStudent[item.studentId] || item.proposedRouteKey || "";
    const reason = (reasonByStudent[item.studentId] ?? item.proposalReason ?? "").trim();
    const offerVersionId =
      offerByStudent[item.studentId] || item.proposedOfferVersionId || "";

    setBusyStudent(item.studentId);
    setErrorByStudent((current) => ({ ...current, [item.studentId]: "" }));

    try {
      const response = await fetch(`/api/admin/intake/${item.studentId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ routeKey, reason, offerVersionId }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorByStudent((current) => ({
          ...current,
          [item.studentId]: typeof result.error === "string" ? result.error : "Enregistrement impossible.",
        }));
        return;
      }

      router.refresh();
    } catch {
      setErrorByStudent((current) => ({
        ...current,
        [item.studentId]: "Connexion impossible.",
      }));
    } finally {
      setBusyStudent(null);
    }
  }

  if (!cases.length) {
    return (
      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-bold">Aucun pré-dossier à traiter</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Les étudiants apparaîtront ici après avoir confirmé leur orientation.
        </p>
      </section>
    );
  }

  const questionCount = cases.filter((item) => item.status === "student_question").length;
  const readyForDecisionCount = cases.filter((item) => item.status === "campus_review").length;
  const paymentValidationCount = cases.filter((item) => item.status === "paid_pending_validation").length;

  return (
    <div className="grid gap-5">
      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
              Coordination étudiant ↔ Campus
            </p>
            <h2 className="mt-1 text-lg font-bold">Les réponses étudiantes remontent dans cette file</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Les demandes de discussion sont prioritaires. Cette vue s’actualise automatiquement toutes les 20 secondes quand l’onglet est visible.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[var(--radius-control)] bg-amber-50 px-3 py-2">
              <p className="text-lg font-bold text-amber-900">{questionCount}</p>
              <p className="text-[11px] font-semibold text-amber-800">À discuter</p>
            </div>
            <div className="rounded-[var(--radius-control)] bg-blue-50 px-3 py-2">
              <p className="text-lg font-bold text-blue-900">{readyForDecisionCount}</p>
              <p className="text-[11px] font-semibold text-blue-800">À décider</p>
            </div>
            <div className="rounded-[var(--radius-control)] bg-emerald-50 px-3 py-2">
              <p className="text-lg font-bold text-emerald-900">{paymentValidationCount}</p>
              <p className="text-[11px] font-semibold text-emerald-800">Paiements</p>
            </div>
          </div>
        </div>
      </section>

      {cases.map((item) => {
        const preBac = item.orientation.bacStatus === "preparing";
        const academicReady = ["passport", "baccalaureate", "transcripts"].every(
          (category) => docState(item.documents, category) === "Validé",
        );
        const commercialLocked = [
          "payment_pending",
          "paid_pending_validation",
          "procedure_created",
        ].includes(item.status);
        const selectedRoute = routeByStudent[item.studentId] || item.proposedRouteKey || "";
        const selectedOfferId =
          offerByStudent[item.studentId] || item.proposedOfferVersionId || "";
        const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) || null;
        const reason = reasonByStudent[item.studentId] ?? item.proposalReason ?? "";
        const preBacRouteAllowed =
          !preBac
          || !selectedRoute
          || ["study_preparation", "standalone_language"].includes(selectedRoute);
        const canPropose =
          !commercialLocked
          && (preBac || academicReady)
          && preBacRouteAllowed
          && offers.length > 0;

        return (
          <article
            key={item.studentId}
            className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
                  Pré-dossier étudiant
                </p>
                <h2 className="mt-2 text-xl font-bold">{item.name || "Étudiant"}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.email || item.studentId}</p>
              </div>
              <span className="rounded-full bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-bold">
                {labelForStatus(item.status)}
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <section className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <h3 className="font-bold">Orientation confirmée</h3>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div><dt className="text-[var(--muted)]">Diplôme visé</dt><dd className="font-semibold">{item.orientation.targetDegree || "—"}</dd></div>
                  <div><dt className="text-[var(--muted)]">Domaine</dt><dd className="font-semibold">{item.orientation.targetField || "—"}</dd></div>
                  <div><dt className="text-[var(--muted)]">Allemand</dt><dd className="font-semibold">{item.orientation.germanLevel || "—"}</dd></div>
                  <div><dt className="text-[var(--muted)]">Situation Bac</dt><dd className="font-semibold">{item.orientation.bacStatus || "—"}</dd></div>
                </dl>
              </section>

              <section className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold">Pièces de départ</h3>
                  <a href="/admin/documents" className="text-xs font-bold text-[var(--brand-strong)] underline underline-offset-4">
                    Ouvrir Documents
                  </a>
                </div>
                {preBac ? (
                  <>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      Aucun Bac ni relevé final n’est exigé pour une proposition de préparation avant les résultats.
                    </p>
                    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <div><dt className="text-[var(--muted)]">Passeport</dt><dd className="font-semibold">{docState(item.documents, "passport")} <span className="font-normal text-[var(--muted)]">(facultatif)</span></dd></div>
                      <div><dt className="text-[var(--muted)]">Langue</dt><dd className="font-semibold">{docState(item.documents, "language_certificate")} <span className="font-normal text-[var(--muted)]">(facultatif)</span></dd></div>
                    </dl>
                  </>
                ) : (
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div><dt className="text-[var(--muted)]">Passeport</dt><dd className="font-semibold">{docState(item.documents, "passport")}</dd></div>
                    <div><dt className="text-[var(--muted)]">Baccalauréat</dt><dd className="font-semibold">{docState(item.documents, "baccalaureate")}</dd></div>
                    <div><dt className="text-[var(--muted)]">Relevé de notes</dt><dd className="font-semibold">{docState(item.documents, "transcripts")}</dd></div>
                    <div><dt className="text-[var(--muted)]">Langue</dt><dd className="font-semibold">{docState(item.documents, "language_certificate")} <span className="font-normal text-[var(--muted)]">(facultatif)</span></dd></div>
                  </dl>
                )}
              </section>
            </div>

            {item.status === "procedure_created" ? (
              <div className="mt-5 rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-900">
                  Client actif : {campusRouteLabel(item.proposedRouteKey)}
                </p>
                <p className="mt-1 text-sm text-emerald-900">
                  Paiement validé. La procédure et la phase suivante ont été créées.
                </p>
              </div>
            ) : commercialLocked ? (
              <section className="mt-5 rounded-[var(--radius-control)] border border-blue-200 bg-blue-50/70 p-4">
                <h3 className="font-bold text-blue-950">{labelForStatus(item.status)}</h3>
                <p className="mt-2 text-sm leading-6 text-blue-950">
                  {item.status === "payment_pending"
                    ? "L’étudiant a accepté la proposition. La phase suivante reste verrouillée jusqu’au paiement reçu puis validé."
                    : "Le paiement a été enregistré. Validez-le depuis la file Paiements pour activer le client et créer la phase suivante."}
                </p>
                {item.purchaseId ? (
                  <a
                    href="/admin/payments"
                    className="mt-3 inline-flex text-sm font-bold text-blue-900 underline underline-offset-4"
                  >
                    Ouvrir les paiements
                  </a>
                ) : null}
              </section>
            ) : (
              <section className="mt-5 border-t border-[var(--border)] pt-5">
                <h3 className="font-bold">Proposition Campus Allemagne</h3>

                {preBac ? (
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    Avant le Bac, vous pouvez proposer uniquement « Préparation aux études » ou « Langue seule ». Aucun document académique final n’est requis.
                  </p>
                ) : !academicReady ? (
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    Passeport, Bac et relevé de notes doivent être validés avant une proposition académique.
                  </p>
                ) : null}

                {!offers.length ? (
                  <p className="mt-3 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
                    Aucune offre commerciale publiée. Publiez d’abord une offre avant d’envoyer une proposition.
                  </p>
                ) : null}

                {item.status === "student_question" ? (
                  <div className="mt-3 rounded-[var(--radius-control)] border border-amber-300 bg-amber-50 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-amber-950">Réponse étudiant reçue · action requise</strong>
                      {formatResponseTime(item.studentRespondedAt) ? (
                        <span className="text-xs font-semibold text-amber-800">
                          Reçu le {formatResponseTime(item.studentRespondedAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 leading-6 text-amber-950">
                      {item.studentResponseNote || "L’étudiant souhaite discuter de la proposition sans message complémentaire."}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Parcours proposé
                    <select
                      className="field mt-2"
                      value={selectedRoute}
                      disabled={!canPropose || busyStudent === item.studentId}
                      onChange={(event) =>
                        setRouteByStudent((current) => ({
                          ...current,
                          [item.studentId]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Choisir un parcours</option>
                      {campusRouteOptions.map((route) => (
                        <option
                          key={route.key}
                          value={route.key}
                          disabled={preBac && !["study_preparation", "standalone_language"].includes(route.key)}
                        >
                          {route.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-semibold">
                    Offre commerciale
                    <select
                      className="field mt-2"
                      value={selectedOfferId}
                      disabled={!canPropose || busyStudent === item.studentId}
                      onChange={(event) =>
                        setOfferByStudent((current) => ({
                          ...current,
                          [item.studentId]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Choisir une offre publiée</option>
                      {offers.map((offer) => (
                        <option key={offer.id} value={offer.id}>
                          {offer.displayName} · {formatMinorCurrency(offer.priceMinor, offer.currency, "fr-FR") ?? "—"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {selectedOffer ? (
                  <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{selectedOffer.displayName}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{selectedOffer.summary}</p>
                      </div>
                      <p className="font-bold">{formatMinorCurrency(selectedOffer.priceMinor, selectedOffer.currency, "fr-FR") ?? "—"}</p>
                    </div>
                    <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                      {selectedOffer.services.map((service) => (
                        <li key={service}>✓ {service}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <label className="mt-4 block text-sm font-semibold">
                  Pourquoi ce parcours ?
                  <textarea
                    className="field mt-2"
                    rows={3}
                    maxLength={1200}
                    value={reason}
                    disabled={!canPropose || busyStudent === item.studentId}
                    onChange={(event) =>
                      setReasonByStudent((current) => ({
                        ...current,
                        [item.studentId]: event.target.value,
                      }))
                    }
                    placeholder="Expliquez simplement ce que Campus Allemagne propose et pourquoi."
                  />
                </label>

                {errorByStudent[item.studentId] ? (
                  <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
                    {errorByStudent[item.studentId]}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={
                    !canPropose
                    || busyStudent === item.studentId
                    || !selectedRoute
                    || !selectedOfferId
                    || reason.trim().length < 3
                  }
                  onClick={() => propose(item)}
                  className="mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyStudent === item.studentId
                    ? "Enregistrement…"
                    : item.proposedRouteKey
                      ? "Mettre à jour la proposition"
                      : "Envoyer parcours + offre à l’étudiant"}
                </button>
              </section>
            )}
          </article>
        );
      })}
    </div>
  );
}
