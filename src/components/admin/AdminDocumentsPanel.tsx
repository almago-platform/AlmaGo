"use client";

import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { categoryLabel, reviewStatuses, statusLabel } from "@/lib/documents";

type AdminDocument = { id: string; category: string; original_filename: string; status: string; admin_comment: string | null; created_at: string; profiles: { first_name: string | null; last_name: string | null } | { first_name: string | null; last_name: string | null }[] | null };

export function AdminDocumentsPanel({ documents }: { documents: AdminDocument[] }) {
  const router = useRouter();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  async function review(id: string, status: (typeof reviewStatuses)[number]) {
    setBusy(id); setMessage("");
    const response = await fetch(`/api/admin/documents/${id}/review`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, comment: comments[id] || "" }) });
    const result = await response.json(); setBusy(null);
    if (!response.ok) { setMessage(result.error || "Impossible d’enregistrer la revue."); return; }
    setMessage("Décision enregistrée. L’étudiant a été notifié."); router.refresh();
  }
  return <div className="space-y-4">{message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}{documents.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-slate-600">Aucun document en attente.</p> : documents.map((document) => { const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles; return <Card as="article" key={document.id} className="min-w-0 break-words"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div className="min-w-0"><p className="text-sm font-medium text-emerald-700">{categoryLabel(document.category)} · {statusLabel(document.status)}</p><h2 className="mt-1 text-lg font-semibold text-slate-950 [overflow-wrap:anywhere]">{document.original_filename}</h2><p className="mt-1 text-sm text-slate-600">Étudiant : {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—"}</p></div><a href={`/api/documents/${document.id}/view`} target="_blank" rel="noreferrer" className={buttonClassName("secondary", "h-fit shrink-0 self-start")}>Ouvrir</a></div><label className="mt-4 block text-sm font-medium text-slate-700">Commentaire visible par l’étudiant<textarea value={comments[document.id] || ""} onChange={(event) => setComments((current) => ({ ...current, [document.id]: event.target.value }))} maxLength={2000} className="field min-h-24" placeholder="Obligatoire pour un rejet ou un remplacement." /></label><div className="mt-4 flex flex-wrap gap-2"><Button type="button" disabled={busy === document.id} onClick={() => review(document.id, "approved")}>Approuver</Button><Button type="button" disabled={busy === document.id} onClick={() => review(document.id, "replace_required")} variant="secondary">Demander un remplacement</Button><Button type="button" disabled={busy === document.id} onClick={() => review(document.id, "rejected")} variant="secondary">Rejeter</Button></div></Card>; })}</div>;
}
