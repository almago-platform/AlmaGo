export const BRAND_NAME = "Campus Allemagne";
export const LEGACY_BRAND_NAME = "AlmaGo";

export function brandText(value: string) {
  return value.replaceAll(LEGACY_BRAND_NAME, BRAND_NAME);
}

export function rebrandCopy<T>(value: T): T {
  if (typeof value === "string") return brandText(value) as T;
  if (Array.isArray(value)) return value.map((item) => rebrandCopy(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, rebrandCopy(item)]),
    ) as T;
  }
  return value;
}
