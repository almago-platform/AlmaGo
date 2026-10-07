"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";

export type AdminStudentProjectData = {
  target_degree: string | null;
  target_field: string | null;
  study_language: string | null;
  german_level: string | null;
  general_average: number | string | null;
  preferred_cities: string[];
  target_intake: string | null;
  budget_range: string | null;
};

export function AdminStudentProjectPanel({
  studentId,
  project,
}: {
  studentId: string;
  project: AdminStudentProjectData;
}) {
  const router = useRouter();
  const [targetDegree, setTargetDegree] = useState(project.target_degree || "");
  const [targetField, setTargetField] = useState(project.target_field || "");
  const [studyLanguage, setStudyLanguage] = useState(project.study_language || "");
  const [germanLevel, setGermanLevel] = useState(project.german_level || "");
  const [generalAverage, setGeneralAverage] = useState(
    project.general_average === null || project.general_average === undefined
      ? ""
      : String(project.general_average),
  );
  const [preferredCities, setPreferredCities] = useState((project.preferred_cities || []).join(", "));
  const [targetIntake, setTargetIntake] = useState(project.target_intake || "");
  const [budgetRange, setBudgetRange] = useState(project.budget_range || "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const completedFacts = [
    targetDegree,
    targetField,
    studyLanguage,
    germanLevel,
    generalAverage,
    preferredCities,
    targetIntake,
    budgetRange,
  ].filter((value) => value.trim()).length;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);

    const cities = preferredCities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch(`/api/admin/dossiers/${studentId}/project`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_degree: targetDegree,
          target_field: targetField,
          study_language: studyLanguage,
          german_level: germanLevel,
          general_average: generalAverage,
          preferred_cities: cities,
          target_intake: targetIntake,
          budget_range: budgetRange,
        }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string; changed_fields?: string[] };

      if (!response.ok) {
        setNotice({ tone: "error", text: payload.error || "Impossible d’enregistrer le projet étudiant." });
        setBusy(false);
        return;
      }

      setNotice({
        tone: "success",
        text: payload.changed_fields?.length
          ? "Projet étudiant mis à jour et ajouté à l’historique du dossier."
          : "Aucune modification à enregistrer.",
      });
      setBusy(false);
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        text: "Impossible d’enregistrer le projet pour le moment. Vérifiez votre connexion puis réessayez.",
      });
      setBusy(false);
    }
  }

  return (
    <section className="pc-panel p-5 sm:p-6" aria-labelledby="student-project-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Projet étudiant</p>
          <h2 id="student-project-title" className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950">
            Fiche de travail du projet
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Enregistrez ici ce que l’étudiant cherche réellement. Modifier cette fiche ne publie aucune recommandation et ne crée aucune candidature.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={completedFacts >= 5 ? "success" : "warning"}>{completedFacts} / 8 renseignés</Badge>
          <Link
            href={`/admin/orientation?student=${studentId}`}
            className={buttonClassName("secondary", "min-h-9 px-3 py-1.5 text-xs")}
          >
            Préparer l’orientation
          </Link>
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

      <form onSubmit={submit} className="mt-5 grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <ProjectField label="Diplôme visé" value={targetDegree} setValue={setTargetDegree} placeholder="Ex. Bachelor" disabled={busy} />
          <ProjectField label="Domaine" value={targetField} setValue={setTargetField} placeholder="Ex. Informatique" disabled={busy} />
          <ProjectField label="Langue d’études souhaitée" value={studyLanguage} setValue={setStudyLanguage} placeholder="Ex. allemand / anglais" disabled={busy} />
          <ProjectField label="Niveau d’allemand actuel" value={germanLevel} setValue={setGermanLevel} placeholder="Ex. B1" disabled={busy} />
          <label className="text-sm font-semibold text-slate-700">
            Moyenne générale
            <input
              type="number"
              min="0"
              max="20"
              step="0.01"
              value={generalAverage}
              onChange={(event) => setGeneralAverage(event.target.value)}
              className="field mt-2 bg-white"
              placeholder="Ex. 14.25"
              disabled={busy}
            />
          </label>
          <ProjectField label="Rentrée visée" value={targetIntake} setValue={setTargetIntake} placeholder="Ex. Wintersemester 2027/28" disabled={busy} />
          <label className="text-sm font-semibold text-slate-700">
            Villes préférées
            <input
              value={preferredCities}
              onChange={(event) => setPreferredCities(event.target.value)}
              className="field mt-2 bg-white"
              placeholder="Aachen, Köln, Düsseldorf"
              disabled={busy}
            />
            <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">Séparez les villes par des virgules.</span>
          </label>
          <ProjectField label="Budget / contrainte financière" value={budgetRange} setValue={setBudgetRange} placeholder="Ex. 900 € / mois" disabled={busy} />
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-xs leading-5 text-slate-500">
            Les changements sont historisés. L’orientation Campus et les programmes recommandés restent des décisions séparées.
          </p>
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">
            {busy ? "Enregistrement…" : "Enregistrer le projet"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function ProjectField({
  label,
  value,
  setValue,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="field mt-2 bg-white"
        placeholder={placeholder}
        maxLength={180}
        disabled={disabled}
      />
    </label>
  );
}
