"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { recommendationStatuses, recommendationStatusLabels } from "@/lib/phase4";

function firstUniversity(program: any) {
  return Array.isArray(program?.universities) ? program.universities[0] : program?.universities;
}

function recommendationVariant(status: string): "success" | "warning" | "info" | "neutral" {
  if (status === "recommended" || status === "possible") return "success";
  if (status === "missing_requirements") return "warning";
  if (status === "ambitious") return "info";
  return "neutral";
}

export function AdminOrientationPanel({
  students,
  programs,
  recommendations,
}: {
  students: any[];
  programs: any[];
  recommendations: any[];
}) {
  const [studentId, setStudentId] = useState("");
  const [programId, setProgramId] = useState("");
  const [status, setStatus] = useState("recommended");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"success" | "error">("success");
  const [busy, setBusy] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const selected = students.find((student) => student.id === studentId);
  const completedStudents = students.filter((student) => student.onboarding_completed);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return recommendations.filter((recommendation) => {
      if (recommendation.is_archived) return false;
      if (!normalized) return true;

      const student = students.find((item) => item.id === recommendation.student_id);
      const program = programs.find((item) => item.id === recommendation.program_id);
      const university = firstUniversity(program);
      const haystack = [
        student?.first_name,
        student?.last_name,
        program?.name,
        university?.name,
        university?.city,
        recommendationStatusLabels[recommendation.status],
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr");

      return haystack.includes(normalized);
    });
  }, [programs, query, recommendations, students]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orientation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          program_id: programId,
          status,
          note,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessageKind("error");
        setMessage(result.error || "Impossible d’enregistrer la recommandation.");
        return;
      }

      setMessageKind("success");
      setMessage("Recommandation enregistrée.");
      window.location.reload();
    } catch {
      setMessageKind("error");
      setMessage("Erreur réseau. Vérifiez la connexion puis réessayez.");
    } finally {
      setBusy(false);
    }
  }

  async function archiveRecommendation(id: string) {
    setArchivingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orientation/${id}`, { method: "PATCH" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setMessageKind("error");
        setMessage(result.error || "Impossible d’archiver la recommandation.");
        return;
      }

      window.location.reload();
    } catch {
      setMessageKind("error");
      setMessage("Erreur réseau. La recommandation n’a pas été archivée.");
    } finally {
      setArchivingId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.6fr)]">
      <Card aria-labelledby="new-recommendation-title" className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
              Publication
            </p>
            <h2 id="new-recommendation-title" className="mt-1 text-xl font-semibold text-slate-950">
              Nouvelle recommandation
            </h2>
          </div>
          <Badge variant="info">{completedStudents.length} profils prêts</Badge>
        </div>

        <form onSubmit={save} className="mt-6 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Étudiant
            <select
              required
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="field"
            >
              <option value="">Choisir un étudiant</option>
              {completedStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name || ""} {student.last_name || ""} · {student.target_field || "profil à compléter"}
                </option>
              ))}
            </select>
          </label>

          {selected && (
            <section
              aria-label="Profil académique sélectionné"
              className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-slate-700"
            >
              <h3 className="font-semibold text-slate-950">Profil académique</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <ProfileItem label="Diplôme visé" value={selected.target_degree || "À confirmer"} />
                <ProfileItem label="Domaine" value={selected.target_field || "À confirmer"} />
                <ProfileItem label="Langue" value={selected.study_language || "À confirmer"} />
                <ProfileItem label="Moyenne" value={selected.general_average || "À confirmer"} />
              </dl>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Villes préférées : {selected.preferred_cities?.join(", ") || "à confirmer"}
              </p>
            </section>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Programme
            <select
              required
              value={programId}
              onChange={(event) => setProgramId(event.target.value)}
              className="field"
            >
              <option value="">Choisir un programme</option>
              {programs.map((program) => {
                const university = firstUniversity(program);
                return (
                  <option key={program.id} value={program.id}>
                    {program.name} · {university?.name || "Université"}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Statut de la recommandation
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="field">
              {recommendationStatuses.map((item) => (
                <option key={item} value={item}>
                  {recommendationStatusLabels[item]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Justification
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Expliquez les éléments vérifiés qui motivent cette recommandation."
              className="field min-h-28 resize-y"
            />
          </label>

          <Button disabled={busy} type="submit" className="w-full">
            {busy ? "Enregistrement…" : "Publier la recommandation"}
          </Button>

          {message && (
            <p
              role={messageKind === "error" ? "alert" : "status"}
              className={`rounded-[var(--radius-control)] border px-3 py-2 text-sm ${
                messageKind === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </Card>

      <section aria-labelledby="admin-recommendations-title" className="min-w-0">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Suivi</p>
            <h2 id="admin-recommendations-title" className="mt-1 text-xl font-semibold text-slate-950">
              Recommandations publiées
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Retrouvez une recommandation par étudiant, programme, université, ville ou statut.
            </p>
          </div>
          <Badge variant={visible.length ? "info" : "neutral"}>{visible.length} visible{visible.length > 1 ? "s" : ""}</Badge>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Rechercher
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, programme, université, ville ou statut"
            className="field"
          />
        </label>

        <div className="mt-5 space-y-4">
          {visible.length === 0 ? (
            <Card className="border-dashed text-center shadow-none">
              <h3 className="font-semibold text-slate-950">Aucune recommandation trouvée</h3>
              <p className="mt-2 text-sm text-slate-600">
                Modifiez la recherche ou publiez une nouvelle recommandation depuis le formulaire.
              </p>
            </Card>
          ) : (
            visible.map((recommendation) => {
              const student = students.find((item) => item.id === recommendation.student_id);
              const program = programs.find((item) => item.id === recommendation.program_id);
              const university = firstUniversity(program);

              return (
                <Card
                  as="article"
                  key={recommendation.id}
                  aria-labelledby={`admin-recommendation-title-${recommendation.id}`}
                  className="min-w-0 break-words"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--accent-strong)]">
                        {student?.first_name || "Étudiant"} {student?.last_name || ""}
                      </p>
                      <h3
                        id={`admin-recommendation-title-${recommendation.id}`}
                        className="mt-1 text-lg font-semibold leading-6 text-slate-950"
                      >
                        {program?.name || "Programme"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {university?.name || "Université"}{university?.city ? ` · ${university.city}` : ""}
                      </p>
                    </div>
                    <Badge variant={recommendationVariant(recommendation.status)}>
                      {recommendationStatusLabels[recommendation.status] || recommendation.status}
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-[var(--radius-control)] bg-[var(--surface-muted)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Justification publiée</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {recommendation.note || "Aucune justification enregistrée."}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <Button
                      type="button"
                      onClick={() => archiveRecommendation(recommendation.id)}
                      disabled={archivingId === recommendation.id}
                      variant="secondary"
                    >
                      {archivingId === recommendation.id ? "Archivage…" : "Archiver"}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
    </div>
  );
}
