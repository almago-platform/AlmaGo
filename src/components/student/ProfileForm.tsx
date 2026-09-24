"use client";

import { useState } from "react";
import { PreferredCitiesPicker, SearchableDatalistInput, SelectInput, TextInput } from "@/components/student/ProfileControls";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  const [saving, setSaving] = useState(false);
  const set = (key: string, value: string | string[]) => setData((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/student/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) setError(result.error || "Nous n’arrivons pas à enregistrer vos modifications pour le moment.");
      else setStatus("Vos modifications ont bien été enregistrées dans votre dossier.");
    } catch {
      setError("Nous n’arrivons pas à enregistrer votre profil pour le moment. Vérifiez votre connexion puis réessayez.");
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="space-y-6 sm:space-y-8">
    <ProfileSection badge="Identité" title="Informations personnelles" description="Ces informations permettent d’identifier correctement votre dossier.">
      <TextInput label="Prénom" required value={String(data.first_name)} onChange={(value) => set("first_name", value)} />
      <TextInput label="Nom" required value={String(data.last_name)} onChange={(value) => set("last_name", value)} />
      <TextInput label="Date de naissance" type="date" value={String(data.birth_date)} onChange={(value) => set("birth_date", value)} />
      <SearchableDatalistInput label="Nationalité" required value={String(data.nationality)} onChange={(value) => set("nationality", value)} options={nationalityOptions} />
      <TextInput label="Ville actuelle" value={String(data.current_city)} onChange={(value) => set("current_city", value)} />
      <TextInput label="Téléphone" value={String(data.phone)} onChange={(value) => set("phone", value)} />
    </ProfileSection>

    <ProfileSection badge="Études" title="Parcours académique" description="Indiquez votre parcours actuel ou le dernier diplôme obtenu.">
      <SelectInput label="Dernier diplôme" value={String(data.last_diploma)} onChange={(value) => set("last_diploma", value)} options={diplomaOptions} />
      <SelectInput label="Type / section du Bac tunisien" value={String(data.bac_track)} onChange={(value) => set("bac_track", value)} options={tunisianBacTrackOptions} />
      <TextInput label="Année du Bac" type="number" value={String(data.bac_year)} onChange={(value) => set("bac_year", value)} />
      <TextInput label="Moyenne générale" type="number" value={String(data.general_average)} onChange={(value) => set("general_average", value)} />
      <TextInput label="Établissement" value={String(data.institution)} onChange={(value) => set("institution", value)} />
      <TextInput label="Études universitaires actuelles" value={String(data.current_university_studies)} onChange={(value) => set("current_university_studies", value)} />
      <TextInput label="Domaine actuel" value={String(data.current_field)} onChange={(value) => set("current_field", value)} />
      <TextInput label="Nombre de semestres" type="number" value={String(data.university_semesters)} onChange={(value) => set("university_semesters", value)} />
    </ProfileSection>

    <ProfileSection badge="Langues" title="Niveaux linguistiques" description="Ajoutez uniquement les niveaux ou certificats que vous pouvez expliquer dans votre dossier.">
      <SelectInput label="Allemand" value={String(data.german_level)} onChange={(value) => set("german_level", value)} options={languageLevelOptions} />
      <SelectInput label="Anglais" value={String(data.english_level)} onChange={(value) => set("english_level", value)} options={languageLevelOptions} />
      <SelectInput label="Français" value={String(data.french_level)} onChange={(value) => set("french_level", value)} options={languageLevelOptions} />
      <SelectInput label="Certificat" value={String(data.language_certificate)} onChange={(value) => set("language_certificate", value)} options={certificateOptions} />
      {data.language_certificate === "other" && <TextInput label="Autre certificat" value={String(data.language_certificate_other)} onChange={(value) => set("language_certificate_other", value)} />}
    </ProfileSection>

    <ProfileSection badge="Projet" title="Projet en Allemagne" description="Ces éléments aident à préparer les pistes de programmes et les prochaines démarches.">
      <SelectInput label="Niveau visé" required value={String(data.target_degree)} onChange={(value) => set("target_degree", value)} options={degreeOptions} />
      <SelectInput label="Domaine souhaité" required value={String(data.target_field)} onChange={(value) => set("target_field", value)} options={studyFieldOptions} />
      <SelectInput label="Langue d’études souhaitée" required value={String(data.study_language)} onChange={(value) => set("study_language", value)} options={studyLanguageOptions} />
      <TextInput label="Semestre / rentrée souhaitée" required value={String(data.target_intake)} onChange={(value) => set("target_intake", value)} />
      <PreferredCitiesPicker value={Array.isArray(data.preferred_cities) ? data.preferred_cities : []} onChange={(value) => set("preferred_cities", value)} />
      <SelectInput label="Budget indicatif" value={String(data.budget_range)} onChange={(value) => set("budget_range", value)} options={budgetOptions} />
    </ProfileSection>

    {error && <p role="alert" className="rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {status && <p role="status" className="rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p>}

    <div className="student-sticky-actions sticky bottom-0 -mx-5 border-t border-[var(--border)] bg-[var(--surface)]/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">Enregistrez vos modifications avant de quitter cette page.</p>
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving ? "Enregistrement…" : "Enregistrer les modifications"}</Button>
      </div>
    </div>
  </form>;
}

function ProfileSection({ badge, title, description, children }: { badge: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5">
      <div className="mb-5 border-b border-[var(--border)] pb-4">
        <Badge variant="neutral">{badge}</Badge>
        <h2 className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
