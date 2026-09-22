import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { AdminApplicationsPanel } from "@/components/admin/AdminApplicationsPanel";
export const dynamic = "force-dynamic";
export default async function AdminApplicationsPage() { const supabase = await createClient(); const { data } = await supabase.from("applications").select("id,student_id,program_id,status,intake,deadline,next_action,student_notes,result,created_at,profiles(first_name,last_name),programs(name,universities(name,city))").order("deadline", { ascending: true, nullsFirst: false }); return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12"><PageHeader badge="Suivi équipe" title="Candidatures" description="Pilote les prochaines actions, échéances et décisions communiquées aux étudiants." /><AdminApplicationsPanel applications={data || []} /></main>; }
