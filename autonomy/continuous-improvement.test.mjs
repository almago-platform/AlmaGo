import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSignals,
  issueBodyForSignal,
  labelsForSignal,
  signalKeyFromIssue,
  signalMarker,
  validateSignal,
} from "./continuous-improvement-core.mjs";

test("signal markers are stable and reject unsafe keys", () => {
  assert.equal(signalMarker("main-tests"), "<!-- almago-improvement-signal:main-tests -->");
  assert.throws(() => signalMarker("../unsafe"));
});

test("healthy sensors produce no backlog signal", () => {
  assert.deepEqual(buildSignals({
    testOutcome: "success",
    typecheckOutcome: "success",
    lintOutcome: "success",
    audit: { metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 } } },
  }), []);
});

test("regression sensors create deterministic bounded candidates", () => {
  const signals = buildSignals({
    testOutcome: "failure",
    typecheckOutcome: "failure",
    lintOutcome: "failure",
  });
  assert.deepEqual(signals.map((signal) => signal.key), ["main-tests", "main-typecheck", "main-lint"]);
  assert.equal(signals[0].severity, "high");
  assert.equal(labelsForSignal(signals[0]).includes("almago-codex-required"), true);
});

test("sensor evidence is bounded and retained for diagnosis", () => {
  const [signal] = buildSignals({ testOutcome: "failure", testEvidence: "X".repeat(7000) });
  assert.match(signal.evidence, /Sensor outcome: npm test = failure/);
  assert.ok(signal.evidence.length <= 6000);
});

test("production audit escalates critical vulnerabilities to human gate", () => {
  const [signal] = buildSignals({
    audit: { metadata: { vulnerabilities: { critical: 1, high: 2, moderate: 3, low: 4 } } },
  });
  assert.equal(signal.key, "production-audit");
  assert.equal(signal.severity, "critical");
  assert.deepEqual(labelsForSignal(signal), ["almago-improvement-candidate", "almago-human-required"]);
});

test("issue bodies are proposal-only and preserve the signal key", () => {
  const signal = {
    key: "main-tests",
    category: "regression",
    severity: "high",
    title: "Regression",
    summary: "Tests failed.",
    evidence: "npm test = failure",
  };
  assert.equal(validateSignal(signal), true);
  const body = issueBodyForSignal(signal);
  assert.match(body, /almago-improvement-signal:main-tests/);
  assert.match(body, /not authorization to edit code/);
  assert.equal(signalKeyFromIssue({ body }), "main-tests");
});

test("security signals never receive autonomous implementation labels", () => {
  const signal = {
    key: "production-audit",
    category: "security",
    severity: "high",
    title: "Audit",
    summary: "High vulnerability.",
  };
  assert.deepEqual(labelsForSignal(signal), ["almago-improvement-candidate", "almago-human-required"]);
});
