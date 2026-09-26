export const projectPaths = [
  "university_search",
  "german_preparation_and_studies",
  "master_and_language",
  "language_only",
] as const;

export type ProjectPath = (typeof projectPaths)[number];

export const projectPathOptions: ReadonlyArray<{
  value: ProjectPath;
  title: string;
  description: string;
}> = [
  { value: "university_search", title: "Trouver une université", description: "Construire un projet d’études et identifier des programmes adaptés en Allemagne." },
  { value: "german_preparation_and_studies", title: "Allemand + études", description: "Préparer votre allemand avant de commencer ou poursuivre des études." },
  { value: "master_and_language", title: "Master + langue", description: "Cibler un Master et planifier en parallèle la préparation linguistique nécessaire." },
  { value: "language_only", title: "Langue uniquement", description: "Organiser un séjour consacré à l’apprentissage de l’allemand, sans candidature universitaire à ce stade." },
];

export type StudentProjectInput = {
  path?: unknown;
  target_degree?: unknown;
  target_field?: unknown;
  target_intake?: unknown;
  preferred_cities?: unknown;
  current_german_level?: unknown;
  target_german_level?: unknown;
  current_diploma?: unknown;
  diploma_country?: unknown;
  preferred_study_language?: unknown;
  monthly_budget?: unknown;
  budget_currency?: unknown;
  actual_objective?: unknown;
  notes?: unknown;
};

const INVALID = Symbol("invalid");

function optionalText(value: unknown, max: number) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return INVALID;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.length <= max ? normalized : INVALID;
}

function countryCode(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return INVALID;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : INVALID;
}

function budgetAmount(value: unknown) {
  if (value == null || value === "") return null;
  const normalized =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+(?:[.,]\d{1,2})?$/.test(value.trim())
        ? Number(value.trim().replace(",", "."))
        : Number.NaN;

  if (!Number.isFinite(normalized) || normalized < 0 || normalized > 100000) return INVALID;
  return Math.round(normalized * 100) / 100;
}

export function parseStudentProject(input: StudentProjectInput) {
  if (typeof input.path !== "string" || !projectPaths.includes(input.path as ProjectPath)) {
    return { error: "Choisissez un parcours valide." } as const;
  }

  const targetDegree = optionalText(input.target_degree, 120);
  const targetField = optionalText(input.target_field, 160);
  const targetIntake = optionalText(input.target_intake, 80);
  const currentGermanLevel = optionalText(input.current_german_level, 40);
  const targetGermanLevel = optionalText(input.target_german_level, 40);
  const currentDiploma = optionalText(input.current_diploma, 160);
  const preferredStudyLanguage = optionalText(input.preferred_study_language, 80);
  const actualObjective = optionalText(input.actual_objective, 1200);
  const notes = optionalText(input.notes, 2000);

  if ([targetDegree, targetField, targetIntake, currentGermanLevel, targetGermanLevel, currentDiploma, preferredStudyLanguage, actualObjective, notes].includes(INVALID)) {
    return { error: "Une information saisie dépasse la longueur autorisée." } as const;
  }

  const diplomaCountry = countryCode(input.diploma_country);
  if (diplomaCountry === INVALID) {
    return { error: "Le pays du diplôme doit utiliser un code pays à deux lettres." } as const;
  }

  const monthlyBudget = budgetAmount(input.monthly_budget);
  if (monthlyBudget === INVALID) {
    return { error: "Le budget mensuel doit être compris entre 0 et 100000 EUR." } as const;
  }

  const cities = Array.isArray(input.preferred_cities)
    ? [...new Set(
        input.preferred_cities
          .filter((city): city is string => typeof city === "string")
          .map((city) => city.trim().slice(0, 100))
          .filter(Boolean),
      )].slice(0, 10)
    : [];

  return {
    data: {
      path: input.path as ProjectPath,
      target_degree: targetDegree as string | null,
      target_field: targetField as string | null,
      target_intake: targetIntake as string | null,
      preferred_cities: cities,
      current_german_level: currentGermanLevel as string | null,
      target_german_level: targetGermanLevel as string | null,
      current_diploma: currentDiploma as string | null,
      diploma_country: diplomaCountry,
      preferred_study_language: preferredStudyLanguage as string | null,
      monthly_budget: monthlyBudget,
      budget_currency: "EUR" as const,
      actual_objective: actualObjective as string | null,
      notes: notes as string | null,
    },
  } as const;
}
