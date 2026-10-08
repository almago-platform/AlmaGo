"use client";

import { useMemo, useState } from "react";
import type { DossierHistoryCategory, UnifiedDossierEvent } from "@/lib/admin/dossier-history";

const choices: Array<{ value: "all" | DossierHistoryCategory; label: string }> = [
  { value: "all", label: "Tous les événements" },
  { value: "messages", label: "Messages" },
  { value: "notes", label: "Journal interne" },
  { value: "documents", label: "Documents" },
  { value: "candidatures", label: "Candidatures" },
  { value: "suivi", label: "Autres événements" },
];
const categoryLabels: Record<DossierHistoryCategory, string> = {
  suivi: "Suivi",
  messages: "Message",
  notes: "Interne",
  documents: "Document",
  candidatures: "Candidature",
};
const fmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin",
});
const dateKey = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Berlin",
});
function showDate(raw: string) {
  const time = Date.parse(raw);
  return Number.isFinite(time) ? fmt.format(time) : "Date non vérifiable";
}
function localDay(raw: string): string | null {
  const time = Date.parse(raw);
  return Number.isFinite(time) ? dateKey.format(time) : null;
}

export function AdminDossierHistory({ events }: { events: UnifiedDossierEvent[] }) {
  const [category, setCategory] = useState<"all" | DossierHistoryCategory>("all");
  const [fromDay, setFromDay] = useState("");
  const [toDay, setToDay] = useState("");
  const [limit, setLimit] = useState(20);
  const filtered = useMemo(() => events.filter((event) => {
    if (category !== "all" && event.category !== category) return false;
    if (!fromDay && !toDay) return true;
    const day = localDay(event.occurredAt);
    return day !== null && (!fromDay || day >= fromDay) && (!toDay || day <= toDay);
  }), [category, events, fromDay, toDay]);
  const visible = filtered.slice(0, limit);

  return (
    <div className="mt-5 space-y-4">
      <p className="text-sm leading-6 text-slate-600">
        Messages, notes, documents et candidatures enregistrés, classés par date réelle.
        Les notes du journal restent internes à Campus Allemagne. Les dates saisies a posteriori sont signalées.
      </p>
      <div className="grid gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
        <label className="text-xs font-semibold text-slate-700">
          Type d’événement
          <select
            className="field mt-1 w-full bg-white"
            value={category}
            onChange={(event) => { setCategory(event.target.value as typeof category); setLimit(20); }}
          >
            {choices.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Depuis
          <input type="date" className="field mt-1 w-full bg-white" value={fromDay}
            onChange={(event) => { setFromDay(event.target.value); setLimit(20); }} />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Jusqu’au
          <input type="date" className="field mt-1 w-full bg-white" value={toDay}
            onChange={(event) => { setToDay(event.target.value); setLimit(20); }} />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p role="status" aria-live="polite" className="text-xs font-semibold text-slate-700">
          {filtered.length} événement{filtered.length > 1 ? "s" : ""} correspondant{filtered.length > 1 ? "s" : ""}
          {" · "}{events.length} chargé{events.length > 1 ? "s" : ""}
        </p>
        {(category !== "all" || fromDay || toDay) ? (
          <button className="text-xs font-semibold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2"
            type="button" onClick={() => { setCategory("all"); setFromDay(""); setToDay(""); setLimit(20); }}>
            Réinitialiser les filtres
          </button>
        ) : null}
      </div>
      {visible.length ? (
        <ol className="relative ms-2 border-s border-[var(--border)]">
          {visible.map((event) => (
            <li key={event.id} className="relative pb-5 ps-6 last:pb-0">
              <span aria-hidden="true" className="absolute -start-[0.35rem] top-2 h-3 w-3 rounded-full border-2 border-[var(--brand-border)] bg-[var(--brand-soft)]" />
              <article className="min-w-0 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-sm font-bold text-slate-950">{event.title}</h3>
                  <time dateTime={Number.isFinite(Date.parse(event.occurredAt)) ? event.occurredAt : undefined}
                    className="text-xs text-slate-600">{showDate(event.occurredAt)}</time>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="font-semibold">{categoryLabels[event.category]}</span>
                  <span>{event.source}</span>
                  <span>Auteur : {event.actor || "Non renseigné"}</span>
                </div>
                {event.detail ? (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{event.detail}</p>
                ) : null}
                {event.currentStatus ? (
                  <p className="mt-2 text-xs font-semibold text-slate-700">{event.currentStatus}</p>
                ) : null}
                {event.recordedAt && event.recordedAt !== event.occurredAt ? (
                  <p className="mt-2 text-xs text-slate-600">Note enregistrée le {showDate(event.recordedAt)}</p>
                ) : null}
                <a href={event.href} className="mt-3 inline-flex min-h-9 items-center text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">
                  Ouvrir la rubrique source
                </a>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-[var(--radius-control)] border border-dashed border-[var(--border)] p-4 text-sm text-slate-600">
          Aucun événement enregistré ne correspond à ces filtres.
        </p>
      )}
      {filtered.length > visible.length ? (
        <button type="button" className="min-h-10 rounded-[var(--radius-control)] border border-[var(--border)] px-4 py-2 text-sm font-semibold text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
          onClick={() => setLimit((previous) => previous + 20)}>
          Afficher 20 événements supplémentaires
        </button>
      ) : null}
      <p className="text-xs leading-5 text-slate-600">
        Vue des données déjà chargées dans le dossier : journal (40 dernières lignes), notes (50)
        et messages (200). Cette frise n’est pas un export exhaustif. Aucune décision d’admission
        ou de visa n’est déduite d’un simple document ou message.
      </p>
    </div>
  );
}
