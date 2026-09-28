import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPrelaunchRepairPlan,
  detectPrelaunchRepairCandidate,
} from "./prelaunch-repair-core.mjs";

const sha = "0123456789abcdef0123456789abcdef01234567";

test("healthy prelaunch lint and typecheck produce no repair", () => {
  const result = buildPrelaunchRepairPlan({
    mainSha: sha,
    typecheckOutcome: "success",
    lintOutcome: "success",
    lintEvidence: "No problems found.",
    fileExists: () => true,
  });
  assert.equal(result.eligible, false);
  assert.equal(result.reason, "healthy_typecheck_and_lint");
});

test("typecheck failure takes priority and compiles exact noncritical source paths", () => {
  const result = buildPrelaunchRepairPlan({
    mainSha: sha,
    typecheckOutcome: "failure",
    lintOutcome: "failure",
    typecheckEvidence: "src/lib/catalog.ts(12,4): error TS2322",
    lintEvidence: "src/components/ui/Button.tsx warning",
    fileExists: () => true,
  });
  assert.equal(result.eligible, true);
  assert.equal(result.plan.maxConcurrentTasks, 1);
  assert.equal(result.plan.maxRevisionAttempts, 2);
  assert.equal(result.plan.noAutomaticMerge, true);
  assert.deepEqual(result.plan.blocks[0].writable_paths, ["src/lib/catalog.ts"]);
  assert.match(result.plan.blocks[0].block_id, /^PRELAUNCH-PRELAUNCH-TYPECHECK-/);
});

test("successful lint with warnings creates a low-risk cleanup candidate", () => {
  const signal = detectPrelaunchRepairCandidate({
    mainSha: sha,
    typecheckOutcome: "success",
    lintOutcome: "success",
    lintEvidence: "src/components/ui/Button.tsx\n  12:4 warning unused variable",
  });
  assert.ok(signal);
  assert.match(signal.body, /Severity: low/);

  const result = buildPrelaunchRepairPlan({
    mainSha: sha,
    lintEvidence: "src/components/ui/Button.tsx\n  12:4 warning unused variable",
    fileExists: () => true,
  });
  assert.equal(result.eligible, true);
  assert.deepEqual(result.plan.blocks[0].writable_paths, ["src/components/ui/Button.tsx"]);
});

test("ambiguous, oversized, missing or critical paths fail closed", () => {
  const noPath = buildPrelaunchRepairPlan({
    mainSha: sha,
    lintOutcome: "failure",
    lintEvidence: "lint failed without a source file",
    fileExists: () => true,
  });
  assert.equal(noPath.eligible, false);

  const tooMany = buildPrelaunchRepairPlan({
    mainSha: sha,
    lintOutcome: "failure",
    lintEvidence: ["src/a.ts", "src/b.ts", "src/c.ts", "src/d.ts"].join("\n"),
    fileExists: () => true,
  });
  assert.equal(tooMany.eligible, false);
  assert.equal(tooMany.reason, "too_many_source_paths");

  const missing = buildPrelaunchRepairPlan({
    mainSha: sha,
    lintOutcome: "failure",
    lintEvidence: "src/components/ui/Missing.tsx",
    fileExists: () => false,
  });
  assert.equal(missing.eligible, false);
  assert.equal(missing.reason, "source_path_missing");

  const critical = buildPrelaunchRepairPlan({
    mainSha: sha,
    lintOutcome: "failure",
    lintEvidence: "src/app/api/private/route.ts",
    fileExists: () => true,
  });
  assert.equal(critical.eligible, false);
  assert.equal(critical.reason, "critical_path_requires_human_gate");
});

test("prelaunch repair never authorizes tests workflows dependencies or merge", () => {
  const result = buildPrelaunchRepairPlan({
    mainSha: sha,
    lintOutcome: "failure",
    lintEvidence: "src/components/ui/Button.tsx",
    fileExists: () => true,
  });
  assert.equal(result.eligible, true);
  const block = result.plan.blocks[0];
  assert.equal(block.merge_class, "AUTONOMOUS_SAFE");
  assert.equal(result.plan.noAutomaticMerge, true);
  assert.match(block.prompt, /Do not add features/);
  assert.match(block.prompt, /Never merge/);
  assert.equal(block.writable_paths.some((path) => path.startsWith("tests/")), false);
  assert.equal(block.writable_paths.some((path) => path.startsWith(".github/")), false);
});
