import type { Locale } from "@/lib/i18n";
import type { SmartOrientationPriorityState } from "@/lib/phase2/smart-orientation";

type SmartOrientationStateCopy = {
  label: string;
  title: string;
  body: string;
  cta: string;
};

export type SmartOrientationCopy = {
  eyebrow: string;
  states: Record<SmartOrientationPriorityState, SmartOrientationStateCopy>;
  languagePreparation: string;
  humanReview: string;
  disclaimer: string;
};

const fr: SmartOrientationCopy = {
  eyebrow: "Votre prochaine étape",
  states: {
    priority_ready: {
      label: "Projet prêt à approfondir",
      title: "Votre projet mérite une étude plus précise",
      body: "Votre Bac, votre moyenne et votre objectif d’études nous donnent suffisamment d’éléments pour aller plus loin. Campus Allemagne peut examiner votre situation de manière plus détaillée et vous aider à organiser les prochaines étapes.",
      cta: "Faire examiner mon projet par Campus Allemagne",
    },
    priority_prepare_now: {
      label: "À préparer dès maintenant",
      title: "Vous pouvez commencer votre préparation dès maintenant",
      body: "Vous préparez actuellement votre Bac et votre projet est déjà assez clair pour commencer à structurer les prochaines étapes. Vous pourrez mettre à jour votre moyenne et votre résultat officiel dès qu’ils seront disponibles.",
      cta: "Commencer à préparer mon projet avec Campus Allemagne",
    },
    priority_standard: {
      label: "Projet à développer",
      title: "Votre projet peut déjà être préparé",
      body: "Votre projet peut continuer à avancer avec les informations disponibles. Sauvegardez votre orientation, complétez-la au fil du temps et utilisez les prochaines étapes pour mieux préparer votre dossier.",
      cta: "Sauvegarder mon orientation",
    },
    priority_follow_up: {
      label: "Projet à compléter",
      title: "Gardez votre projet en mouvement",
      body: "Il manque encore quelques informations pour personnaliser davantage votre préparation, mais vous pouvez déjà conserver cette orientation et revenir la compléter plus tard.",
      cta: "Sauvegarder et compléter mon projet",
    },
  },
  languagePreparation: "La langue reste une étape de préparation : votre niveau actuel peut continuer à évoluer en Tunisie ou pendant la préparation de votre projet.",
  humanReview: "Votre domaine demande une vérification individualisée. Notre équipe doit confirmer les conditions académiques et les exigences officielles avant de conclure sur les possibilités réelles.",
  disclaimer: "Cette priorité organise l’accompagnement Campus Allemagne. Elle ne constitue ni une admission universitaire, ni une garantie de visa.",
};

const ar: SmartOrientationCopy = {
  eyebrow: "خطوتك التالية",
  states: {
    priority_ready: {
      label: "مشروع جاهز لدراسة أعمق",
      title: "مشروعك يستحق دراسة أكثر دقة",
      body: "البكالوريا والمعدل وهدفك الدراسي تعطينا معلومات كافية للانتقال إلى دراسة أكثر تفصيلًا. يمكن لفريق Campus Allemagne مراجعة وضعك ومساعدتك على تنظيم الخطوات القادمة.",
      cta: "طلب مراجعة مشروعي من Campus Allemagne",
    },
    priority_prepare_now: {
      label: "ابدأ التحضير الآن",
      title: "يمكنك البدء في التحضير من الآن",
      body: "أنت تحضّر حاليًا للبكالوريا ومشروعك واضح بما يكفي لبدء تنظيم الخطوات القادمة. يمكنك تحديث المعدل والنتيجة الرسمية لاحقًا عندما تصبح متاحة.",
      cta: "بدء تحضير مشروعي مع Campus Allemagne",
    },
    priority_standard: {
      label: "مشروع قابل للتطوير",
      title: "يمكنك البدء في تحضير مشروعك",
      body: "يمكن لمشروعك أن يتقدم بالمعلومات المتوفرة حاليًا. احفظ توجيهك وحدّثه مع تطور وضعك واستعمل الخطوات المقترحة لتحضير ملفك بشكل أفضل.",
      cta: "حفظ توجيهي",
    },
    priority_follow_up: {
      label: "مشروع يحتاج إلى استكمال",
      title: "واصل تطوير مشروعك",
      body: "ما زالت بعض المعلومات ناقصة لتخصيص التحضير بشكل أدق، لكن يمكنك حفظ هذا التوجيه والعودة لاحقًا لإكماله.",
      cta: "حفظ مشروعي واستكماله",
    },
  },
  languagePreparation: "اللغة تبقى مرحلة من مراحل التحضير: يمكنك تطوير مستواك الحالي في تونس أو أثناء تحضير مشروعك.",
  humanReview: "مجالك يحتاج إلى مراجعة فردية. يجب على فريقنا التحقق من الشروط الأكاديمية والمتطلبات الرسمية قبل تقديم أي استنتاج حول الإمكانيات الفعلية.",
  disclaimer: "هذه الأولوية تنظّم مرافقة Campus Allemagne فقط، ولا تمثل قبولًا جامعيًا أو ضمانًا للحصول على التأشيرة.",
};

const en: SmartOrientationCopy = {
  eyebrow: "Your next step",
  states: {
    priority_ready: {
      label: "Ready for a closer review",
      title: "Your project deserves a more detailed review",
      body: "Your Baccalaureate, average and study objective give us enough information to go further. Campus Allemagne can review your situation in more detail and help organise the next steps.",
      cta: "Ask Campus Allemagne to review my project",
    },
    priority_prepare_now: {
      label: "Start preparing now",
      title: "You can start preparing your project now",
      body: "You are currently preparing your Baccalaureate and your project is already clear enough to organise the next steps. You can update your average and final result when they become available.",
      cta: "Start preparing my project with Campus Allemagne",
    },
    priority_standard: {
      label: "Project to develop",
      title: "Your project can already be prepared",
      body: "Your project can keep progressing with the information available today. Save your orientation, update it over time and use the next steps to prepare your file.",
      cta: "Save my orientation",
    },
    priority_follow_up: {
      label: "Project to complete",
      title: "Keep your project moving",
      body: "A few details are still missing for a more personalised preparation, but you can already save this orientation and return later to complete it.",
      cta: "Save and complete my project",
    },
  },
  languagePreparation: "Language remains a preparation step: your current level can continue to improve in Tunisia or while you prepare your project.",
  humanReview: "Your field requires an individual review. Our team must verify the academic conditions and official requirements before drawing conclusions about the real possibilities.",
  disclaimer: "This priority only organises Campus Allemagne support. It is neither a university admission decision nor a visa guarantee.",
};

const de: SmartOrientationCopy = {
  eyebrow: "Dein nächster Schritt",
  states: {
    priority_ready: {
      label: "Bereit für eine genauere Prüfung",
      title: "Dein Projekt verdient eine genauere Prüfung",
      body: "Dein Baccalauréat, dein Durchschnitt und dein Studienziel geben uns genügend Informationen, um weiterzugehen. Campus Allemagne kann deine Situation genauer prüfen und die nächsten Schritte mit dir strukturieren.",
      cta: "Mein Projekt von Campus Allemagne prüfen lassen",
    },
    priority_prepare_now: {
      label: "Jetzt mit der Vorbereitung beginnen",
      title: "Du kannst dein Projekt schon jetzt vorbereiten",
      body: "Du bereitest derzeit dein Baccalauréat vor und dein Projekt ist bereits klar genug, um die nächsten Schritte zu strukturieren. Deinen Durchschnitt und das endgültige Ergebnis kannst du später aktualisieren.",
      cta: "Mein Projekt mit Campus Allemagne vorbereiten",
    },
    priority_standard: {
      label: "Projekt weiterentwickeln",
      title: "Dein Projekt kann bereits vorbereitet werden",
      body: "Mit den vorhandenen Informationen kann dein Projekt weiter vorankommen. Speichere deine Orientierung, aktualisiere sie später und nutze die nächsten Schritte für deine Vorbereitung.",
      cta: "Meine Orientierung speichern",
    },
    priority_follow_up: {
      label: "Projekt vervollständigen",
      title: "Halte dein Projekt in Bewegung",
      body: "Für eine genauere Vorbereitung fehlen noch einige Angaben. Du kannst diese Orientierung aber bereits speichern und später vervollständigen.",
      cta: "Mein Projekt speichern und ergänzen",
    },
  },
  languagePreparation: "Die Sprache bleibt ein Vorbereitungsschritt: Dein aktuelles Niveau kann sich in Tunesien oder während der Projektvorbereitung weiterentwickeln.",
  humanReview: "Dein Fachgebiet erfordert eine individuelle Prüfung. Unser Team muss die akademischen Bedingungen und offiziellen Anforderungen prüfen, bevor reale Möglichkeiten beurteilt werden können.",
  disclaimer: "Diese Priorität organisiert nur die Begleitung durch Campus Allemagne. Sie ist weder eine Hochschulzulassung noch eine Visumgarantie.",
};

export const smartOrientationCopy: Record<Locale, SmartOrientationCopy> = {
  fr,
  ar,
  en,
  de,
};
