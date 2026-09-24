"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  applicationStatuses,
  applicationStatusLabels,
  formatDeadline,
  isActiveApplication,
  isPastDeadline,
  statusTone,
} from "@/lib/phase4";

type ApplicationEdit = {
  status: string;
  nextAction: string;
  note: string;
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

export function AdminApplicationsPanel({ applications }: { applications: any[] }) {
  const [items, setItems] = useState(applications);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());
  const savingIdsRef = useRef(new Set<string>());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [edits, setEdits] = useState<Record<string, ApplicationEdit>>({});

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return items.filter((application) => {
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
  }, [items, query, status]);

  const activeCount = items.filter((application) => isActiveApplication(application.status)).length;
  const actionCount = items.filter(
    (application) => isActiveApplication(application.status) && Boolean(application.next_action),
  ).length;
  const overdueCount = items.filter(
    (application) =>
      isActiveApplication(application.status) &&
      Boolean(application.deadline) &&
      isPastDeadline(application.deadline),
  ).length;

  const priorityApplication =
    items.find(
      (application) =>
        isActiveApplication(application.status) &&
        Boolean(application.deadline) &&
        isPastDeadline(application.deadline),
    ) ||
    items.find(
      (application) =>
        isActiveApplication(application.status) &&
        Boolean(application.next_action),
    ) ||
    items.find((application) => isActiveApplication(application.status)) ||
    null;

  function changeEdit(id: string, edit: ApplicationEdit) {
    setEdits((current) => ({ ...current, [id]: edit }));
  }

  async function update(id: string, nextStatus: string, nextAction: string, note: string) {
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

      <section aria-label="Résumé de la file de candidatures" className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title="Actives" value={activeCount} detail="Candidatures encore en suivi" tone="info" />
        <SummaryCard
          title="Actions enregistrées"
          value={actionCount}
          detail="Avec prochaine action explicite"
          tone={actionCount ? "warning" : "neutral"}
        />
        <SummaryCard
          title="Échéances dépassées"
          value={overdueCount}
          detail="Candidatures actives à vérifier"
          tone={overdueCount ? "warning" : "success"}
        />
      </section>

      {priorityApplication && (() => {
        const priorityProgram = firstProgram(priorityApplication);
        const priorityStudent = firstProfile(priorityApplication);
        const priorityUniversity = firstUniversity(priorityProgram);
        const priorityOverdue =
          Boolean(priorityApplication.deadline) && isPastDeadline(priorityApplication.deadline);

        return (
          <Card className={`relative overflow-hidden shadow-none ${priorityOverdue ? "border-amber-300 bg-amber-50/30" : "border-[var(--brand-border)] bg-white"}`}>
            <div aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${priorityOverdue ? "bg-amber-500" : "bg-[var(--brand)]"}`} />
            <div className="pl-2 sm:pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={priorityOverdue ? "warning" : "info"}>À traiter maintenant</Badge>
                {priorityApplication.next_action && <Badge variant="neutral">Action enregistrée</Badge>}
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]">
                {priorityStudent?.first_name || "Étudiant"} {priorityStudent?.last_name || ""} · {priorityProgram?.name || "Programme"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
                {priorityUniversity?.name || "Université"}{priorityUniversity?.city ? ` · ${priorityUniversity.city}` : ""}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                {priorityApplication.next_action ||
                  (priorityOverdue
                    ? "L’échéance enregistrée est dépassée. Vérifiez le statut et la prochaine action de ce dossier."
                    : "Aucune prochaine action précise n’est enregistrée. Vérifiez le statut de ce dossier actif.")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className={`rounded-full px-3 py-1.5 ${priorityOverdue ? "bg-amber-100 text-amber-900" : "bg-slate-100"}`}>
                  Échéance {formatDeadline(priorityApplication.deadline)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  {applicationStatusLabels[priorityApplication.status] || priorityApplication.status}
                </span>
              </div>
            </div>
          </Card>
        );
      })()}

      <Card className="shadow-none">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Trouver un dossier</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">Recherchez par étudiant, programme, établissement ou prochaine action.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_15rem]">
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
        <p className="mt-3 text-sm text-slate-500">
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
          };
          const isSaving = busyIds.has(application.id);
          const isOverdue =
            isActiveApplication(application.status) &&
            Boolean(application.deadline) &&
            isPastDeadline(application.deadline);
          const hasRecordedAction =
            isActiveApplication(application.status) && Boolean(application.next_action);
          const isDirty =
            edit.status !== application.status ||
            edit.nextAction !== (application.next_action || "") ||
            edit.note !== (application.student_notes || "");

          return (
            <Card
              as="article"
              key={application.id}
              aria-busy={isSaving}
              aria-labelledby={`admin-application-title-${application.id}`}
              className={`min-w-0 overflow-hidden break-words ${isOverdue ? "border-amber-300 bg-amber-50/20" : hasRecordedAction ? "border-[var(--brand-border)]" : ""}`}
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
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Échéance {formatDeadline(application.deadline)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {isOverdue && <Badge variant="warning">Échéance dépassée</Badge>}
                  {hasRecordedAction && <Badge variant="info">Action enregistrée</Badge>}
                  <span className={`status-badge shrink-0 ${statusTone(application.status)}`}>
                    {applicationStatusLabels[application.status] || application.status}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/30 p-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Mise à jour du dossier</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Le statut, la prochaine action et la note ci-dessous peuvent être affichés dans l’espace étudiant. Vérifiez leur formulation avant d’enregistrer.</p>
                  </div>
                  <Badge variant="info">Visible par l’étudiant</Badge>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Statut
                  <select
                    disabled={isSaving}
                    value={edit.status}
                    onChange={(event) => changeEdit(application.id, { ...edit, status: event.target.value })}
                    className="field"
                  >
                    {applicationStatuses.map((item) => (
                      <option key={item} value={item}>
                        {applicationStatusLabels[item]}
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
                    className="field"
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
                  className="field min-h-24 resize-y"
                />
              </label>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-sm font-medium ${isDirty ? "text-amber-800" : "text-slate-500"}`}>
                  {isDirty ? "Modifications non enregistrées — pensez à enregistrer avant de quitter ce dossier." : "Toutes les modifications de ce dossier sont enregistrées."}
                </p>
                <Button
                  type="button"
                  disabled={isSaving || !isDirty}
                  onClick={() => update(application.id, edit.status, edit.nextAction, edit.note)}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="border-dashed bg-white/70 py-9 text-center shadow-none">
            <h2 className="font-bold text-slate-950">Aucune candidature ne correspond à cette vue.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Modifiez la recherche ou le filtre de statut. Aucun dossier n’a été supprimé ou modifié.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: number;
  detail: string;
  tone: "success" | "warning" | "info" | "neutral";
}) {
  return (
    <Card as="article" className="shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-700">{title}</h2>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <Badge variant={tone}>{value}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
    </Card>
  );
}
