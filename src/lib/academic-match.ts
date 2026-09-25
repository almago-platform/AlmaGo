export type AcademicMatchStatus = "eligible_for_review" | "needs_manual_review" | "excluded";
export type ApplicationRoute = "uni_assist" | "unknown";

export type StudentProjectForAcademicMatch = {
  target_degree?: string | null; target_field?: string | null; target_intake?: string | null;
  preferred_study_language?: string | null; preferred_cities?: string[] | null;
  current_diploma?: string | null; current_german_level?: string | null;
};

export type ProgramForAcademicMatch = {
  degree_level: string; field?: string | null; teaching_language?: string | null;
  intake_terms?: string[] | null; winter_deadline?: string | null; summer_deadline?: string | null;
  application_url?: string | null; source_url?: string | null; verified_at?: string | null;
  is_active: boolean; uni_assist_required?: boolean | null; diploma_required?: string | null;
  german_level_required?: string | null; english_level_required?: string | null;
  university_city?: string | null;
};

export type AcademicMatchResult = {
  status: AcademicMatchStatus; application_route: ApplicationRoute;
  reasons: string[]; manual_checks: string[]; preference_notes: string[];
};

const normalized = (value: string | null | undefined) => (value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

function validHttpUrl(value: string | null | undefined) {
  if (!value) return false;
  try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; }
  catch { return false; }
}

function validVerification(value: string | null | undefined, now: Date) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= now.getTime();
}

export function programPublicationIssues(
  program: Pick<ProgramForAcademicMatch, "is_active" | "source_url" | "application_url" | "verified_at">,
  now: Date = new Date(),
) {
  const issues: string[] = [];
  if (!program.is_active) issues.push("Programme inactif.");
  if (!validHttpUrl(program.source_url)) issues.push("Source officielle du programme absente ou invalide.");
  if (!validHttpUrl(program.application_url)) issues.push("Lien de candidature absent ou invalide.");
  if (!validVerification(program.verified_at, now)) issues.push("Programme non vérifié avec une date valide.");
  return issues;
}

function degreeFamily(value: string | null | undefined) {
  const text = normalized(value);
  if (text.includes("master")) return "master";
  if (text.includes("bachelor") || text.includes("licence")) return "bachelor";
  if (text.includes("studienkolleg")) return "studienkolleg";
  return text || null;
}

function intakeFamily(value: string | null | undefined) {
  const text = normalized(value);
  if (!text) return null;
  if (text.includes("winter") || text.includes("hiver") || /(^|\s)ws(\s|$)/.test(text)) return "winter";
  if (text.includes("summer") || text.includes("sommer") || text.includes("ete") || /(^|\s)ss(\s|$)/.test(text)) return "summer";
  return null;
}

function validDateOnly(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function cefrRank(value: string | null | undefined) {
  const match = normalized(value).toUpperCase().match(/\b(A1|A2|B1|B2|C1|C2)\b/);
  return match ? ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(match[1]) : null;
}

function tokenOverlap(a: string | null | undefined, b: string | null | undefined) {
  const tokens = (value: string | null | undefined) =>
    new Set(normalized(value).split(/[^a-z0-9]+/).filter((token) => token.length >= 3));
  const left = tokens(a), right = tokens(b);
  if (!left.size || !right.size) return null;
  return [...left].some((token) => right.has(token));
}

export function evaluateAcademicMatch(
  project: StudentProjectForAcademicMatch,
  program: ProgramForAcademicMatch,
  now: Date = new Date(),
): AcademicMatchResult {
  const reasons: string[] = [], manual: string[] = [], preferences: string[] = [];
  const route: ApplicationRoute = program.uni_assist_required ? "uni_assist" : "unknown";

  reasons.push(...programPublicationIssues(program, now));

  const targetDegree = degreeFamily(project.target_degree), programDegree = degreeFamily(program.degree_level);
  if (targetDegree && programDegree && targetDegree !== programDegree) reasons.push("Niveau de diplôme incompatible avec le projet.");

  const targetIntake = intakeFamily(project.target_intake);
  const intakes = (program.intake_terms || []).map(intakeFamily).filter((value): value is "winter" | "summer" => value !== null);
  if (targetIntake && intakes.length && !intakes.includes(targetIntake)) {
    reasons.push("Rentrée souhaitée non proposée dans les intakes structurés du programme.");
  }

  const deadline = targetIntake === "winter" ? program.winter_deadline : targetIntake === "summer" ? program.summer_deadline : null;
  if (targetIntake && deadline) {
    if (!validDateOnly(deadline)) manual.push("Deadline structurée invalide : vérification officielle nécessaire.");
    else if (deadline < now.toISOString().slice(0, 10)) reasons.push("Deadline enregistrée dépassée pour la rentrée ciblée.");
  } else if (targetIntake) manual.push("Deadline absente : aucune date ne doit être inventée.");

  const fieldOverlap = tokenOverlap(project.target_field, program.field);
  if (fieldOverlap === false) manual.push("Compatibilité du domaine à vérifier manuellement.");
  else if (project.target_field && !program.field) manual.push("Domaine du programme non structuré.");

  const languageOverlap = tokenOverlap(project.preferred_study_language, program.teaching_language);
  if (languageOverlap === false) manual.push("Langue d’études à vérifier manuellement.");
  else if (project.preferred_study_language && !program.teaching_language) manual.push("Langue d’enseignement non structurée.");

  if (program.diploma_required) {
    manual.push(project.current_diploma
      ? "Compatibilité du diplôme à confirmer : le prérequis est encore en texte libre."
      : "Diplôme actuel manquant pour vérifier le prérequis.");
  }

  if (program.german_level_required) {
    const required = cefrRank(program.german_level_required), current = cefrRank(project.current_german_level);
    if (required === null || current === null) manual.push("Niveau d’allemand à vérifier manuellement.");
    else if (current < required) manual.push("Niveau d’allemand actuel inférieur au niveau indiqué par le programme.");
  }
  if (program.english_level_required) manual.push("Niveau d’anglais non structuré dans le projet étudiant : vérification nécessaire.");

  const cities = (project.preferred_cities || []).map(normalized).filter(Boolean);
  if (cities.length && program.university_city && !cities.includes(normalized(program.university_city))) {
    preferences.push("Ville hors préférences actuelles de l’étudiant.");
  }

  return {
    status: reasons.length ? "excluded" : manual.length ? "needs_manual_review" : "eligible_for_review",
    application_route: route, reasons, manual_checks: manual, preference_notes: preferences,
  };
}
