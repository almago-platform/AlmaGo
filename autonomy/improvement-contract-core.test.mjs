import assert from "node:assert/strict";
import test from "node:test";
import {
  CONTRACT_MARKER,
  contractComment,
  hasContractComment,
  isSafeContractPath,
  needsFreshContract,
  policyForSignalKey,
  validateImprovementContract,
} from "./improvement-contract-core.mjs";

const files = new Set(["src/components/public/HomeHero.tsx", "tests/home.test.mjs", "docs/readme.md"]);

function safeContract() {
  return {
    decision: "AUTONOMOUS_SAFE",
    summary: "A bounded UI regression can be repaired safely.",
    goal: "Restore the verified homepage behavior without widening scope.",
    writable_paths: ["src/components/public/HomeHero.tsx", "tests/home.test.mjs"],
    acceptance: ["Focused regression passes", "No behavior outside the reported regression changes"],
    validation_commands: ["npm test", "npx tsc --noEmit", "npm run lint", "git diff --check"],
  };
}

test("signal policy is derived from a known deterministic key", () => {
  assert.deepEqual(policyForSignalKey("main-tests"), { category: "regression", severity: "high" });
  assert.deepEqual(policyForSignalKey("production-audit"), { category: "security", severity: "critical" });
  assert.throws(() => policyForSignalKey("user-edited-signal"));
});

test("safe contract accepts exact existing non-critical files", () => {
  assert.equal(validateImprovementContract(safeContract(), { existingFiles: files }), true);
});

test("globs and protected auth/admin/api paths are rejected", () => {
  assert.equal(isSafeContractPath("src/components/public/HomeHero.tsx"), true);
  assert.equal(isSafeContractPath("src/**"), false);
  assert.equal(isSafeContractPath("src/app/api/x/route.ts"), false);
  assert.equal(isSafeContractPath("src/components/auth/AuthForm.tsx"), false);
  assert.equal(isSafeContractPath(".github/workflows/x.yml"), false);
});

test("autonomous contract is capped at three unique existing files", () => {
  assert.throws(() => validateImprovementContract({ ...safeContract(), writable_paths: ["src/components/public/HomeHero.tsx", "tests/home.test.mjs", "docs/readme.md", "src/x.ts"] }, { existingFiles: files }));
  assert.throws(() => validateImprovementContract({ ...safeContract(), writable_paths: ["src/components/public/HomeHero.tsx", "src/components/public/HomeHero.tsx"] }, { existingFiles: files }));
  assert.throws(() => validateImprovementContract({ ...safeContract(), writable_paths: ["src/components/public/Missing.tsx"] }, { existingFiles: files }));
});

test("security and critical signals can never be autonomous", () => {
  assert.throws(() => validateImprovementContract(safeContract(), { existingFiles: files, signalCategory: "security" }));
  assert.throws(() => validateImprovementContract(safeContract(), { existingFiles: files, signalSeverity: "critical" }));
});

test("human or insufficient decisions cannot smuggle writable paths", () => {
  const base = { decision: "HUMAN_GATE", summary: "Protected area requires a human.", writable_paths: [] };
  assert.equal(validateImprovementContract(base), true);
  assert.throws(() => validateImprovementContract({ ...base, writable_paths: ["docs/readme.md"] }));
});

test("validation commands are allow-listed", () => {
  assert.throws(() => validateImprovementContract({ ...safeContract(), validation_commands: ["rm -rf /tmp/x"] }, { existingFiles: files }));
});

test("recurrence after a contract requires a fresh contract", () => {
  const recurrence = "<!-- almago-improvement-recurrence -->";
  assert.equal(needsFreshContract([], recurrence), true);
  assert.equal(needsFreshContract([{ body: CONTRACT_MARKER }], recurrence), false);
  assert.equal(needsFreshContract([{ body: CONTRACT_MARKER }, { body: recurrence }], recurrence), true);
  assert.equal(needsFreshContract([{ body: CONTRACT_MARKER }, { body: recurrence }, { body: CONTRACT_MARKER }], recurrence), false);
});

test("contract comments are machine readable and deduplicatable", () => {
  const body = contractComment(safeContract(), { signalKey: "main-tests", signalIssue: 12 });
  assert.ok(body.includes(CONTRACT_MARKER));
  assert.match(body, /"base_ref": "main"/);
  assert.equal(hasContractComment([{ body }]), true);
});
