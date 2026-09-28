import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import { redirect } from "next/navigation";
import { DocumentsPanel } from "@/components/student/DocumentsPanel";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { studentDocumentsCopy } from "@/content/student-documents-copy";
import {
  toStudentAcademicEvidenceView,
  type AcademicEvidenceStoreRow,
} from "@/lib/academic-evidence-store";

export const dynamic = "force-dynamic";

export default async function StudentDocumentsPage() {
  const locale = await getRequestLocale();
  const t = studentDocumentsCopy[locale];
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

  if (profileError) return <DocumentsUnavailable copy={t} />;
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

  if (documentsResult.error) return <DocumentsUnavailable copy={t} />;

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
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader
        current="documents"
        eyebrow={t.page.eyebrow}
        title={t.page.title}
        description={t.page.description}
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

function DocumentsUnavailable({ copy }: { copy: (typeof studentDocumentsCopy)["fr"] }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader current="documents" eyebrow={copy.page.eyebrow} title={copy.page.title} />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">{copy.page.unavailableTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy.page.unavailableText}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/student/documents">{copy.page.retry}</ButtonLink>
          <ButtonLink href="/student" variant="secondary">{copy.page.back}</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
