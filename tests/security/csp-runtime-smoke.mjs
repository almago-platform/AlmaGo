import assert from "node:assert/strict";

const baseUrl = process.argv[2] || "http://127.0.0.1:3000";
const response = await fetch(new URL("/", baseUrl), {
  headers: { "cache-control": "no-cache" },
});

assert.equal(response.ok, true, `homepage returned HTTP ${response.status}`);

const enforced = response.headers.get("content-security-policy");
const reportOnly = response.headers.get("content-security-policy-report-only") || "";

assert.equal(enforced, null, "CSP must remain Report-Only during staging");
assert.ok(reportOnly, "missing Content-Security-Policy-Report-Only");
assert.equal(
  (reportOnly.match(/\bscript-src\b/g) || []).length,
  1,
  "response must contain exactly one script-src policy",
);

const nonceMatch = reportOnly.match(
  /script-src[^;]*\x27nonce-([^\x27]+)\x27[^;]*\x27strict-dynamic\x27/,
);
assert.ok(nonceMatch, "script-src must contain a nonce and strict-dynamic");
const nonce = nonceMatch[1];

assert.doesNotMatch(reportOnly, /\x27unsafe-eval\x27/);
assert.doesNotMatch(reportOnly, /script-src[^;]*\x27unsafe-inline\x27/);
assert.match(reportOnly, /report-uri \/api\/security\/csp-report/);

const html = await response.text();
const scriptTags = [...html.matchAll(/<script\b[^>]*>/gi)].map((match) => match[0]);
assert.ok(scriptTags.length > 0, "expected Next.js script tags in rendered HTML");

const escapedNonce = nonce.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const nonceAttribute = new RegExp(`\\bnonce=["\x27]${escapedNonce}["\x27]`);
const matchingScripts = scriptTags.filter((tag) => nonceAttribute.test(tag));
assert.ok(
  matchingScripts.length > 0,
  "rendered Next.js scripts must carry the response CSP nonce",
);

for (const tag of scriptTags) {
  const otherNonce = tag.match(/\bnonce=["\x27]([^"\x27]+)["\x27]/i)?.[1];
  if (otherNonce) assert.equal(otherNonce, nonce, "all rendered script nonces must match");
}

console.log(
  JSON.stringify({
    ok: true,
    policy: "report-only",
    noncePresent: true,
    scriptTags: scriptTags.length,
    nonceBearingScripts: matchingScripts.length,
  }),
);
