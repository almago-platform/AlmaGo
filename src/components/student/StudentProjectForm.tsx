"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentProjectCopy } from "@/content/student-project-copy";
import { projectPathOptions, type ProjectPath } from "@/lib/student/project";

type Project = {
  path: ProjectPath;
  target_degree: string | null;
  target_field: string | null;
  target_intake: string | null;
  preferred_cities: string[];
  current_german_level: string | null;
  target_german_level: string | null;
  current_diploma: string | null;
  diploma_country: string | null;
  filing_country: string | null;
  preferred_study_language: string | null;
  monthly_budget: number | null;
  budget_currency: string;
  actual_objective: string | null;
  notes: string | null;
} | null;

export function StudentProjectForm({ project }: { project: Project }) {
  const [selected, setSelected] = useState<ProjectPath | null>(project?.path ?? null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const { locale, direction } = useLocale();
  const t = studentProjectCopy[locale];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setStatus("error");
      setMessage(t.choosePathError);
      return;
    }

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
        current_diploma: form.get("current_diploma"),
        diploma_country: form.get("diploma_country"),
        filing_country: form.get("filing_country"),
        preferred_study_language: form.get("preferred_study_language"),
        monthly_budget: form.get("monthly_budget"),
        actual_objective: form.get("actual_objective"),
        notes: form.get("notes"),
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(locale === "fr" && typeof result.error === "string" ? result.error : t.saveError);
      return;
    }

    setStatus("saved");
    setMessage(t.saved);
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-8">
      <fieldset>
        <legend className="text-lg font-semibold text-slate-950">{t.choosePath}</legend>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {projectPathOptions.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-[var(--radius-panel)] border p-5 transition ${selected === option.value ? "border-[var(--brand)] bg-[var(--brand-soft)] ring-1 ring-[var(--brand-border)]" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="path"
                value={option.value}
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
              />
              <span className="block font-bold text-slate-950">{t.paths[option.value].title}</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">{t.paths[option.value].description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:grid-cols-2 sm:p-6">
        <Field label={t.fields.currentDiploma} name="current_diploma" defaultValue={project?.current_diploma} placeholder={t.fields.currentDiplomaPlaceholder} maxLength={160} />
        <Field label={t.fields.diplomaCountry} name="diploma_country" defaultValue={project?.diploma_country} placeholder={t.fields.diplomaCountryPlaceholder} hint={t.fields.diplomaCountryHint} maxLength={2} inputDir="ltr" />
        <Field
          label={t.fields.filingCountry}
          name="filing_country"
          defaultValue={project?.filing_country}
          placeholder={t.fields.filingCountryPlaceholder}
          hint={t.fields.filingCountryHint}
          maxLength={2}
          inputDir="ltr"
        />
        <Field label={t.fields.targetDegree} name="target_degree" defaultValue={project?.target_degree} placeholder={t.fields.targetDegreePlaceholder} maxLength={120} />
        <Field label={t.fields.targetField} name="target_field" defaultValue={project?.target_field} placeholder={t.fields.targetFieldPlaceholder} maxLength={160} />
        <Field label={t.fields.targetIntake} name="target_intake" defaultValue={project?.target_intake} placeholder={t.fields.targetIntakePlaceholder} maxLength={80} />
        <Field label={t.fields.studyLanguage} name="preferred_study_language" defaultValue={project?.preferred_study_language} placeholder={t.fields.studyLanguagePlaceholder} maxLength={80} />
        <Field label={t.fields.preferredCities} name="preferred_cities" defaultValue={project?.preferred_cities.join(", ")} placeholder={t.fields.preferredCitiesPlaceholder} hint={t.fields.preferredCitiesHint} />
        <Field label={t.fields.currentGerman} name="current_german_level" defaultValue={project?.current_german_level} placeholder={t.fields.currentGermanPlaceholder} maxLength={40} />
        <Field label={t.fields.targetGerman} name="target_german_level" defaultValue={project?.target_german_level} placeholder={t.fields.targetGermanPlaceholder} maxLength={40} />

        <label>
          <span className="text-sm font-bold text-slate-800">{t.fields.monthlyBudget}</span>
          <div className="mt-2 flex overflow-hidden rounded-[var(--radius-control)] border border-slate-300 bg-white">
            <input
              name="monthly_budget"
              type="number"
              min="0"
              max="100000"
              step="0.01"
              defaultValue={project?.monthly_budget ?? ""}
              className="min-w-0 flex-1 px-4 py-3 text-slate-950 outline-none"
              placeholder={t.fields.monthlyBudgetPlaceholder}
            />
            <span className={`grid place-items-center bg-slate-50 px-4 text-sm font-bold text-slate-700 ${direction === "rtl" ? "border-r" : "border-l"} border-slate-200`}>EUR</span>
          </div>
          <span className="mt-1 block text-xs text-slate-500">{t.fields.currencyHint}</span>
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">{t.fields.objective}</span>
          <textarea
            name="actual_objective"
            maxLength={1200}
            defaultValue={project?.actual_objective ?? ""}
            rows={4}
            placeholder={t.fields.objectivePlaceholder}
            className="field mt-2 min-h-28 resize-y"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-bold text-slate-800">{t.fields.notes}</span>
          <textarea
            name="notes"
            maxLength={2000}
            defaultValue={project?.notes ?? ""}
            rows={4}
            className="field mt-2 min-h-28 resize-y"
          />
        </label>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? t.saving : t.save}
        </Button>
        <p aria-live="polite" className={`text-sm font-semibold ${status === "error" ? "text-red-700" : "text-emerald-700"}`}>{message}</p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
  maxLength,
  inputDir,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  inputDir?: "ltr" | "rtl";
}) {
  return (
    <label>
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <input
        name={name}
        dir={inputDir}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        maxLength={maxLength}
        className="field mt-2"
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
