import { AdminOrientationPanel } from "@/components/admin/AdminOrientationPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOrientationPage() {
  const supabase = await createClient();
  const [{ data: students }, { data: programs }, { data: recommendations }] = await Promise.all([
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

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Équipe AlmaGo"
        title="Orientation des étudiants"
        description="Préparez, justifiez et suivez les recommandations publiées. La recommandation accompagne l’orientation ; elle ne constitue pas une décision d’admission."
      />
      <AdminOrientationPanel
        students={students || []}
        programs={programs || []}
        recommendations={recommendations || []}
      />
    </main>
  );
}
