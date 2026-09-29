"use client";

import { useState } from "react";
import { PreferredCitiesPicker, SearchableDatalistInput, SelectInput, TextInput } from "@/components/student/ProfileControls";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentProfileCopy } from "@/content/student-profile-copy";
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
  const { locale } = useLocale();
  const t = studentProfileCopy[locale];
  const f = t.form.fields;
  const set = (key: string, value: string | string[]) => setData((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/student/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) setError(locale === "fr" && typeof result.error === "string" ? result.error : t.form.saveError);
      else setStatus(t.form.saved);
    } catch {
      setError(t.form.networkError);
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="space-y-6 sm:space-y-8">
    <ProfileSection badge={t.form.identityBadge} title={t.form.identityTitle} description={t.form.identityText}>
      <TextInput label={f.first_name} required value={String(data.first_name)} onChange={(value) => set("first_name", value)} inputDir="auto" />
      <TextInput label={f.last_name} required value={String(data.last_name)} onChange={(value) => set("last_name", value)} inputDir="auto" />
      <TextInput label={f.birth_date} type="date" value={String(data.birth_date)} onChange={(value) => set("birth_date", value)} inputDir="ltr" />
      <SearchableDatalistInput label={f.nationality} required value={String(data.nationality)} onChange={(value) => set("nationality", value)} options={nationalityOptions} />
      <TextInput label={f.current_city} value={String(data.current_city)} onChange={(value) => set("current_city", value)} inputDir="auto" />
      <TextInput label={f.phone} type="tel" value={String(data.phone)} onChange={(value) => set("phone", value)} inputDir="ltr" />
    </ProfileSection>

    <ProfileSection badge={t.form.studiesBadge} title={t.form.studiesTitle} description={t.form.studiesText}>
      <SelectInput label={f.last_diploma} value={String(data.last_diploma)} onChange={(value) => set("last_diploma", value)} options={diplomaOptions} />
      <SelectInput label={f.bac_track} value={String(data.bac_track)} onChange={(value) => set("bac_track", value)} options={tunisianBacTrackOptions} />
      <TextInput label={f.bac_year} type="number" value={String(data.bac_year)} onChange={(value) => set("bac_year", value)} inputDir="ltr" />
      <TextInput label={f.general_average} type="number" value={String(data.general_average)} onChange={(value) => set("general_average", value)} inputDir="ltr" />
      <TextInput label={f.institution} value={String(data.institution)} onChange={(value) => set("institution", value)} inputDir="auto" />
      <TextInput label={f.current_university_studies} value={String(data.current_university_studies)} onChange={(value) => set("current_university_studies", value)} inputDir="auto" />
      <TextInput label={f.current_field} value={String(data.current_field)} onChange={(value) => set("current_field", value)} inputDir="auto" />
      <TextInput label={f.university_semesters} type="number" value={String(data.university_semesters)} onChange={(value) => set("university_semesters", value)} inputDir="ltr" />
    </ProfileSection>

    <ProfileSection badge={t.form.languagesBadge} title={t.form.languagesTitle} description={t.form.languagesText}>
      <SelectInput label={f.german_level} value={String(data.german_level)} onChange={(value) => set("german_level", value)} options={languageLevelOptions} />
      <SelectInput label={f.english_level} value={String(data.english_level)} onChange={(value) => set("english_level", value)} options={languageLevelOptions} />
      <SelectInput label={f.french_level} value={String(data.french_level)} onChange={(value) => set("french_level", value)} options={languageLevelOptions} />
      <SelectInput label={f.language_certificate} value={String(data.language_certificate)} onChange={(value) => set("language_certificate", value)} options={certificateOptions} />
      {data.language_certificate === "other" && <TextInput label={f.language_certificate_other} value={String(data.language_certificate_other)} onChange={(value) => set("language_certificate_other", value)} inputDir="auto" />}
    </ProfileSection>

    <ProfileSection badge={t.form.projectBadge} title={t.form.projectTitle} description={t.form.projectText}>
      <SelectInput label={f.target_degree} required value={String(data.target_degree)} onChange={(value) => set("target_degree", value)} options={degreeOptions} />
      <SelectInput label={f.target_field} required value={String(data.target_field)} onChange={(value) => set("target_field", value)} options={studyFieldOptions} />
      <SelectInput label={f.study_language} required value={String(data.study_language)} onChange={(value) => set("study_language", value)} options={studyLanguageOptions} />
      <TextInput label={f.target_intake} required value={String(data.target_intake)} onChange={(value) => set("target_intake", value)} inputDir="auto" />
      <PreferredCitiesPicker value={Array.isArray(data.preferred_cities) ? data.preferred_cities : []} onChange={(value) => set("preferred_cities", value)} />
      <SelectInput label={f.budget_range} value={String(data.budget_range)} onChange={(value) => set("budget_range", value)} options={budgetOptions} />
    </ProfileSection>

    {error && <p role="alert" className="rounded-[var(--radius-control)] border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {status && <p role="status" className="rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p>}

    <div className="student-sticky-actions sticky bottom-0 -mx-5 border-t border-[var(--border)] bg-white/98 px-5 py-4 sm:-mx-6 sm:px-6">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-start">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving ? t.form.saving : t.form.save}</Button>
        <p className="text-sm leading-6 text-slate-500">{t.form.saveHint}</p>
      </div>
    </div>
  </form>;
}

function ProfileSection({ badge, title, description, children }: { badge: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5">
      <div className="mb-5 border-b border-[var(--border)] pb-4">
        <Badge variant="neutral">{badge}</Badge>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
