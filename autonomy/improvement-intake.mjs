import { execFileSync } from "node:child_process";
import { blockFromReadyContract, latestReadyContract } from "./improvement-intake-core.mjs";

function currentFiles() {
  return new Set(execFileSync("git", ["ls-files"], { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean));
}

async function launchComplete({ owner, repo, gh }) {
  const issues = await gh("/repos/" + owner + "/" + repo + "/issues?state=all&labels=almago-plan&per_page=100");
  const a45 = issues.find((issue) => !issue.pull_request && String(issue.body || "").includes("<!-- almago-plan-task:A45 -->"));
  if (!a45) return false;
  const labels = new Set((a45.labels || []).map((label) => typeof label === "string" ? label : label.name));
  return a45.state === "closed" || labels.has("almago-plan-done");
}

export async function loadContinuousImprovementBlocks({
  owner,
  repo,
  gh,
  listComments,
  existingFiles = null,
  logger = console,
}) {
  if (!owner || !repo || typeof gh !== "function" || typeof listComments !== "function") {
    throw new Error("Continuous improvement intake requires repository and GitHub readers.");
  }
  if (!(await launchComplete({ owner, repo, gh }))) return [];

  const issues = await gh(
    "/repos/" + owner + "/" + repo + "/issues?state=open&labels=almago-contract-ready&per_page=100"
  );
  const files = existingFiles || currentFiles();
  const blocks = [];

  for (const issue of issues) {
    if (issue.pull_request) continue;
    try {
      const comments = await listComments(issue.number);
      const ready = latestReadyContract(issue, comments, { existingFiles: files });
      if (!ready) continue;
      blocks.push(blockFromReadyContract(issue, ready));
    } catch (error) {
      logger.warn("Skipping invalid continuous improvement contract for issue #" + issue.number + ": " + error.message);
    }
  }

  return blocks;
}
