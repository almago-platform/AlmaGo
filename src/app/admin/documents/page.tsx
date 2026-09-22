import { PageHeader } from "@/components/ui/PageHeader";
import { AdminDocumentsPanel } from "@/components/admin/AdminDocumentsPanel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const supabase = await createClient();
  const { data: documents } = await supabase.from("documents").select("id,category,original_filename,status,admin_comment,created_at,profiles(first_name,last_name)").in("status", ["pending", "replace_required"]).order("created_at", { ascending: true });
  return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12"><PageHeader badge="Administration" title="Revue des documents" description="Les commentaires envoyés ici sont visibles uniquement par l’étudiant concerné." /><AdminDocumentsPanel documents={documents || []} /></main>;
}
