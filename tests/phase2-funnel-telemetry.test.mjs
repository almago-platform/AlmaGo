import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isPhase2FunnelTelemetryEnabled,
  phase2FunnelSteps,
  preparePhase2FunnelEvent,
} from "../src/lib/phase2/funnel-telemetry.ts";

const contract = JSON.parse(readFileSync("config/telemetry-events.json", "utf8"));
const env = readFileSync(".env.example", "utf8");

test("P2.10A defines the minimum Phase 2 funnel as bounded categorical steps", () => {
  assert.deepEqual(phase2FunnelSteps, [
    "orientation_started",
    "orientation_completed",
    "report_requested",
    "account_activated",
    "prospect_qualified",
    "offer_viewed",
    "offer_selected",
    "payment_confirmed",
  ]);

  const event = contract.events.find((item) => item.name === "phase2_funnel_step");
  assert.deepEqual(event, { name: "phase2_funnel_step", properties: ["step"] });
  assert.deepEqual(contract.allowedValues.step, phase2FunnelSteps);
});

test("P2.10A funnel events carry no identity or free-form payload", () => {
  for (const step of phase2FunnelSteps) {
    assert.deepEqual(preparePhase2FunnelEvent(step), {
      name: "phase2_funnel_step",
      properties: { step },
    });
  }

  const serialized = JSON.stringify(
    contract.events.find((item) => item.name === "phase2_funnel_step"),
  ).toLowerCase();

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
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("P2.10A analytics transport remains explicitly disabled by default", () => {
  assert.match(env, /ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED=false/);

  const previous = process.env.ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED;
  delete process.env.ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED;
  assert.equal(isPhase2FunnelTelemetryEnabled(), false);

  process.env.ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED = "true";
  assert.equal(isPhase2FunnelTelemetryEnabled(), true);

  if (previous === undefined) {
    delete process.env.ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED;
  } else {
    process.env.ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED = previous;
  }
});
