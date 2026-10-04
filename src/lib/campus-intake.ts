export const campusRouteOptions = [
  { key: "study_preparation", label: "Préparation aux études" },
  { key: "studies_bachelor", label: "Études — Bachelor" },
  { key: "studies_master", label: "Études — Master" },
  { key: "study_place_search", label: "Recherche d’une place d’études" },
  { key: "standalone_language", label: "Cours de langue autonome" },
] as const;

export type CampusRouteKey = (typeof campusRouteOptions)[number]["key"];

export const starterDocumentCategories = [
  { category: "passport", label: "Passeport", required: true },
  { category: "baccalaureate", label: "Baccalauréat", required: true },
  { category: "transcripts", label: "Relevé de notes", required: true },
  { category: "language_certificate", label: "Certificat de langue", required: false },
] as const;

export const requiredStarterDocumentCategories = starterDocumentCategories
  .filter((item) => item.required)
  .map((item) => item.category);

export function campusRouteLabel(routeKey: string | null | undefined) {
  return campusRouteOptions.find((route) => route.key === routeKey)?.label ?? "Parcours à confirmer";
}

export function isCampusRouteKey(value: unknown): value is CampusRouteKey {
  return typeof value === "string" && campusRouteOptions.some((route) => route.key === value);
}

export function starterDocumentsReady(
  documents: Array<{ category: string; status: string }>,
) {
  return requiredStarterDocumentCategories.every((category) =>
    documents.some((document) => document.category === category && document.status === "approved"),
  );
}
