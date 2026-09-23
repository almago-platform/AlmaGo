export const telemetryEventProperties = {
  route_render_failed: ["route_group", "error_code"],
  api_request_failed: ["route_group", "method", "http_status", "error_code"],
  form_submit_result: ["surface", "result", "error_code"],
  navigation_action: ["destination_group"],
  web_vital: ["metric", "value_bucket"],
} as const;

// Values are bounded too: a safe property name cannot make free-form data safe.
export const telemetryAllowedValues = {
  route_group: ["public", "auth", "student", "admin", "api", "other"],
  error_code: [
    "unknown", "auth_required", "admin_required", "access_denied",
    "validation_failed", "not_found", "network_error", "server_error",
  ],
  method: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  surface: ["login", "signup", "profile", "onboarding", "documents", "orientation", "applications", "other"],
  result: ["success", "failure"],
  destination_group: ["public", "auth", "student", "admin", "other"],
  metric: ["LCP", "INP", "CLS", "FCP", "TTFB"],
  value_bucket: ["good", "needs_improvement", "poor"],
} as const;

export type TelemetryEventName = keyof typeof telemetryEventProperties;
export type TelemetryValue = string | number;
export type TelemetryProperties = Record<string, TelemetryValue>;

export type PreparedTelemetryEvent = {
  name: TelemetryEventName;
  properties: TelemetryProperties;
};

export function prepareTelemetryEvent(
  name: string,
  properties: Record<string, unknown>,
): PreparedTelemetryEvent {
  if (!Object.hasOwn(telemetryEventProperties, name)) {
    throw new Error("telemetry_event_not_allowed");
  }

  const eventName = name as TelemetryEventName;
  const allowed = new Set<string>(telemetryEventProperties[eventName]);
  const prepared: TelemetryProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (!allowed.has(key)) {
      throw new Error("telemetry_property_not_allowed");
    }

    if (key === "http_status") {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 100 || value > 599) {
        throw new Error("telemetry_value_invalid");
      }
      prepared[key] = value;
      continue;
    }

    const choices = telemetryAllowedValues[key as keyof typeof telemetryAllowedValues];
    if (typeof value !== "string" || !choices || !(choices as readonly string[]).includes(value)) {
      throw new Error("telemetry_value_invalid");
    }
    prepared[key] = value;
  }

  return { name: eventName, properties: prepared };
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
