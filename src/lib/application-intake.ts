export function applicationIntakeFromTerms(value: unknown) {
  if (!Array.isArray(value)) return null;

  const terms = [...new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean),
  )];

  return terms.length === 1 ? terms[0] : null;
}

export function deadlineForIntake(
  program: {
    winter_deadline?: string | null;
    summer_deadline?: string | null;
  } | null | undefined,
  intake: string | null,
) {
  const normalized = intake?.trim().toLocaleLowerCase("en") || "";

  if (normalized.includes("summer") || normalized.includes("sommer")) {
    return program?.summer_deadline || null;
  }

  if (normalized.includes("winter")) {
    return program?.winter_deadline || null;
  }

  return null;
}
