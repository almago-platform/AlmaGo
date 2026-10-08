"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { documentCategories, categoryLabel } from "@/lib/documents";

export type AdminDocumentRequirementItem = {
  id: string;
  requirement_key: string;
  label: string;
  category: string;
  status: string;
  requested_from_student: boolean;
  student_request_reason: string | null;
  student_request_due_date: string | null;
  document_id: string | null;
  requires_tunisian_authentication: boolean;
  requires_translation: boolean;
  requires_german_legalisation: boolean | null;
  legalisation_status: string | null;
  legalisation_reason: string | null;
  due_date: string | null;
  deadline_kind: string | null;
  deadline_cycle: string | null;
  source_url: string | null;
  source_verified_at: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

type LinkedDocument = {
  id: string;
  category: string;
  original_filename: string | null;
  status: string;
  created_at: string;
};

const starterRequirementKeys = new Set([
  "passport",
  "baccalaureate",
  "baccalaureate_transcript",
  "existing_language_certificate",
]);

const processingOperations = [
  { value: "accepted_original", label: "Original validé" },
  { value: "authentication_required", label: "Authentification requise" },
  { value: "authentication_in_progress", label: "Authentification en cours" },
  { value: "authenticated", label: "Authentification terminée" },
  { value: "translation_required", label: "Traduction requise" },
  { value: "translation_in_progress", label: "Traduction en cours" },
  { value: "translated", label: "Traduction terminée" },
  { value: "legalisation_to_verify", label: "Légalisation à vérifier" },
  { value: "legalisation_required", label: "Légalisation requise" },
  { value: "legalisation_in_progress", label: "Légalisation en cours" },
  { value: "legalisation_not_required", label: "Légalisation non requise · pièce prête" },
  { value: "legalisation_completed", label: "Légalisation terminée · pièce prête" },
  { value: "ready", label: "Pièce prête" },
  { value: "not_applicable", label: "Non applicable" },
] as const;

function requirementLabel(status: string) {
  return ({
    requested: "Demandé",
    uploaded: "Reçu",
    under_review: "À vérifier",
    replacement_required: "À remplacer",
    accepted_original: "Validé",
    authentication_required: "Authentification requise",
    authentication_in_progress: "Authentification en cours",
    authenticated: "Authentifié",
    translation_required: "Traduction requise",
    translation_in_progress: "Traduction en cours",
    translated: "Traduit",
    legalisation_to_verify: "Légalisation à vérifier",
    legalisation_required: "Légalisation requise",
    legalisation_in_progress: "Légalisation en cours",
    ready: "Prêt",
    not_applicable: "Non applicable",
  } as Record<string, string>)[status] || status;
}

function requirementVariant(status: string): "success" | "warning" | "info" | "neutral" | "error" {
  if (["accepted_original", "authenticated", "translated", "ready"].includes(status)) return "success";
  if (["replacement_required", "authentication_required", "translation_required", "legalisation_required"].includes(status)) return "warning";
  if (["uploaded", "under_review", "authentication_in_progress", "translation_in_progress", "legalisation_in_progress", "legalisation_to_verify"].includes(status)) return "info";
  if (status === "requested") return "warning";
  return "neutral";
}

function formatDate(value: string | null) {
  if (!value) return null;
  const timestamp = Date.parse(value + (value.length === 10 ? "T12:00:00Z" : ""));
  if (!Number.isFinite(timestamp)) return null;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(timestamp));
}

function processBadgeVariant(value: string | null): "success" | "warning" | "info" | "neutral" {
  if (value === "completed" || value === "authenticated" || value === "translated") return "success";
  if (value === "required" || value === "to_verify") return "warning";
  if (value === "submitted_external" || value?.endsWith("_in_progress")) return "info";
  return "neutral";
}

function legalisationLabel(item: AdminDocumentRequirementItem) {
  if (item.legalisation_status === "completed") return "Légalisation terminée";
  if (item.legalisation_status === "submitted_external") return "Légalisation · externe";
  if (item.legalisation_status === "required" || item.requires_german_legalisation === true) return "Légalisation requise";
  if (item.legalisation_status === "not_required" || item.requires_german_legalisation === false) return "Légalisation non requise";
  return "Légalisation à vérifier";
}

function requirementDeadlineLabel(kind: string | null) {
  if (kind === "official_hard_deadline") return "Deadline officielle";
  if (kind === "official_external_date") return "Date externe officielle";
  if (kind === "internal_target") return "Cible interne";
  if (kind === "source_review_date") return "Revue de source";
  return "Date procédure";
}

export function AdminDocumentRequirementsPanel({
  studentId,
  requirements,
  documents,
}: {
  studentId: string;
  requirements: AdminDocumentRequirementItem[];
  documents: LinkedDocument[];
}) {
  const router = useRouter();
  const [category, setCategory] = useState("other");
  const [label, setLabel] = useState("");
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [operationById, setOperationById] = useState<Record<string, string>>({});
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [legalisationReasonById, setLegalisationReasonById] = useState<Record<string, string>>({});
  const [sourceUrlById, setSourceUrlById] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const documentById = new Map(documents.map((item) => [item.id, item]));
  const requested = requirements.filter((item) => item.status === "requested").length;
  const review = requirements.filter((item) => ["uploaded", "under_review"].includes(item.status)).length;
  const replacement = requirements.filter((item) => item.status === "replacement_required").length;
  const ready = requirements.filter((item) => ["accepted_original", "ready"].includes(item.status)).length;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/dossiers/${studentId}/documents/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          label,
          reason,
          due_date: dueDate || null,
        }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string; warning?: string | null };

      if (!response.ok) {
        setNotice({ tone: "error", text: payload.error || "Impossible d’enregistrer cette demande." });
        setBusy(false);
        return;
      }

      setLabel("");
      setReason("");
      setDueDate("");
      setCategory("other");
      setNotice({
        tone: "success",
        text: payload.warning
          ? `Demande enregistrée. ${payload.warning}`
          : "Demande enregistrée et transmise au suivi de l’étudiant.",
      });
      setBusy(false);
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        text: "Impossible d’enregistrer cette demande pour le moment. Vérifiez votre connexion puis réessayez.",
      });
      setBusy(false);
    }
  }

  async function updateProcessing(item: AdminDocumentRequirementItem) {
    const operation = operationById[item.id] || "";
    if (!operation) {
      setNotice({ tone: "error", text: "Choisissez d’abord l’état de traitement à enregistrer." });
      return;
    }

    setProcessingId(item.id);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/admin/dossiers/${studentId}/documents/requirements/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation,
            admin_note: noteById[item.id] ?? item.admin_note ?? "",
            legalisation_reason:
              legalisationReasonById[item.id] ?? item.legalisation_reason ?? "",
            source_url: sourceUrlById[item.id] ?? item.source_url ?? "",
          }),
        },
      );
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setNotice({
          tone: "error",
          text: payload.error || "Impossible de mettre à jour le traitement documentaire.",
        });
        setProcessingId(null);
        return;
      }

      setNotice({ tone: "success", text: "Traitement documentaire mis à jour." });
      setOperationById((current) => ({ ...current, [item.id]: "" }));
      setProcessingId(null);
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        text: "Impossible de mettre à jour le traitement documentaire pour le moment.",
      });
      setProcessingId(null);
    }
  }

  return (
    <section className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5" aria-labelledby="document-requirements-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Exigences documentaires</p>
          <h3 id="document-requirements-title" className="mt-2 text-lg font-semibold text-slate-950">
            Ce qui est demandé, reçu et validé
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Une exigence reste distincte du fichier envoyé. Le panneau conserve aussi les opérations internes d’authentification, traduction et légalisation, leur motif et leur source lorsqu’ils sont enregistrés.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <RequirementMetric label="Demandés" value={requested} warning={requested > 0} />
          <RequirementMetric label="À vérifier" value={review} warning={review > 0} />
          <RequirementMetric label="À remplacer" value={replacement} warning={replacement > 0} />
          <RequirementMetric label="Validés" value={ready} />
        </div>
      </div>

      {notice ? (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={`mt-4 rounded-[var(--radius-control)] border p-3 text-sm font-semibold ${
            notice.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      {requirements.length ? (
        <div className="mt-5 divide-y divide-[var(--border)] rounded-[var(--radius-control)] border border-[var(--border)] bg-white">
          {requirements.map((item) => {
            const linked = item.document_id ? documentById.get(item.document_id) || null : null;
            const due = formatDate(item.student_request_due_date);
            const isStarter = starterRequirementKeys.has(item.requirement_key);
            return (
              <article key={item.id} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_10rem_11rem] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-950">{item.label}</h4>
                    <Badge variant={requirementVariant(item.status)}>{requirementLabel(item.status)}</Badge>
                    {isStarter ? <Badge variant="neutral">Procédure</Badge> : <Badge variant="info">Demande Campus</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{categoryLabel(item.category)}</p>
                  {item.student_request_reason ? (
                    <p className="mt-2 text-sm leading-5 text-slate-600">{item.student_request_reason}</p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.requires_tunisian_authentication || item.status.startsWith("authentication_") || item.status === "authenticated" ? (
                      <Badge variant={processBadgeVariant(item.status)}>
                        {item.status === "authenticated"
                          ? "Authentification terminée"
                          : item.status === "authentication_in_progress"
                            ? "Authentification en cours"
                            : "Authentification requise"}
                      </Badge>
                    ) : null}
                    {item.requires_translation || item.status.startsWith("translation_") || item.status === "translated" ? (
                      <Badge variant={processBadgeVariant(item.status)}>
                        {item.status === "translated"
                          ? "Traduction terminée"
                          : item.status === "translation_in_progress"
                            ? "Traduction en cours"
                            : "Traduction requise"}
                      </Badge>
                    ) : null}
                    <Badge variant={processBadgeVariant(item.legalisation_status)}>
                      {legalisationLabel(item)}
                    </Badge>
                  </div>

                  {item.legalisation_reason ? (
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      Motif légalisation · {item.legalisation_reason}
                    </p>
                  ) : null}
                  {item.admin_note ? (
                    <p className="mt-2 rounded-[var(--radius-control)] bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700">
                      Note interne · {item.admin_note}
                    </p>
                  ) : null}
                  {item.source_url ? (
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      Source ·{" "}
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[var(--brand)] hover:underline"
                      >
                        ouvrir la source officielle
                      </a>
                      {item.source_verified_at ? ` · vérifiée le ${formatDate(item.source_verified_at)}` : " · vérification à confirmer"}
                    </p>
                  ) : null}
                  {item.due_date ? (
                    <p className="mt-2 text-xs font-semibold text-slate-600">
                      {requirementDeadlineLabel(item.deadline_kind)} · {formatDate(item.due_date)}
                      {item.deadline_cycle ? ` · ${item.deadline_cycle}` : ""}
                    </p>
                  ) : null}

                  {linked ? (
                    <p className="mt-2 text-xs font-semibold text-slate-600">
                      Fichier lié · {linked.original_filename || linked.category}
                    </p>
                  ) : (
                    item.requested_from_student ? (
                      <p className="mt-2 text-xs font-semibold text-amber-800">Aucun fichier lié pour le moment.</p>
                    ) : null
                  )}
                </div>

                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-500">Cible étudiant</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{due || "Sans date"}</p>
                </div>

                <div className="lg:text-right">
                  {linked ? (
                    <a
                      href={`/api/admin/documents/${linked.id}/view`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-[var(--brand)] hover:underline"
                    >
                      Ouvrir le fichier →
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">
                      {item.requested_from_student ? "En attente de l’étudiant" : "Suivi interne"}
                    </span>
                  )}
                </div>

                <details className="lg:col-span-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                  <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.1em] text-slate-700">
                    Mettre à jour le traitement interne
                  </summary>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Nouvel état
                      <select
                        value={operationById[item.id] || ""}
                        onChange={(event) => setOperationById((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))}
                        className="field mt-1 bg-white"
                        disabled={processingId === item.id}
                      >
                        <option value="">Choisir…</option>
                        {processingOperations.map((operation) => (
                          <option key={operation.value} value={operation.value}>{operation.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs font-semibold text-slate-700">
                      Motif de légalisation
                      <input
                        value={legalisationReasonById[item.id] ?? item.legalisation_reason ?? ""}
                        onChange={(event) => setLegalisationReasonById((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))}
                        maxLength={1600}
                        className="field mt-1 bg-white"
                        placeholder="Pourquoi vérifier, exiger ou exclure la légalisation ?"
                        disabled={processingId === item.id}
                      />
                    </label>

                    <label className="text-xs font-semibold text-slate-700 lg:col-span-2">
                      Source officielle utilisée pour la décision
                      <input
                        type="url"
                        value={sourceUrlById[item.id] ?? item.source_url ?? ""}
                        onChange={(event) => setSourceUrlById((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))}
                        maxLength={1000}
                        className="field mt-1 bg-white"
                        placeholder="https://..."
                        disabled={processingId === item.id}
                      />
                      <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                        Obligatoire pour conclure « légalisation requise » ou « non requise ». Une simple vérification à faire peut rester sans source confirmée.
                      </span>
                    </label>

                    <label className="text-xs font-semibold text-slate-700 lg:col-span-2">
                      Note interne
                      <textarea
                        value={noteById[item.id] ?? item.admin_note ?? ""}
                        onChange={(event) => setNoteById((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))}
                        maxLength={1600}
                        rows={2}
                        className="field mt-1 resize-y bg-white"
                        placeholder="Contexte utile pour l’équipe"
                        disabled={processingId === item.id}
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-500">
                      Les changements sont enregistrés dans l’historique de la procédure. Une décision positive ou négative de légalisation exige une source officielle ; rien n’est déduit automatiquement.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={processingId === item.id || !(operationById[item.id] || "")}
                      onClick={() => updateProcessing(item)}
                      className="shrink-0"
                    >
                      {processingId === item.id ? "Enregistrement…" : "Enregistrer le traitement"}
                    </Button>
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-[var(--radius-control)] border border-dashed border-[var(--border)] bg-white p-4">
          <p className="text-sm font-bold text-slate-950">Aucune exigence documentaire active.</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Les exigences de départ apparaissent après activation de la procédure Campus.
          </p>
        </div>
      )}

      <details className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-slate-950">Demander un document supplémentaire</summary>
        <form onSubmit={submit} className="mt-4 grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Type
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="field mt-2 bg-white"
                disabled={busy}
              >
                {documentCategories.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Nom de la pièce
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                maxLength={180}
                className="field mt-2 bg-white"
                placeholder="Ex. Traduction certifiée du relevé de notes"
                required
                disabled={busy}
              />
            </label>
          </div>

          <label className="text-sm font-semibold text-slate-700">
            Message visible par l’étudiant
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={1200}
              rows={3}
              className="field mt-2 resize-y bg-white"
              placeholder="Expliquez pourquoi cette pièce est nécessaire et ce que l’étudiant doit envoyer."
              required
              disabled={busy}
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <label className="text-sm font-semibold text-slate-700">
              Date cible facultative
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="field mt-2 bg-white"
                disabled={busy}
              />
              <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                Cette date sert au suivi de la demande étudiante ; elle n’est pas présentée comme une deadline officielle.
              </span>
            </label>

            <Button type="submit" disabled={busy} className="w-full lg:w-auto">
              {busy ? "Enregistrement…" : "Demander le document"}
            </Button>
          </div>
        </form>
      </details>
    </section>
  );
}

function RequirementMetric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="min-w-[6.5rem] rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${warning ? "text-amber-800" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}
