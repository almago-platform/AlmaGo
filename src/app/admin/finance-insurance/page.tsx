import { AdminFinanceInsurancePanel } from "@/components/admin/AdminFinanceInsurancePanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminWorkspaceSummary } from "@/components/admin/AdminWorkspaceSummary";
import { isCatalogVerificationCurrent } from "@/lib/catalog-freshness";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminFinanceInsurancePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_insurance_catalog")
    .select("id,provider_name,product_name,kind,description,official_source_url,application_url,price_notes,eligibility_notes,verified_at,is_active")
    .order("kind")
    .order("provider_name");

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader section="Catalogue Allemagne" title="Finance & assurance" description="Options factuelles vérifiées utilisées dans le parcours étudiant." />
        <AdminLoadError
          title="Le catalogue finance & assurance est temporairement indisponible"
          description="Nous n’arrivons pas à charger les options pour le moment."
          retryHref="/admin/finance-insurance"
        />
      </main>
    );
  }

  const options = data || [];
  const activeCount = options.filter((option) => option.is_active).length;
  const staleCount = options.filter((option) => option.is_active && !isCatalogVerificationCurrent(option.verified_at)).length;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Catalogue Allemagne"
        title="Finance & assurance"
        description="Publiez seulement des informations vérifiées sur des sites officiels. Campus Allemagne ne classe pas les fournisseurs et ne décide pas si un étudiant peut obtenir une aide."
      />
      <AdminWorkspaceSummary
        eyebrow="Catalogue finance"
        title="Options factuelles et revalidation"
        description="Maintenez des informations officielles, datées et sans classement fournisseur ni déduction automatique d’éligibilité."
        metrics={[
          { label: "Options", value: options.length },
          { label: "Actives", value: activeCount, tone: activeCount ? "success" : "neutral" },
          { label: "À revalider", value: staleCount, tone: staleCount ? "warning" : "neutral" },
        ]}
      />
      <AdminFinanceInsurancePanel options={options} />
    </main>
  );
}
