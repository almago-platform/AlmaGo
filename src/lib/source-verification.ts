export function isHttpSourceUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function sourceUrlsChanged(current: unknown[], next: unknown[]) {
  const normalize = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;

  if (current.length !== next.length) return true;
  return current.some((value, index) => normalize(value) !== normalize(next[index]));
}

export function hasVerifiedProgramSource(program: {
  source_url?: string | null;
  application_url?: string | null;
  verified_at?: string | null;
} | null | undefined) {
  return Boolean(
    program?.verified_at &&
    (isHttpSourceUrl(program.source_url) || isHttpSourceUrl(program.application_url)),
  );
}

export function hasVerifiedUniversitySource(university: {
  source_url?: string | null;
  website_url?: string | null;
  verified_at?: string | null;
} | null | undefined) {
  return Boolean(
    university?.verified_at &&
    (isHttpSourceUrl(university.source_url) || isHttpSourceUrl(university.website_url)),
  );
}

export function isPublishableProgram(program: {
  is_active?: boolean | null;
  source_url?: string | null;
  application_url?: string | null;
  verified_at?: string | null;
  universities?: { is_active?: boolean | null } | { is_active?: boolean | null }[] | null;
} | null | undefined) {
  const university = Array.isArray(program?.universities)
    ? program?.universities[0]
    : program?.universities;

  return (
    program?.is_active === true &&
    university?.is_active === true &&
    hasVerifiedProgramSource(program)
  );
}


export function isKnownCatalogueFixtureName(value: unknown) {
  if (typeof value !== "string") return false;

  const normalized = value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  return (
    normalized === "aa" ||
    normalized.startsWith("almago test university") ||
    normalized.startsWith("almago test program")
  );
}
