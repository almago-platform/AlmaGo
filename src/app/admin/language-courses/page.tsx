import { AdminLanguageCoursesPanel } from "@/components/admin/AdminLanguageCoursesPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLanguageCoursesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("language_courses")
    .select("id,title,provider_name,city,language,purpose,level_from,level_to,hours_per_week,starts_on,ends_on,price_cents,currency,source_url,application_url,verified_at,is_active")
    .order("title");

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Catalogue Allemagne" title="Cours de langue" />
        <Card><div role="alert"><h2 className="text-xl font-bold text-slate-950">Catalogue temporairement indisponible</h2><p className="mt-2 text-sm text-slate-600">Aucune donnée n’a été modifiée.</p></div></Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Catalogue Allemagne"
        title="Cours de langue"
        description="Maintenez uniquement des cours sourcés et datés. Distinguez explicitement la préparation aux études d’un séjour linguistique autonome."
      />
      <AdminLanguageCoursesPanel courses={data || []} />
    </main>
  );
}
