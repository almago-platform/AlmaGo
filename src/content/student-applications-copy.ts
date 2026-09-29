import type { Locale } from "@/lib/i18n";

type ApplicationsCopy = {
  page: {
    eyebrow: string;
    title: string;
    description: string;
    programmes: string;
    guidanceEyebrow: string;
    guidanceTitle: string;
    guidanceDescription: string;
    guidancePoints: readonly [string, string, string];
    unavailableTitle: string;
    unavailableText: string;
    retry: string;
    recommendations: string;
  };
  panel: {
    statusLabels: Record<string, string>;
    stageLabels: Record<string, string>;
    eventStatusChanged: string;
    eventUpdate: string;
    stepper: readonly [string, string, string, string, string];
    withdrawnText: string;
    withdrawnBadge: string;
    loadTitle: string;
    reload: string;
    back: string;
    priorityAria: string;
    unavailable: string;
    actionNeeded: string;
    tracking: string;
    nextAction: string;
    followed: string;
    loadText: string;
    noSpecificAction: string;
    noApplicationsText: string;
    programFallback: string;
    intakeUnknown: string;
    trackedApplication: string;
    deadlineWord: string;
    statusBoundary: string;
    summaryAria: string;
    todo: string;
    upToDate: string;
    submittedApplications: string;
    submitted: string;
    activeApplications: string;
    active: string;
    deadlinePassed: string;
    nextDeadline: string;
    noConfirmedDate: string;
    checkApplication: string;
    steps: string;
    emptyTitle: string;
    emptyText: string;
    programmesCta: string;
    listEyebrow: string;
    listTitle: string;
    count: (count: number) => string;
    overdueAction: string;
    noAction: string;
    finishedAction: string;
    institution: string;
    universityUnknown: string;
    trackingStep: string;
    whatNext: string;
    requiredDocuments: string;
    unknown: string;
    result: string;
    noResult: string;
    messageForYou: string;
    messageBoundary: string;
    historyTitle: string;
    eventCount: (count: number) => string;
    noEvents: string;
    intlLocale: string;
  };
};

const fr: ApplicationsCopy = {
  page: {
    eyebrow: "Mon dossier",
    title: "Mes candidatures",
    description: "Retrouvez vos candidatures, la prochaine action et la date limite.",
    programmes: "Voir mes programmes",
    guidanceEyebrow: "Pour avancer",
    guidanceTitle: "Commencez par la prochaine action.",
    guidanceDescription: "Pour chaque candidature, regardez le statut, la date limite et ce qu’il faut faire ensuite.",
    guidancePoints: ["Voir le statut actuel.", "Faire la prochaine action.", "Vérifier la date limite."],
    unavailableTitle: "Candidatures temporairement indisponibles",
    unavailableText: "Impossible de charger vos candidatures pour le moment. Réessayez.",
    retry: "Réessayer",
    recommendations: "Voir mes recommandations",
  },
  panel: {
    statusLabels: {
      interested: "À préparer",
      preparing: "Préparation en cours",
      documents_missing: "Documents à compléter",
      ready_to_submit: "Prête à déposer",
      submitted: "Déposée",
      waiting_university: "En attente de l’université",
      admission: "Admission enregistrée",
      rejection: "Résultat négatif enregistré",
      withdrawn: "Suivi retiré",
      draft: "Brouillon historique",
      planned: "Planifiée",
      in_review: "En cours d’examen",
      accepted: "Admission enregistrée",
      rejected: "Résultat négatif enregistré",
      other: "Statut enregistré",
    },
    stageLabels: {
      interested: "Intérêt enregistré",
      preparing: "Préparation du dossier",
      documents_missing: "Préparation du dossier",
      ready_to_submit: "Dossier prêt à envoyer",
      submitted: "Candidature envoyée",
      waiting_university: "Décision de l’université attendue",
      admission: "Décision de l’université enregistrée",
      rejection: "Décision de l’université enregistrée",
      withdrawn: "Suivi terminé",
      other: "Étape à confirmer",
    },
    eventStatusChanged: "Statut de candidature mis à jour",
    eventUpdate: "Mise à jour du dossier",
    stepper: ["À préparer", "Préparation", "Prêt", "Envoyé", "Décision"],
    withdrawnText: "Le suivi de cette candidature a été retiré.",
    withdrawnBadge: "Suivi retiré",
    loadTitle: "Suivi des candidatures indisponible",
    reload: "Réessayer le chargement",
    back: "Retour à mon dossier",
    priorityAria: "Priorité candidature",
    unavailable: "Indisponible",
    actionNeeded: "Action à faire",
    tracking: "Suivi en cours",
    nextAction: "Votre prochaine action",
    followed: "Vos candidatures sont suivies",
    loadText: "Les candidatures n’ont pas pu être chargées pour le moment.",
    noSpecificAction: "Aucune action précise n’est enregistrée de votre côté pour cette candidature. Consultez son statut et son historique ci-dessous.",
    noApplicationsText: "Aucune candidature n’est encore enregistrée. Ajoutez un programme depuis « Mes programmes » pour le suivre ici.",
    programFallback: "Programme",
    intakeUnknown: "Semestre à confirmer",
    trackedApplication: "Candidature suivie",
    deadlineWord: "Échéance",
    statusBoundary: "Le statut AlmaGo reflète le suivi enregistré dans votre espace. Il ne remplace pas le statut officiel communiqué par l’université.",
    summaryAria: "Résumé des candidatures",
    todo: "À traiter",
    upToDate: "À jour",
    submittedApplications: "Candidatures déposées",
    submitted: "Déposées",
    activeApplications: "Candidatures actives",
    active: "Actives",
    deadlinePassed: "Échéance dépassée",
    nextDeadline: "Prochaine échéance",
    noConfirmedDate: "Aucune date confirmée",
    checkApplication: "Vérifiez cette candidature",
    steps: "Voir mes étapes",
    emptyTitle: "Vous n’avez encore aucune candidature enregistrée.",
    emptyText: "Ajoutez un programme depuis « Mes programmes » pour le suivre ici. Cette action n’envoie pas votre candidature.",
    programmesCta: "Voir mes programmes",
    listEyebrow: "Vos dossiers suivis",
    listTitle: "Mes candidatures",
    count: (count) => `${count} candidature${count > 1 ? "s" : ""} enregistrée${count > 1 ? "s" : ""} dans votre espace.`,
    overdueAction: "Échéance dépassée : vérifiez cette candidature et les informations enregistrées.",
    noAction: "Aucune action spécifique n’est enregistrée. Vérifiez le statut et l’échéance de cette candidature.",
    finishedAction: "Le suivi de cette candidature est terminé dans AlmaGo. Consultez le résultat et l’historique.",
    institution: "Établissement",
    universityUnknown: "Université à confirmer",
    trackingStep: "Étape du suivi",
    whatNext: "Ce qui vient ensuite",
    requiredDocuments: "Documents nécessaires",
    unknown: "À confirmer",
    result: "Résultat",
    noResult: "Aucun résultat détaillé enregistré.",
    messageForYou: "Message pour vous",
    messageBoundary: "Ce message est partagé dans votre espace étudiant. Les notes internes de l’équipe ne sont pas affichées ici.",
    historyTitle: "Ce qui a été fait",
    eventCount: (count) => `${count} événement${count > 1 ? "s" : ""}`,
    noEvents: "Aucun événement visible n’est enregistré pour le moment.",
    intlLocale: "fr-FR",
  },
};

const ar: ApplicationsCopy = {
  page: {
    eyebrow: "ملفي",
    title: "طلبات التقديم",
    description: "تابع حالة كل طلب، موعده النهائي، وما عليك فعله بعد ذلك.",
    programmes: "استعرض برامجك",
    guidanceEyebrow: "قبل التقديم",
    guidanceTitle: "اعرف ما الذي يأتي بعد ذلك لكل طلب.",
    guidanceDescription: "لكل طلب، راجع الحالة والموعد النهائي وما الذي عليك فعله بعد ذلك.",
    guidancePoints: ["راجع الحالة الحالية.", "نفّذ الخطوة التالية.", "تحقق من الموعد النهائي."],
    unavailableTitle: "طلبات التقديم غير متاحة مؤقتًا",
    unavailableText: "تعذر تحميل طلبات التقديم الآن. حاول مرة أخرى.",
    retry: "إعادة المحاولة",
    recommendations: "استعرض البرامج",
  },
  panel: {
    statusLabels: {
      interested: "مهتم",
      preparing: "قيد التحضير",
      documents_missing: "مستندات ناقصة",
      ready_to_submit: "جاهز للتقديم",
      submitted: "تم التقديم",
      waiting_university: "في انتظار الجامعة",
      admission: "تم تسجيل القبول",
      rejection: "تم تسجيل الرفض",
      withdrawn: "تم إيقاف المتابعة",
      draft: "مسودة قديمة",
      planned: "مخطط له",
      in_review: "قيد المراجعة",
      accepted: "تم تسجيل القبول",
      rejected: "تم تسجيل الرفض",
      other: "حالة مسجلة",
    },
    stageLabels: {
      interested: "تم تسجيل الاهتمام",
      preparing: "تحضير الطلب",
      documents_missing: "تحضير الطلب",
      ready_to_submit: "الطلب جاهز للإرسال",
      submitted: "تم إرسال الطلب",
      waiting_university: "في انتظار قرار الجامعة",
      admission: "تم تسجيل قرار الجامعة",
      rejection: "تم تسجيل قرار الجامعة",
      withdrawn: "انتهت المتابعة",
      other: "المرحلة تحتاج إلى تأكيد",
    },
    eventStatusChanged: "تم تحديث حالة طلب التقديم",
    eventUpdate: "تحديث في الملف",
    stepper: ["اهتمام", "التحضير", "جاهز", "تم الإرسال", "القرار"],
    withdrawnText: "تم إيقاف متابعة هذا الطلب.",
    withdrawnBadge: "المتابعة متوقفة",
    loadTitle: "متابعة الطلبات غير متاحة",
    reload: "إعادة تحميل الطلبات",
    back: "العودة إلى ملفي",
    priorityAria: "أولوية طلبات التقديم",
    unavailable: "غير متاح",
    actionNeeded: "إجراء مطلوب",
    tracking: "قيد المتابعة",
    nextAction: "خطوتك التالية",
    followed: "طلباتك قيد المتابعة",
    loadText: "تعذر تحميل طلبات التقديم حاليًا.",
    noSpecificAction: "لا توجد خطوة محددة مسجلة لك لهذا الطلب. راجع حالته وسجله أدناه.",
    noApplicationsText: "لم تضف أي طلب تقديم بعد. اختر برنامجًا من «برامجي» لتبدأ متابعته هنا.",
    programFallback: "البرنامج",
    intakeUnknown: "موعد الدراسة يحتاج إلى تأكيد",
    trackedApplication: "طلب قيد المتابعة",
    deadlineWord: "الموعد النهائي",
    statusBoundary: "حالة AlmaGo تعكس المتابعة المسجلة في مساحتك فقط، ولا تستبدل الحالة الرسمية التي تعلنها الجامعة.",
    summaryAria: "ملخص طلبات التقديم",
    todo: "تحتاج إلى إجراء",
    upToDate: "محدّثة",
    submittedApplications: "طلبات تم تقديمها",
    submitted: "تم تقديمها",
    activeApplications: "طلبات نشطة",
    active: "نشطة",
    deadlinePassed: "انتهى الموعد",
    nextDeadline: "الموعد القادم",
    noConfirmedDate: "لا يوجد تاريخ مؤكد",
    checkApplication: "راجع هذا الطلب",
    steps: "استعرض خطواتك",
    emptyTitle: "لم تضف أي طلب تقديم بعد.",
    emptyText: "أضف برنامجًا من «برامجي» لمتابعته هنا. هذه الخطوة لا ترسل طلبًا إلى الجامعة.",
    programmesCta: "استعرض برامجك",
    listEyebrow: "الطلبات التي تتابعها",
    listTitle: "طلبات التقديم",
    count: (count) => `${count} ${count === 1 ? "طلب مسجل" : "طلبات مسجلة"} في مساحتك.`,
    overdueAction: "انتهى الموعد: راجع هذا الطلب والمعلومات المسجلة.",
    noAction: "لا توجد خطوة محددة مسجلة. راجع حالة الطلب وموعده النهائي.",
    finishedAction: "انتهت متابعة هذا الطلب داخل AlmaGo. راجع النتيجة والسجل.",
    institution: "المؤسسة",
    universityUnknown: "الجامعة تحتاج إلى تأكيد",
    trackingStep: "مرحلة المتابعة",
    whatNext: "الخطوة التالية",
    requiredDocuments: "المستندات المطلوبة",
    unknown: "يحتاج إلى تأكيد",
    result: "النتيجة",
    noResult: "لا توجد نتيجة تفصيلية مسجلة.",
    messageForYou: "رسالة لك",
    messageBoundary: "هذه الرسالة ظاهرة في مساحتك الطلابية. الملاحظات الداخلية للفريق لا تظهر هنا.",
    historyTitle: "سجل التحديثات",
    eventCount: (count) => `${count} تحديث`,
    noEvents: "لا توجد تحديثات ظاهرة بعد.",
    intlLocale: "ar-TN",
  },
};

const en: ApplicationsCopy = {
  page: {
    eyebrow: "My file",
    title: "My applications",
    description: "Track your applications, next action and deadline.",
    programmes: "View my programmes",
    guidanceEyebrow: "Keep moving",
    guidanceTitle: "Start with the next action.",
    guidanceDescription: "For each application, check the status, deadline and what to do next.",
    guidancePoints: ["Check the current status.", "Do the next action.", "Check the deadline."],
    unavailableTitle: "Applications temporarily unavailable",
    unavailableText: "We cannot load your applications right now. Please try again.",
    retry: "Try again",
    recommendations: "View my recommendations",
  },
  panel: {
    statusLabels: {
      interested: "To prepare",
      preparing: "Preparing",
      documents_missing: "Documents to complete",
      ready_to_submit: "Ready to submit",
      submitted: "Submitted",
      waiting_university: "Waiting for the university",
      admission: "Admission recorded",
      rejection: "Negative result recorded",
      withdrawn: "Tracking removed",
      draft: "Historical draft",
      planned: "Planned",
      in_review: "Under review",
      accepted: "Admission recorded",
      rejected: "Negative result recorded",
      other: "Status recorded",
    },
    stageLabels: {
      interested: "Interest recorded",
      preparing: "Preparing the application",
      documents_missing: "Preparing the application",
      ready_to_submit: "Application ready to submit",
      submitted: "Application submitted",
      waiting_university: "Waiting for the university decision",
      admission: "University decision recorded",
      rejection: "University decision recorded",
      withdrawn: "Tracking ended",
      other: "Stage to be confirmed",
    },
    eventStatusChanged: "Application status updated",
    eventUpdate: "File updated",
    stepper: ["To prepare", "Preparing", "Ready", "Submitted", "Decision"],
    withdrawnText: "Tracking for this application has been removed.",
    withdrawnBadge: "Tracking removed",
    loadTitle: "Application tracking unavailable",
    reload: "Reload applications",
    back: "Back to my file",
    priorityAria: "Application priority",
    unavailable: "Unavailable",
    actionNeeded: "Action needed",
    tracking: "Tracking in progress",
    nextAction: "Your next action",
    followed: "Your applications are being tracked",
    loadText: "Your applications could not be loaded right now.",
    noSpecificAction: "No specific action is recorded for you on this application. Check its status and history below.",
    noApplicationsText: "No application is recorded yet. Add a programme from “My programmes” to track it here.",
    programFallback: "Programme",
    intakeUnknown: "Intake to be confirmed",
    trackedApplication: "Application being tracked",
    deadlineWord: "Deadline",
    statusBoundary: "The AlmaGo status reflects tracking recorded in your space. It does not replace the official status communicated by the university.",
    summaryAria: "Application summary",
    todo: "To do",
    upToDate: "Up to date",
    submittedApplications: "Submitted applications",
    submitted: "Submitted",
    activeApplications: "Active applications",
    active: "Active",
    deadlinePassed: "Deadline passed",
    nextDeadline: "Next deadline",
    noConfirmedDate: "No confirmed date",
    checkApplication: "Check this application",
    steps: "View my steps",
    emptyTitle: "You do not have any recorded applications yet.",
    emptyText: "Add a programme from “My programmes” to track it here. This does not submit an application.",
    programmesCta: "View my programmes",
    listEyebrow: "Applications you are tracking",
    listTitle: "My applications",
    count: (count) => `${count} application${count === 1 ? "" : "s"} recorded in your space.`,
    overdueAction: "Deadline passed: check this application and the recorded information.",
    noAction: "No specific action is recorded. Check the application status and deadline.",
    finishedAction: "Tracking for this application has ended in AlmaGo. Check the result and history.",
    institution: "Institution",
    universityUnknown: "University to be confirmed",
    trackingStep: "Tracking stage",
    whatNext: "What comes next",
    requiredDocuments: "Required documents",
    unknown: "To be confirmed",
    result: "Result",
    noResult: "No detailed result recorded.",
    messageForYou: "Message for you",
    messageBoundary: "This message is shared in your student space. Internal team notes are not shown here.",
    historyTitle: "What has happened",
    eventCount: (count) => `${count} event${count === 1 ? "" : "s"}`,
    noEvents: "No visible event has been recorded yet.",
    intlLocale: "en-GB",
  },
};

const de: ApplicationsCopy = {
  page: {
    eyebrow: "Meine Akte",
    title: "Meine Bewerbungen",
    description: "Sieh deine Bewerbungen, die nächste Aufgabe und die Frist.",
    programmes: "Meine Studiengänge ansehen",
    guidanceEyebrow: "So geht es weiter",
    guidanceTitle: "Starte mit der nächsten Aufgabe.",
    guidanceDescription: "Prüfe bei jeder Bewerbung Status, Frist und nächsten Schritt.",
    guidancePoints: ["Aktuellen Status ansehen.", "Nächste Aufgabe erledigen.", "Frist prüfen."],
    unavailableTitle: "Bewerbungen vorübergehend nicht verfügbar",
    unavailableText: "Deine Bewerbungen können gerade nicht geladen werden. Bitte versuche es erneut.",
    retry: "Noch einmal versuchen",
    recommendations: "Meine Vorschläge ansehen",
  },
  panel: {
    statusLabels: {
      interested: "Vorbereiten",
      preparing: "In Vorbereitung",
      documents_missing: "Unterlagen ergänzen",
      ready_to_submit: "Bereit zum Einreichen",
      submitted: "Eingereicht",
      waiting_university: "Warten auf Hochschule",
      admission: "Zulassung eingetragen",
      rejection: "Negatives Ergebnis eingetragen",
      withdrawn: "Verfolgung entfernt",
      draft: "Historischer Entwurf",
      planned: "Geplant",
      in_review: "In Prüfung",
      accepted: "Zulassung eingetragen",
      rejected: "Negatives Ergebnis eingetragen",
      other: "Status gespeichert",
    },
    stageLabels: {
      interested: "Interesse gespeichert",
      preparing: "Bewerbung vorbereiten",
      documents_missing: "Bewerbung vorbereiten",
      ready_to_submit: "Bewerbung bereit zum Einreichen",
      submitted: "Bewerbung eingereicht",
      waiting_university: "Warten auf Hochschulentscheidung",
      admission: "Hochschulentscheidung gespeichert",
      rejection: "Hochschulentscheidung gespeichert",
      withdrawn: "Verfolgung beendet",
      other: "Schritt noch zu bestätigen",
    },
    eventStatusChanged: "Bewerbungsstatus aktualisiert",
    eventUpdate: "Akte aktualisiert",
    stepper: ["Vorbereiten", "Vorbereitung", "Bereit", "Eingereicht", "Entscheidung"],
    withdrawnText: "Die Verfolgung dieser Bewerbung wurde entfernt.",
    withdrawnBadge: "Verfolgung entfernt",
    loadTitle: "Bewerbungsverfolgung nicht verfügbar",
    reload: "Bewerbungen neu laden",
    back: "Zurück zu meiner Akte",
    priorityAria: "Priorität Bewerbung",
    unavailable: "Nicht verfügbar",
    actionNeeded: "Aktion erforderlich",
    tracking: "Wird verfolgt",
    nextAction: "Deine nächste Aufgabe",
    followed: "Deine Bewerbungen werden verfolgt",
    loadText: "Deine Bewerbungen konnten gerade nicht geladen werden.",
    noSpecificAction: "Für diese Bewerbung ist aktuell keine konkrete Aufgabe gespeichert. Prüfe Status und Verlauf unten.",
    noApplicationsText: "Noch keine Bewerbung gespeichert. Füge einen Studiengang aus „Meine Studiengänge“ hinzu, um ihn hier zu verfolgen.",
    programFallback: "Studiengang",
    intakeUnknown: "Studienstart noch zu bestätigen",
    trackedApplication: "Verfolgte Bewerbung",
    deadlineWord: "Frist",
    statusBoundary: "Der AlmaGo-Status zeigt die in deinem Bereich gespeicherte Verfolgung. Er ersetzt nicht den offiziellen Status der Hochschule.",
    summaryAria: "Übersicht Bewerbungen",
    todo: "Zu erledigen",
    upToDate: "Aktuell",
    submittedApplications: "Eingereichte Bewerbungen",
    submitted: "Eingereicht",
    activeApplications: "Aktive Bewerbungen",
    active: "Aktiv",
    deadlinePassed: "Frist abgelaufen",
    nextDeadline: "Nächste Frist",
    noConfirmedDate: "Kein bestätigtes Datum",
    checkApplication: "Bewerbung prüfen",
    steps: "Meine Schritte ansehen",
    emptyTitle: "Du hast noch keine Bewerbung gespeichert.",
    emptyText: "Füge einen Studiengang aus „Meine Studiengänge“ hinzu, um ihn hier zu verfolgen. Dadurch wird keine Bewerbung eingereicht.",
    programmesCta: "Meine Studiengänge ansehen",
    listEyebrow: "Verfolgte Bewerbungen",
    listTitle: "Meine Bewerbungen",
    count: (count) => `${count} Bewerbung${count === 1 ? "" : "en"} in deinem Bereich gespeichert.`,
    overdueAction: "Frist abgelaufen: Prüfe diese Bewerbung und die gespeicherten Angaben.",
    noAction: "Keine konkrete Aufgabe gespeichert. Prüfe Status und Frist dieser Bewerbung.",
    finishedAction: "Die Verfolgung dieser Bewerbung ist in AlmaGo beendet. Prüfe Ergebnis und Verlauf.",
    institution: "Hochschule",
    universityUnknown: "Hochschule noch zu bestätigen",
    trackingStep: "Schritt der Verfolgung",
    whatNext: "Was als Nächstes kommt",
    requiredDocuments: "Erforderliche Unterlagen",
    unknown: "Noch zu bestätigen",
    result: "Ergebnis",
    noResult: "Kein detailliertes Ergebnis gespeichert.",
    messageForYou: "Nachricht für dich",
    messageBoundary: "Diese Nachricht wird in deinem Studierendenbereich angezeigt. Interne Teamnotizen werden hier nicht angezeigt.",
    historyTitle: "Was bisher passiert ist",
    eventCount: (count) => `${count} Ereignis${count === 1 ? "" : "se"}`,
    noEvents: "Noch kein sichtbares Ereignis gespeichert.",
    intlLocale: "de-DE",
  },
};

export const studentApplicationsCopy: Record<Locale, ApplicationsCopy> = { fr, ar, en, de };
