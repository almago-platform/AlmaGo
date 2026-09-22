"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PreferredCitiesPicker, SearchableDatalistInput, SelectInput, TextInput } from "@/components/student/ProfileControls";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  budgetOptions,
  certificateOptions,
  degreeOptions,
  diplomaOptions,
  languageLevelOptions,
  nationalityOptions,
  studyFieldOptions,
  studyLanguageOptions,
  tunisianBacTrackOptions,
} from "@/lib/student/profile-options";

type FormData = Record<string, string | string[]>;

const initial: FormData = {
  first_name: "",
  last_name: "",
  birth_date: "",
  nationality: "Tunisienne",
  current_city: "",
  phone: "",
  last_diploma: "",
  bac_track: "",
  bac_year: "",
  general_average: "",
  institution: "",
  current_university_studies: "",
  current_field: "",
  university_semesters: "",
  german_level: "none",
  english_level: "none",
  french_level: "none",
  language_certificate: "none",
  language_certificate_other: "",
  target_degree: "",
  target_field: "",
  study_language: "",
  target_intake: "",
  preferred_cities: [],
  budget_range: "",
};

const steps = [
  { id: 1, title: "Identité", description: "Coordonnées et nationalité" },
  { id: 2, title: "Parcours", description: "Diplôme et études" },
  { id: 3, title: "Langues", description: "Niveaux et certificats" },
  { id: 4, title: "Projet", description: "Objectif en Allemagne" },
  { id: 5, title: "Validation", description: "Résumé du dossier" },
];

function mergeProfile(profile: Partial<FormData>): FormData {
  return {
    ...initial,
    ...profile,
    preferred_cities: Array.isArray(profile.preferred_cities) ? profile.preferred_cities : [],
  };
}

function valueOrDash(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  return value && value.trim() ? value : "-";
}

export function OnboardingForm({ profile }: { profile: Partial<FormData> }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(() => mergeProfile(profile));
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const set = (key: string, value: string | string[]) => setData((current) => ({ ...current, [key]: value }));

  async function save(nextStep: number) {
    setError("");
    const requiredByStep: Record<number, string[]> = {
      1: ["first_name", "last_name", "nationality"],
      4: ["target_degree", "target_field", "study_language", "target_intake"],
    };

    if (requiredByStep[step]?.some((key) => !String(data[key] || "").trim())) {
      setError("Complète les champs marqués d&apos;un * avant de continuer.");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/student/onboarding", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, complete: nextStep === 6, consentAccepted: consent }),
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(result.error || "Une erreur est survenue.");
      return;
    }

    if (nextStep === 6) router.push("/student");
    else setStep(nextStep);
  }

  const progress = `${step * 20}%`;
  const currentStep = steps[step - 1];

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.36fr_1fr]">
      <aside className="space-y-4">
        <Card className="bg-slate-950 text-white shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">AlmaGo</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Prépare ton dossier étudiant</h1>
          <p className="mt-4 text-sm leading-6 text-slate-200">
            Donne les informations essentielles pour construire un parcours clair vers les études en Allemagne.
          </p>
          <div className="mt-6 rounded-xl bg-white/10 p-4">
            <p className="text-sm font-semibold text-emerald-100">Étape actuelle</p>
            <p className="mt-2 text-xl font-bold">{currentStep.title}</p>
            <p className="mt-1 text-sm text-slate-300">{currentStep.description}</p>
          </div>
        </Card>

        <Card className="shadow-none">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Progression</h2>
          <ol className="mt-5 space-y-3">
            {steps.map((item) => {
              const active = item.id === step;
              const done = item.id < step;
              return (
                <li key={item.id} className="flex gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      active || done ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.id}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-950">{item.title}</span>
                    <span className="block text-xs leading-5 text-slate-500">{item.description}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>
      </aside>

      <Card as="section" className="sm:p-8">
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Étape {step} sur 5</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{currentStep.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{currentStep.description}</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
              {progress}
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: progress }} />
          </div>
          <p className="mt-3 text-sm text-slate-500">Tes réponses sont sauvegardées à chaque étape validée.</p>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-950">Informations personnelles</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Prénom" required value={String(data.first_name)} onChange={(v) => set("first_name", v)} />
              <TextInput label="Nom" required value={String(data.last_name)} onChange={(v) => set("last_name", v)} />
              <TextInput label="Date de naissance" type="date" value={String(data.birth_date)} onChange={(v) => set("birth_date", v)} />
              <SearchableDatalistInput label="Nationalité" required value={String(data.nationality)} onChange={(v) => set("nationality", v)} options={nationalityOptions} />
              <TextInput label="Ville actuelle" value={String(data.current_city)} onChange={(v) => set("current_city", v)} />
              <TextInput label="Téléphone" value={String(data.phone)} onChange={(v) => set("phone", v)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-950">Parcours académique</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput label="Dernier diplôme" value={String(data.last_diploma)} onChange={(v) => set("last_diploma", v)} options={diplomaOptions} />
              <SelectInput label="Type / section du Bac tunisien" value={String(data.bac_track)} onChange={(v) => set("bac_track", v)} options={tunisianBacTrackOptions} />
              <TextInput label="Année du Bac" type="number" value={String(data.bac_year)} onChange={(v) => set("bac_year", v)} />
              <TextInput label="Moyenne générale" type="number" placeholder="Ex. 14,50" value={String(data.general_average)} onChange={(v) => set("general_average", v)} />
              <TextInput label="Établissement" value={String(data.institution)} onChange={(v) => set("institution", v)} />
              <TextInput label="Études universitaires actuelles" value={String(data.current_university_studies)} onChange={(v) => set("current_university_studies", v)} />
              <TextInput label="Domaine actuel" value={String(data.current_field)} onChange={(v) => set("current_field", v)} />
              <TextInput label="Nombre de semestres" type="number" value={String(data.university_semesters)} onChange={(v) => set("university_semesters", v)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-950">Langues</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput label="Allemand" value={String(data.german_level)} onChange={(v) => set("german_level", v)} options={languageLevelOptions} />
              <SelectInput label="Anglais" value={String(data.english_level)} onChange={(v) => set("english_level", v)} options={languageLevelOptions} />
              <SelectInput label="Français" value={String(data.french_level)} onChange={(v) => set("french_level", v)} options={languageLevelOptions} />
              <SelectInput label="Certificat de langue" value={String(data.language_certificate)} onChange={(v) => set("language_certificate", v)} options={certificateOptions} />
            </div>
            {data.language_certificate === "other" && (
              <TextInput label="Autre certificat" value={String(data.language_certificate_other)} onChange={(v) => set("language_certificate_other", v)} />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-950">Projet en Allemagne</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectInput label="Niveau visé" required value={String(data.target_degree)} onChange={(v) => set("target_degree", v)} options={degreeOptions} />
              <SelectInput label="Domaine souhaité" required value={String(data.target_field)} onChange={(v) => set("target_field", v)} options={studyFieldOptions} />
              <SelectInput label="Langue d'études souhaitée" required value={String(data.study_language)} onChange={(v) => set("study_language", v)} options={studyLanguageOptions} />
              <TextInput label="Semestre / rentrée souhaitée" required value={String(data.target_intake)} onChange={(v) => set("target_intake", v)} placeholder="Ex. hiver 2027" />
              <PreferredCitiesPicker value={Array.isArray(data.preferred_cities) ? data.preferred_cities : []} onChange={(v) => set("preferred_cities", v)} />
              <SelectInput label="Budget indicatif" value={String(data.budget_range)} onChange={(v) => set("budget_range", v)} options={budgetOptions} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-950">Confirme ton profil</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Vérifie les informations principales avant de créer ton tableau de bord AlmaGo.
              </p>
            </div>
            <dl className="overflow-hidden rounded-2xl border border-slate-200">
              {[
                ["Nom", `${valueOrDash(data.first_name)} ${valueOrDash(data.last_name)}`],
                ["Parcours", `${valueOrDash(data.last_diploma)} · ${valueOrDash(data.institution)}`],
                ["Langues", `DE ${valueOrDash(data.german_level)} · EN ${valueOrDash(data.english_level)} · FR ${valueOrDash(data.french_level)}`],
                ["Projet", `${valueOrDash(data.target_degree)} · ${valueOrDash(data.target_field)}`],
                ["Rentrée", `${valueOrDash(data.target_intake)} · ${valueOrDash(data.study_language)}`],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-2 border-b border-slate-100 p-4 text-sm last:border-b-0 sm:grid-cols-3">
                  <dt className="font-bold text-slate-500">{label}</dt>
                  <dd className="sm:col-span-2 text-slate-950">{value}</dd>
                </div>
              ))}
            </dl>
            <label className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-slate-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4 accent-emerald-700"
              />
              <span>
                J&apos;accepte que les informations fournies soient utilisées pour traiter mon dossier AlmaGo.
                <span className="font-bold text-emerald-800"> Obligatoire.</span>
              </span>
            </label>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          <Button type="button" disabled={saving || step === 1} onClick={() => setStep(step - 1)} variant="secondary">
            Retour
          </Button>
          <Button type="button" disabled={saving} onClick={() => save(step + 1)} className="justify-center">
            {saving ? "Enregistrement..." : step === 5 ? "Valider mon profil" : "Continuer"}
          </Button>
        </div>
      </Card>
    </section>
  );
}
