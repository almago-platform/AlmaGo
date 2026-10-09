import { AdminProgramsPanel } from "@/components/admin/AdminProgramsPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminWorkspaceSummary } from "@/components/admin/AdminWorkspaceSummary";
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
        description="Cherchez d’abord une formation. Vérifiez ses conditions, ses dates et ses sources avant de modifier la fiche."
      />
      <AdminWorkspaceSummary
        eyebrow="Catalogue programmes"
        title="Formations utilisées par l’orientation"
        description="Maintenez les programmes actifs, leurs critères et les universités disponibles sans transformer une donnée catalogue en décision d’admission."
        metrics={[
          { label: "Programmes", value: programRows.length },
          { label: "Actifs", value: activePrograms, tone: activePrograms ? "success" : "neutral" },
          { label: "Universités actives", value: universities?.length || 0 },
        ]}
      />
      <AdminProgramsPanel programs={programRows} universities={universities || []} />
    </main>
  );
}
