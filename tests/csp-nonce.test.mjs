import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildContentSecurityPolicy } from "../src/lib/security/csp.ts";

const root = new URL("../", import.meta.url);

test("nonce CSP keeps scripts strict without unsafe-eval or unsafe-inline", () => {
  const csp = buildContentSecurityPolicy("01234567-89ab-cdef", {
    NEXT_PUBLIC_SUPABASE_URL: "https://project-ref.supabase.co",
  });

  assert.match(
    csp,
    /script-src 'self' 'nonce-01234567-89ab-cdef' 'strict-dynamic'/,
  );
  assert.doesNotMatch(csp, /unsafe-eval/);
  assert.doesNotMatch(csp, /script-src[^;]*unsafe-inline/);
  assert.match(
    csp,
    /connect-src 'self' https:\/\/project-ref\.supabase\.co wss:\/\/project-ref\.supabase\.co/,
  );
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /report-uri \/api\/security\/csp-report/);
});

test("CSP nonce validation fails closed", () => {
  assert.throws(
    () => buildContentSecurityPolicy("<script>"),
    /Invalid CSP nonce/,
  );
});

test("proxy forwards nonce CSP to Next rendering and reports it to browsers", async () => {
  const proxySource = await readFile(new URL("src/proxy.ts", root), "utf8");
  const sessionSource = await readFile(
    new URL("src/lib/supabase/proxy.ts", root),
    "utf8",
  );

  assert.match(proxySource, /randomUUID\(\)/);
  assert.match(proxySource, /requestHeaders\.set\("x-nonce", nonce\)/);
  assert.match(
    proxySource,
    /requestHeaders\.set\("Content-Security-Policy", csp\)/,
  );
  assert.match(
    proxySource,
    /responseHeaders\.set\("Content-Security-Policy-Report-Only", csp\)/,
  );
  assert.doesNotMatch(
    proxySource,
    /responseHeaders\.set\("Content-Security-Policy", csp\)/,
  );

  assert.match(sessionSource, /options\.requestHeaders/);
  assert.match(sessionSource, /options\.responseHeaders/);
  assert.match(sessionSource, /response\.headers\.set/);
});
