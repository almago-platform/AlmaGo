import { redirect } from "next/navigation";
import { StarterDocumentsPanel } from "@/components/prospect/StarterDocumentsPanel";
import { getPhase2StudentAccess } from "@/lib/phase2/access";

export const dynamic = "force-dynamic";

export default async function ProspectStarterDocumentsPage() {
  const access = await getPhase2StudentAccess();
  const { supabase, user } = access;

  if (!user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (!access.phase2Enabled || access.canUseClientFeatures) redirect("/student");

  const { data: intake } = await supabase
    .from("student_intake_cases")
    .select("status")
    .eq("student_id", user.id)
    .maybeSingle();

  if (!intake || intake.status === "procedure_created") {
    redirect("/prospect");
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id,category,original_filename,status,admin_comment,created_at")
    .in("category", ["passport", "baccalaureate", "transcripts", "language_certificate"])
    .order("created_at", { ascending: false });

  return (
    <main>
      <StarterDocumentsPanel documents={documents || []} />
    </main>
  );
}
