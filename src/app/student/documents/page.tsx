import { PageHeader } from "@/components/ui/PageHeader";
import { redirect } from "next/navigation";
import { DocumentsPanel } from "@/components/student/DocumentsPanel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentDocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  const [documentsResult, historyResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id,category,original_filename,size_bytes,status,admin_comment,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("student_history")
      .select("id,message,created_at")
      .like("event_type", "document_%")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const loadError = documentsResult.error || historyResult.error
    ? "Certaines informations du dossier n’ont pas pu être chargées."
    : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <PageHeader
        badge="Documents"
        title="Mon dossier documentaire"
        description="Dépose les pièces demandées, suis leur vérification et retrouve les retours AlmaGo au même endroit."
      />
      <DocumentsPanel
        documents={documentsResult.data || []}
        history={historyResult.data || []}
        loadError={loadError}
      />
    </main>
  );
}
