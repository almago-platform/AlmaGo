import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { StudentApplicationsPanel } from "@/components/student/StudentApplicationsPanel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentApplicationsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,status,intake_term:intake,deadline,next_action,required_documents,student_notes,result,submitted_at,created_at,programs(name,degree_level,universities(name,city)),application_events(id,event_type,message,created_at)")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Candidatures"
        title="Suivi des candidatures"
        description="Retrouvez l’état de chaque dossier, les échéances officielles enregistrées et les prochaines actions à traiter."
        actions={<ButtonLink href="/student/orientation" variant="secondary">Voir les recommandations</ButtonLink>}
      />

      <StudentApplicationsPanel
        applications={data || []}
        loadError={error ? "Impossible de charger toutes vos candidatures pour le moment." : undefined}
      />
    </main>
  );
}
