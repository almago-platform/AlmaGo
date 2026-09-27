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

const steps = [
  { id: 1, title: "Identité", description: "Vos informations principales" },
  { id: 2, title: "Parcours", description: "Votre parcours académique" },
  { id: 3, title: "Langues", description: "Vos niveaux et certificats" },
  { id: 4, title: "Projet", description: "Votre projet d’études" },
  { id: 5, title: "Validation", description: "Vérification finale" },
] as const;

const stepGuidance = [
  "Nous commençons par les informations nécessaires pour identifier correctement votre dossier.",
  "Votre parcours académique permet ensuite de distinguer ce qui est acquis de ce qui devra être vérifié.",
  "Vos niveaux de langue servent à repérer les programmes accessibles et les éventuelles étapes de préparation.",
  "Votre objectif académique donne une direction concrète à la recherche de programmes et aux démarches qui suivent.",
  "Relisez les informations essentielles avant d’ouvrir votre espace étudiant.",
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

  const set = (key: string, value: string | string[]) =>
    setData((current) => ({ ...current, [key]: value }));

  async function save(nextStep: number) {
    setError("");
    const requiredByStep: Record<number, string[]> = {
      1: ["first_name", "last_name", "nationality"],
      4: ["target_degree", "target_field", "study_language", "target_intake"],
    };

    if (requiredByStep[step]?.some((key) => !String(data[key] || "").trim())) {
      setError("Complétez les champs marqués d’un * avant de continuer.");
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
          result.error ||
            "Nous n’arrivons pas à enregistrer cette étape pour le moment. Réessayez dans quelques instants.",
        );
        return;
      }

      if (nextStep === 6) router.push("/student");
      else {
        setStep(nextStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError(
        "Nous n’arrivons pas à enregistrer cette étape pour le moment. Vérifiez votre connexion puis réessayez.",
      );
    } finally {
      setSaving(false);
    }
  }

  const progress = `${step * 20}%`;
  const currentStep = steps[step - 1];

  return (
    <section className="grid w-full gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:gap-7">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_-58px_rgba(28,33,36,0.55)]">
          <div className="relative h-40 overflow-hidden sm:h-48 lg:h-56">
            <Image
              src="https://images.pexels.com/photos/7973208/pexels-photo-7973208.jpeg"
              alt="Des étudiants relisent ensemble des documents devant un bâtiment universitaire."
              fill
              priority
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,33,36,0.66)] via-[rgba(28,33,36,0.08)] to-transparent" />
            <div className="absolute inset-x-5 bottom-4 text-white sm:inset-x-6">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.15em] text-[#fff0bf]">
                Votre dossier AlmaGo
              </p>
              <h1 className="editorial-accent mt-1 max-w-md text-2xl leading-[1.08] sm:text-[1.8rem]">
                Donnez une direction claire à votre projet.
              </h1>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[var(--brand)]">
                  Étape actuelle
                </p>
                <p className="mt-1 text-xl font-bold text-[var(--foreground)]">{currentStep.title}</p>
              </div>
              <span className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand)]">
                {step}/5
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{stepGuidance[step - 1]}</p>

            <div className="mt-5 grid gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
                <span>Progression</span>
                <span>{progress}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-300"
                  style={{ width: progress }}
                />
              </div>
            </div>

            <ol className="mobile-nav-scroll mt-5 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
              {steps.map((item) => {
                const active = item.id === step;
                const done = item.id < step;
                return (
                  <li
                    key={item.id}
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
                        {done ? "✓" : item.id}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--foreground)]">{item.title}</p>
                        <p className="mt-0.5 truncate text-[0.68rem] text-[var(--muted)]">{item.description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">
              Les champs marqués d’un * sont obligatoires. Les autres peuvent être complétés ou modifiés plus tard.
            </p>
          </div>
        </div>
      </aside>

      <section className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_-58px_rgba(28,33,36,0.55)]">
        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                Étape {step} sur 5
              </p>
              <h2 className="editorial-accent mt-2 text-[2rem] leading-[1.05] text-[var(--foreground)] sm:text-[2.3rem]">
                {currentStep.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{currentStep.description}</p>
            </div>
            <span className="self-start rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
              Enregistré à chaque étape
            </span>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          {step === 1 && (
            <div className="space-y-5">
              <SectionIntro
                title="Informations personnelles"
                text="Commençons par les informations qui permettent d’identifier votre dossier."
              />
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
              <SectionIntro
                title="Parcours académique"
                text="Ajoutez ce que vous savez déjà. Les pièces justificatives pourront être rattachées ensuite."
              />
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
              <SectionIntro
                title="Langues"
                text="Indiquez vos niveaux actuels. Ils servent à repérer les exigences à vérifier pour chaque programme."
              />
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
              <SectionIntro
                title="Votre projet en Allemagne"
                text="Ces quatre informations obligatoires donnent une direction aux recherches et aux prochaines démarches."
              />
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
              <SectionIntro
                title="Confirmez votre profil"
                text="Relisez les informations principales avant d’accéder à votre espace AlmaGo."
              />

              <dl className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]">
                {[
                  ["Nom", `${valueOrDash(data.first_name)} ${valueOrDash(data.last_name)}`],
                  ["Parcours", `${valueOrDash(data.last_diploma)} · ${valueOrDash(data.institution)}`],
                  ["Langues", `DE ${valueOrDash(data.german_level)} · EN ${valueOrDash(data.english_level)} · FR ${valueOrDash(data.french_level)}`],
                  ["Projet", `${valueOrDash(data.target_degree)} · ${valueOrDash(data.target_field)}`],
                  ["Rentrée", `${valueOrDash(data.target_intake)} · ${valueOrDash(data.study_language)}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1.5 border-b border-[var(--border)] px-4 py-3.5 text-sm last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-4"
                  >
                    <dt className="font-bold text-[var(--muted)]">{label}</dt>
                    <dd className="text-[var(--foreground)]">{value}</dd>
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
                  J&apos;accepte que les informations fournies soient utilisées pour traiter mon dossier AlmaGo.
                  <span className="font-bold text-[var(--brand)]"> Obligatoire.</span>
                </span>
              </label>

              <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <p className="text-sm font-bold text-[var(--foreground)]">Après validation</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Vous accéderez à votre tableau de bord. Vous pourrez ensuite compléter les documents, explorer les programmes et suivre vos démarches.
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
              Retour
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => save(step + 1)}
              className="w-full justify-center sm:min-w-44 sm:w-auto"
            >
              {saving ? "Enregistrement..." : step === 5 ? "Confirmer et ouvrir mon espace" : "Continuer"}
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
