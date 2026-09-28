import { appendFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { buildPrelaunchPerformancePlan } from "./prelaunch-performance-core.mjs";

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
const reports = reportsFrom(reportDir);
let selected = null;
let lastReason = "homepage_report_not_found";

for (const item of reports) {
  const result = buildPrelaunchPerformancePlan({
    report: item.report,
    mainSha: process.env.ALMAGO_MAIN_SHA || process.env.GITHUB_SHA || "",
  });
  if (result.eligible) {
    selected = { ...result, reportName: item.name };
    break;
  }
  if (result.reason !== "not_homepage_report") lastReason = result.reason;
}

if (!selected) {
  output("eligible", "false");
  output("reason", lastReason);
  console.log("AlmaGo pre-launch performance: no dispatchable plan (" + lastReason + ").");
  process.exit(0);
}

const target = resolve(process.env.ALMAGO_PERFORMANCE_PLAN_PATH || "artifacts/prelaunch-performance/plan.json");
mkdirSync(resolve(target, ".."), { recursive: true });
writeFileSync(target, JSON.stringify(selected.plan, null, 2) + "\n");

output("eligible", "true");
output("reason", selected.reason);
output("plan_path", target);
output("performance_score", selected.scores.performance.toFixed(2));
console.log(
  "AlmaGo pre-launch performance: prepared " + selected.plan.blocks[0].block_id +
  " from " + basename(selected.reportName) +
  " at score " + selected.scores.performance.toFixed(2) + "."
);
