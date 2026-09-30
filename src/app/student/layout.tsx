import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getPhase2StudentAccess } from "@/lib/phase2/access";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await getPhase2StudentAccess();
  const { supabase, user } = access;

  if (!user) redirect("/login");

  if (!access.isStudent) {
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (role?.role === "admin") redirect("/admin");
    redirect("/unauthorized");
  }

  if (access.phase2Enabled && !access.canUseClientFeatures) {
    redirect("/prospect");
  }

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
