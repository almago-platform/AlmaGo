import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-safe-automerge.yml", "utf8");
const docs = readFileSync("docs/safe-automerge.md", "utf8");

test("merge readiness no longer depends on Vercel", () => {
  assert.doesNotMatch(workflow, /getCombinedStatusForRef/);
  assert.doesNotMatch(workflow, /context === "Vercel"/);
  assert.doesNotMatch(workflow, /Vercel are green/);
  assert.doesNotMatch(docs, /statut Vercel/);
});

test("merge readiness still requires both canonical quality workflows", () => {
  assert.match(workflow, /AlmaGo PR CI/);
  assert.match(workflow, /AlmaGo Browser Quality/);
  assert.match(workflow, /matching\.some/);
  assert.match(workflow, /item\.conclusion === "success"/);
});

test("merge readiness remains advisory only", () => {
  assert.match(workflow, /MERGE READINESS: READY/);
  assert.match(workflow, /No automatic merge is performed/);
  assert.doesNotMatch(workflow, /pulls\.merge|mergePull|merge_method/);
  assert.match(docs, /ne fusionne aucune PR/);
});

test("Render exact-main proof is deferred to A45", () => {
  assert.match(workflow, /Render exact-main verification remains an A45 release concern after merge/);
  assert.match(docs, /preuve Render appartient au gate A45 après merge/);
});
