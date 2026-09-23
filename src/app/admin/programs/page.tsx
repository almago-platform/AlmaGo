import { AdminProgramsPanel } from "@/components/admin/AdminProgramsPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProgramsPage() {
  const supabase = await createClient();
  const [{ data: programs, error: programsError }, { data: universities, error: universitiesError }] = await Promise.all([
    supabase.from("programs").select("*, universities(name,city)").order("name"),
    supabase.from("universities").select("id,name").eq("is_active", true).order("name"),
  ]);

  if (programsError || universitiesError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <PageHeader badge="Catalogue" title="Programmes d’études" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-semibold text-slate-950">Catalogue indisponible</h2>
            <p className="mt-2 text-sm text-slate-600">Impossible de charger les programmes. Réessayez dans quelques instants.</p>
          </div>
        </Card>
      </main>
    );
  }

  const programRows = programs || [];
  const activePrograms = programRows.filter((program) => program.is_active).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Catalogue"
        title="Programmes d’études"
        description="Centralisez les conditions, langues, échéances et liens utilisés par l’équipe d’orientation."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <p className="text-sm font-semibold text-slate-500">Programmes</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{programRows.length}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-sm font-semibold text-slate-500">Actifs</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{activePrograms}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-sm font-semibold text-slate-500">Universités actives</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{universities?.length || 0}</p>
        </Card>
      </div>

      <AdminProgramsPanel programs={programRows} universities={universities || []} />
    </main>
  );
}
