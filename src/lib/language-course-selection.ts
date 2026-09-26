const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseLanguageCourseSelectionInput(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false as const, error: "Données invalides." };
  }
  const entries = Object.keys(input as Record<string, unknown>);
  if (entries.length !== 1 || entries[0] !== "language_course_id") {
    return { ok: false as const, error: "Données invalides." };
  }
  const id = (input as Record<string, unknown>).language_course_id;
  if (typeof id !== "string" || !uuidPattern.test(id)) {
    return { ok: false as const, error: "Cours de langue invalide." };
  }
  return { ok: true as const, value: { language_course_id: id } };
}
