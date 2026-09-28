import assert from "node:assert/strict";
import test from "node:test";
import { RECURRENCE_MARKER } from "./continuous-improvement-core.mjs";
import { contractComment } from "./improvement-contract-core.mjs";
import { blockFromReadyContract, latestReadyContract } from "./improvement-intake-core.mjs";

const existingFiles = new Set(["src/components/public/HomeHero.tsx", "tests/home.test.mjs"]);
const signal = {
  number: 501,
  state: "open",
  labels: [{ name: "almago-improvement-candidate" }, { name: "almago-contract-ready" }],
  body: "<!-- almago-improvement-signal:main-tests -->\nCategory: regression\nSeverity: high",
};
const contract = {
  decision: "AUTONOMOUS_SAFE",
  summary: "Bounded homepage regression.",
  goal: "Restore the homepage behavior proven by the regression test.",
  writable_paths: ["src/components/public/HomeHero.tsx", "tests/home.test.mjs"],
  acceptance: ["The focused regression passes"],
  validation_commands: ["npm test", "npx tsc --noEmit", "git diff --check"],
};
function comment(id = 7001) {
  return { id, body: contractComment(contract, { signalKey: "main-tests", signalIssue: 501 }) };
}

test("ready contract becomes a unique continuous Autopilot block", () => {
  const ready = latestReadyContract(signal, [comment()], { existingFiles });
  const block = blockFromReadyContract(signal, ready);
  assert.equal(block.block_id, "CI-501-7001");
  assert.equal(block.base_ref, "main");
  assert.equal(block.merge_class, "AUTONOMOUS_SAFE");
  assert.deepEqual(block.writable_paths, contract.writable_paths);
  assert.match(block.prompt, /Modify ONLY these exact writable paths/);
});

test("contract from a prior occurrence is stale after recurrence", () => {
  assert.equal(latestReadyContract(signal, [comment(), { id: 7002, body: RECURRENCE_MARKER }], { existingFiles }), null);
});

test("new contract after recurrence gets a new block identity", () => {
  const ready = latestReadyContract(signal, [comment(), { id: 7002, body: RECURRENCE_MARKER }, comment(7003)], { existingFiles });
  assert.equal(blockFromReadyContract(signal, ready).block_id, "CI-501-7003");
});

test("human or blocked labels prevent autonomous intake", () => {
  const human = { ...signal, labels: [...signal.labels, { name: "almago-human-required" }] };
  const blocked = { ...signal, labels: [...signal.labels, { name: "almago-contract-blocked" }] };
  assert.equal(latestReadyContract(human, [comment()], { existingFiles }), null);
  assert.equal(latestReadyContract(blocked, [comment()], { existingFiles }), null);
});

test("contract source binding cannot target another issue", () => {
  const wrong = { id: 7004, body: contractComment(contract, { signalKey: "main-tests", signalIssue: 999 }) };
  assert.throws(() => latestReadyContract(signal, [wrong], { existingFiles }), /source binding/);
});

test("deleted or renamed writable files invalidate intake", () => {
  assert.throws(() => latestReadyContract(signal, [comment()], { existingFiles: new Set(["tests/home.test.mjs"]) }), /non-existent/);
});

test("security signal cannot reuse a safe-looking autonomous payload", () => {
  const security = {
    ...signal,
    body: "<!-- almago-improvement-signal:production-audit -->\nCategory: lint\nSeverity: low",
  };
  const securityComment = { id: 7010, body: contractComment(contract, { signalKey: "production-audit", signalIssue: 501 }) };
  assert.throws(() => latestReadyContract(security, [securityComment], { existingFiles }), /Security or critical/);
});
