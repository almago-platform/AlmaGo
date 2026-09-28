import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildPrelaunchRepairPlan } from "./prelaunch-repair-core.mjs";

function readTail(pathValue) {
  if (!pathValue) return "";
  try {
    return readFileSync(resolve(pathValue), "utf8").slice(-6000);
  } catch {
    return "";
  }
}

function output(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  appendFileSync(process.env.GITHUB_OUTPUT, name + "=" + value + "\n");
}

const mainSha = String(process.env.ALMAGO_MAIN_SHA || process.env.GITHUB_SHA || "");
const result = buildPrelaunchRepairPlan({
  mainSha,
  typecheckOutcome: process.env.ALMAGO_TYPECHECK_OUTCOME || "success",
  lintOutcome: process.env.ALMAGO_LINT_OUTCOME || "success",
  typecheckEvidence: readTail(process.env.ALMAGO_TYPECHECK_LOG),
  lintEvidence: readTail(process.env.ALMAGO_LINT_LOG),
});

if (!result.eligible) {
  output("eligible", "false");
  output("reason", result.reason);
  console.log("AlmaGo pre-launch self-heal: no dispatchable repair (" + result.reason + ").");
  process.exit(0);
}

const target = resolve(process.env.ALMAGO_PRELAUNCH_PLAN_PATH || "artifacts/prelaunch-repair/plan.json");
mkdirSync(resolve(target, ".."), { recursive: true });
writeFileSync(target, JSON.stringify(result.plan, null, 2) + "\n");
output("eligible", "true");
output("reason", result.reason);
output("plan_path", target);
console.log(
  "AlmaGo pre-launch self-heal: prepared " +
  result.plan.blocks[0].block_id +
  " for " + result.plan.blocks[0].writable_paths.join(", ") + "."
);
