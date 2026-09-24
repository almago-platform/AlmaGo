import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getRoleUser() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { supabase, user: null, role: null };

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    role: error ? null : data?.role ?? null,
  };
}

export async function getAdminUser() {
  const { supabase, user, role } = await getRoleUser();
  return {
    supabase,
    user,
    isAdmin: Boolean(user && role === "admin"),
  };
}

export async function getStudentUser() {
  const { supabase, user, role } = await getRoleUser();
  return {
    supabase,
    user,
    isStudent: Boolean(user && role === "student"),
  };
}
