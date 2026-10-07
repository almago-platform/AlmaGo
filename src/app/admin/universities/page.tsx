import { AdminUniversitiesPanel } from "@/components/admin/AdminUniversitiesPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminWorkspaceSummary } from "@/components/admin/AdminWorkspaceSummary";
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
      <AdminWorkspaceSummary
        eyebrow="Catalogue universités"
        title="Établissements de référence"
        description="Recherchez l’établissement existant avant toute création, puis maintenez uniquement les informations utilisées par les parcours AlmaGo."
        metrics={[
          { label: "Total", value: universities.length },
          { label: "Actives", value: activeCount, tone: activeCount ? "success" : "neutral" },
          { label: "Inactives", value: Math.max(universities.length - activeCount, 0) },
        ]}
      />
      <AdminUniversitiesPanel universities={universities} />
    </main>
  );
}
