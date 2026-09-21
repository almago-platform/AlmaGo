import { AdminDocumentsPanel } from "@/components/admin/AdminDocumentsPanel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const supabase = await createClient();
  const { data: documents } = await supabase.from("documents").select("id,category,original_filename,status,admin_comment,created_at,profiles(first_name,last_name)").in("status", ["pending", "replace_required"]).order("created_at", { ascending: true });
  return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Administration</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Revue des documents</h1><p className="mt-2 mb-8 text-slate-600">Les commentaires envoyés ici sont visibles uniquement par l’étudiant concerné.</p><AdminDocumentsPanel documents={documents || []} /></main>;
}
