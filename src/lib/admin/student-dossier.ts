export const adminDossierLifecycle = [
  "Orientation",
  "Documents",
  "Analyse Campus",
  "Proposition",
  "Paiement",
  "Étudiant",
  "Candidatures",
] as const;

export type AdminDossierStageStatus = "done" | "active" | "upcoming" | "locked";

export function adminDossierStageIndex(
  intakeStatus: string | null | undefined,
  hasApplications: boolean,
) {
  if (hasApplications) return 6;
  if (intakeStatus === "procedure_created") return 5;
  if (intakeStatus === "payment_pending" || intakeStatus === "paid_pending_validation") return 4;
  if (intakeStatus === "route_proposed" || intakeStatus === "student_question") return 3;
  if (intakeStatus === "campus_review") return 2;
  if (intakeStatus === "starter_documents") return 1;
  return 0;
}

export function adminDossierLifecycleStatus(
  index: number,
  currentIndex: number,
): AdminDossierStageStatus {
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "active";
  if (index === 5 && currentIndex < 5) return "locked";
  return "upcoming";
}

export function adminDossierStatusLabel(status: string | null | undefined) {
  if (status === "starter_documents") return "Pièces à compléter / vérifier";
  if (status === "campus_review") return "Décision Campus requise";
  if (status === "route_proposed") return "Proposition envoyée · réponse attendue";
  if (status === "student_question") return "Discussion demandée par l’étudiant";
  if (status === "payment_pending") return "Paiement attendu";
  if (status === "paid_pending_validation") return "Paiement reçu · validation requise";
  if (status === "procedure_created") return "Espace étudiant activé";
  return "Dossier en préparation";
}

export function adminDossierStatusVariant(status: string | null | undefined) {
  if (status === "student_question" || status === "paid_pending_validation") return "warning" as const;
  if (status === "campus_review" || status === "route_proposed" || status === "payment_pending") return "info" as const;
  if (status === "procedure_created") return "success" as const;
  return "neutral" as const;
}

export function adminDossierNextAction(
  status: string | null | undefined,
  hasApplications: boolean,
) {
  if (status === "student_question") {
    return {
      title: "Répondre à la demande de discussion",
      description: "L’étudiant attend une réponse ou un ajustement de la proposition.",
      href: "/admin/intake",
      waiting: false,
    };
  }
  if (status === "campus_review") {
    return {
      title: "Décider du parcours et de l’offre",
      description: "L’orientation et les pièces disponibles sont prêtes pour la décision Campus.",
      href: "/admin/intake",
      waiting: false,
    };
  }
  if (status === "starter_documents") {
    return {
      title: "Vérifier les pièces de départ",
      description: "Le dossier ne doit pas avancer tant que les documents requis ne sont pas suffisamment vérifiés.",
      href: "/admin/documents",
      waiting: false,
    };
  }
  if (status === "paid_pending_validation") {
    return {
      title: "Valider le paiement reçu",
      description: "La validation Campus est requise avant toute activation de l’espace étudiant.",
      href: "/admin/payments",
      waiting: false,
    };
  }
  if (status === "route_proposed") {
    return {
      title: "Attendre la réponse de l’étudiant",
      description: "La proposition est envoyée. Aucune relance automatique n’est déclenchée depuis ce dossier.",
      href: null,
      waiting: true,
    };
  }
  if (status === "payment_pending") {
    return {
      title: "Attendre la réception du paiement",
      description: "L’espace étudiant reste verrouillé tant que le paiement n’est pas reçu puis validé.",
      href: null,
      waiting: true,
    };
  }
  if (status === "procedure_created") {
    return {
      title: hasApplications ? "Suivre les candidatures actives" : "Préparer la suite du dossier étudiant",
      description: hasApplications
        ? "Le dossier est actif : surveillez les échéances et les prochaines actions enregistrées."
        : "L’espace étudiant est actif. Les prochaines opérations seront pilotées depuis le suivi étudiant.",
      href: hasApplications ? "/admin/applications" : null,
      waiting: !hasApplications,
    };
  }
  return {
    title: "Compléter le contexte du dossier",
    description: "Aucune action opérationnelle plus précise n’est encore disponible.",
    href: null,
    waiting: true,
  };
}

export function customerAccessLabel(status: string | null | undefined) {
  if (status === "prospect_account") return "Prospect";
  if (status === "qualified_prospect") return "Prospect qualifié";
  if (status === "payment_pending") return "Paiement en attente";
  if (status === "paid_pending_validation") return "Paiement reçu · validation";
  if (status === "client_active") return "Étudiant actif";
  if (status === "client_completed") return "Étudiant · parcours terminé";
  return "Accès non enregistré";
}

export function purchaseStatusLabel(status: string | null | undefined) {
  if (status === "payment_pending") return "Paiement en attente";
  if (status === "paid_pending_validation") return "Paiement reçu · validation requise";
  if (status === "client_active") return "Paiement validé";
  if (status === "cancelled") return "Annulé";
  if (status === "refunded") return "Remboursé";
  return "Aucun achat";
}

export function adminDocumentState(
  rows: Array<{ category: string; status: string }>,
  category: string,
) {
  const matches = rows.filter((row) => row.category === category);
  if (matches.some((row) => row.status === "approved")) return "approved" as const;
  if (matches.some((row) => ["replace_required", "rejected"].includes(row.status))) return "replacement" as const;
  if (matches.some((row) => ["pending", "reviewed"].includes(row.status))) return "pending" as const;
  return "missing" as const;
}
