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

  return program?.winter_deadline || program?.summer_deadline || null;
}
