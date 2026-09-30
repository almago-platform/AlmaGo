import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/legal/[document]/page.tsx", "utf8");
const content = readFileSync("src/content/legal-content.ts", "utf8");
const robots = readFileSync("src/app/robots.ts", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");

test("A38 legal routes are limited to the three prepared documents", () => {
  assert.match(page, /value === "imprint"/);
  assert.match(page, /value === "privacy"/);
  assert.match(page, /value === "terms"/);
  assert.match(page, /notFound\(\)/);
});

test("A38 legal publication fails closed until explicit review readiness", () => {
  assert.match(content, /export const a38ReviewReady: boolean = false/);
  assert.match(content, /document\.status === "approved"/);
  assert.match(content, /document\.sections\.length > 0/);
  assert.match(page, /index: ready/);
  assert.match(page, /follow: ready/);
});

test("draft legal substance is not rendered while A38 is blocked", () => {
  assert.match(page, /Document en cours de finalisation/);
  assert.match(page, /Aucune\s+traduction juridique automatique n’est publiée/);
  assert.match(page, /contact@campus-allemagne\.info/);
});

test("legal routes stay out of crawler discovery until publication", () => {
  assert.match(robots, /"\/legal\/"/);
});

test("public footer exposes all three legal destinations in every locale", () => {
  assert.equal((nativeCopy.match(/"\/legal\/imprint"/g) || []).length, 4);
  assert.equal((nativeCopy.match(/"\/legal\/privacy"/g) || []).length, 4);
  assert.equal((nativeCopy.match(/"\/legal\/terms"/g) || []).length, 4);
});
