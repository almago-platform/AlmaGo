import { readFileSync } from "node:fs";

export const PLAN_STATUSES = new Set(["DONE", "TODO", "BLOCKED"]);
export const EXECUTION_MODES = new Set(["ai", "codex", "human", "system"]);

export function loadPlan(path = "config/almago-master-plan.json") {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function validatePlan(plan) {
  if (!plan || plan.schemaVersion !== 1 || !Array.isArray(plan.tasks) || plan.tasks.length !== 45) {
    throw new Error("Master plan must contain exactly 45 base tasks using schemaVersion 1.");
  }
  const ids = new Set();
  for (const task of plan.tasks) {
    if (!/^A\d{2}$/.test(task.id) || ids.has(task.id)) throw new Error("Invalid or duplicate task id: " + task.id);
    ids.add(task.id);
    if (!PLAN_STATUSES.has(task.status)) throw new Error("Invalid status for " + task.id);
    if (!EXECUTION_MODES.has(task.execution)) throw new Error("Invalid execution mode for " + task.id);
    if (!Array.isArray(task.dependsOn) || !Array.isArray(task.acceptance) || !task.acceptance.length) {
      throw new Error("Dependencies and acceptance are required for " + task.id);
    }
    for (const dep of task.dependsOn) if (!/^A\d{2}$/.test(dep)) throw new Error("Invalid dependency " + dep);
    if (task.execution === "ai" && (!Array.isArray(task.files) || task.files.length < 1 || task.files.length > 3)) {
      throw new Error("AI task " + task.id + " must have 1-3 exact files.");
    }
  }
  for (const task of plan.tasks) for (const dep of task.dependsOn) if (!ids.has(dep)) throw new Error("Unknown dependency " + dep);
  if (!Array.isArray(plan.extensions) || plan.extensions.length !== 6) throw new Error("Master plan must contain 6 extensions.");
  return true;
}

export function issueTaskId(issue) {
  const match = String(issue?.body || "").match(/<!--\s*almago-plan-task:(A\d{2})\s*-->/);
  return match?.[1] || null;
}

export function statusFromIssue(issue) {
  if (!issue) return null;
  if (issue.state === "closed") return "DONE";
  const labels = new Set((issue.labels || []).map(label => typeof label === "string" ? label : label.name));
  if (labels.has("almago-plan-done")) return "DONE";
  if (labels.has("almago-ai-blocked") || labels.has("almago-human-required")) return "BLOCKED";
  if (labels.has("almago-ai-running")) return "RUNNING";
  if (labels.has("almago-ai-proposed")) return "REVIEW";
  if (labels.has("almago-codex-required")) return "CODEX_REQUIRED";
  if (labels.has("almago-system-required")) return "SYSTEM_REQUIRED";
  return "READY";
}

export function effectiveStatus(task, issue) {
  if (task.status === "DONE") return "DONE";
  return statusFromIssue(issue) || task.status;
}

export function nextEligibleTask(plan, issues = []) {
  validatePlan(plan);
  const byId = new Map(issues.map(issue => [issueTaskId(issue), issue]).filter(([id]) => id));
  const status = new Map(plan.tasks.map(task => [task.id, effectiveStatus(task, byId.get(task.id))]));
  const active = [...status.values()].some(value => ["READY","RUNNING","REVIEW","CODEX_REQUIRED","SYSTEM_REQUIRED"].includes(value));
  if (active) return null;
  return plan.tasks.find(task => status.get(task.id) === "TODO" && task.dependsOn.every(dep => status.get(dep) === "DONE")) || null;
}

export function routeTask(task) {
  if (!task) return null;
  if (task.execution === "human") return "human";
  if (task.execution === "system") return "system";
  if (task.execution === "codex" || ["high","critical"].includes(task.risk)) return "codex";
  return "ai";
}

export function taskIssueBody(task) {
  const files = (task.files || []).map(file => "- " + file).join("\n");
  const acceptance = task.acceptance.map(item => "- " + item).join("\n");
  const lines = ["<!-- almago-plan-task:" + task.id + " -->"];
  if (task.execution === "ai") lines.push("<!-- almago-ai-task -->");
  lines.push("Plan task: " + task.id, "Lot: " + task.lot, "Execution: " + task.execution, "", "Files:", files || "- (managed/system task)", "", "Goal:", task.title, "", "Acceptance:", acceptance, "", "Constraints:", "- Respect the AlmaGo master plan and existing business truth.", "- Do not broaden scope beyond this task.", "- Auth/RLS/Storage/permissions/secrets stay protected unless explicitly routed to CODEX/HUMAN.");
  return lines.join("\n");
}

export function progress(plan, issues = []) {
  validatePlan(plan);
  const byId = new Map(issues.map(issue => [issueTaskId(issue), issue]).filter(([id]) => id));
  const rows = plan.tasks.map(task => ({ task, status: effectiveStatus(task, byId.get(task.id)) }));
  const done = rows.filter(row => row.status === "DONE").length;
  return { total: rows.length, done, percent: Math.round((done / rows.length) * 100), rows };
}
