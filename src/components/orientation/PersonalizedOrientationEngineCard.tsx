"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type {
  OrientationAdvisorOutput,
  OrientationEngineResult,
  OrientationRuleCode,
} from "@/lib/orientation-engine/types";

type EngineResponse = {
  engine: OrientationEngineResult;
  advisor: OrientationAdvisorOutput;
};

const copy = {
  fr: {
    eyebrow: "Orientation personnalisée V4",
    title: "Des options vérifiées pour votre profil",
    lead: "AlmaGo filtre le catalogue avec des règles contrôlées. L’IA n’est pas utilisée pour inventer l’admission.",
    loading: "Analyse des options vérifiées…",
    unavailable: "Les options détaillées sont momentanément indisponibles. Votre orientation générale reste valable.",
    catalogueGap: "Notre catalogue vérifié ne contient pas encore trois options suffisamment proches de ce profil. Nous n’inventons pas de programme pour compléter la liste.",
    why: "Pourquoi cette option apparaît",
    missing: "À vérifier ou compléter",
    sources: "Sources",
    confidence: "Qualité des informations",
    high: "Élevée",
    medium: "Moyenne",
    incomplete: "Incomplète",
    categories: {
      conditions_well_covered: "Conditions bien couvertes",
      fits_preferences: "Correspond à vos préférences",
      conditions_to_complete: "Intéressant, avec conditions à compléter",
    },
    actions: "Ce que vous pouvez faire maintenant",
  },
  ar: {
    eyebrow: "توجيه شخصي V4",
    title: "خيارات موثقة تناسب ملفك",
    lead: "يقوم AlmaGo بتصفية الكتالوج بقواعد مضبوطة. لا تُستخدم الذكاء الاصطناعي لاختراع شروط القبول.",
    loading: "جارٍ تحليل الخيارات الموثقة…",
    unavailable: "الخيارات التفصيلية غير متاحة مؤقتًا. يبقى توجيهك العام صالحًا.",
    catalogueGap: "لا يحتوي الكتالوج الموثق لدينا بعد على ثلاثة خيارات قريبة بما يكفي من هذا الملف. لا نختلق برامج لإكمال القائمة.",
    why: "لماذا يظهر هذا الخيار",
    missing: "ما يجب التحقق منه أو استكماله",
    sources: "المصادر",
    confidence: "جودة المعلومات",
    high: "مرتفعة",
    medium: "متوسطة",
    incomplete: "غير مكتملة",
    categories: {
      conditions_well_covered: "الشروط مغطاة بشكل جيد",
      fits_preferences: "يتوافق مع تفضيلاتك",
      conditions_to_complete: "خيار مهم مع شروط يجب استكمالها",
    },
    actions: "ما يمكنك فعله الآن",
  },
  en: {
    eyebrow: "Personalised orientation V4",
    title: "Verified options for your profile",
    lead: "AlmaGo filters the catalogue with controlled rules. AI is not used to invent admission requirements.",
    loading: "Analysing verified options…",
    unavailable: "Detailed options are temporarily unavailable. Your general orientation remains valid.",
    catalogueGap: "Our verified catalogue does not yet contain three sufficiently close options for this profile. We do not invent programmes to fill the list.",
    why: "Why this option appears",
    missing: "To verify or complete",
    sources: "Sources",
    confidence: "Information quality",
    high: "High",
    medium: "Medium",
    incomplete: "Incomplete",
    categories: {
      conditions_well_covered: "Conditions well covered",
      fits_preferences: "Matches your preferences",
      conditions_to_complete: "Interesting, with conditions to complete",
    },
    actions: "What you can do now",
  },
  de: {
    eyebrow: "Personalisierte Orientierung V4",
    title: "Geprüfte Optionen für dein Profil",
    lead: "AlmaGo filtert den Katalog mit kontrollierten Regeln. KI erfindet keine Zulassungsbedingungen.",
    loading: "Geprüfte Optionen werden analysiert…",
    unavailable: "Detaillierte Optionen sind vorübergehend nicht verfügbar. Deine allgemeine Orientierung bleibt gültig.",
    catalogueGap: "Unser geprüfter Katalog enthält für dieses Profil noch keine drei ausreichend passenden Optionen. Wir erfinden keine Studiengänge, um die Liste zu füllen.",
    why: "Warum diese Option erscheint",
    missing: "Zu prüfen oder zu ergänzen",
    sources: "Quellen",
    confidence: "Informationsqualität",
    high: "Hoch",
    medium: "Mittel",
    incomplete: "Unvollständig",
    categories: {
      conditions_well_covered: "Bedingungen gut abgedeckt",
      fits_preferences: "Passt zu deinen Präferenzen",
      conditions_to_complete: "Interessant, mit noch offenen Bedingungen",
    },
    actions: "Was du jetzt tun kannst",
  },
} satisfies Record<Locale, unknown>;

const ruleLabels: Record<Locale, Partial<Record<OrientationRuleCode, string>>> = {
  fr: {
    degree_match: "Le niveau du diplôme correspond à votre objectif.",
    field_match: "Le programme correspond à votre domaine ou spécialité.",
    language_satisfied: "Votre niveau de langue satisfait une exigence connue.",
    teaching_language_match: "La langue d’enseignement correspond à votre préférence.",
    preferred_city: "L’établissement se trouve dans une ville que vous avez choisie.",
    source_verified: "Le programme dispose d’une source avec date de vérification.",
    academic_access_supported: "Votre accès académique est soutenu par la règle actuellement vérifiée.",
    academic_access_review: "Votre accès académique doit encore être confirmé.",
    language_missing: "L’exigence linguistique exacte n’est pas assez structurée dans notre catalogue.",
    language_insufficient: "Votre niveau actuel est encore sous l’exigence connue.",
    teaching_language_other: "La langue d’enseignement diffère de votre préférence actuelle.",
    other_city: "Cette option se trouve hors de vos villes choisies.",
    deadline_unknown: "Votre semestre cible n’est pas encore assez précis pour valider la deadline.",
    studienkolleg_required: "Cette option comporte une condition de Studienkolleg connue.",
    uni_assist_required: "La candidature passe par uni-assist selon la donnée actuelle.",
    budget_not_verified: "Le coût de vie de la ville n’est pas encore vérifié dans ce calcul.",
    source_incomplete: "La traçabilité de cette information est incomplète.",
  },
  ar: {
    degree_match: "مستوى الشهادة يتوافق مع هدفك.",
    field_match: "البرنامج يتوافق مع مجالك أو تخصصك.",
    language_satisfied: "مستواك اللغوي يحقق شرطًا معروفًا.",
    teaching_language_match: "لغة الدراسة تتوافق مع تفضيلك.",
    preferred_city: "المؤسسة موجودة في مدينة اخترتها.",
    source_verified: "للبرنامج مصدر مع تاريخ تحقق.",
    academic_access_supported: "الدخول الأكاديمي مدعوم بالقاعدة التي تم التحقق منها حاليًا.",
    academic_access_review: "يجب تأكيد الدخول الأكاديمي.",
    language_missing: "شرط اللغة الدقيق غير منظم بما يكفي في الكتالوج.",
    language_insufficient: "مستواك الحالي أقل من الشرط المعروف.",
    teaching_language_other: "لغة الدراسة تختلف عن تفضيلك الحالي.",
    other_city: "هذا الخيار خارج المدن التي اخترتها.",
    deadline_unknown: "الفصل الدراسي المستهدف غير محدد بما يكفي للتحقق من الموعد.",
    studienkolleg_required: "هذا الخيار يتضمن شرط Studienkolleg معروفًا.",
    uni_assist_required: "التقديم يمر عبر uni-assist حسب البيانات الحالية.",
    budget_not_verified: "تكلفة المعيشة في المدينة لم يتم التحقق منها في هذا الحساب.",
    source_incomplete: "مصدر هذه المعلومة غير مكتمل.",
  },
  en: {
    degree_match: "The degree level matches your objective.",
    field_match: "The programme matches your field or specialisation.",
    language_satisfied: "Your language level satisfies a known requirement.",
    teaching_language_match: "The teaching language matches your preference.",
    preferred_city: "The institution is in a city you selected.",
    source_verified: "The programme has a source with a verification date.",
    academic_access_supported: "Your academic access is supported by the currently verified rule.",
    academic_access_review: "Your academic access still needs confirmation.",
    language_missing: "The exact language requirement is not structured enough in our catalogue.",
    language_insufficient: "Your current level is below the known requirement.",
    teaching_language_other: "The teaching language differs from your current preference.",
    other_city: "This option is outside your selected cities.",
    deadline_unknown: "Your target intake is not precise enough to validate the deadline.",
    studienkolleg_required: "This option has a known Studienkolleg condition.",
    uni_assist_required: "The application uses uni-assist according to current data.",
    budget_not_verified: "The city's cost of living is not yet verified in this calculation.",
    source_incomplete: "The traceability of this information is incomplete.",
  },
  de: {
    degree_match: "Das Abschlussniveau passt zu deinem Ziel.",
    field_match: "Der Studiengang passt zu deinem Fach oder Schwerpunkt.",
    language_satisfied: "Dein Sprachniveau erfüllt eine bekannte Anforderung.",
    teaching_language_match: "Die Unterrichtssprache passt zu deiner Präferenz.",
    preferred_city: "Die Hochschule liegt in einer von dir gewählten Stadt.",
    source_verified: "Der Studiengang hat eine Quelle mit Prüfdatum.",
    academic_access_supported: "Dein Hochschulzugang wird durch die aktuell geprüfte Regel gestützt.",
    academic_access_review: "Dein Hochschulzugang muss noch bestätigt werden.",
    language_missing: "Die genaue Sprachanforderung ist im Katalog noch nicht ausreichend strukturiert.",
    language_insufficient: "Dein aktuelles Niveau liegt unter der bekannten Anforderung.",
    teaching_language_other: "Die Unterrichtssprache weicht von deiner aktuellen Präferenz ab.",
    other_city: "Diese Option liegt außerhalb deiner gewählten Städte.",
    deadline_unknown: "Dein Zielsemester ist noch nicht präzise genug, um die Frist zu prüfen.",
    studienkolleg_required: "Für diese Option ist eine Studienkolleg-Bedingung bekannt.",
    uni_assist_required: "Die Bewerbung läuft laut aktuellem Datenstand über uni-assist.",
    budget_not_verified: "Die Lebenshaltungskosten der Stadt sind in dieser Berechnung noch nicht verifiziert.",
    source_incomplete: "Die Nachvollziehbarkeit dieser Information ist unvollständig.",
  },
};

const actionLabels: Record<Locale, Record<string, string>> = {
  fr: {
    confirm_academic_access: "Confirmer votre accès académique avec la règle officielle adaptée.",
    improve_german: "Continuer l’allemand vers le niveau demandé par les programmes retenus.",
    improve_english: "Renforcer l’anglais vers le niveau demandé par les programmes retenus.",
    verify_language_certificate: "Vérifier le certificat de langue accepté par chaque programme.",
    prepare_academic_documents: "Préparer les documents académiques disponibles et leurs traductions si nécessaire.",
    verify_programme_requirements: "Vérifier les prérequis détaillés des programmes retenus.",
    prepare_uni_assist: "Préparer la candidature uni-assist lorsque le programme l’exige.",
    watch_deadline: "Fixer le semestre cible et contrôler les deadlines officielles.",
    prepare_financing: "Cadrer le budget et la preuve de financement avant l’étape visa.",
    prepare_visa_after_admission: "Après une admission, préparer assurance, financement et visa.",
  },
  ar: {
    confirm_academic_access: "تأكيد الدخول الأكاديمي وفق القاعدة الرسمية المناسبة.",
    improve_german: "مواصلة الألمانية نحو المستوى المطلوب للبرامج المختارة.",
    improve_english: "تحسين الإنجليزية نحو المستوى المطلوب للبرامج المختارة.",
    verify_language_certificate: "التحقق من شهادة اللغة المقبولة لكل برنامج.",
    prepare_academic_documents: "تحضير الوثائق الأكاديمية المتوفرة وترجماتها عند الحاجة.",
    verify_programme_requirements: "التحقق من المتطلبات التفصيلية للبرامج المختارة.",
    prepare_uni_assist: "تحضير ملف uni-assist عندما يتطلبه البرنامج.",
    watch_deadline: "تحديد الفصل المستهدف والتحقق من المواعيد الرسمية.",
    prepare_financing: "تحديد الميزانية وإثبات التمويل قبل مرحلة التأشيرة.",
    prepare_visa_after_admission: "بعد القبول، تحضير التأمين والتمويل والتأشيرة.",
  },
  en: {
    confirm_academic_access: "Confirm your academic access using the applicable official rule.",
    improve_german: "Continue German toward the level required by selected programmes.",
    improve_english: "Improve English toward the level required by selected programmes.",
    verify_language_certificate: "Verify the language certificate accepted by each programme.",
    prepare_academic_documents: "Prepare the available academic documents and translations when needed.",
    verify_programme_requirements: "Verify the detailed prerequisites of selected programmes.",
    prepare_uni_assist: "Prepare the uni-assist application when required.",
    watch_deadline: "Set the target intake and check official deadlines.",
    prepare_financing: "Frame the budget and proof of funding before the visa stage.",
    prepare_visa_after_admission: "After admission, prepare insurance, funding and visa.",
  },
  de: {
    confirm_academic_access: "Hochschulzugang mit der passenden offiziellen Regel bestätigen.",
    improve_german: "Deutsch bis zum Niveau der ausgewählten Studiengänge weiterlernen.",
    improve_english: "Englisch bis zum Niveau der ausgewählten Studiengänge verbessern.",
    verify_language_certificate: "Akzeptierten Sprachnachweis für jeden Studiengang prüfen.",
    prepare_academic_documents: "Vorhandene akademische Unterlagen und nötige Übersetzungen vorbereiten.",
    verify_programme_requirements: "Detaillierte Voraussetzungen der ausgewählten Studiengänge prüfen.",
    prepare_uni_assist: "uni-assist-Bewerbung vorbereiten, wenn sie verlangt wird.",
    watch_deadline: "Zielsemester festlegen und offizielle Fristen prüfen.",
    prepare_financing: "Budget und Finanzierungsnachweis vor der Visumphase klären.",
    prepare_visa_after_admission: "Nach einer Zulassung Versicherung, Finanzierung und Visum vorbereiten.",
  },
};

function formatDate(value: string | null, locale: Locale) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function PersonalizedOrientationEngineCard({
  answers,
  locale,
}: {
  answers: PublicOrientationAnswers;
  locale: Locale;
}) {
  const t = copy[locale] as (typeof copy)["fr"];
  const requestBody = useMemo(() => JSON.stringify({ answers, locale }), [answers, locale]);
  const [requestState, setRequestState] = useState<{
    key: string | null;
    result: EngineResponse | null;
    error: boolean;
  }>({
    key: null,
    result: null,
    error: false,
  });

  const isCurrentRequest = requestState.key === requestBody;
  const result = isCurrentRequest ? requestState.result : null;
  const state: "loading" | "ready" | "error" = !isCurrentRequest
    ? "loading"
    : requestState.error
      ? "error"
      : "ready";

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/orientation/engine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("orientation-engine");
        return response.json() as Promise<EngineResponse>;
      })
      .then((payload) => {
        setRequestState({
          key: requestBody,
          result: payload,
          error: false,
        });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRequestState({
          key: requestBody,
          result: null,
          error: true,
        });
      });

    return () => controller.abort();
  }, [requestBody]);

  return (
    <section className="orientation-print-hide mt-8" aria-labelledby="orientation-v4-title">
      <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="eyebrow">{t.eyebrow}</p>
        <h3 id="orientation-v4-title" className="mt-2 text-xl font-bold">{t.title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.lead}</p>

        {state === "loading" ? (
          <p className="mt-5 text-sm font-semibold">{t.loading}</p>
        ) : null}

        {state === "error" ? (
          <p className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm leading-6">
            {t.unavailable}
          </p>
        ) : null}

        {state === "ready" && result ? (
          <>
            {result.engine.recommendations.length < 3 ? (
              <p className="mt-5 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4 text-sm leading-6">
                {t.catalogueGap}
              </p>
            ) : null}

            <div className="mt-5 grid gap-4">
              {result.engine.recommendations.map((recommendation) => {
                const source = recommendation.sources[0] || null;
                const confidenceLabel = t[recommendation.informationConfidence];
                const why = recommendation.why
                  .map((code) => ruleLabels[locale][code])
                  .filter(Boolean)
                  .slice(0, 4);
                const missing = [...recommendation.warnings, ...recommendation.missingInformation]
                  .map((code) => ruleLabels[locale][code])
                  .filter(Boolean)
                  .slice(0, 5);

                return (
                  <article
                    key={recommendation.programme.id}
                    className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-strong)]">
                          {t.categories[recommendation.category]}
                        </p>
                        <h4 className="mt-1 text-lg font-bold">
                          {recommendation.programme.name}
                        </h4>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {recommendation.programme.university.name}
                          {recommendation.programme.university.city
                            ? ` · ${recommendation.programme.university.city}`
                            : ""}
                        </p>
                      </div>
                      <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold">
                        {t.confidence}: {confidenceLabel}
                      </div>
                    </div>

                    {why.length ? (
                      <div className="mt-4">
                        <p className="text-sm font-bold">{t.why}</p>
                        <ul className="mt-2 space-y-1 text-sm leading-6">
                          {why.map((item) => <li key={item}>✓ {item}</li>)}
                        </ul>
                      </div>
                    ) : null}

                    {missing.length ? (
                      <div className="mt-4">
                        <p className="text-sm font-bold">{t.missing}</p>
                        <ul className="mt-2 space-y-1 text-sm leading-6">
                          {missing.map((item) => <li key={item}>⚠ {item}</li>)}
                        </ul>
                      </div>
                    ) : null}

                    {source ? (
                      <div className="mt-4 text-xs leading-5 text-[var(--muted)]">
                        <span className="font-bold">{t.sources}: </span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2"
                        >
                          {source.label}
                        </a>
                        {formatDate(source.verifiedAt, locale)
                          ? ` · ${formatDate(source.verifiedAt, locale)}`
                          : ""}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-sm font-bold">{t.actions}</p>
              <ol className="mt-2 space-y-2 text-sm leading-6">
                {result.advisor.priorityActionCodes.map((code, index) => (
                  <li key={code}>
                    <strong>{index + 1}.</strong> {actionLabels[locale][code] || code}
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
