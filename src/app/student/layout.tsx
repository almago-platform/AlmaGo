import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getStudentUser } from "@/lib/auth/access";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { supabase, user, isStudent } = await getStudentUser();

  if (!user) redirect("/login");
  if (!isStudent) redirect("/unauthorized");

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
