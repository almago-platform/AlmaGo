"use client";

import { useMemo, useState } from "react";
import {
  localizePreferredCity,
  localizeProfileOptions,
} from "@/content/student-profile-copy";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type { OrientationRefinementQuestion } from "@/lib/orientation-engine/types";
import {
  diplomaOptions,
  engineeringSpecialtyOptions,
  studyLanguageOptions,
  type SelectOption,
} from "@/lib/student/profile-options";

const copy = {
  fr: {
    eyebrow: "Une information utile",
    title: "Affinons seulement ce qui peut changer le résultat",
    impact: (count: number) => count > 0
      ? "Cette réponse peut modifier " + count + " option" + (count > 1 ? "s" : "") + " évaluée" + (count > 1 ? "s" : "") + "."
      : "Cette réponse peut modifier le groupe de programmes à évaluer.",
    apply: "Mettre à jour et recalculer",
    intakeSeason: "Rentrée visée",
    intakeYear: "Année",
    winter: "Semestre d’hiver",
    summer: "Semestre d’été",
    choose: "Choisir",
    reasons: {
      master_prior_degree_needed: "Pour un Master, le diplôme précédent est nécessaire pour savoir quels prérequis doivent encore être vérifiés.",
      engineering_specialty_needed: "Une spécialité plus précise évite de comparer des programmes d’ingénierie qui n’ont pas le même contenu.",
      deadline_evaluation_needs_intake: "Sans semestre et année cibles, nous ne pouvons pas relier une deadline enregistrée à votre projet.",
      teaching_language_choice_changes_options: "La langue d’études peut changer les programmes pertinents et les exigences linguistiques à contrôler.",
      city_choice_changes_ranking: "Une ville préférée change l’ordre des options, sans changer les règles d’admission.",
    },
    questions: {
      previous_diploma: "Quel est votre diplôme universitaire précédent ?",
      engineering_specialty: "Quelle spécialité d’ingénierie vous correspond le mieux ?",
      target_intake: "Pour quelle rentrée souhaitez-vous commencer ?",
      study_language: "Dans quelle langue souhaitez-vous étudier ?",
      preferred_city: "Quelle ville préférez-vous parmi ces options vérifiées ?",
    },
  },
  ar: {
    eyebrow: "معلومة مفيدة واحدة",
    title: "لنطلب إلا ما يمكن أن يغيّر النتيجة",
    impact: (count: number) => count > 0
      ? "قد تغيّر هذه الإجابة تقييم " + count + " خيار."
      : "قد تغيّر هذه الإجابة مجموعة البرامج التي يجب تقييمها.",
    apply: "تحديث وإعادة الحساب",
    intakeSeason: "موعد بدء الدراسة",
    intakeYear: "السنة",
    winter: "الفصل الشتوي",
    summer: "الفصل الصيفي",
    choose: "اختر",
    reasons: {
      master_prior_degree_needed: "في مشروع الماجستير، نحتاج إلى الشهادة السابقة لمعرفة الشروط الأكاديمية التي يجب التحقق منها.",
      engineering_specialty_needed: "تحديد تخصص هندسي أدق يمنع مقارنة برامج لا تتطابق في المحتوى.",
      deadline_evaluation_needs_intake: "من دون الفصل والسنة المستهدفين لا يمكن ربط موعد مسجل بمشروعك بشكل آمن.",
      teaching_language_choice_changes_options: "لغة الدراسة قد تغيّر البرامج المناسبة ومتطلبات اللغة التي يجب التحقق منها.",
      city_choice_changes_ranking: "اختيار مدينة مفضلة يغيّر ترتيب الخيارات فقط، وليس قواعد القبول.",
    },
    questions: {
      previous_diploma: "ما هي شهادتك الجامعية السابقة؟",
      engineering_specialty: "ما هو تخصص الهندسة الأقرب إلى مشروعك؟",
      target_intake: "متى تريد بدء الدراسة؟",
      study_language: "بأي لغة تريد الدراسة؟",
      preferred_city: "أي مدينة تفضّل من بين هذه الخيارات الموثقة؟",
    },
  },
  en: {
    eyebrow: "One useful detail",
    title: "We only ask for information that can change the result",
    impact: (count: number) => count > 0
      ? "This answer can change " + count + " evaluated option" + (count > 1 ? "s" : "") + "."
      : "This answer can change which programmes are evaluated.",
    apply: "Update and recalculate",
    intakeSeason: "Target intake",
    intakeYear: "Year",
    winter: "Winter semester",
    summer: "Summer semester",
    choose: "Choose",
    reasons: {
      master_prior_degree_needed: "For a Master project, the previous degree is needed to know which academic prerequisites still require verification.",
      engineering_specialty_needed: "A more precise engineering specialisation avoids comparing programmes with very different content.",
      deadline_evaluation_needs_intake: "Without a target semester and year, a stored deadline cannot be safely linked to your project.",
      teaching_language_choice_changes_options: "Your study language can change relevant programmes and the language requirements that need checking.",
      city_choice_changes_ranking: "A preferred city changes the ordering of options, not the admission rules.",
    },
    questions: {
      previous_diploma: "What is your previous university qualification?",
      engineering_specialty: "Which engineering specialisation best matches your project?",
      target_intake: "When do you want to start studying?",
      study_language: "Which language do you want to study in?",
      preferred_city: "Which city do you prefer among these verified options?",
    },
  },
  de: {
    eyebrow: "Eine nützliche Angabe",
    title: "Wir fragen nur nach Informationen, die das Ergebnis ändern können",
    impact: (count: number) => count > 0
      ? "Diese Antwort kann " + count + " bewertete Option" + (count > 1 ? "en" : "") + " verändern."
      : "Diese Antwort kann verändern, welche Studiengänge bewertet werden.",
    apply: "Aktualisieren und neu berechnen",
    intakeSeason: "Gewünschter Studienstart",
    intakeYear: "Jahr",
    winter: "Wintersemester",
    summer: "Sommersemester",
    choose: "Auswählen",
    reasons: {
      master_prior_degree_needed: "Für ein Masterprojekt wird der vorherige Abschluss benötigt, um offene akademische Voraussetzungen zu erkennen.",
      engineering_specialty_needed: "Ein genauerer Ingenieurschwerpunkt verhindert den Vergleich inhaltlich sehr unterschiedlicher Studiengänge.",
      deadline_evaluation_needs_intake: "Ohne Zielsemester und Jahr kann eine gespeicherte Frist nicht sicher deinem Projekt zugeordnet werden.",
      teaching_language_choice_changes_options: "Die gewünschte Unterrichtssprache kann relevante Studiengänge und zu prüfende Sprachanforderungen verändern.",
      city_choice_changes_ranking: "Eine bevorzugte Stadt verändert die Reihenfolge der Optionen, nicht die Zulassungsregeln.",
    },
    questions: {
      previous_diploma: "Welchen vorherigen Hochschulabschluss hast du?",
      engineering_specialty: "Welcher Ingenieurschwerpunkt passt am besten zu deinem Projekt?",
      target_intake: "Wann möchtest du dein Studium beginnen?",
      study_language: "In welcher Sprache möchtest du studieren?",
      preferred_city: "Welche Stadt bevorzugst du unter diesen geprüften Optionen?",
    },
  },
} as const;

function labelFromOptions(
  locale: Locale,
  value: string,
  options: readonly SelectOption[],
) {
  return localizeProfileOptions(locale, options)
    .find((option) => option.value === value)?.label || value;
}

export function OrientationRefinementQuestionCard({
  question,
  answers,
  locale,
  onRefine,
}: {
  question: OrientationRefinementQuestion;
  answers: PublicOrientationAnswers;
  locale: Locale;
  onRefine: (patch: Partial<PublicOrientationAnswers>) => void;
}) {
  const t = copy[locale];
  const currentYear = Math.max(2026, new Date().getFullYear());
  const intakeYears = useMemo(
    () => Array.from({ length: 6 }, (_, index) => String(currentYear + index)),
    [currentYear],
  );
  const [season, setSeason] = useState<"" | "winter" | "summer">(
    answers.targetIntakeSeason,
  );
  const [year, setYear] = useState(answers.targetIntakeYear);

  const affected = question.affectedRecommendationIds.length;

  function applyChoice(value: string) {
    if (question.field === "previous_diploma") {
      onRefine({ lastDiploma: value });
    } else if (question.field === "engineering_specialty") {
      onRefine({ engineeringSpecialty: value });
    } else if (question.field === "study_language") {
      onRefine({ studyLanguage: value });
    } else if (question.field === "preferred_city") {
      onRefine({ preferredCities: [value] });
    }
  }

  function choiceLabel(value: string) {
    if (question.field === "previous_diploma") {
      return labelFromOptions(locale, value, diplomaOptions);
    }
    if (question.field === "engineering_specialty") {
      return labelFromOptions(locale, value, engineeringSpecialtyOptions);
    }
    if (question.field === "study_language") {
      return labelFromOptions(locale, value, studyLanguageOptions);
    }
    if (question.field === "preferred_city") {
      return localizePreferredCity(locale, value);
    }
    return value;
  }

  return (
    <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4 sm:p-5">
      <p className="eyebrow">{t.eyebrow}</p>
      <h4 className="mt-1 text-base font-bold">{t.title}</h4>
      <p className="mt-3 text-sm font-semibold">{t.questions[question.field]}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
        {t.reasons[question.reason]}
      </p>
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{t.impact(affected)}</p>

      {question.field === "target_intake" ? (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_0.7fr_auto] sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            if (!season || !year) return;
            onRefine({
              targetIntakeSeason: season,
              targetIntakeYear: year,
            });
          }}
        >
          <label className="text-sm font-semibold">
            {t.intakeSeason}
            <select
              className="field"
              value={season}
              onChange={(event) => setSeason(event.target.value as "" | "winter" | "summer")}
            >
              <option value="">{t.choose}</option>
              <option value="winter">{t.winter}</option>
              <option value="summer">{t.summer}</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            {t.intakeYear}
            <select
              className="field"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            >
              <option value="">{t.choose}</option>
              {intakeYears.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <button
            type="submit"
            disabled={!season || !year}
            className="rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.apply}
          </button>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {question.choices.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => applyChoice(value)}
              className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
            >
              {choiceLabel(value)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
