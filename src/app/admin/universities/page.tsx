import { AdminUniversitiesPanel } from "@/components/admin/AdminUniversitiesPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminUniversitiesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("universities").select("*").order("name");

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader section="Catalogue Allemagne" title="Universités" description="Catalogue des établissements utilisés par les parcours et recommandations AlmaGo." />
        <AdminLoadError
          title="Le catalogue des universités est temporairement indisponible"
          description="Nous n’arrivons pas à charger les établissements pour le moment."
          retryHref="/admin/universities"
        />
      </main>
    );
  }

  const universities = data || [];
  const activeCount = universities.filter((university) => university.is_active).length;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Catalogue Allemagne"
        title="Universités"
        description="Recherchez d’abord l’établissement à maintenir, puis ajoutez ou modifiez uniquement les informations vérifiées."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Total" value={universities.length} />
        <Metric label="Actives" value={activeCount} emphasis />
        <Metric label="Inactives" value={Math.max(universities.length - activeCount, 0)} />
      </div>
      <AdminUniversitiesPanel universities={universities} />
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
