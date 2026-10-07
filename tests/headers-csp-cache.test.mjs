import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import nextConfig from "../next.config.ts";

const root = new URL("../", import.meta.url);

test("security headers stage CSP in report-only mode and suppress framework disclosure", async () => {
  assert.equal(nextConfig.poweredByHeader, false);
  const rules = await nextConfig.headers();
  const global = rules.find((rule) => rule.source === "/:path*");
  assert.ok(global);

  const headers = new Map(global.headers.map(({ key, value }) => [key, value]));
  const csp = headers.get("Content-Security-Policy-Report-Only");
  assert.ok(csp);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /report-uri \/api\/security\/csp-report/);
  assert.doesNotMatch(csp, /unsafe-eval/);
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("Strict-Transport-Security"), "max-age=31536000; includeSubDomains");
});

test("CSP inventory contains current browser-side image origins", async () => {
  const rules = await nextConfig.headers();
  const global = rules.find((rule) => rule.source === "/:path*");
  const csp = global.headers.find(
    ({ key }) => key === "Content-Security-Policy-Report-Only",
  ).value;
  assert.match(csp, /https:\/\/images\.pexels\.com/);
  assert.match(csp, /https:\/\/images\.unsplash\.com/);
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
