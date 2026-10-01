import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-smart-orientation-rehearsal.yml", "utf8");
const spec = readFileSync("tests/e2e/smart-orientation.spec.mjs", "utf8");

test("SO-6 rehearsal stays explicit and owner-triggered under Calm Mode", () => {
  assert.match(workflow, /issue_comment:/);
  assert.match(workflow, /github\.event\.issue\.number == 708/);
  assert.match(workflow, /github\.event\.comment\.user\.login == 'tayariAyoub'/);
  assert.match(workflow, /github\.event\.comment\.body == 'SMART ORIENTATION REHEARSAL'/);
  assert.doesNotMatch(workflow, /\bpush:\s*\n|pull_request:/);
});

test("SO-6 verifies exact Render main and partner_prelaunch before and after", () => {
  assert.match(workflow, /expected_revision/);
  assert.match(workflow, /branch.*main/);
  assert.match(workflow, /partner_prelaunch/);
  assert.match(workflow, /git fetch origin main/);
  assert.match(workflow, /Render drifted during Smart Orientation rehearsal/);
});

test("SO-6 never deploys or enables public prospect capture", () => {
  assert.doesNotMatch(workflow, /render deploy|trigger-deploy|vercel deploy|ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED:\s*["']?true/i);
  assert.doesNotMatch(workflow, /ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED:\s*["']?true/i);
});

test("SO-6 browser matrix covers owner scenarios", () => {
  assert.match(spec, /generalAverage: "15"[\s\S]*targetField: "Médecine\/Santé"[\s\S]*germanLevel: "A2"/);
  assert.match(spec, /bacStatus: "preparing"[\s\S]*generalAverage: "14"/);
  assert.match(spec, /generalAverage: "10"/);
  assert.match(spec, /generalAverage: ""/);
  assert.match(spec, /Votre projet mérite une étude plus précise/);
  assert.match(spec, /Vous pouvez commencer votre préparation dès maintenant/);
  assert.match(spec, /Votre projet peut déjà être préparé/);
});

test("SO-6 covers Arabic RTL, 360 mobile, accessibility and admin queue", () => {
  assert.match(workflow, /mobile-360-chromium/);
  assert.match(spec, /selectOption\("ar"\)/);
  assert.match(spec, /toHaveAttribute\("dir", "rtl"\)/);
  assert.match(spec, /AxeBuilder/);
  assert.match(spec, /\/admin\/prospects/);
  assert.match(spec, /À traiter en priorité/);
});

test("SO-6 uses no real public prospect submission", () => {
  assert.doesNotMatch(spec, /\/api\/orientation\/prospect/);
  assert.match(spec, /orientation-prospect-capture/);
  assert.match(spec, /toHaveCount\(0\)/);
});
