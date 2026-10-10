import "server-only";

import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { buildOrientationGeographicScopes } from "@/lib/orientation-engine/geography";
import {
  chooseDocumentedResearchPistes,
  researchFamiliesFor,
  type ResearchPiste,
  type ResearchPisteCriteria,
  type ResearchPisteRow,
} from "@/lib/orientation-engine/discovery/research-pistes";
import { filterSupplementalResearchPistes } from "@/lib/orientation-engine/result/supplemental";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type { OrientationPublicPersonalizedResult } from "@/lib/orientation-engine/result/types";

/**
 * Same research catalogue and same selection strategy as the public UI.
 * This is a trusted server-side read after saving an orientation; it never
 * calls the public HTTP endpoint nor modifies the global research catalogue.
 */
export async function readSupplementalOrientationEmailPistes(
  answers: PublicOrientationAnswers,
  selected: OrientationPublicPersonalizedResult["selected"],
): Promise<ResearchPiste[]> {
  if (answers.bacStatus === "no_bac" || selected.length >= 3) return [];
  if (answers.targetDegree !== "Bachelor" && answers.targetDegree !== "Master") return [];
  // Do not present an incomplete detailed dossier as ready if the catalogue is offline.
  // The saved report already requires the same database to retrieve the orientation.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    throw new Error("Orientation research catalogue is not configured");
  }
  const criteria: ResearchPisteCriteria = {
    targetDegree: answers.targetDegree,
    targetField: answers.targetField,
    preferredCities: answers.preferredCities,
    studyLanguage: answers.studyLanguage,
    bacStatus: answers.bacStatus,
    targetSpecialization: answers.targetSpecialization,
    engineeringSpecialty: answers.engineeringSpecialty,
    scienceSpecialty: answers.scienceSpecialty,
  };
  if (!researchFamiliesFor(criteria).length) return [];
  try {
    const supabase = createPrivilegedSupabaseClient();
    const { data, error } = await supabase.from("orientation_research_programs")
      .select("institution,programme,degree,city,teaching_language,official_programme_url,family_ids,verification_status,research_status")
      .overlaps("family_ids", researchFamiliesFor(criteria))
      .not("official_programme_url", "is", null)
      .limit(180);
    if (error) throw new Error("Orientation research catalogue query failed");
    const rows: ResearchPisteRow[] = (data || []).map((row) => ({
      institution: row.institution,
      programme: row.programme,
      degree: row.degree,
      city: row.city,
      teachingLanguage: row.teaching_language,
      officialUrl: row.official_programme_url,
      familyIds: row.family_ids || [],
      verificationStatus: row.verification_status,
      researchStatus: row.research_status,
    }));
    const scopes = buildOrientationGeographicScopes(criteria.preferredCities);
    const candidates = chooseDocumentedResearchPistes(
      rows,
      { ...criteria, preferredCities: scopes[0]?.cities || [] },
      12,
      {
        nearbyCities: scopes.find((scope) => scope.tier === "nearby")?.cities || [],
        regionCities: scopes.find((scope) => scope.tier === "land")?.cities || [],
      },
    );
    return filterSupplementalResearchPistes(candidates, selected);
  } catch {
    // Printing must fail instead of silently claiming all the recommended
    // universities have been included when the research database is unavailable.
    throw new Error("Orientation research catalogue unavailable");
  }
}
