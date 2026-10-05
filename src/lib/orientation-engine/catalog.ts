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
  master_academic_prerequisites: Record<string, unknown> | null;
  university_id: string;
  university_name: string;
  university_city: string | null;
  university_bundesland: string | null;
  university_type: string | null;
  university_is_public: boolean;
  university_website_url: string | null;
  university_source_url: string | null;
  university_verified_at: string | null;
  university_cover_image_url: string | null;
  university_cover_image_source_url: string | null;
  university_cover_image_attribution: string | null;
  university_cover_image_license: string | null;
};

function parseMasterAcademicPrerequisites(value: Record<string, unknown> | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value)
    .filter(([subject, ects]) =>
      /^[a-z0-9_]{1,80}$/.test(subject)
      && typeof ects === "number"
      && Number.isFinite(ects)
      && ects > 0
      && ects <= 300
    )
    .map(([subject, ects]) => ({ subject, ects: Number(ects) }))
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

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
    masterAcademicPrerequisites: parseMasterAcademicPrerequisites(
      row.master_academic_prerequisites,
    ),
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
      media: {
        universityId: row.university_id,
        canonicalName: row.university_name,
        coverImageUrl: row.university_cover_image_url,
        coverImageSourceUrl: row.university_cover_image_source_url,
        coverImageAttribution: row.university_cover_image_attribution,
        coverImageLicense: row.university_cover_image_license,
      },
    },
  };
}

export async function loadVerifiedProgrammeCatalogue() {
  const supabase = createPublicCatalogSupabaseClient();

  const { data, error } = await supabase.rpc("read_orientation_program_catalog");

  if (error) throw error;

  return (data || [])
    .map((row) => mapProgramme(row as unknown as ProgrammeCatalogRow))
    .sort((a, b) => a.name.localeCompare(b.name));
}
