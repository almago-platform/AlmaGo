import { AdminFinanceInsurancePanel } from "@/components/admin/AdminFinanceInsurancePanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Catalogue Allemagne" title="Financement et assurance" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">Catalogue temporairement indisponible</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Aucune donnée n’a été modifiée.</p>
          </div>
        </Card>
      </main>
    );
  }

  const options = data || [];
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Catalogue Allemagne"
        title="Financement et assurance"
        description="Publiez uniquement des informations factuelles appuyées par une source officielle. AlmaGo ne doit ni classer les fournisseurs ni déduire l’éligibilité d’un étudiant."
      />
      <AdminFinanceInsurancePanel options={options} />
    </main>
  );
}
