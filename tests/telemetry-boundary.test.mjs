import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  emitTelemetry,
  prepareTelemetryEvent,
  telemetryAllowedValues,
  telemetryEventProperties,
} from "../src/lib/telemetry.ts";

const contract = JSON.parse(readFileSync("config/telemetry-events.json", "utf8"));

test("runtime telemetry boundary matches the canonical allow-list contract", () => {
  const runtime = Object.entries(telemetryEventProperties)
    .map(([name, properties]) => ({ name, properties: [...properties] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const canonical = contract.events
    .map((event) => ({ name: event.name, properties: [...event.properties] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  assert.deepEqual(runtime, canonical);
  assert.deepEqual(telemetryAllowedValues, contract.allowedValues);
  assert.deepEqual(
    [...new Set(contract.events.flatMap(event => event.properties).filter(key => key !== "http_status"))].sort(),
    Object.keys(contract.allowedValues).sort(),
  );
});

test("telemetry rejects unknown event names at runtime", () => {
  assert.throws(() => prepareTelemetryEvent("user_profile_opened", {}), /telemetry_event_not_allowed/);
  assert.throws(() => prepareTelemetryEvent("toString", {}), /telemetry_event_not_allowed/);
});

test("telemetry rejects unknown properties instead of silently forwarding them", () => {
  assert.throws(
    () => prepareTelemetryEvent("navigation_action", {
      destination_group: "student",
      email: "test@example.invalid",
    }),
    /telemetry_property_not_allowed/,
  );
});

test("telemetry rejects personal and unbounded values inside allowed keys", () => {
  for (const [name, properties] of [
    ["route_render_failed", { route_group: "person@example.invalid" }],
    ["form_submit_result", { surface: "profile", result: "john doe" }],
    ["api_request_failed", { error_code: "student_12345" }],
    ["navigation_action", { destination_group: "/student/profile?email=person@example.invalid" }],
    ["web_vital", { metric: "custom-identifier" }],
    ["api_request_failed", { http_status: 600 }],
    ["api_request_failed", { http_status: 403.5 }],
    ["api_request_failed", { http_status: "403" }],
  ]) {
    assert.throws(() => prepareTelemetryEvent(name, properties), /telemetry_value_invalid/);
  }
});

test("telemetry sends only approved categorical values and valid HTTP status", async () => {
  const calls = [];
  await emitTelemetry(async (event) => calls.push(event), "api_request_failed", {
    route_group: "admin",
    method: "POST",
    http_status: 403,
    error_code: "admin_required",
  });

  assert.deepEqual(calls, [{
    name: "api_request_failed",
    properties: { route_group: "admin", method: "POST", http_status: 403, error_code: "admin_required" },
  }]);
});
