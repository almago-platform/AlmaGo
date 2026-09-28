import assert from "node:assert/strict";
import test from "node:test";
import {
  compileSignalContract,
  contractIssueBody,
  contractKeyFromIssue,
  contractMarker,
  parseSignalIssue,
  sourcePathsFromEvidence,
} from "./improvement-contracts-core.mjs";

function signalIssue({
  key = "main-lint",
  category = "lint",
  severity = "moderate",
  evidence = "src/components/ui/Button.tsx:12:4 lint failure",
  number = 501,
} = {}) {
  return {
    number,
    title: "[CONTINUOUS] Example",
    body: [
      "<!-- almago-improvement-signal:" + key + " -->",
      "# AlmaGo continuous-improvement signal",
      "",
      "Category: " + category,
      "Severity: " + severity,
      "",
      "## Evidence",
      evidence,
      "",
      "## Safety",
      "Discovery only.",
    ].join("\n"),
  };
}

test("contract markers are stable and parseable", () => {
  const marker = contractMarker("main-lint");
  assert.equal(marker, "<!-- almago-improvement-contract:main-lint -->");
  assert.equal(contractKeyFromIssue({ body: marker }), "main-lint");
  assert.throws(() => contractMarker("../unsafe"));
});

test("signal parser extracts deterministic metadata and evidence only", () => {
  const parsed = parseSignalIssue(signalIssue());
  assert.equal(parsed.key, "main-lint");
  assert.equal(parsed.category, "lint");
  assert.equal(parsed.severity, "moderate");
  assert.match(parsed.evidence, /Button\.tsx/);
});

test("source path extraction is exact deduplicated and src-only", () => {
  assert.deepEqual(
    sourcePathsFromEvidence([
      "src/components/ui/Button.tsx:12:4",
      "tests/button.test.mjs:5:1",
      "src/components/ui/Button.tsx(20,2)",
      "src/lib/example.ts:1:1",
    ].join("\n")),
    ["src/components/ui/Button.tsx", "src/lib/example.ts"],
  );
});

test("lint signal compiles to exact safe Autopilot contract", () => {
  const result = compileSignalContract(signalIssue(), { fileExists: () => true });
  assert.equal(result.eligible, true);
  assert.equal(result.block.block_id, "CI-MAIN-LINT-501");
  assert.deepEqual(result.block.writable_paths, ["src/components/ui/Button.tsx"]);
  assert.equal(result.block.merge_class, "AUTONOMOUS_SAFE");
  assert.equal(result.block.enabled, true);
  assert.match(result.block.prompt, /Modify only these exact files/);
});

test("typecheck can compile multiple existing noncritical files but never more than three", () => {
  const result = compileSignalContract(signalIssue({
    key: "main-typecheck",
    category: "typecheck",
    severity: "high",
    evidence: [
      "src/components/ui/Button.tsx(1,1): error TS1",
      "src/components/ui/Card.tsx(2,2): error TS2",
      "src/lib/catalog.ts(3,3): error TS3",
    ].join("\n"),
  }), { fileExists: () => true });
  assert.equal(result.eligible, true);
  assert.equal(result.block.writable_paths.length, 3);

  const tooMany = compileSignalContract(signalIssue({
    key: "main-typecheck",
    category: "typecheck",
    evidence: [
      "src/a.ts:1",
      "src/b.ts:1",
      "src/c.ts:1",
      "src/d.ts:1",
    ].join("\n"),
  }), { fileExists: () => true });
  assert.equal(tooMany.eligible, false);
  assert.equal(tooMany.reason, "too_many_source_paths");
});

test("test regressions and security signals never auto-compile", () => {
  const regression = compileSignalContract(signalIssue({
    key: "main-tests",
    category: "regression",
    severity: "high",
  }), { fileExists: () => true });
  assert.equal(regression.eligible, false);
  assert.equal(regression.reason, "category_requires_planning");

  const security = compileSignalContract(signalIssue({
    key: "production-audit",
    category: "security",
    severity: "critical",
  }), { fileExists: () => true });
  assert.equal(security.eligible, false);
  assert.equal(security.reason, "category_requires_planning");
});

test("critical paths missing files and empty evidence fail closed", () => {
  const critical = compileSignalContract(signalIssue({
    evidence: "src/app/api/private/route.ts:1:1 lint failure",
  }), { fileExists: () => true });
  assert.equal(critical.eligible, false);
  assert.equal(critical.reason, "critical_path_requires_human_gate");

  const missing = compileSignalContract(signalIssue({
    evidence: "src/components/ui/Missing.tsx:1:1 lint failure",
  }), { fileExists: () => false });
  assert.equal(missing.eligible, false);
  assert.equal(missing.reason, "source_path_missing");

  const none = compileSignalContract(signalIssue({ evidence: "lint failed without file evidence" }), {
    fileExists: () => true,
  });
  assert.equal(none.eligible, false);
  assert.equal(none.reason, "no_exact_source_paths");
});

test("contract issue body is machine-readable and still forbids automatic merge", () => {
  const compiled = compileSignalContract(signalIssue(), { fileExists: () => true });
  const body = contractIssueBody(compiled);
  assert.match(body, /almago-improvement-contract:main-lint/);
  assert.match(body, /"writable_paths"/);
  assert.match(body, /Open-PR collision checks are still required/);
  assert.match(body, /Automatic merge remains disabled/);
});
