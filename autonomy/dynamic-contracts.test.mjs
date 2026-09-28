import assert from "node:assert/strict";
import test from "node:test";
import {
  firstOpenPrCollision,
  parseReadyDynamicContract,
  sourceSignalStillValid,
} from "./dynamic-contracts-core.mjs";
import { contractIssueBody, compileSignalContract } from "./improvement-contracts-core.mjs";

function compiledBlock(overrides = {}) {
  const compiled = compileSignalContract({
    number: 501,
    title: "[CONTINUOUS] Example",
    body: [
      "<!-- almago-improvement-signal:main-lint -->",
      "Category: lint",
      "Severity: moderate",
      "",
      "## Evidence",
      "src/components/ui/Button.tsx:1:1 lint failure",
    ].join("\n"),
  }, { fileExists: () => true });
  compiled.block = { ...compiled.block, ...overrides };
  return compiled;
}

function contractIssue(overrides = {}) {
  const compiled = compiledBlock(overrides.block || {});
  return {
    number: 601,
    state: "open",
    labels: [
      { name: "almago-improvement-contract" },
      { name: "almago-autopilot-contract-ready" },
      { name: "almago-codex-required" },
    ],
    body: contractIssueBody(compiled),
    ...overrides.issue,
  };
}

test("ready dynamic contract requires exact existing noncritical src paths", () => {
  const result = parseReadyDynamicContract(contractIssue(), { fileExists: () => true });
  assert.equal(result.eligible, true);
  assert.equal(result.key, "main-lint");
  assert.deepEqual(result.block.writable_paths, ["src/components/ui/Button.tsx"]);
});

test("closed unready and human-gated contracts never dispatch", () => {
  assert.equal(
    parseReadyDynamicContract(contractIssue({ issue: { state: "closed" } }), { fileExists: () => true }).eligible,
    false,
  );
  assert.equal(
    parseReadyDynamicContract(contractIssue({
      issue: { labels: [{ name: "almago-improvement-contract" }] },
    }), { fileExists: () => true }).reason,
    "contract_not_ready",
  );
  assert.equal(
    parseReadyDynamicContract(contractIssue({
      issue: {
        labels: [
          { name: "almago-improvement-contract" },
          { name: "almago-autopilot-contract-ready" },
          { name: "almago-human-required" },
        ],
      },
    }), { fileExists: () => true }).reason,
    "contract_human_gated",
  );
});

test("dynamic contract rejects protected globbed missing and non-main paths", () => {
  assert.equal(
    parseReadyDynamicContract(contractIssue({
      block: { writable_paths: ["src/app/api/private/route.ts"] },
    }), { fileExists: () => true }).reason,
    "writable_path_not_exact_safe_source",
  );
  assert.equal(
    parseReadyDynamicContract(contractIssue({
      block: { writable_paths: ["src/components/**"] },
    }), { fileExists: () => true }).reason,
    "writable_path_not_exact_safe_source",
  );
  assert.equal(
    parseReadyDynamicContract(contractIssue(), { fileExists: () => false }).reason,
    "writable_path_missing",
  );
  assert.equal(
    parseReadyDynamicContract(contractIssue({ block: { base_ref: "release" } }), { fileExists: () => true }).reason,
    "unsafe_contract_policy",
  );
});

test("source signal must still be open matching and non-human", () => {
  const source = {
    state: "open",
    labels: [{ name: "almago-codex-required" }],
    body: "<!-- almago-improvement-signal:main-lint -->",
  };
  assert.equal(sourceSignalStillValid(source, "main-lint"), true);
  assert.equal(sourceSignalStillValid({ ...source, state: "closed" }, "main-lint"), false);
  assert.equal(sourceSignalStillValid(source, "main-typecheck"), false);
  assert.equal(sourceSignalStillValid({
    ...source,
    labels: [{ name: "almago-human-required" }],
  }, "main-lint"), false);
});

test("open PR collisions fail closed on any overlapping writable file", () => {
  const block = compiledBlock().block;
  assert.equal(firstOpenPrCollision(block, [
    { pr_number: 10, files: ["docs/a.md"] },
  ]), null);
  assert.deepEqual(firstOpenPrCollision(block, [
    { pr_number: 10, files: ["docs/a.md"] },
    { pr_number: 11, files: ["src/components/ui/Button.tsx"] },
  ])?.pr_number, 11);
});
