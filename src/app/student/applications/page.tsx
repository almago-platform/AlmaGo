import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StudentApplicationsPanel } from "@/components/student/StudentApplicationsPanel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentApplicationsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,status,intake_term:intake,deadline,next_action,required_documents,student_notes,result,submitted_at,created_at,programs(name,degree_level,universities(name,city)),application_events(id,event_type,message,created_at)")
    .order("created_at", { ascending: false });

  if (error) {
    return <ApplicationsUnavailable />;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Candidatures"
        title="Suivi des candidatures"
        description="Retrouvez le statut, l’échéance et surtout la prochaine action enregistrée pour chaque candidature."
        actions={<ButtonLink href="/student/orientation" variant="secondary">Voir les recommandations</ButtonLink>}
      />

      <StudentApplicationsPanel applications={data || []} />
    </main>
  );
}

function ApplicationsUnavailable() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader badge="Candidatures" title="Suivi des candidatures" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Candidatures temporairement indisponibles</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Impossible de charger vos candidatures pour le moment. Aucun statut ni dossier n’a été supprimé : les données sont simplement indisponibles à l’affichage.
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/student/applications">Réessayer</ButtonLink>
          <ButtonLink href="/student/orientation" variant="secondary">Voir mes recommandations</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
