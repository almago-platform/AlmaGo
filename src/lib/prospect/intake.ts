import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ProspectIntakeRecord = {
  orientation_id: string;
  status: string;
  orientation_confirmed_at: string;
  proposed_route_key: string | null;
  proposal_reason: string | null;
  procedure_id: string | null;
};

export type StarterDocumentSummary = {
  approved: number;
  required: number;
  pending: number;
  needsReplacement: number;
};

export async function loadProspectIntakeState(studentId: string): Promise<{
  intake: ProspectIntakeRecord | null;
  starterSummary: StarterDocumentSummary;
}> {
  const supabase = await createClient();

  const [intakeResult, documentsResult] = await Promise.all([
    supabase
      .from("student_intake_cases")
      .select("orientation_id,status,orientation_confirmed_at,proposed_route_key,proposal_reason,procedure_id")
      .eq("student_id", studentId)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("category,status")
      .eq("student_id", studentId)
      .in("category", ["passport", "baccalaureate", "transcripts", "language_certificate"]),
  ]);

  const requiredCategories = ["passport", "baccalaureate", "transcripts"];
  const documents = documentsResult.data || [];
  const approvedCategories = new Set(
    documents
      .filter((document) => document.status === "approved")
      .map((document) => document.category),
  );
  const pendingCategories = new Set(
    documents
      .filter((document) => ["pending", "reviewed"].includes(document.status))
      .map((document) => document.category),
  );
  const replacementCategories = new Set(
    documents
      .filter((document) => ["rejected", "replace_required"].includes(document.status))
      .map((document) => document.category),
  );

  return {
    intake: intakeResult.data as ProspectIntakeRecord | null,
    starterSummary: {
      approved: requiredCategories.filter((category) => approvedCategories.has(category)).length,
      required: requiredCategories.length,
      pending: requiredCategories.filter((category) => pendingCategories.has(category)).length,
      needsReplacement: requiredCategories.filter((category) => replacementCategories.has(category)).length,
    },
  };
}
