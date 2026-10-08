import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  acquireRequestConcurrency,
  enforceRequestRateLimit,
  resolveTrustedClientAddress,
} from "../src/lib/security/abuse.ts";

const root = new URL("../", import.meta.url);

test("forwarded client addresses are trusted only on Render and use Render's first canonical hop", () => {
  const headers = new Headers({
    "x-forwarded-for": "198.51.100.7, 203.0.113.9",
  });

  assert.equal(resolveTrustedClientAddress(headers, {}), null);
  assert.equal(
    resolveTrustedClientAddress(headers, { RENDER: "true" }),
    "198.51.100.7",
  );
  assert.equal(
    resolveTrustedClientAddress(
      new Headers({ "x-forwarded-for": "spoofed, 203.0.113.9" }),
      { RENDER: "true" },
    ),
    null,
  );
});

test("public limiter applies burst and sustained ceilings with a generic response", async () => {
  const previousRender = process.env.RENDER;
  process.env.RENDER = "true";
  const policy = {
    route: `test_public_${Date.now()}`,
    burst: { limit: 2, windowMs: 1_000 },
    sustained: { limit: 3, windowMs: 10_000 },
  };
  const request = new Request("https://example.test/api", {
    headers: { "x-forwarded-for": "198.51.100.10" },
  });

  try {
    assert.equal(enforceRequestRateLimit(request, policy, { now: 0 }), null);
    assert.equal(enforceRequestRateLimit(request, policy, { now: 1 }), null);

    const burst = enforceRequestRateLimit(request, policy, { now: 2 });
    assert.equal(burst?.status, 429);
    assert.equal(burst?.headers.get("retry-after"), "1");
    assert.deepEqual(await burst?.json(), {
      error: "Too many requests. Please try again later.",
    });

    assert.equal(enforceRequestRateLimit(request, policy, { now: 1_001 }), null);
    assert.equal(
      enforceRequestRateLimit(request, policy, { now: 1_002 })?.status,
      429,
    );
  } finally {
    if (previousRender === undefined) delete process.env.RENDER;
    else process.env.RENDER = previousRender;
  }
});

test("account ceilings do not collapse distinct accounts behind one address", () => {
  const policy = {
    route: `test_account_${Date.now()}`,
    burst: { limit: 1, windowMs: 60_000 },
    sustained: { limit: 1, windowMs: 60_000 },
  };
  const request = new Request("https://example.test/api");

  assert.equal(
    enforceRequestRateLimit(request, policy, { accountId: "account-a", now: 0 }),
    null,
  );
  assert.equal(
    enforceRequestRateLimit(request, policy, { accountId: "account-b", now: 0 }),
    null,
  );
  assert.equal(
    enforceRequestRateLimit(request, policy, { accountId: "account-a", now: 1 })?.status,
    429,
  );
});

test("one account cannot multiply its quota across client addresses", () => {
  const previousRender = process.env.RENDER;
  process.env.RENDER = "true";
  const policy = {
    route: `test_account_addresses_${Date.now()}`,
    burst: { limit: 1, windowMs: 60_000 },
    sustained: { limit: 1, windowMs: 60_000 },
  };

  try {
    const first = new Request("https://example.test/api", {
      headers: { "x-forwarded-for": "198.51.100.20" },
    });
    const second = new Request("https://example.test/api", {
      headers: { "x-forwarded-for": "198.51.100.21" },
    });
    assert.equal(enforceRequestRateLimit(first, policy, { accountId: "same-account", now: 0 }), null);
    assert.equal(
      enforceRequestRateLimit(second, policy, { accountId: "same-account", now: 1 })?.status,
      429,
    );
  } finally {
    if (previousRender === undefined) delete process.env.RENDER;
    else process.env.RENDER = previousRender;
  }
});

test("daily AI budget is global and recovers after its window", async () => {
  const policy = {
    route: `test_daily_budget_${Date.now()}`,
    burst: { limit: 10, windowMs: 60_000 },
    sustained: { limit: 10, windowMs: 60_000 },
    global: { limit: 2, windowMs: 24 * 60 * 60_000 },
  };
  const request = new Request("https://example.test/api");

  assert.equal(enforceRequestRateLimit(request, policy, { accountId: "a", now: 0 }), null);
  assert.equal(enforceRequestRateLimit(request, policy, { accountId: "b", now: 1 }), null);
  const limited = enforceRequestRateLimit(request, policy, { accountId: "c", now: 2 });
  assert.equal(limited?.status, 429);
  assert.deepEqual(await limited?.json(), {
    error: "Too many requests. Please try again later.",
  });
  assert.equal(
    enforceRequestRateLimit(request, policy, {
      accountId: "c",
      now: 24 * 60 * 60_000,
    }),
    null,
  );
});

test("expensive work has a bounded concurrency lease", () => {
  const route = `test_concurrency_${Date.now()}`;
  const first = acquireRequestConcurrency(route, 2);
  const second = acquireRequestConcurrency(route, 2);
  assert.ok(first);
  assert.ok(second);
  assert.equal(acquireRequestConcurrency(route, 2), null);
  first.release();
  assert.ok(acquireRequestConcurrency(route, 2));
  second.release();
});

test("priority public routes use bounded abuse controls and provider timeouts", async () => {
  const [engine, prospect, interest, claim, recover, discovery, verification, intelligence] =
    await Promise.all([
      readFile(new URL("src/app/api/orientation/engine/route.ts", root), "utf8"),
      readFile(new URL("src/app/api/orientation/prospect/route.ts", root), "utf8"),
      readFile(new URL("src/app/api/orientation/interest/route.ts", root), "utf8"),
      readFile(new URL("src/app/api/orientation/claim/route.ts", root), "utf8"),
      readFile(new URL("src/app/api/orientation/recover/route.ts", root), "utf8"),
      readFile(new URL("src/lib/orientation-engine/discovery/openai.ts", root), "utf8"),
      readFile(new URL("src/lib/orientation-engine/verification/openai.ts", root), "utf8"),
      readFile(new URL("src/lib/orientation-engine/intelligence.ts", root), "utf8"),
    ]);

  for (const source of [engine, prospect, interest, claim, recover]) {
    assert.match(source, /enforceRequestRateLimit/);
  }
  assert.match(engine, /acquireRequestConcurrency\(policy\.route, 2\)/);
  assert.match(engine, /MAX_BODY_BYTES = 24_000/);
  assert.match(prospect, /MAX_BODY_BYTES = 24_000/);
  assert.match(interest, /MAX_BODY_BYTES = 2_000/);
  assert.match(claim, /MAX_BODY_BYTES = 1_024/);
  assert.match(discovery, /AbortController/);
  assert.match(verification, /AbortController/);
  assert.match(intelligence, /AbortSignal\.timeout\(12_000\)/);
});
