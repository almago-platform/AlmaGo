export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "localhost:3000";

  const normalized = /^https?:\/\//i.test(raw)
    ? raw
    : raw.startsWith("localhost")
      ? `http://${raw}`
      : `https://${raw}`;

  return new URL(normalized);
}
