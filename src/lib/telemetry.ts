export const telemetryEventProperties = {
  route_render_failed: ["route_group", "error_code"],
  api_request_failed: ["route_group", "method", "http_status", "error_code"],
  form_submit_result: ["surface", "result", "error_code"],
  navigation_action: ["destination_group"],
  web_vital: ["metric", "value_bucket"],
} as const;

export type TelemetryEventName = keyof typeof telemetryEventProperties;
export type TelemetryValue = string | number | boolean | null;
export type TelemetryProperties = Record<string, TelemetryValue>;

export type PreparedTelemetryEvent = {
  name: TelemetryEventName;
  properties: TelemetryProperties;
};

const maxStringLength = 128;

export function prepareTelemetryEvent(
  name: TelemetryEventName,
  properties: Record<string, unknown>,
): PreparedTelemetryEvent {
  const allowed = new Set<string>(telemetryEventProperties[name]);
  const prepared: TelemetryProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (!allowed.has(key)) {
      throw new Error(`telemetry_property_not_allowed:${name}:${key}`);
    }

    if (value === null || typeof value === "boolean") {
      prepared[key] = value;
      continue;
    }

    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        throw new Error(`telemetry_value_invalid:${name}:${key}`);
      }
      prepared[key] = value;
      continue;
    }

    if (typeof value === "string") {
      const normalized = value.trim();
      if (!normalized || normalized.length > maxStringLength) {
        throw new Error(`telemetry_value_invalid:${name}:${key}`);
      }
      prepared[key] = normalized;
      continue;
    }

    throw new Error(`telemetry_value_invalid:${name}:${key}`);
  }

  return { name, properties: prepared };
}

export type TelemetrySink = (
  event: PreparedTelemetryEvent,
) => void | Promise<void>;

export async function emitTelemetry(
  sink: TelemetrySink,
  name: TelemetryEventName,
  properties: Record<string, unknown>,
) {
  const event = prepareTelemetryEvent(name, properties);
  await sink(event);
}
