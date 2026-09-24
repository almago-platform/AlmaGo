"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { formatDeadline } from "@/lib/phase4";

export type AdminStudentListItem = {
  id: string;
  name: string;
  project: string;
  onboardingCompleted: boolean;
  documentsNeedingAction: number;
  documentsWithAlmaGo: number;
  todoCount: number;
  activeApplications: number;
  nextDeadline: string | null;
  nextAction: string | null;
  lastActivity: string | null;
  lastActivityAt: string | null;
  hasPriority: boolean;
};

function formatActivityDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export function AdminStudentsPanel({ students }: { students: AdminStudentListItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "priority" | "clear">("all");

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return students.filter((student) => {
      if (filter === "priority" && !student.hasPriority) return false;
      if (filter === "clear" && student.hasPriority) return false;
      if (!normalized) return true;

      return [
        student.name,
        student.project,
        student.nextAction,
        student.lastActivity,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr")
        .includes(normalized);
    });
  }, [students, query, filter]);

  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <label className="block text-sm font-medium text-slate-700">
            Rechercher un dossier
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom ou projet d’études"
              className="field"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Vue
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as "all" | "priority" | "clear")}
              className="field"
            >
              <option value="all">Tous les dossiers</option>
              <option value="priority">Avec action ou vérification</option>
              <option value="clear">Sans priorité enregistrée</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          {visible.length} dossier{visible.length > 1 ? "s" : ""} affiché{visible.length > 1 ? "s" : ""} sur cette page.
        </p>
      </Card>

      <section aria-label="Dossiers étudiants" className="space-y-4">
        {visible.map((student) => {
          const activityDate = formatActivityDate(student.lastActivityAt);

          return (
            <Card
              as="article"
              key={student.id}
              aria-labelledby={`admin-student-${student.id}`}
              className={student.hasPriority ? "border-[var(--brand-border)]" : "shadow-none"}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={student.onboardingCompleted ? "success" : "warning"}>
                      {student.onboardingCompleted ? "Onboarding terminé" : "Onboarding à compléter"}
                    </Badge>
                    <Badge variant={student.hasPriority ? "info" : "neutral"}>
                      {student.hasPriority ? "Élément à suivre" : "Aucune priorité enregistrée"}
                    </Badge>
                  </div>
                  <h2
                    id={`admin-student-${student.id}`}
                    className="mt-4 text-2xl font-bold tracking-[-0.03em] text-slate-950"
                  >
                    {student.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{student.project}</p>
                </div>
                <ButtonLink href={`/admin/students/${student.id}`} className="w-full justify-center xl:w-auto">
                  Ouvrir le dossier
                </ButtonLink>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  label="Documents à corriger"
                  value={student.documentsNeedingAction}
                  tone={student.documentsNeedingAction ? "warning" : "neutral"}
                />
                <Metric
                  label="Chez AlmaGo"
                  value={student.documentsWithAlmaGo}
                  tone={student.documentsWithAlmaGo ? "info" : "neutral"}
                />
                <Metric
                  label="Démarches ouvertes"
                  value={student.todoCount}
                  tone={student.todoCount ? "info" : "neutral"}
                />
                <Metric
                  label="Candidatures actives"
                  value={student.activeApplications}
                  tone={student.activeApplications ? "info" : "neutral"}
                />
              </div>

              <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-5 lg:grid-cols-3">
                <InfoBlock
                  label="Prochaine échéance connue"
                  value={student.nextDeadline ? formatDeadline(student.nextDeadline) : "Aucune date enregistrée"}
                />
                <InfoBlock
                  label="Prochaine action enregistrée"
                  value={student.nextAction || "Aucune action explicite enregistrée"}
                />
                <InfoBlock
                  label="Dernière activité utile"
                  value={student.lastActivity || "Aucune activité récente enregistrée"}
                  detail={activityDate || undefined}
                />
              </div>
            </Card>
          );
        })}

        {visible.length === 0 && (
          <Card className="border-dashed bg-white/70 py-10 text-center shadow-none">
            <h2 className="text-lg font-bold text-slate-950">Aucun dossier étudiant ne correspond à cette vue.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Modifiez la recherche ou le filtre. Aucun étudiant n’a été supprimé ou reclassé.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "info" | "neutral";
}) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/55 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-2xl font-bold text-slate-950">{value}</p>
        <Badge variant={tone}>{value}</Badge>
      </div>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}
