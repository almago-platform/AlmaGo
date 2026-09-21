import { StudentOrientationPanel } from "@/components/student/StudentOrientationPanel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentOrientationPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("program_recommendations")
    .select("id,status,note,student_interest_at,programs(id,name,degree_level,field,teaching_language,winter_deadline,summer_deadline,application_url,german_level_required,english_level_required,diploma_required,universities(name,city,bundesland))")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Orientation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Les programmes recommandés pour toi
        </h1>
        <p className="mt-3 text-slate-600">
          Compare les pistes préparées par AlmaGo et indique celles qui t’intéressent. Une recommandation ne garantit jamais une admission.
        </p>
      </div>

      <div className="mt-8">
        <StudentOrientationPanel
          recommendations={data || []}
          loadError={error ? "Impossible de charger tes recommandations pour le moment." : undefined}
        />
      </div>
    </main>
  );
}
