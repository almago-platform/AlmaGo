"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { campusRouteOptions, campusRouteLabel } from "@/lib/campus-intake";

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
  studentResponseNote: string | null;
};

function labelForStatus(status: string) {
  if (status === "starter_documents") return "Pièces à compléter / valider";
  if (status === "campus_review") return "Prêt pour décision Campus Allemagne";
  if (status === "route_proposed") return "En attente de confirmation étudiant";
  if (status === "student_question") return "Étudiant souhaite en discuter";
  if (status === "procedure_created") return "Procédure créée";
  return status;
}

function docState(documents: IntakeCase["documents"], category: string) {
  const rows = documents.filter((document) => document.category === category);
  if (rows.some((document) => document.status === "approved")) return "Validé";
  if (rows.some((document) => ["replace_required", "rejected"].includes(document.status))) return "À remplacer";
  if (rows.some((document) => ["pending", "reviewed"].includes(document.status))) return "À vérifier";
  return "Manquant";
}

export function AdminIntakePanel({ cases }: { cases: IntakeCase[] }) {
  const router = useRouter();
  const [busyStudent, setBusyStudent] = useState<string | null>(null);
  const [routeByStudent, setRouteByStudent] = useState<Record<string, string>>({});
  const [reasonByStudent, setReasonByStudent] = useState<Record<string, string>>({});
  const [errorByStudent, setErrorByStudent] = useState<Record<string, string>>({});

  async function propose(item: IntakeCase) {
    const routeKey = routeByStudent[item.studentId] || item.proposedRouteKey || "";
    const reason = (reasonByStudent[item.studentId] ?? item.proposalReason ?? "").trim();

    setBusyStudent(item.studentId);
    setErrorByStudent((current) => ({ ...current, [item.studentId]: "" }));

    try {
      const response = await fetch(`/api/admin/intake/${item.studentId}/route`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ routeKey, reason }),
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

  return (
    <div className="grid gap-5">
      {cases.map((item) => {
        const preBac = item.orientation.bacStatus === "preparing";
        const ready = !preBac && ["passport", "baccalaureate", "transcripts"].every(
          (category) => docState(item.documents, category) === "Validé",
        );
        const canPropose = ready && item.status !== "procedure_created";
        const selectedRoute = routeByStudent[item.studentId] || item.proposedRouteKey || "";
        const reason = reasonByStudent[item.studentId] ?? item.proposalReason ?? "";

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
                {preBac ? "Préparation avant le Bac" : labelForStatus(item.status)}
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
                      Aucun Bac ni relevé final n’est attendu avant les résultats. Le passeport et la langue restent facultatifs s’ils sont déjà disponibles.
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

            {preBac ? (
              <section className="mt-5 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50/70 p-4">
                <h3 className="font-bold text-amber-950">Suivi avant le Bac</h3>
                <p className="mt-2 text-sm leading-6 text-amber-950">
                  Ne bloquez pas cet étudiant sur des pièces académiques qu’il ne possède pas encore. Le suivi peut continuer par les informations du profil et les échanges internes / e-mail. La proposition académique finale sera traitée après la mise à jour « Bac obtenu ».
                </p>
              </section>
            ) : item.status === "procedure_created" ? (
              <div className="mt-5 rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-900">
                  Parcours confirmé : {campusRouteLabel(item.proposedRouteKey)}
                </p>
                <p className="mt-1 text-sm text-emerald-900">
                  La procédure a été créée. Ce pré-dossier est terminé.
                </p>
              </div>
            ) : (
              <section className="mt-5 border-t border-[var(--border)] pt-5">
                <h3 className="font-bold">Décision Campus Allemagne</h3>
                {!ready ? (
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    Impossible de proposer un parcours tant que passeport, Bac et relevé de notes ne sont pas tous validés.
                  </p>
                ) : null}

                {item.status === "student_question" && item.studentResponseNote ? (
                  <div className="mt-3 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-4 text-sm">
                    <strong>Message de l’étudiant :</strong>
                    <p className="mt-1 leading-6">{item.studentResponseNote}</p>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(14rem,0.55fr)_minmax(0,1fr)]">
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
                        <option key={route.key} value={route.key}>{route.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-semibold">
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
                      placeholder="Expliquez simplement ce que les informations et les preuves du dossier montrent."
                    />
                  </label>
                </div>

                {errorByStudent[item.studentId] ? (
                  <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
                    {errorByStudent[item.studentId]}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={!canPropose || busyStudent === item.studentId || !selectedRoute || reason.trim().length < 3}
                  onClick={() => propose(item)}
                  className="mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyStudent === item.studentId
                    ? "Enregistrement…"
                    : item.proposedRouteKey
                      ? "Mettre à jour la proposition"
                      : "Envoyer la proposition à l’étudiant"}
                </button>
              </section>
            )}
          </article>
        );
      })}
    </div>
  );
}
