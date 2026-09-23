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
        setNotice({ text: result.error || "Impossible de mettre à jour la candidature.", tone: "error" });
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
      setNotice({ text: "Candidature mise à jour.", tone: "success" });
    } catch {
      setNotice({ text: "Erreur réseau. Vérifiez la connexion puis réessayez.", tone: "error" });
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

      <Card className="shadow-none">
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
              className={`min-w-0 break-words ${isOverdue ? "border-amber-300" : ""}`}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--accent-strong)]">
                    {student?.first_name || "Étudiant"} {student?.last_name || ""}
                  </p>
                  <h2
                    id={`admin-application-title-${application.id}`}
                    className="mt-1 text-lg font-semibold leading-6 text-slate-950"
                  >
                    {program?.name || "Programme"}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                    {" · "}Échéance {formatDeadline(application.deadline)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {isOverdue && <Badge variant="warning">Échéance dépassée</Badge>}
                  <span className={`status-badge shrink-0 ${statusTone(application.status)}`}>
                    {applicationStatusLabels[application.status] || application.status}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
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

              <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {isDirty ? "Modifications non enregistrées." : "Aucune modification en attente."}
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
          <Card className="border-dashed text-center shadow-none">
            <h2 className="font-semibold text-slate-950">Aucune candidature trouvée</h2>
            <p className="mt-2 text-sm text-slate-600">
              Modifiez la recherche ou le filtre de statut pour retrouver une candidature.
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
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <Badge variant={tone}>{value}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
    </Card>
  );
}
