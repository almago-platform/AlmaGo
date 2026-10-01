export function isPublicIndexingEnabled() {
  return process.env.ALMAGO_PUBLIC_INDEXING_ENABLED === "true";
}
