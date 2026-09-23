import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  emitTelemetry,
  prepareTelemetryEvent,
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
});

test("telemetry rejects unknown properties instead of silently forwarding them", () => {
  assert.throws(
    () =>
      prepareTelemetryEvent("navigation_action", {
        destination_group: "student",
        email: "test@example.invalid",
      }),
    /telemetry_property_not_allowed/,
  );
});

test("telemetry rejects long free-form values", () => {
  assert.throws(
    () =>
      prepareTelemetryEvent("form_submit_result", {
        surface: "profile",
        result: "x".repeat(129),
      }),
    /telemetry_value_invalid/,
  );
});

test("telemetry prepares only bounded categorical values and does not send by itself", async () => {
  const calls = [];
  const sink = async (event) => {
    calls.push(event);
  };

  await emitTelemetry(sink, "api_request_failed", {
    route_group: "admin",
    method: "POST",
    http_status: 403,
    error_code: "admin_required",
  });

  assert.deepEqual(calls, [
    {
      name: "api_request_failed",
      properties: {
        route_group: "admin",
        method: "POST",
        http_status: 403,
        error_code: "admin_required",
      },
    },
  ]);
});
