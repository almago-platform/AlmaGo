"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type DossierMessageItem = {
  id: string;
  sender_role: "student" | "admin";
  body: string;
  student_read_at: string | null;
  admin_read_at: string | null;
  created_at: string;
  attachment_name: string | null;
  attachment_mime_type: string | null;
  attachment_size_bytes: number | null;
};

function formatDate(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(parsed));
}

export function DossierMessageThread({
  messages,
  endpoint,
  viewerRole,
  title,
  description,
  participantLabel,
}: {
  messages: DossierMessageItem[];
  endpoint: string;
  viewerRole: "admin" | "student";
  title: string;
  description: string;
  participantLabel?: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [busy, setBusy] = useState<"send" | "read" | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const unreadCount = messages.filter((item) =>
    viewerRole === "admin"
      ? item.sender_role === "student" && !item.admin_read_at
      : item.sender_role === "admin" && !item.student_read_at,
  ).length;

  function chooseAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setAttachment(null);
      return;
    }

    const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]);
    if (!allowed.has(file.type) || file.size <= 0 || file.size > 10 * 1024 * 1024) {
      setAttachment(null);
      setFileInputKey((value) => value + 1);
      setNotice({
        tone: "error",
        text: "Utilisez un PDF, JPEG ou PNG de 10 MiB maximum.",
      });
      return;
    }

    setAttachment(file);
    setNotice(null);
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (message.length < 2 && !attachment) return;

    setBusy("send");
    setNotice(null);

    const formData = new FormData();
    formData.set("message", message);
    if (attachment) formData.set("file", attachment);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };

    if (!response.ok) {
      setNotice({ tone: "error", text: payload.error || "Impossible d’envoyer le message." });
      setBusy(null);
      return;
    }

    setDraft("");
    setAttachment(null);
    setFileInputKey((value) => value + 1);
    setNotice({
      tone: "success",
      text: viewerRole === "admin"
        ? "Message publié dans l’espace du candidat ou de l’étudiant."
        : "Votre message a été envoyé à Campus Allemagne.",
    });
    setBusy(null);
    router.refresh();
  }

  async function markRead() {
    setBusy("read");
    setNotice(null);

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "mark_read" }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };

    if (!response.ok) {
      setNotice({
        tone: "error",
        text: payload.error || "Impossible de marquer les messages comme lus.",
      });
      setBusy(null);
      return;
    }

    setNotice({ tone: "success", text: "Messages marqués comme lus." });
    setBusy(null);
    router.refresh();
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              Communication dossier
            </p>
            <Badge variant={unreadCount ? "warning" : "neutral"}>
              {unreadCount ? `${unreadCount} non lu${unreadCount > 1 ? "s" : ""}` : "À jour"}
            </Badge>
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>

        {unreadCount ? (
          <Button type="button" variant="secondary" disabled={busy === "read"} onClick={markRead}>
            {busy === "read" ? "Mise à jour…" : "Marquer comme lus"}
          </Button>
        ) : null}
      </div>

      {notice ? (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={`border-b border-[var(--border)] px-4 py-3 text-sm font-semibold sm:px-5 ${
            notice.tone === "error"
              ? "bg-red-50 text-red-800"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      <div className="max-h-[32rem] overflow-y-auto bg-[var(--surface-subtle)] p-4 sm:p-5">
        {messages.length ? (
          <div className="space-y-3">
            {messages.map((item) => {
              const mine = item.sender_role === viewerRole;
              const senderLabel = item.sender_role === "admin"
                ? "Campus Allemagne"
                : viewerRole === "student"
                  ? "Vous"
                  : participantLabel || "Candidat / étudiant";

              return (
                <article
                  key={item.id}
                  className={`max-w-[46rem] rounded-[var(--radius-panel)] border p-4 ${
                    mine
                      ? "ml-auto border-[var(--brand-border)] bg-white"
                      : "mr-auto border-[var(--border)] bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
                      {senderLabel}
                    </p>
                    <time className="text-xs font-semibold text-slate-600" dateTime={item.created_at}>
                      {formatDate(item.created_at)}
                    </time>
                  </div>
                  {item.body ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{item.body}</p>
                  ) : null}
                  {item.attachment_name ? (
                    <a
                      href={`/api/dossier-messages/${item.id}/attachment`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-3 transition-colors hover:border-[var(--brand-border)]"
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                          {item.attachment_mime_type?.startsWith("image/") ? "Image jointe" : "Document joint"}
                        </span>
                        <span className="mt-1 block truncate text-sm font-semibold text-slate-900">
                          {item.attachment_name}
                        </span>
                        {item.attachment_size_bytes ? (
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {(item.attachment_size_bytes / (1024 * 1024)).toFixed(1)} MiB
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-[var(--brand)]">Ouvrir →</span>
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[var(--radius-control)] border border-dashed border-[var(--border-strong)] bg-white p-6 text-center">
            <p className="text-sm font-bold text-slate-900">Aucun message dans ce dossier</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Le premier message créera un fil commun entre l’étudiant et Campus Allemagne.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={send} className="border-t border-[var(--border)] p-4 sm:p-5">
        <label className="text-sm font-semibold text-slate-700">
          {viewerRole === "admin" ? "Message visible par le candidat ou l’étudiant" : "Répondre à Campus Allemagne"}
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            maxLength={4000}
            placeholder={
              viewerRole === "admin"
                ? "Écrivez une consigne ou une information claire. Ce texte sera visible par la personne."
                : "Écrivez votre message ou votre question."
            }
            className="field mt-2 resize-y bg-white"
          />
        </label>

        <div className="mt-3 rounded-[var(--radius-control)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] p-3">
          <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
            Ajouter un document ou une image
            <input
              key={fileInputKey}
              type="file"
              accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
              onChange={chooseAttachment}
              disabled={busy === "send"}
              className="mt-2 block w-full text-sm font-medium normal-case tracking-normal text-slate-700 file:mr-3 file:rounded-[var(--radius-control)] file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-bold file:text-[var(--brand)]"
            />
          </label>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>PDF, JPEG ou PNG · 10 MiB maximum · 1 fichier par message</span>
            {attachment ? (
              <button
                type="button"
                className="font-bold text-[var(--brand)] hover:underline"
                onClick={() => {
                  setAttachment(null);
                  setFileInputKey((value) => value + 1);
                }}
              >
                Retirer · {attachment.name}
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-600">
            {viewerRole === "admin"
              ? "Utilisez le Journal interne pour les informations que le candidat ou l’étudiant ne doit pas voir."
              : "Ce fil concerne votre dossier AlmaGo. Pour une urgence externe, utilisez aussi le canal officiel concerné."}
          </p>
          <Button type="submit" disabled={busy === "send" || (draft.trim().length < 2 && !attachment)} className="shrink-0">
            {busy === "send" ? "Envoi…" : "Envoyer"}
          </Button>
        </div>
      </form>
    </section>
  );
}
