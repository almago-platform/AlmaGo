import assert from "node:assert/strict";
import test from "node:test";
import {
  hasOpenQuarantine,
  launchComplete,
  quarantineFinding,
  quarantineIssueBody,
} from "./postmerge-quarantine-core.mjs";

test("post-launch gate requires A45 completion", () => {
  const a45 = {
    state: "open",
    labels: [],
    body: "<!-- almago-plan-task:A45 -->",
  };
  assert.equal(launchComplete([a45]), false);
  assert.equal(launchComplete([{ ...a45, state: "closed" }]), true);
  assert.equal(launchComplete([{ ...a45, labels: [{ name: "almago-plan-done" }] }]), true);
});

test("quarantine finding is healthy only when all canonical checks pass", () => {
  assert.deepEqual(
    quarantineFinding({ testOutcome: "success", typecheckOutcome: "success", lintOutcome: "success", headSha: "abc" }),
    { unhealthy: false, failures: [], headSha: "abc" },
  );
  const failed = quarantineFinding({ testOutcome: "failure", typecheckOutcome: "success", lintOutcome: "failure" });
  assert.equal(failed.unhealthy, true);
  assert.deepEqual(failed.failures, ["npm test=failure", "npm run lint=failure"]);
});

test("quarantine issue body binds evidence to main head and blocks future autonomous merge", () => {
  const finding = quarantineFinding({
    testOutcome: "failure",
    typecheckOutcome: "success",
    lintOutcome: "success",
    headSha: "a".repeat(40),
  });
  const body = quarantineIssueBody(finding);
  assert.match(body, /almago-autonomy-quarantine/);
  assert.match(body, new RegExp("a".repeat(40)));
  assert.match(body, /Autonomous safe merge must remain blocked/);
});

test("open quarantine detection is marker or label based and ignores closed issues", () => {
  assert.equal(hasOpenQuarantine([]), false);
  assert.equal(hasOpenQuarantine([{ state: "open", body: "<!-- almago-autonomy-quarantine -->", labels: [] }]), true);
  assert.equal(hasOpenQuarantine([{ state: "open", body: "", labels: [{ name: "almago-autonomy-quarantine" }] }]), true);
  assert.equal(hasOpenQuarantine([{ state: "closed", body: "<!-- almago-autonomy-quarantine -->", labels: [] }]), false);
});
