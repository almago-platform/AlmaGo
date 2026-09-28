import { validateAutopilotPlan } from "./copilot-autopilot-core.mjs";
import { validateVisualReview } from "./visual-review.mjs";

export const VISUAL_WRITABLE_PATHS = Object.freeze([
  "src/components/public/Homepage.module.css",
  "src/components/public/HomeHeader.tsx",
  "src/components/public/HomeHero.tsx",
]);

function hasMaterialFinding(review) {
  return review.findings.some((finding) => finding.severity === "moderate" || finding.severity === "high");
}

export function visualQualityDecision(review) {
  try {
    validateVisualReview(review);
  } catch {
    return { eligible: false, reason: "invalid_visual_review" };
  }

  if (review.verdict !== "REVISE") {
    return { eligible: false, reason: "visual_review_pass" };
  }
  if (review.confidence !== "high") {
    return { eligible: false, reason: "visual_review_not_high_confidence" };
  }
  if (!hasMaterialFinding(review)) {
    return { eligible: false, reason: "visual_review_only_low_severity" };
  }

  return { eligible: true, reason: "high_confidence_visual_revision" };
}

export function buildPrelaunchVisualPlan({
  review,
  mainSha = "",
} = {}) {
  const decision = visualQualityDecision(review);
  if (!decision.eligible) return decision;

  const suffix = String(mainSha || "unknown")
    .slice(0, 12)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "") || "UNKNOWN";

  const findings = review.findings
    .filter((finding) => finding.severity !== "low")
    .slice(0, 4)
    .map((finding) => "[" + finding.severity.toUpperCase() + "][" + finding.area + "] " + finding.summary)
    .join(" | ");
  const actions = review.actions.slice(0, 4).map((action, index) => (index + 1) + ". " + action).join(" ");

  const block = {
    block_id: "PRELAUNCH-VISUAL-" + suffix,
    lot: "PRELAUNCH-VISUAL-QUALITY",
    title: "Improve high-confidence homepage visual quality findings",
    enabled: true,
    depends_on: [],
    agent: "codex",
    model: "gpt-5.3-codex",
    custom_agent: null,
    base_ref: "main",
    writable_paths: [...VISUAL_WRITABLE_PATHS],
    forbidden_paths: [
      ".github/**",
      "supabase/**",
      "tests/**",
      "src/app/api/**",
      "src/app/admin/**",
      "src/app/auth/**",
      "src/components/admin/**",
      "src/components/auth/**",
      "src/lib/**",
      "package.json",
      "package-lock.json",
      "next.config.*",
    ],
    risk_class: "moderate",
    merge_class: "AUTONOMOUS_SAFE",
    stop_condition: "Open one bounded visual-quality PR and reach MERGE_READY; never merge automatically.",
    prompt: [
      "PRE-LAUNCH HOMEPAGE VISUAL QUALITY IMPROVEMENT.",
      "A high-confidence screenshot review returned REVISE.",
      "Material findings: " + findings,
      "Prioritized actions: " + actions,
      "Work only inside the exact writable files.",
      "Preserve all product facts, legal wording, content meaning, information architecture, routes and existing functionality.",
      "Preserve or improve keyboard accessibility, responsive behavior, semantic structure and contrast.",
      "Do not add new features, tracking, dependencies, remote assets, backend behavior, Auth/RLS/Supabase changes, migrations, secrets, billing or production-data changes.",
      "Do not remove meaningful content merely to make screenshots simpler.",
      "Run npm test, npx tsc --noEmit, npm run lint, npm run build and git diff --check.",
      "Never merge or deploy.",
    ].join(" "),
  };

  const plan = {
    schemaVersion: 1,
    maxConcurrentTasks: 1,
    maxRevisionAttempts: 2,
    noAutomaticMerge: true,
    blocks: [block],
  };
  validateAutopilotPlan(plan);
  return { ...decision, plan };
}
