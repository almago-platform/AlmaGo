"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentDocumentsCopy } from "@/content/student-documents-copy";
import { studentDocumentsWorkspaceCopy } from "@/content/student-documents-workspace-copy";
import { rebrandCopy } from "@/lib/brand";
import {
  documentCategories,
  removableDocumentStatuses,
} from "@/lib/documents";

type StudentDocument = {
  id: string;
  category: string;
  original_filename: string;
  size_bytes: number;
  status: string;
  admin_comment: string | null;
  created_at: string;
};

type HistoryEvent = { id: string; message: string; created_at: string };

type StudentEvidence = {
  id: string;
  type: string;
  institution: string | null;
  evidence_date: string | null;
  origin: string;
  verification_status: string;
  document_id: string | null;
  document_status: string | null;
  verified_at: string | null;
  assessment: {
    status: string;
    basis: string;
    can_support_pathway_decision: boolean;
    reason: string;
  };
};

type Feedback = { message: string; kind: "success" | "error" } | null;

function statusVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "approved") return "success";
  if (status === "rejected" || status === "replace_required") return "warning";
  if (status === "pending" || status === "reviewed") return "info";
  return "neutral";
}

function formatFileSize(sizeBytes: number, copy: (typeof studentDocumentsCopy)["fr"]) {
  if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(1)} ${copy.fileSizes.mb}`;
  return `${Math.ceil(sizeBytes / 1024)} ${copy.fileSizes.kb}`;
}

function evidenceTypeLabel(type: string, copy: (typeof studentDocumentsCopy)["fr"]) {
  return copy.evidenceTypes[type] || copy.evidenceTypes.other;
}

function evidenceStatusLabel(status: string, copy: (typeof studentDocumentsCopy)["fr"]) {
  return copy.evidenceStatuses[status] || copy.evidenceStatuses.other;
}

function evidenceStatusVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "accepted_for_pathway") return "success";
  if (status === "replace_required") return "warning";
  if (status === "received" || status === "needs_review") return "info";
  return "neutral";
}

function formatEvidenceDate(value: string | null, copy: (typeof studentDocumentsCopy)["fr"]) {
  if (!value) return copy.unknown;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return copy.unknown;
  return new Intl.DateTimeFormat(copy.intlLocale, { dateStyle: "medium" }).format(date);
}

export function DocumentsPanel({
  documents,
  history,
  historyLoadError = false,
  evidence,
  evidenceLoadError = false,
}: {
  documents: StudentDocument[];
  history: HistoryEvent[];
  historyLoadError?: boolean;
  evidence: StudentEvidence[];
  evidenceLoadError?: boolean;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = rebrandCopy(studentDocumentsCopy[locale]);
  const workspace = studentDocumentsWorkspaceCopy[locale];
  const fileInput = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("passport");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "action" | "review" | "approved">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const approvedCount = documents.filter((document) => document.status === "approved").length;
  const reviewCount = documents.filter((document) => ["pending", "reviewed"].includes(document.status)).length;
  const correctionDocuments = documents.filter((document) => ["rejected", "replace_required"].includes(document.status));
  const correctionCount = correctionDocuments.length;
  const latestDocument = documents[0];
  const priorityDocument = correctionDocuments[0] || documents.find((document) => document.status === "pending") || latestDocument;
  const checklistDefinitions = [
    { id: "identity", label: workspace.groups.identity, categories: ["passport"] },
    { id: "academic", label: workspace.groups.academic, categories: ["baccalaureate", "transcripts", "university_attestation"] },
    { id: "languages", label: workspace.groups.languages, categories: ["language_certificate"] },
    { id: "application", label: workspace.groups.application, categories: ["cv", "motivation_letter", "translation"] },
    { id: "visa", label: workspace.groups.visa, categories: ["admission"] },
  ];
  const checklist = checklistDefinitions.map((group) => {
    const items = documents.filter((document) => group.categories.includes(document.category));
    const ready = items.filter((document) => document.status === "approved").length;
    const needsAction = items.some((document) => ["rejected", "replace_required"].includes(document.status));
    const reviewing = items.some((document) => ["pending", "reviewed"].includes(document.status));
    return { ...group, items, ready, needsAction, reviewing };
  });

  const visibleDocuments = documents.filter((document) => {
    const matchesStatus =
      statusFilter === "all"
      || (statusFilter === "action" && ["rejected", "replace_required"].includes(document.status))
      || (statusFilter === "review" && ["pending", "reviewed"].includes(document.status))
      || (statusFilter === "approved" && document.status === "approved");
    const group = checklistDefinitions.find((item) => item.id === categoryFilter);
    const matchesCategory = categoryFilter === "all" || Boolean(group?.categories.includes(document.category));
    return matchesStatus && matchesCategory;
  });

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    const file = fileInput.current?.files?.[0];

    if (!file) {
      setFeedback({ message: t.feedback.chooseFile, kind: "error" });
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("file", file);

      const response = await fetch("/api/student/documents/upload", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({ message: locale === "fr" && typeof result.error === "string" ? result.error : t.feedback.uploadError, kind: "error" });
        return;
      }

      if (fileInput.current) fileInput.current.value = "";
      setFeedback({ message: t.feedback.uploadSuccess, kind: "success" });
      router.refresh();
    } catch {
      setFeedback({ message: t.feedback.networkError, kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function removeDocument(id: string) {
    if (!window.confirm(t.feedback.deleteConfirm)) return;

    setBusy(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/student/documents/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback({ message: locale === "fr" && typeof result.error === "string" ? result.error : t.feedback.deleteError, kind: "error" });
        return;
      }

      setFeedback({ message: t.feedback.deleteSuccess, kind: "success" });
      router.refresh();
    } catch {
      setFeedback({ message: t.feedback.networkError, kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-7">
      <section aria-label={t.priority.aria} className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.85fr)]">
        <Card className={`relative overflow-hidden shadow-none ${correctionCount ? "border-amber-300 bg-amber-50/25" : "border-[var(--brand-border)] bg-white"}`}>
          <div aria-hidden="true" className="student-accent-edge absolute inset-y-0 w-1 bg-[var(--brand)]" />
          <div className="student-accent-content">
          <Badge variant={correctionCount ? "warning" : reviewCount ? "info" : "neutral"}>
            {correctionCount ? t.priority.correctionBadge : reviewCount ? t.priority.reviewBadge : t.priority.documentsBadge}
          </Badge>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
            {correctionCount ? t.priority.correctionTitle : reviewCount ? t.priority.reviewTitle : t.priority.documentsTitle}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            {correctionCount
              ? t.priority.correctionText(correctionCount)
              : reviewCount
                ? t.priority.reviewText
                : documents.length
                  ? t.priority.hasDocumentsText
                  : t.priority.emptyText}
          </p>
          {priorityDocument && (
            <div className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 shadow-none">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.priority.tracked}</p>
                <Badge variant={statusVariant(priorityDocument.status)}>{t.statuses[priorityDocument.status] || priorityDocument.status}</Badge>
              </div>
              <p className="mt-3 [overflow-wrap:anywhere] font-bold text-slate-950"><bdi dir="auto">{priorityDocument.original_filename}</bdi></p>
              <p className="mt-1 text-sm text-slate-600">{t.categories[priorityDocument.category] || t.categories.other}</p>
              {correctionCount > 0 && priorityDocument.admin_comment && (
                <div className="mt-4 rounded-[1.05rem] border border-[#ead59a] bg-[#fff9e9] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-900">{t.priority.correctionWhy}</p>
                  <p dir="auto" className="mt-1.5 text-sm leading-6 text-amber-900">{priorityDocument.admin_comment}</p>
                </div>
              )}
            </div>
          )}
          </div>
        </Card>

        <section aria-label={t.summary.aria} className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <SummaryCard id="documents-summary-approved" title={t.summary.approvedTitle} value={approvedCount} badge={t.summary.approvedBadge} tone="success" />
          <SummaryCard id="documents-summary-review" title={t.summary.reviewTitle} value={reviewCount} badge={t.summary.reviewBadge} tone="info" />
          <SummaryCard id="documents-summary-correction" title={t.summary.correctionTitle} value={correctionCount} badge={correctionCount ? t.summary.actionRequired : t.summary.nothing} tone={correctionCount ? "warning" : "neutral"} />
        </section>
      </section>

      <section aria-labelledby="documents-checklist-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              {workspace.checklistEyebrow}
            </p>
            <h2 id="documents-checklist-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {workspace.checklistTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {workspace.checklistDescription}
            </p>
          </div>
          <div className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-2.5 text-sm font-bold text-[var(--brand-strong)] shadow-sm">
            {workspace.validatedCount(approvedCount, documents.length)}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {checklist.map((group) => {
            const status = group.needsAction
              ? workspace.groupAction
              : group.reviewing
                ? workspace.groupReview
                : group.items.length && group.ready === group.items.length
                  ? workspace.groupReady
                  : workspace.groupPrepare;
            const variant = group.needsAction ? "warning" : group.reviewing ? "info" : group.items.length && group.ready === group.items.length ? "success" : "neutral";
            return (
              <Card as="article" key={group.id} className="h-full rounded-[1.15rem] border-black/[.07] bg-white p-4 shadow-[0_18px_50px_-42px_rgba(0,0,0,.28)]">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-950">{group.label}</h3>
                  <Badge variant={variant}>{status}</Badge>
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                  {group.ready} / {group.items.length || group.categories.length}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {group.items.length ? workspace.groupDocuments : workspace.groupEmpty}
                </p>
              </Card>
            );
          })}
        </div>

        <Card className="mt-4 rounded-[1.15rem] border border-[#ead59a] bg-[#fff9e9] p-4 shadow-[0_16px_44px_-38px_rgba(139,98,0,.26)]">
          <p className="text-sm font-bold text-slate-950">{workspace.nextAction}</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {correctionCount
              ? workspace.nextCorrection
              : reviewCount
                ? workspace.nextReview
                : documents.length
                  ? workspace.nextUpload
                  : workspace.nextStart}
          </p>
        </Card>
      </section>

      <section aria-labelledby="academic-evidence-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              {t.evidence.eyebrow}
            </p>
            <h2 id="academic-evidence-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {t.evidence.title}
            </h2>
          </div>
          <Badge variant="neutral">{t.evidence.count(evidence.length)}</Badge>
        </div>

        <Card className="mt-4 rounded-[1.15rem] border border-[var(--brand-border)] bg-[var(--brand-soft)]/60 shadow-[0_16px_44px_-38px_rgba(216,6,33,.22)]">
          <p className="text-sm leading-6 text-slate-700">
            {t.evidence.boundary}
          </p>
        </Card>

        {evidenceLoadError ? (
          <Card className="mt-4">
            <p role="alert" className="text-sm text-red-800">
              {t.evidence.loadError}
            </p>
          </Card>
        ) : evidence.length === 0 ? (
          <Card className="mt-4 border-dashed shadow-none">
            <h3 className="font-bold text-slate-950">{t.evidence.emptyTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t.evidence.emptyText}
            </p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {evidence.map((item) => (
              <Card as="article" key={item.id} aria-labelledby={`academic-evidence-title-${item.id}`} className="rounded-[1.2rem] border-black/[.07] bg-white shadow-[0_18px_50px_-42px_rgba(0,0,0,.28)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant={evidenceStatusVariant(item.verification_status)}>
                    {evidenceStatusLabel(item.verification_status, t)}
                  </Badge>
                  {item.document_status && (
                    <span className="text-xs font-semibold text-slate-500">
                      {t.evidence.file}: {t.statuses[item.document_status] || item.document_status}
                    </span>
                  )}
                </div>

                <h3 id={`academic-evidence-title-${item.id}`} className="mt-4 text-lg font-bold text-slate-950">
                  {evidenceTypeLabel(item.type, t)}
                </h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{t.evidence.institution}</dt>
                    <dd className="mt-1 text-sm text-slate-800"><bdi dir="auto">{item.institution || t.unknown}</bdi></dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{t.evidence.date}</dt>
                    <dd className="mt-1 text-sm text-slate-800"><bdi dir="auto">{formatEvidenceDate(item.evidence_date, t)}</bdi></dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-3">
                  <p className="text-sm leading-6 text-slate-700">{item.assessment.reason}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card aria-labelledby="document-upload-title" className="overflow-hidden rounded-[1.35rem] border-black/[.07] bg-white shadow-[0_24px_64px_-44px_rgba(0,0,0,.36)]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <Badge variant="neutral">{t.upload.badge}</Badge>
            <h2 id="document-upload-title" className="mt-3 text-xl font-semibold text-slate-950">{t.upload.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {t.upload.text}
            </p>
          </div>
        </div>

        <form onSubmit={upload} className="mt-6">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr_auto] lg:items-end">
            <label className="rounded-[1.05rem] border border-black/[.06] bg-[#f7f4ee] p-4 text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--brand)] text-[10px] text-white">1</span>
                {t.upload.stepType}
              </span>
              {t.upload.typeLabel}
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={busy}
                className="field mt-2 w-full rounded-xl border-black/10 bg-white shadow-none"
              >
                {documentCategories.map((item) => (
                  <option key={item.value} value={item.value}>{t.categories[item.value] || item.label}</option>
                ))}
              </select>
            </label>

            <label className="rounded-[1.05rem] border border-black/[.06] bg-[#f7f4ee] p-4 text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--brand)] text-[10px] text-white">2</span>
                {t.upload.stepFile}
              </span>
              {t.upload.fileLabel}
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
                disabled={busy}
                className="field max-w-full text-xs sm:text-sm"
              />
            </label>

            <div className="rounded-[1.05rem] border border-[var(--brand-border)] bg-white p-4 shadow-sm">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--brand)] text-[10px] text-white">3</span>
                {t.upload.stepSend}
              </span>
              <Button type="submit" disabled={busy} className="w-full justify-center lg:w-auto">
                {busy ? t.upload.sending : t.upload.send}
              </Button>
            </div>
          </div>

          {feedback && (
            <p
              role={feedback.kind === "error" ? "alert" : "status"}
              className={"mt-4 rounded-[var(--radius-control)] border p-3.5 text-sm " + (
                feedback.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand)]"
              )}
            >
              {feedback.message}
            </p>
          )}

          <p className="mt-4 text-sm leading-6 text-slate-500">
            {t.upload.footer}
          </p>
        </form>
      </Card>

      <section aria-labelledby="documents-list-title">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 id="documents-list-title" className="text-2xl font-semibold tracking-tight text-slate-950">{t.list.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{workspace.filteredCount(visibleDocuments.length, documents.length)}</p>
          </div>
        </div>

        {documents.length ? (
          <div
            aria-label={workspace.filtersAria}
            className="mt-4 flex flex-col gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between"
            data-document-filters
          >
            <div className="flex flex-wrap gap-2" role="group" aria-label={workspace.statusFilter}>
              {([
                ["all", workspace.all, documents.length],
                ["action", workspace.action, correctionCount],
                ["review", workspace.review, reviewCount],
                ["approved", workspace.approved, approvedCount],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={statusFilter === value}
                  onClick={() => setStatusFilter(value)}
                  className={
                    "inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 " +
                    (statusFilter === value
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                      : "border-[var(--border)] bg-white text-slate-700 hover:border-[var(--brand-border)]")
                  }
                >
                  <span>{label}</span>
                  <span className={statusFilter === value ? "text-white/75" : "text-slate-400"}>{count}</span>
                </button>
              ))}
            </div>

            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
              <span className="sr-only">{workspace.categoryFilter}</span>
              <select
                aria-label={workspace.categoryFilter}
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="field mt-0 min-w-48 bg-white normal-case tracking-normal text-slate-800"
              >
                <option value="all">{workspace.all}</option>
                {checklistDefinitions.map((group) => (
                  <option key={group.id} value={group.id}>{group.label}</option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {documents.length === 0 ? (
            <Card aria-labelledby="documents-empty-title" className="border-dashed bg-white/70 py-8 text-center">
              <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-lg text-[var(--brand)]">+</span>
              <h3 id="documents-empty-title" className="mt-4 font-bold text-slate-950">{t.list.emptyTitle}</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{t.list.emptyText}</p>
            </Card>
          ) : visibleDocuments.length === 0 ? (
            <Card aria-labelledby="documents-filtered-empty-title" className="border-dashed bg-white/70 py-8 text-center">
              <h3 id="documents-filtered-empty-title" className="font-bold text-slate-950">{workspace.filteredEmptyTitle}</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{workspace.filteredEmptyText}</p>
              <button
                type="button"
                className="mt-4 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold text-[var(--brand)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
                onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); }}
              >
                {workspace.all}
              </button>
            </Card>
          ) : (
            visibleDocuments.map((document) => (
              <Card as="article" key={document.id} aria-labelledby={`student-document-title-${document.id}`} className={`rounded-[1.2rem] shadow-[0_18px_50px_-42px_rgba(0,0,0,.28)] ${["rejected", "replace_required"].includes(document.status) ? "border-[#ead59a] bg-[#fff9e9]" : "border-black/[.07] bg-white"}`}>
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(document.status)}>{t.statuses[document.status] || document.status}</Badge>
                      <span className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-semibold text-slate-600">{t.categories[document.category] || t.categories.other}</span>
                    </div>
                    <h3 id={`student-document-title-${document.id}`} className="mt-3 [overflow-wrap:anywhere] text-lg font-semibold text-slate-950"><bdi dir="auto">{document.original_filename}</bdi></h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatFileSize(document.size_bytes, t)} · {t.sentOn}{" "}
                      <time dateTime={document.created_at}>
                        {new Intl.DateTimeFormat(t.intlLocale, { dateStyle: "medium" }).format(new Date(document.created_at))}
                      </time>
                    </p>
                    {document.admin_comment && (
                      <div className="mt-4 rounded-[1.05rem] border border-[#ead59a] bg-[#fff9e9] p-4">
                        <h4 className="text-sm font-semibold text-amber-950">{t.list.commentTitle}</h4>
                        <p dir="auto" className="mt-1 text-sm leading-6 text-amber-900">{document.admin_comment}</p>
                        <p className="mt-2 text-xs leading-5 text-amber-800">{t.list.commentBoundary}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
                    <a
                      href={`/api/documents/${document.id}/view`}
                      aria-label={t.list.openAria(document.original_filename)}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClassName("secondary")}
                    >
                      {t.list.open}
                    </a>
                    {removableDocumentStatuses.includes(
                      document.status as (typeof removableDocumentStatuses)[number],
                    ) && (
                      <Button
                        type="button"
                        aria-label={t.list.removeAria(document.original_filename)}
                        onClick={() => removeDocument(document.id)}
                        disabled={busy}
                        variant="secondary"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        {t.list.remove}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section aria-labelledby="document-history-title">
        <h2 id="document-history-title" className="text-2xl font-semibold tracking-tight text-slate-950">
          {t.history.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {t.history.description}
        </p>
        <div className="mt-4 space-y-2">
          {historyLoadError ? (
            <Card>
              <p role="alert" className="text-sm text-red-800">{t.history.loadError}</p>
            </Card>
          ) : history.length === 0 ? (
            <Card aria-labelledby="document-history-empty-title" className="border-dashed">
              <p id="document-history-empty-title" className="text-sm text-slate-600">
                {t.history.empty}
              </p>
            </Card>
          ) : (
            history.map((event) => (
              <Card as="article" key={event.id} aria-labelledby={`document-event-title-${event.id}`} className="rounded-[1.1rem] border-black/[.07] bg-white p-4 shadow-[0_16px_44px_-40px_rgba(0,0,0,.26)]">
                <h3 id={`document-event-title-${event.id}`} dir="auto" className="text-sm font-medium text-slate-700">{event.message}</h3>
                <time dateTime={event.created_at} className="mt-1 block text-xs text-slate-500">
                  {new Intl.DateTimeFormat(t.intlLocale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(event.created_at))}
                </time>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ id, title, value, badge, tone }: { id: string; title: string; value: number; badge: string; tone: "success" | "info" | "warning" | "neutral" }) {
  return (
    <Card aria-labelledby={id} className="rounded-[1.2rem] border-black/[.07] bg-white shadow-[0_18px_50px_-42px_rgba(0,0,0,.28)]">
      <h2 id={id} className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}
