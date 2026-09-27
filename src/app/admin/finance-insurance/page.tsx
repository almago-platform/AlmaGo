import { AdminFinanceInsurancePanel } from "@/components/admin/AdminFinanceInsurancePanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Catalogue Allemagne"
        title="Finance & assurance"
        description="Publiez uniquement des informations factuelles appuyées par une source officielle. AlmaGo ne classe pas les fournisseurs et ne déduit pas l’éligibilité d’un étudiant."
      />
      <AdminFinanceInsurancePanel options={data || []} />
    </main>
  );
}
