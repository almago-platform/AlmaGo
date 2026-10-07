const clientLifecycleStatuses = new Set(["client_active", "client_completed"]);

export function hasClientLifecycleEntitlement(
  status: string | null | undefined,
) {
  return typeof status === "string" && clientLifecycleStatuses.has(status);
}
