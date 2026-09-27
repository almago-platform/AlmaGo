import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (role?.role === "admin") redirect("/admin");
  if (role?.role !== "student") redirect("/unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AppShell role="student" displayName={profile?.first_name || null}>
      {children}
    </AppShell>
  );
}
