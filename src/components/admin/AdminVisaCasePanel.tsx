"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  visaStatusLabels, visaTransitions, type VisaStatus,
} from "@/lib/admin/visa-workflow";
import { TUNISIA_GERMANY_VISA_TRACKS } from "@/lib/admin/candidate-journey";

export type VisaCaseRow = {
  student_id: string;
  track: string;
  residence_country: string;
  mission: string;
  status: VisaStatus;
  official_source_url: string;
  source_verified_at: string;
  evidence_document_id: string | null;
  note: string | null;
  version: number;
  updated_at: string;
};

export type VisaDocumentOption = {
  id: string;
  original_filename: string;
  created_at: string;
};

export function AdminVisaCasePanel({
  studentId,
  visaCase,
  documents,
}: {
  studentId: string;
  visaCase: VisaCaseRow | null;
  documents: VisaDocumentOption[];
}) {
  const router = useRouter();
  const [track, setTrack] = useState(visaCase?.track || "studies");
  const [residenceCountry, setResidenceCountry] = useState(visaCase?.residence_country || "Tunisie");
  const [mission, setMission] = useState(visaCase?.mission || "Ambassade d’Allemagne à Tunis");
  const [status, setStatus] = useState<VisaStatus>(visaCase?.status || "collecting");
  const [sourceUrl, setSourceUrl] = useState(visaCase?.official_source_url || "");
  const [sourceDay, setSourceDay] = useState(visaCase?.source_verified_at?.slice(0, 10) || "");
  const [evidenceId, setEvidenceId] = useState(visaCase?.evidence_document_id || "");
  const [note, setNote] = useState(visaCase?.note || "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; content: string } | null>(null);

  const trackData = TUNISIA_GERMANY_VISA_TRACKS.find((item) => item.key === track);
  const statuses = visaCase
    ? [visaCase.status, ...visaTransitions[visaCase.status]]
    : (["collecting"] as VisaStatus[]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!window.confirm(visaCase
      ? "Enregistrer cette mise à jour ? Les changements et preuves seront historisés."
      : "Ouvrir un dossier visa interne ? Cela ne dépose aucune demande auprès de l’ambassade.")) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/visa/${studentId}`, {
        method: visaCase ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          residence_country: residenceCountry,
          mission,
          status,
          official_source_url: sourceUrl,
          source_verified_at: sourceDay,
          evidence_document_id: evidenceId || null,
          note,
          ...(visaCase ? { version: visaCase.version } : {}),
        }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setNotice({ type: "error", content: result.error || "Enregistrement impossible." });
        return;
      }
      setNotice({ type: "success", content: "Dossier visa interne enregistré et historisé." });
      router.refresh();
    } catch {
      setNotice({ type: "error", content: "Connexion indisponible. Rien ne doit être considéré comme enregistré." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Contrôle du dossier visa</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Ce dossier suit des justificatifs vérifiés par Campus Allemagne. Il ne se substitue ni au portail consulaire ni à une décision officielle.</p>
        </div>
        <Badge variant={visaCase?.status === "approved" ? "success" : visaCase?.status === "refused" ? "warning" : "info"}>
          {visaCase ? visaStatusLabels[visaCase.status] : "Suivi non créé"}
        </Badge>
      </div>

      <form onSubmit={save} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Motif exact
          <select className="field mt-2 bg-white" value={track} onChange={(e) => setTrack(e.target.value)} required>
            {TUNISIA_GERMANY_VISA_TRACKS.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Pays de résidence habituel
          <input className="field mt-2 bg-white" value={residenceCountry} onChange={(e) => setResidenceCountry(e.target.value)} maxLength={100} required />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Représentation consulaire compétente
          <input className="field mt-2 bg-white" value={mission} onChange={(e) => setMission(e.target.value)} maxLength={160} required />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          État documenté
          <select className="field mt-2 bg-white" value={status} onChange={(e) => { setStatus(e.target.value as VisaStatus); setEvidenceId(""); }} required>
            {statuses.map((item) => <option value={item} key={item}>{visaStatusLabels[item]}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Source officielle vérifiée (URL HTTPS)
          <input type="url" className="field mt-2 bg-white" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} maxLength={500} placeholder="https://tunis.diplo.de/..." required />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Date de vérification personnelle de la source
          <input type="date" className="field mt-2 bg-white" value={sourceDay} onChange={(e) => setSourceDay(e.target.value)} required />
        </label>
        {visaCase ? (
          <label className="text-sm font-semibold text-slate-700 md:col-span-2">
            Justificatif vérifié, catégorie « Autre »
            <select className="field mt-2 bg-white" value={evidenceId} onChange={(e) => setEvidenceId(e.target.value)}>
              <option value="">Aucun justificatif attaché</option>
              {documents.map((document) => <option key={document.id} value={document.id}>{document.original_filename}</option>)}
            </select>
            <span className="mt-2 block text-xs font-normal leading-5 text-slate-600">Pour dépôt, rendez-vous, visa accordé ou refusé : joindre un nouveau document « Autre » approuvé correspondant à cette étape. Le serveur refuse une preuve appartenant à un autre étudiant ou non approuvée.</span>
          </label>
        ) : null}
        <label className="text-sm font-semibold text-slate-700 md:col-span-2">
          Note interne de vérification
          <textarea className="field mt-2 min-h-28 resize-y bg-white" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} placeholder="Quelle source officielle ? Quelle preuve vue ? Que doit faire le candidat ? Ne pas saisir d’identifiants secrets." />
        </label>
        {trackData ? (
          <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3 text-xs leading-5 text-slate-600 md:col-span-2">
            <p className="font-bold text-slate-800">Rappel : {trackData.purpose}</p>
            <p className="mt-1">La checklist dépend du pays de résidence et de l’ambassade réellement compétente. La référence de Tunis n’est pas automatiquement valable ailleurs.</p>
            <a target="_blank" rel="noopener noreferrer" href={trackData.officialUrl} className="mt-2 inline-block font-bold text-[var(--brand-strong)] underline">Consulter la source de référence ↗</a>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 md:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : visaCase ? "Enregistrer et historiser" : "Ouvrir le suivi visa"}</Button>
          {notice ? <p role={notice.type === "error" ? "alert" : "status"} className={`text-sm font-semibold ${notice.type === "error" ? "text-red-700" : "text-emerald-800"}`}>{notice.content}</p> : null}
        </div>
      </form>
    </section>
  );
}
