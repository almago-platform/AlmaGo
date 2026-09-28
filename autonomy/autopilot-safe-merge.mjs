import {
  latestAutopilotLock,
  mergeCandidateDecision,
  rulesetAllowsAutonomousMerge,
} from "./autopilot-safe-merge-core.mjs";
import { sourceSignalStillValid } from "./dynamic-contracts-core.mjs";
import {
  CONTRACT_LABEL,
  CONTRACT_READY_LABEL,
  contractKeyFromIssue,
} from "./improvement-contracts-core.mjs";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const enabled = process.env.ALMAGO_AUTOPILOT_AUTOMERGE_ENABLED === "true";
const dryRun = process.env.ALMAGO_AUTOPILOT_AUTOMERGE_DRY_RUN !== "false";

if (!token || !repository || !repository.includes("/")) {
  throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY are required.");
}
if (!enabled) {
  console.log("AlmaGo Autopilot Safe Merge: DISABLED.");
  process.exit(0);
}

const [owner, repo] = repository.split("/");
const headers = {
  Authorization: "Bearer " + token,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2026-03-10",
  "Content-Type": "application/json",
};

async function gh(path, options = {}) {
  const response = await fetch("https://api.github.com" + path, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!response.ok) {
    const detail = await response.text();
    const error = new Error("GitHub " + response.status + ": " + detail.slice(0, 1600));
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

async function paginate(path, pick = (value) => value) {
  const values = [];
  for (let page = 1; page <= 10; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const batch = await gh(path + separator + "per_page=100&page=" + page);
    const selected = pick(batch);
    if (!Array.isArray(selected)) throw new Error("Expected paginated array from " + path);
    values.push(...selected);
    if (selected.length < 100) return values;
  }
  throw new Error("Pagination exceeded bounded 1000-item safety limit for " + path);
}

async function issueComments(issueNumber) {
  return paginate("/repos/" + owner + "/" + repo + "/issues/" + issueNumber + "/comments");
}

async function pullFiles(pullNumber) {
  const files = await paginate("/repos/" + owner + "/" + repo + "/pulls/" + pullNumber + "/files");
  return files.map((file) => String(file.filename || "")).filter(Boolean);
}

async function workflowRuns(headSha) {
  const data = await gh(
    "/repos/" + owner + "/" + repo + "/actions/runs?head_sha=" + encodeURIComponent(headSha) + "&per_page=100"
  );
  return Array.isArray(data?.workflow_runs) ? data.workflow_runs : [];
}

async function detailedRulesets() {
  const summaries = await gh("/repos/" + owner + "/" + repo + "/rulesets");
  if (!Array.isArray(summaries)) throw new Error("Ruleset list was not an array.");
  const active = summaries.filter((ruleset) => ruleset?.enforcement === "active");
  const detailed = [];
  for (const ruleset of active) {
    detailed.push(await gh("/repos/" + owner + "/" + repo + "/rulesets/" + ruleset.id));
  }
  return detailed;
}

async function openPrScopes() {
  const pulls = await paginate("/repos/" + owner + "/" + repo + "/pulls?state=open");
  const scopes = [];
  for (const pr of pulls) {
    scopes.push({
      pr_number: pr.number,
      files: await pullFiles(pr.number),
    });
  }
  return scopes;
}

function blockFromLock(lock) {
  return {
    block_id: lock.block_id,
    base_ref: lock.base_ref,
    writable_paths: Array.isArray(lock.writable_paths) ? lock.writable_paths : [],
    forbidden_paths: Array.isArray(lock.forbidden_paths) ? lock.forbidden_paths : [],
    merge_class: lock.merge_class,
  };
}

function labels(issue) {
  return new Set((issue?.labels || []).map((label) => typeof label === "string" ? label : label.name));
}

async function dynamicProvenanceStillValid(lock) {
  if (!lock.source_signal_key && !lock.source_issue_number && !lock.dynamic_contract_issue_number) {
    return true;
  }
  if (!lock.source_signal_key || !lock.source_issue_number || !lock.dynamic_contract_issue_number) {
    return false;
  }

  const [sourceIssue, contractIssue] = await Promise.all([
    gh("/repos/" + owner + "/" + repo + "/issues/" + lock.source_issue_number),
    gh("/repos/" + owner + "/" + repo + "/issues/" + lock.dynamic_contract_issue_number),
  ]);
  if (!sourceSignalStillValid(sourceIssue, lock.source_signal_key)) return false;
  if (contractIssue.state !== "open") return false;

  const contractLabels = labels(contractIssue);
  if (!contractLabels.has(CONTRACT_LABEL) || !contractLabels.has(CONTRACT_READY_LABEL)) return false;
  if (contractLabels.has("almago-human-required")) return false;
  return contractKeyFromIssue(contractIssue) === lock.source_signal_key;
}

async function evaluate(issue, lock, rulesets, prScopes) {
  if (!lock?.pull_number) return { eligible: false, reason: "missing_pull_number" };
  const pr = await gh("/repos/" + owner + "/" + repo + "/pulls/" + lock.pull_number);
  const main = await gh("/repos/" + owner + "/" + repo + "/branches/main");
  const changedFiles = await pullFiles(pr.number);
  const runs = await workflowRuns(pr.head?.sha || "");
  const supervisorComments = await issueComments(pr.number);

  if (!await dynamicProvenanceStillValid(lock)) {
    return { eligible: false, reason: "dynamic_provenance_stale", pr, changedFiles };
  }

  const decision = mergeCandidateDecision({
    lock,
    block: blockFromLock(lock),
    pr,
    mainHead: main.commit?.sha || "",
    changedFiles,
    workflowRuns: runs,
    supervisorComments,
    rulesets,
    openPrScopes: prScopes,
  });
  return { ...decision, pr, changedFiles };
}

async function blockIssues() {
  const issues = await paginate("/repos/" + owner + "/" + repo + "/issues?state=open&labels=almago-plan");
  return issues.filter((issue) =>
    !issue.pull_request && String(issue.body || "").includes("<!-- almago-autopilot-block:")
  );
}

const rulesets = await detailedRulesets();
if (!rulesetAllowsAutonomousMerge(rulesets)) {
  console.log("AlmaGo Autopilot Safe Merge: BLOCKED. Active main ruleset must require strict status check job 'verify'.");
  process.exit(0);
}

const issues = await blockIssues();
const initialScopes = await openPrScopes();

for (const issue of issues) {
  const lock = latestAutopilotLock(await issueComments(issue.number));
  if (!lock || lock.state !== "MERGE_READY") continue;

  const first = await evaluate(issue, lock, rulesets, initialScopes);
  if (!first.eligible) {
    console.log("Skipping block " + lock.block_id + ": " + first.reason + ".");
    continue;
  }

  console.log(
    (dryRun ? "DRY RUN candidate " : "Candidate ") +
    lock.block_id + " PR #" + first.pr.number + " HEAD " + first.head_sha + "."
  );
  if (dryRun) continue;

  // Re-fetch every mutable safety input immediately before the one permitted merge.
  const freshRulesets = await detailedRulesets();
  const freshScopes = await openPrScopes();
  const freshLock = latestAutopilotLock(await issueComments(issue.number));
  const second = await evaluate(issue, freshLock, freshRulesets, freshScopes);
  if (!second.eligible || second.head_sha !== first.head_sha) {
    console.log("Final revalidation blocked " + lock.block_id + ": " + second.reason + ".");
    continue;
  }

  const merged = await gh(
    "/repos/" + owner + "/" + repo + "/pulls/" + second.pr.number + "/merge",
    {
      method: "PUT",
      body: JSON.stringify({
        sha: second.head_sha,
        merge_method: "squash",
        commit_title: second.pr.title,
        commit_message: "Merged by AlmaGo Autopilot Safe Merge after exact-HEAD revalidation.",
      }),
    }
  );

  if (!merged?.merged) {
    throw new Error("GitHub refused safe merge for PR #" + second.pr.number + ": " + String(merged?.message || "unknown"));
  }

  await gh("/repos/" + owner + "/" + repo + "/issues/" + issue.number + "/comments", {
    method: "POST",
    body: JSON.stringify({
      body: [
        "AUTOPILOT SAFE MERGE: MERGED",
        "",
        "PR: #" + second.pr.number,
        "Validated HEAD: `" + second.head_sha + "`",
        "Merge SHA: `" + merged.sha + "`",
        "",
        "The controller will record DONE on its next reconciliation cycle.",
      ].join("\n"),
    }),
  });

  console.log("Merged one safe candidate PR #" + second.pr.number + ". Stopping this run.");
  process.exit(0);
}

console.log("AlmaGo Autopilot Safe Merge: no eligible candidate.");
