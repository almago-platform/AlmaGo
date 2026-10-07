import { getTechnicalStudentUser } from "@/lib/auth/access";
import { hasClientLifecycleEntitlement } from "@/lib/auth/entitlement";
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

const customerLifecycleStatusLabels: Record<CustomerLifecycleStatus, string> = {
  prospect_account: "Compte prospect",
  qualified_prospect: "Prospect qualifié",
  payment_pending: "Paiement en attente",
  paid_pending_validation: "Paiement reçu · validation en attente",
  client_active: "Client actif",
  client_completed: "Accompagnement terminé",
};

export function customerLifecycleStatusLabel(status: string | null | undefined) {
  if (!status) return "Sans compte lié";
  return customerLifecycleStatusLabels[status as CustomerLifecycleStatus] || status;
}

export function canUseClientFeatures(status: CustomerLifecycleStatus | null) {
  return hasClientLifecycleEntitlement(status);
}

export async function getPhase2StudentAccess() {
  const auth = await getTechnicalStudentUser();
  const phase2Enabled = isPhase2AccessEnabled();

  if (!auth.user || !auth.isStudent) {
    return {
      ...auth,
      phase2Enabled,
      customerStatus: null as CustomerLifecycleStatus | null,
      canUseClientFeatures: false,
    };
  }

  // Feature flags may disable Phase 2 UX, but they must never widen authorization.
  // Client entitlement always comes from the immutable server-side lifecycle row.
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
