import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { StudentOrientationPanel } from "@/components/student/StudentOrientationPanel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentOrientationPage() {
  const supabase = await createClient();
  const [{ data, error }, { data: applications, error: applicationsError }] = await Promise.all([
    supabase
      .from("program_recommendations")
      .select("id,status,note,student_interest_at,programs(id,name,degree_level,field,teaching_language,winter_deadline,summer_deadline,application_url,german_level_required,english_level_required,diploma_required,universities(name,city,bundesland))")
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    supabase.from("applications").select("program_id"),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Orientation"
        title="Programmes recommandés"
        description="Comparez les pistes préparées par AlmaGo, vérifiez les critères principaux et indiquez les programmes qui vous intéressent. Une recommandation reste une piste de travail, pas une garantie d’admission."
        actions={<ButtonLink href="/student/applications" variant="secondary">Mes candidatures</ButtonLink>}
      />

      <StudentOrientationPanel
        recommendations={data || []}
        applicationProgramIds={(applications || []).map((application) => application.program_id)}
        loadError={error ? "Impossible de charger vos recommandations pour le moment." : undefined}
        applicationStateError={applicationsError ? "Impossible de vérifier vos intérêts enregistrés pour le moment." : undefined}
      />
    </main>
  );
}
