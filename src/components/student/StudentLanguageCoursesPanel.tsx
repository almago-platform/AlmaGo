"use client";

import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Course = {
  id: string;
  title: string;
  provider_name: string;
  city: string | null;
  language: string;
  purpose: "study_preparation" | "standalone_language";
  level_from: string | null;
  level_to: string | null;
  hours_per_week: number | null;
  starts_on: string | null;
  ends_on: string | null;
  price_cents: number | null;
  currency: string | null;
  source_url: string | null;
  application_url: string | null;
  verified_at: string | null;
};

type Filters = {
  purpose: string;
  city: string;
  language: string;
  level_from: string;
  level_to: string;
};

const emptyFilters: Filters = {
  purpose: "",
  city: "",
  language: "",
  level_from: "",
  level_to: "",
};

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

function purposeLabel(purpose: Course["purpose"]) {
  return purpose === "study_preparation"
    ? "Préparation aux études"
    : "Cours de langue autonome";
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

function formatVerification(value: string | null) {
  if (!value) return "À confirmer";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "À confirmer";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

function formatPrice(course: Course) {
  if (course.price_cents === null || !course.currency) return "À confirmer";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: course.currency,
  }).format(course.price_cents / 100);
}

function levelLabel(course: Course) {
  if (course.level_from && course.level_to) {
    return course.level_from === course.level_to
      ? course.level_from
      : `${course.level_from} → ${course.level_to}`;
  }
  return course.level_from || course.level_to || "À confirmer";
}

export function StudentLanguageCoursesPanel() {
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value.trim()) params.set(key, value.trim());
      }

      try {
        const response = await fetch(
          `/api/student/language-courses${params.size ? `?${params.toString()}` : ""}`,
          { signal: controller.signal },
        );
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (active) {
            setCourses([]);
            setError(result.error || "Impossible de charger les cours vérifiés pour le moment.");
          }
          return;
        }

        if (active) setCourses(Array.isArray(result.courses) ? result.courses : []);
      } catch (loadError) {
        if (active && !(loadError instanceof DOMException && loadError.name === "AbortError")) {
          setCourses([]);
          setError("Impossible de charger les cours vérifiés pour le moment.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [filters]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters(draftFilters);
  }

  function clearFilters() {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  }

  return (
    <div className="mt-8 space-y-6">
      <Card className="border-[var(--brand-border)] bg-[var(--brand-soft)]/40 shadow-none">
        <h2 className="text-lg font-bold text-slate-950">Comment lire ce catalogue ?</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
          Les informations affichées proviennent de fiches vérifiées dans AlmaGo. Un cours intensif n’est pas automatiquement une préparation universitaire. La présence d’un cours ici ne constitue ni une décision d’admission ni une décision de visa.
        </p>
      </Card>

      <Card className="shadow-none">
        <form onSubmit={applyFilters} aria-label="Filtrer les cours de langue">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block text-sm font-medium text-slate-700">
              Type de cours
              <select
                className="field"
                value={draftFilters.purpose}
                onChange={(event) => setDraftFilters((current) => ({ ...current, purpose: event.target.value }))}
              >
                <option value="">Tous</option>
                <option value="study_preparation">Préparation aux études</option>
                <option value="standalone_language">Cours de langue autonome</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Ville
              <input
                className="field"
                value={draftFilters.city}
                onChange={(event) => setDraftFilters((current) => ({ ...current, city: event.target.value }))}
                placeholder="Ex. Berlin"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Langue
              <input
                className="field"
                value={draftFilters.language}
                onChange={(event) => setDraftFilters((current) => ({ ...current, language: event.target.value }))}
                placeholder="Ex. Deutsch"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Niveau de départ
              <select
                className="field"
                value={draftFilters.level_from}
                onChange={(event) => setDraftFilters((current) => ({ ...current, level_from: event.target.value }))}
              >
                <option value="">Tous</option>
                {levels.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Niveau cible
              <select
                className="field"
                value={draftFilters.level_to}
                onChange={(event) => setDraftFilters((current) => ({ ...current, level_to: event.target.value }))}
              >
                <option value="">Tous</option>
                {levels.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="submit">Appliquer les filtres</Button>
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </div>
        </form>
      </Card>

      <section aria-live="polite" aria-busy={loading} aria-labelledby="language-course-results-title">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Catalogue vérifié</p>
            <h2 id="language-course-results-title" className="mt-1 text-2xl font-bold text-slate-950">
              Cours disponibles
            </h2>
          </div>
          {!loading && !error && (
            <p className="text-sm text-slate-500">
              {courses.length} cours affiché{courses.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading && (
          <Card className="border-dashed shadow-none">
            <p className="text-sm text-slate-600">Chargement des cours vérifiés…</p>
          </Card>
        )}

        {!loading && error && (
          <Card className="border-red-200 bg-red-50/50 shadow-none">
            <div role="alert">
              <h3 className="font-bold text-red-950">Catalogue temporairement indisponible</h3>
              <p className="mt-2 text-sm leading-6 text-red-800">{error}</p>
            </div>
          </Card>
        )}

        {!loading && !error && courses.length === 0 && (
          <Card className="border-dashed text-center shadow-none">
            <h3 className="font-bold text-slate-950">Aucun cours ne correspond à ces filtres.</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Essayez d’élargir vos critères. Aucune information manquante n’est remplacée par une estimation.
            </p>
          </Card>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {courses.map((course) => {
              const start = formatDate(course.starts_on);
              const end = formatDate(course.ends_on);
              return (
                <Card as="article" key={course.id} className="flex h-full flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--brand)] [overflow-wrap:anywhere]">
                          {course.provider_name}
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-slate-950 [overflow-wrap:anywhere]">
                          {course.title}
                        </h3>
                      </div>
                      <Badge variant={course.purpose === "study_preparation" ? "info" : "neutral"}>
                        {purposeLabel(course.purpose)}
                      </Badge>
                    </div>

                    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Fact label="Ville" value={course.city || "À confirmer"} />
                      <Fact label="Langue" value={course.language} />
                      <Fact label="Niveaux" value={levelLabel(course)} />
                      <Fact
                        label="Volume"
                        value={course.hours_per_week === null ? "À confirmer" : `${course.hours_per_week} h / semaine`}
                      />
                      <Fact
                        label="Période"
                        value={start || end ? [start, end].filter(Boolean).join(" → ") : "À confirmer"}
                      />
                      <Fact label="Prix" value={formatPrice(course)} />
                    </dl>

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      Dernière vérification enregistrée : {formatVerification(course.verified_at)}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row">
                    {course.source_url && (
                      <a
                        href={course.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                      >
                        Voir la source officielle
                      </a>
                    )}
                    {course.application_url && (
                      <a
                        href={course.application_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
                      >
                        Voir le lien d’inscription
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] bg-[var(--surface-muted)] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-5 text-slate-900 [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
