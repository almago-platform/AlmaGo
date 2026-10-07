"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  adminActionOwnerLabel,
  adminActionStatusLabel,
  isOpenAdminAction,
  isSystemManagedAdminAction,
} from "@/lib/admin/people";

export type AdminDossierActionItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  owner: string | null;
  due_date: string | null;
  template_id: string | null;
  procedure_step_template_id: string | null;
  completed_at: string | null;
};

function statusVariant(status: string): "neutral" | "info" | "warning" | "success" | "error" {
  if (status === "completed") return "success";
  if (status === "blocked") return "error";
  if (status === "waiting_student" || status === "waiting_external") return "warning";
  if (status === "waiting_almago" || status === "in_progress" || status === "ready") return "info";
  return "neutral";
}

function formatDate(value: string | null) {
  if (!value) return null;
  const timestamp = Date.parse(value + (value.length === 10 ? "T12:00:00Z" : ""));
  if (!Number.isFinite(timestamp)) return null;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(timestamp));
}

function isOverdue(value: string | null) {
  if (!value) return false;
  const timestamp = Date.parse(value + (value.length === 10 ? "T23:59:59Z" : ""));
  return Number.isFinite(timestamp) && timestamp < Date.now();
}

export function AdminDossierActionsPanel({
  studentId,
  actions,
}: {
  studentId: string;
  actions: AdminDossierActionItem[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("almago");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const active = useMemo(
    () => actions.filter((item) => isOpenAdminAction(item.status)),
    [actions],
  );
  const completed = useMemo(
    () => actions.filter((item) => item.status === "completed").slice(0, 6),
    [actions],
  );

  async function createAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create");
    setNotice(null);

    const response = await fetch(`/api/admin/dossiers/${studentId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        owner,
        due_date: dueDate || null,
      }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };

    if (!response.ok) {
      setNotice({ tone: "error", text: payload.error || "Impossible d’enregistrer l’action." });
      setBusy(null);
      return;
    }

    setTitle("");
    setDescription("");
    setOwner("almago");
    setDueDate("");
    setNotice({ tone: "success", text: "Action ajoutée au dossier." });
    setBusy(null);
    router.refresh();
  }

  async function mutateAction(actionId: string, operation: "complete" | "reopen") {
    setBusy(actionId);
    setNotice(null);

    const response = await fetch(`/api/admin/dossiers/${studentId}/actions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_id: actionId, operation }),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };

    if (!response.ok) {
      setNotice({ tone: "error", text: payload.error || "Impossible de modifier l’action." });
      setBusy(null);
      return;
    }

    setNotice({
      tone: "success",
      text: operation === "complete" ? "Action marquée comme terminée." : "Action rouverte.",
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <section className="pc-panel p-5 sm:p-6" aria-labelledby="dossier-actions-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Suivi opérationnel</p>
          <h2 id="dossier-actions-title" className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950">
            Prochaines actions
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Enregistrez les actions qui doivent rester visibles pour l’équipe. Une date saisie ici est une cible interne Campus Allemagne, jamais une échéance officielle.
          </p>
        </div>
        <Badge variant={active.length ? "warning" : "success"}>
          {active.length ? `${active.length} ouverte${active.length > 1 ? "s" : ""}` : "À jour"}
        </Badge>
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

      {active.length ? (
        <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {active.map((item) => {
            const due = formatDate(item.due_date);
            const overdue = isOverdue(item.due_date);
            return (
              <article key={item.id} className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_11rem_10rem_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(item.status)}>{adminActionStatusLabel(item.status)}</Badge>
                    {item.procedure_step_template_id ? (
                      <Badge variant="neutral">Étape procédure</Badge>
                    ) : item.template_id ? (
                      <Badge variant="neutral">Checklist synchronisée</Badge>
                    ) : (
                      <Badge variant="info">Action dossier</Badge>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-950">{item.title}</h3>
                  {item.description ? (
                    <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p>
                  ) : null}
                </div>

                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Responsable</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{adminActionOwnerLabel(item.owner)}</p>
                </div>

                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Cible</p>
                  <p className={`mt-1 text-sm font-semibold ${overdue ? "text-red-700" : "text-slate-900"}`}>
                    {due || "Sans date"}
                  </p>
                  {overdue ? <p className="mt-1 text-xs font-bold text-red-700">Dépassée</p> : null}
                </div>

                <div className="flex lg:justify-end">
                  {isSystemManagedAdminAction(item) ? (
                    <span className="text-xs text-slate-500">
                      {item.procedure_step_template_id
                        ? "Pilotée par la procédure"
                        : "Pilotée par une synchronisation métier"}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy === item.id}
                      onClick={() => mutateAction(item.id, "complete")}
                      className="w-full whitespace-nowrap px-3 lg:w-auto"
                    >
                      {busy === item.id ? "Enregistrement…" : "Marquer terminée"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-sm font-bold text-emerald-900">Aucune action ouverte enregistrée.</p>
          <p className="mt-1 text-sm leading-5 text-emerald-800">
            Les files métier restent la source de vérité pour les documents, candidatures, paiements et décisions.
          </p>
        </div>
      )}

      <details className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
        <summary className="cursor-pointer text-sm font-bold text-slate-950">Ajouter une action de suivi</summary>
        <form onSubmit={createAction} className="mt-4 grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Action
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={180}
                placeholder="Ex. Vérifier la traduction du Bac"
                className="field mt-2 bg-white"
                required
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Responsable
              <select
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                className="field mt-2 bg-white"
              >
                <option value="almago">Campus Allemagne</option>
                <option value="student">Étudiant</option>
                <option value="joint">Campus + étudiant</option>
                <option value="external">Externe</option>
              </select>
            </label>
          </div>

          <label className="text-sm font-semibold text-slate-700">
            Explication
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1200}
              rows={3}
              placeholder={owner === "student" || owner === "joint"
                ? "Expliquez exactement ce que l’étudiant doit faire, pourquoi, et ce qui se passera ensuite."
                : "Contexte interne utile pour l’équipe."}
              className="field mt-2 resize-y bg-white"
              required={owner === "student" || owner === "joint"}
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <label className="text-sm font-semibold text-slate-700">
              Cible interne facultative
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="field mt-2 bg-white"
              />
              <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                Les échéances officielles restent gérées par les candidatures et les sources vérifiées.
              </span>
            </label>

            <Button type="submit" disabled={busy === "create"} className="w-full lg:w-auto">
              {busy === "create" ? "Enregistrement…" : "Ajouter l’action"}
            </Button>
          </div>
        </form>
      </details>

      {completed.length ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            Actions terminées récemment · {completed.length}
          </summary>
          <div className="mt-3 divide-y divide-[var(--border)] rounded-[var(--radius-control)] border border-[var(--border)] bg-white">
            {completed.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{adminActionOwnerLabel(item.owner)}</p>
                </div>
                {!isSystemManagedAdminAction(item) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy === item.id}
                    onClick={() => mutateAction(item.id, "reopen")}
                    className="w-full px-3 sm:w-auto"
                  >
                    Rouvrir
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
