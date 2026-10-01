import assert from "node:assert/strict";
import test from "node:test";

import {
  getPhase2RetentionState,
  phase2RetentionStates,
} from "../src/lib/phase2/retention.ts";

const base = {
  orientationStarted: false,
  orientationCompleted: false,
  accountActivated: false,
  projectIsStale: false,
  clientActive: false,
};

test("P2.10D retention states stay bounded", () => {
  assert.deepEqual(phase2RetentionStates, [
    "none",
    "orientation_incomplete",
    "orientation_complete_no_account",
    "account_active_project_stale",
  ]);
});

test("P2.10D derives pre-client lifecycle states", () => {
  assert.equal(
    getPhase2RetentionState({ ...base, orientationStarted: true }),
    "orientation_incomplete",
  );
  assert.equal(
    getPhase2RetentionState({
      ...base,
      orientationStarted: true,
      orientationCompleted: true,
    }),
    "orientation_complete_no_account",
  );
  assert.equal(
    getPhase2RetentionState({
      ...base,
      orientationStarted: true,
      orientationCompleted: true,
      accountActivated: true,
      projectIsStale: true,
    }),
    "account_active_project_stale",
  );
});

test("P2.10D active clients are not a retention target", () => {
  assert.equal(
    getPhase2RetentionState({
      ...base,
      orientationStarted: true,
      orientationCompleted: true,
      accountActivated: true,
      projectIsStale: true,
      clientActive: true,
    }),
    "none",
  );
});
