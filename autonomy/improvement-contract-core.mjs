export const CONTRACT_DECISIONS = new Set(["AUTONOMOUS_SAFE", "HUMAN_GATE", "INSUFFICIENT_EVIDENCE"]);
export const VALIDATION_COMMANDS = new Set([
  "npm test",
  "npx tsc --noEmit",
  "npm run lint",
  "npm run build",
  "git diff --check",
]);

export const CONTRACT_MARKER = "<!-- almago-improvement-contract:v1 -->";
export const SIGNAL_POLICIES = Object.freeze({
  "main-tests": { category: "regression", severity: "high" },
  "main-typecheck": { category: "typecheck", severity: "high" },
  "main-lint": { category: "lint", severity: "moderate" },
  "production-audit": { category: "security", severity: "critical" },
});

export function policyForSignalKey(key) {
  const policy = SIGNAL_POLICIES[String(key || "")];
  if (!policy) throw new Error("Unknown continuous-improvement signal key.");
  return policy;
}

export function normalizeContractPath(value) {
  return String(value || "").trim().replace(/^\.\//, "").replace(/\\/g, "/").replace(/\/+/g, "/");
}

export function isSafeContractPath(value) {
  const path = normalizeContractPath(value);
  if (!path || path.includes("..") || /[*?\[{]/.test(path)) return false;
  if (!/^(?:src|tests|docs)\/[A-Za-z0-9_./-]+$/.test(path)) return false;
  if (path.startsWith("src/app/api/") ||
      path.startsWith("src/app/admin/") ||
      path.startsWith("src/app/auth/") ||
      path.startsWith("src/app/login/") ||
      path.startsWith("src/app/signup/") ||
      path.startsWith("src/app/reset-password/") ||
      path.startsWith("src/app/unauthorized/") ||
      path.startsWith("src/components/admin/") ||
      path.startsWith("src/components/auth/") ||
      path.startsWith("src/lib/supabase/") ||
      /(?:auth|role|permission|security|secret|token)/i.test(path)) return false;
  return true;
}

function boundedText(value, max) {
  const text = String(value || "").trim();
  if (!text || text.length > max) throw new Error("Contract text is missing or too long.");
  return text;
}

export function validateImprovementContract(contract, { existingFiles = new Set(), signalCategory = "regression", signalSeverity = "moderate" } = {}) {
  if (!contract || typeof contract !== "object") throw new Error("Contract is required.");
  if (!CONTRACT_DECISIONS.has(contract.decision)) throw new Error("Invalid contract decision.");
  boundedText(contract.summary, 1200);

  if (contract.decision !== "AUTONOMOUS_SAFE") {
    if (Array.isArray(contract.writable_paths) && contract.writable_paths.length) {
      throw new Error("Non-autonomous decisions must not grant writable paths.");
    }
    return true;
  }

  if (signalCategory === "security" || signalSeverity === "critical") {
    throw new Error("Security or critical signals cannot become autonomous contracts.");
  }

  boundedText(contract.goal, 1200);
  if (!Array.isArray(contract.writable_paths) || contract.writable_paths.length < 1 || contract.writable_paths.length > 3) {
    throw new Error("Autonomous contracts require 1-3 exact writable paths.");
  }
  const paths = contract.writable_paths.map(normalizeContractPath);
  if (new Set(paths).size !== paths.length) throw new Error("Writable paths must be unique.");
  for (const path of paths) {
    if (!isSafeContractPath(path)) throw new Error("Contract proposed an unsafe writable path: " + path);
    if (existingFiles.size && !existingFiles.has(path)) throw new Error("Contract proposed a non-existent file: " + path);
  }

  if (!Array.isArray(contract.acceptance) || contract.acceptance.length < 1 || contract.acceptance.length > 5) {
    throw new Error("Autonomous contracts require 1-5 acceptance criteria.");
  }
  for (const item of contract.acceptance) boundedText(item, 500);

  if (!Array.isArray(contract.validation_commands) || contract.validation_commands.length < 1 || contract.validation_commands.length > 5) {
    throw new Error("Autonomous contracts require validation commands.");
  }
  if (contract.validation_commands.some((command) => !VALIDATION_COMMANDS.has(command))) {
    throw new Error("Contract proposed an unsupported validation command.");
  }
  return true;
}

export function contractComment(contract, { signalKey, signalIssue }) {
  const payload = {
    schemaVersion: 1,
    signal_key: signalKey,
    signal_issue: Number(signalIssue),
    base_ref: "main",
    merge_class: contract.decision === "AUTONOMOUS_SAFE" ? "AUTONOMOUS_SAFE" : "HUMAN_GATE",
    decision: contract.decision,
    summary: String(contract.summary || "").slice(0, 1200),
    goal: String(contract.goal || "").slice(0, 1200),
    writable_paths: Array.isArray(contract.writable_paths) ? contract.writable_paths.map(normalizeContractPath) : [],
    acceptance: Array.isArray(contract.acceptance) ? contract.acceptance : [],
    validation_commands: Array.isArray(contract.validation_commands) ? contract.validation_commands : [],
    model: "gpt-5.3-codex",
  };
  return [CONTRACT_MARKER, "```json", JSON.stringify(payload, null, 2), "```"].join("\n");
}

export function hasContractComment(comments = []) {
  return comments.some((comment) => String(comment?.body || "").includes(CONTRACT_MARKER));
}

export function needsFreshContract(comments = [], recurrenceMarker) {
  let lastContract = -1;
  let lastRecurrence = -1;
  comments.forEach((comment, index) => {
    const body = String(comment?.body || "");
    if (body.includes(CONTRACT_MARKER)) lastContract = index;
    if (recurrenceMarker && body.includes(recurrenceMarker)) lastRecurrence = index;
  });
  if (lastContract < 0) return true;
  return lastRecurrence > lastContract;
}
