"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { campusRouteLabel } from "@/lib/campus-intake";
import { ProposalDecisionPanel } from "@/components/prospect/ProposalDecisionPanel";

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
  proposed_offer_version_id: string | null;
  purchase_id: string | null;
  procedure_id: string | null;
};

type ProposalOffer = {
  id: string;
  displayName: string;
  summary: string;
  services: string[];
  priceLabel: string;
};

export function IntakeFlowCard({
  recovery,
  orientationId,
  orientationConfirmed,
  intake,
  starterSummary,
  bacStatus,
  offer,
  paymentEnabled = false,
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
  bacStatus?: string | null;
  offer?: ProposalOffer | null;
  paymentEnabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(
    url: string,
    body?: Record<string, unknown>,
    successHref?: string,
  ) {
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

      if (successHref) {
        router.push(successHref);
      } else {
        router.refresh();
      }
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
      <section className="mt-6 relative overflow-hidden rounded-[1.35rem] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[0_22px_58px_-42px_rgba(216,6,33,.28)] sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
          Orientation retrouvée
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">Nous avons retrouvé votre orientation</h2>
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
            className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {busy ? "Récupération…" : "Oui, continuer avec cette orientation"}
          </button>
          <Link
            href="/orientation"
            className="inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-5 text-sm font-bold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
          >
            Mettre mon orientation à jour
          </Link>
        </div>
      </section>
    );
  }

  if (orientationId && !orientationConfirmed) {
    return (
      <section className="mt-6 relative overflow-hidden rounded-[1.35rem] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[0_22px_58px_-42px_rgba(216,6,33,.28)] sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
          Étape 1 · Orientation
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">Confirmez votre orientation actuelle</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Nous allons utiliser ces réponses comme point de départ. Vous pourrez les mettre à jour avant de confirmer.
        </p>

        {error ? <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => post("/api/intake/orientation/confirm", { orientationId })}
            className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {busy ? "Validation…" : "Ces informations sont correctes"}
          </button>
          <Link
            href="/orientation?mode=update"
            className="inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-5 text-sm font-bold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
          >
            Modifier mon orientation
          </Link>
        </div>
      </section>
    );
  }

  if (!intake) return null;

  if (intake.status === "starter_documents" && bacStatus === "preparing") {
    return (
      <section className="mt-6 relative overflow-hidden rounded-[1.35rem] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[0_22px_58px_-42px_rgba(216,6,33,.28)] sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
          Projet avant le Bac
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">Continuez votre préparation sans attendre les résultats</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Aucun document académique final n’est obligatoire maintenant. Vous pouvez améliorer votre allemand,
          explorer les programmes et ajouter seulement votre passeport ou votre certificat de langue s’ils sont disponibles.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/prospect/roadmap"
            className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-md"
          >
            Continuer ma préparation
          </Link>
          <Link
            href="/prospect/documents"
            className="inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-5 text-sm font-bold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
          >
            Ajouter un document facultatif
          </Link>
        </div>
      </section>
    );
  }

  if (intake.status === "starter_documents") {
    return (
      <section className="mt-6 rounded-[1.35rem] border border-black/[.07] bg-white p-5 shadow-[0_22px_60px_-42px_rgba(0,0,0,.34)] sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
          Étape 2 · Pièces de départ
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">Ajoutez les preuves nécessaires</h2>
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
      <section className="mt-6 relative overflow-hidden rounded-[1.35rem] border border-[#c7d6df] bg-[#f2f6f8] p-5 shadow-[0_22px_58px_-42px_rgba(55,79,96,.28)] sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#3f5f74]">
          Étape 3 · Validation Campus Allemagne
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">Nous examinons votre dossier</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#586168]">
          Vos trois pièces obligatoires sont validées. Campus Allemagne analyse maintenant votre orientation et vos preuves pour proposer le parcours adapté.
        </p>
        <p className="mt-4 inline-flex rounded-full border border-[#c7d6df] bg-white/65 px-3 py-1.5 text-sm font-bold text-[#334b5d]">Aucune action requise de votre part pour le moment.</p>
      </section>
    );
  }

  if (intake.status === "route_proposed") {
    return (
      <ProposalDecisionPanel
        routeKey={intake.proposed_route_key}
        rationale={intake.proposal_reason}
        offer={offer ?? null}
        paymentEnabled={paymentEnabled}
      />
    );
  }


  if (intake.status === "payment_pending") {
    return (
      <section className="mt-6 relative overflow-hidden rounded-[1.35rem] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[0_22px_58px_-42px_rgba(216,6,33,.28)] sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
          Proposition acceptée · Paiement attendu
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">Votre place dans la phase suivante est réservée après paiement</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Vous avez accepté la proposition Campus Allemagne. L’espace Étudiant reste verrouillé jusqu’à la confirmation du paiement puis à sa validation Campus.
        </p>
        <Link
          href="/prospect/payment"
          className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
        >
          Ouvrir mon paiement
        </Link>
      </section>
    );
  }

  if (intake.status === "paid_pending_validation") {
    return (
      <section className="mt-6 relative overflow-hidden rounded-[1.35rem] border border-[#c7d6df] bg-[#f2f6f8] p-5 shadow-[0_22px_58px_-42px_rgba(55,79,96,.28)] sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#3f5f74]">
          Paiement reçu · Validation Campus
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">Nous validons votre paiement</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#586168]">
          Le paiement a été enregistré. La phase suivante reste verrouillée jusqu’à la validation interne de Campus Allemagne.
        </p>
        <p className="mt-4 inline-flex rounded-full border border-[#c7d6df] bg-white/65 px-3 py-1.5 text-sm font-bold text-[#334b5d]">Aucune autre action n’est requise pour le moment.</p>
      </section>
    );
  }

  if (intake.status === "student_question") {
    return (
      <section className="mt-6 relative overflow-hidden rounded-[1.35rem] border border-[#ead59a] bg-[#fff9e9] p-5 shadow-[0_22px_58px_-42px_rgba(139,98,0,.26)] sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#7b5900]">
          Parcours à revoir
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">Votre demande a été transmise</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#586168]">
          Campus Allemagne doit revoir avec vous le parcours proposé avant toute création de procédure.
        </p>
      </section>
    );
  }

  if (intake.status === "procedure_created") {
    return (
      <section className="mt-6 relative overflow-hidden rounded-[1.35rem] border border-[#b9dfc8] bg-[#eff9f3] p-5 shadow-[0_22px_58px_-42px_rgba(29,139,88,.28)] sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#17603c]">
          Étape 5 · Confirmé
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">
          Parcours confirmé : {campusRouteLabel(intake.proposed_route_key)}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#586168]">
          Votre procédure Campus Allemagne a été créée. Les étapes détaillées de la procédure seront traitées dans la phase suivante.
        </p>
      </section>
    );
  }

  return null;
}
