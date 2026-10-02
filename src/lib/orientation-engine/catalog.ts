import "server-only";

import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog";
import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";

type ProgrammeCatalogRow = {
  id: string;
  name: string;
  degree_level: string;
  field: string | null;
  teaching_language: string | null;
  german_level_required: string | null;
  english_level_required: string | null;
  studienkolleg_required: boolean;
  uni_assist_required: boolean;
  intake_terms: string[] | null;
  winter_deadline: string | null;
  summer_deadline: string | null;
  application_url: string | null;
  programme_source_url: string | null;
  programme_verified_at: string | null;
  university_id: string;
  university_name: string;
  university_city: string | null;
  university_bundesland: string | null;
  university_type: string | null;
  university_is_public: boolean;
  university_website_url: string | null;
  university_source_url: string | null;
  university_verified_at: string | null;
};

function mapProgramme(row: ProgrammeCatalogRow): OrientationProgrammeRecord {
  return {
    id: row.id,
    name: row.name,
    degreeLevel: row.degree_level,
    field: row.field,
    teachingLanguage: row.teaching_language,
    germanLevelRequired: row.german_level_required,
    englishLevelRequired: row.english_level_required,
    studienkollegRequired: row.studienkolleg_required,
    uniAssistRequired: row.uni_assist_required,
    intakeTerms: Array.isArray(row.intake_terms)
      ? row.intake_terms.filter((term): term is string => typeof term === "string")
      : [],
    winterDeadline: row.winter_deadline,
    summerDeadline: row.summer_deadline,
    applicationUrl: row.application_url,
    programmeSourceUrl: row.programme_source_url,
    programmeVerifiedAt: row.programme_verified_at,
    university: {
      id: row.university_id,
      name: row.university_name,
      city: row.university_city,
      bundesland: row.university_bundesland,
      universityType: row.university_type,
      isPublic: row.university_is_public,
      websiteUrl: row.university_website_url,
      sourceUrl: row.university_source_url,
      verifiedAt: row.university_verified_at,
    },
  };
}

export async function loadVerifiedProgrammeCatalogue() {
  const supabase = createPublicCatalogSupabaseClient();

  const { data, error } = await supabase
    .from("orientation_program_catalog")
    .select([
      "id",
      "name",
      "degree_level",
      "field",
      "teaching_language",
      "german_level_required",
      "english_level_required",
      "studienkolleg_required",
      "uni_assist_required",
      "intake_terms",
      "winter_deadline",
      "summer_deadline",
      "application_url",
      "programme_source_url",
      "programme_verified_at",
      "university_id",
      "university_name",
      "university_city",
      "university_bundesland",
      "university_type",
      "university_is_public",
      "university_website_url",
      "university_source_url",
      "university_verified_at",
    ].join(","))
    .order("name");

  if (error) throw error;

  return (data || []).map((row) => mapProgramme(row as unknown as ProgrammeCatalogRow));
}
