import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import nextConfig from "../next.config.ts";
import { buildContentSecurityPolicy } from "../src/lib/security/csp.ts";

const root = new URL("../", import.meta.url);

test("static security headers stay enabled while CSP is generated per request", async () => {
  assert.equal(nextConfig.poweredByHeader, false);
  const rules = await nextConfig.headers();
  const global = rules.find((rule) => rule.source === "/:path*");
  assert.ok(global);

  const headers = new Map(global.headers.map(({ key, value }) => [key, value]));
  assert.equal(headers.has("Content-Security-Policy"), false);
  assert.equal(headers.has("Content-Security-Policy-Report-Only"), false);
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(
    headers.get("Strict-Transport-Security"),
    "max-age=31536000; includeSubDomains",
  );
});

test("per-request CSP keeps the approved resource inventory", () => {
  const csp = buildContentSecurityPolicy("01234567-89ab-cdef", {
    NEXT_PUBLIC_SUPABASE_URL: "https://project-ref.supabase.co",
  });

  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /report-uri \/api\/security\/csp-report/);
  assert.match(csp, /https:\/\/images\.pexels\.com/);
  assert.match(csp, /https:\/\/images\.unsplash\.com/);
  assert.match(csp, /https:\/\/upload\.wikimedia\.org/);
  assert.match(
    csp,
    /connect-src 'self' https:\/\/project-ref\.supabase\.co wss:\/\/project-ref\.supabase\.co/,
  );
  assert.match(csp, /script-src 'self' 'nonce-01234567-89ab-cdef' 'strict-dynamic'/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
  assert.match(csp, /font-src 'self' data:/);
  assert.doesNotMatch(csp, /unsafe-eval/);
});

test("CSP reporting is bounded and records no report URL or user data", async () => {
  const source = await readFile(
    new URL("src/app/api/security/csp-report/route.ts", root),
    "utf8",
  );
  assert.match(source, /MAX_REPORT_BYTES = 16_384/);
  assert.match(source, /PUBLIC_ABUSE_POLICIES\.cspReport/);
  assert.match(source, /security_csp_report/);
  assert.match(source, /directive: reportDirective\(report\)/);
  assert.doesNotMatch(source, /document-uri|blocked-uri|source-file/);
});
