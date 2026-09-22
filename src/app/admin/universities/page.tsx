import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { AdminUniversitiesPanel } from "@/components/admin/AdminUniversitiesPanel";

export const dynamic = "force-dynamic";

export default async function AdminUniversitiesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("universities").select("*").order("name");
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12"><PageHeader badge="Catalogue" title="Universités allemandes" description="Construis un catalogue fiable, activable et réutilisable dans les recommandations." /><AdminUniversitiesPanel universities={data || []} /></main>;
}
