import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getAdminUser } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};


export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, isAdmin } = await getAdminUser();

  if (!user) redirect("/login");
  if (!isAdmin) redirect("/unauthorized");

  return <AppShell role="admin">{children}</AppShell>;
}
