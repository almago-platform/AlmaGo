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
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Candidatures</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Ton suivi de candidatures</h1>
        <p className="mt-3 text-slate-600">
          Retrouve les statuts, échéances et prochaines actions de chaque dossier au même endroit.
        </p>
      </div>

      <div className="mt-8">
        <StudentApplicationsPanel
          applications={data || []}
          loadError={error ? "Impossible de charger toutes tes candidatures pour le moment." : undefined}
        />
      </div>
    </main>
  );
}
