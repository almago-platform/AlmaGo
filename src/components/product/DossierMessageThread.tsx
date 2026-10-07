"use client";

import { useState, type FormEvent } from "react";
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
}: {
  messages: DossierMessageItem[];
  endpoint: string;
  viewerRole: "admin" | "student";
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<"send" | "read" | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const unreadCount = messages.filter((item) =>
    viewerRole === "admin"
      ? item.sender_role === "student" && !item.admin_read_at
      : item.sender_role === "admin" && !item.student_read_at,
  ).length;

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (message.length < 2) return;

    setBusy("send");
    setNotice(null);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };

    if (!response.ok) {
      setNotice({ tone: "error", text: payload.error || "Impossible d’envoyer le message." });
      setBusy(null);
      return;
    }

    setDraft("");
    setNotice({
      tone: "success",
      text: viewerRole === "admin"
        ? "Message publié dans l’espace étudiant."
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
              {unreadCount ? \`\${unreadCount} non lu\${unreadCount > 1 ? "s" : ""}\` : "À jour"}
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
          className={\`border-b border-[var(--border)] px-4 py-3 text-sm font-semibold sm:px-5 \${
            notice.tone === "error"
              ? "bg-red-50 text-red-800"
              : "bg-emerald-50 text-emerald-800"
          }\`}
        >
          {notice.text}
        </p>
      ) : null}

      <div className="max-h-[32rem] overflow-y-auto bg-[var(--surface-subtle)] p-4 sm:p-5">
        {messages.length ? (
          <div className="space-y-3">
            {messages.map((item) => {
              const mine = item.sender_role === viewerRole;
              const senderLabel = item.sender_role === "admin" ? "Campus Allemagne" : "Étudiant";

              return (
                <article
                  key={item.id}
                  className={\`max-w-[46rem] rounded-[var(--radius-panel)] border p-4 \${
                    mine
                      ? "ml-auto border-[var(--brand-border)] bg-white"
                      : "mr-auto border-[var(--border)] bg-white"
                  }\`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
                      {senderLabel}
                    </p>
                    <time className="text-xs font-semibold text-slate-600" dateTime={item.created_at}>
                      {formatDate(item.created_at)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{item.body}</p>
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
          {viewerRole === "admin" ? "Message visible par l’étudiant" : "Répondre à Campus Allemagne"}
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            maxLength={4000}
            placeholder={
              viewerRole === "admin"
                ? "Écrivez une consigne ou une information claire. Ce texte sera visible par l’étudiant."
                : "Écrivez votre message ou votre question."
            }
            className="field mt-2 resize-y bg-white"
            required
          />
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-600">
            {viewerRole === "admin"
              ? "Utilisez le Journal interne pour les informations que l’étudiant ne doit pas voir."
              : "Ce fil concerne votre dossier AlmaGo. Pour une urgence externe, utilisez aussi le canal officiel concerné."}
          </p>
          <Button type="submit" disabled={busy === "send" || draft.trim().length < 2} className="shrink-0">
            {busy === "send" ? "Envoi…" : "Envoyer"}
          </Button>
        </div>
      </form>
    </section>
  );
}
