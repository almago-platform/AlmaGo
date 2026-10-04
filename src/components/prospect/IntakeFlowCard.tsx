"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { campusRouteLabel } from "@/lib/campus-intake";

type Recovery = {
  createdAt: string;
  targetDegree: string;
  targetField: string;
  germanLevel: string;
};

type Intake = {
  status: string;
  proposed_route_key: string | null;
  proposal_reason: string | null;
  procedure_id: string | null;
};

export function IntakeFlowCard({
  recovery,
  orientationId,
  orientationConfirmed,
  intake,
  starterSummary,
}: {
  recovery: Recovery | null;
  orientationId: string | null;
  orientationConfirmed: boolean;
  intake: Intake | null;
  starterSummary: {
    approved: number;
    required: number;
    pending: number;
    needsReplacement: number;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function post(url: string, body?: Record<string, unknown>) {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "Action impossible.");
        return;
      }

      router.refresh();
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  if (recovery) {
    const savedDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" })
      .format(new Date(recovery.createdAt));

    return (
      <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:p-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
          Orientation retrouvée
        </p>
        <h2 className="mt-2 text-xl font-bold">Nous avons retrouvé votre orientation</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Elle a été enregistrée le {savedDate}. Vous n’avez pas besoin de recommencer si ces informations sont toujours correctes.
        </p>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <p><strong>Diplôme visé :</strong> {recovery.targetDegree || "À préciser"}</p>
          <p><strong>Domaine :</strong> {recovery.targetField || "À préciser"}</p>
          <p><strong>Allemand :</strong> {recovery.germanLevel || "À préciser"}</p>
        </div>

        {error ? <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => post("/api/orientation/recover")}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Récupération…" : "Oui, continuer avec cette orientation"}
          </button>
          <Link
            href="/orientation"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-5 text-sm font-bold"
          >
            Mettre mon orientation à jour
          </Link>
        </div>
      </section>
    );
  }

  if (orientationId && !orientationConfirmed) {
    return (
      <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:p-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
          Étape 1 · Orientation
        </p>
        <h2 className="mt-2 text-xl font-bold">Confirmez votre orientation actuelle</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Nous allons utiliser ces réponses comme point de départ. Vous pourrez les mettre à jour avant de confirmer.
        </p>

        {error ? <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => post("/api/intake/orientation/confirm", { orientationId })}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Validation…" : "Ces informations sont correctes"}
          </button>
          <Link
            href="/orientation?mode=update"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-5 text-sm font-bold"
          >
            Modifier mon orientation
          </Link>
        </div>
      </section>
    );
  }

  if (!intake) return null;

  if (intake.status === "starter_documents") {
    return (
      <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
          Étape 2 · Pièces de départ
        </p>
        <h2 className="mt-2 text-xl font-bold">Ajoutez les preuves nécessaires</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Passeport, Baccalauréat et relevé de notes sont nécessaires pour la première validation.
          Ajoutez votre certificat de langue uniquement si vous en avez déjà un.
        </p>
        <p className="mt-4 text-sm font-semibold">
          Validés : {starterSummary.approved}/{starterSummary.required}
          {starterSummary.pending ? ` · ${starterSummary.pending} en vérification` : ""}
          {starterSummary.needsReplacement ? ` · ${starterSummary.needsReplacement} à remplacer` : ""}
        </p>
        <Link
          href="/prospect/documents"
          className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
        >
          Gérer mes documents
        </Link>
      </section>
    );
  }

  if (intake.status === "campus_review") {
    return (
      <section className="mt-6 rounded-[var(--radius-panel)] border border-blue-200 bg-blue-50/50 p-5 sm:p-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-blue-800">
          Étape 3 · Validation Campus Allemagne
        </p>
        <h2 className="mt-2 text-xl font-bold">Nous examinons votre dossier</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Vos trois pièces obligatoires sont validées. Campus Allemagne analyse maintenant votre orientation et vos preuves pour proposer le parcours adapté.
        </p>
        <p className="mt-4 text-sm font-bold text-blue-900">Aucune action requise de votre part pour le moment.</p>
      </section>
    );
  }

  if (intake.status === "route_proposed") {
    return (
      <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:p-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
          Étape 4 · Parcours proposé
        </p>
        <h2 className="mt-2 text-2xl font-bold">
          {campusRouteLabel(intake.proposed_route_key)}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {intake.proposal_reason}
        </p>

        {error ? <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => post("/api/intake/route/confirm")}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Confirmation…" : "Je confirme ce parcours"}
          </button>
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <label className="block text-sm font-semibold">
            Une question ou un désaccord ? <span className="font-normal text-[var(--muted)]">(facultatif)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={1000}
              rows={3}
              className="field mt-2"
              placeholder="Expliquez ce que vous souhaitez revoir avec Campus Allemagne."
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => post("/api/intake/route/discuss", { note })}
            className="mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-5 text-sm font-bold disabled:opacity-60"
          >
            Je souhaite en discuter
          </button>
        </div>
      </section>
    );
  }

  if (intake.status === "student_question") {
    return (
      <section className="mt-6 rounded-[var(--radius-panel)] border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-amber-800">
          Parcours à revoir
        </p>
        <h2 className="mt-2 text-xl font-bold">Votre demande a été transmise</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Campus Allemagne doit revoir avec vous le parcours proposé avant toute création de procédure.
        </p>
      </section>
    );
  }

  if (intake.status === "procedure_created") {
    return (
      <section className="mt-6 rounded-[var(--radius-panel)] border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-emerald-800">
          Étape 5 · Confirmé
        </p>
        <h2 className="mt-2 text-xl font-bold">
          Parcours confirmé : {campusRouteLabel(intake.proposed_route_key)}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Votre procédure Campus Allemagne a été créée. Les étapes détaillées de la procédure seront traitées dans la phase suivante.
        </p>
      </section>
    );
  }

  return null;
}
