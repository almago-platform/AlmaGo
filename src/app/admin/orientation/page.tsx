import { AdminOrientationPanel } from "@/components/admin/AdminOrientationPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOrientationPage() {
  const supabase = await createClient();
  const [
    { data: students, error: studentsError },
    { data: programs, error: programsError },
    { data: recommendations, error: recommendationsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,first_name,last_name,target_degree,target_field,study_language,general_average,preferred_cities,onboarding_completed")
      .order("last_name"),
    supabase
      .from("programs")
      .select("id,name,degree_level,field,universities(name,city)")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("program_recommendations")
      .select("id,student_id,program_id,status,note,is_archived")
      .order("created_at", { ascending: false }),
  ]);

  if (studentsError || programsError || recommendationsError) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader section="Opérations" title="Orientation" description="Préparation et publication des recommandations étudiantes." />
        <AdminLoadError
          title="L’orientation est temporairement indisponible"
          description="Nous n’arrivons pas à charger les profils, programmes ou recommandations pour le moment."
          retryHref="/admin/orientation"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Opérations"
        title="Orientation"
        description="Préparez une recommandation à partir du profil enregistré, documentez les éléments vérifiés et gardez explicite la frontière entre orientation et décision d’admission."
      />
      <AdminOrientationPanel
        students={students || []}
        programs={programs || []}
        recommendations={recommendations || []}
      />
    </main>
  );
}
