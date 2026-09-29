import { loadPlan, validatePlan, nextEligibleTask, routeTask, taskIssueBody, progress, issueTaskId, dispatchableReadyIssue, standaloneAiReadyIssue } from "./plan-core.mjs";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
if (!token || !repository || !repository.includes("/")) throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY are required.");
const [owner, repo] = repository.split("/");
const headers = {
  Authorization: "Bearer " + token,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
};

async function gh(path, options = {}) {
  const response = await fetch("https://api.github.com" + path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  if (!response.ok) throw new Error("GitHub " + response.status + ": " + await response.text());
  if (response.status === 204) return null;
  return response.json();
}

const labelDefinitions = [
  ["almago-plan","29308B","Task from the AlmaGo master plan"],
  ["almago-ai-ready","2DA44E","Safe bounded task ready for Gemini/Grok"],
  ["almago-ai-running","FBCA04","AI worker currently processing the task"],
  ["almago-ai-proposed","8250DF","AI proposal has an open pull request"],
  ["almago-ai-blocked","D73A4A","Automatic worker stopped and needs inspection"],
  ["almago-codex-required","EA5C0B","Complex or sensitive task reserved for Codex/deep review"],
  ["almago-human-required","B60205","User/account/legal intervention required"],
  ["almago-system-required","0E8A16","Repository infrastructure task"],
  ["almago-plan-done","1D76DB","Master-plan task completed"],
];

async function ensureLabels() {
  const existing = await gh("/repos/" + owner + "/" + repo + "/labels?per_page=100");
  const names = new Set(existing.map(label => label.name));
  for (const [name,color,description] of labelDefinitions) {
    if (!names.has(name)) await gh("/repos/" + owner + "/" + repo + "/labels", { method:"POST", body:JSON.stringify({name,color,description}) });
  }
}

async function listPlanIssues() {
  const issues = await gh("/repos/" + owner + "/" + repo + "/issues?state=all&labels=almago-plan&per_page=100");
  return issues.filter(issue => !issue.pull_request && issueTaskId(issue));
}

async function listStandaloneReadyAiIssues() {
  const issues = await gh("/repos/" + owner + "/" + repo + "/issues?state=open&labels=almago-ai-ready&sort=created&direction=asc&per_page=100");
  return issues.filter(issue => !issue.pull_request && !issueTaskId(issue));
}

function labelsForRoute(route) {
  if (route === "ai") return ["almago-plan","almago-ai-ready"];
  if (route === "codex") return ["almago-plan","almago-codex-required"];
  if (route === "human") return ["almago-plan","almago-human-required"];
  return ["almago-plan","almago-system-required"];
}

async function markStaleAiBlocked(issues) {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const issue of issues) {
    const labels = new Set(issue.labels.map(label => label.name));
    if (!labels.has("almago-ai-running") || new Date(issue.updated_at).getTime() >= cutoff) continue;
    await gh("/repos/" + owner + "/" + repo + "/issues/" + issue.number + "/labels/almago-ai-running", {method:"DELETE"}).catch(() => null);
    await gh("/repos/" + owner + "/" + repo + "/issues/" + issue.number + "/labels", {method:"POST",body:JSON.stringify({labels:["almago-ai-blocked"]})});
    await gh("/repos/" + owner + "/" + repo + "/issues/" + issue.number + "/comments", {method:"POST",body:JSON.stringify({body:"Watchdog: task remained RUNNING for more than 2 hours and is now BLOCKED for inspection."})});
  }
}

async function upsertDashboard(plan, issues, selected) {
  const p = progress(plan, issues);
  const active = p.rows.filter(row => ["READY","RUNNING","REVIEW"].includes(row.status));
  const specialist = p.rows.filter(row => ["CODEX_REQUIRED","SYSTEM_REQUIRED"].includes(row.status));
  const human = p.rows.filter(row => row.status === "BLOCKED" || row.status === "HUMAN_REQUIRED");
  const lines = [
    "<!-- almago-master-dashboard -->",
    "# AlmaGo Master Plan Status",
    "",
    "**Progression : " + p.done + "/" + p.total + " — " + p.percent + "%**",
    "",
    "## Tâche active",
    active.length ? active.map(row => "- " + row.task.id + " — " + row.task.title + " — **" + row.status + "**").join("\n") : "- Aucune",
    "",
    "## Prochaine tâche sélectionnée",
    selected ? "- " + selected.id + " — " + selected.title + " — route **" + routeTask(selected).toUpperCase() + "**" : "- Aucune nouvelle tâche à ouvrir",
    "",
    "## File spécialiste",
    specialist.length ? specialist.map(row => "- " + row.task.id + " — " + row.task.title + " — **" + row.status + "**").join("\n") : "- Aucune",
    "",
    "## Intervention humaine / blocages",
    human.length ? human.map(row => "- " + row.task.id + " — " + row.task.title + " — **" + row.status + "**").join("\n") : "- Aucun",
    "",
    "_Mis à jour automatiquement par AlmaGo Master Orchestrator._",
  ];
  const allOpen = await gh("/repos/" + owner + "/" + repo + "/issues?state=open&per_page=100");
  const dashboard = allOpen.find(issue => !issue.pull_request && String(issue.body || "").includes("<!-- almago-master-dashboard -->"));
  const payload = { title:"[AlmaGo] Master Plan Status", body:lines.join("\n") };
  if (dashboard) await gh("/repos/" + owner + "/" + repo + "/issues/" + dashboard.number, {method:"PATCH",body:JSON.stringify(payload)});
  else await gh("/repos/" + owner + "/" + repo + "/issues", {method:"POST",body:JSON.stringify({...payload,labels:["almago-plan"]})});
}

const plan = loadPlan();
validatePlan(plan);
await ensureLabels();
let issues = await listPlanIssues();
await markStaleAiBlocked(issues);
issues = await listPlanIssues();

const next = nextEligibleTask(plan, issues);
let created = null;
let route = null;
if (next) {
  route = routeTask(next);
  created = await gh("/repos/" + owner + "/" + repo + "/issues", {
    method:"POST",
    body:JSON.stringify({title:"[" + next.id + "] " + next.title,body:taskIssueBody(next),labels:labelsForRoute(route)}),
  });
  issues = await listPlanIssues();
}

const ready = dispatchableReadyIssue(plan, issues);
const standaloneReady = !created && !ready
  ? standaloneAiReadyIssue(await listStandaloneReadyAiIssues())
  : null;
const dispatchIssue = created || ready?.issue || standaloneReady || null;
const dispatchTask = created ? next : ready?.task || null;
const dispatchRoute = dispatchTask ? routeTask(dispatchTask) : (standaloneReady ? "ai" : null);

await upsertDashboard(plan, issues, next);

if (process.env.GITHUB_OUTPUT) {
  const fs = await import("node:fs");
  fs.appendFileSync(process.env.GITHUB_OUTPUT,
    "issue_number=" + (dispatchIssue?.number || "") +
    "\nroute=" + (dispatchRoute || "") +
    "\ntask_id=" + (dispatchTask?.id || "") + "\n");
}
if (created) console.log("Created #" + created.number + " for " + next.id + " via " + route + ".");
else if (ready) console.log("Existing ready issue #" + ready.issue.number + " is dispatchable for " + ready.task.id + ".");
else if (standaloneReady) console.log("Standalone AI-ready issue #" + standaloneReady.number + " is dispatchable.");
else console.log("No new or dispatchable task.");
