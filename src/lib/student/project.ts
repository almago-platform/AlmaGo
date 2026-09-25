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
  notes?: unknown;
};

const optionalText = (value: unknown, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

export function parseStudentProject(input: StudentProjectInput) {
  if (typeof input.path !== "string" || !projectPaths.includes(input.path as ProjectPath)) {
    return { error: "Choisissez un parcours valide." } as const;
  }
  const cities = Array.isArray(input.preferred_cities)
    ? [...new Set(input.preferred_cities.filter((city): city is string => typeof city === "string").map(city => city.trim()).filter(Boolean))].slice(0, 10)
    : [];
  return { data: {
    path: input.path as ProjectPath,
    target_degree: optionalText(input.target_degree, 120),
    target_field: optionalText(input.target_field, 160),
    target_intake: optionalText(input.target_intake, 80),
    preferred_cities: cities,
    current_german_level: optionalText(input.current_german_level, 40),
    target_german_level: optionalText(input.target_german_level, 40),
    notes: optionalText(input.notes, 2000),
  } } as const;
}
