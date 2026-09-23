import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
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

  if (error) {
    return <OrientationUnavailable />;
  }

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
        applicationStateError={applicationsError ? "Impossible de vérifier vos intérêts enregistrés pour le moment." : undefined}
      />
    </main>
  );
}

function OrientationUnavailable() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader badge="Orientation" title="Programmes recommandés" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Orientation temporairement indisponible</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Impossible de charger vos recommandations pour le moment. Cela ne signifie pas que votre dossier ne contient aucune recommandation.
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
