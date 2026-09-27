import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import { StudentApplicationsPanel } from "@/components/student/StudentApplicationsPanel";
import { StudentGuidancePanel } from "@/components/student/StudentGuidancePanel";
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
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader
        current="applications"
        eyebrow="Mon dossier"
        title="Mes candidatures"
        description="Retrouvez chaque dossier, son échéance, sa prochaine action et l’historique visible du suivi enregistré dans AlmaGo."
        actions={<ButtonLink href="/student/orientation" variant="secondary">Voir les recommandations</ButtonLink>}
      />

      <StudentGuidancePanel
        eyebrow="Suivre sans se perdre"
        title="Traitez chaque candidature comme un dossier avec une prochaine action claire."
        description="Vous n’avez pas besoin de mémoriser tous les statuts et toutes les dates. AlmaGo les rassemble pour que vous puissiez reprendre chaque candidature là où elle en est."
        points={[
          "Identifier le statut actuellement enregistré.",
          "Regarder la prochaine action et l’échéance associée.",
          "Consulter l’historique avant de poursuivre le dossier.",
        ]}
      />

      <StudentApplicationsPanel applications={data || []} />
    </main>
  );
}

function ApplicationsUnavailable() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader current="applications" eyebrow="Mon dossier" title="Mes candidatures" />
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
