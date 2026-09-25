export type AcademicMatchStatus =
  | "eligible_for_review"
  | "needs_manual_review"
  | "excluded";

export type ApplicationRoute = "uni_assist" | "unknown";

export type StudentProjectForAcademicMatch = {
  target_degree?: string | null;
  target_field?: string | null;
  target_intake?: string | null;
  preferred_study_language?: string | null;
  preferred_cities?: string[] | null;
  current_diploma?: string | null;
  current_german_level?: string | null;
};

export type ProgramForAcademicMatch = {
  degree_level: string;
  field?: string | null;
  teaching_language?: string | null;
  intake_terms?: string[] | null;
  winter_deadline?: string | null;
  summer_deadline?: string | null;
  application_url?: string | null;
  source_url?: string | null;
  verified_at?: string | null;
  is_active: boolean;
  uni_assist_required?: boolean | null;
  diploma_required?: string | null;
  german_level_required?: string | null;
  english_level_required?: string | null;
  university_city?: string | null;
};

export type AcademicMatchResult = {
  status: AcademicMatchStatus;
  application_route: ApplicationRoute;
  reasons: string[];
  manual_checks: string[];
  preference_notes: string[];
};

function normalized(value: string | null | undefined) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function validHttpUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validVerificationTimestamp(value: string | null | undefined, now: Date) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= now.getTime();
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
  if (
    text.includes("winter") ||
    text.includes("hiver") ||
    text.includes("wintersemester") ||
    /(^|\s)ws(\s|$)/.test(text)
  ) return "winter";
  if (
    text.includes("summer") ||
    text.includes("sommer") ||
    text.includes("ete") ||
    text.includes("sommersemester") ||
    /(^|\s)ss(\s|$)/.test(text)
  ) return "summer";
  return null;
}

function isValidDateOnly(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
}

function dateOnlyNow(now: Date) {
  return now.toISOString().slice(0, 10);
}

function cefrRank(value: string | null | undefined) {
  const match = normalized(value).toUpperCase().match(/\b(A1|A2|B1|B2|C1|C2)\b/);
  if (!match) return null;
  return ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(match[1]);
}

function tokenOverlap(a: string | null | undefined, b: string | null | undefined) {
  const tokens = (value: string | null | undefined) =>
    new Set(normalized(value).split(/[^a-z0-9]+/).filter((token) => token.length >= 3));
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return null;
  return [...left].some((token) => right.has(token));
}

export function evaluateAcademicMatch(
  project: StudentProjectForAcademicMatch,
  program: ProgramForAcademicMatch,
  now: Date = new Date(),
): AcademicMatchResult {
  const reasons: string[] = [];
  const manualChecks: string[] = [];
  const preferenceNotes: string[] = [];
  const route: ApplicationRoute = program.uni_assist_required ? "uni_assist" : "unknown";

  if (!program.is_active) reasons.push("Programme inactif.");
  if (!validHttpUrl(program.source_url)) reasons.push("Source officielle du programme absente ou invalide.");
  if (!validHttpUrl(program.application_url)) reasons.push("Lien de candidature absent ou invalide.");
  if (!validVerificationTimestamp(program.verified_at, now)) reasons.push("Programme non vérifié avec une date valide.");

  const targetDegree = degreeFamily(project.target_degree);
  const programDegree = degreeFamily(program.degree_level);
  if (targetDegree && programDegree && targetDegree !== programDegree) {
    reasons.push("Niveau de diplôme incompatible avec le projet.");
  }

  const targetIntake = intakeFamily(project.target_intake);
  const programIntakes = (program.intake_terms || [])
    .map((value) => intakeFamily(value))
    .filter((value): value is string => Boolean(value));
  if (targetIntake && programIntakes.length && !programIntakes.includes(targetIntake)) {
    reasons.push("Rentrée souhaitée non proposée dans les intakes structurés du programme.");
  }

  const targetDeadline = targetIntake === "winter"
    ? program.winter_deadline
    : targetIntake === "summer"
      ? program.summer_deadline
      : null;
  if (targetIntake && targetDeadline) {
    if (!isValidDateOnly(targetDeadline)) {
      manualChecks.push("Deadline structurée invalide : vérification officielle nécessaire.");
    } else if (targetDeadline < dateOnlyNow(now)) {
      reasons.push("Deadline enregistrée dépassée pour la rentrée ciblée.");
    }
  } else if (targetIntake) {
    manualChecks.push("Deadline absente : aucune date ne doit être inventée.");
  }

  const fieldOverlap = tokenOverlap(project.target_field, program.field);
  if (fieldOverlap === false) {
    manualChecks.push("Compatibilité du domaine à vérifier manuellement.");
  } else if (project.target_field && !program.field) {
    manualChecks.push("Domaine du programme non structuré.");
  }

  const languageOverlap = tokenOverlap(project.preferred_study_language, program.teaching_language);
  if (languageOverlap === false) {
    manualChecks.push("Langue d’études à vérifier manuellement.");
  } else if (project.preferred_study_language && !program.teaching_language) {
    manualChecks.push("Langue d’enseignement non structurée.");
  }

  if (program.diploma_required) {
    if (!project.current_diploma) {
      manualChecks.push("Diplôme actuel manquant pour vérifier le prérequis.");
    } else {
      manualChecks.push("Compatibilité du diplôme à confirmer : le prérequis est encore en texte libre.");
    }
  }

  if (program.german_level_required) {
    const required = cefrRank(program.german_level_required);
    const current = cefrRank(project.current_german_level);
    if (required === null || current === null) {
      manualChecks.push("Niveau d’allemand à vérifier manuellement.");
    } else if (current < required) {
      manualChecks.push("Niveau d’allemand actuel inférieur au niveau indiqué par le programme.");
    }
  }

  if (program.english_level_required) {
    manualChecks.push("Niveau d’anglais non structuré dans le projet étudiant : vérification nécessaire.");
  }

  const preferredCities = (project.preferred_cities || []).map(normalized).filter(Boolean);
  if (preferredCities.length && program.university_city) {
    const city = normalized(program.university_city);
    if (!preferredCities.includes(city)) {
      preferenceNotes.push("Ville hors préférences actuelles de l’étudiant.");
    }
  }

  return {
    status: reasons.length
      ? "excluded"
      : manualChecks.length
        ? "needs_manual_review"
        : "eligible_for_review",
    application_route: route,
    reasons,
    manual_checks: manualChecks,
    preference_notes: preferenceNotes,
  };
}
