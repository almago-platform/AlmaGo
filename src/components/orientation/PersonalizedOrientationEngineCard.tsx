"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { OrientationRefinementQuestionCard } from "@/components/orientation/OrientationRefinementQuestionCard";
import { OrientationLetterCard } from "@/components/orientation/OrientationLetterCard";
import { OrientationPersonalizedWriterCard } from "@/components/orientation/OrientationPersonalizedWriterCard";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type { OrientationPublicPersonalizedResult } from "@/lib/orientation-engine/result/types";
import type { OrientationCanonicalShortlist } from "@/lib/orientation-engine/result/canonical";
import type {
  OrientationAdvisorOutput,
  OrientationEngineResult,
  OrientationLetterOutput,
  OrientationRuleCode,
  OrientationScoutResult,
} from "@/lib/orientation-engine/types";

type EngineResponse = {
  engine: OrientationEngineResult;
  advisor: OrientationAdvisorOutput;
  letter: OrientationLetterOutput;
  scout: OrientationScoutResult;
  shortlist: OrientationCanonicalShortlist;
  personalized: OrientationPublicPersonalizedResult | null;
  geography?: {
    requestedCities: string[];
    resolvedTier: "chosen_city" | "nearby" | "land" | "germany" | null;
    source: "catalogue" | "openai" | null;
    scopeCities: string[];
    landNames: string[];
    attempted: Array<{
      tier: "chosen_city" | "nearby" | "land" | "germany";
      source: "catalogue" | "openai";
    }>;
  };
};

const copy = {
  fr: {
    bacObtained: "Félicitations pour votre bac ! C’est une belle étape franchie pour votre projet d’études.",
    bacPreparing: "Bon courage pour la préparation de votre bac ! Votre projet d’études en Allemagne peut déjà prendre forme.",
    bacNoBac: "Chaque parcours a son point de départ. Nous sommes là pour explorer les possibilités qui correspondent à votre situation.",
    eyebrow: "Orientation personnalisée V4",
    title: "Votre orientation personnalisée",
    lead: "Une lettre simple pour comprendre votre chemin, puis choisir les universités avec Campus Allemagne.",
    loading: "Préparation de votre orientation…",
    loadingTitle: "Nous préparons votre orientation personnalisée",
    loadingLead: "Nous analysons votre profil et les pistes d’études les plus cohérentes pour votre projet en Allemagne.",
    loadingSteps: [
      "Analyse de votre profil",
      "Vérification des pistes d’études",
      "Préparation de votre rapport personnalisé",
    ],
    loadingNote: "Cela peut prendre quelques instants. Gardez cette page ouverte pendant la préparation.",
    unavailable: "Votre orientation personnalisée n’a pas pu être préparée. Vous pouvez réessayer.",
    enriching: "Votre première orientation est prête. Nous cherchons encore des formations vérifiées pour compléter votre résultat.",
    degraded: "Les recherches complémentaires sont indisponibles pour le moment. Votre lettre personnalisée reste accessible.",
    retry: "Réessayer la recherche complémentaire",
    details: "Comprendre notre analyse en détail",
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
    intake: "Rentrée ciblée",
    deadline: "Date limite de candidature",
    deadlineUnknown: "à vérifier",
    winter: "hiver",
    summer: "été",
  },
  ar: {
    bacObtained: "مبروك نجاحك في البكالوريا! إنها خطوة جميلة نحو مشروعك الدراسي.",
    bacPreparing: "بالتوفيق في تحضير البكالوريا! يمكنك من الآن البدء في رسم مشروعك للدراسة في ألمانيا.",
    bacNoBac: "لكل شخص مساره الخاص. نحن هنا لاستكشاف الخيارات التي تناسب وضعك الدراسي.",
    eyebrow: "توجيه شخصي V4",
    title: "توجيهك الشخصي",
    lead: "رسالة بسيطة تساعدك على فهم طريقك، ثم نختار الجامعات معًا مع Campus Allemagne.",
    loading: "جارٍ إعداد توجيهك…",
    loadingTitle: "نُعِدّ توجيهك الشخصي",
    loadingLead: "نحلل ملفك والمسارات الدراسية الأكثر توافقًا مع مشروعك في ألمانيا.",
    loadingSteps: [
      "تحليل ملفك",
      "التحقق من المسارات الدراسية",
      "إعداد تقريرك الشخصي",
    ],
    loadingNote: "قد يستغرق ذلك بضع لحظات. أبقِ هذه الصفحة مفتوحة أثناء الإعداد.",
    unavailable: "تعذر إعداد توجيهك الشخصي. يمكنك المحاولة مرة أخرى.",
    enriching: "توجيهك الأولي جاهز. نبحث الآن عن برامج موثوقة لإكمال النتيجة.",
    degraded: "البحث الإضافي غير متاح حاليًا. يمكنك دائمًا قراءة رسالتك الشخصية.",
    retry: "إعادة البحث الإضافي",
    details: "اكتشف تفاصيل تحليلنا",
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
    intake: "موعد الدراسة المستهدف",
    deadline: "آخر موعد للتقديم",
    deadlineUnknown: "يجب التحقق منه",
    winter: "الشتاء",
    summer: "الصيف",
  },
  en: {
    bacObtained: "Congratulations on your Baccalaureate! It is a great milestone for your study plans.",
    bacPreparing: "Best of luck as you prepare for your Baccalaureate! You can already start planning your studies in Germany.",
    bacNoBac: "Every educational journey starts somewhere. We are here to explore options suited to your situation.",
    eyebrow: "Personalised orientation V4",
    title: "Your personalised orientation",
    lead: "A simple letter to understand your path, then choose universities together with Campus Allemagne.",
    loading: "Preparing your orientation…",
    loadingTitle: "We’re preparing your personalised orientation",
    loadingLead: "We’re analysing your profile and the study paths that best match your Germany project.",
    loadingSteps: [
      "Analysing your profile",
      "Checking study pathways",
      "Preparing your personalised report",
    ],
    loadingNote: "This can take a few moments. Keep this page open while we prepare your result.",
    unavailable: "We couldn't prepare your personalised orientation. Please try again.",
    enriching: "Your first orientation is ready. We're still checking verified programmes to enrich it.",
    degraded: "Further research is temporarily unavailable. Your personalised letter is still here.",
    retry: "Retry the additional research",
    details: "Explore our detailed analysis",
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
    intake: "Target intake",
    deadline: "Application deadline",
    deadlineUnknown: "to verify",
    winter: "winter",
    summer: "summer",
  },
  de: {
    bacObtained: "Herzlichen Glückwunsch zum Abitur beziehungsweise Baccalauréat! Ein schöner Schritt für dein Studienvorhaben.",
    bacPreparing: "Viel Erfolg bei der Vorbereitung auf dein Baccalauréat! Du kannst dein Studium in Deutschland schon jetzt planen.",
    bacNoBac: "Jeder Bildungsweg beginnt anders. Wir möchten mit dir passende Möglichkeiten erkunden.",
    eyebrow: "Personalisierte Orientierung V4",
    title: "Deine persönliche Orientierung",
    lead: "Ein einfacher Brief, der deinen Weg erklärt. Danach wählen wir die Hochschulen gemeinsam mit Campus Allemagne aus.",
    loading: "Deine Orientierung wird vorbereitet…",
    loadingTitle: "Wir bereiten deine persönliche Orientierung vor",
    loadingLead: "Wir analysieren dein Profil und die Studienwege, die am besten zu deinem Deutschland-Projekt passen.",
    loadingSteps: [
      "Profil analysieren",
      "Studienwege prüfen",
      "Persönlichen Bericht vorbereiten",
    ],
    loadingNote: "Das kann einige Augenblicke dauern. Lass diese Seite während der Vorbereitung geöffnet.",
    unavailable: "Deine persönliche Orientierung konnte nicht erstellt werden. Bitte versuche es erneut.",
    enriching: "Deine erste Orientierung ist bereit. Wir prüfen weitere Studiengänge für das ausführliche Ergebnis.",
    degraded: "Die ergänzende Recherche ist derzeit nicht verfügbar. Dein persönlicher Brief bleibt sichtbar.",
    retry: "Ergänzende Recherche erneut versuchen",
    details: "Unsere Analyse im Detail ansehen",
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
    intake: "Geplanter Studienstart",
    deadline: "Bewerbungsfrist",
    deadlineUnknown: "zu prüfen",
    winter: "Winter",
    summer: "Sommer",
  },
} satisfies Record<Locale, unknown>;

function geographicFallbackMessage(
  locale: Locale,
  geography: EngineResponse["geography"],
) {
  if (
    !geography
    || geography.requestedCities.length === 0
    || !geography.resolvedTier
    || geography.resolvedTier === "chosen_city"
  ) {
    return null;
  }

  const cities = geography.requestedCities.join(", ");
  const lands = geography.landNames.join(", ");

  const messages = {
    fr: {
      nearby: `Nous n’avons pas trouvé de programme suffisamment vérifié à ${cities} correspondant à votre profil. Nous avons donc élargi la recherche d’abord aux villes proches.`,
      land: `Nous n’avons pas trouvé de programme suffisamment vérifié à ${cities} ni dans les villes proches. Nous avons donc élargi la recherche à ${lands || "la région correspondante"}.`,
      germany: `Nous n’avons pas trouvé de programme suffisamment vérifié à ${cities}, dans les villes proches ou dans la région correspondante. Nous avons donc élargi la recherche au reste de l’Allemagne.`,
    },
    ar: {
      nearby: `لم نجد برنامجًا موثوقًا بما يكفي في ${cities} ومتوافقًا مع ملفك، لذلك وسّعنا البحث أولًا إلى المدن القريبة.`,
      land: `لم نجد برنامجًا موثوقًا بما يكفي في ${cities} أو المدن القريبة، لذلك وسّعنا البحث إلى ${lands || "المنطقة المقابلة"}.`,
      germany: `لم نجد برنامجًا موثوقًا بما يكفي في ${cities} أو المدن القريبة أو المنطقة المقابلة، لذلك وسّعنا البحث إلى بقية ألمانيا.`,
    },
    en: {
      nearby: `We did not find a sufficiently verified programme in ${cities} matching your profile, so we widened the search first to nearby cities.`,
      land: `We did not find a sufficiently verified programme in ${cities} or nearby cities, so we widened the search to ${lands || "the corresponding region"}.`,
      germany: `We did not find a sufficiently verified programme in ${cities}, nearby cities or the corresponding region, so we widened the search to the rest of Germany.`,
    },
    de: {
      nearby: `Wir haben in ${cities} keinen ausreichend geprüften Studiengang gefunden, der zu deinem Profil passt. Deshalb haben wir die Suche zuerst auf nahegelegene Städte erweitert.`,
      land: `Wir haben in ${cities} und in den nahegelegenen Städten keinen ausreichend geprüften passenden Studiengang gefunden. Deshalb haben wir die Suche auf ${lands || "die entsprechende Region"} erweitert.`,
      germany: `Wir haben in ${cities}, in nahegelegenen Städten und in der entsprechenden Region keinen ausreichend geprüften passenden Studiengang gefunden. Deshalb haben wir die Suche auf ganz Deutschland erweitert.`,
    },
  } as const;

  return messages[locale][geography.resolvedTier];
}

const ruleLabels: Record<Locale, Partial<Record<OrientationRuleCode, string>>> = {
  fr: {
    degree_match: "Le niveau du diplôme correspond à votre objectif.",
    field_match: "Le programme correspond à votre domaine ou spécialité.",
    language_satisfied: "Votre niveau déclaré correspond à une exigence linguistique renseignée. Le certificat accepté reste à vérifier.",
    teaching_language_match: "La langue d’enseignement correspond à votre préférence.",
    preferred_city: "L’établissement se trouve dans une ville que vous avez choisie.",
    source_verified: "Le programme dispose d’une source avec date de vérification.",
    academic_access_supported: "Votre accès académique est soutenu par la règle actuellement vérifiée.",
    academic_access_review: "Votre accès académique doit encore être confirmé.",
    master_subject_credits_satisfied: "Vos ECTS déclarés atteignent un prérequis Master vérifié.",
    master_subject_credits_missing: "Nous avons besoin de vos ECTS dans une matière précise pour vérifier ce prérequis Master.",
    master_subject_credits_insufficient: "Vos ECTS déclarés sont sous un minimum vérifié ; l’université doit confirmer l’équivalence exacte de vos cours.",
    master_curriculum_unknown: "Les prérequis disciplinaires de ce Master ne sont pas encore assez structurés pour une comparaison automatique.",
    language_missing: "L’exigence linguistique exacte n’est pas assez structurée dans notre catalogue.",
    language_insufficient: "Votre niveau actuel est encore sous l’exigence connue.",
    teaching_language_other: "La langue d’enseignement diffère de votre préférence actuelle.",
    other_city: "Cette option se trouve hors de vos villes choisies.",
    intake_match: "La rentrée choisie est proposée dans les données structurées du programme.",
    intake_unavailable: "La rentrée choisie n’est pas proposée dans les données structurées du programme.",
    intake_unknown: "La rentrée du programme ou votre rentrée cible doit encore être précisée.",
    deadline_open: "La deadline vérifiée correspondant à cette rentrée est encore ouverte.",
    deadline_closed: "La deadline vérifiée correspondant à cette rentrée est dépassée.",
    deadline_to_verify: "Une date est enregistrée, mais elle ne peut pas être reliée avec certitude à l’année ciblée.",
    deadline_unknown: "Votre semestre cible n’est pas encore assez précis pour valider la deadline.",
    studienkolleg_required: "Cette option comporte une condition de Studienkolleg connue.",
    uni_assist_required: "La candidature passe par uni-assist selon la donnée actuelle.",
    budget_not_verified: "Le coût de vie de la ville n’est pas encore vérifié dans ce calcul.",
    source_incomplete: "La traçabilité de cette information est incomplète.",
  },
  ar: {
    degree_match: "مستوى الشهادة يتوافق مع هدفك.",
    field_match: "البرنامج يتوافق مع مجالك أو تخصصك.",
    language_satisfied: "مستواك اللغوي المصرح به يتوافق مع شرط مسجّل. يجب التأكد من شهادة اللغة المقبولة.",
    teaching_language_match: "لغة الدراسة تتوافق مع تفضيلك.",
    preferred_city: "المؤسسة موجودة في مدينة اخترتها.",
    source_verified: "للبرنامج مصدر مع تاريخ تحقق.",
    academic_access_supported: "الدخول الأكاديمي مدعوم بالقاعدة التي تم التحقق منها حاليًا.",
    academic_access_review: "يجب تأكيد الدخول الأكاديمي.",
    master_subject_credits_satisfied: "نقاط ECTS التي صرّحت بها تحقق شرطًا موثقًا للماجستير.",
    master_subject_credits_missing: "نحتاج عدد نقاط ECTS في مادة محددة للتحقق من هذا الشرط للماجستير.",
    master_subject_credits_insufficient: "نقاط ECTS المصرّح بها أقل من حد موثق؛ يجب على الجامعة تأكيد معادلة مقرراتك بدقة.",
    master_curriculum_unknown: "المتطلبات الدراسية لهذا الماجستير ليست منظمة بما يكفي بعد للمقارنة الآلية.",
    language_missing: "شرط اللغة الدقيق غير منظم بما يكفي في الكتالوج.",
    language_insufficient: "مستواك الحالي أقل من الشرط المعروف.",
    teaching_language_other: "لغة الدراسة تختلف عن تفضيلك الحالي.",
    other_city: "هذا الخيار خارج المدن التي اخترتها.",
    intake_match: "موعد البدء الذي اخترته موجود ضمن بيانات البرنامج المنظمة.",
    intake_unavailable: "موعد البدء الذي اخترته غير موجود ضمن بيانات البرنامج المنظمة.",
    intake_unknown: "يجب توضيح موعد بدء البرنامج أو موعدك المستهدف.",
    deadline_open: "الموعد النهائي الموثّق لهذه الدورة ما زال مفتوحًا.",
    deadline_closed: "الموعد النهائي الموثّق لهذه الدورة انتهى.",
    deadline_to_verify: "توجد قيمة تاريخ، لكن لا يمكن ربطها بالسنة المستهدفة بثقة كافية.",
    deadline_unknown: "الفصل الدراسي المستهدف غير محدد بما يكفي للتحقق من الموعد.",
    studienkolleg_required: "هذا الخيار يتضمن شرط Studienkolleg معروفًا.",
    uni_assist_required: "التقديم يمر عبر uni-assist حسب البيانات الحالية.",
    budget_not_verified: "تكلفة المعيشة في المدينة لم يتم التحقق منها في هذا الحساب.",
    source_incomplete: "مصدر هذه المعلومة غير مكتمل.",
  },
  en: {
    degree_match: "The degree level matches your objective.",
    field_match: "The programme matches your field or specialisation.",
    language_satisfied: "Your stated language level meets a recorded requirement. The accepted certificate still needs checking.",
    teaching_language_match: "The teaching language matches your preference.",
    preferred_city: "The institution is in a city you selected.",
    source_verified: "The programme has a source with a verification date.",
    academic_access_supported: "Your academic access is supported by the currently verified rule.",
    academic_access_review: "Your academic access still needs confirmation.",
    master_subject_credits_satisfied: "Your declared ECTS meet a verified Master prerequisite.",
    master_subject_credits_missing: "We need your ECTS in a specific subject to check this Master prerequisite.",
    master_subject_credits_insufficient: "Your declared ECTS are below a verified minimum; the university must confirm exact course equivalence.",
    master_curriculum_unknown: "This Master's subject prerequisites are not yet structured enough for automatic comparison.",
    language_missing: "The exact language requirement is not structured enough in our catalogue.",
    language_insufficient: "Your current level is below the known requirement.",
    teaching_language_other: "The teaching language differs from your current preference.",
    other_city: "This option is outside your selected cities.",
    intake_match: "Your target intake is offered in the programme’s structured data.",
    intake_unavailable: "Your target intake is not offered in the programme’s structured data.",
    intake_unknown: "The programme intake or your target intake still needs clarification.",
    deadline_open: "The verified deadline for this intake is still open.",
    deadline_closed: "The verified deadline for this intake has passed.",
    deadline_to_verify: "A date is stored, but it cannot be linked to the target year with enough certainty.",
    deadline_unknown: "Your target intake is not precise enough to validate the deadline.",
    studienkolleg_required: "This option has a known Studienkolleg condition.",
    uni_assist_required: "The application uses uni-assist according to current data.",
    budget_not_verified: "The city's cost of living is not yet verified in this calculation.",
    source_incomplete: "The traceability of this information is incomplete.",
  },
  de: {
    degree_match: "Das Abschlussniveau passt zu deinem Ziel.",
    field_match: "Der Studiengang passt zu deinem Fach oder Schwerpunkt.",
    language_satisfied: "Dein angegebenes Sprachniveau erfüllt eine erfasste Anforderung. Das akzeptierte Sprachzertifikat muss noch geprüft werden.",
    teaching_language_match: "Die Unterrichtssprache passt zu deiner Präferenz.",
    preferred_city: "Die Hochschule liegt in einer von dir gewählten Stadt.",
    source_verified: "Der Studiengang hat eine Quelle mit Prüfdatum.",
    academic_access_supported: "Dein Hochschulzugang wird durch die aktuell geprüfte Regel gestützt.",
    academic_access_review: "Dein Hochschulzugang muss noch bestätigt werden.",
    master_subject_credits_satisfied: "Deine angegebenen ECTS erfüllen eine geprüfte Master-Voraussetzung.",
    master_subject_credits_missing: "Wir benötigen deine ECTS in einem bestimmten Fach, um diese Master-Voraussetzung zu prüfen.",
    master_subject_credits_insufficient: "Deine angegebenen ECTS liegen unter einem geprüften Minimum; die Hochschule muss die genaue Gleichwertigkeit der Module bestätigen.",
    master_curriculum_unknown: "Die fachlichen Voraussetzungen dieses Masters sind noch nicht ausreichend strukturiert für einen automatischen Vergleich.",
    language_missing: "Die genaue Sprachanforderung ist im Katalog noch nicht ausreichend strukturiert.",
    language_insufficient: "Dein aktuelles Niveau liegt unter der bekannten Anforderung.",
    teaching_language_other: "Die Unterrichtssprache weicht von deiner aktuellen Präferenz ab.",
    other_city: "Diese Option liegt außerhalb deiner gewählten Städte.",
    intake_match: "Dein gewünschter Studienstart ist in den strukturierten Programmdaten enthalten.",
    intake_unavailable: "Dein gewünschter Studienstart ist in den strukturierten Programmdaten nicht enthalten.",
    intake_unknown: "Der Studienstart des Programms oder dein Zielsemester muss noch geklärt werden.",
    deadline_open: "Die geprüfte Frist für diesen Studienstart ist noch offen.",
    deadline_closed: "Die geprüfte Frist für diesen Studienstart ist abgelaufen.",
    deadline_to_verify: "Ein Datum ist gespeichert, kann dem Zieljahr aber noch nicht sicher zugeordnet werden.",
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
  onRefineAnswers,
  onReviewReady,
  onPersonalizedReady,
  onResultReady,
  prospectCaptureEnabled = false,
  accountLinkingEnabled = false,
}: {
  answers: PublicOrientationAnswers;
  locale: Locale;
  onRefineAnswers?: (patch: Partial<PublicOrientationAnswers>) => void;
  onReviewReady?: (reviewId: string | null) => void;
  onPersonalizedReady?: (result: OrientationPublicPersonalizedResult | null) => void;
  onResultReady?: (ready: boolean) => void;
  prospectCaptureEnabled?: boolean;
  accountLinkingEnabled?: boolean;
}) {
  const t = copy[locale] as (typeof copy)["fr"];
  const isBachelorFirstContact = answers.targetDegree === "Bachelor";
  const bacWelcome = answers.bacStatus === "obtained"
    ? t.bacObtained
    : answers.bacStatus === "preparing"
      ? t.bacPreparing
      : answers.bacStatus === "no_bac"
        ? t.bacNoBac
        : null;
  const requestBody = useMemo(() => JSON.stringify({ answers, locale }), [answers, locale]);
  const lastRequestKey = useRef<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const [requestState, setRequestState] = useState<{
    key: string | null;
    result: EngineResponse | null;
    error: boolean;
    enhancing: boolean;
    degraded: boolean;
  }>({
    key: null,
    result: null,
    error: false,
    enhancing: false,
    degraded: false,
  });

  const isCurrentRequest = requestState.key === requestBody;
  const result = isCurrentRequest ? requestState.result : null;
  const state: "loading" | "ready" | "error" = !isCurrentRequest
    ? "loading"
    : requestState.error
      ? "error"
      : result ? "ready" : "loading";
  const personalized =
    result?.shortlist.source === "personalized_verified"
    && result.personalized
    && result.personalized.selected.length > 0
      ? result.personalized
      : null;
  const fallbackRecommendations =
    result?.shortlist.source === "deterministic_fallback"
      ? result.engine.recommendations
      : [];
  const geographicFallback =
    result ? geographicFallbackMessage(locale, result.geography) : null;

  useEffect(() => {
    const newProfile = lastRequestKey.current !== requestBody;
    lastRequestKey.current = requestBody;
    const previewController = new AbortController();
    const fullController = new AbortController();
    let alive = true;
    let fullReady = false;
    let previewFailed = false;
    let fullFailed = false;

    // On retry, keep the candidate's already available first letter visible.
    setRequestState((current) => ({
      key: requestBody,
      result: !newProfile && current.key === requestBody ? current.result : null,
      error: false,
      enhancing: true,
      degraded: false,
    }));
    if (newProfile) onResultReady?.(false);

    function publish(payload: EngineResponse, isFull: boolean) {
      if (!alive || (!isFull && fullReady)) return;
      if (isFull) fullReady = true;
      setRequestState({
        key: requestBody,
        result: payload,
        error: false,
        enhancing: !isFull && !fullFailed,
        degraded: !isFull && fullFailed,
      });

      const printablePersonalized =
        payload.shortlist.source === "personalized_verified"
        && payload.personalized
        && payload.personalized.selected.length > 0
          ? payload.personalized
          : null;
      onReviewReady?.(payload.personalized?.reviewId || null);
      onPersonalizedReady?.(printablePersonalized);
      onResultReady?.(true);
    }

    function failIfBothUnavailable() {
      if (!alive) return;
      setRequestState((current) => {
        if (current.key !== requestBody) return current;
        return {
          ...current,
          error: previewFailed && fullFailed && !current.result,
          enhancing: !fullFailed,
          degraded: fullFailed && Boolean(current.result),
        };
      });
      if (previewFailed && fullFailed) onResultReady?.(false);
    }

    async function requestEngine(url: string, signal: AbortSignal): Promise<EngineResponse> {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
        signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`orientation-engine-${response.status}`);
      return response.json() as Promise<EngineResponse>;
    }

    // First-contact letter does not wait for any LLM, discovery or database call.
    void requestEngine("/api/orientation/engine/preview", previewController.signal)
      .then((payload) => publish(payload, false))
      .catch(() => {
        previewFailed = true;
        failIfBothUnavailable();
      });

    // Enrichment is independent, bounded client-side and replaceable on retry.
    const deadline = window.setTimeout(() => fullController.abort(), 35_000);
    void requestEngine("/api/orientation/engine", fullController.signal)
      .then((payload) => publish(payload, true))
      .catch(() => {
        fullFailed = true;
        failIfBothUnavailable();
      })
      .finally(() => window.clearTimeout(deadline));

    return () => {
      alive = false;
      window.clearTimeout(deadline);
      previewController.abort();
      fullController.abort();
    };
  }, [requestBody, retryVersion, onReviewReady, onPersonalizedReady, onResultReady]);

  return (
    <section
      className={`orientation-print-hide ${isBachelorFirstContact ? "mt-2" : "mt-8"}`}
      aria-labelledby={isBachelorFirstContact ? undefined : "orientation-v4-title"}
      aria-label={isBachelorFirstContact ? t.title : undefined}
    >
      <div className={isBachelorFirstContact
        ? ""
        : "rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
      }>
        {!isBachelorFirstContact ? (
          <>
            <p className="eyebrow">{t.eyebrow}</p>
            <h3 id="orientation-v4-title" className="mt-2 text-xl font-bold">{t.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.lead}</p>
          </>
        ) : null}
        {answers.targetIntakeSeason && answers.targetIntakeYear ? (
          <p className={`${isBachelorFirstContact ? "mb-4" : "mt-2"} text-xs font-semibold text-[var(--muted)]`}>
            {`${t.intake}: ${answers.targetIntakeSeason === "winter" ? t.winter : t.summer} ${answers.targetIntakeYear}`}
          </p>
        ) : null}

        {state === "loading" ? (
          <section
            className="orientation-loading-experience mt-6"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label={t.loading}
          >
            <div className="orientation-loading-header">
              <div className="orientation-loading-mark" aria-hidden="true">
                <span className="orientation-loading-mark-core">CA</span>
                <span className="orientation-loading-orbit orientation-loading-orbit-one" />
                <span className="orientation-loading-orbit orientation-loading-orbit-two" />
              </div>
              <div>
                <p className="eyebrow">Campus Allemagne</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">{t.loadingTitle}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {t.loadingLead}
                </p>
              </div>
            </div>

            <div className="orientation-loading-progress" aria-hidden="true">
              <span />
            </div>

            <ol className="orientation-loading-steps" aria-label={t.loading}>
              {t.loadingSteps.map((step, index) => (
                <li key={step}>
                  <span className="orientation-loading-step-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="orientation-loading-preview" aria-hidden="true">
              <div className="orientation-loading-preview-hero">
                <span className="orientation-loading-skeleton orientation-loading-skeleton-kicker" />
                <span className="orientation-loading-skeleton orientation-loading-skeleton-title" />
                <span className="orientation-loading-skeleton orientation-loading-skeleton-line" />
                <span className="orientation-loading-skeleton orientation-loading-skeleton-line orientation-loading-skeleton-line-short" />
              </div>
              <div className="orientation-loading-preview-grid">
                <span className="orientation-loading-skeleton orientation-loading-skeleton-card" />
                <span className="orientation-loading-skeleton orientation-loading-skeleton-card" />
                <span className="orientation-loading-skeleton orientation-loading-skeleton-card" />
              </div>
            </div>

            <p className="orientation-loading-note">{t.loadingNote}</p>
          </section>
        ) : null}

        {state === "error" ? (
          <p className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm leading-6">
            {t.unavailable}
          </p>
        ) : null}

        {state === "ready" && result ? (
          <>
            {requestState.enhancing ? (
              <p role="status" className="mb-5 rounded-[var(--radius-control)] border border-[var(--info-border)] bg-[var(--info-soft)] px-4 py-3 text-sm leading-6">
                {t.enriching}
              </p>
            ) : null}
            {requestState.degraded ? (
              <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--warning-border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6">
                <span>{t.degraded}</span>
                <button type="button" onClick={() => setRetryVersion((value) => value + 1)}
                  className="min-h-11 font-semibold text-[var(--brand-strong)] underline underline-offset-4">
                  {t.retry}
                </button>
              </div>
            ) : null}
            {isBachelorFirstContact && bacWelcome && personalized ? (
              <p className="mb-5 rounded-[var(--radius-control)] border border-[var(--premium-border)] bg-[var(--premium-cream-soft)] px-5 py-4 text-base font-medium leading-7 text-[var(--foreground)]">
                {bacWelcome}
              </p>
            ) : null}
            {geographicFallback ? (
              <div className="mb-5 rounded-[var(--radius-control)] border border-[var(--warning-border)] bg-[var(--premium-gold-wash)] px-4 py-3.5">
                <p className="text-sm leading-6 text-[var(--foreground)]">
                  {geographicFallback}
                </p>
              </div>
            ) : null}
            {personalized ? (
              <OrientationPersonalizedWriterCard
                result={personalized}
                locale={locale}
                answers={answers}
                showCta={prospectCaptureEnabled && isBachelorFirstContact}
                continueAccount={accountLinkingEnabled && prospectCaptureEnabled && isBachelorFirstContact}
              />
            ) : (
              <OrientationLetterCard
                letter={result.letter}
                scout={result.scout}
                recommendations={fallbackRecommendations}
                answers={answers}
                locale={locale}
                welcome={isBachelorFirstContact ? bacWelcome : null}
              />
            )}
            {!isBachelorFirstContact && onRefineAnswers && result.engine.refinement.nextQuestion ? (
              <OrientationRefinementQuestionCard
                question={result.engine.refinement.nextQuestion}
                answers={answers}
                locale={locale}
                onRefine={onRefineAnswers}
              />
            ) : null}

            {!isBachelorFirstContact && !personalized && result.shortlist.source === "deterministic_fallback" ? (
            <details className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <summary className="cursor-pointer text-sm font-bold">{t.details}</summary>
              <div className="mt-4 grid gap-4">
              {result.engine.recommendations.map((recommendation) => {
                const sources = recommendation.sources.slice(0, 3);
                const deadlineRule = recommendation.rules.find((rule) =>
                  ["deadline_open", "deadline_to_verify", "deadline_unknown"].includes(rule.code)
                ) || null;
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
                        <p className="mt-1 text-sm text-[var(--foreground)]">
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

                    {deadlineRule ? (
                      <p className="mt-4 text-sm leading-6">
                        <strong>{t.deadline}:</strong>{" "}
                        {typeof deadlineRule.value === "string" && deadlineRule.value
                          ? formatDate(deadlineRule.value, locale)
                          : t.deadlineUnknown}
                      </p>
                    ) : null}

                    {sources.length ? (
                      <div className="mt-4 text-xs leading-5 text-[var(--foreground)]">
                        <span className="font-bold">{t.sources}: </span>
                        {sources.map((source, index) => (
                          <span key={source.kind + source.url}>
                            {index > 0 ? " · " : ""}
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-2"
                            >
                              {source.label}
                            </a>
                            {formatDate(source.verifiedAt, locale)
                              ? ` (${formatDate(source.verifiedAt, locale)})`
                              : ""}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-sm font-bold">{t.actions}</p>
              <ol className="mt-2 list-decimal space-y-2 ps-6 text-sm leading-6 marker:font-semibold">
                {result.advisor.priorityActionCodes.map((code) => (
                  <li key={code} className="ps-1">{actionLabels[locale][code] || code}</li>
                ))}
              </ol>
            </div>
            </details>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
