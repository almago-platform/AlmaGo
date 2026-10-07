import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getAdminUser } from "@/lib/auth/access";
import { isPartnerPrelaunchModeEnabled } from "@/lib/prelaunch";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, hasAdminRole, isAdmin } = await getAdminUser();

  if (!user) redirect("/login");
  if (!hasAdminRole) redirect("/unauthorized");
  if (!isAdmin) redirect("/mfa");

  return (
    <AppShell role="admin" partnerPrelaunch={isPartnerPrelaunchModeEnabled()}>
      {children}
    </AppShell>
  );
}
