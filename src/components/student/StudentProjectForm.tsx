"use client";

import { useState, type FormEvent } from "react";
import { projectPathOptions, type ProjectPath } from "@/lib/student/project";

type Project = {
  path: ProjectPath;
  target_degree: string | null;
  target_field: string | null;
  target_intake: string | null;
  preferred_cities: string[];
  current_german_level: string | null;
  target_german_level: string | null;
  notes: string | null;
} | null;

export function StudentProjectForm({ project }: { project: Project }) {
  const [selected, setSelected] = useState<ProjectPath | null>(project?.path ?? null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) { setStatus("error"); setMessage("Choisissez d’abord votre parcours."); return; }
    setStatus("saving");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/student/project", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: selected,
        target_degree: form.get("target_degree"),
        target_field: form.get("target_field"),
        target_intake: form.get("target_intake"),
        preferred_cities: String(form.get("preferred_cities") || "").split(","),
        current_german_level: form.get("current_german_level"),
        target_german_level: form.get("target_german_level"),
        notes: form.get("notes"),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus("error"); setMessage(result.error || "Enregistrement impossible."); return; }
    setStatus("saved");
    setMessage("Votre projet a été enregistré.");
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-8">
      <fieldset>
        <legend className="text-lg font-bold text-slate-950">Quel accompagnement recherchez-vous ?</legend>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {projectPathOptions.map(option => (
            <label key={option.value} className={`cursor-pointer rounded-2xl border p-5 transition ${selected === option.value ? "border-[var(--brand)] bg-[var(--brand-soft)] ring-2 ring-[var(--brand-border)]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <input className="sr-only" type="radio" name="path" value={option.value} checked={selected === option.value} onChange={() => setSelected(option.value)} />
              <span className="block font-bold text-slate-950">{option.title}</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">{option.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Diplôme visé" name="target_degree" defaultValue={project?.target_degree} placeholder="Ex. Master" />
        <Field label="Domaine visé" name="target_field" defaultValue={project?.target_field} placeholder="Ex. Informatique" />
        <Field label="Rentrée souhaitée" name="target_intake" defaultValue={project?.target_intake} placeholder="Ex. Hiver 2027" />
        <Field label="Villes préférées" name="preferred_cities" defaultValue={project?.preferred_cities.join(", ")} placeholder="Berlin, Munich…" hint="Séparez les villes par une virgule." />
        <Field label="Niveau d’allemand actuel" name="current_german_level" defaultValue={project?.current_german_level} placeholder="Ex. A2" />
        <Field label="Niveau d’allemand visé" name="target_german_level" defaultValue={project?.target_german_level} placeholder="Ex. B2" />
        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">Précisions utiles</span>
          <textarea name="notes" maxLength={2000} defaultValue={project?.notes ?? ""} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950" />
        </label>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button disabled={status === "saving"} className="rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white disabled:opacity-60">
          {status === "saving" ? "Enregistrement…" : "Enregistrer mon projet"}
        </button>
        <p aria-live="polite" className={`text-sm font-semibold ${status === "error" ? "text-red-700" : "text-emerald-700"}`}>{message}</p>
      </div>
    </form>
  );
}

function Field({ label, name, defaultValue, placeholder, hint }: { label: string; name: string; defaultValue?: string | null; placeholder?: string; hint?: string }) {
  return <label><span className="text-sm font-bold text-slate-800">{label}</span><input name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950" />{hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}</label>;
}
