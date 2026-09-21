import { redirect } from "next/navigation";
import { DocumentsPanel } from "@/components/student/DocumentsPanel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentDocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle();
  if (!profile?.onboarding_completed) redirect("/student/onboarding");
  const [{ data: documents }, { data: history }] = await Promise.all([
    supabase.from("documents").select("id,category,original_filename,size_bytes,status,admin_comment,created_at").order("created_at", { ascending: false }),
    supabase.from("student_history").select("id,message,created_at").like("event_type", "document_%").order("created_at", { ascending: false }).limit(10),
  ]);
  return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Documents</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Mon dossier documentaire</h1><p className="mt-2 mb-8 text-slate-600">Partage uniquement les pièces demandées pour ton dossier AlmaGo.</p><DocumentsPanel documents={documents || []} history={history || []} /></main>;
}
