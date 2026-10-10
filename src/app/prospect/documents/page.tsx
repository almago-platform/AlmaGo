import { redirect } from "next/navigation";
import { StarterDocumentsPanel } from "@/components/prospect/StarterDocumentsPanel";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { getProvisionalIdentity } from "@/lib/prospect/provisional-auth";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

export const dynamic = "force-dynamic";

export default async function ProspectStarterDocumentsPage() {
  const access = await getPhase2StudentAccess();
  const { supabase, user } = access;

  if (!user) {
    const pending = await getProvisionalIdentity();
    if (!pending) redirect("/login");
    const privateDb = createPrivilegedSupabaseClient();
    // Service-key reads MUST always scope to the server-validated credential.
    const [documentsResult, orientationResult] = await Promise.all([
      privateDb.from("provisional_candidate_documents")
        .select("id,category,original_filename,status,created_at")
        .eq("credential_id", pending.id).eq("status", "pending")
        .order("created_at", { ascending: false }),
      privateDb.from("orientations").select("input")
        .eq("id", pending.orientationId).maybeSingle(),
    ]);
    const input = orientationResult.data?.input && typeof orientationResult.data.input === "object"
      ? orientationResult.data.input as Record<string, unknown> : {};
    const answers = restorePublicOrientationAnswers(input.answers);
    const docs = (documentsResult.data || []).map((row) => ({ ...row, admin_comment: null }));
    return <StarterDocumentsPanel documents={docs} preBac={answers.bacStatus === "preparing"} provisional />;
  }
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
