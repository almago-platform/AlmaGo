import { readFileSync } from "node:fs";
import { getAgentTask, startAgentTask } from "./copilot-agent-client.mjs";
import { leaseExpired, mapAgentTaskState, selectEligibleBlocks, validateAutopilotPlan } from "./copilot-autopilot-core.mjs";

const enabled = process.env.ALMAGO_COPILOT_AUTOPILOT_ENABLED === "true";
const dryRun = process.env.ALMAGO_COPILOT_AUTOPILOT_DRY_RUN === "true";

if (!enabled) {
  console.log("AlmaGo Copilot Autopilot: DISABLED.");
  process.exit(0);
}

const repository = process.env.GITHUB_REPOSITORY;
const githubToken = process.env.GITHUB_TOKEN;
const copilotToken = process.env.ALMAGO_COPILOT_AUTOPILOT_TOKEN;

if (!repository || !repository.includes("/") || !githubToken) {
  throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN are required.");
}
if (!copilotToken) {
  throw new Error("ALMAGO_COPILOT_AUTOPILOT_TOKEN is required when Autopilot is enabled.");
}

const [owner, repo] = repository.split("/");
const plan = JSON.parse(readFileSync("autonomy/copilot-autopilot-plan.json", "utf8"));
validateAutopilotPlan(plan);

const headers = {
  Authorization: "Bearer " + githubToken,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
};

async function gh(path, options = {}) {
  const response = await fetch("https://api.github.com" + path, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!response.ok) {
    throw new Error("GitHub " + response.status + ": " + (await response.text()).slice(0, 1200));
  }
  return response.status === 204 ? null : response.json();
}

const blockMarker = (id) => "<!-- almago-autopilot-block:" + id + " -->";
const lockMarker = "<!-- almago-autopilot-lock -->";

async function listBlockIssues() {
  const issues = await gh("/repos/" + owner + "/" + repo + "/issues?state=all&per_page=100");
  return issues.filter((issue) => !issue.pull_request && String(issue.body || "").includes("almago-autopilot-block:"));
}

function blockIdFromIssue(issue) {
  return String(issue.body || "").match(/<!-- almago-autopilot-block:([A-Z0-9-]+) -->/)?.[1] || null;
}

async function listComments(issueNumber) {
  return gh("/repos/" + owner + "/" + repo + "/issues/" + issueNumber + "/comments?per_page=100");
}

function latestLock(comments) {
  for (const comment of [...comments].reverse()) {
    if (!String(comment.body || "").includes(lockMarker)) continue;
    const raw = String(comment.body).match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/)?.[1];
    if (!raw) continue;
    try { return JSON.parse(raw); } catch {}
  }
  return null;
}

async function appendLock(issueNumber, lock) {
  const body = [lockMarker, "\`\`\`json", JSON.stringify(lock, null, 2), "\`\`\`"].join("\n");
  await gh("/repos/" + owner + "/" + repo + "/issues/" + issueNumber + "/comments", {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

function issueBody(block) {
  return [
    blockMarker(block.block_id),
    "# AlmaGo Copilot Autopilot block",
    "",
    "Block: " + block.block_id,
    "Lot: " + block.lot,
    "Model: " + block.model,
    "Base: " + block.base_ref,
    "Merge class: " + block.merge_class,
    "",
    "Writable paths:",
    ...block.writable_paths.map((path) => "- \`" + path + "\`"),
    "",
    "Forbidden paths:",
    ...block.forbidden_paths.map((path) => "- \`" + path + "\`"),
    "",
    "The machine-readable plan is authoritative. Issue text does not broaden the contract.",
  ].join("\n");
}

let issues = await listBlockIssues();
const byBlock = new Map(issues.map((issue) => [blockIdFromIssue(issue), issue]).filter(([id]) => id));
const stateByBlock = new Map();
const locks = [];

for (const [id, issue] of byBlock) {
  if (issue.state === "closed") {
    stateByBlock.set(id, "DONE");
    continue;
  }

  const lock = latestLock(await listComments(issue.number));
  if (!lock) {
    stateByBlock.set(id, "READY");
    continue;
  }

  if (leaseExpired(lock) && !["DONE", "HUMAN_GATE"].includes(lock.state)) {
    stateByBlock.set(id, "BLOCKED");
    continue;
  }

  stateByBlock.set(id, lock.state);
  locks.push(lock);

  if (lock.agent_task_id && ["QUEUED", "IN_PROGRESS", "WAITING_FOR_USER"].includes(lock.state)) {
    const task = await getAgentTask({
      owner,
      repo,
      token: copilotToken,
      taskId: lock.agent_task_id,
    });
    const nextState = mapAgentTaskState(task.state);
    const session = Array.isArray(task.sessions) ? task.sessions.at(-1) : null;
    const pullArtifact = Array.isArray(task.artifacts)
      ? task.artifacts.find((artifact) => artifact?.provider === "github" && artifact?.type === "pull")
      : null;
    const next = {
      ...lock,
      state: nextState,
      head_ref: session?.head_ref || lock.head_ref || null,
      pull_number: pullArtifact?.data?.id || lock.pull_number || null,
      lease_expires_at: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    };
    if (JSON.stringify(next) !== JSON.stringify(lock)) {
      await appendLock(issue.number, next);
    }
  }
}

const eligible = selectEligibleBlocks(plan, stateByBlock, locks);

if (dryRun) {
  console.log("AlmaGo Copilot Autopilot DRY RUN.");
  console.log(JSON.stringify({
    eligible: eligible.map((block) => block.block_id),
    activeLocks: locks.map((lock) => ({ block_id: lock.block_id, state: lock.state })),
  }, null, 2));
  process.exit(0);
}

for (const block of eligible) {
  let issue = byBlock.get(block.block_id);
  if (!issue) {
    issue = await gh("/repos/" + owner + "/" + repo + "/issues", {
      method: "POST",
      body: JSON.stringify({
        title: "[AUTOPILOT] " + block.block_id + " — " + block.title,
        body: issueBody(block),
        labels: ["almago-plan"],
      }),
    });
    byBlock.set(block.block_id, issue);
  }

  const dispatchLock = {
    block_id: block.block_id,
    issue_number: issue.number,
    agent_task_id: null,
    agent: block.agent,
    model: block.model,
    custom_agent: block.custom_agent,
    base_ref: block.base_ref,
    head_ref: null,
    pull_number: null,
    expected_head: null,
    writable_paths: block.writable_paths,
    forbidden_paths: block.forbidden_paths,
    state: "DISPATCHING",
    lease_expires_at: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    revision_attempts: 0,
  };

  await appendLock(issue.number, dispatchLock);

  const task = await startAgentTask({
    owner,
    repo,
    token: copilotToken,
    prompt: block.prompt,
    baseRef: block.base_ref,
    model: block.model,
    customAgent: block.custom_agent,
    createPullRequest: true,
  });

  await appendLock(issue.number, {
    ...dispatchLock,
    agent_task_id: task.id,
    state: mapAgentTaskState(task.state),
  });

  console.log("Dispatched " + block.block_id + " as Agent Task " + task.id + ".");
}
