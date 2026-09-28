import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { isCriticalPath, validateAutopilotPlan } from "./copilot-autopilot-core.mjs";
import { signalKeyFromIssue } from "./continuous-improvement-core.mjs";

export const CONTRACT_MARKER = "<!-- almago-improvement-contract:";
export const AUTO_CONTRACT_CATEGORIES = new Set(["typecheck", "lint"]);
export const CONTRACT_READY_LABEL = "almago-autopilot-contract-ready";
export const CONTRACT_LABEL = "almago-improvement-contract";
export const CONTRACT_NEEDS_PLANNING_LABEL = "almago-contract-needs-planning";

const FORBIDDEN_PATHS = [
  ".github/**",
  "supabase/**",
  "src/app/api/**",
  "src/app/auth/**",
  "src/components/auth/**",
  "src/lib/supabase/**",
  "package.json",
  "package-lock.json",
];

function field(body, name) {
  return String(body || "").match(new RegExp("^" + name + ":\\s*(.+)$", "mi"))?.[1]?.trim() || null;
}

function evidenceSection(body) {
  return String(body || "").match(/## Evidence\s*\n([\s\S]*?)(?=\n## |$)/i)?.[1]?.trim() || "";
}

export function contractMarker(signalKey) {
  const key = String(signalKey || "");
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(key)) throw new Error("Invalid contract signal key.");
  return CONTRACT_MARKER + key + " -->";
}

export function contractKeyFromIssue(issue) {
  return String(issue?.body || "").match(/<!--\s*almago-improvement-contract:([a-z0-9][a-z0-9-]{1,63})\s*-->/)?.[1] || null;
}

export function sourcePathsFromEvidence(evidence) {
  const matches = String(evidence || "").match(/\bsrc\/[A-Za-z0-9_.\/-]+\.(?:tsx?|jsx?|mjs|cjs|css|json)\b/g) || [];
  return [...new Set(matches.map((value) => value.replace(/\\/g, "/")))].sort();
}

export function parseSignalIssue(issue) {
  const key = signalKeyFromIssue(issue);
  if (!key) return null;
  const body = String(issue?.body || "");
  return {
    key,
    category: field(body, "Category"),
    severity: field(body, "Severity"),
    evidence: evidenceSection(body),
    title: String(issue?.title || key).slice(0, 180),
    issue_number: Number(issue?.number || 0),
  };
}

function defaultFileExists(path) {
  return existsSync(resolve(path));
}

export function compileSignalContract(issue, {
  fileExists = defaultFileExists,
  maxFiles = 3,
} = {}) {
  const signal = parseSignalIssue(issue);
  if (!signal) return { eligible: false, reason: "missing_signal_marker" };
  if (!AUTO_CONTRACT_CATEGORIES.has(signal.category)) {
    return { eligible: false, reason: "category_requires_planning", signal };
  }

  const candidates = sourcePathsFromEvidence(signal.evidence);
  if (!candidates.length) return { eligible: false, reason: "no_exact_source_paths", signal };
  if (candidates.length > maxFiles) return { eligible: false, reason: "too_many_source_paths", signal, candidates };
  if (candidates.some((path) => !fileExists(path))) {
    return { eligible: false, reason: "source_path_missing", signal, candidates };
  }
  if (candidates.some(isCriticalPath)) {
    return { eligible: false, reason: "critical_path_requires_human_gate", signal, candidates };
  }

  const block = {
    block_id: ("CI-" + signal.key + "-" + signal.issue_number).toUpperCase(),
    lot: "CONTINUOUS",
    title: signal.title,
    enabled: true,
    depends_on: [],
    agent: "codex",
    model: "gpt-5.3-codex",
    custom_agent: null,
    base_ref: "main",
    writable_paths: candidates,
    forbidden_paths: FORBIDDEN_PATHS,
    risk_class: signal.category === "lint" ? "low" : "moderate",
    merge_class: "AUTONOMOUS_SAFE",
    stop_condition: "Reach MERGE_READY through canonical validation; never merge automatically.",
    prompt: [
      "Repair continuous-improvement signal " + signal.key + " from issue #" + signal.issue_number + ".",
      "Modify only these exact files: " + candidates.join(", ") + ".",
      "Do not touch tests merely to silence failures unless a listed test file is explicitly writable (none are authorized by this contract).",
      "Do not touch Auth/RLS, API routes, migrations, workflows, dependencies, secrets, billing, production data, or deployment configuration.",
      "Run the relevant lint/typecheck checks and preserve existing behavior unless the diagnostic evidence requires a bounded correction.",
    ].join(" "),
    source_signal_key: signal.key,
    source_issue_number: signal.issue_number,
  };

  validateAutopilotPlan({
    schemaVersion: 1,
    maxConcurrentTasks: 1,
    maxRevisionAttempts: 3,
    noAutomaticMerge: true,
    blocks: [block],
  });

  return { eligible: true, reason: "exact_noncritical_source_contract", signal, block };
}

export function contractIssueBody(compiled) {
  if (!compiled?.eligible || !compiled.block || !compiled.signal) throw new Error("Eligible compiled contract required.");
  return [
    contractMarker(compiled.signal.key),
    "# AlmaGo continuous-improvement implementation contract",
    "",
    "Source signal: #" + compiled.signal.issue_number,
    "Signal key: " + compiled.signal.key,
    "Compiler result: " + compiled.reason,
    "",
    "## Machine-readable contract",
    "```json",
    JSON.stringify(compiled.block, null, 2),
    "```",
    "",
    "## Safety",
    "- This contract was compiled only from deterministic lint/typecheck evidence containing exact existing non-critical src/** paths.",
    "- The contract does not authorize edits outside writable_paths.",
    "- Open-PR collision checks are still required before any future dispatch.",
    "- Canonical CI, conditional Browser Quality, exact-HEAD supervisor review, and the bounded revision budget remain mandatory.",
    "- Automatic merge remains disabled.",
  ].join("\n");
}
