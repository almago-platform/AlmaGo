import { AdminApplicationsPanel } from "@/components/admin/AdminApplicationsPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,student_id,program_id,status,intake,deadline,next_action,required_documents,student_notes,result,submitted_at,created_at,profiles(first_name,last_name),programs(name,universities(name,city)),application_events(id,event_type,message,visible_to_student,created_at)")
    .order("deadline", { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader
          section="Opérations"
          title="Candidatures"
          description="Suivi des dossiers, des échéances et des prochaines actions."
        />
        <AdminLoadError
          title="La file des candidatures est temporairement indisponible"
          description="Nous n’arrivons pas à charger les dossiers pour le moment."
          retryHref="/admin/applications"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Opérations"
        title="Candidatures"
        description="Traitez les dossiers actifs, surveillez les échéances et gardez clairement identifiés les champs qui alimentent l’espace étudiant."
      />
      <AdminApplicationsPanel applications={data || []} />
    </main>
  );
}
