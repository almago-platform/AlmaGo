import { isFreeValidationPilotEnabled, isPhase2AccessEnabled } from "@/lib/phase2/config";
import { createClient } from "@/lib/supabase/server";

const clientStatuses = new Set(["client_active", "client_completed"]);

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getAdminUser() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  return { supabase, user, isAdmin: role?.role === "admin" };
}

export async function getTechnicalStudentUser() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { supabase, user: null, isStudent: false };

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, isStudent: role?.role === "student" };
}

export async function getStudentUser() {
  const auth = await getTechnicalStudentUser();
  if (!auth.user || !auth.isStudent || !isPhase2AccessEnabled()) return auth;

  const [{ data: access, error }, pilotResult] = await Promise.all([
    auth.supabase
      .from("customer_access")
      .select("status")
      .eq("user_id", auth.user.id)
      .maybeSingle(),
    isFreeValidationPilotEnabled()
      ? auth.supabase
          .from("free_validation_pilot_access_events")
          .select("action,created_at")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const isClientStudent = !error
    && typeof access?.status === "string"
    && clientStatuses.has(access.status);

  const isFreePilotStudent = isFreeValidationPilotEnabled()
    && !pilotResult.error
    && pilotResult.data?.action === "grant";

  return {
    ...auth,
    isStudent: isClientStudent || isFreePilotStudent,
  };
}
