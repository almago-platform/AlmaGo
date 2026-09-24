export function isHttpSourceUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
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
