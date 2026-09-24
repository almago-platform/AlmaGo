import { AdminOrientationPanel } from "@/components/admin/AdminOrientationPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Équipe AlmaGo" title="Orientation des étudiants" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">Orientation temporairement indisponible</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Nous n’arrivons pas à charger les profils, programmes ou recommandations pour le moment. Rien n’a été modifié.
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
