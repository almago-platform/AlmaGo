import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { markdownForReview, selectScreenshots, validateVisualReview } from "./visual-review.mjs";

test("visual review prefers home screenshots and enforces the image cap", () => {
  const dir = mkdtempSync(join(tmpdir(), "almago-visual-"));
  mkdirSync(dir, { recursive: true });
  for (const name of ["login-mobile.png", "home-mobile.png", "home-desktop.png", "signup.png"]) {
    writeFileSync(join(dir, name), "x");
  }
  assert.deepEqual(selectScreenshots(dir, 2), ["home-desktop.png", "home-mobile.png"]);
});

test("visual review returns an empty set when screenshot directory is missing", () => {
  assert.deepEqual(selectScreenshots("/definitely/missing/almago/screenshots", 2), []);
});


test("structured visual review validates bounded PASS and REVISE shapes", () => {
  const pass = { verdict: "PASS", confidence: "high", findings: [], actions: [] };
  assert.equal(validateVisualReview(pass), true);
  assert.match(markdownForReview(pass), /VERDICT: PASS/);

  const revise = {
    verdict: "REVISE",
    confidence: "high",
    findings: [
      { severity: "moderate", area: "hierarchy", summary: "Primary CTA is visually weaker than surrounding secondary elements." },
    ],
    actions: ["Increase first-screen CTA hierarchy without changing copy."],
  };
  assert.equal(validateVisualReview(revise), true);
  assert.match(markdownForReview(revise), /MODERATE/);
});

test("structured visual review fails closed on unsafe or ambiguous shapes", () => {
  assert.throws(() => validateVisualReview({
    verdict: "PASS",
    confidence: "high",
    findings: [],
    actions: ["Change something anyway"],
  }));
  assert.throws(() => validateVisualReview({
    verdict: "REVISE",
    confidence: "high",
    findings: [],
    actions: [],
  }));
  assert.throws(() => validateVisualReview({
    verdict: "REVISE",
    confidence: "high",
    findings: [{ severity: "critical", area: "hierarchy", summary: "Unsupported severity" }],
    actions: ["x"],
  }));
});
