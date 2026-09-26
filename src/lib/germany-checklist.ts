import type { RegulatoryPathDecision } from "@/lib/regulatory-path-engine";

export type GermanyChecklistOwner = "student" | "almago";
export type GermanyChecklistStatus = "todo" | "waiting_almago" | "completed";

export type GermanyChecklistItem = {
  key: string;
  title: string;
  owner: GermanyChecklistOwner;
  status: GermanyChecklistStatus;
  source_facts: string[];
  explanation: string;
};

export type GermanyChecklistInput = {
  project_path: string | null;
  decision: RegulatoryPathDecision;
  accepted_definitive_admission: boolean;
  accepted_preparatory_basis: boolean;
  has_publishable_study_preparation_course: boolean;
  has_publishable_standalone_language_course: boolean;
  has_pending_academic_review: boolean;
  has_replacement_required: boolean;
};

const knownProjectPaths = new Set([
  "university_search",
  "german_preparation_and_studies",
  "master_and_language",
  "language_only",
]);

function item(
  key: string,
  title: string,
  owner: GermanyChecklistOwner,
  status: GermanyChecklistStatus,
  source_facts: string[],
  explanation: string,
): GermanyChecklistItem {
  return { key, title, owner, status, source_facts, explanation };
}

export function buildGermanyChecklist(input: GermanyChecklistInput): GermanyChecklistItem[] {
  const items: GermanyChecklistItem[] = [];

  if (!input.project_path || !knownProjectPaths.has(input.project_path)) {
    return [
      item(
        "define_project",
        "Définir votre projet Allemagne",
        "student",
        "todo",
        ["project_path"],
        "Précisez votre objectif avant de calculer les étapes suivantes.",
      ),
    ];
  }

  items.push(
    item(
      "project_defined",
      "Projet Allemagne défini",
      "student",
      "completed",
      ["project_path"],
      "Votre objectif actuel est enregistré dans AlmaGo.",
    ),
  );

  if (input.has_replacement_required) {
    items.push(
      item(
        "replace_academic_evidence",
        "Remplacer ou corriger la preuve académique",
        "student",
        "todo",
        ["has_replacement_required"],
        "Une preuve académique est marquée à remplacer et ne peut pas servir de base au parcours.",
      ),
    );
    return items;
  }

  if (input.has_pending_academic_review) {
    items.push(
      item(
        "academic_evidence_review",
        "Vérification de la preuve académique",
        "almago",
        "waiting_almago",
        ["has_pending_academic_review"],
        "Une preuve est enregistrée mais doit encore être vérifiée avant de servir de base au parcours.",
      ),
    );
    return items;
  }

  if (input.accepted_definitive_admission) {
    items.push(
      item(
        "definitive_admission_basis",
        "Admission définitive acceptée comme base académique",
        "almago",
        "completed",
        ["accepted_definitive_admission", "decision:STUDIUM"],
        "Une admission définitive vérifiée est enregistrée. Cette étape décrit un fait du dossier et ne constitue pas une décision de visa.",
      ),
    );
    return items;
  }

  if (input.accepted_preparatory_basis) {
    items.push(
      item(
        "preparatory_academic_basis",
        "Base académique préparatoire acceptée",
        "almago",
        "completed",
        ["accepted_preparatory_basis"],
        "Une admission conditionnelle, Bewerberbestätigung ou autre preuve préparatoire admissible a été acceptée dans le dossier.",
      ),
    );

    items.push(
      input.has_publishable_study_preparation_course
        ? item(
            "study_preparation_course_selected",
            "Cours de préparation aux études sélectionné",
            "student",
            "completed",
            ["has_publishable_study_preparation_course"],
            "Votre projet contient un cours de préparation aux études encore publié comme fiche vérifiée.",
          )
        : item(
            "select_study_preparation_course",
            "Choisir un cours de préparation aux études vérifié",
            "student",
            "todo",
            ["accepted_preparatory_basis", "has_publishable_study_preparation_course:false"],
            "La base académique préparatoire est acceptée, mais aucun cours préparatoire vérifié n’est actuellement sélectionné dans votre projet.",
          ),
    );
    return items;
  }

  if (input.project_path === "language_only") {
    items.push(
      input.has_publishable_standalone_language_course
        ? item(
            "standalone_language_course_selected",
            "Cours de langue autonome sélectionné",
            "student",
            "completed",
            ["project_path:language_only", "has_publishable_standalone_language_course"],
            "Un cours de langue autonome encore publié comme fiche vérifiée est associé à votre projet.",
          )
        : item(
            "select_standalone_language_course",
            "Choisir un cours de langue autonome vérifié",
            "student",
            "todo",
            ["project_path:language_only", "has_publishable_standalone_language_course:false"],
            "Votre projet est linguistique, mais aucun cours autonome vérifié n’est actuellement sélectionné.",
          ),
    );
    return items;
  }

  if (input.decision.route === "STUDIENPLATZSUCHE") {
    items.push(
      item(
        "continue_academic_search",
        "Continuer la recherche de programme et de base académique",
        "student",
        "todo",
        ["decision:STUDIENPLATZSUCHE"],
        "Aucune admission acceptée n’est enregistrée. Continuez l’orientation et les candidatures jusqu’à obtenir une base académique vérifiable.",
      ),
    );
  }

  return items;
}
