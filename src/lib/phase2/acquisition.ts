export const acquisitionSourceKinds = [
  "qr",
  "referral",
  "ambassador",
  "campaign",
] as const;

export type AcquisitionSourceKind = (typeof acquisitionSourceKinds)[number];

export type AcquisitionContext = {
  kind: AcquisitionSourceKind;
  sourceId: string;
};

const SOURCE_ID_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;

export function isPhase2AttributionEnabled() {
  return process.env.ALMAGO_PHASE2_ATTRIBUTION_ENABLED === "true";
}

export function normalizeAcquisitionContext(
  kindValue: unknown,
  sourceIdValue: unknown,
): AcquisitionContext | null {
  if (typeof kindValue !== "string" || typeof sourceIdValue !== "string") {
    return null;
  }

  const kind = kindValue.trim().toLowerCase();
  const sourceId = sourceIdValue.trim().toLowerCase();

  if (!(acquisitionSourceKinds as readonly string[]).includes(kind)) {
    return null;
  }

  if (!SOURCE_ID_RE.test(sourceId)) {
    return null;
  }

  return {
    kind: kind as AcquisitionSourceKind,
    sourceId,
  };
}

export function acquisitionContextFromSearchParams(
  searchParams: Pick<URLSearchParams, "get">,
): AcquisitionContext | null {
  return normalizeAcquisitionContext(
    searchParams.get("src"),
    searchParams.get("ref"),
  );
}

export function acquisitionContextFromStoredInput(
  input: unknown,
): AcquisitionContext | null {
  if (!input || typeof input !== "object") return null;

  const acquisition = (input as Record<string, unknown>).acquisition;
  if (!acquisition || typeof acquisition !== "object") return null;

  const record = acquisition as Record<string, unknown>;
  return normalizeAcquisitionContext(record.kind, record.sourceId);
}

export function buildAcquisitionOrientationHref(
  kindValue: unknown,
  sourceIdValue: unknown,
): string | null {
  const context = normalizeAcquisitionContext(kindValue, sourceIdValue);
  if (!context) return null;

  const params = new URLSearchParams({
    src: context.kind,
    ref: context.sourceId,
  });

  return `/orientation?${params.toString()}`;
}
