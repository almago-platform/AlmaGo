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


export async function getStudentUser() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { supabase, user: null, isStudent: false };
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  return { supabase, user, isStudent: role?.role === "student" };
}
