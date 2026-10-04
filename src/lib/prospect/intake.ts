import "server-only";

import { requiredStarterDocumentCategoriesForBacStatus } from "@/lib/campus-intake";
import { createClient } from "@/lib/supabase/server";

export type ProspectIntakeRecord = {
  orientation_id: string;
  status: string;
  orientation_confirmed_at: string;
  proposed_route_key: string | null;
  proposal_reason: string | null;
  proposed_offer_version_id: string | null;
  purchase_id: string | null;
  accepted_at: string | null;
  payment_validated_at: string | null;
  procedure_id: string | null;
};

export type StarterDocumentSummary = {
  approved: number;
  required: number;
  pending: number;
  needsReplacement: number;
};

export async function loadProspectIntakeState(
  studentId: string,
  bacStatus?: string | null,
): Promise<{
  intake: ProspectIntakeRecord | null;
  starterSummary: StarterDocumentSummary;
}> {
  const supabase = await createClient();

  const [intakeResult, documentsResult] = await Promise.all([
    supabase
      .from("student_intake_cases")
      .select("orientation_id,status,orientation_confirmed_at,proposed_route_key,proposal_reason,proposed_offer_version_id,purchase_id,accepted_at,payment_validated_at,procedure_id")
      .eq("student_id", studentId)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("category,status")
      .eq("student_id", studentId)
      .in("category", ["passport", "baccalaureate", "transcripts", "language_certificate"]),
  ]);

  const requiredCategories = requiredStarterDocumentCategoriesForBacStatus(bacStatus);
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
