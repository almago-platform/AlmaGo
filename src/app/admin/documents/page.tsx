import { AdminDocumentsPanel } from "@/components/admin/AdminDocumentsPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
      .select("id,student_id,category,original_filename,status,admin_comment,created_at")
      .in("status", ["pending", "replace_required", "approved"])
      .order("created_at", { ascending: true }),
    supabase
      .from("academic_evidence")
      .select("id,student_id,evidence_type,institution,evidence_date,origin,verification_status,document_id,verified_at,created_at,updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  if (documentsResult.error) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader
          section="Opérations"
          title="Documents"
          description="File de vérification des pièces qui peuvent bloquer ou ralentir le dossier étudiant."
        />
        <AdminLoadError
          title="La file documentaire est temporairement indisponible"
          description="Nous n’arrivons pas à charger les documents à traiter pour le moment."
          retryHref="/admin/documents"
        />
      </main>
    );
  }

  const rawDocuments = documentsResult.data || [];
  const studentIds = [...new Set(rawDocuments.map((document) => document.student_id))];
  const profilesResult = studentIds.length
    ? await supabase.from("profiles").select("id,first_name,last_name").in("id", studentIds)
    : { data: [], error: null };

  const profileById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
  const documents = rawDocuments.map((document) => ({
    ...document,
    profiles: profileById.get(document.student_id) || null,
  }));

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Opérations"
        title="Documents"
        description="Traitez les pièces en attente, consultez le contexte du dossier et gardez explicite tout message qui sera visible par l’étudiant."
      />
      <AdminDocumentsPanel
        documents={documents}
        evidence={(evidenceResult.data || []).map((row) => {
          const document = rawDocuments.find((item) => item.id === row.document_id);
          return toAdminAcademicEvidenceView({
            ...row,
            document_status: document?.status || null,
          } as AcademicEvidenceStoreRow);
        })}
        evidenceLoadError={Boolean(evidenceResult.error || profilesResult.error)}
      />
    </main>
  );
}
