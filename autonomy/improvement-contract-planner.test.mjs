import assert from "node:assert/strict";
import test from "node:test";
import { CONTRACT_MARKER, needsFreshContract, policyForSignalKey } from "./improvement-contract-core.mjs";
import { RECURRENCE_MARKER } from "./continuous-improvement-core.mjs";

test("existing contract suppresses repeated planner spend", () => {
  assert.equal(needsFreshContract([{ body: CONTRACT_MARKER }], RECURRENCE_MARKER), false);
});

test("recurrence after an old contract requires a fresh plan", () => {
  assert.equal(needsFreshContract([{ body: CONTRACT_MARKER }, { body: RECURRENCE_MARKER }], RECURRENCE_MARKER), true);
});

test("planner policy cannot be downgraded by issue prose", () => {
  assert.deepEqual(policyForSignalKey("production-audit"), { category: "security", severity: "critical" });
  assert.throws(() => policyForSignalKey("fake-low-risk"));
});
