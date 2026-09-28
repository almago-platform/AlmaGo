import { appendFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildStablePrelaunchPerformancePlan } from "./prelaunch-performance-core.mjs";

function output(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  appendFileSync(process.env.GITHUB_OUTPUT, name + "=" + value + "\n");
}

function reportsFrom(directory) {
  const root = resolve(directory);
  try {
    return readdirSync(root)
      .filter((name) => name.endsWith(".report.json"))
      .map((name) => {
        const path = resolve(root, name);
        try {
          return { name, report: JSON.parse(readFileSync(path, "utf8")) };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

const reportDir = process.env.ALMAGO_LIGHTHOUSE_REPORT_DIR || "artifacts/lighthouse";
const reportItems = reportsFrom(reportDir);
const result = buildStablePrelaunchPerformancePlan({
  reports: reportItems.map((item) => item.report),
  mainSha: process.env.ALMAGO_MAIN_SHA || process.env.GITHUB_SHA || "",
  minRuns: Number.parseInt(process.env.ALMAGO_PERFORMANCE_MIN_RUNS || "3", 10),
});

output("eligible", result.eligible ? "true" : "false");
output("reason", result.reason);
if (result.scores?.performance != null) {
  output("performance_score", result.scores.performance.toFixed(2));
}
if (Array.isArray(result.performanceRange)) {
  output("performance_range", result.performanceRange.map((score) => score.toFixed(2)).join("-"));
}
if (result.runCount != null) output("run_count", String(result.runCount));

if (!result.eligible) {
  const detail = result.scores?.performance != null
    ? " median=" + result.scores.performance.toFixed(2) +
      (result.performanceRange ? " range=" + result.performanceRange.map((score) => score.toFixed(2)).join("–") : "")
    : "";
  console.log("AlmaGo pre-launch performance: no dispatchable plan (" + result.reason + ")." + detail);
  process.exit(0);
}

const target = resolve(process.env.ALMAGO_PERFORMANCE_PLAN_PATH || "artifacts/prelaunch-performance/plan.json");
mkdirSync(resolve(target, ".."), { recursive: true });
writeFileSync(target, JSON.stringify(result.plan, null, 2) + "\n");

output("plan_path", target);
console.log(
  "AlmaGo pre-launch performance: prepared " + result.plan.blocks[0].block_id +
  " from " + result.runCount + " homepage runs at median " +
  result.scores.performance.toFixed(2) + " (range " +
  result.performanceRange.map((score) => score.toFixed(2)).join("–") + ")."
);
