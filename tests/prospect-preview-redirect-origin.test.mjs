import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const start = read("src/app/prospect-preview/start/route.ts");
const leave = read("src/app/prospect-preview/leave/route.ts");
const callback = read("src/app/auth/callback/route.ts");
const form = read("src/components/auth/AuthForm.tsx");

test("preview signup uses same-site navigation without an absolute localhost link", () => {
  assert.match(form, /router\.replace\(`\/prospect-preview\/start\?orientation_token=/);
  assert.doesNotMatch(form, /https?:\/\/localhost(?::3000)?\/prospect-preview/);
});

test("preview route responds with relative HTTP Location, preserving the browser's public origin", () => {
  assert.match(start, /new NextResponse\(null, \{/);
  assert.match(start, /status: 303/);
  assert.match(start, /Location: "\/prospect-preview"/);
  assert.match(start, /response\.headers\.set\("Location", "\/orientation"\)/);
  assert.doesNotMatch(start, /NextResponse\.redirect\(/);
  assert.doesNotMatch(start, /new URL\("\/prospect-preview", url\.origin\)/);
  assert.match(start, /"Cache-Control": "private, no-store"/);
  assert.match(start, /"Referrer-Policy": "no-referrer"/);

  // The browser resolves a relative Location using the public-facing hostname,
  // regardless of the internal request URL seen by the reverse proxy.
  const publicOrigin = "https://campusallemagne.tn";
  assert.equal(new URL("/prospect-preview", publicOrigin).origin, publicOrigin);
});

test("preview exit keeps cookie cleanup while redirecting to a relative path", () => {
  assert.match(leave, /Location: "\/"/);
  assert.match(leave, /status: 303/);
  assert.match(leave, /PROVISIONAL_COOKIE_PATH/);
  assert.match(leave, /maxAge: 0/);
  assert.doesNotMatch(leave, /NextResponse\.redirect\(/);
  assert.doesNotMatch(leave, /new URL\("\/", request\.url\)/);
});

test("confirmation callback validates next path and avoids internal absolute origins", () => {
  assert.match(callback, /const next = safeNextPath\(url\.searchParams\.get\("next"\)\)/);
  assert.match(callback, /await supabase\.auth\.exchangeCodeForSession\(code\)/);
  assert.match(callback, /new NextResponse\(null, \{/);
  assert.match(callback, /Location: next/);
  assert.match(callback, /"Cache-Control": "private, no-store"/);
  assert.doesNotMatch(callback, /NextResponse\.redirect\(new URL\(next, url\.origin\)\)/);
  assert.match(callback, /value\.startsWith\("\/\/"\)/);
  assert.match(callback, /value\.includes\("\\\\"\)/);
});
