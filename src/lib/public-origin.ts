import { headers } from "next/headers";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function isLoopbackHost(hostname: string) {
  return LOOPBACK_HOSTS.has(hostname.toLowerCase());
}

function normalizePublicOrigin(value: string | null | undefined): URL | null {
  const raw = value?.trim();
  if (!raw) return null;

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && isLoopbackHost(url.hostname))) {
      return null;
    }
    return new URL(url.origin);
  } catch {
    return null;
  }
}

async function getRequestOrigin(): Promise<URL | null> {
  try {
    const store = await headers();
    const forwardedHost = store.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || store.get("host")?.split(",")[0]?.trim();
    if (!host) return null;

    const forwardedProtocol = store.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const protocol =
      forwardedProtocol === "http" || forwardedProtocol === "https"
        ? forwardedProtocol
        : host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("[::1]")
          ? "http"
          : "https";

    return normalizePublicOrigin(`${protocol}://${host}`);
  } catch {
    return null;
  }
}

export async function getPublicOrigin(): Promise<URL> {
  for (const configured of [process.env.SITE_URL, process.env.NEXT_PUBLIC_SITE_URL]) {
    const origin = normalizePublicOrigin(configured);
    if (origin) return origin;
  }

  const requestOrigin = await getRequestOrigin();
  if (requestOrigin && !isLoopbackHost(requestOrigin.hostname)) {
    return requestOrigin;
  }

  for (const providerOrigin of [
    process.env.RENDER_EXTERNAL_URL,
    process.env.RENDER_EXTERNAL_HOSTNAME,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]) {
    const origin = normalizePublicOrigin(providerOrigin);
    if (origin) return origin;
  }

  if (requestOrigin) return requestOrigin;

  if (process.env.NODE_ENV !== "production") {
    return new URL("http://localhost:3000");
  }

  throw new Error(
    "Unable to determine the public site origin. Configure SITE_URL or provide a trusted deployment/request host.",
  );
}
