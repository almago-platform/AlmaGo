import { redirect } from "next/navigation";
import { StudentNav } from "@/components/student/StudentNav";
import { createClient } from "@/lib/supabase/server";

export default async function StudentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <><StudentNav />{children}</>;
}
