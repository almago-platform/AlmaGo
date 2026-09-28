import {
  compileSignalContract,
  CONTRACT_LABEL,
  CONTRACT_NEEDS_PLANNING_LABEL,
  CONTRACT_READY_LABEL,
  contractIssueBody,
  contractKeyFromIssue,
} from "./improvement-contracts-core.mjs";
import { signalKeyFromIssue } from "./continuous-improvement-core.mjs";

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

function labelNames(issue) {
  return new Set((issue?.labels || []).map((label) => typeof label === "string" ? label : label.name));
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

async function planIssues() {
  const issues = await gh("/repos/" + owner + "/" + repo + "/issues?state=all&labels=almago-plan&per_page=100");
  return issues.filter((issue) => !issue.pull_request);
}

function launchComplete(issues) {
  const a45 = issues.find((issue) => String(issue.body || "").includes("<!-- almago-plan-task:A45 -->"));
  if (!a45) return false;
  const labels = labelNames(a45);
  return a45.state === "closed" || labels.has("almago-plan-done");
}

async function signalIssues() {
  const issues = await gh(
    "/repos/" + owner + "/" + repo + "/issues?state=all&labels=almago-improvement-candidate&per_page=100"
  );
  return issues.filter((issue) => !issue.pull_request && signalKeyFromIssue(issue));
}

async function contractIssues() {
  const issues = await gh(
    "/repos/" + owner + "/" + repo + "/issues?state=all&labels=" + encodeURIComponent(CONTRACT_LABEL) + "&per_page=100"
  );
  return issues.filter((issue) => !issue.pull_request && contractKeyFromIssue(issue));
}

async function addLabel(issueNumber, label) {
  await gh("/repos/" + owner + "/" + repo + "/issues/" + issueNumber + "/labels", {
    method: "POST",
    body: JSON.stringify({ labels: [label] }),
  });
}

async function removeLabel(issueNumber, label) {
  try {
    await gh(
      "/repos/" + owner + "/" + repo + "/issues/" + issueNumber + "/labels/" + encodeURIComponent(label),
      { method: "DELETE" }
    );
  } catch (error) {
    if (error.status !== 404) throw error;
  }
}

async function upsertContract(existing, compiled) {
  const body = contractIssueBody(compiled);
  const labels = [CONTRACT_LABEL, CONTRACT_READY_LABEL, "almago-codex-required"];
  const title = "[AUTOPILOT CONTRACT] " + compiled.signal.title.replace(/^\[CONTINUOUS\]\s*/, "");

  if (!existing) {
    return gh("/repos/" + owner + "/" + repo + "/issues", {
      method: "POST",
      body: JSON.stringify({ title, body, labels }),
    });
  }

  const update = {
    title,
    body,
    labels,
    state: "open",
  };
  await gh("/repos/" + owner + "/" + repo + "/issues/" + existing.number, {
    method: "PATCH",
    body: JSON.stringify(update),
  });
  return existing;
}

async function closeContract(issue, reason) {
  if (issue.state !== "open") return;
  await gh("/repos/" + owner + "/" + repo + "/issues/" + issue.number + "/comments", {
    method: "POST",
    body: JSON.stringify({
      body: [
        "AUTOPILOT CONTRACT: INVALIDATED",
        "",
        reason,
        "The contract is closed and must not be dispatched.",
      ].join("\n"),
    }),
  });
  await gh("/repos/" + owner + "/" + repo + "/issues/" + issue.number, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed", state_reason: "completed" }),
  });
}

async function publish() {
  if (!launchComplete(await planIssues())) {
    console.log("A45 is not complete; no improvement contracts will be created or changed.");
    return;
  }

  await ensureLabel(CONTRACT_LABEL, "1D76DB", "Machine-readable continuous-improvement contract");
  await ensureLabel(CONTRACT_READY_LABEL, "0E8A16", "Bounded contract ready for future Autopilot dispatch");
  await ensureLabel(CONTRACT_NEEDS_PLANNING_LABEL, "FBCA04", "Signal needs deeper planning before an implementation contract");

  const [signals, contracts] = await Promise.all([signalIssues(), contractIssues()]);
  const contractsByKey = new Map(contracts.map((issue) => [contractKeyFromIssue(issue), issue]));
  const activeEligible = new Set();

  for (const signalIssue of signals) {
    const key = signalKeyFromIssue(signalIssue);
    if (!key || signalIssue.state !== "open") continue;

    const labels = labelNames(signalIssue);
    if (labels.has("almago-human-required")) {
      await addLabel(signalIssue.number, CONTRACT_NEEDS_PLANNING_LABEL);
      continue;
    }

    const compiled = compileSignalContract(signalIssue);
    if (!compiled.eligible) {
      await addLabel(signalIssue.number, CONTRACT_NEEDS_PLANNING_LABEL);
      console.log("planning required for signal " + key + ": " + compiled.reason);
      continue;
    }

    activeEligible.add(key);
    await removeLabel(signalIssue.number, CONTRACT_NEEDS_PLANNING_LABEL);
    const contract = await upsertContract(contractsByKey.get(key), compiled);
    console.log("contract ready for signal " + key + " as issue #" + contract.number);
  }

  const signalsByKey = new Map(signals.map((issue) => [signalKeyFromIssue(issue), issue]));
  for (const contract of contracts) {
    const key = contractKeyFromIssue(contract);
    if (!key || activeEligible.has(key)) continue;
    const source = signalsByKey.get(key);
    const reason = !source || source.state !== "open"
      ? "The source discovery signal is no longer open."
      : "The source signal no longer compiles to an exact safe non-critical contract.";
    await closeContract(contract, reason);
  }
}

const command = process.argv[2] || "publish";
if (command !== "publish") throw new Error("Unknown improvement-contracts command: " + command);
await publish();
