"use client";

import { useId, useMemo, useState } from "react";
import { preferredCityOptions, type SelectOption } from "@/lib/student/profile-options";

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return <span>{label}{required ? <span className="text-emerald-700"> *</span> : <span className="ml-1 font-normal text-slate-500">(facultatif)</span>}</span>;
}

export function TextInput({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="block text-sm font-medium text-slate-700"><FieldLabel label={label} required={required} /><input required={required} type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className="field" /></label>;
}

export function SelectInput({ label, value, onChange, options, required = false }: { label: string; value: string; onChange: (value: string) => void; options: readonly SelectOption[]; required?: boolean }) {
  const hasLegacyValue = value !== "" && !options.some((option) => option.value === value);
  return <label className="block text-sm font-medium text-slate-700"><FieldLabel label={label} required={required} /><select required={required} value={value} onChange={(event) => onChange(event.target.value)} className="field"><option value="">Choisir…</option>{hasLegacyValue && <option value={value}>{value} — à mettre à jour</option>}{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{hasLegacyValue && <span className="mt-1 block text-xs font-normal text-amber-700">Choisis une valeur de la liste avant d’enregistrer.</span>}</label>;
}

/** Native datalist keeps a compact, keyboard-friendly nationality search. Server validation accepts only its values. */
export function SearchableDatalistInput({ label, value, onChange, options, required = false }: { label: string; value: string; onChange: (value: string) => void; options: readonly SelectOption[]; required?: boolean }) {
  const id = useId();
  const hasLegacyValue = value !== "" && !options.some((option) => option.value === value);
  return <label className="block text-sm font-medium text-slate-700"><FieldLabel label={label} required={required} /><input required={required} list={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Rechercher une nationalité" className="field" /><datalist id={id}>{options.map((option) => <option key={option.value} value={option.value} />)}</datalist>{hasLegacyValue && <span className="mt-1 block text-xs font-normal text-amber-700">Choisis une valeur proposée avant d’enregistrer.</span>}</label>;
}

export function PreferredCitiesPicker({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [query, setQuery] = useState("");
  const cities = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr-FR");
    return normalized ? preferredCityOptions.filter((city) => city.toLocaleLowerCase("fr-FR").includes(normalized)) : preferredCityOptions;
  }, [query]);
  function toggle(city: string) {
    onChange(value.includes(city) ? value.filter((item) => item !== city) : [...value, city]);
  }
  const legacyCities = value.filter((city) => !preferredCityOptions.includes(city as (typeof preferredCityOptions)[number]));
  return <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-slate-700"><FieldLabel label="Villes préférées" /></legend><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une ville en Allemagne" className="field" />{legacyCities.length > 0 && <div className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Valeur existante à remplacer ou retirer : {legacyCities.map((city) => <button type="button" key={city} onClick={() => toggle(city)} className="ml-2 rounded-md bg-white px-2 py-1 underline">{city} ×</button>)}</div>}<div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3">{cities.map((city) => <button type="button" key={city} onClick={() => toggle(city)} aria-pressed={value.includes(city)} className={`rounded-lg px-3 py-1.5 text-sm ${value.includes(city) ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>{city}</button>)}</div>{value.length > 0 && <p className="mt-2 text-sm text-slate-600">Sélection : {value.join(", ")}</p>}</fieldset>;
}
