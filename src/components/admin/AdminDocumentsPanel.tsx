"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { categoryLabel, reviewStatuses, statusLabel } from "@/lib/documents";

type AdminDocument = {
  id: string;
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

export function AdminDocumentsPanel({ documents }: { documents: AdminDocument[] }) {
  const router = useRouter();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const pendingCount = documents.filter((document) => document.status === "pending").length;
  const replacementCount = documents.filter((document) => document.status === "replace_required").length;

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

  return (
    <div>
      <section className="mb-6 grid gap-4 sm:grid-cols-3" aria-label="Résumé de la file documentaire">
        <QueueSummary label="À traiter" value={documents.length} detail="Documents visibles dans cette file" />
        <QueueSummary label="En attente" value={pendingCount} detail="Première vérification à effectuer" />
        <QueueSummary label="Remplacement demandé" value={replacementCount} detail="Dossiers qui restent à suivre" tone="warning" />
      </section>

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
          <h2 className="mt-4 text-lg font-bold text-slate-950">Aucun document n’attend de revue actuellement.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            La file documentaire est à jour. Les nouvelles pièces à vérifier apparaîtront ici automatiquement.
          </p>
        </Card>
      ) : (
        <section className="space-y-5" aria-label="Documents à traiter">
          {documents.map((document, index) => {
            const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles;
            const studentName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Étudiant";
            const isReplacement = document.status === "replace_required";
            const isBusy = busy === document.id;

            return (
              <Card
                as="article"
                key={document.id}
                aria-labelledby={`admin-document-title-${document.id}`}
                className={`min-w-0 overflow-hidden ${isReplacement ? "border-amber-300 bg-amber-50/20" : "border-[var(--border)] bg-white"}`}
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={isReplacement ? "warning" : "info"}>
                        {isReplacement ? "Remplacement demandé" : "À vérifier"}
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
                      <span className="rounded-full bg-slate-100 px-3 py-1.5">{categoryLabel(document.category)}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5">{statusLabel(document.status)}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5">Envoyé le {formatCreatedAt(document.created_at)}</span>
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
                  <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Message actuellement enregistré</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">{document.admin_comment}</p>
                  </div>
                )}

                <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/35 p-4">
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
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </Card>
  );
}
