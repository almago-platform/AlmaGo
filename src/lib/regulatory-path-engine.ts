export const regulatoryRoutes = [
  "STUDIUM",
  "STUDIENVORBEREITUNG",
  "STUDIENPLATZSUCHE",
  "SPRACHKURS",
] as const;

export const regulatoryDecisionStatuses = [
  "confirmed_basis",
  "candidate",
  "blocked",
] as const;

export const regulatoryProjectPaths = [
  "university_search",
  "german_preparation_and_studies",
  "master_and_language",
  "language_only",
] as const;

export type RegulatoryRoute = (typeof regulatoryRoutes)[number];
export type RegulatoryDecisionStatus = (typeof regulatoryDecisionStatuses)[number];
export type RegulatoryProjectPath = (typeof regulatoryProjectPaths)[number];

export type RegulatoryPathFacts = {
  project_path: string | null;
  accepted_definitive_admission: boolean;
  accepted_preparatory_basis: boolean;
  has_publishable_study_preparation_course: boolean;
  has_pending_academic_review: boolean;
  has_replacement_required: boolean;
};

export type RegulatoryFactKey = keyof RegulatoryPathFacts;

export type RegulatoryPathDecision = {
  route: RegulatoryRoute | null;
  status: RegulatoryDecisionStatus;
  reason_code:
    | "definitive_admission_accepted"
    | "preparatory_basis_and_course_confirmed"
    | "preparatory_course_missing"
    | "academic_evidence_replacement_required"
    | "academic_evidence_pending_review"
    | "language_only_project"
    | "study_place_search_candidate"
    | "project_path_missing_or_unknown";
  used_facts: RegulatoryFactKey[];
  missing_facts: RegulatoryFactKey[];
  student_explanation: string;
};

function isProjectPath(value: string | null): value is RegulatoryProjectPath {
  return typeof value === "string"
    && regulatoryProjectPaths.includes(value as RegulatoryProjectPath);
}

function decision(
  route: RegulatoryRoute | null,
  status: RegulatoryDecisionStatus,
  reason_code: RegulatoryPathDecision["reason_code"],
  used_facts: RegulatoryFactKey[],
  missing_facts: RegulatoryFactKey[],
  student_explanation: string,
): RegulatoryPathDecision {
  return {
    route,
    status,
    reason_code,
    used_facts,
    missing_facts,
    student_explanation,
  };
}

export function determineRegulatoryPath(
  facts: RegulatoryPathFacts,
): RegulatoryPathDecision {
  if (facts.accepted_definitive_admission) {
    return decision(
      "STUDIUM",
      "confirmed_basis",
      "definitive_admission_accepted",
      ["accepted_definitive_admission"],
      [],
      "Une admission définitive a été vérifiée et acceptée comme preuve académique. Cette base correspond au parcours études.",
    );
  }

  if (facts.accepted_preparatory_basis) {
    if (facts.has_publishable_study_preparation_course) {
      return decision(
        "STUDIENVORBEREITUNG",
        "confirmed_basis",
        "preparatory_basis_and_course_confirmed",
        [
          "accepted_preparatory_basis",
          "has_publishable_study_preparation_course",
        ],
        [],
        "Une base académique préparatoire acceptée et un cours préparatoire vérifié sont présents. Cette combinaison correspond au parcours de préparation aux études.",
      );
    }

    return decision(
      null,
      "blocked",
      "preparatory_course_missing",
      ["accepted_preparatory_basis"],
      ["has_publishable_study_preparation_course"],
      "La base académique préparatoire est acceptée, mais un cours préparatoire vérifié adapté doit encore être identifié séparément avant de confirmer ce parcours.",
    );
  }

  if (facts.has_replacement_required) {
    return decision(
      null,
      "blocked",
      "academic_evidence_replacement_required",
      ["has_replacement_required"],
      ["accepted_definitive_admission", "accepted_preparatory_basis"],
      "Une preuve académique doit être remplacée avant de déterminer le parcours à partir de cette preuve.",
    );
  }

  if (facts.has_pending_academic_review) {
    return decision(
      null,
      "blocked",
      "academic_evidence_pending_review",
      ["has_pending_academic_review"],
      ["accepted_definitive_admission", "accepted_preparatory_basis"],
      "Une preuve académique est encore en cours de vérification. Le parcours sera réévalué lorsque son statut sera confirmé.",
    );
  }

  if (!isProjectPath(facts.project_path)) {
    return decision(
      null,
      "blocked",
      "project_path_missing_or_unknown",
      [],
      ["project_path"],
      "Le projet d’études ou de langue doit être précisé avant de proposer un parcours réglementaire.",
    );
  }

  if (facts.project_path === "language_only") {
    return decision(
      "SPRACHKURS",
      "candidate",
      "language_only_project",
      ["project_path"],
      [],
      "Votre projet actuel concerne uniquement un séjour linguistique. Le parcours cours de langue correspond à cet objectif et doit encore être vérifié dans le dossier réglementaire.",
    );
  }

  return decision(
    "STUDIENPLATZSUCHE",
    "candidate",
    "study_place_search_candidate",
    ["project_path"],
    ["accepted_definitive_admission", "accepted_preparatory_basis"],
    "Vous cherchez encore une place d’études en Allemagne sans admission acceptée à ce stade. Le parcours de recherche de place est à examiner, sans préjuger de la décision réglementaire finale.",
  );
}
