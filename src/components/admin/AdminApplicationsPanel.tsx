"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminWorkflowSection } from "@/components/admin/AdminWorkflowSection";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import {
  applicationDateIsTrusted,
  applicationOfficialDeadlineUrgency,
  applicationOfficialDeadlineUrgencyLabel,
  applicationRouteRisk,
  applicationRouteRiskLabel,
  campusTodayDateKey,
} from "@/lib/admin/application-risk";
import {
  allowedApplicationTransitions,
  studentApplicationStageLabel,
  transitionRequirements,
} from "@/lib/application-workflow";
import {
  applicationStatuses,
  applicationStatusLabels,
  formatDeadline,
  isActiveApplication,
  statusTone,
} from "@/lib/phase4";

type ApplicationEdit = {
  status: string;
  nextAction: string;
  note: string;
  transitionConfirmed: boolean;
};

type DeadlineEdit = {
  deadline: string;
  sourceUrl: string;
  cycle: string;
  applicationMethod: string;
};

type Notice = {
  text: string;
  tone: "success" | "error";
};

function firstProgram(application: any) {
  return Array.isArray(application.programs) ? application.programs[0] : application.programs;
}

function firstProfile(application: any) {
  return Array.isArray(application.profiles) ? application.profiles[0] : application.profiles;
}

function firstUniversity(program: any) {
  return Array.isArray(program?.universities) ? program.universities[0] : program?.universities;
}

function applicationDeadlineIsTrusted(application: any) {
  return applicationDateIsTrusted(application);
}

function deadlineProvenanceLabel(application: any) {
  if (!application.deadline) return null;
  if (application.deadline_kind === "internal_target") return "Cible interne";
  if (application.deadline_kind === "source_review_date") return "Date de revue source";
  if (
    (application.deadline_kind === "official_hard_deadline" || application.deadline_kind === "official_external_date")
    && applicationDeadlineIsTrusted(application)
  ) {
    return "Échéance officielle vérifiée";
  }
  return applicationDeadlineIsTrusted(application) ? "Date vérifiée" : "Source / date à vérifier";
}

export function AdminApplicationsPanel({
  applications,
  initialStudentId = "",
}: {
  applications: any[];
  initialStudentId?: string;
}) {
  const [items, setItems] = useState(applications);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [studentIdFilter, setStudentIdFilter] = useState(
    applications.some((application) => application.student_id === initialStudentId)
      ? initialStudentId
      : "",
  );
  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());
  const savingIdsRef = useRef(new Set<string>());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [edits, setEdits] = useState<Record<string, ApplicationEdit>>({});
  const [deadlineEdits, setDeadlineEdits] = useState<Record<string, DeadlineEdit>>({});
  const todayKey = campusTodayDateKey();

  const studentOptions = useMemo(() => {
    const unique = new Map<string, string>();
    for (const application of items) {
      const student = firstProfile(application);
      const name = [student?.first_name, student?.last_name].filter(Boolean).join(" ").trim();
      unique.set(application.student_id, name || "Étudiant");
    }
    return [...unique.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name, "fr"));
  }, [items]);

  const scopedItems = useMemo(
    () => studentIdFilter
      ? items.filter((application) => application.student_id === studentIdFilter)
      : items,
    [items, studentIdFilter],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return scopedItems.filter((application) => {
      if (status !== "all" && application.status !== status) return false;
      if (!normalized) return true;

      const program = firstProgram(application);
      const student = firstProfile(application);
      const university = firstUniversity(program);
      const searchable = [
        student?.first_name,
        student?.last_name,
        program?.name,
        university?.name,
        university?.city,
        applicationStatusLabels[application.status],
        application.next_action,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr");

      return searchable.includes(normalized);
    });
  }, [query, scopedItems, status]);

  const activeCount = scopedItems.filter((application) => isActiveApplication(application.status)).length;
  const missingActionCount = scopedItems.filter(
    (application) => isActiveApplication(application.status) && !application.next_action?.trim(),
  ).length;
  const officialDeadlineUrgencies = scopedItems.flatMap((application) => {
    const urgency = applicationOfficialDeadlineUrgency({
      status: application.status,
      deadline: application.deadline,
      deadline_kind: application.deadline_kind,
      deadlineTrusted: applicationDeadlineIsTrusted(application),
    }, todayKey);
    return urgency ? [urgency] : [];
  });
  const overdueCount = officialDeadlineUrgencies.filter((urgency) => urgency.kind === "overdue").length;
  const officialDeadline30Count = officialDeadlineUrgencies.filter((urgency) =>
    urgency.daysRemaining >= 0 && urgency.daysRemaining <= 30
  ).length;
  const unverifiedDeadlineCount = scopedItems.filter(
    (application) =>
      isActiveApplication(application.status)
      && Boolean(application.deadline)
      && !applicationDeadlineIsTrusted(application),
  ).length;
  const routeRiskCount = scopedItems.filter((application) =>
    Boolean(applicationRouteRisk({
      status: application.status,
      application_method: application.application_method,
      deadline: application.deadline,
      deadline_kind: application.deadline_kind,
      deadlineTrusted: applicationDeadlineIsTrusted(application),
    }, todayKey))
  ).length;

  function changeEdit(id: string, edit: ApplicationEdit) {
    setEdits((current) => ({ ...current, [id]: edit }));
  }

  function changeDeadlineEdit(id: string, edit: DeadlineEdit) {
    setDeadlineEdits((current) => ({ ...current, [id]: edit }));
  }

  async function saveDeadline(
    application: any,
    edit: DeadlineEdit,
    mode: "verify" | "mark_to_verify",
  ) {
    const id = application.id as string;
    if (savingIdsRef.current.has(id)) return;

    savingIdsRef.current.add(id);
    setBusyIds((current) => new Set(current).add(id));
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/applications/${id}/deadline`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          deadline: edit.deadline || null,
          source_url: edit.sourceUrl,
          cycle: edit.cycle,
          application_method: edit.applicationMethod,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice({
          text: result.error || "Impossible d’enregistrer les informations de deadline.",
          tone: "error",
        });
        return;
      }

      const verifiedAt = mode === "verify" ? new Date().toISOString() : null;
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                deadline: edit.deadline || null,
                deadline_kind: "official_hard_deadline",
                deadline_source_url: mode === "verify" ? edit.sourceUrl : null,
                deadline_verified_at: verifiedAt,
                deadline_cycle: edit.cycle || null,
                application_method: edit.applicationMethod,
              }
            : item,
        ),
      );
      setDeadlineEdits((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setNotice({
        tone: "success",
        text: mode === "verify"
          ? "Échéance officielle vérifiée et historisée."
          : "Date enregistrée comme information à vérifier avant utilisation officielle.",
      });
    } catch {
      setNotice({
        tone: "error",
        text: "Impossible d’enregistrer la deadline pour le moment. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      savingIdsRef.current.delete(id);
      setBusyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  async function update(id: string, nextStatus: string, nextAction: string, note: string, transitionConfirmed: boolean) {
    if (savingIdsRef.current.has(id)) return;

    savingIdsRef.current.add(id);
    setBusyIds((current) => new Set(current).add(id));
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/applications/${id}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          next_action: nextAction,
          student_note: note,
          transition_confirmed: transitionConfirmed,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice({ text: result.error || "Nous n’arrivons pas à enregistrer cette candidature pour le moment. Rien d’autre n’a été modifié.", tone: "error" });
        return;
      }

      setItems((current) =>
        current.map((application) =>
          application.id === id
            ? {
                ...application,
                status: nextStatus,
                next_action: nextAction,
                student_notes: note,
              }
            : application,
        ),
      );
      setEdits((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setNotice({ text: "Les modifications ont bien été enregistrées et le suivi étudiant est maintenant à jour.", tone: "success" });
    } catch {
      setNotice({ text: "Nous n’arrivons pas à enregistrer cette modification pour le moment. Vérifiez votre connexion puis réessayez.", tone: "error" });
    } finally {
      savingIdsRef.current.delete(id);
      setBusyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      {notice && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={`rounded-[var(--radius-control)] border p-4 text-sm ${
            notice.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.text}
        </p>
      )}

      <Card className="pc-card shadow-none">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">File candidatures</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">
              {activeCount
                ? `${activeCount} candidature${activeCount > 1 ? "s" : ""} en suivi`
                : "Aucune candidature active"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ouvrez un dossier, contrôlez les faits enregistrés et l’historique, puis mettez à jour le statut et la prochaine action.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 xl:min-w-[62rem]">
            <QueueMetric label="Actives" value={activeCount} />
            <QueueMetric label="Sans action" value={missingActionCount} tone={missingActionCount ? "warning" : "neutral"} />
            <QueueMetric label="Officielles dépassées" value={overdueCount} tone={overdueCount ? "warning" : "neutral"} />
            <QueueMetric label="Officielles ≤ 30 j" value={officialDeadline30Count} tone={officialDeadline30Count ? "warning" : "neutral"} />
            <QueueMetric label="Dates à vérifier" value={unverifiedDeadlineCount} tone={unverifiedDeadlineCount ? "warning" : "neutral"} />
            <QueueMetric label="VPD / uni-assist à risque" value={routeRiskCount} tone={routeRiskCount ? "warning" : "neutral"} />
          </div>
        </div>
      </Card>

      <Card className="pc-soft-strip shadow-none">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Trouver un dossier</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">Recherchez par étudiant, programme, établissement ou prochaine action.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem_15rem]">
          <label className="block text-sm font-medium text-slate-700">
            Rechercher
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Étudiant, programme, université, ville ou action"
              className="field"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Étudiant
            <select value={studentIdFilter} onChange={(event) => setStudentIdFilter(event.target.value)} className="field">
              <option value="">Tous les étudiants</option>
              {studentOptions.map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Statut
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="field">
              <option value="all">Tous les statuts</option>
              {applicationStatuses.map((item) => (
                <option key={item} value={item}>
                  {applicationStatusLabels[item]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {filtered.length} candidature{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}.
        </p>
      </Card>

      <section aria-label="File de traitement des candidatures" className="space-y-4">
        {filtered.map((application) => {
          const program = firstProgram(application);
          const student = firstProfile(application);
          const university = firstUniversity(program);
          const edit = edits[application.id] || {
            status: application.status,
            nextAction: application.next_action || "",
            note: application.student_notes || "",
            transitionConfirmed: false,
          };
          const isSaving = busyIds.has(application.id);
          const deadlineEdit = deadlineEdits[application.id] || {
            deadline: application.deadline || "",
            sourceUrl: application.deadline_source_url || "",
            cycle: application.deadline_cycle || "",
            applicationMethod: application.application_method || "unknown",
          };
          const allowedTargets = allowedApplicationTransitions(application.status);
          const statusOptions = [application.status, ...allowedTargets.filter((item) => item !== application.status)];
          const pendingRequirements = edit.status !== application.status
            ? transitionRequirements(application.status, edit.status)
            : [];
          const needsTransitionConfirmation = pendingRequirements.length > 0;
          const needsDecisionNote = ["admission", "rejection"].includes(edit.status)
            && edit.status !== application.status
            && !edit.note.trim();
          const trustedDeadline = applicationDeadlineIsTrusted(application);
          const officialUrgency = applicationOfficialDeadlineUrgency({
            status: application.status,
            deadline: application.deadline,
            deadline_kind: application.deadline_kind,
            deadlineTrusted: trustedDeadline,
          }, todayKey);
          const isOverdue = officialUrgency?.kind === "overdue";
          const hasUnverifiedDeadline =
            isActiveApplication(application.status)
            && Boolean(application.deadline)
            && !trustedDeadline;
          const routeRisk = applicationRouteRisk({
            status: application.status,
            application_method: application.application_method,
            deadline: application.deadline,
            deadline_kind: application.deadline_kind,
            deadlineTrusted: trustedDeadline,
          }, todayKey);
          const hasRecordedAction =
            isActiveApplication(application.status) && Boolean(application.next_action?.trim());
          const isDirty =
            edit.status !== application.status ||
            edit.nextAction !== (application.next_action || "") ||
            edit.note !== (application.student_notes || "");
          const events = [...(application.application_events || [])].sort(
            (a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)),
          );

          return (
            <Card
              as="article"
              key={application.id}
              aria-busy={isSaving}
              aria-labelledby={`admin-application-title-${application.id}`}
              className={`pc-card min-w-0 overflow-hidden break-words ${isOverdue ? "border-[var(--warning-border)] bg-[var(--premium-gold-wash)]" : hasRecordedAction ? "border-[var(--brand-border)]" : ""}`}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Étudiant</p>
                  <p className="mt-1 text-sm font-bold text-slate-950 [overflow-wrap:anywhere]">
                    {student?.first_name || "Étudiant"} {student?.last_name || ""}
                  </p>
                  <h2
                    id={`admin-application-title-${application.id}`}
                    className="mt-4 text-xl font-bold leading-7 tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]"
                  >
                    {program?.name || "Programme"}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
                    {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                    Étape actuelle · {studentApplicationStageLabel(application.status)}
                  </p>
                  {application.deadline && (
                    <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                      {trustedDeadline ? "Date de travail" : "Date enregistrée"} · {formatDeadline(application.deadline)}
                      {" · "}{deadlineProvenanceLabel(application)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {officialUrgency ? (
                    <Badge variant={
                      officialUrgency.kind === "overdue" || officialUrgency.kind === "d3"
                        ? "error"
                        : officialUrgency.kind === "d7" || officialUrgency.kind === "d14"
                          ? "warning"
                          : "info"
                    }>
                      {applicationOfficialDeadlineUrgencyLabel(officialUrgency)}
                    </Badge>
                  ) : null}
                  {hasUnverifiedDeadline && <Badge variant="warning">Date à vérifier</Badge>}
                  {routeRisk ? <Badge variant="warning">{applicationRouteRiskLabel(routeRisk.kind)}</Badge> : null}
                  {!hasRecordedAction && isActiveApplication(application.status) && <Badge variant="warning">Sans prochaine action</Badge>}
                  {hasRecordedAction && <Badge variant="info">Action enregistrée</Badge>}
                  <span className={`status-badge shrink-0 ${statusTone(application.status)}`}>
                    {applicationStatusLabels[application.status] || application.status}
                  </span>
                  <Link
                    href={`/admin/dossiers/${application.student_id}`}
                    className={buttonClassName("ghost", "min-h-8 px-2.5 py-1 text-xs")}
                  >
                    Dossier 360°
                  </Link>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <AdminWorkflowSection
                  step="A"
                  title="Candidature enregistrée"
                  description="Programme, étape, rentrée, échéance et pièces attendues."
                  badge={
                    <span className={`status-badge shrink-0 ${statusTone(application.status)}`}>
                      {applicationStatusLabels[application.status] || application.status}
                    </span>
                  }
                  defaultOpen
                >
                  <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <RecordedFact label="Étape actuelle" value={studentApplicationStageLabel(application.status)} />
                    <RecordedFact label="Rentrée" value={application.intake || "À confirmer"} />
                    <RecordedFact label="Envoyée le" value={formatRecordedDate(application.submitted_at)} />
                    <RecordedFact
                      label="Documents attendus"
                      value={application.required_documents?.length
                        ? application.required_documents.join(", ")
                        : "À confirmer"}
                    />
                    <RecordedFact label="Résultat enregistré" value={application.result || "Aucun résultat enregistré"} />
                  </dl>

                  {isOverdue ? (
                    <p className="mt-4 rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-950">
                      La deadline officielle vérifiée est dépassée et la candidature n’est pas enregistrée comme soumise. Vérifiez immédiatement le statut réel avant toute autre action.
                    </p>
                  ) : officialUrgency?.kind === "d3" ? (
                    <p className="mt-4 rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-950">
                      Deadline officielle critique : {applicationOfficialDeadlineUrgencyLabel(officialUrgency)}. Confirmez que le dossier peut être déposé à temps.
                    </p>
                  ) : hasUnverifiedDeadline ? (
                    <p className="mt-4 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                      Une date est enregistrée, mais sa provenance n’est pas suffisamment vérifiée. Elle ne doit pas être utilisée comme deadline officielle tant que la source, le cycle et la date de vérification ne sont pas confirmés.
                    </p>
                  ) : routeRisk ? (
                    <p className="mt-4 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                      {applicationRouteRiskLabel(routeRisk.kind)} · la cible interne D-{routeRisk.leadDays} est atteinte ou dépassée. Cette cible aide Campus Allemagne à préparer le dossier ; elle ne remplace pas la deadline officielle.
                    </p>
                  ) : null}

                  <details className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4">
                    <summary className="cursor-pointer text-sm font-bold text-slate-950">
                      Vérifier ou corriger la deadline
                    </summary>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      Une deadline officielle n’est utilisée dans les alertes qu’après vérification de sa source et de son cycle.
                    </p>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <label className="text-sm font-medium text-slate-700">
                        Date
                        <input
                          type="date"
                          value={deadlineEdit.deadline}
                          onChange={(event) => changeDeadlineEdit(application.id, { ...deadlineEdit, deadline: event.target.value })}
                          className="field mt-2 bg-white"
                          disabled={isSaving}
                        />
                      </label>

                      <label className="text-sm font-medium text-slate-700">
                        Cycle / rentrée concernée
                        <input
                          value={deadlineEdit.cycle}
                          onChange={(event) => changeDeadlineEdit(application.id, { ...deadlineEdit, cycle: event.target.value })}
                          className="field mt-2 bg-white"
                          placeholder="Ex. Wintersemester 2027/28"
                          maxLength={120}
                          disabled={isSaving}
                        />
                      </label>

                      <label className="text-sm font-medium text-slate-700">
                        Méthode de candidature
                        <select
                          value={deadlineEdit.applicationMethod}
                          onChange={(event) => changeDeadlineEdit(application.id, { ...deadlineEdit, applicationMethod: event.target.value })}
                          className="field mt-2 bg-white"
                          disabled={isSaving}
                        >
                          <option value="unknown">À confirmer</option>
                          <option value="direct">Directe université</option>
                          <option value="uni_assist">uni-assist</option>
                          <option value="vpd_then_direct">VPD puis candidature directe</option>
                          <option value="other_documented">Autre méthode documentée</option>
                        </select>
                      </label>

                      <label className="text-sm font-medium text-slate-700">
                        Source officielle
                        <input
                          type="url"
                          value={deadlineEdit.sourceUrl}
                          onChange={(event) => changeDeadlineEdit(application.id, { ...deadlineEdit, sourceUrl: event.target.value })}
                          className="field mt-2 bg-white"
                          placeholder="https://..."
                          maxLength={1000}
                          disabled={isSaving}
                        />
                      </label>
                    </div>

                    {application.deadline_source_url ? (
                      <p className="mt-3 text-xs leading-5 text-slate-600">
                        Source actuelle ·{" "}
                        <a
                          href={application.deadline_source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[var(--brand)] hover:underline"
                        >
                          ouvrir la source officielle
                        </a>
                        {application.deadline_verified_at
                          ? ` · vérifiée le ${formatRecordedDate(application.deadline_verified_at)}`
                          : ""}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSaving}
                        onClick={() => saveDeadline(application, deadlineEdit, "mark_to_verify")}
                      >
                        Enregistrer à vérifier
                      </Button>
                      <Button
                        type="button"
                        disabled={
                          isSaving
                          || !deadlineEdit.deadline
                          || !deadlineEdit.cycle.trim()
                          || !deadlineEdit.sourceUrl.trim()
                        }
                        onClick={() => saveDeadline(application, deadlineEdit, "verify")}
                      >
                        Vérifier comme échéance officielle
                      </Button>
                    </div>
                  </details>
                </AdminWorkflowSection>

                <AdminWorkflowSection
                  step="B"
                  title="Suivi et historique"
                  description="Consultez la prochaine action et les événements déjà enregistrés."
                  badge={hasRecordedAction ? <Badge variant="info">Action enregistrée</Badge> : undefined}
                  defaultOpen={hasRecordedAction || events.length > 0}
                >
                  {application.next_action ? (
                    <div className="rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Prochaine action enregistrée</p>
                      <p className="mt-2 text-sm leading-6 text-slate-800 [overflow-wrap:anywhere]">
                        {application.next_action}
                      </p>
                    </div>
                  ) : isActiveApplication(application.status) ? (
                    <p className="pc-soft-strip p-3 text-sm text-slate-600">
                      Aucune prochaine action n’est enregistrée pour ce dossier actif.
                    </p>
                  ) : null}

                  <div
                    aria-label={`Historique de ${program?.name || "la candidature"}`}
                    className={application.next_action || isActiveApplication(application.status) ? "mt-4" : ""}
                  >
                    <p className="text-sm font-bold text-slate-900">
                      Historique enregistré · {events.length} événement{events.length > 1 ? "s" : ""}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      Le badge indique si chaque événement est également visible dans l’espace étudiant.
                    </p>
                    {events.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-600">Aucun événement n’est enregistré pour cette candidature.</p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {events.map((event: any) => (
                          <div key={event.id} className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900">
                                {event.event_type === "application_status_changed" ? "Changement de statut" : "Mise à jour du dossier"}
                              </p>
                              <Badge variant={event.visible_to_student ? "info" : "neutral"}>
                                {event.visible_to_student ? "Visible étudiant" : "Interne"}
                              </Badge>
                            </div>
                            {event.message ? <p className="mt-1 text-sm leading-6 text-slate-700">{event.message}</p> : null}
                            <time dateTime={event.created_at} className="mt-1 block text-xs text-[var(--muted)]">
                              {formatRecordedDate(event.created_at)}
                            </time>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AdminWorkflowSection>

                <AdminWorkflowSection
                  step="C"
                  title="Mise à jour étudiant"
                  description="Le statut, la prochaine action et la note peuvent apparaître dans l’espace étudiant."
                  badge={<Badge variant="info">Visible étudiant</Badge>}
                  defaultOpen={isDirty}
                  tone="brand"
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Statut
                      <select
                        disabled={isSaving}
                        value={edit.status}
                        onChange={(event) => changeEdit(application.id, {
                          ...edit,
                          status: event.target.value,
                          transitionConfirmed: false,
                        })}
                        className="field mt-2 bg-white"
                      >
                        {statusOptions.map((item) => (
                          <option key={item} value={item}>
                            {applicationStatusLabels[item] || item}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Prochaine action
                      <input
                        disabled={isSaving}
                        value={edit.nextAction}
                        onChange={(event) => changeEdit(application.id, { ...edit, nextAction: event.target.value })}
                        placeholder="Ex. fournir le relevé traduit"
                        className="field mt-2 bg-white"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block text-sm font-medium text-slate-700">
                    Note visible par l’étudiant
                    <textarea
                      disabled={isSaving}
                      value={edit.note}
                      onChange={(event) => changeEdit(application.id, { ...edit, note: event.target.value })}
                      placeholder="Ajoutez uniquement une information destinée à l’étudiant."
                      className="field mt-2 min-h-24 resize-y bg-white"
                    />
                  </label>
                </AdminWorkflowSection>

                <AdminWorkflowSection
                  step="D"
                  title="Décision et enregistrement"
                  description="Vérifiez les conditions métier avant de rendre la mise à jour effective."
                  badge={isDirty ? <Badge variant="warning">Non enregistré</Badge> : <Badge variant="success">Enregistré</Badge>}
                  defaultOpen
                  tone={needsTransitionConfirmation || needsDecisionNote ? "warning" : "neutral"}
                >
                  {needsTransitionConfirmation ? (
                    <label className="flex items-start gap-3 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-950">
                      <input
                        type="checkbox"
                        checked={edit.transitionConfirmed}
                        onChange={(event) => changeEdit(application.id, { ...edit, transitionConfirmed: event.target.checked })}
                        disabled={isSaving}
                        className="mt-1"
                      />
                      <span>
                        <strong>Confirmation requise.</strong>{" "}
                        {transitionRequirementLabel(pendingRequirements[0])}
                      </span>
                    </label>
                  ) : null}

                  {needsDecisionNote ? (
                    <p className={`${needsTransitionConfirmation ? "mt-3 " : ""}rounded-[var(--radius-control)] border border-amber-200 bg-amber-50/70 p-3 text-sm leading-6 text-amber-950`}>
                      Une admission ou un refus doit être accompagné d’une note visible précisant la décision communiquée par l’université.
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className={`text-sm font-medium ${isDirty ? "text-amber-800" : "text-[var(--muted)]"}`}>
                      {isDirty
                        ? "Modifications non enregistrées — contrôlez les informations avant de valider."
                        : "Toutes les modifications de ce dossier sont enregistrées."}
                    </p>
                    <Button
                      type="button"
                      disabled={isSaving || !isDirty || (needsTransitionConfirmation && !edit.transitionConfirmed) || needsDecisionNote}
                      onClick={() => update(
                        application.id,
                        edit.status,
                        edit.nextAction,
                        edit.note,
                        edit.transitionConfirmed,
                      )}
                      className="w-full sm:w-auto"
                    >
                      {isSaving ? "Enregistrement…" : "Enregistrer la décision"}
                    </Button>
                  </div>
                </AdminWorkflowSection>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <PremiumEmptyState
            eyebrow="File candidatures"
            title="Aucune candidature ne correspond à cette vue."
            description="Modifiez la recherche ou le filtre de statut. Aucun dossier n’a été supprimé ou modifié."
            compact
          />
        )}
      </section>
    </div>
  );
}

function QueueMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "warning" | "info" | "neutral";
}) {
  return (
    <div className={`bg-white p-3 sm:p-4 ${tone === "warning" && value ? "bg-amber-50/70" : tone === "info" && value ? "bg-blue-50/45" : ""}`}>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function transitionRequirementLabel(requirement: string) {
  if (requirement === "documents_complete") {
    return "Confirmez que les documents nécessaires ont été vérifiés avant de déclarer le dossier prêt à envoyer.";
  }
  if (requirement === "submission_confirmed") {
    return "Confirmez que la candidature a réellement été envoyée à l’établissement ou au service indiqué.";
  }
  if (requirement === "university_decision_confirmed") {
    return "Confirmez qu’une décision officielle de l’université a été reçue. AlmaGo n’est pas l’auteur de cette décision.";
  }
  return "Vérifiez la condition métier avant de poursuivre.";
}


function RecordedFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-sm font-medium leading-5 text-slate-900 [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}

function formatRecordedDate(value: string | null | undefined) {
  if (!value) return "Non enregistrée";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date invalide";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
