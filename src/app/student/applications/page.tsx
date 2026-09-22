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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <PageHeader
        badge="Candidatures"
        title="Ton suivi de candidatures"
        description="Retrouve les statuts, échéances et prochaines actions de chaque dossier au même endroit."
      />

      <StudentApplicationsPanel
        applications={data || []}
        loadError={error ? "Impossible de charger toutes tes candidatures pour le moment." : undefined}
      />
    </main>
  );
}
