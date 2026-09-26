"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { categoryLabel, reviewStatuses, statusLabel } from "@/lib/documents";

type AdminDocument = {
  id: string;
  student_id: string;
  category: string;
  original_filename: string;
  status: string;
  admin_comment: string | null;
  created_at: string;
  profiles:
    | { first_name: string | null; last_name: string | null }
    | { first_name: string | null; last_name: string | null }[]
    | null;
};

type AdminEvidence = {
  id: string;
  student_id: string;
  type: string;
  institution: string | null;
  evidence_date: string | null;
  origin: string;
  verification_status: string;
  document_id: string | null;
  document_status: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  assessment: {
    status: string;
    basis: string;
    can_support_pathway_decision: boolean;
    reason: string;
  };
};

type EvidenceEdit = {
  evidenceType: string;
  institution: string;
  evidenceDate: string;
};

type Notice = {
  text: string;
  tone: "success" | "error";
};

function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date non disponible";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function evidenceTypeLabel(type: string) {
  return ({
    definitive_admission: "Admission définitive",
    conditional_admission: "Admission conditionnelle",
    bewerberbestaetigung: "Bewerberbestätigung",
    admissible_university_correspondence: "Correspondance universitaire admissible",
  } as Record<string, string>)[type] || type;
}

function evidenceStatusLabel(status: string) {
  return ({
    received: "Reçue",
    needs_review: "À vérifier",
    accepted_for_pathway: "Acceptée comme preuve de parcours",
    replace_required: "Preuve à remplacer",
  } as Record<string, string>)[status] || status;
}

function evidenceStatusVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "accepted_for_pathway") return "success";
  if (status === "replace_required") return "warning";
  if (status === "received" || status === "needs_review") return "info";
  return "neutral";
}

export function AdminDocumentsPanel({
  documents,
  evidence,
  evidenceLoadError = false,
}: {
  documents: AdminDocument[];
  evidence: AdminEvidence[];
  evidenceLoadError?: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [evidenceEdits, setEvidenceEdits] = useState<Record<string, EvidenceEdit>>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const pendingCount = documents.filter((document) => document.status === "pending").length;
  const replacementCount = documents.filter((document) => document.status === "replace_required").length;
  const approvedCount = documents.filter((document) => document.status === "approved").length;

  async function review(id: string, status: (typeof reviewStatuses)[number]) {
    setBusy(id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/documents/${id}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, comment: comments[id] || "" }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice({
          tone: "error",
          text: result.error || "Nous n’arrivons pas à enregistrer cette revue pour le moment. Rien d’autre n’a été modifié.",
        });
        return;
      }

      setNotice({
        tone: "success",
        text: "La revue a bien été enregistrée. Le statut du document et le message destiné à l’étudiant sont maintenant à jour.",
      });
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        text: "Nous n’arrivons pas à enregistrer cette revue pour le moment. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function saveEvidence(
    document: AdminDocument,
    existing: AdminEvidence | undefined,
    edit: EvidenceEdit,
    verificationStatus: "needs_review" | "accepted_for_pathway" | "replace_required",
  ) {
    if (!edit.evidenceType) {
      setNotice({ tone: "error", text: "Choisissez d’abord le type de preuve académique." });
      return;
    }

    if (
      verificationStatus === "accepted_for_pathway"
      && (document.status !== "approved" || !edit.institution.trim() || !edit.evidenceDate)
    ) {
      setNotice({
        tone: "error",
        text: "Pour accepter une preuve de parcours, le document doit être approuvé et l’établissement ainsi que la date de la preuve doivent être renseignés.",
      });
      return;
    }

    if (
      verificationStatus === "accepted_for_pathway"
      && !window.confirm("Confirmer que ce document approuvé doit être accepté comme preuve académique de parcours ?")
    ) return;

    if (
      verificationStatus === "replace_required"
      && !window.confirm("Confirmer que cette classification académique doit être marquée comme preuve à remplacer ?")
    ) return;

    setBusy(document.id);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/academic-evidence", {
        method: existing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(existing ? { id: existing.id } : {}),
          student_id: document.student_id,
          evidence_type: edit.evidenceType,
          institution: edit.institution.trim() || null,
          evidence_date: edit.evidenceDate || null,
          origin: "official_document",
          verification_status: verificationStatus,
          document_id: document.id,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice({
          tone: "error",
          text: result.error || "Impossible d’enregistrer la classification académique.",
        });
        return;
      }

      setNotice({
        tone: "success",
        text: verificationStatus === "accepted_for_pathway"
          ? "La preuve académique a été acceptée comme preuve de parcours."
          : verificationStatus === "replace_required"
            ? "La classification académique indique maintenant qu’une preuve doit être remplacée."
            : "La classification académique a été enregistrée pour vérification.",
      });
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        text: "Impossible d’enregistrer la classification académique pour le moment. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Résumé de la file documentaire">
        <QueueSummary label="Documents visibles" value={documents.length} detail="Pièces disponibles pour la revue" />
        <QueueSummary label="En attente" value={pendingCount} detail="Première vérification à effectuer" />
        <QueueSummary label="Approuvés" value={approvedCount} detail="Pièces pouvant ensuite servir de preuve si elles sont classées" />
        <QueueSummary label="Remplacement demandé" value={replacementCount} detail="Dossiers qui restent à suivre" tone="warning" />
      </section>

      {evidenceLoadError && (
        <p role="alert" className="mb-5 rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
          Les classifications académiques sont temporairement indisponibles. La revue des fichiers reste accessible.
        </p>
      )}

      {notice && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={
            "mb-5 rounded-[var(--radius-control)] border p-3.5 text-sm " +
            (notice.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800")
          }
        >
          {notice.text}
        </p>
      )}

      {documents.length === 0 ? (
        <Card className="border-dashed bg-white/70 py-9 text-center shadow-none">
          <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-700">✓</span>
          <h2 className="mt-4 text-lg font-bold text-slate-950">Aucun document n’est disponible actuellement.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Les nouvelles pièces à vérifier ou déjà approuvées apparaîtront ici automatiquement.
          </p>
        </Card>
      ) : (
        <section className="space-y-5" aria-label="Documents et preuves académiques">
          {documents.map((document, index) => {
            const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles;
            const studentName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Étudiant";
            const isReplacement = document.status === "replace_required";
            const isApproved = document.status === "approved";
            const isBusy = busy === document.id;
            const linkedEvidence = evidence.filter((item) => item.document_id === document.id);
            const currentEvidence = linkedEvidence[0];
            const evidenceEdit = evidenceEdits[document.id] || {
              evidenceType: currentEvidence?.type || "",
              institution: currentEvidence?.institution || "",
              evidenceDate: currentEvidence?.evidence_date || "",
            };

            return (
              <Card
                as="article"
                key={document.id}
                aria-labelledby={`admin-document-title-${document.id}`}
                className={`min-w-0 overflow-hidden shadow-none ${isReplacement ? "border-amber-300 bg-amber-50/20" : "border-[var(--border)] bg-white"}`}
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={isReplacement ? "warning" : isApproved ? "success" : "info"}>
                        {isReplacement ? "Remplacement demandé" : isApproved ? "Document approuvé" : "À vérifier"}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-500">File #{index + 1}</span>
                    </div>

                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Étudiant</p>
                    <p className="mt-1 text-sm font-bold text-slate-950 [overflow-wrap:anywhere]">{studentName}</p>

                    <h2
                      id={`admin-document-title-${document.id}`}
                      className="mt-4 text-xl font-bold tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]"
                    >
                      {document.original_filename}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      <span className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1.5">{categoryLabel(document.category)}</span>
                      <span className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1.5">{statusLabel(document.status)}</span>
                      <span className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1.5">Envoyé le {formatCreatedAt(document.created_at)}</span>
                    </div>
                  </div>

                  <a
                    href={`/api/documents/${document.id}/view`}
                    aria-label={`Ouvrir ${document.original_filename} dans un nouvel onglet`}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonClassName("secondary", "h-fit shrink-0 self-start")}
                  >
                    Ouvrir le document
                  </a>
                </div>

                {document.admin_comment && (
                  <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Message actuellement enregistré</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{document.admin_comment}</p>
                  </div>
                )}

                <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/55 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Visible par l’étudiant</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Le commentaire envoyé avec cette revue peut apparaître dans l’espace étudiant.
                      </p>
                    </div>
                    <Badge variant="info">Message étudiant</Badge>
                  </div>

                  <label className="mt-4 block text-sm font-semibold text-slate-700">
                    Commentaire de revue
                    <textarea
                      value={comments[document.id] || ""}
                      onChange={(event) =>
                        setComments((current) => ({ ...current, [document.id]: event.target.value }))
                      }
                      maxLength={2000}
                      disabled={isBusy}
                      className="field min-h-28 resize-y"
                      placeholder="Expliquez clairement la correction demandée. Le commentaire est obligatoire pour un rejet ou un remplacement."
                    />
                  </label>
                </div>

                <section
                  aria-labelledby={`academic-evidence-admin-${document.id}`}
                  className="mt-5 rounded-[var(--radius-panel)] border border-slate-200 bg-[var(--surface-subtle)] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Classification académique
                      </p>
                      <h3 id={`academic-evidence-admin-${document.id}`} className="mt-1 text-lg font-bold text-slate-950">
                        Preuve de parcours
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        L’approbation du fichier et son acceptation comme preuve de parcours sont deux décisions distinctes. Accepter une preuve ici n’est ni une admission ni une décision de visa.
                      </p>
                    </div>
                    {currentEvidence && (
                      <Badge variant={evidenceStatusVariant(currentEvidence.verification_status)}>
                        {evidenceStatusLabel(currentEvidence.verification_status)}
                      </Badge>
                    )}
                  </div>

                  {linkedEvidence.length > 1 && (
                    <p className="mt-3 text-xs leading-5 text-amber-800">
                      Plusieurs classifications sont liées à ce fichier. Le formulaire ci-dessous modifie la classification la plus récemment chargée.
                    </p>
                  )}

                  {currentEvidence && (
                    <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {evidenceTypeLabel(currentEvidence.type)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {currentEvidence.assessment.reason}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Type de preuve
                      <select
                        className="field"
                        value={evidenceEdit.evidenceType}
                        disabled={isBusy || evidenceLoadError}
                        onChange={(event) =>
                          setEvidenceEdits((current) => ({
                            ...current,
                            [document.id]: { ...evidenceEdit, evidenceType: event.target.value },
                          }))
                        }
                      >
                        <option value="">Choisir le type</option>
                        <option value="definitive_admission">Admission définitive</option>
                        <option value="conditional_admission">Admission conditionnelle</option>
                        <option value="bewerberbestaetigung">Bewerberbestätigung</option>
                        <option value="admissible_university_correspondence">Correspondance universitaire admissible</option>
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Établissement
                      <input
                        className="field"
                        value={evidenceEdit.institution}
                        disabled={isBusy || evidenceLoadError}
                        maxLength={180}
                        onChange={(event) =>
                          setEvidenceEdits((current) => ({
                            ...current,
                            [document.id]: { ...evidenceEdit, institution: event.target.value },
                          }))
                        }
                        placeholder="Nom de l’établissement"
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Date de la preuve
                      <input
                        type="date"
                        className="field"
                        value={evidenceEdit.evidenceDate}
                        disabled={isBusy || evidenceLoadError}
                        onChange={(event) =>
                          setEvidenceEdits((current) => ({
                            ...current,
                            [document.id]: { ...evidenceEdit, evidenceDate: event.target.value },
                          }))
                        }
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isBusy || evidenceLoadError || !evidenceEdit.evidenceType}
                      onClick={() => saveEvidence(document, currentEvidence, evidenceEdit, "needs_review")}
                    >
                      Enregistrer à vérifier
                    </Button>
                    <Button
                      type="button"
                      disabled={
                        isBusy
                        || evidenceLoadError
                        || !evidenceEdit.evidenceType
                        || !isApproved
                        || !evidenceEdit.institution.trim()
                        || !evidenceEdit.evidenceDate
                      }
                      onClick={() => saveEvidence(document, currentEvidence, evidenceEdit, "accepted_for_pathway")}
                    >
                      Accepter comme preuve de parcours
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isBusy || evidenceLoadError || !evidenceEdit.evidenceType}
                      onClick={() => saveEvidence(document, currentEvidence, evidenceEdit, "replace_required")}
                    >
                      Marquer la preuve à remplacer
                    </Button>
                  </div>

                  {!isApproved && (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Le fichier doit d’abord être approuvé dans la revue documentaire avant de pouvoir être accepté comme preuve de parcours.
                    </p>
                  )}
                </section>

                <div className="mt-5 flex flex-col gap-4 border-t border-[var(--border)] pt-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Conséquence de la revue</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Approuver valide la pièce. Un remplacement ou un rejet conserve le dossier dans un état nécessitant une action ou un suivi.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
                    <Button
                      type="button"
                      disabled={isBusy}
                      onClick={() => review(document.id, "approved")}
                      className="w-full justify-center sm:w-auto"
                    >
                      {isBusy ? "Enregistrement…" : "Approuver"}
                    </Button>
                    <Button
                      type="button"
                      disabled={isBusy}
                      onClick={() => review(document.id, "replace_required")}
                      variant="secondary"
                      className="w-full justify-center sm:w-auto"
                    >
                      Demander un remplacement
                    </Button>
                    <Button
                      type="button"
                      disabled={isBusy}
                      onClick={() => review(document.id, "rejected")}
                      variant="secondary"
                      className="w-full justify-center sm:w-auto"
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

function QueueSummary({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: number;
  detail: string;
  tone?: "warning" | "neutral";
}) {
  return (
    <Card className={`shadow-none ${tone === "warning" && value ? "border-amber-200 bg-amber-50/35" : ""}`}>
      <p className="text-sm font-bold text-slate-700">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </Card>
  );
}
