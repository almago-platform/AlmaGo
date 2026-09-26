"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { languageCourseLevels, type LanguageCourseLevel, type LanguageCoursePurpose } from "@/lib/language-courses";

type Course = {
  id: string;
  title: string;
  provider_name: string;
  city: string | null;
  language: string;
  purpose: LanguageCoursePurpose;
  level_from: LanguageCourseLevel | null;
  level_to: LanguageCourseLevel | null;
  hours_per_week: number | null;
  starts_on: string | null;
  ends_on: string | null;
  price_cents: number | null;
  currency: string | null;
  source_url: string | null;
  application_url: string | null;
  verified_at: string | null;
  is_active: boolean;
};

type FormState = {
  title: string;
  provider_name: string;
  city: string;
  language: string;
  purpose: LanguageCoursePurpose;
  level_from: string;
  level_to: string;
  hours_per_week: string;
  starts_on: string;
  ends_on: string;
  price_eur: string;
  source_url: string;
  application_url: string;
  verified_at: string;
  is_active: boolean;
};

const empty: FormState = {
  title: "", provider_name: "", city: "", language: "Deutsch", purpose: "study_preparation",
  level_from: "", level_to: "", hours_per_week: "", starts_on: "", ends_on: "", price_eur: "",
  source_url: "", application_url: "", verified_at: "", is_active: false,
};

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
}

export function AdminLanguageCoursesPanel({ courses }: { courses: Course[] }) {
  const [form, setForm] = useState<FormState>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function change<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function edit(course: Course) {
    setEditing(course.id);
    setForm({
      title: course.title,
      provider_name: course.provider_name,
      city: course.city || "",
      language: course.language,
      purpose: course.purpose,
      level_from: course.level_from || "",
      level_to: course.level_to || "",
      hours_per_week: course.hours_per_week == null ? "" : String(course.hours_per_week),
      starts_on: course.starts_on || "",
      ends_on: course.ends_on || "",
      price_eur: course.price_cents == null ? "" : (course.price_cents / 100).toFixed(2),
      source_url: course.source_url || "",
      application_url: course.application_url || "",
      verified_at: localDateTime(course.verified_at),
      is_active: course.is_active,
    });
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setForm(empty);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const price = form.price_eur.trim() ? Number(form.price_eur.replace(",", ".")) : null;
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setNotice({ tone: "error", text: "Prix invalide." });
      setBusy(false);
      return;
    }

    const payload = {
      title: form.title,
      provider_name: form.provider_name,
      city: form.city || null,
      language: form.language,
      purpose: form.purpose,
      level_from: form.level_from || null,
      level_to: form.level_to || null,
      hours_per_week: form.hours_per_week ? Number(form.hours_per_week) : null,
      starts_on: form.starts_on || null,
      ends_on: form.ends_on || null,
      price_cents: price === null ? null : Math.round(price * 100),
      currency: price === null ? null : "EUR",
      source_url: form.source_url || null,
      application_url: form.application_url || null,
      verified_at: form.verified_at ? new Date(form.verified_at).toISOString() : null,
      is_active: form.is_active,
      ...(editing ? { id: editing } : {}),
    };

    try {
      const response = await fetch("/api/admin/language-courses", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice({ tone: "error", text: result.error || "Enregistrement impossible." });
        return;
      }
      setNotice({ tone: "success", text: editing ? "Cours mis à jour." : "Cours ajouté." });
      reset();
      window.location.reload();
    } catch {
      setNotice({ tone: "error", text: "Enregistrement impossible. Vérifiez votre connexion puis réessayez." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-7">
      <Card>
        <form onSubmit={save} className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{editing ? "Modification" : "Nouveau cours"}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">{editing ? "Modifier le cours" : "Ajouter un cours"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Un cours actif doit avoir une source officielle valide et une vérification datée.</p>
            </div>
            {editing && <Button type="button" variant="secondary" onClick={reset}>Annuler</Button>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Titre" required value={form.title} onChange={(value) => change("title", value)} />
            <Field label="Fournisseur / école" required value={form.provider_name} onChange={(value) => change("provider_name", value)} />
            <Field label="Ville" value={form.city} onChange={(value) => change("city", value)} />
            <Field label="Langue" required value={form.language} onChange={(value) => change("language", value)} />
            <label className="text-sm font-medium text-slate-700">Objectif<select className="field" value={form.purpose} onChange={(event) => change("purpose", event.target.value as LanguageCoursePurpose)}><option value="study_preparation">Préparation aux études</option><option value="standalone_language">Cours de langue autonome</option></select></label>
            <label className="text-sm font-medium text-slate-700">Niveau de départ<select className="field" value={form.level_from} onChange={(event) => change("level_from", event.target.value)}><option value="">À confirmer</option>{languageCourseLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
            <label className="text-sm font-medium text-slate-700">Niveau cible<select className="field" value={form.level_to} onChange={(event) => change("level_to", event.target.value)}><option value="">À confirmer</option>{languageCourseLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
            <Field label="Heures / semaine" type="number" value={form.hours_per_week} onChange={(value) => change("hours_per_week", value)} />
            <Field label="Début" type="date" value={form.starts_on} onChange={(value) => change("starts_on", value)} />
            <Field label="Fin" type="date" value={form.ends_on} onChange={(value) => change("ends_on", value)} />
            <Field label="Prix EUR" type="number" value={form.price_eur} onChange={(value) => change("price_eur", value)} />
            <Field label="Source officielle" placeholder="https://..." value={form.source_url} onChange={(value) => change("source_url", value)} />
            <Field label="Lien candidature" placeholder="https://..." value={form.application_url} onChange={(value) => change("application_url", value)} />
            <label className="text-sm font-medium text-slate-700">Vérifié le<input className="field" type="datetime-local" value={form.verified_at} onChange={(event) => change("verified_at", event.target.value)} /></label>
            <label className="flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border)] px-4 py-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => change("is_active", event.target.checked)} />Publier dans l’espace étudiant</label>
          </div>

          <Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : editing ? "Enregistrer" : "Ajouter"}</Button>
          {notice && <p role={notice.tone === "error" ? "alert" : "status"} className={notice.tone === "error" ? "text-sm font-semibold text-red-700" : "text-sm font-semibold text-emerald-700"}>{notice.text}</p>}
        </form>
      </Card>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-slate-950">{courses.length} cours enregistré{courses.length > 1 ? "s" : ""}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id} className="shadow-none">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-lg font-bold text-slate-950">{course.title}</p><p className="mt-1 text-sm text-slate-600">{course.provider_name}{course.city ? " · " + course.city : ""}</p></div>
                <Badge variant={course.is_active ? "success" : "neutral"}>{course.is_active ? "Publié" : "Brouillon"}</Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--brand)]">{course.purpose === "study_preparation" ? "Préparation aux études" : "Cours de langue autonome"}</p>
              <div className="mt-5"><Button type="button" variant="secondary" onClick={() => edit(course)}>Modifier</Button></div>
            </Card>
          ))}
          {!courses.length && <Card className="shadow-none"><p className="text-sm text-slate-600">Aucun cours enregistré.</p></Card>}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, required = false, placeholder = "", type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string; type?: string }) {
  return <label className="text-sm font-medium text-slate-700">{label}<input className="field" type={type} required={required} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
