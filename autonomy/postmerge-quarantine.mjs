import {
  QUARANTINE_LABEL,
  QUARANTINE_MARKER,
  launchComplete,
  quarantineFinding,
  quarantineIssueBody,
} from "./postmerge-quarantine-core.mjs";

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

async function ensureLabel() {
  try {
    await gh("/repos/" + owner + "/" + repo + "/labels", {
      method: "POST",
      body: JSON.stringify({
        name: QUARANTINE_LABEL,
        color: "B60205",
        description: "Blocks AlmaGo autonomous safe merge after unhealthy main verification",
      }),
    });
  } catch (error) {
    if (error.status !== 422) throw error;
  }
}

async function allIssuesByLabel(label) {
  const items = await gh("/repos/" + owner + "/" + repo + "/issues?state=all&labels=" + encodeURIComponent(label) + "&per_page=100");
  return items.filter((issue) => !issue.pull_request);
}

async function planIssues() {
  const items = await gh("/repos/" + owner + "/" + repo + "/issues?state=all&labels=almago-plan&per_page=100");
  return items.filter((issue) => !issue.pull_request);
}

async function activeQuarantine() {
  const issues = await allIssuesByLabel(QUARANTINE_LABEL);
  return issues.find((issue) => issue.state === "open" && String(issue.body || "").includes(QUARANTINE_MARKER)) || null;
}

async function publish() {
  if (!launchComplete(await planIssues())) {
    console.log("Post-merge quarantine sentinel inactive until A45 completes.");
    return;
  }

  await ensureLabel();
  const finding = quarantineFinding({
    testOutcome: process.env.ALMAGO_TEST_OUTCOME || "success",
    typecheckOutcome: process.env.ALMAGO_TYPECHECK_OUTCOME || "success",
    lintOutcome: process.env.ALMAGO_LINT_OUTCOME || "success",
    headSha: process.env.ALMAGO_MAIN_HEAD || process.env.GITHUB_SHA || "",
  });
  const existing = await activeQuarantine();

  if (finding.unhealthy) {
    const body = quarantineIssueBody(finding);
    if (!existing) {
      const created = await gh("/repos/" + owner + "/" + repo + "/issues", {
        method: "POST",
        body: JSON.stringify({
          title: "[AUTONOMY QUARANTINE] main verification is unhealthy",
          body,
          labels: [QUARANTINE_LABEL, "almago-human-required"],
        }),
      });
      console.log("Opened autonomy quarantine issue #" + created.number + ".");
      return;
    }
    await gh("/repos/" + owner + "/" + repo + "/issues/" + existing.number, {
      method: "PATCH",
      body: JSON.stringify({ body, labels: [QUARANTINE_LABEL, "almago-human-required"] }),
    });
    console.log("Updated autonomy quarantine issue #" + existing.number + ".");
    return;
  }

  if (existing) {
    await gh("/repos/" + owner + "/" + repo + "/issues/" + existing.number + "/comments", {
      method: "POST",
      body: JSON.stringify({
        body: [
          "AUTONOMY QUARANTINE: CLEARED",
          "",
          "Fresh post-merge verification is green on main HEAD `" + finding.headSha + "`.",
          "The quarantine may now close; other independent merge gates still apply.",
        ].join("\n"),
      }),
    });
    await gh("/repos/" + owner + "/" + repo + "/issues/" + existing.number, {
      method: "PATCH",
      body: JSON.stringify({ state: "closed", state_reason: "completed" }),
    });
    console.log("Closed autonomy quarantine issue #" + existing.number + ".");
    return;
  }

  console.log("Post-merge verification is healthy; no quarantine is open.");
}

await publish();
