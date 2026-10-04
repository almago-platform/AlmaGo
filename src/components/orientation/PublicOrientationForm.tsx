"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { orientationCopy } from "@/content/orientation-copy";
import { orientationProspectCopy } from "@/content/orientation-prospect-copy";
import { rebrandCopy } from "@/lib/brand";
import { ProspectCaptureCard } from "@/components/orientation/ProspectCaptureCard";
import { SmartOrientationResultCard } from "@/components/orientation/SmartOrientationResultCard";
import { OrientationRouteCard } from "@/components/orientation/OrientationRouteCard";
import { PersonalizedOrientationEngineCard } from "@/components/orientation/PersonalizedOrientationEngineCard";
import { OrientationOnePagePrintReport } from "@/components/orientation/OrientationOnePagePrintReport";
import { ProspectOrientationUpdateCard } from "@/components/orientation/ProspectOrientationUpdateCard";
import { prospectDashboardCopy } from "@/content/prospect-dashboard-copy";
import { prospectOrientationUpdateCopy } from "@/content/prospect-orientation-update-copy";
import {
  localizePreferredCity,
  localizeProfileOptions,
  studentProfileCopy,
} from "@/content/student-profile-copy";
import type { AcquisitionContext } from "@/lib/phase2/acquisition";
import type { OrientationPublicPersonalizedResult } from "@/lib/orientation-engine/result/types";
import { evaluateSmartOrientationPriority } from "@/lib/phase2/smart-orientation";
import {
  PUBLIC_ORIENTATION_SESSION_KEY as SESSION_KEY,
  createEmptyPublicOrientationAnswers,
  createEmptyPublicOrientationIdentity,
  isCompletePublicOrientationIdentity,
  restorePublicOrientationAnswers,
  restorePublicOrientationIdentity,
  type PublicOrientationAnswers as Answers,
  type PublicOrientationIdentity,
} from "@/lib/orientation/public";
import {
  budgetOptions,
  degreeOptions,
  diplomaOptions,
  engineeringSpecialtyOptions,
  higherEducationStatusOptions,
  languageLevelOptions,
  preferredCityOptions,
  scienceSpecialtyOptions,
  studyFieldOptions,
  studyIntentOptions,
  studyLanguageOptions,
  tunisianBacTrackOptions,
  type SelectOption,
} from "@/lib/student/profile-options";

type Step = 1 | 2 | 3 | 4 | 5;

function localizedValue(value: string, options: readonly SelectOption[]) {
  return options.find((option) => option.value === value)?.label || value || "—";
}

export function PublicOrientationForm({
  prospectCaptureEnabled = false,
  emailDeliveryEnabled = false,
  initialAnswers = null,
  initialIdentity = null,
  authenticatedUpdate = false,
  acquisitionContext = null,
}: {
  prospectCaptureEnabled?: boolean;
  emailDeliveryEnabled?: boolean;
  initialAnswers?: Answers | null;
  initialIdentity?: PublicOrientationIdentity | null;
  authenticatedUpdate?: boolean;
  acquisitionContext?: AcquisitionContext | null;
}) {
  const { locale, direction } = useLocale();
  const copy = rebrandCopy(orientationCopy[locale]);
  const profileCopy = studentProfileCopy[locale];
  const prospectCopy = orientationProspectCopy[locale];
  const prospectDashboard = prospectDashboardCopy[locale];
  const updateCopy = prospectOrientationUpdateCopy[locale];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [identity, setIdentity] = useState<PublicOrientationIdentity>(() =>
    initialIdentity
      ? restorePublicOrientationIdentity(initialIdentity)
      : createEmptyPublicOrientationIdentity(),
  );
  const [identityComplete, setIdentityComplete] = useState(authenticatedUpdate);
  const [identityError, setIdentityError] = useState("");
  const [answers, setAnswers] = useState<Answers>(() =>
    initialAnswers
      ? restorePublicOrientationAnswers(initialAnswers)
      : createEmptyPublicOrientationAnswers(),
  );
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(authenticatedUpdate);
  const reviewProfileKey = useMemo(() => JSON.stringify(answers), [answers]);
  const [orientationReview, setOrientationReview] = useState<{
    profileKey: string | null;
    reviewId: string | null;
  }>({ profileKey: null, reviewId: null });
  const [printPersonalized, setPrintPersonalized] = useState<{
    profileKey: string | null;
    result: OrientationPublicPersonalizedResult | null;
  }>({ profileKey: null, result: null });
  const handleReviewReady = useCallback((reviewId: string | null) => {
    setOrientationReview({ profileKey: reviewProfileKey, reviewId });
  }, [reviewProfileKey]);
  const handlePersonalizedReady = useCallback((result: OrientationPublicPersonalizedResult | null) => {
    setPrintPersonalized({ profileKey: reviewProfileKey, result });
  }, [reviewProfileKey]);
  const orientationReviewId =
    orientationReview.profileKey === reviewProfileKey
      ? orientationReview.reviewId
      : null;
  const personalizedForPrint =
    printPersonalized.profileKey === reviewProfileKey
      ? printPersonalized.result
      : null;

  const bacTracks = useMemo(() => localizeProfileOptions(locale, tunisianBacTrackOptions), [locale]);
  const diplomas = useMemo(() => localizeProfileOptions(locale, diplomaOptions), [locale]);
  const degrees = useMemo(() => localizeProfileOptions(locale, degreeOptions), [locale]);
  const fields = useMemo(() => localizeProfileOptions(locale, studyFieldOptions), [locale]);
  const engineeringSpecialties = useMemo(
    () => localizeProfileOptions(locale, engineeringSpecialtyOptions),
    [locale],
  );
  const scienceSpecialties = useMemo(
    () => localizeProfileOptions(locale, scienceSpecialtyOptions),
    [locale],
  );
  const higherEducationStatuses = useMemo(
    () => localizeProfileOptions(locale, higherEducationStatusOptions),
    [locale],
  );
  const studyIntents = useMemo(
    () => localizeProfileOptions(locale, studyIntentOptions),
    [locale],
  );
  const levels = useMemo(() => localizeProfileOptions(locale, languageLevelOptions), [locale]);
  const studyLanguages = useMemo(() => localizeProfileOptions(locale, studyLanguageOptions), [locale]);
  const budgets = useMemo(() => localizeProfileOptions(locale, budgetOptions), [locale]);
  const smartPriority = useMemo(() => evaluateSmartOrientationPriority(answers), [answers]);
  const firstContactCopy = {
    fr: {
      answers: "Voir les informations de mon profil",
      answersHelp: "Ces informations servent à personnaliser votre orientation. Vous pouvez les modifier à tout moment.",
    },
    ar: {
      answers: "عرض معلومات ملفي",
      answersHelp: "تُستخدم هذه المعلومات لتخصيص توجيهك، ويمكنك تعديلها في أي وقت.",
    },
    en: {
      answers: "View my profile information",
      answersHelp: "These details personalise your orientation. You can change them at any time.",
    },
    de: {
      answers: "Meine Profilangaben anzeigen",
      answersHelp: "Diese Angaben personalisieren deine Orientierung und können jederzeit geändert werden.",
    },
  }[locale];
  const identityCopy = {
    fr: {
      eyebrow: "Avant votre orientation",
      title: "Commençons par faire connaissance.",
      text: "Ces informations sont obligatoires pour personnaliser votre orientation et identifier correctement votre rapport.",
      firstName: "Prénom",
      lastName: "Nom",
      birthDate: "Date de naissance",
      email: "Adresse e-mail",
      privacy: "Vos informations servent uniquement à votre parcours Campus Allemagne. Aucun compte n’est créé à cette étape.",
      privacyLink: "Consulter la confidentialité",
      submit: "Commencer mon orientation",
      edit: "Modifier mes informations",
      required: "Remplissez les quatre champs pour continuer.",
      invalidEmail: "Indiquez une adresse e-mail valide.",
      invalidBirthDate: "Indiquez une date de naissance valide.",
    },
    ar: {
      eyebrow: "قبل بدء التوجيه",
      title: "لنبدأ بالتعرّف عليك.",
      text: "هذه المعلومات إلزامية لتخصيص توجيهك وربط التقرير بك بشكل صحيح.",
      firstName: "الاسم",
      lastName: "اللقب",
      birthDate: "تاريخ الميلاد",
      email: "البريد الإلكتروني",
      privacy: "تُستخدم معلوماتك فقط ضمن مسارك مع Campus Allemagne، ولن يتم إنشاء حساب في هذه المرحلة.",
      privacyLink: "سياسة الخصوصية",
      submit: "ابدأ توجيهي",
      edit: "تعديل معلوماتي",
      required: "أكمل الحقول الأربعة للمتابعة.",
      invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
      invalidBirthDate: "أدخل تاريخ ميلاد صحيحًا.",
    },
    en: {
      eyebrow: "Before your orientation",
      title: "First, tell us who you are.",
      text: "These details are required to personalise your orientation and identify your report correctly.",
      firstName: "First name",
      lastName: "Last name",
      birthDate: "Date of birth",
      email: "Email address",
      privacy: "Your details are used only for your Campus Allemagne journey. No account is created at this step.",
      privacyLink: "View privacy information",
      submit: "Start my orientation",
      edit: "Edit my information",
      required: "Complete all four fields to continue.",
      invalidEmail: "Enter a valid email address.",
      invalidBirthDate: "Enter a valid date of birth.",
    },
    de: {
      eyebrow: "Vor deiner Orientierung",
      title: "Zuerst möchten wir dich kennenlernen.",
      text: "Diese Angaben sind erforderlich, um deine Orientierung zu personalisieren und deinen Bericht korrekt zuzuordnen.",
      firstName: "Vorname",
      lastName: "Nachname",
      birthDate: "Geburtsdatum",
      email: "E-Mail-Adresse",
      privacy: "Deine Angaben werden nur für deinen Campus-Allemagne-Weg verwendet. In diesem Schritt wird kein Konto erstellt.",
      privacyLink: "Datenschutzhinweise ansehen",
      submit: "Meine Orientierung starten",
      edit: "Meine Angaben ändern",
      required: "Fülle alle vier Felder aus, um fortzufahren.",
      invalidEmail: "Gib eine gültige E-Mail-Adresse ein.",
      invalidBirthDate: "Gib ein gültiges Geburtsdatum ein.",
    },
  }[locale];

  const resultActionsCopy = {
    fr: {
      title: "Gardez votre rapport",
      pdf: "Enregistrer mon rapport (PDF)",
      adjust: "Ajuster mon profil",
      home: "Retour à l’accueil",
    },
    ar: {
      title: "احتفظ بتقريرك",
      pdf: "حفظ تقريري (PDF)",
      adjust: "تعديل ملفي",
      home: "العودة إلى الصفحة الرئيسية",
    },
    en: {
      title: "Keep your report",
      pdf: "Save my report (PDF)",
      adjust: "Adjust my profile",
      home: "Back to home",
    },
    de: {
      title: "Bericht speichern",
      pdf: "Bericht als PDF speichern",
      adjust: "Profil anpassen",
      home: "Zur Startseite",
    },
  }[locale];
  const engineeringSpecialtyCopy = {
    fr: {
      label: "Spécialité d’ingénierie",
      help: "Cela nous permet de chercher des programmes réellement proches de votre projet.",
    },
    ar: {
      label: "تخصص الهندسة",
      help: "يساعدنا ذلك على البحث عن برامج قريبة فعلاً من مشروعك.",
    },
    en: {
      label: "Engineering specialisation",
      help: "This helps us search for programmes that genuinely match your project.",
    },
    de: {
      label: "Ingenieurfachrichtung",
      help: "So können wir Studiengänge suchen, die wirklich zu deinem Projekt passen.",
    },
  }[locale];
  const scienceSpecialtyCopy = {
    fr: {
      label: "Branche scientifique",
      help: "Choisissez la branche qui vous intéresse pour éviter de mélanger des sciences très différentes.",
    },
    ar: {
      label: "الفرع العلمي",
      help: "اختر الفرع الذي يهمك حتى لا نخلط بين تخصصات علمية مختلفة جدًا.",
    },
    en: {
      label: "Science subject",
      help: "Choose the science area you are interested in so unrelated subjects are not mixed together.",
    },
    de: {
      label: "Naturwissenschaftliches Fach",
      help: "Wähle den Bereich, der dich interessiert, damit sehr unterschiedliche Fächer nicht vermischt werden.",
    },
  }[locale];

  const selectedCitiesLabel =
    locale === "ar"
      ? `${copy.controls.selected} ${answers.preferredCities.length}`
      : `${answers.preferredCities.length} ${copy.controls.selected}`;

  useEffect(() => {
    if (authenticatedUpdate) return;

    const timer = window.setTimeout(() => {
      try {
        const stored = window.sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as {
            identity?: unknown;
            identityComplete?: unknown;
            answers?: unknown;
            step?: unknown;
          };
          const restoredIdentity = restorePublicOrientationIdentity(parsed.identity);
          setIdentity(restoredIdentity);
          setIdentityComplete(
            parsed.identityComplete === true
            && isCompletePublicOrientationIdentity(restoredIdentity),
          );
          setAnswers(restorePublicOrientationAnswers(parsed.answers));
          if (typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 5) {
            setStep(parsed.step as Step);
          }
        }
      } catch {
        window.sessionStorage.removeItem(SESSION_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authenticatedUpdate]);

  useEffect(() => {
    if (!hydrated || authenticatedUpdate) return;
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ identity, identityComplete, answers, step }),
    );
  }, [identity, identityComplete, answers, step, hydrated, authenticatedUpdate]);

  useEffect(() => {
    if (hydrated && identityComplete) headingRef.current?.focus();
  }, [step, hydrated, identityComplete]);

  function setIdentityField<K extends keyof PublicOrientationIdentity>(
    key: K,
    value: PublicOrientationIdentity[K],
  ) {
    setIdentity((current) => ({ ...current, [key]: value }));
    setIdentityError("");
  }

  function submitIdentity() {
    const normalized = restorePublicOrientationIdentity(identity);
    if (!normalized.firstName || !normalized.lastName || !normalized.birthDate || !normalized.email) {
      setIdentityError(identityCopy.required);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
      setIdentityError(identityCopy.invalidEmail);
      return;
    }
    if (!isCompletePublicOrientationIdentity(normalized)) {
      setIdentityError(identityCopy.invalidBirthDate);
      return;
    }

    setIdentity(normalized);
    setIdentityError("");
    setIdentityComplete(true);
  }

  function setField<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function validateCurrentStep() {
    if (step === 1) {
      if (!answers.bacStatus) return copy.validation.required;
      if (answers.bacStatus !== "no_bac") {
        if (!answers.bacYear || !answers.bacTrack) return copy.validation.required;
        const year = Number(answers.bacYear);
        if (!Number.isInteger(year) || year < 2000 || year > 2035) return copy.validation.year;
        if (answers.generalAverage) {
          const average = Number(answers.generalAverage);
          if (!Number.isFinite(average) || average < 0 || average > 20) return copy.validation.average;
        }
      }
    }

    if (step === 2 && (!answers.targetDegree || !answers.targetField)) return copy.validation.required;
    if (step === 2 && answers.bacStatus === "no_bac" && !answers.lastDiploma) return copy.validation.required;
    if (step === 2 && !answers.higherEducationStatus) return copy.validation.required;
    if (
      step === 2
      && answers.higherEducationStatus !== "not_started"
      && (!answers.currentStudyField || !answers.studyIntent)
    ) return copy.validation.required;
    if (step === 2 && answers.universitySemesters) {
      const semesters = Number(answers.universitySemesters);
      if (!Number.isInteger(semesters) || semesters < 1 || semesters > 30) {
        return copy.validation.required;
      }
    }
    if (
      step === 2
      && answers.targetField === "Ingénierie"
      && !answers.engineeringSpecialty
    ) return copy.validation.required;
    if (
      step === 2
      && answers.targetField === "Sciences"
      && !answers.scienceSpecialty
    ) return copy.validation.required;
    if (step === 3 && (!answers.germanLevel || !answers.englishLevel || !answers.studyLanguage)) return copy.validation.required;
    if (step === 4 && !answers.budgetRange) return copy.validation.required;

    return "";
  }

  function next() {
    const validation = validateCurrentStep();
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    setStep((step === 4 ? 5 : step + 1) as Step);
  }

  function previous() {
    setError("");
    setStep((Math.max(1, step - 1)) as Step);
  }

  function toggleCity(city: string) {
    setAnswers((current) => {
      const selected = current.preferredCities.includes(city);
      if (!selected && current.preferredCities.length >= 3) return current;
      return {
        ...current,
        preferredCities: selected
          ? current.preferredCities.filter((item) => item !== city)
          : [...current.preferredCities, city],
      };
    });
  }

  const stepCopy = [
    copy.steps.situation,
    copy.steps.project,
    copy.steps.languages,
    copy.steps.resources,
  ];

  const isBachelorFirstContact = answers.targetDegree === "Bachelor";

  const summaryRows = [
    [copy.summary.labels.bacStatus, answers.bacStatus ? copy.bacStatus[answers.bacStatus] : "—"],
    [copy.summary.labels.bacYear, answers.bacYear || "—"],
    [copy.summary.labels.bacTrack, localizedValue(answers.bacTrack, bacTracks)],
    [copy.summary.labels.average, answers.generalAverage ? `${answers.generalAverage}/20` : "—"],
    [copy.summary.labels.diploma, localizedValue(answers.lastDiploma, diplomas)],
    [
      copy.summary.labels.higherEducationStatus,
      localizedValue(answers.higherEducationStatus, higherEducationStatuses),
    ],
    ...(answers.higherEducationStatus && answers.higherEducationStatus !== "not_started"
      ? [
          [copy.summary.labels.currentStudyField, answers.currentStudyField || "—"],
          [copy.summary.labels.universitySemesters, answers.universitySemesters || "—"],
          [copy.summary.labels.studyIntent, localizedValue(answers.studyIntent, studyIntents)],
        ]
      : []),
    ...(answers.targetDegree === "Master" && answers.targetSpecialization
      ? [[copy.summary.labels.targetSpecialization, answers.targetSpecialization]]
      : []),
    [copy.summary.labels.degree, localizedValue(answers.targetDegree, degrees)],
    [copy.summary.labels.field, localizedValue(answers.targetField, fields)],
    ...(answers.targetField === "Ingénierie"
      ? [[engineeringSpecialtyCopy.label, localizedValue(answers.engineeringSpecialty, engineeringSpecialties)]]
      : []),
    ...(answers.targetField === "Sciences"
      ? [[scienceSpecialtyCopy.label, localizedValue(answers.scienceSpecialty, scienceSpecialties)]]
      : []),
    [copy.summary.labels.german, localizedValue(answers.germanLevel, levels)],
    [copy.summary.labels.english, localizedValue(answers.englishLevel, levels)],
    [copy.summary.labels.studyLanguage, localizedValue(answers.studyLanguage, studyLanguages)],
    [copy.summary.labels.budget, localizedValue(answers.budgetRange, budgets)],
    [
      copy.summary.labels.cities,
      answers.preferredCities.length
        ? answers.preferredCities.map((city) => localizePreferredCity(locale, city)).join(", ")
        : "—",
    ],
  ] as const;

  return (
    <div className={`orientation-print-page min-h-screen bg-[var(--background)] text-[var(--foreground)] ${step > 4 ? "orientation-color-theme" : ""}`} dir={direction}>
      <a className="skip-link orientation-print-hide" href="#orientation-main">{copy.header.skip}</a>

      <header className="orientation-print-hide border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label={copy.header.home} className="inline-flex items-center">
            <BrandLogo className="h-9 w-auto" priority />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher compact />
            <Link
              href={authenticatedUpdate ? "/prospect" : "/login"}
              className="text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              {authenticatedUpdate ? prospectDashboard.shell.area : copy.header.login}
            </Link>
          </div>
        </div>
      </header>

      <main id="orientation-main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {!authenticatedUpdate && !identityComplete ? (
          <section className="orientation-print-hide mx-auto max-w-3xl">
            <p className="eyebrow">{identityCopy.eyebrow}</p>
            <h1 className="page-title max-w-3xl">{identityCopy.title}</h1>
            <p className="page-subtitle">{identityCopy.text}</p>

            <div className="professional-panel mt-8 rounded-[var(--radius-panel)] p-5 sm:p-7">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitIdentity();
                }}
                noValidate
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    {identityCopy.firstName}
                    <input
                      className="field"
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      maxLength={80}
                      required
                      value={identity.firstName}
                      onChange={(event) => setIdentityField("firstName", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold">
                    {identityCopy.lastName}
                    <input
                      className="field"
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      maxLength={80}
                      required
                      value={identity.lastName}
                      onChange={(event) => setIdentityField("lastName", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold">
                    {identityCopy.birthDate}
                    <input
                      className="field"
                      type="date"
                      name="birthDate"
                      autoComplete="bday"
                      max={new Date().toISOString().slice(0, 10)}
                      required
                      value={identity.birthDate}
                      onChange={(event) => setIdentityField("birthDate", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold">
                    {identityCopy.email}
                    <input
                      className="field"
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={320}
                      required
                      value={identity.email}
                      onChange={(event) => setIdentityField("email", event.target.value)}
                    />
                  </label>
                </div>

                <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-3 text-sm leading-6">
                  {identityCopy.privacy}{" "}
                  <Link
                    href="/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2"
                  >
                    {identityCopy.privacyLink}
                  </Link>
                </div>

                {identityError ? (
                  <p
                    role="alert"
                    className="mt-5 rounded-[var(--radius-control)] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                  >
                    {identityError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="mt-6 w-full rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--brand-strong)] sm:w-auto"
                >
                  {identityCopy.submit}
                  <span aria-hidden="true" className="ms-2">→</span>
                </button>
              </form>
            </div>
          </section>
        ) : (
          <>
        {step <= 4 ? (
          <section className="orientation-print-hide mx-auto max-w-3xl">
            <p className="eyebrow">
              {authenticatedUpdate ? updateCopy.introEyebrow : copy.intro.eyebrow}
            </p>
            <h1 className="page-title max-w-3xl">
              {authenticatedUpdate ? updateCopy.introTitle : copy.intro.title}
            </h1>
            <p className="page-subtitle">
              {authenticatedUpdate ? updateCopy.introLead : copy.intro.lead}
            </p>
            <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-3 text-sm leading-6">
              {authenticatedUpdate ? updateCopy.introNotice : copy.intro.privacy}
            </div>
            {!authenticatedUpdate ? (
              <button
                type="button"
                onClick={() => {
                  setIdentityError("");
                  setIdentityComplete(false);
                }}
                className="mt-3 text-sm font-semibold text-[var(--foreground)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--foreground)]"
              >
                {identityCopy.edit}
              </button>
            ) : null}
          </section>
        ) : null}

        <section className={`mx-auto ${step <= 4 ? "max-w-3xl mt-8" : "max-w-6xl mt-0"}`}>
          {step <= 4 ? (
            <div
              role="progressbar"
              aria-label={copy.progress.label}
              aria-valuemin={1}
              aria-valuemax={4}
              aria-valuenow={step}
              className="orientation-print-hide mb-6"
            >
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
                <span>{copy.progress.step} {step} / 4</span>
                <span>{step * 25}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)] transition-[width]"
                  style={{ width: `${step * 25}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className={step <= 4
            ? "professional-panel rounded-[var(--radius-panel)] p-5 sm:p-7"
            : "orientation-result-shell"
          }>
            {step <= 4 ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  next();
                }}
              >
                <p className="eyebrow">{copy.progress.step} {step}</p>
                <h2 ref={headingRef} tabIndex={-1} className="section-title mt-2 mb-1">
                  {stepCopy[step - 1].title}
                </h2>
                <p className="mb-6 text-sm leading-6 text-[var(--muted)]">{stepCopy[step - 1].text}</p>

                {step === 1 ? (
                  <div className="space-y-5">
                    <fieldset>
                      <legend className="mb-2 text-sm font-semibold">{copy.bacStatus.label}</legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(["obtained", "preparing", "no_bac"] as const).map((status) => (
                          <label key={status} className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                            <input
                              type="radio"
                              name="bacStatus"
                              value={status}
                              checked={answers.bacStatus === status}
                              onChange={() => {
                                setAnswers((current) => ({
                                  ...current,
                                  bacStatus: status,
                                  ...(status === "no_bac"
                                    ? { bacYear: "", bacTrack: "", generalAverage: "", averageType: "" }
                                    : {}),
                                }));
                                setError("");
                              }}
                              className="mt-1"
                            />
                            <span className="font-medium">{copy.bacStatus[status]}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {answers.bacStatus !== "no_bac" ? (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="text-sm font-semibold">
                            {profileCopy.form.fields.bac_year}
                            <input
                              className="field"
                              type="number"
                              inputMode="numeric"
                              min="2000"
                              max="2035"
                              value={answers.bacYear}
                              onChange={(event) => setField("bacYear", event.target.value)}
                            />
                            <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{copy.fields.yearHelp}</span>
                          </label>
                          <label className="text-sm font-semibold">
                            {profileCopy.form.fields.bac_track}
                            <select className="field" value={answers.bacTrack} onChange={(event) => setField("bacTrack", event.target.value)}>
                              <option value="">{copy.controls.choose}</option>
                              {bacTracks.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                          </label>
                        </div>

                        <label className="block text-sm font-semibold">
                          {profileCopy.form.fields.general_average} <span className="font-normal text-[var(--muted)]">({copy.controls.optional})</span>
                          <input
                            className="field"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            max="20"
                            step="0.01"
                            value={answers.generalAverage}
                            onChange={(event) => setField("generalAverage", event.target.value)}
                          />
                          <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{copy.fields.averageHelp}</span>
                        </label>
                      </>
                    ) : (
                      <div className="rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-3 text-sm leading-6">
                        {locale === "fr"
                          ? "Pas de problème : l’étape suivante nous permettra d’indiquer votre dernier diplôme ou vos études actuelles. Campus Allemagne vérifiera ensuite la voie académique possible sans inventer d’accès automatique."
                          : locale === "ar"
                            ? "لا مشكلة: في الخطوة التالية يمكنك تحديد آخر شهادة أو دراستك الحالية. بعد ذلك يتحقق Campus Allemagne من المسار الأكاديمي الممكن من دون افتراض دخول تلقائي."
                            : locale === "de"
                              ? "Kein Problem: Im nächsten Schritt kannst du deinen letzten Abschluss oder dein aktuelles Studium angeben. Campus Allemagne prüft danach den möglichen akademischen Weg, ohne einen automatischen Zugang zu behaupten."
                              : "No problem: the next step lets you add your latest qualification or current studies. Campus Allemagne will then verify the possible academic route without assuming automatic access."}
                      </div>
                    )}
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-5">
                    <label className="block text-sm font-semibold">
                      {profileCopy.form.fields.last_diploma} {answers.bacStatus !== "no_bac" ? (
                        <span className="font-normal text-[var(--muted)]">({copy.controls.optional})</span>
                      ) : null}
                      <select className="field" value={answers.lastDiploma} onChange={(event) => setField("lastDiploma", event.target.value)}>
                        <option value="">{copy.controls.choose}</option>
                        {diplomas.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{copy.fields.lastDiplomaHelp}</span>
                    </label>

                    <fieldset className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5">
                      <legend className="px-1 text-sm font-semibold">
                        {copy.fields.higherEducationStatus}
                      </legend>
                      <div className="mt-2 grid gap-2">
                        {higherEducationStatuses.map((option) => (
                          <label key={option.value} className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                            <input
                              type="radio"
                              name="higherEducationStatus"
                              value={option.value}
                              checked={answers.higherEducationStatus === option.value}
                              onChange={() => {
                                setAnswers((current) => ({
                                  ...current,
                                  higherEducationStatus: option.value as Answers["higherEducationStatus"],
                                  ...(option.value === "not_started"
                                    ? {
                                        currentStudyField: "",
                                        universitySemesters: "",
                                        studyIntent: "",
                                      }
                                    : {}),
                                }));
                                setError("");
                              }}
                              className="mt-1"
                            />
                            <span className="text-sm font-medium leading-5">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {answers.higherEducationStatus && answers.higherEducationStatus !== "not_started" ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-semibold sm:col-span-2">
                          {copy.fields.currentStudyField}
                          <input
                            className="field"
                            type="text"
                            maxLength={120}
                            value={answers.currentStudyField}
                            onChange={(event) => setField("currentStudyField", event.target.value)}
                            placeholder={copy.fields.currentStudyFieldHelp}
                          />
                          <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                            {copy.fields.currentStudyFieldHelp}
                          </span>
                        </label>
                        <label className="text-sm font-semibold">
                          {copy.fields.universitySemesters} <span className="font-normal text-[var(--muted)]">({copy.controls.optional})</span>
                          <input
                            className="field"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="30"
                            value={answers.universitySemesters}
                            onChange={(event) => setField("universitySemesters", event.target.value)}
                          />
                          <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                            {copy.fields.universitySemestersHelp}
                          </span>
                        </label>
                        <label className="text-sm font-semibold">
                          {copy.fields.studyIntent}
                          <select
                            className="field"
                            value={answers.studyIntent}
                            onChange={(event) => setField("studyIntent", event.target.value as Answers["studyIntent"])}
                          >
                            <option value="">{copy.controls.choose}</option>
                            {studyIntents.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.target_degree}
                        <select
                          className="field"
                          value={answers.targetDegree}
                          onChange={(event) => {
                            const targetDegree = event.target.value;
                            setAnswers((current) => ({
                              ...current,
                              targetDegree,
                              targetSpecialization:
                                targetDegree === "Master" ? current.targetSpecialization : "",
                            }));
                            setError("");
                          }}
                        >
                          <option value="">{copy.controls.choose}</option>
                          {degrees.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.target_field}
                        <select
                          className="field"
                          value={answers.targetField}
                          onChange={(event) => {
                            const nextField = event.target.value;
                            setAnswers((current) => ({
                              ...current,
                              targetField: nextField,
                              engineeringSpecialty:
                                nextField === "Ingénierie" ? current.engineeringSpecialty : "",
                              scienceSpecialty:
                                nextField === "Sciences" ? current.scienceSpecialty : "",
                            }));
                            setError("");
                          }}
                        >
                          <option value="">{copy.controls.choose}</option>
                          {fields.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                    </div>

                    {answers.targetDegree === "Master" ? (
                      <label className="block text-sm font-semibold">
                        {copy.fields.targetSpecialization} <span className="font-normal text-[var(--muted)]">({copy.controls.optional})</span>
                        <input
                          className="field"
                          type="text"
                          maxLength={120}
                          value={answers.targetSpecialization}
                          onChange={(event) => setField("targetSpecialization", event.target.value)}
                          placeholder={copy.fields.targetSpecializationHelp}
                        />
                        <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                          {copy.fields.targetSpecializationHelp}
                        </span>
                      </label>
                    ) : null}

                    {answers.targetField === "Ingénierie" ? (
                      <label className="block text-sm font-semibold">
                        {engineeringSpecialtyCopy.label}
                        <select
                          className="field"
                          value={answers.engineeringSpecialty}
                          onChange={(event) => setField("engineeringSpecialty", event.target.value)}
                        >
                          <option value="">{copy.controls.choose}</option>
                          {engineeringSpecialties.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                          {engineeringSpecialtyCopy.help}
                        </span>
                      </label>
                    ) : null}

                    {answers.targetField === "Sciences" ? (
                      <label className="block text-sm font-semibold">
                        {scienceSpecialtyCopy.label}
                        <select
                          className="field"
                          value={answers.scienceSpecialty}
                          onChange={(event) => setField("scienceSpecialty", event.target.value as Answers["scienceSpecialty"])}
                        >
                          <option value="">{copy.controls.choose}</option>
                          {scienceSpecialties.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                          {scienceSpecialtyCopy.help}
                        </span>
                      </label>
                    ) : null}
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.german_level}
                        <select className="field" value={answers.germanLevel} onChange={(event) => setField("germanLevel", event.target.value)}>
                          <option value="">{copy.controls.choose}</option>
                          {levels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                      <label className="text-sm font-semibold">
                        {profileCopy.form.fields.english_level}
                        <select className="field" value={answers.englishLevel} onChange={(event) => setField("englishLevel", event.target.value)}>
                          <option value="">{copy.controls.choose}</option>
                          {levels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                    </div>
                    <label className="block text-sm font-semibold">
                      {profileCopy.form.fields.study_language}
                      <select className="field" value={answers.studyLanguage} onChange={(event) => setField("studyLanguage", event.target.value)}>
                        <option value="">{copy.controls.choose}</option>
                        {studyLanguages.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div className="space-y-5">
                    <label className="block text-sm font-semibold">
                      {profileCopy.form.fields.budget_range}
                      <select className="field" value={answers.budgetRange} onChange={(event) => setField("budgetRange", event.target.value)}>
                        <option value="">{copy.controls.choose}</option>
                        {budgets.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>

                    <details className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)]">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                        {copy.fields.cities} · {selectedCitiesLabel}
                      </summary>
                      <div className="border-t border-[var(--border)] p-4">
                        <p className="mb-3 text-xs leading-5 text-[var(--muted)]">{copy.fields.citiesHelp}</p>
                        <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                          {preferredCityOptions.map((city) => {
                            const selected = answers.preferredCities.includes(city);
                            const disabled = !selected && answers.preferredCities.length >= 3;
                            return (
                              <label key={city} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  disabled={disabled}
                                  onChange={() => toggleCity(city)}
                                />
                                <span>{localizePreferredCity(locale, city)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </details>
                  </div>
                ) : null}

                {error ? (
                  <p role="alert" aria-live="polite" className="mt-5 rounded-[var(--radius-control)] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                    {error}
                  </p>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={previous}
                    disabled={step === 1}
                    className="rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copy.controls.previous}
                  </button>
                  <button
                    type="submit"
                    className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
                  >
                    {step === 4 ? copy.controls.summary : copy.controls.next}
                  </button>
                </div>
              </form>
            ) : (
              <div id="orientation-report" className="orientation-print-report">
                <OrientationOnePagePrintReport answers={answers} locale={locale} personalized={personalizedForPrint} identity={identity} />
                <div className="orientation-screen-report">
                <div className="orientation-print-only mb-6 items-center justify-between gap-6 border-b border-slate-300 pb-5">
                  <BrandLogo className="h-10 w-auto" priority />
                  <div className="text-end text-xs leading-5 text-slate-600">
                    <p className="font-bold text-slate-900">{prospectCopy.report.label}</p>
                    <p>{prospectCopy.report.title}</p>
                  </div>
                </div>
                <div className="mb-6 border-b border-[var(--border)] pb-5">
                  <p className="eyebrow">{prospectCopy.report.label}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">{prospectCopy.report.title}</h2>
                  {!isBachelorFirstContact ? (
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{prospectCopy.report.subtitle}</p>
                  ) : null}
                </div>
                {!isBachelorFirstContact ? (
                  <>
                    <p className="eyebrow">{copy.summary.eyebrow}</p>
                    <h2 ref={headingRef} tabIndex={-1} className="section-title mt-2 mb-1">{copy.summary.title}</h2>
                    <p className="mb-6 text-sm leading-6 text-[var(--muted)]">{copy.summary.text}</p>

                    <dl className="grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
                      {summaryRows.map(([label, value]) => (
                        <div key={label} className="bg-[var(--surface)] p-4">
                          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                          <dd className="mt-1 font-semibold"><bdi dir="auto">{value}</bdi></dd>
                        </div>
                      ))}
                    </dl>

                    <SmartOrientationResultCard
                      result={smartPriority}
                      prospectCaptureEnabled={prospectCaptureEnabled && !authenticatedUpdate}
                    />
                  </>
                ) : null}

                <PersonalizedOrientationEngineCard
                  answers={answers}
                  locale={locale}
                  prospectCaptureEnabled={prospectCaptureEnabled && !authenticatedUpdate}
                  onReviewReady={handleReviewReady}
                  onPersonalizedReady={handlePersonalizedReady}
                  onRefineAnswers={(patch) => {
                    setAnswers((current) => ({ ...current, ...patch }));
                    setError("");
                  }}
                />

                {isBachelorFirstContact ? (
                  <details className="orientation-print-hide mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <summary className="cursor-pointer text-sm font-bold">{firstContactCopy.answers}</summary>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{firstContactCopy.answersHelp}</p>
                    <dl className="mt-4 grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
                      {summaryRows.map(([label, value]) => (
                        <div key={label} className="bg-[var(--surface)] p-3">
                          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                          <dd className="mt-1 text-sm font-semibold"><bdi dir="auto">{value}</bdi></dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                ) : (
                  <OrientationRouteCard answers={answers} locale={locale} />
                )}


                {authenticatedUpdate ? (
                  <ProspectOrientationUpdateCard answers={answers} />
                ) : prospectCaptureEnabled ? (
                  <ProspectCaptureCard
                    answers={answers}
                    identity={identity}
                    initialEmail={identity.email}
                    reviewId={orientationReviewId}
                    emailDeliveryEnabled={emailDeliveryEnabled}
                    acquisitionContext={acquisitionContext}
                  />
                ) : null}

                <section className="orientation-print-hide orientation-tone-actions mt-7 rounded-[var(--radius-panel)] border border-[var(--border)] px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-5" aria-label={resultActionsCopy.title}>
                  <p className="text-sm font-semibold">{resultActionsCopy.title}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-0 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
                    >
                      {resultActionsCopy.pdf}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm font-semibold text-[var(--foreground)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--foreground)]"
                    >
                      {resultActionsCopy.adjust}
                    </button>
                    <Link
                      href="/"
                      className="text-sm font-semibold text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--foreground)]"
                    >
                      {resultActionsCopy.home}
                    </Link>
                  </div>
                </section>
                </div>
              </div>
            )}
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}
