import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sitemap = readFileSync("src/app/sitemap.ts", "utf8");
const robots = readFileSync("src/app/robots.ts", "utf8");
const studentLayout = readFileSync("src/app/student/layout.tsx", "utf8");
const adminLayout = readFileSync("src/app/admin/layout.tsx", "utf8");
const loginPage = readFileSync("src/app/login/page.tsx", "utf8");
const signupPage = readFileSync("src/app/signup/page.tsx", "utf8");

test("sitemap contains only public informational routes", () => {
  for (const route of ["/", "/aide", "/accessibilite", "/a-propos", "/confiance", "/comprendre-les-demarches", "/selon-votre-pays", "/sources-officielles"]) {
    assert.ok(sitemap.includes('"' + route + '"'), route + " should appear in sitemap");
  }

  for (const route of ["/student", "/admin", "/api", "/auth", "/login", "/signup"]) {
    assert.equal(sitemap.includes('"' + route + '"'), false, route + " must not appear in sitemap");
  }
});

test("robots disallows private and authentication areas", () => {
  for (const route of ["/student/", "/admin/", "/api/", "/auth/", "/login", "/signup"]) {
    assert.ok(robots.includes('"' + route + '"'), route + " should be disallowed");
  }
});

test("private and authentication surfaces explicitly request noindex", () => {
  for (const [name, source] of [
    ["student", studentLayout],
    ["admin", adminLayout],
    ["login", loginPage],
    ["signup", signupPage],
  ]) {
    assert.match(source, /index:\s*false/, name + " should set robots index false");
    assert.match(source, /follow:\s*false/, name + " should set robots follow false");
  }
});
