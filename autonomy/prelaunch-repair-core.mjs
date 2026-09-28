import { compileSignalContract } from "./improvement-contracts-core.mjs";
import { validateAutopilotPlan } from "./copilot-autopilot-core.mjs";

function issueNumberFromSha(mainSha) {
  const raw = String(mainSha || "").slice(0, 8);
  const value = Number.parseInt(raw, 16);
  return Number.isSafeInteger(value) && value > 0 ? value : 1;
}

function syntheticSignal({ key, category, severity, title, evidence, mainSha }) {
  return {
    number: issueNumberFromSha(mainSha),
    title,
    body: [
      "<!-- almago-improvement-signal:" + key + " -->",
      "# AlmaGo pre-launch repair signal",
      "",
      "Category: " + category,
      "Severity: " + severity,
      "",
      "## Evidence",
      String(evidence || "").slice(-6000),
      "",
      "## Safety",
      "Pre-launch bounded repair only.",
    ].join("\n"),
  };
}

export function detectPrelaunchRepairCandidate({
  mainSha = "",
  typecheckOutcome = "success",
  lintOutcome = "success",
  typecheckEvidence = "",
  lintEvidence = "",
} = {}) {
  if (typecheckOutcome !== "success") {
    return syntheticSignal({
      key: "prelaunch-typecheck",
      category: "typecheck",
      severity: "high",
      title: "[PRELAUNCH] TypeScript repair",
      evidence: typecheckEvidence,
      mainSha,
    });
  }

  if (lintOutcome !== "success") {
    return syntheticSignal({
      key: "prelaunch-lint",
      category: "lint",
      severity: "moderate",
      title: "[PRELAUNCH] Lint repair",
      evidence: lintEvidence,
      mainSha,
    });
  }

  if (/\bwarning\b/i.test(String(lintEvidence || ""))) {
    return syntheticSignal({
      key: "prelaunch-lint-warnings",
      category: "lint",
      severity: "low",
      title: "[PRELAUNCH] Lint warning cleanup",
      evidence: lintEvidence,
      mainSha,
    });
  }

  return null;
}

export function buildPrelaunchRepairPlan({
  mainSha = "",
  typecheckOutcome = "success",
  lintOutcome = "success",
  typecheckEvidence = "",
  lintEvidence = "",
  fileExists,
} = {}) {
  const signal = detectPrelaunchRepairCandidate({
    mainSha,
    typecheckOutcome,
    lintOutcome,
    typecheckEvidence,
    lintEvidence,
  });
  if (!signal) return { eligible: false, reason: "healthy_typecheck_and_lint" };

  const compiled = compileSignalContract(signal, { fileExists });
  if (!compiled.eligible) {
    return { eligible: false, reason: compiled.reason, signal };
  }

  const suffix = String(mainSha || "unknown").slice(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const block = {
    ...compiled.block,
    block_id: ("PRELAUNCH-" + signal.body.match(/almago-improvement-signal:([a-z0-9-]+)/)?.[1] + "-" + suffix)
      .toUpperCase(),
    lot: "PRELAUNCH-SELF-HEAL",
    depends_on: [],
    base_ref: "main",
    merge_class: "AUTONOMOUS_SAFE",
    stop_condition: "Open one bounded repair PR and reach MERGE_READY; never merge automatically.",
    prompt: [
      "PRE-LAUNCH SELF-HEALING REPAIR.",
      compiled.block.prompt,
      "This lane may repair only the exact lint/typecheck evidence captured from current main.",
      "Do not add features, redesign product behavior, edit tests to hide failures, or widen scope.",
      "Never merge, deploy, change workflows, dependencies, Auth/RLS/Supabase, migrations, secrets, billing, legal content, production data, or release-gate state.",
    ].join(" "),
  };

  const plan = {
    schemaVersion: 1,
    maxConcurrentTasks: 1,
    maxRevisionAttempts: 2,
    noAutomaticMerge: true,
    blocks: [block],
  };
  validateAutopilotPlan(plan);
  return { eligible: true, reason: "bounded_prelaunch_repair", signal, plan };
}
