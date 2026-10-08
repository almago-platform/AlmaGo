"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type ApplicationChoice = { id: string; label: string; institution: string };

export function AdminAdmissionPdfForm({
  studentId,
  applications,
}: {
  studentId: string;
  applications: ApplicationChoice[];
}) {
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function reveal() {
      if (window.location.hash !== "#admission-pdf" || !detailsRef.current) return;
      detailsRef.current.open = true;
      window.requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ block: "start" }));
    }
    function handleLink(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('a[href="#admission-pdf"]') && detailsRef.current) {
        detailsRef.current.open = true;
      }
    }
    reveal();
    window.addEventListener("hashchange", reveal);
    document.addEventListener("click", handleLink);
    return () => {
      window.removeEventListener("hashchange", reveal);
      document.removeEventListener("click", handleLink);
    };
  }, []);
  const [applicationId, setApplicationId] = useState(applications[0]?.id || "");
  const [institution, setInstitution] = useState(applications[0]?.institution || "");
  const [evidenceType, setEvidenceType] = useState("definitive_admission");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);

  if (!applications.length) return null;

  function changeApplication(id: string) {
    setApplicationId(id);
    setInstitution(applications.find((application) => application.id === id)?.institution || "");
    setNotice(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")
      || file.size <= 0 || file.size > 10 * 1024 * 1024) {
      setNotice({ error: true, text: "Choisissez un PDF de 10 MiB maximum." });
      return;
    }
    setBusy(true);
    setNotice(null);
    const form = new FormData();
    form.set("application_id", applicationId);
    form.set("evidence_type", evidenceType);
    form.set("institution", institution.trim());
    form.set("evidence_date", date);
    form.set("file", file);

    try {
      const response = await fetch(`/api/admin/dossiers/${studentId}/admissions`, {
        method: "POST",
        body: form,
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setNotice({ error: true, text: result.error || "L’enregistrement a échoué." });
        return;
      }

      setFile(null);
      setFileKey((value) => value + 1);
      setDate("");
      setNotice({
        error: false,
        text: "PDF enregistré et accessible dans les documents de l’étudiant. Vérification humaine encore nécessaire.",
      });
      router.refresh();
    } catch {
      setNotice({ error: true, text: "Connexion indisponible. Vérifiez le dossier avant de réessayer." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <details id="admission-pdf" ref={detailsRef} className="mb-5 scroll-mt-52 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 lg:scroll-mt-40">
      <summary className="min-h-9 cursor-pointer text-sm font-bold text-slate-950">
        Ajouter une lettre universitaire (PDF)
      </summary>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        Associez une lettre réellement reçue à la bonne candidature. L’étudiant pourra lire le PDF,
        mais une revue séparée reste obligatoire avant toute validation de la preuve ou décision de candidature.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <label className="block text-sm font-semibold text-slate-800">
          Candidature concernée
          <select className="field mt-1 w-full bg-white" value={applicationId}
            onChange={(event) => changeApplication(event.target.value)} required>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>{application.label}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Type de lettre
            <select className="field mt-1 w-full bg-white" value={evidenceType}
              onChange={(event) => setEvidenceType(event.target.value)} required>
              <option value="definitive_admission">Admission définitive</option>
              <option value="conditional_admission">Admission conditionnelle</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Date indiquée sur la lettre (facultatif)
            <input className="field mt-1 w-full bg-white" type="date" value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-800">
          Université émettrice
          <input className="field mt-1 w-full bg-white" value={institution}
            maxLength={180} minLength={2} onChange={(event) => setInstitution(event.target.value)}
            placeholder="Nom exact sur la lettre" required />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Lettre d’admission (PDF)
          <input key={fileKey} type="file" className="mt-1 block w-full text-xs"
            accept="application/pdf,.pdf" required
            onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <span className="mt-1 block text-xs font-normal text-slate-600">PDF · 10 MiB maximum · stockage privé</span>
        </label>
        {notice ? (
          <p role={notice.error ? "alert" : "status"}
            className={`rounded-[var(--radius-control)] border p-3 text-xs leading-5 ${notice.error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
            {notice.text}{" "}
            {!notice.error ? (
              <a href="/admin/documents" className="font-bold underline underline-offset-2">
                Vérifier la pièce →
              </a>
            ) : null}
          </p>
        ) : null}
        <Button type="submit" disabled={busy || !file || !applicationId}>
          {busy ? "Enregistrement…" : "Enregistrer le PDF pour cet étudiant"}
        </Button>
      </form>
    </details>
  );
}
