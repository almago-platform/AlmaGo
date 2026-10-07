type RuntimeEnv = Record<string, string | undefined>;

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const MAX_MUTATION_BYTES = 1_048_576;

export type MutationRejection = {
  status: 403 | 413 | 415;
  code: "origin" | "host" | "content_type" | "body_size";
};

function normalizedOrigin(value: string | null | undefined) {
  if (!value) return null;
  const candidate = /^https?:\/\//i.test(value.trim())
    ? value.trim()
    : `https://${value.trim()}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function trustedMutationOrigins(env: RuntimeEnv = process.env) {
  const origins = new Set<string>();
  for (const value of [
    env.SITE_URL,
    env.NEXT_PUBLIC_SITE_URL,
    env.RENDER_EXTERNAL_URL,
    env.RENDER_EXTERNAL_HOSTNAME,
  ]) {
    const origin = normalizedOrigin(value);
    if (origin) origins.add(origin);
  }
  return origins;
}

function validContentType(value: string | null, pathname: string) {
  if (!value) return false;
  const mediaType = value.split(";", 1)[0]?.trim().toLowerCase();
  if (
    pathname === "/api/security/csp-report"
    && (mediaType === "application/csp-report" || mediaType === "application/reports+json")
  ) {
    return true;
  }
  if (mediaType === "application/json") return true;
  if (mediaType === "application/x-www-form-urlencoded") return true;
  if (mediaType !== "multipart/form-data") return false;
  return /;\s*boundary=[^;\s]+/i.test(value);
}

export function validateMutationRequest(
  request: Request,
  env: RuntimeEnv = process.env,
): MutationRejection | null {
  if (!MUTATION_METHODS.has(request.method.toUpperCase())) return null;

  const configuredOrigins = trustedMutationOrigins(env);
  if (configuredOrigins.size === 0 && env.NODE_ENV !== "production") {
    configuredOrigins.add(new URL(request.url).origin);
  }

  // Render routes requests by Host. X-Forwarded-Host is intentionally ignored:
  // unlike the right-most client address used only for throttling, it is not
  // needed here and a caller-provided value must never widen trusted origins.
  const host = request.headers.get("host")?.trim().toLowerCase();
  const trustedHosts = new Set(
    [...configuredOrigins].map((origin) => new URL(origin).host.toLowerCase()),
  );
  if (!host || trustedHosts.size === 0 || !trustedHosts.has(host)) {
    return { status: 403, code: "host" };
  }

  const originHeader = request.headers.get("origin");
  if (originHeader) {
    const origin = normalizedOrigin(originHeader);
    if (!origin || !configuredOrigins.has(origin)) {
      return { status: 403, code: "origin" };
    }
  } else {
    const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
    if (fetchSite && fetchSite !== "same-origin") {
      return { status: 403, code: "origin" };
    }
  }

  const rawLength = request.headers.get("content-length");
  if (rawLength) {
    const length = Number(rawLength);
    if (!Number.isSafeInteger(length) || length < 0 || length > MAX_MUTATION_BYTES) {
      return { status: 413, code: "body_size" };
    }
  }

  if (
    request.body !== null
    && !validContentType(request.headers.get("content-type"), new URL(request.url).pathname)
  ) {
    return { status: 415, code: "content_type" };
  }

  return null;
}

export function mutationRejectionResponse(rejection: MutationRejection) {
  console.warn("security_request_rejected", JSON.stringify({ reason: rejection.code }));
  return Response.json(
    { error: "Request rejected." },
    { status: rejection.status, headers: { "Cache-Control": "no-store" } },
  );
}
