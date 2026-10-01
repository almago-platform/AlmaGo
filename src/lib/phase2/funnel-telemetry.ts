import { prepareTelemetryEvent, type PreparedTelemetryEvent } from "@/lib/telemetry";

export const phase2FunnelSteps = [
  "orientation_started",
  "orientation_completed",
  "report_requested",
  "account_activated",
  "prospect_qualified",
  "offer_viewed",
  "offer_selected",
  "payment_confirmed",
] as const;

export type Phase2FunnelStep = (typeof phase2FunnelSteps)[number];

export function isPhase2FunnelTelemetryEnabled() {
  return process.env.ALMAGO_PHASE2_FUNNEL_TELEMETRY_ENABLED === "true";
}

export function preparePhase2FunnelEvent(
  step: Phase2FunnelStep,
): PreparedTelemetryEvent {
  return prepareTelemetryEvent("phase2_funnel_step", { step });
}
