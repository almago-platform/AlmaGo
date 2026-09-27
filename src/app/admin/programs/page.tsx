import { AdminProgramsPanel } from "@/components/admin/AdminProgramsPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader section="Catalogue Allemagne" title="Programmes" description="Catalogue des formations utilisées par l’équipe d’orientation." />
        <AdminLoadError
          title="Le catalogue des programmes est temporairement indisponible"
          description="Nous n’arrivons pas à charger les programmes ou les universités actives pour le moment."
          retryHref="/admin/programs"
        />
      </main>
    );
  }

  const programRows = programs || [];
  const activePrograms = programRows.filter((program) => program.is_active).length;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Catalogue Allemagne"
        title="Programmes"
        description="Recherchez d’abord une formation existante, puis maintenez uniquement ses critères, échéances et sources vérifiées."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Programmes" value={programRows.length} />
        <Metric label="Actifs" value={activePrograms} emphasis />
        <Metric label="Universités actives" value={universities?.length || 0} />
      </div>
      <AdminProgramsPanel programs={programRows} universities={universities || []} />
    </main>
  );
}

function Metric({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-[-0.03em] ${emphasis ? "text-[var(--brand)]" : "text-[var(--foreground)]"}`}>{value}</p>
    </div>
  );
}
