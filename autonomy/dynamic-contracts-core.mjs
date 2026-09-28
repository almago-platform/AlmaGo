import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  isCriticalPath,
  normalizePath,
  pathsOverlap,
  validateAutopilotPlan,
} from "./copilot-autopilot-core.mjs";
import {
  CONTRACT_LABEL,
  CONTRACT_READY_LABEL,
  contractKeyFromIssue,
} from "./improvement-contracts-core.mjs";
import { signalKeyFromIssue } from "./continuous-improvement-core.mjs";

function labels(issue) {
  return new Set((issue?.labels || []).map((label) => typeof label === "string" ? label : label.name));
}

function machineContract(body) {
  const raw = String(body || "").match(/## Machine-readable contract\s*\n```json\s*([\s\S]*?)\s*```/i)?.[1];
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function exactSourcePath(path) {
  const value = normalizePath(path);
  return value.startsWith("src/") &&
    !/[?*[{]/.test(value) &&
    !isCriticalPath(value);
}

export function parseReadyDynamicContract(issue, { fileExists = (path) => existsSync(resolve(path)) } = {}) {
  if (!issue || issue.state !== "open") return { eligible: false, reason: "contract_not_open" };
  const issueLabels = labels(issue);
  if (!issueLabels.has(CONTRACT_LABEL) || !issueLabels.has(CONTRACT_READY_LABEL)) {
    return { eligible: false, reason: "contract_not_ready" };
  }
  if (issueLabels.has("almago-human-required")) return { eligible: false, reason: "contract_human_gated" };

  const key = contractKeyFromIssue(issue);
  const block = machineContract(issue.body);
  if (!key || !block) return { eligible: false, reason: "invalid_contract_body" };
  if (block.source_signal_key !== key) return { eligible: false, reason: "signal_key_mismatch" };
  if (!Number.isSafeInteger(Number(block.source_issue_number)) || Number(block.source_issue_number) <= 0) {
    return { eligible: false, reason: "invalid_source_issue" };
  }

  try {
    validateAutopilotPlan({
      schemaVersion: 1,
      maxConcurrentTasks: 1,
      maxRevisionAttempts: 3,
      noAutomaticMerge: true,
      blocks: [block],
    });
  } catch {
    return { eligible: false, reason: "autopilot_contract_invalid" };
  }

  if (block.enabled !== true || block.base_ref !== "main" || block.merge_class !== "AUTONOMOUS_SAFE") {
    return { eligible: false, reason: "unsafe_contract_policy" };
  }
  if (block.lot !== "CONTINUOUS" || block.depends_on.length !== 0) {
    return { eligible: false, reason: "unsupported_dynamic_contract_shape" };
  }
  if (block.writable_paths.length < 1 || block.writable_paths.length > 3) {
    return { eligible: false, reason: "invalid_writable_path_count" };
  }
  if (!block.writable_paths.every(exactSourcePath)) {
    return { eligible: false, reason: "writable_path_not_exact_safe_source" };
  }
  if (block.writable_paths.some((path) => !fileExists(path))) {
    return { eligible: false, reason: "writable_path_missing" };
  }

  return {
    eligible: true,
    reason: "ready_dynamic_contract",
    key,
    source_issue_number: Number(block.source_issue_number),
    block,
  };
}

export function sourceSignalStillValid(sourceIssue, key) {
  return Boolean(
    sourceIssue &&
    sourceIssue.state === "open" &&
    signalKeyFromIssue(sourceIssue) === key &&
    !labels(sourceIssue).has("almago-human-required")
  );
}

export function firstOpenPrCollision(block, prScopes = []) {
  for (const scope of prScopes) {
    const files = Array.isArray(scope?.files) ? scope.files : [];
    const collision = (block?.writable_paths || []).some((wanted) =>
      files.some((file) => pathsOverlap(wanted, file))
    );
    if (collision) return { pr_number: Number(scope.pr_number || 0), files };
  }
  return null;
}
