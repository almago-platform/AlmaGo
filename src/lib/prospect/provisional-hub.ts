import "server-only";

import { requiredStarterDocumentCategoriesForBacStatus } from "@/lib/campus-intake";
import { buildPublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { buildProspectRoadmap } from "@/lib/orientation/roadmap";
import { validDiagnostic, type ProspectHubState, type ProspectValidOrientation } from "@/lib/prospect/hub";
import type { ProvisionalIdentity } from "@/lib/prospect/provisional-auth";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

/**
 * Supply the SAME ProspectHubState used by the existing free Prospect pages.
 * The pending credential is not a verified Supabase user and never receives
 * access to other users' RLS-backed records or commercial entitlements.
 *
 * Every privileged read must be scoped by the cookie-validated orientation
 * or the pending credential ID. No lookup by a user-supplied email.
 */
export async function loadProvisionalProspectHubState(
  identity: ProvisionalIdentity,
): Promise<ProspectHubState> {
  const db = createPrivilegedSupabaseClient();
  const { data: row, error } = await db.from("orientations")
    .select("id,engine_version,input,result,created_at")
    .eq("id", identity.orientationId)
    .eq("engine_version", "public-orientation-v1")
    .maybeSingle();

  if (error) throw new Error("Temporary orientation unavailable");
  const input = row?.input && typeof row.input === "object"
    ? row.input as Record<string, unknown> : {};
  const answers = row ? restorePublicOrientationAnswers(input.answers) : null;
  const diagnostic = row && answers
    ? validDiagnostic(row.result)
      ? row.result
      : buildPublicOrientationDiagnostic(answers)
    : null;
  const current: ProspectValidOrientation | null = row && answers && diagnostic
    ? { ...row, diagnostic, answers }
    : null;
  const required = requiredStarterDocumentCategoriesForBacStatus(answers?.bacStatus);
  const { data: files, error: fileError } = await db
    .from("provisional_candidate_documents")
    .select("category,status")
    .eq("credential_id", identity.id)
    .eq("status", "pending");
  if (fileError) throw new Error("Temporary dossier unavailable");
  const pendingCategories = new Set((files || []).map((file) => file.category));

  return {
    prospectId: null,
    recovery: null,
    orientations: current ? [current] : [],
    current,
    answers,
    diagnostic,
    roadmap: answers && diagnostic ? buildProspectRoadmap(answers, diagnostic) : null,
    qualification: null,
    // No commercial review/proposal/payment is fabricated for an unverified identity.
    intake: null,
    starterSummary: {
      approved: 0,
      required: required.length,
      pending: required.filter((category) => pendingCategories.has(category)).length,
      needsReplacement: 0,
    },
    orientationConfirmed: false,
  };
}
