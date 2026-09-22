import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { AdminProgramsPanel } from "@/components/admin/AdminProgramsPanel";
export const dynamic = "force-dynamic";
export default async function AdminProgramsPage() { const supabase = await createClient(); const [{ data: programs }, { data: universities }] = await Promise.all([supabase.from("programs").select("*, universities(name,city)").order("name"), supabase.from("universities").select("id,name").eq("is_active", true).order("name")]); return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12"><PageHeader badge="Catalogue" title="Programmes d’études" description="Centralise les conditions et échéances utilisées par l’équipe d’orientation." /><AdminProgramsPanel programs={programs || []} universities={universities || []} /></main>; }
