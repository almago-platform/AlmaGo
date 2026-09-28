import { AGENT_TASK_MODELS, AGENT_TASK_STATES } from "./copilot-agent-client.mjs";

export const AUTOPILOT_STATES = new Set([
  "READY", "DISPATCHING", "QUEUED", "IN_PROGRESS", "WAITING_FOR_USER",
  "CI", "REVIEW", "REVISE", "MERGE_READY", "DONE", "BLOCKED",
  "BLOCKED_BY_LOCK", "BLOCKED_MODEL", "HUMAN_GATE",
]);

export const MERGE_CLASSES = new Set(["AUTONOMOUS_SAFE", "HUMAN_GATE"]);
export const SUPERVISOR_DECISIONS = new Set([
  "APPROVED", "APPROVED_WITH_CHANGES", "REVISE", "BLOCKED",
]);

export function normalizePath(value) {
  return String(value || "").trim().replace(/^\.\//, "").replace(/\\/g, "/").replace(/\/+/g, "/");
}

function prefixBeforeGlob(pattern) {
  const clean = normalizePath(pattern);
  const idx = clean.search(/[?*[{]/);
  return (idx < 0 ? clean : clean.slice(0, idx)).replace(/\/+$/, "");
}

export function pathsOverlap(a, b) {
  const pa = prefixBeforeGlob(a);
  const pb = prefixBeforeGlob(b);
  if (!pa || !pb) return true;
  return pa === pb || pa.startsWith(pb + "/") || pb.startsWith(pa + "/");
}

export function pathMatchesPattern(path, pattern) {
  const candidate = normalizePath(path);
  const normalizedPattern = normalizePath(pattern);
  if (!candidate || !normalizedPattern) return false;
  if (!/[?*[{]/.test(normalizedPattern)) return candidate === normalizedPattern;
  const prefix = prefixBeforeGlob(normalizedPattern);
  if (!prefix) return true;
  return candidate === prefix || candidate.startsWith(prefix + "/");
}

export function scopeAssessment(block, changedFiles = []) {
  const writable = Array.isArray(block?.writable_paths) ? block.writable_paths : [];
  const forbidden = Array.isArray(block?.forbidden_paths) ? block.forbidden_paths : [];
  const normalized = changedFiles.map(normalizePath).filter(Boolean);
  return {
    scopeExact: normalized.length > 0 && normalized.every((file) =>
      writable.some((pattern) => pathMatchesPattern(file, pattern))
    ),
    forbiddenTouched: normalized.some((file) =>
      forbidden.some((pattern) => pathMatchesPattern(file, pattern))
    ),
  };
}

export function collidesWithLocks(block, locks = []) {
  return locks.some((lock) =>
    ["DISPATCHING", "QUEUED", "IN_PROGRESS", "WAITING_FOR_USER", "CI", "REVIEW", "REVISE"].includes(lock.state) &&
    (block.writable_paths || []).some((path) =>
      (lock.writable_paths || []).some((locked) => pathsOverlap(path, locked))
    )
  );
}

export function isCriticalPath(path) {
  const p = normalizePath(path);
  return p.startsWith(".github/") ||
    p.startsWith("supabase/migrations/") ||
    /^src\/(?:app\/(?:api|auth)|lib\/supabase|components\/auth)\//.test(p) ||
    /(?:auth|role|permission|security|secret|token)/i.test(p);
}

export function validateAutopilotPlan(plan) {
  if (!plan || plan.schemaVersion !== 1 || !Array.isArray(plan.blocks) || !plan.blocks.length) {
    throw new Error("Invalid Copilot Autopilot plan.");
  }
  const ids = new Set();
  for (const block of plan.blocks) {
    if (!/^[A-Z0-9-]+$/.test(block.block_id) || ids.has(block.block_id)) {
      throw new Error("Invalid or duplicate block_id: " + block.block_id);
    }
    ids.add(block.block_id);
    if (!Array.isArray(block.depends_on) || !Array.isArray(block.writable_paths) || !Array.isArray(block.forbidden_paths)) {
      throw new Error("Autopilot block arrays are required: " + block.block_id);
    }
    if (!MERGE_CLASSES.has(block.merge_class)) throw new Error("Invalid merge_class for " + block.block_id);
    if (!block.model || !AGENT_TASK_MODELS.has(block.model)) throw new Error("Unsupported model for " + block.block_id);
    if (!block.base_ref || !block.prompt) throw new Error("base_ref and prompt are required for " + block.block_id);
  }
  for (const block of plan.blocks) {
    for (const dep of block.depends_on) if (!ids.has(dep)) throw new Error("Unknown dependency " + dep);
  }
  return true;
}

export function agentTaskPullRequestNumber(task) {
  const artifact = Array.isArray(task?.artifacts)
    ? task.artifacts.find((item) => item?.provider === "github" && item?.type === "pull")
    : null;
  const value = Number(artifact?.data?.number || 0);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export function reconciledPullRequestNumber({
  resolvedByHead = null,
  artifactNumber = null,
  priorPullNumber = null,
  hasHeadRef = false,
} = {}) {
  const valid = (value) => {
    const number = Number(value || 0);
    return Number.isSafeInteger(number) && number > 0 ? number : null;
  };
  if (hasHeadRef) return valid(resolvedByHead);
  return valid(artifactNumber) || valid(priorPullNumber);
}

export function mapAgentTaskState(state) {
  if (!AGENT_TASK_STATES.has(state)) throw new Error("Unknown Agent Task state: " + state);
  return ({
    queued: "QUEUED",
    in_progress: "IN_PROGRESS",
    completed: "CI",
    idle: "IN_PROGRESS",
    waiting_for_user: "WAITING_FOR_USER",
    failed: "BLOCKED",
    timed_out: "BLOCKED",
    cancelled: "BLOCKED",
  })[state];
}

export function leaseExpired(lock, now = Date.now()) {
  const value = Date.parse(lock?.lease_expires_at || "");
  return Number.isFinite(value) && value <= now;
}

export function selectEligibleBlocks(plan, stateByBlock = new Map(), locks = []) {
  validateAutopilotPlan(plan);
  const done = (id) => stateByBlock.get(id) === "DONE";
  const selected = [];
  for (const block of plan.blocks) {
    if (block.enabled !== true) continue;
    const state = stateByBlock.get(block.block_id) || "READY";
    if (!["READY", "BLOCKED_BY_LOCK"].includes(state)) continue;
    if (block.merge_class === "HUMAN_GATE") continue;
    if (!block.depends_on.every(done)) continue;
    if (block.writable_paths.some((path) =>
      block.forbidden_paths.some((forbidden) => pathsOverlap(path, forbidden))
    )) continue;
    const provisional = selected.map((item) => ({ state: "DISPATCHING", writable_paths: item.writable_paths }));
    if (collidesWithLocks(block, [...locks, ...provisional])) continue;
    selected.push(block);
    if (selected.length >= Number(plan.maxConcurrentTasks || 1)) break;
  }
  return selected;
}

export function browserQualityRequirement(changedFiles = []) {
  const ui = changedFiles.some((file) =>
    /^(?:src\/(?:app|components)\/|public\/)/.test(normalizePath(file)) &&
    !/\.(?:test|spec)\./.test(file)
  );
  return ui ? "REQUIRED" : "NOT_APPLICABLE";
}

export function checksValidForHead(checks, expectedHead) {
  return Boolean(expectedHead) && checks.every((check) => check.head_sha === expectedHead);
}

export function workflowResult(runs = [], workflowName) {
  const matching = runs
    .filter((run) => run?.name === workflowName)
    .sort((a, b) =>
      Date.parse(b.updated_at || b.created_at || 0) - Date.parse(a.updated_at || a.created_at || 0)
    );
  const run = matching[0];
  if (!run || run.status !== "completed") return "PENDING";
  if (run.conclusion === "success") return "SUCCESS";
  if (run.conclusion === "skipped") return "SKIPPED";
  return "FAILURE";
}

export function supervisorDecisionForHead(comments = [], expectedHead) {
  if (!expectedHead) return null;
  for (const comment of [...comments].reverse()) {
    const body = String(comment?.body || "");
    const decision = body.match(/^SUPERVISOR:\s*(APPROVED_WITH_CHANGES|APPROVED|REVISE|BLOCKED)\s*$/mi)?.[1];
    const reviewedHead = body.match(/Reviewed HEAD:\s*`([0-9a-f]{40})`/i)?.[1];
    if (!decision || !SUPERVISOR_DECISIONS.has(decision) || reviewedHead !== expectedHead) continue;
    return { decision, feedback: body.slice(0, 6000) };
  }
  return null;
}

export function canRevise(lock, maxAttempts = 3) {
  return Number(lock?.revision_attempts || 0) < maxAttempts;
}

export function mergeReadiness({
  block, headMatches, baseMatches, ci, browser, supervisor,
  scopeExact, forbiddenTouched, conflict,
}) {
  if (!block || block.merge_class !== "AUTONOMOUS_SAFE") return "HUMAN_GATE";
  if (!headMatches || !baseMatches || ci !== "SUCCESS") return "BLOCKED";
  if (!["SUCCESS", "NOT_APPLICABLE"].includes(browser)) return "BLOCKED";
  if (supervisor !== "APPROVED" || !scopeExact || forbiddenTouched || conflict) return "BLOCKED";
  if (block.writable_paths.some(isCriticalPath)) return "HUMAN_GATE";
  return "MERGE_READY";
}

export function lifecycleDecision({
  block,
  lock,
  prOpen,
  prMerged,
  headMatches,
  baseMatches,
  ci,
  browser,
  supervisor,
  scopeExact,
  forbiddenTouched,
  conflict,
  maxRevisionAttempts = 3,
}) {
  if (prMerged) return { state: "DONE", action: "DONE", reason: "pull request merged" };
  if (!prOpen) return { state: "BLOCKED", action: "STOP", reason: "pull request closed without merge" };
  if (!headMatches || !baseMatches) {
    return { state: "BLOCKED", action: "STOP", reason: "pull request branch/base no longer matches the contract" };
  }
  if (!scopeExact || forbiddenTouched) {
    return { state: "BLOCKED", action: "STOP", reason: "changed files violate the writable/forbidden path contract" };
  }
  if (conflict) return { state: "BLOCKED", action: "STOP", reason: "pull request has merge conflicts" };

  if (ci === "PENDING" || browser === "PENDING") {
    return { state: "CI", action: "WAIT", reason: "canonical checks still pending" };
  }

  if (ci !== "SUCCESS" || !["SUCCESS", "NOT_APPLICABLE"].includes(browser)) {
    if (canRevise(lock, maxRevisionAttempts)) {
      return { state: "REVISE", action: "REVISE", reason: "canonical validation failed" };
    }
    return { state: "HUMAN_GATE", action: "STOP", reason: "revision budget exhausted after validation failures" };
  }

  if (!supervisor) {
    return { state: "REVIEW", action: "WAIT", reason: "waiting for supervisor decision bound to this HEAD" };
  }

  if (supervisor === "BLOCKED") {
    return { state: "BLOCKED", action: "STOP", reason: "supervisor blocked the change" };
  }
  if (supervisor === "REVISE" || supervisor === "APPROVED_WITH_CHANGES") {
    if (canRevise(lock, maxRevisionAttempts)) {
      return { state: "REVISE", action: "REVISE", reason: "supervisor requested changes" };
    }
    return { state: "HUMAN_GATE", action: "STOP", reason: "revision budget exhausted after supervisor feedback" };
  }

  const readiness = mergeReadiness({
    block,
    headMatches,
    baseMatches,
    ci,
    browser,
    supervisor,
    scopeExact,
    forbiddenTouched,
    conflict,
  });
  if (readiness === "MERGE_READY") {
    return { state: "MERGE_READY", action: "WAIT_MERGE", reason: "all automatic gates passed" };
  }
  if (readiness === "HUMAN_GATE") {
    return { state: "HUMAN_GATE", action: "STOP", reason: "change requires explicit human merge gate" };
  }
  return { state: "BLOCKED", action: "STOP", reason: "merge readiness failed closed" };
}
