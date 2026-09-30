import { getTechnicalStudentUser } from "@/lib/auth/access";
import { isPhase2AccessEnabled } from "@/lib/phase2/config";

export const customerLifecycleStatuses = [
  "prospect_account",
  "qualified_prospect",
  "payment_pending",
  "paid_pending_validation",
  "client_active",
  "client_completed",
] as const;

export type CustomerLifecycleStatus = (typeof customerLifecycleStatuses)[number];

const clientStatuses = new Set<CustomerLifecycleStatus>([
  "client_active",
  "client_completed",
]);

export function canUseClientFeatures(status: CustomerLifecycleStatus | null) {
  return status !== null && clientStatuses.has(status);
}

export async function getPhase2StudentAccess() {
  const auth = await getTechnicalStudentUser();

  if (!auth.user || !auth.isStudent) {
    return {
      ...auth,
      phase2Enabled: isPhase2AccessEnabled(),
      customerStatus: null as CustomerLifecycleStatus | null,
      canUseClientFeatures: false,
    };
  }

  const phase2Enabled = isPhase2AccessEnabled();

  // P2.0 is safe to merge before public activation. Until the server flag is enabled,
  // Phase 1 student access remains exactly as it was.
  if (!phase2Enabled) {
    return {
      ...auth,
      phase2Enabled,
      customerStatus: "client_active" as CustomerLifecycleStatus,
      canUseClientFeatures: true,
    };
  }

  const { data: access } = await auth.supabase
    .from("customer_access")
    .select("status")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  const customerStatus =
    (access?.status as CustomerLifecycleStatus | undefined) ?? null;

  return {
    ...auth,
    phase2Enabled,
    customerStatus,
    canUseClientFeatures: canUseClientFeatures(customerStatus),
  };
}
