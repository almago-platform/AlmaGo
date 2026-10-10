import { createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";

type RuntimeEnv = Record<string, string | undefined>;

export type RateWindow = {
  limit: number;
  windowMs: number;
};

export type AbusePolicy = {
  route: string;
  burst: RateWindow;
  sustained: RateWindow;
  global?: RateWindow;
};

export const PUBLIC_ABUSE_POLICIES = {
  orientationEngine: {
    route: "orientation_engine",
    burst: { limit: 5, windowMs: 60_000 },
    sustained: { limit: 20, windowMs: 60 * 60_000 },
    global: { limit: 100, windowMs: 24 * 60 * 60_000 },
  },
  orientationPreview: {
    route: "orientation_preview",
    burst: { limit: 12, windowMs: 60_000 },
    sustained: { limit: 40, windowMs: 60 * 60_000 },
    global: { limit: 200, windowMs: 24 * 60 * 60_000 },
  },
  orientationProspect: {
    route: "orientation_prospect",
    burst: { limit: 3, windowMs: 10 * 60_000 },
    sustained: { limit: 10, windowMs: 24 * 60 * 60_000 },
  },
  orientationInterest: {
    route: "orientation_interest",
    burst: { limit: 10, windowMs: 10 * 60_000 },
    sustained: { limit: 60, windowMs: 24 * 60 * 60_000 },
  },
  orientationAccountMutation: {
    route: "orientation_account_mutation",
    burst: { limit: 5, windowMs: 10 * 60_000 },
    sustained: { limit: 20, windowMs: 24 * 60 * 60_000 },
  },
  cspReport: {
    route: "csp_report",
    burst: { limit: 20, windowMs: 60_000 },
    sustained: { limit: 200, windowMs: 24 * 60 * 60_000 },
  },
} satisfies Record<string, AbusePolicy>;

type Counter = {
  count: number;
  expiresAt: number;
};

const MAX_COUNTERS = 10_000;
const PROCESS_SALT = randomBytes(32);
const counters = new Map<string, Counter>();
const concurrency = new Map<string, number>();

function validForwardedAddress(value: string | undefined) {
  if (!value) return null;
  const candidate = value.trim();
  if (!candidate || candidate.length > 64) return null;

  if (candidate.startsWith("[") && candidate.includes("]")) {
    const closing = candidate.indexOf("]");
    const address = candidate.slice(1, closing);
    return isIP(address) ? address : null;
  }

  if (isIP(candidate)) return candidate;

  const ipv4WithPort = candidate.match(/^([^:]+):\d+$/);
  return ipv4WithPort && isIP(ipv4WithPort[1]) === 4
    ? ipv4WithPort[1]
    : null;
}

/**
 * Render terminates public traffic before it reaches the application and sets
 * the first X-Forwarded-For entry to the real client address. Never trust a
 * later hop here: user-supplied X-Forwarded-For values can otherwise let a
 * caller rotate rate-limit identities. Outside Render, forwarded headers are
 * not trusted and callers share a fail-closed anonymous bucket.
 */
export function resolveTrustedClientAddress(
  headers: Headers,
  env: RuntimeEnv = process.env,
) {
  if (!env.RENDER) return null;

  const chain = headers.get("x-forwarded-for");
  if (!chain) return null;

  const first = chain.split(",", 1)[0];
  return validForwardedAddress(first);
}

function digest(value: string) {
  return createHash("sha256")
    .update(PROCESS_SALT)
    .update("\0")
    .update(value)
    .digest("base64url");
}

function prune(now: number) {
  if (counters.size < MAX_COUNTERS) return;

  for (const [key, counter] of counters) {
    if (counter.expiresAt <= now) counters.delete(key);
  }

  while (counters.size >= MAX_COUNTERS) {
    const oldest = counters.keys().next().value;
    if (typeof oldest !== "string") break;
    counters.delete(oldest);
  }
}

function consume(key: string, window: RateWindow, now: number) {
  const existing = counters.get(key);
  if (!existing || existing.expiresAt <= now) {
    prune(now);
    counters.set(key, { count: 1, expiresAt: now + window.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= window.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.expiresAt - now) / 1_000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function limitedResponse(route: string, reason: string, retryAfterSeconds: number) {
  console.warn("security_rate_limit", JSON.stringify({ route, reason }));
  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export function enforceRequestRateLimit(
  request: Request,
  policy: AbusePolicy,
  options: { accountId?: string | null; now?: number } = {},
) {
  const now = options.now ?? Date.now();
  const address = resolveTrustedClientAddress(request.headers) ?? "untrusted";
  const principal = options.accountId
    ? `account:${digest(options.accountId)}`
    : `ip:${digest(address)}`;

  const burst = consume(
    `${policy.route}:${principal}:burst`,
    policy.burst,
    now,
  );
  if (!burst.allowed) {
    return limitedResponse(policy.route, "burst", burst.retryAfterSeconds);
  }

  const sustained = consume(
    `${policy.route}:${principal}:sustained`,
    policy.sustained,
    now,
  );
  if (!sustained.allowed) {
    return limitedResponse(policy.route, "sustained", sustained.retryAfterSeconds);
  }

  if (policy.global) {
    const global = consume(
      `${policy.route}:global`,
      policy.global,
      now,
    );
    if (!global.allowed) {
      return limitedResponse(policy.route, "budget", global.retryAfterSeconds);
    }
  }

  return null;
}

export function acquireRequestConcurrency(route: string, limit: number) {
  const active = concurrency.get(route) ?? 0;
  if (active >= limit) return null;

  concurrency.set(route, active + 1);
  let released = false;

  return {
    release() {
      if (released) return;
      released = true;
      const current = concurrency.get(route) ?? 1;
      if (current <= 1) concurrency.delete(route);
      else concurrency.set(route, current - 1);
    },
  };
}

export function concurrencyLimitedResponse(route: string) {
  return limitedResponse(route, "concurrency", 5);
}

export function resetAbuseStateForTests() {
  if (process.env.NODE_ENV !== "test") return;
  counters.clear();
  concurrency.clear();
}
