"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type AdminCaseNoteItem = {
  id: string;
  kind: string;
  content: string;
  occurred_at: string;
  created_at: string;
  author_name: string;
};

const kindLabels: Record<string, string> = {
  internal_note: "Note interne",
  call: "Appel",
  email: "E-mail",
  whatsapp: "WhatsApp",
  meeting: "Rendez-vous",
  document_request: "Demande de document",
  university_contact: "Contact université",
};

function formatDate(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(parsed));
}

function localDateTimeValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function AdminCaseJournalPanel({
  studentId,
  notes,
}: {
  studentId: string;
  notes: AdminCaseNoteItem[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState("internal_note");
  const [content, setContent] = useState("");
  const [occurredAt, setOccurredAt] = useState(localDateTimeValue);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);

    const response = await fetch(`/api/admin/dossiers/${studentId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        content,
        occurred_at: occurredAt ? new Date(occurredAt).toISOString() : null,
      }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };

    if (!response.ok) {
      setNotice({
        tone: "error",
        text: payload.error || "Impossible d’enregistrer la note.",
      });
      setBusy(false);
      return;
    }

    setContent("");
    setOccurredAt(localDateTimeValue());
    setNotice({ tone: "success", text: "Note ajoutée au journal interne." });
    setBusy(false);
    router.refresh();
  }

  return (
    <section id="journal" className="pc-panel scroll-mt-24 p-5 sm:p-6" aria-labelledby="case-journal-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Continuité équipe</p>
          <h2 id="case-journal-title" className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950">
            Journal interne
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Notez ici les appels, e-mails, échanges WhatsApp, rendez-vous et informations internes utiles. Ce journal n’est jamais montré à l’étudiant.
          </p>
        </div>
        <Badge variant="neutral">{notes.length} entrée{notes.length > 1 ? "s" : ""}</Badge>
      </div>

      {notice ? (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={`mt-4 rounded-[var(--radius-control)] border p-3 text-sm font-semibold ${
            notice.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      <details className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4" open={!notes.length}>
        <summary className="cursor-pointer text-sm font-bold text-slate-950">Ajouter au journal</summary>
        <form onSubmit={submit} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Type
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value)}
                className="field mt-2 bg-white"
              >
                {Object.entries(kindLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Date de l’échange
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(event) => setOccurredAt(event.target.value)}
                max={localDateTimeValue()}
                className="field mt-2 bg-white"
              />
            </label>
          </div>

          <label className="text-sm font-semibold text-slate-700">
            Note
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              maxLength={4000}
              placeholder="Ex. L’étudiant a confirmé qu’il enverra le certificat de langue vendredi."
              className="field mt-2 resize-y bg-white"
              required
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Les notes sont conservées comme historique interne immuable : ajoutez une nouvelle entrée pour corriger ou compléter une information.
            </p>
            <Button type="submit" disabled={busy} className="shrink-0">
              {busy ? "Enregistrement…" : "Ajouter au journal"}
            </Button>
          </div>
        </form>
      </details>

      {notes.length ? (
        <div className="mt-5 divide-y divide-[var(--border)] rounded-[var(--radius-control)] border border-[var(--border)] bg-white">
          {notes.map((note) => (
            <article key={note.id} className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={note.kind === "internal_note" ? "neutral" : "info"}>
                    {kindLabels[note.kind] || note.kind}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">{note.author_name}</span>
                </div>
                <time className="text-xs font-semibold text-slate-500" dateTime={note.occurred_at}>
                  {formatDate(note.occurred_at)}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{note.content}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[var(--radius-control)] border border-dashed border-[var(--border-strong)] p-5 text-center">
          <p className="text-sm font-bold text-slate-900">Aucune note interne</p>
          <p className="mt-1 text-sm text-slate-600">Le premier échange d’équipe apparaîtra ici.</p>
        </div>
      )}
    </section>
  );
}
