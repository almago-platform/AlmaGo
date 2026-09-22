"use client";

import { useState } from "react";
import { PreferredCitiesPicker, SearchableDatalistInput, SelectInput, TextInput } from "@/components/student/ProfileControls";
import { Button } from "@/components/ui/Button";
import { budgetOptions, certificateOptions, degreeOptions, diplomaOptions, languageLevelOptions, nationalityOptions, studyFieldOptions, studyLanguageOptions, tunisianBacTrackOptions } from "@/lib/student/profile-options";

type Values = Record<string, string | string[]>;
const textKeys = ["first_name", "last_name", "birth_date", "nationality", "current_city", "phone", "last_diploma", "bac_track", "bac_year", "general_average", "institution", "current_university_studies", "current_field", "university_semesters", "german_level", "english_level", "french_level", "language_certificate", "language_certificate_other", "target_degree", "target_field", "study_language", "target_intake", "budget_range"];

function initial(profile: Record<string, unknown>): Values {
  const values = Object.fromEntries(textKeys.map((key) => [key, profile[key] == null ? "" : String(profile[key])])) as Values;
  values.preferred_cities = Array.isArray(profile.preferred_cities) ? profile.preferred_cities.filter((city): city is string => typeof city === "string") : [];
  return values;
}

export function ProfileForm({ profile }: { profile: Record<string, unknown> }) {
  const [data, setData] = useState(() => initial(profile));
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const set = (key: string, value: string | string[]) => setData((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setStatus(""); setError("");
    const response = await fetch("/api/student/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) setError(result.error || "Impossible d’enregistrer."); else setStatus("Modifications enregistrées.");
  }
  return <form onSubmit={submit} className="space-y-8">
    <section><h2 className="section-title">Informations personnelles</h2><div className="grid gap-4 sm:grid-cols-2">
      <TextInput label="Prénom" required value={String(data.first_name)} onChange={(value) => set("first_name", value)} /><TextInput label="Nom" required value={String(data.last_name)} onChange={(value) => set("last_name", value)} /><TextInput label="Date de naissance" type="date" value={String(data.birth_date)} onChange={(value) => set("birth_date", value)} /><SearchableDatalistInput label="Nationalité" required value={String(data.nationality)} onChange={(value) => set("nationality", value)} options={nationalityOptions} /><TextInput label="Ville actuelle" value={String(data.current_city)} onChange={(value) => set("current_city", value)} /><TextInput label="Téléphone" value={String(data.phone)} onChange={(value) => set("phone", value)} />
    </div></section>
    <section><h2 className="section-title">Parcours académique</h2><div className="grid gap-4 sm:grid-cols-2">
      <SelectInput label="Dernier diplôme" value={String(data.last_diploma)} onChange={(value) => set("last_diploma", value)} options={diplomaOptions} /><SelectInput label="Type / section du Bac tunisien" value={String(data.bac_track)} onChange={(value) => set("bac_track", value)} options={tunisianBacTrackOptions} /><TextInput label="Année du Bac" type="number" value={String(data.bac_year)} onChange={(value) => set("bac_year", value)} /><TextInput label="Moyenne générale" type="number" value={String(data.general_average)} onChange={(value) => set("general_average", value)} /><TextInput label="Établissement" value={String(data.institution)} onChange={(value) => set("institution", value)} /><TextInput label="Études universitaires actuelles" value={String(data.current_university_studies)} onChange={(value) => set("current_university_studies", value)} /><TextInput label="Domaine actuel" value={String(data.current_field)} onChange={(value) => set("current_field", value)} /><TextInput label="Nombre de semestres" type="number" value={String(data.university_semesters)} onChange={(value) => set("university_semesters", value)} />
    </div></section>
    <section><h2 className="section-title">Langues</h2><div className="grid gap-4 sm:grid-cols-2">
      <SelectInput label="Allemand" value={String(data.german_level)} onChange={(value) => set("german_level", value)} options={languageLevelOptions} /><SelectInput label="Anglais" value={String(data.english_level)} onChange={(value) => set("english_level", value)} options={languageLevelOptions} /><SelectInput label="Français" value={String(data.french_level)} onChange={(value) => set("french_level", value)} options={languageLevelOptions} /><SelectInput label="Certificat" value={String(data.language_certificate)} onChange={(value) => set("language_certificate", value)} options={certificateOptions} />{data.language_certificate === "other" && <TextInput label="Autre certificat" value={String(data.language_certificate_other)} onChange={(value) => set("language_certificate_other", value)} />}
    </div></section>
    <section><h2 className="section-title">Projet en Allemagne</h2><div className="grid gap-4 sm:grid-cols-2">
      <SelectInput label="Niveau visé" required value={String(data.target_degree)} onChange={(value) => set("target_degree", value)} options={degreeOptions} /><SelectInput label="Domaine souhaité" required value={String(data.target_field)} onChange={(value) => set("target_field", value)} options={studyFieldOptions} /><SelectInput label="Langue d’études souhaitée" required value={String(data.study_language)} onChange={(value) => set("study_language", value)} options={studyLanguageOptions} /><TextInput label="Semestre / rentrée souhaitée" required value={String(data.target_intake)} onChange={(value) => set("target_intake", value)} /><PreferredCitiesPicker value={Array.isArray(data.preferred_cities) ? data.preferred_cities : []} onChange={(value) => set("preferred_cities", value)} /><SelectInput label="Budget indicatif" value={String(data.budget_range)} onChange={(value) => set("budget_range", value)} options={budgetOptions} />
    </div></section>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{status && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p>}
    <Button type="submit">Enregistrer les modifications</Button>
  </form>;
}
