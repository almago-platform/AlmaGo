import { AdminUniversitiesPanel } from "@/components/admin/AdminUniversitiesPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminUniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ quality?: string }>;
}) {
  const { quality } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("universities")
    .select("id,name,city,bundesland,university_type,website_url,source_url,verified_at,logo_url,description,is_public,tuition_notes,is_active")
    .order("name");

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Catalogue" title="Universités allemandes" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">Catalogue temporairement indisponible</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Nous n’arrivons pas à charger les universités pour le moment. Rien n’a été modifié.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  const universities = data || [];
  const activeCount = universities.filter((university) => university.is_active).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Catalogue"
        title="Universités allemandes"
        description="Maintenez un catalogue fiable d’établissements actifs, de liens officiels et d’informations utiles à l’orientation AlmaGo."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <p className="text-sm font-bold text-slate-700">Total catalogue</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{universities.length}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-sm font-bold text-slate-700">Actives</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--brand)]">{activeCount}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-sm font-bold text-slate-700">Inactives</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{Math.max(universities.length - activeCount, 0)}</p>
        </Card>
      </div>

      <AdminUniversitiesPanel universities={universities} initialQuality={quality} />
    </main>
  );
}
