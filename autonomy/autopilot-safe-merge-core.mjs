import {
  browserQualityRequirement,
  isCriticalPath,
  pathsOverlap,
  scopeAssessment,
  supervisorDecisionForHead,
  workflowResult,
} from "./copilot-autopilot-core.mjs";

export const REQUIRED_RULESET_JOB = "verify";

export function latestAutopilotLock(comments = []) {
  for (const comment of [...comments].reverse()) {
    const body = String(comment?.body || "");
    if (!body.includes("<!-- almago-autopilot-lock -->")) continue;
    const raw = body.match(/```json\s*([\s\S]*?)\s*```/)?.[1];
    if (!raw) continue;
    try {
      const lock = JSON.parse(raw);
      if (lock && typeof lock === "object") return lock;
    } catch {}
  }
  return null;
}

export function rulesetAllowsAutonomousMerge(rulesets = [], requiredJob = REQUIRED_RULESET_JOB) {
  return rulesets.some((ruleset) => {
    if (ruleset?.enforcement !== "active") return false;
    const includes = ruleset?.conditions?.ref_name?.include || [];
    if (!includes.includes("~DEFAULT_BRANCH")) return false;
    const rules = Array.isArray(ruleset?.rules) ? ruleset.rules : [];
    if (!rules.some((rule) => rule?.type === "pull_request")) return false;
    const statusRule = rules.find((rule) => rule?.type === "required_status_checks");
    const contexts = statusRule?.parameters?.required_status_checks || [];
    const strict = statusRule?.parameters?.strict_required_status_checks_policy === true;
    return strict && contexts.some((check) => check?.context === requiredJob);
  });
}

export function openPrCollision(candidateNumber, candidateFiles = [], openPrScopes = []) {
  for (const scope of openPrScopes) {
    if (Number(scope?.pr_number) === Number(candidateNumber)) continue;
    const files = Array.isArray(scope?.files) ? scope.files : [];
    if (candidateFiles.some((candidate) => files.some((file) => pathsOverlap(candidate, file)))) {
      return { pr_number: Number(scope.pr_number || 0), files };
    }
  }
  return null;
}

export function mergeCandidateDecision({
  lock,
  block,
  pr,
  mainHead,
  changedFiles = [],
  workflowRuns = [],
  supervisorComments = [],
  rulesets = [],
  openPrScopes = [],
}) {
  if (!lock || lock.state !== "MERGE_READY") {
    return { eligible: false, reason: "lock_not_merge_ready" };
  }
  if (lock.merge_class !== "AUTONOMOUS_SAFE" || block?.merge_class !== "AUTONOMOUS_SAFE") {
    return { eligible: false, reason: "merge_class_not_autonomous_safe" };
  }
  if (!pr || pr.state !== "open" || pr.draft === true || pr.merged === true) {
    return { eligible: false, reason: "pull_request_not_open_ready" };
  }
  if (pr.head?.repo?.full_name !== pr.base?.repo?.full_name) {
    return { eligible: false, reason: "cross_repository_pull_request" };
  }
  if (pr.base?.ref !== "main" || block?.base_ref !== "main") {
    return { eligible: false, reason: "base_not_main" };
  }
  if (!mainHead || pr.base?.sha !== mainHead) {
    return { eligible: false, reason: "main_advanced_since_candidate" };
  }
  if (!lock.expected_head || pr.head?.sha !== lock.expected_head) {
    return { eligible: false, reason: "head_mismatch" };
  }
  if (pr.mergeable !== true) {
    return { eligible: false, reason: "pull_request_not_mergeable" };
  }
  if (!rulesetAllowsAutonomousMerge(rulesets)) {
    return { eligible: false, reason: "main_ruleset_missing_strict_ci_requirement" };
  }

  const { scopeExact, forbiddenTouched } = scopeAssessment(block, changedFiles);
  if (!scopeExact || forbiddenTouched || changedFiles.some(isCriticalPath)) {
    return { eligible: false, reason: "scope_or_critical_path_violation" };
  }

  const ci = workflowResult(workflowRuns, "AlmaGo PR CI");
  if (ci !== "SUCCESS") return { eligible: false, reason: "canonical_ci_not_green" };

  const browserRequired = browserQualityRequirement(changedFiles) === "REQUIRED";
  const browser = browserRequired
    ? workflowResult(workflowRuns, "AlmaGo Browser Quality")
    : "NOT_APPLICABLE";
  if (!["SUCCESS", "NOT_APPLICABLE"].includes(browser)) {
    return { eligible: false, reason: "browser_quality_not_green" };
  }

  const supervisor = supervisorDecisionForHead(supervisorComments, pr.head.sha)?.decision || null;
  if (supervisor !== "APPROVED") {
    return { eligible: false, reason: "supervisor_not_approved_for_head" };
  }

  const collision = openPrCollision(pr.number, changedFiles, openPrScopes);
  if (collision) {
    return {
      eligible: false,
      reason: "open_pr_collision",
      collision_pr_number: collision.pr_number,
    };
  }

  return {
    eligible: true,
    reason: "safe_autonomous_merge_candidate",
    head_sha: pr.head.sha,
    ci,
    browser,
    supervisor,
  };
}
