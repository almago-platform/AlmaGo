import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  acquireRequestConcurrency,
  enforceRequestRateLimit,
  resolveTrustedClientAddress,
} from "../src/lib/security/abuse.ts";

const root = new URL("../", import.meta.url);

test("forwarded client addresses are trusted only on Render and use the right-most hop", () => {
  const headers = new Headers({
    "x-forwarded-for": "198.51.100.7, 203.0.113.9",
  });

  assert.equal(resolveTrustedClientAddress(headers, {}), null);
  assert.equal(
    resolveTrustedClientAddress(headers, { RENDER: "true" }),
    "203.0.113.9",
  );
  assert.equal(
    resolveTrustedClientAddress(
      new Headers({ "x-forwarded-for": "spoofed" }),
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

test("expensive work has a bounded concurrency lease", () => {
  const route = `test_concurrency_${Date.now()}`;
  const first = acquireRequestConcurrency(route, 1);
  assert.ok(first);
  assert.equal(acquireRequestConcurrency(route, 1), null);
  first.release();
  assert.ok(acquireRequestConcurrency(route, 1));
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
