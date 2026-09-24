import { AdminProgramsPanel } from "@/components/admin/AdminProgramsPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ quality?: string }>;
}) {
  const { quality } = await searchParams;
  const supabase = await createClient();
  const [{ data: programs, error: programsError }, { data: universities, error: universitiesError }] = await Promise.all([
    supabase.from("programs").select("*, universities(name,city)").order("name"),
    supabase.from("universities").select("id,name").eq("is_active", true).order("name"),
  ]);

  if (programsError || universitiesError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Catalogue" title="Programmes d’études" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">Catalogue temporairement indisponible</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Nous n’arrivons pas à charger les programmes pour le moment. Rien n’a été modifié.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  const programRows = programs || [];
  const activePrograms = programRows.filter((program) => program.is_active).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Catalogue"
        title="Programmes d’études"
        description="Maintenez les informations utilisées par l’équipe d’orientation : structure des études, critères enregistrés, échéances et source officielle."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <p className="text-sm font-bold text-slate-700">Programmes</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{programRows.length}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-sm font-bold text-slate-700">Actifs</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--brand)]">{activePrograms}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-sm font-bold text-slate-700">Universités actives</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{universities?.length || 0}</p>
        </Card>
      </div>

      <AdminProgramsPanel programs={programRows} universities={universities || []} initialQuality={quality} />
    </main>
  );
}
