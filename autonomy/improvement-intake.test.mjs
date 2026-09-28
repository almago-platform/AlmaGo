import assert from "node:assert/strict";
import test from "node:test";
import { contractComment } from "./improvement-contract-core.mjs";
import { loadContinuousImprovementBlocks } from "./improvement-intake.mjs";

const files = new Set(["src/components/public/HomeHero.tsx", "tests/home.test.mjs"]);
const readyIssue = {
  number: 501,
  state: "open",
  labels: [{ name: "almago-improvement-candidate" }, { name: "almago-contract-ready" }],
  body: "<!-- almago-improvement-signal:main-tests -->",
};
const contract = {
  decision: "AUTONOMOUS_SAFE",
  summary: "Bounded homepage regression.",
  goal: "Restore verified homepage behavior.",
  writable_paths: ["src/components/public/HomeHero.tsx", "tests/home.test.mjs"],
  acceptance: ["Regression passes"],
  validation_commands: ["npm test", "git diff --check"],
};
const comments = [{ id: 7001, body: contractComment(contract, { signalKey: "main-tests", signalIssue: 501 }) }];

function ghWithA45(done) {
  return async (path) => {
    if (path.includes("labels=almago-plan")) return [{ number: 45, state: done ? "closed" : "open", labels: [], body: "<!-- almago-plan-task:A45 -->" }];
    if (path.includes("labels=almago-contract-ready")) return [readyIssue];
    throw new Error("Unexpected path " + path);
  };
}

test("continuous intake stays inactive before A45", async () => {
  const blocks = await loadContinuousImprovementBlocks({
    owner: "o", repo: "r", gh: ghWithA45(false), listComments: async () => comments, existingFiles: files,
  });
  assert.deepEqual(blocks, []);
});

test("A45-complete ready contract becomes a runtime Autopilot block", async () => {
  const blocks = await loadContinuousImprovementBlocks({
    owner: "o", repo: "r", gh: ghWithA45(true), listComments: async () => comments, existingFiles: files,
  });
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].block_id, "CI-501-7001");
  assert.equal(blocks[0].enabled, true);
  assert.equal(blocks[0].merge_class, "AUTONOMOUS_SAFE");
});

test("invalid ready contract is skipped instead of widening scope", async () => {
  const warnings = [];
  const badComments = [{ id: 7002, body: contractComment({ ...contract, writable_paths: ["src/components/public/Missing.tsx"] }, { signalKey: "main-tests", signalIssue: 501 }) }];
  const blocks = await loadContinuousImprovementBlocks({
    owner: "o", repo: "r", gh: ghWithA45(true), listComments: async () => badComments, existingFiles: files,
    logger: { warn: (message) => warnings.push(message) },
  });
  assert.deepEqual(blocks, []);
  assert.match(warnings[0], /Skipping invalid continuous improvement contract/);
});
