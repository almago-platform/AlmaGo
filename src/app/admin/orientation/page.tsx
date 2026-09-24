import { redirect } from "next/navigation";
import { AdminOrientationPanel } from "@/components/admin/AdminOrientationPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAdminUser } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

export default async function AdminOrientationPage() {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) redirect("/login");
  if (!isAdmin) redirect("/unauthorized");
  const [
    { data: students, error: studentsError },
    { data: programs, error: programsError },
    { data: recommendations, error: recommendationsError },
    { data: studentRoles, error: studentRolesError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,first_name,last_name,target_degree,target_field,study_language,general_average,preferred_cities,onboarding_completed")
      .order("last_name"),
    supabase
      .from("programs")
      .select("id,name,degree_level,field,source_url,application_url,verified_at,is_active,universities(name,city,is_active)")
      .order("name"),
    supabase
      .from("program_recommendations")
      .select("id,student_id,program_id,status,note,is_archived")
      .order("created_at", { ascending: false }),
    supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student"),
  ]);

  if (studentsError || programsError || recommendationsError || studentRolesError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Équipe AlmaGo" title="Orientation des étudiants" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">Orientation temporairement indisponible</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Nous n’arrivons pas à charger les profils, programmes ou pistes d’orientation pour le moment. Rien n’a été modifié.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Équipe AlmaGo"
        title="Orientation des étudiants"
        description="Préparez une piste d’orientation à partir du profil enregistré. Seuls les programmes avec une source officielle et une date de vérification peuvent être publiés pour un étudiant."
      />
      <AdminOrientationPanel
        students={students || []}
        studentRoleIds={(studentRoles || []).map((item) => item.user_id)}
        programs={programs || []}
        recommendations={recommendations || []}
      />
    </main>
  );
}
