"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type AdminAdvisorOption = {
  id: string;
  name: string;
};

export function AdminCaseOwnerPanel({
  studentId,
  advisors,
  assignedAdminId,
  assignedAdminName,
}: {
  studentId: string;
  advisors: AdminAdvisorOption[];
  assignedAdminId: string | null;
  assignedAdminName: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(assignedAdminId || "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);

    const response = await fetch(`/api/admin/dossiers/${studentId}/assignment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_admin_id: value || null }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };

    if (!response.ok) {
      setNotice({
        tone: "error",
        text: payload.error || "Impossible de modifier le responsable du dossier.",
      });
      setBusy(false);
      return;
    }

    setNotice({
      tone: "success",
      text: value ? "Responsable du dossier mis à jour." : "Dossier maintenant non attribué.",
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="pc-card p-5" aria-labelledby="case-owner-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Responsabilité</p>
          <h2 id="case-owner-title" className="mt-2 text-lg font-semibold text-slate-950">
            Conseiller du dossier
          </h2>
        </div>
        <Badge variant={assignedAdminId ? "info" : "warning"}>
          {assignedAdminId ? "Attribué" : "Non attribué"}
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {assignedAdminName
          ? `Responsable actuel : ${assignedAdminName}.`
          : "Aucun conseiller n’est actuellement responsable de ce dossier."}
      </p>

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

      <form onSubmit={save} className="mt-4 grid gap-3">
        <label className="text-sm font-semibold text-slate-700">
          Responsable
          <select
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="field mt-2 bg-white"
          >
            <option value="">Non attribué</option>
            {advisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>{advisor.name}</option>
            ))}
          </select>
        </label>

        <Button type="submit" variant="secondary" disabled={busy} className="w-full">
          {busy ? "Enregistrement…" : "Enregistrer le responsable"}
        </Button>
      </form>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Cette attribution est interne à Campus Allemagne et sert à organiser le portefeuille de travail.
      </p>
    </section>
  );
}
