export const QUARANTINE_MARKER = "<!-- almago-autonomy-quarantine -->";
export const QUARANTINE_LABEL = "almago-autonomy-quarantine";

export function launchComplete(planIssues = []) {
  const a45 = planIssues.find((issue) =>
    !issue?.pull_request && String(issue?.body || "").includes("<!-- almago-plan-task:A45 -->")
  );
  if (!a45) return false;
  const labels = new Set((a45.labels || []).map((label) => typeof label === "string" ? label : label.name));
  return a45.state === "closed" || labels.has("almago-plan-done");
}

export function quarantineFinding({
  testOutcome = "success",
  typecheckOutcome = "success",
  lintOutcome = "success",
  headSha = "",
} = {}) {
  const failures = [];
  if (testOutcome !== "success") failures.push("npm test=" + testOutcome);
  if (typecheckOutcome !== "success") failures.push("npx tsc --noEmit=" + typecheckOutcome);
  if (lintOutcome !== "success") failures.push("npm run lint=" + lintOutcome);
  return {
    unhealthy: failures.length > 0,
    failures,
    headSha: String(headSha || ""),
  };
}

export function quarantineIssueBody(finding) {
  if (!finding?.unhealthy) throw new Error("Unhealthy finding required.");
  return [
    QUARANTINE_MARKER,
    "# AlmaGo autonomy quarantine",
    "",
    "Main HEAD: `" + finding.headSha + "`",
    "",
    "Post-merge verification detected one or more canonical baseline failures:",
    ...finding.failures.map((failure) => "- " + failure),
    "",
    "## Safety effect",
    "- Autonomous safe merge must remain blocked while this issue is open.",
    "- Continuous discovery may continue collecting evidence.",
    "- Human-gated operations stay human-gated.",
    "- Close this quarantine only after a fresh post-merge sentinel run is fully green.",
  ].join("\n");
}

export function hasOpenQuarantine(issues = []) {
  return issues.some((issue) =>
    issue?.state === "open" &&
    !issue?.pull_request &&
    (
      String(issue?.body || "").includes(QUARANTINE_MARKER) ||
      (issue?.labels || []).some((label) =>
        (typeof label === "string" ? label : label?.name) === QUARANTINE_LABEL
      )
    )
  );
}
