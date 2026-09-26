import { PageHeader } from "@/components/ui/PageHeader";
import { redirect } from "next/navigation";
import { DocumentsPanel } from "@/components/student/DocumentsPanel";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import {
  toStudentAcademicEvidenceView,
  type AcademicEvidenceStoreRow,
} from "@/lib/academic-evidence-store";

export const dynamic = "force-dynamic";

export default async function StudentDocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return <DocumentsUnavailable />;
  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  const [documentsResult, historyResult, evidenceResult] = await Promise.all([
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
    supabase
      .from("academic_evidence")
      .select("id,student_id,evidence_type,institution,evidence_date,origin,verification_status,document_id,verified_at,created_at,updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  if (documentsResult.error) return <DocumentsUnavailable />;

  const documentStatusById = new Map(
    (documentsResult.data || []).map((document) => [document.id, document.status]),
  );
  const evidence = (evidenceResult.data || []).map((row) =>
    toStudentAcademicEvidenceView({
      ...row,
      document_status: row.document_id
        ? documentStatusById.get(row.document_id) || null
        : null,
    } as AcademicEvidenceStoreRow),
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Documents"
        title="Vos documents"
        description="Voyez immédiatement ce qui est validé, ce qui est en vérification et ce qui demande une action de votre part."
      />
      <DocumentsPanel
        documents={documentsResult.data || []}
        history={historyResult.data || []}
        historyLoadError={Boolean(historyResult.error)}
        evidence={evidence}
        evidenceLoadError={Boolean(evidenceResult.error)}
      />
    </main>
  );
}

function DocumentsUnavailable() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <PageHeader badge="Documents" title="Vos documents" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Documents temporairement indisponibles</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Impossible de charger vos documents pour le moment. Aucun document n’a été supprimé ou remplacé. Vous pouvez relancer le chargement ou revenir à votre dossier.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/student/documents">Réessayer</ButtonLink>
          <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
