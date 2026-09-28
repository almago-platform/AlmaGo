import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import { StudentOrientationPanel } from "@/components/student/StudentOrientationPanel";
import { StudentGuidancePanel } from "@/components/student/StudentGuidancePanel";
import { matchMasterRequirements } from "@/lib/master-requirements";
import { readMasterRequirementProfile } from "@/lib/master-requirements-persistence";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentOrientationPage() {
  const supabase = await createClient();
  const [
    { data, error },
    { data: applications, error: applicationsError },
    { data: project, error: projectError },
  ] = await Promise.all([
    supabase
      .from("program_recommendations")
      .select("id,status,note,student_interest_at,programs(id,name,degree_level,field,teaching_language,winter_deadline,summer_deadline,application_url,german_level_required,english_level_required,diploma_required,requirements,universities(name,city,bundesland))")
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    supabase.from("applications").select("program_id"),
    supabase
      .from("student_projects")
      .select("current_diploma,current_german_level,target_intake")
      .maybeSingle(),
  ]);

  if (error) {
    return <OrientationUnavailable />;
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
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader
        current="orientation"
        eyebrow="Mon dossier"
        title="Mes programmes"
        description="Comparez les programmes proposés et vérifiez les critères avant de choisir. Un programme proposé n’est pas une admission."
        actions={<ButtonLink href="/student/applications" variant="secondary">Mes candidatures</ButtonLink>}
      />

      <StudentGuidancePanel
        eyebrow="Pour choisir un programme"
        title="Comparez avant de choisir."
        description="Vérifiez la langue, les critères, la date limite et la source officielle."
        points={[
          "Vérifier les critères du programme.",
          "Regarder la date limite et la langue.",
          "Choisir si vous voulez le suivre dans vos candidatures.",
        ]}
        image={{
          src: "https://images.unsplash.com/photo-1758270704787-615782711641?auto=format&fit=crop&w=1200&q=82",
          alt: "Groupe d’étudiants échangeant dans un amphithéâtre universitaire.",
          credit: "Photo : Vitaly Gariev / Unsplash",
        }}
      />

      <StudentOrientationPanel
        recommendations={recommendations}
        applicationProgramIds={(applications || []).map((application) => application.program_id)}
        applicationStateError={applicationsError ? "Impossible de vérifier vos intérêts enregistrés pour le moment." : undefined}
        criteriaStateError={projectError ? "Impossible de comparer les critères avec votre projet pour le moment." : undefined}
      />
    </main>
  );
}

function OrientationUnavailable() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader current="orientation" eyebrow="Mon dossier" title="Mes programmes" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Orientation temporairement indisponible</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Impossible d’afficher vos programmes pour le moment. Réessayez.
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/student/orientation">Réessayer</ButtonLink>
          <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
