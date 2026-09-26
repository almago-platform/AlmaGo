import { AdminDocumentsPanel } from "@/components/admin/AdminDocumentsPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import {
  toAdminAcademicEvidenceView,
  type AcademicEvidenceStoreRow,
} from "@/lib/academic-evidence-store";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const supabase = await createClient();
  const [documentsResult, evidenceResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id,student_id,category,original_filename,status,admin_comment,created_at,profiles(first_name,last_name)")
      .in("status", ["pending", "replace_required", "approved"])
      .order("created_at", { ascending: true }),
    supabase
      .from("academic_evidence")
      .select("id,student_id,evidence_type,institution,evidence_date,origin,verification_status,document_id,verified_at,created_at,updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  if (documentsResult.error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <PageHeader badge="Administration" title="Revue des documents" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">File documentaire temporairement indisponible</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Nous n’arrivons pas à charger les documents à traiter pour le moment. Rien n’a été modifié.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Administration"
        title="Revue des documents"
        description="Traitez les pièces en attente, consultez le contexte du dossier et gardez explicite tout message qui sera visible par l’étudiant."
      />
      <AdminDocumentsPanel
        documents={documentsResult.data || []}
        evidence={(evidenceResult.data || []).map((row) => {
          const document = (documentsResult.data || []).find((item) => item.id === row.document_id);
          return toAdminAcademicEvidenceView({
            ...row,
            document_status: document?.status || null,
          } as AcademicEvidenceStoreRow);
        })}
        evidenceLoadError={Boolean(evidenceResult.error)}
      />
    </main>
  );
}
