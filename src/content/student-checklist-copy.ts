import type { Locale } from "@/lib/i18n";

type ChecklistCopy = {
  statusLabels: Record<string, string>;
  page: {
    eyebrow: string;
    title: string;
    description: string;
    documents: string;
    planEyebrow: string;
    planTitle: string;
    planDescription: string;
    progressEyebrow: string;
    progressTitle: string;
    completedBadge: (done: number, total: number) => string;
    noStep: string;
    recordedSteps: string;
    progressLabel: string;
    progressBoundary: string;
    doNow: string;
    tracking: string;
    noAction: string;
    ownerStudent: string;
    ownerAlmaGo: string;
    file: string;
    nothingNow: string;
    nothingRequested: string;
    waitingText: string;
    noActionText: string;
    summaryAria: string;
    todo: string;
    todoBadge: string;
    nothingBadge: string;
    tracked: string;
    inProgress: string;
    completed: string;
    completedSteps: string;
    emptyTitle: string;
    emptyText: string;
    back: string;
    categoryEyebrow: string;
    groupDone: (done: number, total: number) => string;
    responsibleStudent: string;
    responsibleAlmaGo: string;
    completedOn: string;
    unavailableTitle: string;
    unavailableText: string;
    retry: string;
    intlLocale: string;
  };
  recorded: {
    otherCategory: string;
    categories: Record<string, string>;
    items: Record<string, { title: string; description: string }>;
  };
  personalized: {
    owner: string;
    you: string;
    almago: string;
    items: Record<string, { title: string; explanation: string }>;
  };
};

export const studentChecklistCopy: Record<Locale, ChecklistCopy> = {
  fr: {
    statusLabels: {
      not_started: "À faire par vous",
      todo: "À faire par vous",
      in_progress: "En cours",
      waiting_student: "À faire par vous",
      waiting_almago: "Suivi par AlmaGo",
      completed: "Terminé",
    },
    page: {
      eyebrow: "Mon dossier",
      title: "Mes démarches",
      description: "Voyez ce que vous devez faire, ce qui est suivi et ce qui est terminé.",
      documents: "Voir mes documents",
      planEyebrow: "Selon votre dossier",
      planTitle: "Étapes selon votre dossier",
      planDescription: "Elles utilisent votre projet, vos documents vérifiés et le cours choisi. Elles ne garantissent ni admission, ni date limite, ni visa.",
      progressEyebrow: "Votre progression",
      progressTitle: "Démarches enregistrées dans votre dossier",
      completedBadge: (done, total) => `${done}/${total} terminées`,
      noStep: "Aucune étape",
      recordedSteps: "Étapes réellement enregistrées dans AlmaGo",
      progressLabel: "Progression des démarches enregistrées",
      progressBoundary: "Cette progression concerne les démarches enregistrées dans votre dossier. Elle ne représente ni une admission ni une validation finale.",
      doNow: "À faire maintenant",
      tracking: "Suivi en cours",
      noAction: "Aucune action demandée",
      ownerStudent: "À faire par vous",
      ownerAlmaGo: "Suivi par AlmaGo",
      file: "Dossier",
      nothingNow: "Vous n’avez rien à faire pour le moment",
      nothingRequested: "Aucune action n’est demandée actuellement",
      waitingText: "AlmaGo suit actuellement certaines étapes de votre dossier. Vous pouvez consulter leur détail ci-dessous.",
      noActionText: "Les démarches enregistrées dans votre dossier apparaissent ci-dessous. Une nouvelle action sera mise en évidence lorsqu’elle vous concernera.",
      summaryAria: "Résumé des démarches",
      todo: "À faire par vous",
      todoBadge: "À traiter",
      nothingBadge: "Rien à faire",
      tracked: "Suivi par AlmaGo",
      inProgress: "En cours",
      completed: "Terminées",
      completedSteps: "Étapes complétées",
      emptyTitle: "Aucune démarche n’est enregistrée pour le moment.",
      emptyText: "Lorsqu’une nouvelle étape sera ajoutée à votre dossier, elle apparaîtra ici avec son responsable et son statut.",
      back: "Retour à mon dossier",
      categoryEyebrow: "Étape du dossier",
      groupDone: (done, total) => `${done}/${total} terminées`,
      responsibleStudent: "Responsable : vous",
      responsibleAlmaGo: "Responsable : AlmaGo",
      completedOn: "Terminé le",
      unavailableTitle: "Démarches temporairement indisponibles",
      unavailableText: "Nous n’arrivons pas à afficher vos démarches pour le moment. Rien n’a été supprimé ou modifié. Vous pouvez réessayer ou revenir à votre dossier.",
      retry: "Réessayer",
      intlLocale: "fr-FR",
    },
    recorded: {
      otherCategory: "Autre",
      categories: {
        Profil: "Profil",
        Documents: "Documents",
        Traduction: "Traductions",
        Orientation: "Programmes",
        Candidatures: "Candidatures",
        Admission: "Admission",
        "Préparation Allemagne": "Préparation du départ",
      },
      items: {
        profile_complete: { title: "Vérifier mon profil", description: "Complétez les informations obligatoires." },
        passport: { title: "Ajouter mon passeport", description: "Ajoutez un passeport lisible. Son statut apparaîtra ici." },
        translation: { title: "Préparer les traductions demandées", description: "Préparez uniquement les traductions demandées après avoir vérifié les consignes applicables." },
        orientation: { title: "Comparer mes programmes", description: "Comparez les programmes proposés, leurs critères et leurs échéances avant de choisir." },
        applications: { title: "Préparer mes candidatures", description: "Revoyez les exigences de chaque programme et préparez chaque candidature étape par étape." },
        admission: { title: "Suivre les réponses des universités", description: "Consultez l’état de vos candidatures et les décisions reçues des universités." },
        germany_preparation: { title: "Préparer mon départ après admission", description: "Après votre admission, vérifiez les étapes utiles avant votre départ pour l’Allemagne." },
      },
    },
    personalized: {
      owner: "Responsable",
      you: "vous",
      almago: "AlmaGo",
      items: {
        define_project: { title: "Définir mon projet", explanation: "Indiquez votre objectif pour voir les étapes utiles." },
        project_defined: { title: "Projet Allemagne défini", explanation: "Votre objectif actuel est enregistré dans AlmaGo." },
        replace_academic_evidence: { title: "Remplacer le document demandé", explanation: "Ce document doit être remplacé avant d’être utilisé pour votre parcours." },
        academic_evidence_review: { title: "Vérification de la preuve académique", explanation: "Une preuve est enregistrée mais doit encore être vérifiée avant de servir de base au parcours." },
        definitive_admission_basis: { title: "Admission définitive vérifiée", explanation: "Votre admission est enregistrée dans le dossier. Cette étape ne constitue pas une décision de visa." },
        preparatory_academic_basis: { title: "Base académique préparatoire acceptée", explanation: "Une admission conditionnelle, Bewerberbestätigung ou autre preuve préparatoire admissible a été acceptée dans le dossier." },
        study_preparation_course_selected: { title: "Cours de préparation aux études sélectionné", explanation: "Votre projet contient un cours de préparation aux études encore publié comme fiche vérifiée." },
        select_study_preparation_course: { title: "Choisir un cours de préparation aux études vérifié", explanation: "La base académique préparatoire est acceptée, mais aucun cours préparatoire vérifié n’est actuellement sélectionné dans votre projet." },
        standalone_language_course_selected: { title: "Cours de langue autonome sélectionné", explanation: "Un cours de langue autonome encore publié comme fiche vérifiée est associé à votre projet." },
        select_standalone_language_course: { title: "Choisir un cours de langue autonome vérifié", explanation: "Votre projet est linguistique, mais aucun cours autonome vérifié n’est actuellement sélectionné." },
        continue_academic_search: { title: "Continuer à chercher un programme", explanation: "Vous n’avez pas encore d’admission vérifiée. Comparez les programmes et préparez vos candidatures." },
      },
    },
  },
  ar: {
    statusLabels: {
      not_started: "مطلوب منك",
      todo: "مطلوب منك",
      in_progress: "قيد التنفيذ",
      waiting_student: "مطلوب منك",
      waiting_almago: "يتابعه AlmaGo",
      completed: "مكتمل",
    },
    page: {
      eyebrow: "ملفي",
      title: "خطواتي",
      description: "اعرف ما عليك فعله الآن، وما نتابعه معك، وما اكتمل.",
      documents: "استعرض مستنداتك",
      planEyebrow: "حسب ملفك",
      planTitle: "الخطوات المناسبة لملفك",
      planDescription: "تعتمد هذه الخطوات على مشروعك ومستنداتك التي تم التحقق منها والدورة التي اخترتها. ولا تعني قبولًا أو موعدًا رسميًا أو تأشيرة.",
      progressEyebrow: "تقدمك",
      progressTitle: "الخطوات المسجلة في ملفك",
      completedBadge: (done, total) => `${done}/${total} مكتملة`,
      noStep: "لا توجد خطوات",
      recordedSteps: "الخطوات المسجلة في AlmaGo",
      progressLabel: "تقدم الخطوات المسجلة",
      progressBoundary: "يعرض هذا التقدم الخطوات المسجلة في ملفك فقط. ولا يعني قبولًا جامعيًا أو قرارًا رسميًا.",
      doNow: "ابدأ الآن",
      tracking: "قيد المتابعة",
      noAction: "لا يوجد إجراء مطلوب",
      ownerStudent: "مطلوب منك",
      ownerAlmaGo: "يتابعه AlmaGo",
      file: "الملف",
      nothingNow: "لا يوجد شيء مطلوب منك الآن",
      nothingRequested: "لا يوجد إجراء مطلوب حاليًا",
      waitingText: "بعض خطوات ملفك قيد المتابعة حاليًا. يمكنك مراجعة تفاصيلها أدناه.",
      noActionText: "تظهر الخطوات المسجلة في ملفك أدناه. عندما يظهر إجراء يخصك سيتم تمييزه بوضوح.",
      summaryAria: "ملخص الخطوات",
      todo: "مطلوب منك",
      todoBadge: "إجراء مطلوب",
      nothingBadge: "لا شيء مطلوب",
      tracked: "يتابعه AlmaGo",
      inProgress: "قيد المتابعة",
      completed: "مكتملة",
      completedSteps: "خطوات مكتملة",
      emptyTitle: "لا توجد خطوة مسجلة حاليًا.",
      emptyText: "عندما تتم إضافة خطوة جديدة إلى ملفك ستظهر هنا مع المسؤول عنها وحالتها.",
      back: "العودة إلى ملفي",
      categoryEyebrow: "مرحلة من الملف",
      groupDone: (done, total) => `${done}/${total} مكتملة`,
      responsibleStudent: "المسؤول: أنت",
      responsibleAlmaGo: "المسؤول: AlmaGo",
      completedOn: "اكتملت في",
      unavailableTitle: "الخطوات غير متاحة مؤقتًا",
      unavailableText: "تعذر عرض خطواتك الآن. لم يتم حذف أو تعديل أي شيء. يمكنك إعادة المحاولة أو العودة إلى ملفك.",
      retry: "إعادة المحاولة",
      intlLocale: "ar-TN",
    },
    recorded: {
      otherCategory: "خطوات أخرى",
      categories: {
        Profil: "الملف الشخصي",
        Documents: "المستندات",
        Traduction: "الترجمات",
        Orientation: "اختيار البرامج",
        Candidatures: "طلبات التقديم",
        Admission: "القبول الجامعي",
        "Préparation Allemagne": "الاستعداد لألمانيا",
      },
      items: {
        profile_complete: { title: "أكمل معلوماتك", description: "راجع معلوماتك الأساسية وأكمل البيانات المطلوبة في ملفك." },
        passport: { title: "أضف جواز سفرك", description: "ارفع نسخة واضحة من جواز السفر وتابع حالة المراجعة هنا." },
        translation: { title: "جهّز الترجمات المطلوبة", description: "ترجم المستندات المطلوبة فقط بعد التحقق من تعليمات الجهة التي ستقدّم إليها." },
        orientation: { title: "قارن البرامج المناسبة لك", description: "راجع البرامج المقترحة وشروطها ومواعيدها قبل أن تختار." },
        applications: { title: "حضّر طلبات التقديم", description: "راجع متطلبات كل برنامج وجهّز طلب التقديم خطوة بخطوة." },
        admission: { title: "تابع ردود الجامعات", description: "راجع حالة طلباتك والقرارات التي تصلك من الجامعات." },
        germany_preparation: { title: "استعد للسفر بعد القبول", description: "بعد حصولك على القبول، راجع الخطوات التي تحتاجها قبل السفر إلى ألمانيا." },
      },
    },
    personalized: {
      owner: "المسؤول",
      you: "أنت",
      almago: "AlmaGo",
      items: {
        define_project: { title: "حدّد هدفك", explanation: "حدّد ما تريد فعله في ألمانيا لتظهر لك الخطوات المناسبة." },
        project_defined: { title: "تم تحديد مشروعك في ألمانيا", explanation: "هدفك الحالي مسجل في AlmaGo." },
        replace_academic_evidence: { title: "استبدل المستند المطلوب", explanation: "يجب استبدال هذا المستند قبل استخدامه كأساس لمسارك." },
        academic_evidence_review: { title: "مراجعة الإثبات الأكاديمي", explanation: "تم تسجيل إثبات أكاديمي لكنه يحتاج إلى مراجعة قبل استخدامه كأساس للمسار." },
        definitive_admission_basis: { title: "تم التحقق من القبول النهائي", explanation: "القبول مسجل في ملفك. هذه الخطوة لا تعني قرار تأشيرة." },
        preparatory_academic_basis: { title: "تم اعتماد الأساس الأكاديمي التحضيري", explanation: "تم اعتماد قبول مشروط أو إثبات من الجامعة (Bewerberbestätigung) أو إثبات تحضيري مناسب آخر في ملفك." },
        study_preparation_course_selected: { title: "تم اختيار دورة تحضير للدراسة", explanation: "مشروعك يحتوي على دورة تحضير للدراسة ما زالت منشورة كخيار تم التحقق منه." },
        select_study_preparation_course: { title: "اختر دورة تحضير للدراسة تم التحقق منها", explanation: "الأساس الأكاديمي التحضيري مقبول، لكن لا توجد حاليًا دورة تحضيرية تم التحقق منها مرتبطة بمشروعك." },
        standalone_language_course_selected: { title: "تم اختيار دورة لغة مستقلة", explanation: "هناك دورة لغة مستقلة ما زالت منشورة كخيار تم التحقق منه ومرتبطة بمشروعك." },
        select_standalone_language_course: { title: "اختر دورة لغة مستقلة تم التحقق منها", explanation: "هدفك الحالي لغوي، لكن لا توجد حاليًا دورة مستقلة تم التحقق منها مرتبطة به." },
        continue_academic_search: { title: "واصل البحث عن برنامج مناسب", explanation: "لا يوجد قبول موثّق في ملفك حتى الآن. قارن البرامج وجهّز طلبات التقديم." },
      },
    },
  },
  en: {
    statusLabels: {
      not_started: "For you to do",
      todo: "For you to do",
      in_progress: "In progress",
      waiting_student: "For you to do",
      waiting_almago: "Tracked by AlmaGo",
      completed: "Done",
    },
    page: {
      eyebrow: "My file",
      title: "My steps",
      description: "See what you need to do, what is being tracked and what is complete.",
      documents: "View my documents",
      planEyebrow: "Based on your file",
      planTitle: "Steps for your situation",
      planDescription: "These steps use your study plan, checked documents and selected course. They do not guarantee admission, a deadline or a visa.",
      progressEyebrow: "Your progress",
      progressTitle: "Steps recorded in your file",
      completedBadge: (done, total) => `${done}/${total} completed`,
      noStep: "No steps",
      recordedSteps: "Steps actually recorded in AlmaGo",
      progressLabel: "Progress of recorded steps",
      progressBoundary: "This progress only reflects steps recorded in your file. It is not an admission or final decision.",
      doNow: "Do this now",
      tracking: "In progress",
      noAction: "No action required",
      ownerStudent: "For you to do",
      ownerAlmaGo: "Tracked by AlmaGo",
      file: "File",
      nothingNow: "You have nothing to do right now",
      nothingRequested: "No action is required right now",
      waitingText: "AlmaGo is currently tracking some steps in your file. You can see the details below.",
      noActionText: "The steps recorded in your file are shown below. A new action will be highlighted when it applies to you.",
      summaryAria: "Steps summary",
      todo: "For you to do",
      todoBadge: "To handle",
      nothingBadge: "Nothing to do",
      tracked: "Tracked by AlmaGo",
      inProgress: "In progress",
      completed: "Completed",
      completedSteps: "Steps completed",
      emptyTitle: "No steps are recorded right now.",
      emptyText: "When a new step is added to your file, it will appear here with its owner and status.",
      back: "Back to my file",
      categoryEyebrow: "File stage",
      groupDone: (done, total) => `${done}/${total} completed`,
      responsibleStudent: "Owner: you",
      responsibleAlmaGo: "Owner: AlmaGo",
      completedOn: "Completed on",
      unavailableTitle: "Steps temporarily unavailable",
      unavailableText: "We cannot display your steps right now. Nothing has been deleted or changed. Try again or return to your file.",
      retry: "Try again",
      intlLocale: "en-GB",
    },
    recorded: {
      otherCategory: "Other steps",
      categories: {
        Profil: "Profile",
        Documents: "Documents",
        Traduction: "Translations",
        Orientation: "Programmes",
        Candidatures: "Applications",
        Admission: "Admission",
        "Préparation Allemagne": "Preparing for Germany",
      },
      items: {
        profile_complete: { title: "Complete my profile", description: "Review your basic information and complete the required fields." },
        passport: { title: "Add my passport", description: "Upload a clear passport copy and follow its review status here." },
        translation: { title: "Prepare required translations", description: "Translate only the documents requested after checking the applicable instructions." },
        orientation: { title: "Compare suitable programmes", description: "Review suggested programmes, requirements and deadlines before choosing." },
        applications: { title: "Prepare my applications", description: "Review each programme’s requirements and prepare the application step by step." },
        admission: { title: "Track university responses", description: "Check your application status and decisions received from universities." },
        germany_preparation: { title: "Prepare to travel after admission", description: "After admission, review the steps you need before travelling to Germany." },
      },
    },
    personalized: {
      owner: "Owner",
      you: "you",
      almago: "AlmaGo",
      items: {
        define_project: { title: "Define my study plan", explanation: "Add your goal to see the steps that apply to you." },
        project_defined: { title: "Germany study plan defined", explanation: "Your current goal is recorded in AlmaGo." },
        replace_academic_evidence: { title: "Replace the requested document", explanation: "This document must be replaced before it can support your pathway." },
        academic_evidence_review: { title: "Academic evidence review", explanation: "Academic evidence is recorded but still needs review before it can support the pathway." },
        definitive_admission_basis: { title: "Definitive admission checked", explanation: "Your admission is recorded in the file. This step is not a visa decision." },
        preparatory_academic_basis: { title: "Preparatory academic basis accepted", explanation: "A conditional admission, Bewerberbestätigung or other acceptable preparatory evidence has been accepted in your file." },
        study_preparation_course_selected: { title: "Study-preparation course selected", explanation: "Your study plan includes a study-preparation course that is still published as a checked option." },
        select_study_preparation_course: { title: "Choose a checked study-preparation course", explanation: "The preparatory academic basis is accepted, but no checked preparatory course is currently selected in your study plan." },
        standalone_language_course_selected: { title: "Standalone language course selected", explanation: "A standalone language course that is still published as a checked option is linked to your study plan." },
        select_standalone_language_course: { title: "Choose a checked standalone language course", explanation: "Your goal is language study, but no checked standalone course is currently selected." },
        continue_academic_search: { title: "Keep looking for a programme", explanation: "You do not yet have a checked admission. Compare programmes and prepare your applications." },
      },
    },
  },
  de: {
    statusLabels: {
      not_started: "Von dir zu erledigen",
      todo: "Von dir zu erledigen",
      in_progress: "In Arbeit",
      waiting_student: "Von dir zu erledigen",
      waiting_almago: "Von AlmaGo verfolgt",
      completed: "Erledigt",
    },
    page: {
      eyebrow: "Meine Akte",
      title: "Meine Schritte",
      description: "Sieh, was du erledigen musst, was verfolgt wird und was abgeschlossen ist.",
      documents: "Meine Unterlagen ansehen",
      planEyebrow: "Auf Basis deiner Akte",
      planTitle: "Schritte für deine Situation",
      planDescription: "Diese Schritte berücksichtigen deinen Studienplan, geprüfte Unterlagen und den gewählten Kurs. Sie garantieren weder Zulassung noch Frist oder Visum.",
      progressEyebrow: "Dein Fortschritt",
      progressTitle: "In deiner Akte gespeicherte Schritte",
      completedBadge: (done, total) => `${done}/${total} erledigt`,
      noStep: "Keine Schritte",
      recordedSteps: "Tatsächlich in AlmaGo gespeicherte Schritte",
      progressLabel: "Fortschritt der gespeicherten Schritte",
      progressBoundary: "Dieser Fortschritt betrifft nur die in deiner Akte gespeicherten Schritte. Er ist weder eine Zulassung noch eine endgültige Entscheidung.",
      doNow: "Jetzt erledigen",
      tracking: "Wird verfolgt",
      noAction: "Keine Aktion erforderlich",
      ownerStudent: "Von dir zu erledigen",
      ownerAlmaGo: "Von AlmaGo verfolgt",
      file: "Akte",
      nothingNow: "Du musst im Moment nichts tun",
      nothingRequested: "Derzeit ist keine Aktion erforderlich",
      waitingText: "AlmaGo verfolgt derzeit einige Schritte deiner Akte. Die Details findest du unten.",
      noActionText: "Die in deiner Akte gespeicherten Schritte stehen unten. Eine neue Aufgabe wird hervorgehoben, sobald sie dich betrifft.",
      summaryAria: "Übersicht der Schritte",
      todo: "Von dir zu erledigen",
      todoBadge: "Zu bearbeiten",
      nothingBadge: "Nichts zu tun",
      tracked: "Von AlmaGo verfolgt",
      inProgress: "In Arbeit",
      completed: "Erledigt",
      completedSteps: "Erledigte Schritte",
      emptyTitle: "Im Moment sind keine Schritte gespeichert.",
      emptyText: "Wenn ein neuer Schritt zu deiner Akte hinzugefügt wird, erscheint er hier mit Zuständigkeit und Status.",
      back: "Zurück zu meiner Akte",
      categoryEyebrow: "Abschnitt der Akte",
      groupDone: (done, total) => `${done}/${total} erledigt`,
      responsibleStudent: "Zuständig: du",
      responsibleAlmaGo: "Zuständig: AlmaGo",
      completedOn: "Erledigt am",
      unavailableTitle: "Schritte vorübergehend nicht verfügbar",
      unavailableText: "Deine Schritte können gerade nicht angezeigt werden. Es wurde nichts gelöscht oder geändert. Versuche es erneut oder gehe zurück zu deiner Akte.",
      retry: "Noch einmal versuchen",
      intlLocale: "de-DE",
    },
    recorded: {
      otherCategory: "Weitere Schritte",
      categories: {
        Profil: "Profil",
        Documents: "Unterlagen",
        Traduction: "Übersetzungen",
        Orientation: "Studiengänge",
        Candidatures: "Bewerbungen",
        Admission: "Zulassung",
        "Préparation Allemagne": "Vorbereitung für Deutschland",
      },
      items: {
        profile_complete: { title: "Mein Profil vervollständigen", description: "Prüfe deine Grundangaben und vervollständige die erforderlichen Felder." },
        passport: { title: "Meinen Reisepass hinzufügen", description: "Lade eine gut lesbare Passkopie hoch und verfolge hier den Prüfstatus." },
        translation: { title: "Erforderliche Übersetzungen vorbereiten", description: "Übersetze nur die verlangten Unterlagen, nachdem du die geltenden Hinweise geprüft hast." },
        orientation: { title: "Passende Studiengänge vergleichen", description: "Vergleiche vorgeschlagene Studiengänge, Voraussetzungen und Fristen, bevor du auswählst." },
        applications: { title: "Meine Bewerbungen vorbereiten", description: "Prüfe die Anforderungen jedes Studiengangs und bereite die Bewerbung Schritt für Schritt vor." },
        admission: { title: "Antworten der Hochschulen verfolgen", description: "Prüfe den Status deiner Bewerbungen und die Entscheidungen der Hochschulen." },
        germany_preparation: { title: "Abreise nach der Zulassung vorbereiten", description: "Prüfe nach der Zulassung die Schritte, die du vor der Reise nach Deutschland brauchst." },
      },
    },
    personalized: {
      owner: "Zuständig",
      you: "du",
      almago: "AlmaGo",
      items: {
        define_project: { title: "Studienplan festlegen", explanation: "Trage dein Ziel ein, damit du die passenden Schritte siehst." },
        project_defined: { title: "Deutschland-Studienplan festgelegt", explanation: "Dein aktuelles Ziel ist in AlmaGo gespeichert." },
        replace_academic_evidence: { title: "Angeforderte Unterlage ersetzen", explanation: "Diese Unterlage muss ersetzt werden, bevor sie für deinen Studienweg verwendet werden kann." },
        academic_evidence_review: { title: "Akademischen Nachweis prüfen", explanation: "Ein Nachweis ist gespeichert, muss aber noch geprüft werden, bevor er als Grundlage für den Studienweg dienen kann." },
        definitive_admission_basis: { title: "Endgültige Zulassung geprüft", explanation: "Deine Zulassung ist in der Akte gespeichert. Dieser Schritt ist keine Visumentscheidung." },
        preparatory_academic_basis: { title: "Akademische Grundlage für die Vorbereitung akzeptiert", explanation: "Eine bedingte Zulassung, Bewerberbestätigung oder ein anderer zulässiger Vorbereitungsnachweis wurde in deiner Akte akzeptiert." },
        study_preparation_course_selected: { title: "Studienvorbereitungskurs ausgewählt", explanation: "Dein Studienplan enthält einen Studienvorbereitungskurs, der weiterhin als geprüfte Option veröffentlicht ist." },
        select_study_preparation_course: { title: "Geprüften Studienvorbereitungskurs auswählen", explanation: "Die akademische Grundlage ist akzeptiert, aber derzeit ist kein geprüfter Vorbereitungskurs in deinem Studienplan ausgewählt." },
        standalone_language_course_selected: { title: "Eigenständiger Sprachkurs ausgewählt", explanation: "Ein eigenständiger Sprachkurs, der weiterhin als geprüfte Option veröffentlicht ist, ist mit deinem Studienplan verknüpft." },
        select_standalone_language_course: { title: "Geprüften eigenständigen Sprachkurs auswählen", explanation: "Dein Ziel ist ein Sprachkurs, aber derzeit ist kein geprüfter eigenständiger Kurs ausgewählt." },
        continue_academic_search: { title: "Weiter nach einem Studiengang suchen", explanation: "Du hast noch keine geprüfte Zulassung. Vergleiche Studiengänge und bereite deine Bewerbungen vor." },
      },
    },
  },
};
