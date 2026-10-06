import Link from "next/link";
import { DossierHeader } from "@/components/product/DossierHeader";
import { NextActionPanel } from "@/components/product/NextActionPanel";
import { redirect } from "next/navigation";
import { DocumentsPanel } from "@/components/student/DocumentsPanel";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { buttonClassName } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { studentDocumentsCopy } from "@/content/student-documents-copy";
import { rebrandCopy } from "@/lib/brand";
import {
  toStudentAcademicEvidenceView,
  type AcademicEvidenceStoreRow,
} from "@/lib/academic-evidence-store";

export const dynamic = "force-dynamic";

export default async function StudentDocumentsPage() {
  const locale = await getRequestLocale();
  const t = rebrandCopy(studentDocumentsCopy[locale]);
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

  const [documentsResult, historyResult, evidenceResult, requirementsResult] = await Promise.all([
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
    supabase
      .from("student_document_requirements")
      .select("id,label,status,requested_from_student,student_request_reason,student_request_due_date")
      .eq("student_id", user.id)
      .order("created_at", { ascending: true }),
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


  const requirements = requirementsResult.data || [];
  const requestedRequirement = requirements.find((item) =>
    item.requested_from_student && ["requested", "replacement_required"].includes(item.status),
  );
  const approvedCount = (documentsResult.data || []).filter((item) => item.status === "approved").length;
  const reviewCount = (documentsResult.data || []).filter((item) => ["pending", "reviewed"].includes(item.status)).length;
  const correctionCount = (documentsResult.data || []).filter((item) => ["rejected", "replace_required"].includes(item.status)).length;

  return (
    <main className="mx-auto w-full max-w-[92rem] space-y-7 px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <DossierHeader
        eyebrow={t.page.eyebrow}
        title={t.page.title}
        description={t.page.description}
        status={requestedRequirement || correctionCount ? t.summary.actionRequired : reviewCount ? t.priority.reviewBadge : t.summary.nothing}
        statusVariant={requestedRequirement || correctionCount ? "warning" : reviewCount ? "info" : "success"}
        facts={[
          { label: t.summary.approvedTitle, value: approvedCount },
          { label: t.summary.reviewTitle, value: reviewCount },
          { label: t.summary.correctionTitle, value: correctionCount },
          { label: t.priority.tracked, value: requirements.length },
        ]}
        actions={
          <>
            <Link href="/student/procedure" className={buttonClassName("secondary", "min-h-10 px-4 py-2")}>
              {locale === "fr" ? "Voir ma procédure" : locale === "ar" ? "عرض إجراءاتي" : locale === "de" ? "Mein Verfahren" : "View procedure"}
            </Link>
          </>
        }
      />

      <NextActionPanel
        eyebrow={locale === "fr" ? "Action documentaire" : locale === "ar" ? "إجراء الوثائق" : locale === "de" ? "Dokumentenaktion" : "Document action"}
        title={requestedRequirement?.label || (correctionCount ? t.priority.correctionTitle : reviewCount ? t.priority.reviewTitle : t.priority.documentsTitle)}
        description={requestedRequirement?.student_request_reason || (correctionCount ? t.priority.correctionText(correctionCount) : reviewCount ? t.priority.reviewText : t.priority.hasDocumentsText)}
        waiting={!requestedRequirement && !correctionCount}
        metadata={requestedRequirement?.student_request_due_date || undefined}
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
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <DossierHeader eyebrow={copy.page.eyebrow} title={copy.page.title} status={copy.page.unavailableTitle} statusVariant="warning" />
      <PremiumEmptyState
        eyebrow={copy.page.eyebrow}
        title={copy.page.unavailableTitle}
        description={copy.page.unavailableText}
        action={<ButtonLink href="/student/documents">{copy.page.retry}</ButtonLink>}
        secondaryAction={<ButtonLink href="/student" variant="secondary">{copy.page.back}</ButtonLink>}
      />
    </main>
  );
}
