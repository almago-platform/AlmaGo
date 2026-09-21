"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PreferredCitiesPicker, SearchableDatalistInput, SelectInput, TextInput } from "@/components/student/ProfileControls";
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
const initial: FormData = { first_name: "", last_name: "", birth_date: "", nationality: "Tunisienne", current_city: "", phone: "", last_diploma: "", bac_track: "", bac_year: "", general_average: "", institution: "", current_university_studies: "", current_field: "", university_semesters: "", german_level: "none", english_level: "none", french_level: "none", language_certificate: "none", language_certificate_other: "", target_degree: "", target_field: "", study_language: "", target_intake: "", preferred_cities: [], budget_range: "" };

function mergeProfile(profile: Partial<FormData>): FormData { return { ...initial, ...profile, preferred_cities: Array.isArray(profile.preferred_cities) ? profile.preferred_cities : [] }; }

export function OnboardingForm({ profile }: { profile: Partial<FormData> }) {
  const [step, setStep] = useState(1); const [data, setData] = useState(() => mergeProfile(profile)); const [consent, setConsent] = useState(false); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); const router = useRouter();
  const set = (key: string, value: string | string[]) => setData((current) => ({ ...current, [key]: value }));
  async function save(nextStep: number) {
    setError("");
    const requiredByStep: Record<number, string[]> = { 1: ["first_name", "last_name", "nationality"], 4: ["target_degree", "target_field", "study_language", "target_intake"] };
    if (requiredByStep[step]?.some((key) => !String(data[key] || "").trim())) {
      setError("Complète les champs marqués d’un * avant de continuer.");
      return;
    }
    setSaving(true);
    const response = await fetch("/api/student/onboarding", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, complete: nextStep === 6, consentAccepted: consent }) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { setError(result.error || "Une erreur est survenue."); return; }
    if (nextStep === 6) router.push("/student"); else setStep(nextStep);
  }
  const progress = `${step * 20}%`;
  return <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="mb-8"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">AlmaGo</p><h1 className="mt-2 text-2xl font-semibold text-slate-950">Ton projet, étape par étape</h1></div><span className="text-sm text-slate-500">{step}/5</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: progress }} /></div><p className="mt-2 text-sm text-slate-500">Tu peux revenir en arrière. Tes étapes sont sauvegardées.</p></div>
    {step === 1 && <div className="space-y-4"><h2 className="text-xl font-semibold">Informations personnelles</h2><div className="grid gap-4 sm:grid-cols-2"><TextInput label="Prénom" required value={String(data.first_name)} onChange={(v) => set("first_name", v)} /><TextInput label="Nom" required value={String(data.last_name)} onChange={(v) => set("last_name", v)} /><TextInput label="Date de naissance" type="date" value={String(data.birth_date)} onChange={(v) => set("birth_date", v)} /><SearchableDatalistInput label="Nationalité" required value={String(data.nationality)} onChange={(v) => set("nationality", v)} options={nationalityOptions} /><TextInput label="Ville actuelle" value={String(data.current_city)} onChange={(v) => set("current_city", v)} /><TextInput label="Téléphone" value={String(data.phone)} onChange={(v) => set("phone", v)} /></div></div>}
    {step === 2 && <div className="space-y-4"><h2 className="text-xl font-semibold">Parcours académique</h2><div className="grid gap-4 sm:grid-cols-2"><SelectInput label="Dernier diplôme" value={String(data.last_diploma)} onChange={(v) => set("last_diploma", v)} options={diplomaOptions} /><SelectInput label="Type / section du Bac tunisien" value={String(data.bac_track)} onChange={(v) => set("bac_track", v)} options={tunisianBacTrackOptions} /><TextInput label="Année du Bac" type="number" value={String(data.bac_year)} onChange={(v) => set("bac_year", v)} /><TextInput label="Moyenne générale" type="number" placeholder="Ex. 14,50" value={String(data.general_average)} onChange={(v) => set("general_average", v)} /><TextInput label="Établissement" value={String(data.institution)} onChange={(v) => set("institution", v)} /><TextInput label="Études universitaires actuelles" value={String(data.current_university_studies)} onChange={(v) => set("current_university_studies", v)} /><TextInput label="Domaine actuel" value={String(data.current_field)} onChange={(v) => set("current_field", v)} /><TextInput label="Nombre de semestres" type="number" value={String(data.university_semesters)} onChange={(v) => set("university_semesters", v)} /></div></div>}
    {step === 3 && <div className="space-y-4"><h2 className="text-xl font-semibold">Langues</h2><div className="grid gap-4 sm:grid-cols-2"><SelectInput label="Allemand" value={String(data.german_level)} onChange={(v) => set("german_level", v)} options={languageLevelOptions} /><SelectInput label="Anglais" value={String(data.english_level)} onChange={(v) => set("english_level", v)} options={languageLevelOptions} /><SelectInput label="Français" value={String(data.french_level)} onChange={(v) => set("french_level", v)} options={languageLevelOptions} /><SelectInput label="Certificat de langue" value={String(data.language_certificate)} onChange={(v) => set("language_certificate", v)} options={certificateOptions} /></div>{data.language_certificate === "other" && <TextInput label="Autre certificat" value={String(data.language_certificate_other)} onChange={(v) => set("language_certificate_other", v)} />}</div>}
    {step === 4 && <div className="space-y-4"><h2 className="text-xl font-semibold">Projet en Allemagne</h2><div className="grid gap-4 sm:grid-cols-2"><SelectInput label="Niveau visé" required value={String(data.target_degree)} onChange={(v) => set("target_degree", v)} options={degreeOptions} /><SelectInput label="Domaine souhaité" required value={String(data.target_field)} onChange={(v) => set("target_field", v)} options={studyFieldOptions} /><SelectInput label="Langue d’études souhaitée" required value={String(data.study_language)} onChange={(v) => set("study_language", v)} options={studyLanguageOptions} /><TextInput label="Semestre / rentrée souhaitée" required value={String(data.target_intake)} onChange={(v) => set("target_intake", v)} placeholder="Ex. hiver 2027" /><PreferredCitiesPicker value={Array.isArray(data.preferred_cities) ? data.preferred_cities : []} onChange={(v) => set("preferred_cities", v)} /><SelectInput label="Budget indicatif" value={String(data.budget_range)} onChange={(v) => set("budget_range", v)} options={budgetOptions} /></div></div>}
    {step === 5 && <div className="space-y-5"><h2 className="text-xl font-semibold">Confirme ton profil</h2><dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200">{[["Nom", `${data.first_name} ${data.last_name}`], ["Parcours", `${data.last_diploma || "—"} · ${data.institution || "—"}`], ["Langues", `DE ${data.german_level || "Aucun"} · EN ${data.english_level || "Aucun"} · FR ${data.french_level || "Aucun"}`], ["Projet", `${data.target_degree} · ${data.target_field}`], ["Rentrée", `${data.target_intake} · ${data.study_language}`]].map(([label, value]) => <div key={label} className="grid grid-cols-3 gap-3 p-4 text-sm"><dt className="font-medium text-slate-500">{label}</dt><dd className="col-span-2 text-slate-900">{value}</dd></div>)}</dl><label className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-slate-700"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-emerald-700" />J’accepte que les informations fournies soient utilisées pour traiter mon dossier AlmaGo. <span className="text-emerald-800">(obligatoire)</span></label></div>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-8 flex justify-between gap-3"><button disabled={saving || step === 1} onClick={() => setStep(step - 1)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40">Retour</button><button disabled={saving} onClick={() => save(step + 1)} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Enregistrement…" : step === 5 ? "Valider mon profil" : "Continuer"}</button></div>
  </section>;
}
