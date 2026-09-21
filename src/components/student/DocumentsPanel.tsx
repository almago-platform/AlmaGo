"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
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

export function DocumentsPanel({
  documents,
  history,
  loadError,
}: {
  documents: StudentDocument[];
  history: HistoryEvent[];
  loadError?: string;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("passport");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  const approvedCount = documents.filter((document) => document.status === "approved").length;
  const reviewCount = documents.filter((document) => ["pending", "reviewed"].includes(document.status)).length;
  const correctionCount = documents.filter((document) =>
    ["rejected", "replace_required"].includes(document.status),
  ).length;

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    const file = fileInput.current?.files?.[0];

    if (!file) {
      setFeedback({ message: "Choisis un fichier.", kind: "error" });
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
      setFeedback({ message: "Document envoyé. AlmaGo le vérifiera prochainement.", kind: "success" });
      router.refresh();
    } catch {
      setFeedback({ message: "Erreur réseau. Vérifie ta connexion puis réessaie.", kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function removeDocument(id: string) {
    if (!window.confirm("Supprimer ce document ?")) return;

    setBusy(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/student/documents/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({ message: result.error || "Impossible de supprimer le document.", kind: "error" });
        return;
      }

      setFeedback({ message: "Document supprimé.", kind: "success" });
      router.refresh();
    } catch {
      setFeedback({ message: "Erreur réseau. Vérifie ta connexion puis réessaie.", kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-7">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}
        </div>
      )}

      <section aria-label="Résumé des documents" className="grid gap-4 sm:grid-cols-3">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700">Validés</h3>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{approvedCount}</p>
          <div className="mt-3"><Badge variant="success">Conformes</Badge></div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-slate-700">En vérification</h3>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{reviewCount}</p>
          <div className="mt-3"><Badge variant="info">Chez AlmaGo</Badge></div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-slate-700">À corriger</h3>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{correctionCount}</p>
          <div className="mt-3"><Badge variant={correctionCount ? "warning" : "neutral"}>{correctionCount ? "Action requise" : "Rien à signaler"}</Badge></div>
        </Card>
      </section>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Ajouter un document</h2>
        <p className="mt-1 text-sm text-slate-600">
          PDF, JPEG ou PNG · 10 MiB maximum. Tes fichiers restent privés.
        </p>

        <form onSubmit={upload} className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Catégorie
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

            <label className="text-sm font-medium text-slate-700">
              Fichier
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
                disabled={busy}
                className="field"
              />
            </label>
          </div>

          {feedback && (
            <p
              role={feedback.kind === "error" ? "alert" : "status"}
              className={`mt-4 rounded-xl p-3 text-sm ${
                feedback.kind === "error"
                  ? "bg-red-50 text-red-800"
                  : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <button
            disabled={busy}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Envoi…" : "Envoyer le document"}
          </button>
        </form>
      </Card>

      <section aria-labelledby="documents-list-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="documents-list-title" className="text-xl font-semibold text-slate-950">Mes documents</h2>
            <p className="mt-1 text-sm text-slate-600">{documents.length} document{documents.length > 1 ? "s" : ""} dans ton dossier.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {documents.length === 0 ? (
            <Card className="border-dashed text-center">
              <h3 className="font-semibold text-slate-950">Aucun document envoyé</h3>
              <p className="mt-2 text-sm text-slate-600">Utilise le formulaire ci-dessus dès qu’une pièce est demandée.</p>
            </Card>
          ) : (
            documents.map((document) => (
              <Card as="article" key={document.id}>
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(document.status)}>{statusLabel(document.status)}</Badge>
                      <span className="text-xs font-medium text-slate-500">{categoryLabel(document.category)}</span>
                    </div>
                    <h3 className="mt-3 break-words font-semibold text-slate-950">{document.original_filename}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {Math.ceil(document.size_bytes / 1024)} Ko · envoyé le{" "}
                      <time dateTime={document.created_at}>
                        {new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(new Date(document.created_at))}
                      </time>
                    </p>
                    {document.admin_comment && (
                      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold">Message AlmaGo : </span>
                        {document.admin_comment}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a
                      href={`/api/documents/${document.id}/view`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Ouvrir
                    </a>
                    {removableDocumentStatuses.includes(
                      document.status as (typeof removableDocumentStatuses)[number],
                    ) && (
                      <button
                        type="button"
                        onClick={() => removeDocument(document.id)}
                        disabled={busy}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section aria-labelledby="document-history-title">
        <h2 id="document-history-title" className="text-xl font-semibold text-slate-950">Historique du dossier</h2>
        <div className="mt-4 space-y-2">
          {history.length === 0 ? (
            <Card className="border-dashed">
              <p className="text-sm text-slate-600">Les décisions et mises à jour AlmaGo apparaîtront ici.</p>
            </Card>
          ) : (
            history.map((event) => (
              <Card as="article" key={event.id} className="p-4">
                <p className="text-sm text-slate-700">{event.message}</p>
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
