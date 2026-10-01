import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const callback = readFileSync("src/app/auth/callback/route.ts", "utf8");
const nextConfig = readFileSync("next.config.ts", "utf8");
const robots = readFileSync("src/app/robots.ts", "utf8");
const rootLayout = readFileSync("src/app/layout.tsx", "utf8");
const adminLayout = readFileSync("src/app/admin/layout.tsx", "utf8");
const studentLayout = readFileSync("src/app/student/layout.tsx", "utf8");
const login = readFileSync("src/app/login/page.tsx", "utf8");
const signup = readFileSync("src/app/signup/page.tsx", "utf8");
const reset = readFileSync("src/app/reset-password/page.tsx", "utf8");
const unauthorized = readFileSync("src/app/unauthorized/page.tsx", "utf8");

test("auth callback only accepts local absolute paths", () => {
  assert.match(callback, /safeNextPath/);
  assert.match(callback, /!value\.startsWith\("\/"\)/);
  assert.match(callback, /value\.startsWith\("\/\/"\)/);
  assert.match(callback, /value\.includes\("\\\\"\)/);
  assert.match(callback, /return "\/student"/);
  assert.doesNotMatch(callback, /next\.startsWith\("\/"\) \? next/);
});

test("baseline browser security headers apply to every route", () => {
  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
  ]) {
    assert.match(nextConfig, new RegExp(header));
  }
  assert.match(nextConfig, /source: "\/:path\*"/);
});

test("robots blocks pre-launch crawling and preserves private-route blocks after launch", () => {
  assert.match(robots, /if \(!isPublicIndexingEnabled\(\)\)/);
  assert.match(robots, /disallow: \["\/"\]/);
  assert.match(robots, /allow: \["\/"\]/);
  for (const path of ["/admin/", "/student/", "/login", "/signup", "/reset-password", "/unauthorized", "/auth/", "/api/"]) {
    assert.match(robots, new RegExp(path.replaceAll("/", "\\/")));
  }
  assert.match(rootLayout, /const indexingEnabled = isPublicIndexingEnabled\(\)/);
  assert.match(rootLayout, /index: indexingEnabled/);
  assert.match(rootLayout, /follow: indexingEnabled/);
});

test("authenticated and account-management surfaces explicitly noindex", () => {
  for (const source of [adminLayout, studentLayout, login, signup, reset, unauthorized]) {
    assert.match(source, /robots: \{ index: false, follow: false \}/);
  }
});
