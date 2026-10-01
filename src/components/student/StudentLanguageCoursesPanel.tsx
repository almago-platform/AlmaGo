"use client";

import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentLanguageCoursesCopy } from "@/content/student-language-courses-copy";
import { rebrandCopy } from "@/lib/brand";
import { catalogVerificationExpiresAt } from "@/lib/catalog-freshness";
import { localizeCatalogueLabel } from "@/lib/student/arabic-display";

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

function purposeLabel(
  purpose: Course["purpose"],
  copy: (typeof studentLanguageCoursesCopy)["fr"]["panel"],
) {
  return copy.purpose[purpose];
}

function formatDate(
  value: string | null,
  copy: (typeof studentLanguageCoursesCopy)["fr"]["panel"],
) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(copy.intlLocale, { dateStyle: "medium" }).format(date);
}

function formatVerification(
  value: string | null,
  copy: (typeof studentLanguageCoursesCopy)["fr"]["panel"],
) {
  if (!value) return copy.unknown;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return copy.unknown;
  return new Intl.DateTimeFormat(copy.intlLocale, { dateStyle: "medium" }).format(date);
}

function formatPrice(
  course: Course,
  copy: (typeof studentLanguageCoursesCopy)["fr"]["panel"],
) {
  if (course.price_cents === null || !course.currency) return copy.unknown;
  return new Intl.NumberFormat(copy.intlLocale, {
    style: "currency",
    currency: course.currency,
    currencyDisplay: copy.intlLocale === "ar-TN" ? "code" : "symbol",
  }).format(course.price_cents / 100);
}

function levelLabel(
  course: Course,
  copy: (typeof studentLanguageCoursesCopy)["fr"]["panel"],
) {
  if (course.level_from && course.level_to) {
    return course.level_from === course.level_to
      ? course.level_from
      : `${course.level_from} → ${course.level_to}`;
  }
  return course.level_from || course.level_to || copy.unknown;
}

export function StudentLanguageCoursesPanel() {
  const { locale } = useLocale();
  const t = rebrandCopy(studentLanguageCoursesCopy[locale]).panel;
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectionPublishable, setSelectionPublishable] = useState(true);
  const [selectionLoading, setSelectionLoading] = useState(true);
  const [selectionError, setSelectionError] = useState("");
  const [selectionBusy, setSelectionBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadSelection() {
      setSelectionLoading(true);
      setSelectionError("");
      try {
        const response = await fetch("/api/student/language-course-selection", { signal: controller.signal });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (active) setSelectionError(t.selectionLoadError);
          return;
        }
        if (active) {
          setSelectedCourseId(result.selection?.language_course_id || null);
          setSelectionPublishable(result.selection ? result.selection.publishable === true : true);
        }
      } catch (selectionLoadError) {
        if (active && !(selectionLoadError instanceof DOMException && selectionLoadError.name === "AbortError")) {
          setSelectionError(t.selectionLoadError);
        }
      } finally {
        if (active) setSelectionLoading(false);
      }
    }

    void loadSelection();
    return () => {
      active = false;
      controller.abort();
    };
  }, [t]);

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
            setError(t.coursesLoadError);
          }
          return;
        }

        if (active) setCourses(Array.isArray(result.courses) ? result.courses : []);
      } catch (loadError) {
        if (active && !(loadError instanceof DOMException && loadError.name === "AbortError")) {
          setCourses([]);
          setError(t.coursesLoadError);
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
  }, [filters, t]);

  async function selectCourse(courseId: string) {
    setSelectionBusy(courseId);
    setSelectionError("");
    try {
      const response = await fetch("/api/student/language-course-selection", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language_course_id: courseId }),
      });
      await response.json().catch(() => ({}));
      if (!response.ok) {
        setSelectionError(t.selectionSaveError);
        return;
      }
      setSelectedCourseId(courseId);
      setSelectionPublishable(true);
    } catch {
      setSelectionError(t.selectionSaveError);
    } finally {
      setSelectionBusy(null);
    }
  }

  async function clearSelection() {
    setSelectionBusy("clear");
    setSelectionError("");
    try {
      const response = await fetch("/api/student/language-course-selection", { method: "DELETE" });
      await response.json().catch(() => ({}));
      if (!response.ok) {
        setSelectionError(t.selectionRemoveError);
        return;
      }
      setSelectedCourseId(null);
      setSelectionPublishable(true);
    } catch {
      setSelectionError(t.selectionRemoveError);
    } finally {
      setSelectionBusy(null);
    }
  }

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
      <Card className="border-[var(--brand-border)] bg-[var(--brand-soft)]/55 shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">{t.currentTitle}</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
              {selectionLoading
                ? t.currentLoading
                : selectedCourseId && selectionPublishable
                  ? t.currentSelected
                  : selectedCourseId
                    ? t.currentStale
                    : t.currentNone}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {t.selectionBoundary}
            </p>
          </div>
          {selectedCourseId && (
            <Button type="button" variant="secondary" onClick={clearSelection} disabled={selectionBusy === "clear"}>
              {selectionBusy === "clear" ? t.removing : t.remove}
            </Button>
          )}
        </div>
        {selectionError && <p className="mt-3 text-sm font-semibold text-red-700" role="alert">{selectionError}</p>}
      </Card>

      <Card className="border-[var(--brand-border)] bg-[var(--brand-soft)]/55 shadow-none">
        <h2 className="text-lg font-bold text-slate-950">{t.catalogueTitle}</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
          {t.catalogueDescription}
        </p>
      </Card>

      <Card className="shadow-none">
        <form onSubmit={applyFilters} aria-label={t.filterAria}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block text-sm font-medium text-slate-700">
              {t.courseType}
              <select
                className="field"
                value={draftFilters.purpose}
                onChange={(event) => setDraftFilters((current) => ({ ...current, purpose: event.target.value }))}
              >
                <option value="">{t.all}</option>
                <option value="study_preparation">{t.purpose.study_preparation}</option>
                <option value="standalone_language">{t.purpose.standalone_language}</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              {t.city}
              <input
                className="field"
                value={draftFilters.city}
                onChange={(event) => setDraftFilters((current) => ({ ...current, city: event.target.value }))}
                placeholder={t.cityPlaceholder}
                dir={locale === "ar" ? "ltr" : undefined}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              {t.language}
              <input
                className="field"
                value={draftFilters.language}
                onChange={(event) => setDraftFilters((current) => ({ ...current, language: event.target.value }))}
                placeholder={t.languagePlaceholder}
                dir={locale === "ar" ? "auto" : undefined}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              {t.startLevel}
              <select
                className="field"
                dir={locale === "ar" ? "ltr" : undefined}
                value={draftFilters.level_from}
                onChange={(event) => setDraftFilters((current) => ({ ...current, level_from: event.target.value }))}
              >
                <option value="">{t.all}</option>
                {levels.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              {t.targetLevel}
              <select
                className="field"
                dir={locale === "ar" ? "ltr" : undefined}
                value={draftFilters.level_to}
                onChange={(event) => setDraftFilters((current) => ({ ...current, level_to: event.target.value }))}
              >
                <option value="">{t.all}</option>
                {levels.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="submit">{t.apply}</Button>
            <Button type="button" variant="secondary" onClick={clearFilters}>
              {t.clear}
            </Button>
          </div>
        </form>
      </Card>

      <section aria-live="polite" aria-busy={loading} aria-labelledby="language-course-results-title">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{t.catalogueEyebrow}</p>
            <h2 id="language-course-results-title" className="mt-1 text-2xl font-semibold text-slate-950">
              {t.available}
            </h2>
          </div>
          {!loading && !error && (
            <p className="text-sm text-slate-500">
              {t.resultCount(courses.length)}
            </p>
          )}
        </div>

        {loading && (
          <Card className="border-dashed shadow-none">
            <p className="text-sm text-slate-600">{t.loading}</p>
          </Card>
        )}

        {!loading && error && (
          <Card className="border-red-200 bg-red-50/50 shadow-none">
            <div role="alert">
              <h3 className="font-bold text-red-950">{t.unavailableTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-red-800">{error}</p>
            </div>
          </Card>
        )}

        {!loading && !error && courses.length === 0 && (
          <Card className="border-dashed text-center shadow-none">
            <h3 className="font-bold text-slate-950">{t.emptyTitle}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              {t.emptyText}
            </p>
          </Card>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="space-y-4">
            {courses.map((course) => {
              const start = formatDate(course.starts_on, t);
              const end = formatDate(course.ends_on, t);
              return (
                <Card as="article" key={course.id} className="shadow-none">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--brand)] [overflow-wrap:anywhere]">
                          <bdi dir="auto">{course.provider_name}</bdi>
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-slate-950 [overflow-wrap:anywhere]">
                          <bdi dir="auto">{course.title}</bdi>
                        </h3>
                      </div>
                      <Badge variant={course.purpose === "study_preparation" ? "info" : "neutral"}>
                        {purposeLabel(course.purpose, t)}
                      </Badge>
                    </div>

                    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Fact label={t.city} value={course.city || t.unknown} dir={course.city && locale === "ar" ? "ltr" : "auto"} />
                      <Fact label={t.language} value={localizeCatalogueLabel(locale, course.language)} />
                      <Fact label={t.levels} value={levelLabel(course, t)} dir={locale === "ar" ? "ltr" : "auto"} />
                      <Fact
                        label={t.volume}
                        value={course.hours_per_week === null ? t.unknown : t.hoursWeek(course.hours_per_week)}
                      />
                      <Fact
                        label={t.period}
                        value={start || end ? [start, end].filter(Boolean).join(" → ") : t.unknown}
                      />
                      <Fact label={t.price} value={formatPrice(course, t)} dir={locale === "ar" ? "ltr" : "auto"} />
                    </dl>

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      {t.lastVerified}: {formatVerification(course.verified_at, t)}
                      {" · "}{t.revalidateBefore}: {formatVerification(catalogVerificationExpiresAt(course.verified_at), t)}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row">
                    {course.source_url && (
                      <a
                        href={course.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[var(--brand)] hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                      >
                        {t.officialSource}
                      </a>
                    )}
                    <Button
                      type="button"
                      onClick={() => selectCourse(course.id)}
                      disabled={selectionBusy === course.id || selectedCourseId === course.id}
                    >
                      {selectedCourseId === course.id
                        ? t.selected
                        : selectionBusy === course.id
                          ? t.saving
                          : t.choose}
                    </Button>
                    {course.application_url && (
                      <a
                        href={course.application_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[var(--brand)] hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                      >
                        {t.applicationLink}
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

function Fact({ label, value, dir = "auto" }: { label: string; value: string; dir?: "ltr" | "rtl" | "auto" }) {
  return (
    <div className="rounded-[var(--radius-control)] bg-[var(--surface-muted)] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</dt>
      <dd dir={dir} className="mt-1 text-sm font-medium leading-5 text-slate-900 [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
