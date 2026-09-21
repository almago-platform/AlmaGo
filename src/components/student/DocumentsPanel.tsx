"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categoryLabel, documentCategories, removableDocumentStatuses, statusLabel } from "@/lib/documents";

type StudentDocument = { id: string; category: string; original_filename: string; size_bytes: number; status: string; admin_comment: string | null; created_at: string };
type HistoryEvent = { id: string; message: string; created_at: string };

export function DocumentsPanel({ documents, history }: { documents: StudentDocument[]; history: HistoryEvent[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("passport");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) { setStatus("Choisis un fichier."); return; }
    setBusy(true); setStatus("");
    const formData = new FormData(); formData.append("category", category); formData.append("file", file);
    const response = await fetch("/api/student/documents/upload", { method: "POST", body: formData });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) { setStatus(result.error || "Impossible d’envoyer le document."); return; }
    if (fileInput.current) fileInput.current.value = "";
    setStatus("Document envoyé. AlmaGo le vérifiera prochainement."); router.refresh();
  }

  async function removeDocument(id: string) {
    if (!window.confirm("Supprimer ce document ?")) return;
    setBusy(true); setStatus("");
    const response = await fetch(`/api/student/documents/${id}`, { method: "DELETE" });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) { setStatus(result.error || "Impossible de supprimer le document."); return; }
    setStatus("Document supprimé."); router.refresh();
  }

  return <div className="space-y-6">
    <form onSubmit={upload} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-950">Ajouter un document</h2><p className="mt-1 text-sm text-slate-600">PDF, JPEG ou PNG · 10 MiB maximum. Tes fichiers restent privés.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Catégorie<select value={category} onChange={(event) => setCategory(event.target.value)} className="field">{documentCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Fichier<input ref={fileInput} type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png" className="field" /></label></div>
      {status && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{status}</p>}
      <button disabled={busy} className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Envoi…" : "Envoyer le document"}</button>
    </form>
    <section><h2 className="text-xl font-semibold text-slate-950">Mes documents</h2><div className="mt-4 space-y-3">{documents.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">Aucun document envoyé pour le moment.</p> : documents.map((document) => <article key={document.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-medium text-emerald-700">{categoryLabel(document.category)}</p><h3 className="mt-1 font-semibold text-slate-950">{document.original_filename}</h3><p className="mt-1 text-sm text-slate-600">{statusLabel(document.status)} · {Math.ceil(document.size_bytes / 1024)} Ko</p>{document.admin_comment && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700"><span className="font-semibold">Message AlmaGo : </span>{document.admin_comment}</p>}</div><div className="flex shrink-0 gap-2"><a href={`/api/documents/${document.id}/view`} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Ouvrir</a>{removableDocumentStatuses.includes(document.status as (typeof removableDocumentStatuses)[number]) && <button type="button" onClick={() => removeDocument(document.id)} disabled={busy} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">Supprimer</button>}</div></div></article>)}</div></section>
    <section><h2 className="text-xl font-semibold text-slate-950">Historique du dossier</h2><div className="mt-4 space-y-2">{history.length === 0 ? <p className="text-sm text-slate-600">Les décisions AlmaGo apparaîtront ici.</p> : history.map((event) => <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700"><p>{event.message}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.created_at))}</p></article>)}</div></section>
  </div>;
}
