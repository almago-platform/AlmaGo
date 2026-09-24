"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  categoryLabel,
  documentCategories,
  removableDocumentStatuses,
  statusLabel,
} from "@/lib/documents";

type StudentDocument = {
  id: string;
  category: string;
  original_filename: string;
  size_bytes: number;
  status: string;
  admin_comment: string | null;
  created_at: string;
};

type HistoryEvent = { id: string; message: string; created_at: string };
type Feedback = { message: string; kind: "success" | "error" } | null;

function statusVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "approved") return "success";
  if (status === "rejected" || status === "replace_required") return "warning";
  if (status === "pending" || status === "reviewed") return "info";
  return "neutral";
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MiB`;
  return `${Math.ceil(sizeBytes / 1024)} Ko`;
}

export function DocumentsPanel({
  documents,
  history,
  historyLoadError = false,
}: {
  documents: StudentDocument[];
  history: HistoryEvent[];
  historyLoadError?: boolean;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("passport");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  const approvedCount = documents.filter((document) => document.status === "approved").length;
  const reviewCount = documents.filter((document) => ["pending", "reviewed"].includes(document.status)).length;
  const correctionDocuments = documents.filter((document) => ["rejected", "replace_required"].includes(document.status));
  const correctionCount = correctionDocuments.length;
  const latestDocument = documents[0];
  const priorityDocument = correctionDocuments[0] || documents.find((document) => document.status === "pending") || latestDocument;

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    const file = fileInput.current?.files?.[0];

    if (!file) {
      setFeedback({ message: "Choisissez un fichier avant de continuer.", kind: "error" });
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("file", file);

      const response = await fetch("/api/student/documents/upload", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({ message: result.error || "Impossible d’envoyer le document.", kind: "error" });
        return;
      }

      if (fileInput.current) fileInput.current.value = "";
      setFeedback({ message: "Votre fichier est bien enregistré. Son statut sera mis à jour après vérification.", kind: "success" });
      router.refresh();
    } catch {
      setFeedback({ message: "Erreur réseau. Vérifiez votre connexion puis réessayez.", kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function removeDocument(id: string) {
    if (!window.confirm("Voulez-vous supprimer ce document ?")) return;

    setBusy(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/student/documents/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({ message: result.error || "Impossible de supprimer le document.", kind: "error" });
        return;
      }

      setFeedback({ message: "Le document a bien été supprimé de votre dossier.", kind: "success" });
      router.refresh();
    } catch {
      setFeedback({ message: "Erreur réseau. Vérifiez votre connexion puis réessayez.", kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section aria-label="Priorité documentaire" className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.85fr)]">
        <Card className={`relative overflow-hidden shadow-[0_24px_55px_-38px_rgba(41,48,139,0.5)] ${correctionCount ? "border-amber-300 bg-amber-50/25" : "border-[var(--brand-border)] bg-white"}`}>
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
          <div className="pl-2">
          <Badge variant={correctionCount ? "warning" : reviewCount ? "info" : "neutral"}>
            {correctionCount ? "Correction demandée" : reviewCount ? "En attente de vérification" : "Dossier documentaire"}
          </Badge>
          <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
            {correctionCount ? "Une action est nécessaire sur vos documents" : reviewCount ? "Vos documents sont en cours de vérification" : "Votre dossier documentaire"}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            {correctionCount
              ? `${correctionCount} document${correctionCount > 1 ? "s doivent" : " doit"} être corrigé${correctionCount > 1 ? "s" : ""}. Consultez le message AlmaGo avant de remplacer le fichier.`
              : reviewCount
                ? "Aucune action n’est demandée de votre côté pendant cette vérification. Les retours apparaîtront sur cette page."
                : documents.length
                  ? "Aucune correction n’est demandée actuellement. Vous pouvez ajouter une nouvelle pièce lorsqu’elle est nécessaire."
                  : "Vous n’avez encore ajouté aucun document. Lorsque votre dossier nécessitera une pièce, vous pourrez la déposer ci-dessous."}
          </p>
          {priorityDocument && (
            <div className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Document suivi</p>
                <Badge variant={statusVariant(priorityDocument.status)}>{statusLabel(priorityDocument.status)}</Badge>
              </div>
              <p className="mt-3 break-words font-bold text-slate-950">{priorityDocument.original_filename}</p>
              <p className="mt-1 text-sm text-slate-600">{categoryLabel(priorityDocument.category)}</p>
              {correctionCount > 0 && priorityDocument.admin_comment && (
                <div className="mt-4 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-3.5">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-900">Pourquoi cette correction ?</p>
                  <p className="mt-1.5 text-sm leading-6 text-amber-900">{priorityDocument.admin_comment}</p>
                </div>
              )}
            </div>
          )}
          </div>
        </Card>

        <section aria-label="Résumé des documents" className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <SummaryCard id="documents-summary-approved" title="Validés" value={approvedCount} badge="Conformes" tone="success" />
          <SummaryCard id="documents-summary-review" title="En vérification" value={reviewCount} badge="Chez AlmaGo" tone="info" />
          <SummaryCard id="documents-summary-correction" title="À corriger" value={correctionCount} badge={correctionCount ? "Action requise" : "Rien à signaler"} tone={correctionCount ? "warning" : "neutral"} />
        </section>
      </section>

      <Card aria-labelledby="document-upload-title" className="overflow-hidden shadow-none">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <Badge variant="neutral">Nouveau fichier</Badge>
            <h2 id="document-upload-title" className="mt-3 text-xl font-bold text-slate-950">Ajouter un document</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Trois étapes simples. PDF, JPEG ou PNG · 10 MiB maximum. Les fichiers sont conservés dans un espace privé.
            </p>
          </div>
        </div>

        <form onSubmit={upload} className="mt-6">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr_auto] lg:items-end">
            <label className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4 text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--brand)] text-[10px] text-white">1</span>
                Choisir le type
              </span>
              Type de document
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={busy}
                className="field"
              >
                {documentCategories.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4 text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--brand)] text-[10px] text-white">2</span>
                Choisir le fichier
              </span>
              Fichier à envoyer
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
                disabled={busy}
                className="field"
              />
            </label>

            <div className="rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-white p-4">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--brand)] text-[10px] text-white">3</span>
                Envoyer
              </span>
              <Button type="submit" disabled={busy} className="w-full justify-center lg:w-auto">
                {busy ? "Envoi en cours…" : "Envoyer le document"}
              </Button>
            </div>
          </div>

          {feedback && (
            <p
              role={feedback.kind === "error" ? "alert" : "status"}
              className={"mt-4 rounded-[var(--radius-control)] border p-3.5 text-sm " + (
                feedback.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand)]"
              )}
            >
              {feedback.message}
            </p>
          )}

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Un remplacement ne supprime pas automatiquement les anciens fichiers validés.
          </p>
        </form>
      </Card>

      <section aria-labelledby="documents-list-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 id="documents-list-title" className="text-2xl font-semibold tracking-tight text-slate-950">Mes documents</h2>
            <p className="mt-1 text-sm text-slate-600">{documents.length} document{documents.length > 1 ? "s" : ""} dans votre dossier.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {documents.length === 0 ? (
            <Card aria-labelledby="documents-empty-title" className="border-dashed bg-white/70 py-8 text-center">
              <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-lg text-[var(--brand)]">+</span>
              <h3 id="documents-empty-title" className="mt-4 font-bold text-slate-950">Vous n’avez encore ajouté aucun document.</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Lorsque votre dossier nécessitera une pièce, vous pourrez la déposer avec le formulaire ci-dessus.</p>
            </Card>
          ) : (
            documents.map((document) => (
              <Card as="article" key={document.id} aria-labelledby={`student-document-title-${document.id}`} className={`shadow-none ${["rejected", "replace_required"].includes(document.status) ? "border-amber-300 bg-amber-50/20" : ""}`}>
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(document.status)}>{statusLabel(document.status)}</Badge>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{categoryLabel(document.category)}</span>
                    </div>
                    <h3 id={`student-document-title-${document.id}`} className="mt-3 break-words text-lg font-semibold text-slate-950">{document.original_filename}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatFileSize(document.size_bytes)} · envoyé le{" "}
                      <time dateTime={document.created_at}>
                        {new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(new Date(document.created_at))}
                      </time>
                    </p>
                    {document.admin_comment && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <h4 className="text-sm font-semibold text-amber-950">Message pour ce document</h4>
                        <p className="mt-1 text-sm leading-6 text-amber-900">{document.admin_comment}</p>
                        <p className="mt-2 text-xs leading-5 text-amber-800">
                          Ce commentaire est destiné à votre espace étudiant et concerne uniquement ce document.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
                    <a
                      href={`/api/documents/${document.id}/view`}
                      aria-label={`Ouvrir ${document.original_filename} (nouvel onglet)`}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClassName("secondary")}
                    >
                      Ouvrir
                    </a>
                    {removableDocumentStatuses.includes(
                      document.status as (typeof removableDocumentStatuses)[number],
                    ) && (
                      <Button
                        type="button"
                        aria-label={`Supprimer ${document.original_filename}`}
                        onClick={() => removeDocument(document.id)}
                        disabled={busy}
                        variant="secondary"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section aria-labelledby="document-history-title">
        <h2 id="document-history-title" className="text-2xl font-semibold tracking-tight text-slate-950">
          Historique visible du dossier
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Cette chronologie reprend les décisions et demandes communiquées dans votre espace. Les notes internes de l’équipe n’y apparaissent pas.
        </p>
        <div className="mt-4 space-y-2">
          {historyLoadError ? (
            <Card>
              <p role="alert" className="text-sm text-red-800">Historique indisponible pour le moment. Réessayez dans quelques instants.</p>
            </Card>
          ) : history.length === 0 ? (
            <Card aria-labelledby="document-history-empty-title" className="border-dashed">
              <p id="document-history-empty-title" className="text-sm text-slate-600">
                Les décisions et mises à jour qui vous sont communiquées apparaîtront ici.
              </p>
            </Card>
          ) : (
            history.map((event) => (
              <Card as="article" key={event.id} aria-labelledby={`document-event-title-${event.id}`} className="p-4 shadow-none">
                <h3 id={`document-event-title-${event.id}`} className="text-sm font-medium text-slate-700">{event.message}</h3>
                <time dateTime={event.created_at} className="mt-1 block text-xs text-slate-500">
                  {new Intl.DateTimeFormat("fr-TN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(event.created_at))}
                </time>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ id, title, value, badge, tone }: { id: string; title: string; value: number; badge: string; tone: "success" | "info" | "warning" | "neutral" }) {
  return (
    <Card aria-labelledby={id} className="shadow-none">
      <h2 id={id} className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}
