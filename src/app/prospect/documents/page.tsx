import { redirect } from "next/navigation";
import { StarterDocumentsPanel } from "@/components/prospect/StarterDocumentsPanel";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
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
    .select("status,orientation_id")
    .eq("student_id", user.id)
    .maybeSingle();

  if (!intake) {
    redirect("/prospect/orientation");
  }

  const { data: orientation } = await supabase
    .from("orientations")
    .select("input")
    .eq("id", intake.orientation_id)
    .maybeSingle();

  const answers = restorePublicOrientationAnswers(
    orientation?.input && typeof orientation.input === "object"
      ? (orientation.input as Record<string, unknown>).answers
      : null,
  );
  const preBac = answers.bacStatus === "preparing";

  const { data: documents } = await supabase
    .from("documents")
    .select("id,category,original_filename,status,admin_comment,created_at")
    .in("category", ["passport", "baccalaureate", "transcripts", "language_certificate"])
    .order("created_at", { ascending: false });

  return (
    <main>
      <StarterDocumentsPanel documents={documents || []} preBac={preBac} />
    </main>
  );
}
