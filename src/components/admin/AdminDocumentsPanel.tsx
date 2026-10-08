"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminWorkflowSection } from "@/components/admin/AdminWorkflowSection";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
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

  const reviewCount = documents.filter((document) => ["pending", "reviewed"].includes(document.status)).length;
  const waitingStudentCount = documents.filter((document) => ["replace_required", "rejected"].includes(document.status)).length;
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

  async function deleteDocument(document: AdminDocument) {
    const confirmed = window.confirm(
      `Supprimer définitivement « ${document.original_filename} » ? Le fichier sera retiré du stockage privé et cette action est irréversible.`,
    );
    if (!confirmed) return;

    setBusy(document.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/documents/${document.id}`, {
        method: "DELETE",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice({
          tone: "error",
          text: result.error || "Impossible de supprimer définitivement ce document pour le moment.",
        });
        return;
      }

      setNotice({
        tone: "success",
        text: "Le document et son fichier privé ont été supprimés définitivement.",
      });
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        text: "Impossible de supprimer définitivement ce document pour le moment. Vérifiez votre connexion puis réessayez.",
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
      <div className="space-y-5">
      <Card className="pc-card shadow-none">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              File documentaire
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">
              {reviewCount
                ? `${reviewCount} document${reviewCount > 1 ? "s" : ""} attend${reviewCount > 1 ? "ent" : ""} une décision`
                : waitingStudentCount
                  ? `${waitingStudentCount} document${waitingStudentCount > 1 ? "s" : ""} attend${waitingStudentCount > 1 ? "ent" : ""} l’étudiant`
                  : "La file documentaire est à jour"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              La file montre uniquement la version actuelle de chaque type de pièce. Les anciennes versions restent disponibles dans le Dossier 360° de l’étudiant.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] grid-cols-2 sm:grid-cols-4 xl:min-w-[36rem]">
            <QueueSummary label="Versions actuelles" value={documents.length} />
            <QueueSummary label="À décider" value={reviewCount} tone={reviewCount ? "warning" : undefined} />
            <QueueSummary label="Validés" value={approvedCount} />
            <QueueSummary label="Attend étudiant" value={waitingStudentCount} tone={waitingStudentCount ? "warning" : undefined} />
          </div>
        </div>
      </Card>

      {evidenceLoadError && (
        <p role="alert" className="rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
          Les classifications académiques sont temporairement indisponibles. La revue des fichiers reste accessible.
        </p>
      )}

      {notice && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={
            "rounded-[var(--radius-control)] border p-3.5 text-sm " +
            (notice.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800")
          }
        >
          {notice.text}
        </p>
      )}

      {documents.length === 0 ? (
        <PremiumEmptyState
          eyebrow="File documentaire"
          title="Aucun document n’est disponible actuellement."
          description="Les nouvelles pièces à vérifier ou déjà approuvées apparaîtront ici automatiquement."
          compact
        />
      ) : (
        <section className="space-y-5" aria-label="Documents et preuves académiques">
          {documents.map((document, index) => {
            const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles;
            const studentName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Étudiant";
            const isReplacement = document.status === "replace_required";
            const isRejected = document.status === "rejected";
            const isWaitingStudent = isReplacement || isRejected;
            const isApproved = document.status === "approved";
            const needsDecision = document.status === "pending" || document.status === "reviewed";
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
                className={`min-w-0 overflow-hidden ${isWaitingStudent ? "border-[var(--warning-border)] bg-[var(--premium-gold-wash)]/35" : "bg-white"}`}
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={isWaitingStudent ? "warning" : isApproved ? "success" : "info"}>
                        {isReplacement
                          ? "Remplacement demandé"
                          : isRejected
                            ? "Rejeté · correction attendue"
                            : isApproved
                              ? "Document approuvé"
                              : "À vérifier"}
                      </Badge>
                      <span className="text-xs font-semibold text-[var(--muted)]">File #{index + 1}</span>
                    </div>

                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                      {studentName}
                    </p>
                    <h2
                      id={`admin-document-title-${document.id}`}
                      className="mt-1 text-xl font-bold tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]"
                    >
                      {document.original_filename}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
                      href={`/admin/dossiers/${document.student_id}`}
                      className={buttonClassName("ghost", "h-fit shrink-0 self-start px-3")}
                    >
                      Dossier 360°
                    </Link>
                    <a
                      href={`/api/admin/documents/${document.id}/view`}
                      aria-label={`Ouvrir ${document.original_filename} dans un nouvel onglet`}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClassName("secondary", "h-fit shrink-0 self-start")}
                    >
                      Ouvrir le document
                    </a>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <AdminWorkflowSection
                    step="A"
                    title="Fichier soumis"
                    description="Identité de la pièce et dernier état enregistré."
                    defaultOpen
                  >
                    <dl className="grid gap-3 sm:grid-cols-3">
                      <DocumentFact label="Type" value={categoryLabel(document.category)} />
                      <DocumentFact label="Statut" value={statusLabel(document.status)} />
                      <DocumentFact label="Envoyé le" value={formatCreatedAt(document.created_at)} />
                    </dl>

                    {document.admin_comment ? (
                      <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700">Message actuellement enregistré</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                          {document.admin_comment}
                        </p>
                      </div>
                    ) : null}
                  </AdminWorkflowSection>

                  <AdminWorkflowSection
                    step="B"
                    title="Message étudiant"
                    description="Rédigez uniquement ce que l’étudiant peut lire dans son espace."
                    badge={<Badge variant="info">Visible étudiant</Badge>}
                    defaultOpen={needsDecision}
                    tone="brand"
                  >
                    <label className="block text-sm font-semibold text-slate-700">
                      Commentaire de revue
                      <textarea
                        value={comments[document.id] || ""}
                        onChange={(event) =>
                          setComments((current) => ({ ...current, [document.id]: event.target.value }))
                        }
                        maxLength={2000}
                        disabled={isBusy}
                        className="field mt-2 min-h-24 resize-y bg-white"
                        placeholder="Expliquez clairement la correction demandée. Le commentaire est obligatoire pour un rejet ou un remplacement."
                      />
                    </label>
                  </AdminWorkflowSection>

                  <AdminWorkflowSection
                    step="C"
                    title="Preuve de parcours"
                    description="L’approbation du fichier et son acceptation comme preuve de parcours sont deux décisions distinctes. Classez la pièce uniquement si elle doit servir de preuve académique."
                    badge={
                      currentEvidence ? (
                        <Badge variant={evidenceStatusVariant(currentEvidence.verification_status)}>
                          {evidenceStatusLabel(currentEvidence.verification_status)}
                        </Badge>
                      ) : undefined
                    }
                    defaultOpen={Boolean(currentEvidence)}
                  >
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
                      Classification académique
                    </p>

                    {linkedEvidence.length > 1 ? (
                      <p className="mb-3 text-xs leading-5 text-amber-800">
                        Plusieurs classifications sont liées à ce fichier. Le formulaire ci-dessous modifie la classification la plus récemment chargée.
                      </p>
                    ) : null}

                    {currentEvidence ? (
                      <div className="mb-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {evidenceTypeLabel(currentEvidence.type)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {currentEvidence.assessment.reason}
                        </p>
                      </div>
                    ) : null}

                    <div className="grid gap-4 lg:grid-cols-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Type de preuve
                        <select
                          className="field mt-2 bg-white"
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
                          className="field mt-2 bg-white"
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
                          className="field mt-2 bg-white"
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

                    {!isApproved ? (
                      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                        Le fichier doit d’abord être approuvé dans la revue documentaire avant de pouvoir être accepté comme preuve de parcours.
                      </p>
                    ) : null}
                  </AdminWorkflowSection>

                  <AdminWorkflowSection
                    step="D"
                    title="Décision documentaire"
                    description="Validez la pièce ou laissez le dossier dans un état qui exige une action."
                    defaultOpen={needsDecision}
                    tone="brand"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-sm leading-6 text-slate-600">
                          {needsDecision
                            ? "Approuver valide la pièce. Un remplacement ou un rejet transfère la prochaine action à l’étudiant."
                            : isWaitingStudent
                              ? "La décision actuelle attend une nouvelle pièce de l’étudiant. Rouvrez cette décision seulement si vous devez la corriger."
                              : "Cette pièce est déjà validée. Une nouvelle décision doit rester exceptionnelle et traçable."}
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

                    <details className="mt-4 border-t border-red-100 pt-4">
                      <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.12em] text-red-700">
                        Action sensible
                      </summary>
                      <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-600">
                        La suppression définitive est séparée de la décision de revue afin d’éviter une action destructive accidentelle.
                      </p>
                      <Button
                        type="button"
                        disabled={isBusy}
                        onClick={() => deleteDocument(document)}
                        variant="secondary"
                        className="mt-3 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                      >
                        Supprimer définitivement
                      </Button>
                    </details>
                  </AdminWorkflowSection>
                </div>
              </Card>
            );
          })}
        </section>
      )}
      </div>
    </div>
  );
}

function QueueSummary({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "warning" | "neutral";
}) {
  return (
    <div className={`bg-white p-3 sm:p-4 ${tone === "warning" && value ? "bg-amber-50/70" : ""}`}>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function DocumentFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900 [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
