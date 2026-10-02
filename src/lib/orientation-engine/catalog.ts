import "server-only";

import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";

type UniversityRow = {
  id: string;
  name: string;
  city: string | null;
  bundesland: string | null;
  university_type: string | null;
  is_public: boolean;
  website_url: string | null;
  source_url: string | null;
  verified_at: string | null;
  is_active: boolean;
};

type ProgrammeRow = {
  id: string;
  name: string;
  degree_level: string;
  field: string | null;
  teaching_language: string | null;
  german_level_required: string | null;
  english_level_required: string | null;
  studienkolleg_required: boolean;
  uni_assist_required: boolean;
  winter_deadline: string | null;
  summer_deadline: string | null;
  application_url: string | null;
  source_url: string | null;
  verified_at: string | null;
  universities: UniversityRow | UniversityRow[] | null;
};

function universityOf(row: ProgrammeRow) {
  if (Array.isArray(row.universities)) return row.universities[0] || null;
  return row.universities;
}

function mapProgramme(row: ProgrammeRow): OrientationProgrammeRecord | null {
  const university = universityOf(row);
  if (!university) return null;

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
    winterDeadline: row.winter_deadline,
    summerDeadline: row.summer_deadline,
    applicationUrl: row.application_url,
    programmeSourceUrl: row.source_url,
    programmeVerifiedAt: row.verified_at,
    university: {
      id: university.id,
      name: university.name,
      city: university.city,
      bundesland: university.bundesland,
      universityType: university.university_type,
      isPublic: university.is_public,
      websiteUrl: university.website_url,
      sourceUrl: university.source_url,
      verifiedAt: university.verified_at,
    },
  };
}

export async function loadVerifiedProgrammeCatalogue() {
  const supabase = createPrivilegedSupabaseClient();

  const selection = [
    "id",
    "name",
    "degree_level",
    "field",
    "teaching_language",
    "german_level_required",
    "english_level_required",
    "studienkolleg_required",
    "uni_assist_required",
    "winter_deadline",
    "summer_deadline",
    "application_url",
    "source_url",
    "verified_at",
    "universities!inner(id,name,city,bundesland,university_type,is_public,website_url,source_url,verified_at,is_active)",
  ].join(",");

  const { data, error } = await supabase
    .from("programs")
    .select(selection)
    .eq("is_active", true)
    .eq("universities.is_active", true)
    .order("name");

  if (error) throw error;

  return (data || [])
    .map((row) => mapProgramme(row as unknown as ProgrammeRow))
    .filter((programme): programme is OrientationProgrammeRecord => Boolean(programme));
}
