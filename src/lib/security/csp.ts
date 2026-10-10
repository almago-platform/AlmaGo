type RuntimeEnv = Record<string, string | undefined>;

function supabaseConnectSources(env: RuntimeEnv) {
  const raw = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];

  try {
    const url = new URL(raw);
    const websocket = new URL(url.origin);
    websocket.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return [url.origin, websocket.origin];
  } catch {
    return [];
  }
}

function validNonce(nonce: string) {
  return /^[A-Za-z0-9_-]{8,128}$/.test(nonce);
}

export function buildContentSecurityPolicy(
  nonce: string,
  env: RuntimeEnv = process.env,
) {
  if (!validNonce(nonce)) {
    throw new Error("Invalid CSP nonce.");
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.pexels.com https://images.unsplash.com https://upload.wikimedia.org https://thumb.wikimedia.org",
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseConnectSources(env).join(" ")}`.trim(),
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "report-uri /api/security/csp-report",
  ].join("; ");
}
