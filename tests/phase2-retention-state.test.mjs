import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getPhase2RetentionState,
  phase2RetentionStates,
} from "../src/lib/phase2/retention.ts";

test("P2.10 retention stays a bounded state classifier", () => {
  assert.deepEqual(phase2RetentionStates, [
    "none",
    "orientation_incomplete",
    "orientation_complete_no_account",
    "account_active_project_stale",
  ]);

  assert.equal(getPhase2RetentionState({
    orientationStarted: false,
    orientationCompleted: false,
    accountActivated: false,
    projectIsStale: false,
    clientActive: false,
  }), "none");

  assert.equal(getPhase2RetentionState({
    orientationStarted: true,
    orientationCompleted: false,
    accountActivated: false,
    projectIsStale: false,
    clientActive: false,
  }), "orientation_incomplete");

  assert.equal(getPhase2RetentionState({
    orientationStarted: true,
    orientationCompleted: true,
    accountActivated: false,
    projectIsStale: false,
    clientActive: false,
  }), "orientation_complete_no_account");

  assert.equal(getPhase2RetentionState({
    orientationStarted: true,
    orientationCompleted: true,
    accountActivated: true,
    projectIsStale: true,
    clientActive: false,
  }), "account_active_project_stale");

  assert.equal(getPhase2RetentionState({
    orientationStarted: true,
    orientationCompleted: true,
    accountActivated: true,
    projectIsStale: true,
    clientActive: true,
  }), "none");
});

test("P2.10 retention classification cannot send unsolicited outreach", () => {
  const source = readFileSync("src/lib/phase2/retention.ts", "utf8");
  assert.doesNotMatch(source, /fetch\(|resend|sendgrid|mailgun|postmark|smtp|sendMail|sendEmail|marketing|newsletter|sms|whatsapp/i);
  assert.match(source, /state classification only/i);
  assert.match(source, /does not contact users/i);
});
