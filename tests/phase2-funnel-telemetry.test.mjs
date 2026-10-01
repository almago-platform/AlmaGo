import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { prepareTelemetryEvent } from "../src/lib/telemetry.ts";

const contract = JSON.parse(readFileSync("config/telemetry-events.json", "utf8"));
const env = readFileSync(".env.example", "utf8");
const helper = readFileSync("src/lib/phase2/funnel-telemetry.ts", "utf8");

const expectedSteps = [
  "orientation_started",
  "orientation_completed",
  "report_requested",
  "account_activated",
  "prospect_qualified",
  "offer_viewed",
  "offer_selected",
  "payment_confirmed",
];

test("P2.10A defines the minimum Phase 2 funnel as bounded categorical steps", () => {
  const event = contract.events.find((item) => item.name === "phase2_funnel_step");
  assert.deepEqual(event, { name: "phase2_funnel_step", properties: ["step"] });
  assert.deepEqual(contract.allowedValues.step, expectedSteps);

  for (const step of expectedSteps) {
    assert.deepEqual(prepareTelemetryEvent("phase2_funnel_step", { step }), {
      name: "phase2_funnel_step",
      properties: { step },
    });
  }
});

test("P2.10A funnel events carry no identity or free-form payload", () => {
  const event = contract.events.find((item) => item.name === "phase2_funnel_step");
  const serializedProperties = JSON.stringify(event.properties).toLowerCase();

  for (const forbidden of [
    "email",
    "name",
    "user_id",
    "student_id",
    "token",
    "document",
    "message",
    "address",
    "phone",
  ]) {
    assert.equal(serializedProperties.includes(forbidden), false);
  }

  assert.throws(
    () => prepareTelemetryEvent("phase2_funnel_step", { step: "custom_free_form_value" }),
    /telemetry_value_invalid/,
  );
  assert.throws(
    () => prepareTelemetryEvent("phase2_funnel_step", {
      step: "orientation_started",
      email: "person@example.invalid",
    }),
    /telemetry_property_not_allowed/,
  );
});

test("P2.10A analytics transport remains explicitly disabled by default", () => {
  assert.match(env, /ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED=false/);
  assert.match(
    helper,
    /process\.env\.ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED === "true"/,
  );
  assert.match(
    helper,
    /prepareTelemetryEvent\("phase2_funnel_step", \{ step \}\)/,
  );
  assert.doesNotMatch(helper, /fetch\(|analytics|segment|posthog|mixpanel|gtag|pixel/i);
});
