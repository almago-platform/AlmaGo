import { ButtonLink } from "@/components/ui/ButtonLink";
import { StudentPageFrame } from "@/components/student/StudentPageFrame";
import { StudentPageState } from "@/components/student/StudentPageState";
import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import { StudentOrientationPanel } from "@/components/student/StudentOrientationPanel";
import { StudentGuidancePanel } from "@/components/student/StudentGuidancePanel";
import { matchMasterRequirements } from "@/lib/master-requirements";
import { readMasterRequirementProfile } from "@/lib/master-requirements-persistence";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { studentOrientationCopy } from "@/content/student-orientation-copy";

export const dynamic = "force-dynamic";

export default async function StudentOrientationPage() {
  const locale = await getRequestLocale();
  const t = studentOrientationCopy[locale];
  const supabase = await createClient();
  const [
    { data, error },
    { data: applications, error: applicationsError },
    { data: project, error: projectError },
  ] = await Promise.all([
    supabase
      .from("program_recommendations")
      .select("id,status,note,student_interest_at,programs(id,name,degree_level,field,teaching_language,intake_terms,winter_deadline,summer_deadline,application_url,german_level_required,english_level_required,diploma_required,application_fee_notes,requirements,universities(name,city,bundesland,tuition_notes))")
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    supabase.from("applications").select("program_id,status"),
    supabase
      .from("student_projects")
      .select("current_diploma,current_german_level,target_intake")
      .maybeSingle(),
  ]);

  if (error) {
    return <OrientationUnavailable copy={t} />;
  }

  const recommendations = (data || []).map((recommendation) => {
    const program = Array.isArray(recommendation.programs)
      ? recommendation.programs[0]
      : recommendation.programs;

    if (!program) return { ...recommendation, requirement_match: null };

    const profile = readMasterRequirementProfile(program.requirements);
    const publicProgram = { ...program, requirements: undefined };

    return {
      ...recommendation,
      programs: publicProgram,
      requirement_match: profile && !projectError
        ? matchMasterRequirements(project || {}, profile)
        : null,
    };
  });

  return (
    <StudentPageFrame>
      <StudentJourneyHeader
        current="orientation"
        eyebrow={t.page.eyebrow}
        title={t.page.title}
        description={t.page.description}
        actions={<ButtonLink href="/student/applications" variant="secondary">{t.page.applications}</ButtonLink>}
      />

      <StudentGuidancePanel
        eyebrow={t.page.guidanceEyebrow}
        title={t.page.guidanceTitle}
        description={t.page.guidanceDescription}
        points={[...t.page.guidancePoints]}
        image={{
          src: "https://images.unsplash.com/photo-1758270704787-615782711641?auto=format&fit=crop&w=1200&q=82",
          alt: t.page.imageAlt,
          credit: t.page.imageCredit,
        }}
      />

      <StudentOrientationPanel
        recommendations={recommendations}
        applicationProgramIds={(applications || []).map((application) => application.program_id)}
        applicationStatuses={Object.fromEntries(
          (applications || []).map((application) => [application.program_id, application.status]),
        )}
        applicationStateError={applicationsError ? t.page.applicationsStateError : undefined}
        criteriaStateError={projectError ? t.page.criteriaStateError : undefined}
      />
    </StudentPageFrame>
  );
}

function OrientationUnavailable({ copy }: { copy: (typeof studentOrientationCopy)["fr"] }) {
  return (
    <StudentPageFrame>
      <StudentJourneyHeader current="orientation" eyebrow={copy.page.eyebrow} title={copy.page.title} />
      <StudentPageState
        variant="warning"
        title={copy.page.unavailableTitle}
        description={copy.page.unavailableText}
        actions={
          <>
            <ButtonLink href="/student/orientation">{copy.page.retry}</ButtonLink>
            <ButtonLink href="/student" variant="secondary">{copy.page.back}</ButtonLink>
          </>
        }
      />
    </StudentPageFrame>
  );
}
