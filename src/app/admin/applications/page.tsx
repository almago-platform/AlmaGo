import { AdminApplicationsPanel } from "@/components/admin/AdminApplicationsPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const requestedStudentId = (params.student || "").trim();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,student_id,program_id,status,intake,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,next_action,required_documents,student_notes,result,submitted_at,created_at,programs(name,universities(name,city)),application_events(id,event_type,message,visible_to_student,created_at)")
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

  const rawApplications = data || [];
  const studentIds = [...new Set(rawApplications.map((application) => application.student_id))];
  const profilesResult = studentIds.length
    ? await supabase.from("profiles").select("id,first_name,last_name").in("id", studentIds)
    : { data: [], error: null };

  const profileById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
  const applications = rawApplications.map((application) => ({
    ...application,
    profiles: profileById.get(application.student_id) || null,
  }));

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Opérations"
        title="Candidatures"
        description="Traitez les dossiers actifs, surveillez les échéances et gardez clairement identifiés les champs qui alimentent l’espace étudiant."
      />
      {profilesResult.error && (
        <p role="status" className="mb-4 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Les candidatures sont chargées, mais certains noms d’étudiants peuvent être indisponibles temporairement.
        </p>
      )}
      <AdminApplicationsPanel applications={applications} initialStudentId={requestedStudentId} />
    </main>
  );
}
