"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PreferredCitiesPicker,
  SearchableDatalistInput,
  SelectInput,
  TextInput,
} from "@/components/student/ProfileControls";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentOnboardingCopy } from "@/content/student-onboarding-copy";
import { rebrandCopy } from "@/lib/brand";
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

const scalarKeys = [
  "first_name",
  "last_name",
  "birth_date",
  "nationality",
  "current_city",
  "phone",
  "last_diploma",
  "bac_track",
  "bac_year",
  "general_average",
  "institution",
  "current_university_studies",
  "current_field",
  "university_semesters",
  "german_level",
  "english_level",
  "french_level",
  "language_certificate",
  "language_certificate_other",
  "target_degree",
  "target_field",
  "study_language",
  "target_intake",
  "budget_range",
] as const;

function mergeProfile(profile: Record<string, unknown>): FormData {
  const merged: FormData = { ...initial };

  for (const key of scalarKeys) {
    const value = profile[key];
    if (value != null) merged[key] = String(value);
  }

  merged.preferred_cities = Array.isArray(profile.preferred_cities)
    ? profile.preferred_cities.filter((city): city is string => typeof city === "string")
    : [];

  return merged;
}

function valueOrDash(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return value && value.trim() ? value : "—";
}

export function OnboardingForm({ profile }: { profile: Record<string, unknown> }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(() => mergeProfile(profile));
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { locale } = useLocale();
  const t = rebrandCopy(studentOnboardingCopy[locale]);
  const steps = t.steps;

  const set = (key: string, value: string | string[]) =>
    setData((current) => ({ ...current, [key]: value }));

  async function save(nextStep: number) {
    setError("");
    const requiredByStep: Record<number, string[]> = {
      1: ["first_name", "last_name", "nationality"],
      4: ["target_degree", "target_field", "study_language", "target_intake"],
    };

    if (requiredByStep[step]?.some((key) => !String(data[key] || "").trim())) {
      setError(t.requiredError);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/student/onboarding", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, complete: nextStep === 6, consentAccepted: consent }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          locale === "fr" && typeof result.error === "string" ? result.error : t.saveError,
        );
        return;
      }

      if (nextStep === 6) router.push("/student");
      else {
        setStep(nextStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError(t.networkError);
    } finally {
      setSaving(false);
    }
  }

  const progress = `${step * 20}%`;
  const currentStep = steps[step - 1];

  return (
    <section className="student-onboarding-grid grid w-full gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:gap-7">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_-58px_rgba(28,33,36,0.55)]">
          <div className="relative h-40 overflow-hidden sm:h-48 lg:h-56">
            <Image
              src="https://images.pexels.com/photos/7973208/pexels-photo-7973208.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt={t.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,33,36,0.66)] via-[rgba(28,33,36,0.08)] to-transparent" />
            <div className="absolute inset-x-5 bottom-4 text-white sm:inset-x-6">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.15em] text-[#fff0bf]">
                {t.dossierEyebrow}
              </p>
              <h1 className="editorial-accent mt-1 max-w-md text-2xl leading-[1.08] sm:text-[1.8rem]">
                {t.dossierTitle}
              </h1>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[var(--brand)]">
                  {t.currentStep}
                </p>
                <p className="mt-1 text-xl font-bold text-[var(--foreground)]">{currentStep.title}</p>
              </div>
              <span className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand)]">
                <bdi dir="ltr">{step}/5</bdi>
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{currentStep.guidance}</p>

            <div className="mt-5 grid gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
                <span>{t.progress}</span>
                <span><bdi dir="ltr">{progress}</bdi></span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-300"
                  style={{ width: progress }}
                />
              </div>
            </div>

            <ol className="mobile-nav-scroll mt-5 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
              {steps.map((item, index) => {
                const itemId = index + 1;
                const active = itemId === step;
                const done = itemId < step;
                return (
                  <li
                    key={itemId}
                    className={`min-w-[10.5rem] rounded-[var(--radius-control)] border px-3 py-2.5 lg:min-w-0 ${
                      active
                        ? "border-[var(--brand-border)] bg-[var(--brand-soft)]"
                        : done
                          ? "border-[var(--border)] bg-[var(--surface-subtle)]"
                          : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          active || done
                            ? "bg-[var(--brand)] text-white"
                            : "bg-[var(--surface-muted)] text-[var(--muted)]"
                        }`}
                      >
                        {done ? "✓" : itemId}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--foreground)]">{item.title}</p>
                        <p className={locale === "ar" ? "mt-0.5 text-[0.68rem] leading-4 text-[var(--muted)]" : "mt-0.5 truncate text-[0.68rem] text-[var(--muted)]"}>{item.description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">
              {t.requiredNote}
            </p>
          </div>
        </div>
      </aside>

      <section className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_-58px_rgba(28,33,36,0.55)]">
        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                {t.stepOf(step)}
              </p>
              <h2 className="editorial-accent mt-2 text-[2rem] leading-[1.05] text-[var(--foreground)] sm:text-[2.3rem]">
                {currentStep.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{currentStep.description}</p>
            </div>
            <span className="self-start rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
              {t.saved}
            </span>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          {step === 1 && (
            <div className="space-y-5">
              <SectionIntro
                title={t.sections.identity.title}
                text={t.sections.identity.text}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label={t.fields.firstName} required inputDir={locale === "ar" ? "auto" : undefined} value={String(data.first_name)} onChange={(v) => set("first_name", v)} />
                <TextInput label={t.fields.lastName} required inputDir={locale === "ar" ? "auto" : undefined} value={String(data.last_name)} onChange={(v) => set("last_name", v)} />
                <TextInput label={t.fields.birthDate} type="date" inputDir={locale === "ar" ? "ltr" : undefined} value={String(data.birth_date)} onChange={(v) => set("birth_date", v)} />
                <SearchableDatalistInput label={t.fields.nationality} required value={String(data.nationality)} onChange={(v) => set("nationality", v)} options={nationalityOptions} />
                <TextInput label={t.fields.city} inputDir={locale === "ar" ? "auto" : undefined} value={String(data.current_city)} onChange={(v) => set("current_city", v)} />
                <TextInput label={t.fields.phone} inputDir={locale === "ar" ? "ltr" : undefined} value={String(data.phone)} onChange={(v) => set("phone", v)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <SectionIntro
                title={t.sections.studies.title}
                text={t.sections.studies.text}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectInput label={t.fields.lastDiploma} value={String(data.last_diploma)} onChange={(v) => set("last_diploma", v)} options={diplomaOptions} />
                <SelectInput label={t.fields.bacTrack} value={String(data.bac_track)} onChange={(v) => set("bac_track", v)} options={tunisianBacTrackOptions} />
                <TextInput label={t.fields.bacYear} type="number" inputDir={locale === "ar" ? "ltr" : undefined} value={String(data.bac_year)} onChange={(v) => set("bac_year", v)} />
                <TextInput label={t.fields.average} type="number" inputDir={locale === "ar" ? "ltr" : undefined} placeholder={t.fields.averagePlaceholder} value={String(data.general_average)} onChange={(v) => set("general_average", v)} />
                <TextInput label={t.fields.institution} inputDir={locale === "ar" ? "auto" : undefined} value={String(data.institution)} onChange={(v) => set("institution", v)} />
                <TextInput label={t.fields.currentStudies} inputDir={locale === "ar" ? "auto" : undefined} value={String(data.current_university_studies)} onChange={(v) => set("current_university_studies", v)} />
                <TextInput label={t.fields.currentField} inputDir={locale === "ar" ? "auto" : undefined} value={String(data.current_field)} onChange={(v) => set("current_field", v)} />
                <TextInput label={t.fields.semesters} type="number" inputDir={locale === "ar" ? "ltr" : undefined} value={String(data.university_semesters)} onChange={(v) => set("university_semesters", v)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <SectionIntro
                title={t.sections.languages.title}
                text={t.sections.languages.text}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectInput label={t.fields.german} value={String(data.german_level)} onChange={(v) => set("german_level", v)} options={languageLevelOptions} />
                <SelectInput label={t.fields.english} value={String(data.english_level)} onChange={(v) => set("english_level", v)} options={languageLevelOptions} />
                <SelectInput label={t.fields.french} value={String(data.french_level)} onChange={(v) => set("french_level", v)} options={languageLevelOptions} />
                <SelectInput label={t.fields.languageCertificate} value={String(data.language_certificate)} onChange={(v) => set("language_certificate", v)} options={certificateOptions} />
              </div>
              {data.language_certificate === "other" && (
                <TextInput label={t.fields.otherCertificate} inputDir={locale === "ar" ? "auto" : undefined} value={String(data.language_certificate_other)} onChange={(v) => set("language_certificate_other", v)} />
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <SectionIntro
                title={t.sections.project.title}
                text={t.sections.project.text}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectInput label={t.fields.targetDegree} required value={String(data.target_degree)} onChange={(v) => set("target_degree", v)} options={degreeOptions} />
                <SelectInput label={t.fields.targetField} required value={String(data.target_field)} onChange={(v) => set("target_field", v)} options={studyFieldOptions} />
                <SelectInput label={t.fields.studyLanguage} required value={String(data.study_language)} onChange={(v) => set("study_language", v)} options={studyLanguageOptions} />
                <TextInput label={t.fields.targetIntake} required inputDir={locale === "ar" ? "auto" : undefined} value={String(data.target_intake)} onChange={(v) => set("target_intake", v)} placeholder={t.fields.targetIntakePlaceholder} />
                <PreferredCitiesPicker value={Array.isArray(data.preferred_cities) ? data.preferred_cities : []} onChange={(v) => set("preferred_cities", v)} />
                <SelectInput label={t.fields.budget} value={String(data.budget_range)} onChange={(v) => set("budget_range", v)} options={budgetOptions} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <SectionIntro
                title={t.sections.review.title}
                text={t.sections.review.text}
              />

              <dl className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]">
                {[
                  [t.review.name, `${valueOrDash(data.first_name)} ${valueOrDash(data.last_name)}`],
                  [t.review.studies, `${valueOrDash(data.last_diploma)} · ${valueOrDash(data.institution)}`],
                  [t.review.languages, `DE ${valueOrDash(data.german_level)} · EN ${valueOrDash(data.english_level)} · FR ${valueOrDash(data.french_level)}`],
                  [t.review.project, `${valueOrDash(data.target_degree)} · ${valueOrDash(data.target_field)}`],
                  [t.review.intake, `${valueOrDash(data.target_intake)} · ${valueOrDash(data.study_language)}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1.5 border-b border-[var(--border)] px-4 py-3.5 text-sm last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-4"
                  >
                    <dt className="font-bold text-[var(--muted)]">{label}</dt>
                    <dd dir={locale === "ar" ? "auto" : undefined} className="text-[var(--foreground)]">{value}</dd>
                  </div>
                ))}
              </dl>

              <label className="flex gap-3 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/55 p-4 text-sm leading-6 text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--brand)]"
                />
                <span>
                  {t.consent}
                  <span className="font-bold text-[var(--brand)]"> {t.mandatory}</span>
                </span>
              </label>

              <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <p className="text-sm font-bold text-[var(--foreground)]">{t.afterTitle}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {t.afterText}
                </p>
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-[var(--radius-control)] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-4 sm:px-7">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              disabled={saving || step === 1}
              onClick={() => setStep(step - 1)}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              {t.back}
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => save(step + 1)}
              className="w-full justify-center sm:min-w-44 sm:w-auto"
            >
              {saving ? t.saving : step === 5 ? t.finish : t.continue}
            </Button>
          </div>
        </div>
      </section>
    </section>
  );
}

function SectionIntro({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-b border-[var(--border)] pb-4">
      <h3 className="text-lg font-bold text-[var(--foreground)] sm:text-xl">{title}</h3>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--muted)]">{text}</p>
    </div>
  );
}
