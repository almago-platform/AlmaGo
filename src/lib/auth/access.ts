import { hasClientLifecycleEntitlement } from "@/lib/auth/entitlement";
import { createClient } from "@/lib/supabase/server";

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
  if (!auth.user || !auth.isStudent) return auth;

  const { data: access, error } = await auth.supabase
    .from("customer_access")
    .select("status")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return {
    ...auth,
    // Technical identity is not client entitlement. Feature flags and pilot
    // events must never widen this generic student/client boundary.
    isStudent: !error && hasClientLifecycleEntitlement(access?.status),
  };
}
