import { redirect } from "next/navigation";
import { AdminStudentCase } from "@/components/admin/AdminStudentCase";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAdminUser } from "@/lib/auth/access";
import { isUuid } from "@/lib/identifiers";

export const dynamic = "force-dynamic";

export default async function AdminStudentCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) redirect("/login");
  if (!isAdmin) redirect("/unauthorized");

  const { id } = await params;
  if (!isUuid(id)) return <StudentNotFound />;

  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", id)
    .eq("role", "student")
    .maybeSingle();

  if (roleError) return <StudentCaseUnavailable />;
  if (!role) return <StudentNotFound />;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,first_name,last_name,birth_date,nationality,current_city,last_diploma,bac_track,bac_year,general_average,institution,current_university_studies,current_field,university_semesters,german_level,english_level,french_level,target_degree,target_field,study_language,target_intake,preferred_cities,budget_range,onboarding_completed")
    .eq("id", id)
    .maybeSingle();

  if (profileError) return <StudentCaseUnavailable />;
  if (!profile) return <StudentNotFound />;

  const [
    { data: documents, error: documentsError },
    { data: checklist, error: checklistError },
    { data: recommendations, error: recommendationsError },
    { data: applications, error: applicationsError },
    { data: history, error: historyError },
    { data: adminNotes, error: adminNotesError },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("id,category,original_filename,status,admin_comment,reviewed_at,created_at")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("student_checklist_items")
      .select("id,title,description,due_date,status,completed_at,created_at")
      .eq("student_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("program_recommendations")
      .select("id,status,note,is_archived,created_at,programs(id,name,degree_level,field,source_url,application_url,verified_at,is_active,universities(name,city,is_active))")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id,status,intake,deadline,submitted_at,next_action,required_documents,student_notes,result,reviewed_at,created_at,programs(name,degree_level,universities(name,city)),application_events(id,event_type,message,visible_to_student,created_at)")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("student_history")
      .select("id,event_type,message,created_at")
      .eq("student_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("admin_notes")
      .select("id,note,created_at,updated_at")
      .eq("student_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (documentsError || checklistError || recommendationsError || applicationsError || historyError) {
    return <StudentCaseUnavailable />;
  }

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Étudiant";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Dossier étudiant"
        title={name}
        description="Vue transversale du dossier. Les informations visibles par l’étudiant et les notes internes AlmaGo restent explicitement séparées."
        actions={<ButtonLink href="/admin/students" variant="secondary">Retour aux étudiants</ButtonLink>}
      />

      <AdminStudentCase
        profile={profile}
        documents={documents || []}
        checklist={checklist || []}
        recommendations={recommendations || []}
        applications={applications || []}
        history={history || []}
        adminNotes={adminNotes || []}
        adminNotesUnavailable={Boolean(adminNotesError)}
      />
    </main>
  );
}

function StudentNotFound() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader badge="Dossier étudiant" title="Dossier étudiant introuvable" />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Ce dossier étudiant n’est pas disponible. Vérifiez la liste des étudiants puis ouvrez le dossier depuis cette page.
        </p>
        <div className="mt-5">
          <ButtonLink href="/admin/students">Retour aux étudiants</ButtonLink>
        </div>
      </Card>
    </main>
  );
}

function StudentCaseUnavailable() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader badge="Dossier étudiant" title="Dossier temporairement indisponible" />
      <Card>
        <div role="alert">
          <p className="text-sm leading-6 text-slate-600">
            Nous n’arrivons pas à charger ce dossier pour le moment. Rien n’a été modifié.
          </p>
        </div>
        <div className="mt-5">
          <ButtonLink href="/admin/students" variant="secondary">Retour aux étudiants</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
