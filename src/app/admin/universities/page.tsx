import { AdminUniversitiesPanel } from "@/components/admin/AdminUniversitiesPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminUniversitiesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("universities").select("*").order("name");
  const universities = data || [];
  const activeCount = universities.filter((university) => university.is_active).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Catalogue"
        title="Universités allemandes"
        description="Construisez un catalogue fiable, activable et réutilisable dans les recommandations AlmaGo."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <p className="text-sm font-semibold text-slate-500">Total catalogue</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{universities.length}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-sm font-semibold text-slate-500">Actives</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{activeCount}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-sm font-semibold text-slate-500">À vérifier</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{Math.max(universities.length - activeCount, 0)}</p>
        </Card>
      </div>

      <AdminUniversitiesPanel universities={universities} />
    </main>
  );
}
