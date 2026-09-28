import { appendFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildSignals,
  issueBodyForSignal,
  labelsForSignal,
  signalKeyFromIssue,
  signalMarker,
} from "./continuous-improvement-core.mjs";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;

if (!token || !repository || !repository.includes("/")) {
  throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY are required.");
}

const [owner, repo] = repository.split("/");
const headers = {
  Authorization: "Bearer " + token,
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
    const detail = await response.text();
    const error = new Error("GitHub " + response.status + ": " + detail.slice(0, 1200));
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

async function planIssues() {
  const issues = await gh("/repos/" + owner + "/" + repo + "/issues?state=all&labels=almago-plan&per_page=100");
  return issues.filter((issue) => !issue.pull_request);
}

function isLaunchComplete(issues) {
  const a45 = issues.find((issue) => String(issue.body || "").includes("<!-- almago-plan-task:A45 -->"));
  if (!a45) return false;
  const labels = new Set((a45.labels || []).map((label) => typeof label === "string" ? label : label.name));
  return a45.state === "closed" || labels.has("almago-plan-done");
}

function writeOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  appendFileSync(process.env.GITHUB_OUTPUT, name + "=" + value + "\n");
}

async function ensureLabel(name, color, description) {
  try {
    await gh("/repos/" + owner + "/" + repo + "/labels", {
      method: "POST",
      body: JSON.stringify({ name, color, description }),
    });
  } catch (error) {
    if (error.status !== 422) throw error;
  }
}

async function listSignalIssues() {
  const issues = await gh(
    "/repos/" + owner + "/" + repo + "/issues?state=all&labels=almago-improvement-candidate&per_page=100"
  );
  return issues.filter((issue) => !issue.pull_request && signalKeyFromIssue(issue));
}

async function upsertSignal(issue, signal) {
  const body = issueBodyForSignal(signal);
  const labels = labelsForSignal(signal);
  if (!issue) {
    await gh("/repos/" + owner + "/" + repo + "/issues", {
      method: "POST",
      body: JSON.stringify({ title: signal.title, body, labels }),
    });
    return "created";
  }

  await gh("/repos/" + owner + "/" + repo + "/issues/" + issue.number, {
    method: "PATCH",
    body: JSON.stringify({
      title: signal.title,
      body,
      state: "open",
      labels,
    }),
  });
  return issue.state === "open" ? "updated" : "reopened";
}

async function closeResolved(issue) {
  await gh("/repos/" + owner + "/" + repo + "/issues/" + issue.number + "/comments", {
    method: "POST",
    body: JSON.stringify({
      body: [
        "CONTINUOUS IMPROVEMENT SENSOR: RESOLVED",
        "",
        "The latest scheduled post-launch sensor no longer reports this signal.",
        "Closing the discovery issue automatically. A future recurrence will reopen the same signal key.",
      ].join("\n"),
    }),
  });
  await gh("/repos/" + owner + "/" + repo + "/issues/" + issue.number, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed", state_reason: "completed" }),
  });
}

function readAudit() {
  const path = resolve(process.env.ALMAGO_AUDIT_JSON || "artifacts/continuous-improvement/npm-audit.json");
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

async function activation() {
  const active = isLaunchComplete(await planIssues());
  writeOutput("active", active ? "true" : "false");
  console.log(active
    ? "AlmaGo continuous improvement: ACTIVE (A45 complete)."
    : "AlmaGo continuous improvement: INACTIVE until A45 is complete.");
}

async function publish() {
  const active = isLaunchComplete(await planIssues());
  if (!active) {
    console.log("A45 is not complete; no continuous-improvement issues will be mutated.");
    return;
  }

  await ensureLabel("almago-improvement-candidate", "5319E7", "Deterministic post-launch continuous-improvement signal");
  await ensureLabel("almago-codex-required", "EA5C0B", "Complex or sensitive task reserved for Codex/deep review");
  await ensureLabel("almago-human-required", "B60205", "Requires explicit human decision or protected operation");

  const signals = buildSignals({
    testOutcome: process.env.ALMAGO_TEST_OUTCOME || "success",
    typecheckOutcome: process.env.ALMAGO_TYPECHECK_OUTCOME || "success",
    lintOutcome: process.env.ALMAGO_LINT_OUTCOME || "success",
    audit: readAudit(),
  });

  const existing = await listSignalIssues();
  const byKey = new Map(existing.map((issue) => [signalKeyFromIssue(issue), issue]));
  const activeKeys = new Set(signals.map((signal) => signal.key));

  for (const signal of signals) {
    const action = await upsertSignal(byKey.get(signal.key), signal);
    console.log(action + " signal " + signal.key + " " + signalMarker(signal.key));
  }

  for (const issue of existing) {
    const key = signalKeyFromIssue(issue);
    if (!key || activeKeys.has(key) || issue.state !== "open") continue;
    await closeResolved(issue);
    console.log("closed resolved signal " + key);
  }

  console.log("Published " + signals.length + " active continuous-improvement signal(s).");
}

const command = process.argv[2] || "publish";
if (command === "activation") await activation();
else if (command === "publish") await publish();
else throw new Error("Unknown continuous-improvement command: " + command);
