import { AdminApplicationsPanel } from "@/components/admin/AdminApplicationsPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,student_id,program_id,status,intake,deadline,next_action,student_notes,result,created_at,profiles(first_name,last_name),programs(name,universities(name,city))")
    .order("deadline", { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Suivi équipe" title="Candidatures" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">File des candidatures temporairement indisponible</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Nous n’arrivons pas à charger les dossiers pour le moment. Rien n’a été modifié.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Suivi équipe"
        title="Candidatures"
        description="Traitez les dossiers actifs, surveillez les échéances et gardez clairement identifiés les champs qui alimentent l’espace étudiant."
      />
      <AdminApplicationsPanel applications={data || []} />
    </main>
  );
}
