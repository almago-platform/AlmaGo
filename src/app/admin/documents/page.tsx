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
  const startedAt = performance.now();
  const [documentsResult, evidenceResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id,student_id,category,original_filename,status,admin_comment,created_at")
      .in("status", ["pending", "reviewed", "replace_required", "rejected", "approved"])
      .order("created_at", { ascending: false }),
    supabase
      .from("academic_evidence")
      .select("id,student_id,evidence_type,institution,evidence_date,origin,verification_status,document_id,verified_at,created_at,updated_at")
      .order("updated_at", { ascending: false }),
  ]);

  const queryMs = Math.round(performance.now() - startedAt);

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

  const allDocuments = documentsResult.data || [];
  const latestByStudentCategory = new Map<string, (typeof allDocuments)[number]>();
  for (const document of allDocuments) {
    const key = `${document.student_id}:${document.category}`;
    if (!latestByStudentCategory.has(key)) latestByStudentCategory.set(key, document);
  }
  const rawDocuments = [...latestByStudentCategory.values()].sort((left, right) => {
    const priority = (status: string) =>
      status === "pending" || status === "reviewed" ? 0
        : status === "replace_required" || status === "rejected" ? 1
          : 2;
    return priority(left.status) - priority(right.status)
      || right.created_at.localeCompare(left.created_at);
  });
  const studentIds = [...new Set(rawDocuments.map((document) => document.student_id))];
  const profilesResult = studentIds.length
    ? await supabase.from("profiles").select("id,first_name,last_name").in("id", studentIds)
    : { data: [], error: null };

  const profileById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
  const documents = rawDocuments.map((document) => ({
    ...document,
    profiles: profileById.get(document.student_id) || null,
  }));
  const documentStatusById = new Map(rawDocuments.map((document) => [document.id, document.status]));

  // Opt-in diagnostics contain only timings and aggregate counts, never filenames or personal data.
  if (process.env.ALMAGO_ADMIN_DOCUMENT_PERF_LOG_ENABLED === "true") {
    console.info("[almago:admin-documents:performance]", JSON.stringify({
      queriesMs: queryMs,
      totalMs: Math.round(performance.now() - startedAt),
      visibleDocuments: documents.length,
      evidenceRows: (evidenceResult.data || []).length,
    }));
  }

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Opérations"
        title="Documents"
        description="Traitez la version actuelle de chaque pièce. Les anciennes versions restent conservées dans le Dossier 360°."
      />
      <AdminDocumentsPanel
        documents={documents}
        evidence={(evidenceResult.data || []).map((row) => {
          return toAdminAcademicEvidenceView({
            ...row,
            document_status: documentStatusById.get(row.document_id || "") || null,
          } as AcademicEvidenceStoreRow);
        })}
        evidenceLoadError={Boolean(evidenceResult.error || profilesResult.error)}
      />
    </main>
  );
}
