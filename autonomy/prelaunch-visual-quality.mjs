import { appendFileSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { buildPrelaunchVisualPlan } from "./prelaunch-visual-quality-core.mjs";

function output(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  appendFileSync(process.env.GITHUB_OUTPUT, name + "=" + value + "\n");
}

const reviewPath = resolve(process.env.ALMAGO_VISUAL_REVIEW_JSON || "artifacts/visual-review.json");
if (!existsSync(reviewPath)) {
  output("eligible", "false");
  output("reason", "visual_review_json_missing");
  console.log("AlmaGo pre-launch visual quality: no structured review was produced.");
  process.exit(0);
}

let review;
try {
  review = JSON.parse(readFileSync(reviewPath, "utf8"));
} catch {
  output("eligible", "false");
  output("reason", "visual_review_json_invalid");
  console.log("AlmaGo pre-launch visual quality: structured review JSON is invalid.");
  process.exit(0);
}

const result = buildPrelaunchVisualPlan({
  review,
  mainSha: process.env.ALMAGO_MAIN_SHA || process.env.GITHUB_SHA || "",
});

output("eligible", result.eligible ? "true" : "false");
output("reason", result.reason);
output("verdict", String(review.verdict || "unknown"));
output("confidence", String(review.confidence || "unknown"));

if (!result.eligible) {
  console.log("AlmaGo pre-launch visual quality: no dispatchable plan (" + result.reason + ").");
  process.exit(0);
}

const target = resolve(process.env.ALMAGO_VISUAL_PLAN_PATH || "artifacts/prelaunch-visual/plan.json");
mkdirSync(resolve(target, ".."), { recursive: true });
writeFileSync(target, JSON.stringify(result.plan, null, 2) + "\n");
output("plan_path", target);
console.log(
  "AlmaGo pre-launch visual quality: prepared " +
  result.plan.blocks[0].block_id +
  " for " + result.plan.blocks[0].writable_paths.join(", ") + "."
);
