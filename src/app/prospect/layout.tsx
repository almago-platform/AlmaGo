import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProspectShell } from "@/components/layout/ProspectShell";
import { getPhase2StudentAccess } from "@/lib/phase2/access";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProspectLayout({
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

  if (!access.phase2Enabled || access.canUseClientFeatures) {
    redirect("/student");
  }

  const [{ data: profile }, { data: purchase }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("commercial_purchases")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <ProspectShell
      displayName={profile?.first_name || null}
      showPayment={Boolean(purchase)}
    >
      {children}
    </ProspectShell>
  );
}
