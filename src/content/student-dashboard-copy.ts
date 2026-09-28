import type { Locale } from "@/lib/i18n";

type DashboardCopy = {
  studentFallback: string;
  heroEyebrow: string;
  heroLead: string;
  actionCount: (count: number) => string;
  waitingCount: (count: number) => string;
  noPriority: string;
  documentsAction: string;
  documentsActionDetail: (count: number) => string;
  applicationAction: string;
  checklistAction: string;
  stepsAction: string;
  noPriorityDetail: string;
  ownerStudent: string;
  ownerAlmaGo: string;
  ownerFile: string;
  profileStage: string;
  profileStageDetail: string;
  documentsStage: string;
  documentsCount: (count: number) => string;
  noDocuments: string;
  programmesStage: string;
  programmesCount: (count: number) => string;
  noProgrammes: string;
  preparationStage: string;
  stepsCount: (done: number, total: number) => string;
  noSteps: string;
  applicationsStage: string;
  applicationsCount: (count: number) => string;
  noApplications: string;
  nextStage: string;
  nextStageActive: string;
  nextStageLater: string;
  statusTodo: string;
  statusTracked: string;
  nextActionEyebrow: string;
  now: string;
  tracking: string;
  upToDate: string;
  fileUpToDate: string;
  preparation: string;
  completedSteps: string;
  progressLabel: string;
  progressBoundary: string;
  overviewAria: string;
  documentsCard: string;
  documentsFix: (count: number) => string;
  documentsApproved: (count: number) => string;
  documentsRecorded: string;
  programmesCard: string;
  programmesCompare: string;
  applicationsCard: string;
  activeApplications: (count: number) => string;
  applicationsRecorded: string;
  stepsCard: string;
  completedCount: (count: number) => string;
  stepsRecorded: string;
  germanyEyebrow: string;
  germanyTitle: string;
  germanyText: string;
  pathwayCta: string;
  projectCta: string;
  deadlineOverdue: string;
  nextDeadline: string;
  noDeadline: string;
  applicationFallback: string;
  noActiveDeadline: string;
  applicationsCta: string;
  dossierEyebrow: string;
  dossierTitle: string;
  dossierText: string;
  dossierPills: readonly [string, string, string];
  unavailableBadge: string;
  unavailableTitle: string;
  unavailableText: string;
  retry: string;
};

const fr: DashboardCopy = {
  studentFallback: "étudiant",
  heroEyebrow: "Mon dossier AlmaGo",
  heroLead: "Voici ce qui compte maintenant.",
  actionCount: (count) => `Vous avez ${count} action${count > 1 ? "s" : ""} à traiter. Commencez par la plus importante ci-dessous.`,
  waitingCount: (count) => `Aucune action n’est demandée de votre côté. AlmaGo suit ${count} étape${count > 1 ? "s" : ""} de votre dossier.`,
  noPriority: "Aucune action prioritaire n’est enregistrée. Vous pouvez consulter les différentes parties de votre dossier.",
  documentsAction: "Corriger mes documents",
  documentsActionDetail: (count) => `${count} document${count > 1 ? "s doivent" : " doit"} être remplacé${count > 1 ? "s" : ""} avant la suite du dossier.`,
  applicationAction: "Voir ma candidature",
  checklistAction: "Continuer mes démarches",
  stepsAction: "Voir mes démarches",
  noPriorityDetail: "Aucune action prioritaire n’est enregistrée pour le moment. Consultez les étapes connues de votre dossier.",
  ownerStudent: "À faire par vous",
  ownerAlmaGo: "Suivi par AlmaGo",
  ownerFile: "Suivi du dossier",
  profileStage: "Profil",
  profileStageDetail: "Informations renseignées",
  documentsStage: "Documents",
  documentsCount: (count) => `${count} document${count > 1 ? "s" : ""} enregistré${count > 1 ? "s" : ""}`,
  noDocuments: "Aucun document enregistré",
  programmesStage: "Programmes",
  programmesCount: (count) => `${count} programme${count > 1 ? "s" : ""} à comparer`,
  noProgrammes: "Aucun programme proposé",
  preparationStage: "Préparation",
  stepsCount: (done, total) => `${done} sur ${total} étape${total > 1 ? "s" : ""}`,
  noSteps: "Aucune étape enregistrée",
  applicationsStage: "Candidatures",
  applicationsCount: (count) => `${count} dossier${count > 1 ? "s" : ""} enregistré${count > 1 ? "s" : ""}`,
  noApplications: "Aucune candidature enregistrée",
  nextStage: "Démarches suivantes",
  nextStageActive: "À suivre selon vos dossiers actifs",
  nextStageLater: "À venir selon votre parcours",
  statusTodo: "À traiter",
  statusTracked: "Suivi AlmaGo",
  nextActionEyebrow: "Prochaine action",
  now: "À faire maintenant",
  tracking: "Suivi en cours",
  upToDate: "À jour",
  fileUpToDate: "Votre dossier est à jour pour le moment.",
  preparation: "Préparation du dossier",
  completedSteps: "démarches terminées",
  progressLabel: "Étapes terminées dans le dossier",
  progressBoundary: "Cette progression décrit uniquement les éléments enregistrés dans AlmaGo. Elle ne représente ni une admission ni une validation finale.",
  overviewAria: "Les éléments de votre dossier",
  documentsCard: "Documents",
  documentsFix: (count) => `${count} à corriger`,
  documentsApproved: (count) => `${count} validé${count > 1 ? "s" : ""}`,
  documentsRecorded: "Pièces enregistrées",
  programmesCard: "Programmes",
  programmesCompare: "Programmes à comparer",
  applicationsCard: "Candidatures",
  activeApplications: (count) => `${count} active${count > 1 ? "s" : ""}`,
  applicationsRecorded: "Dossiers enregistrés",
  stepsCard: "Démarches",
  completedCount: (count) => `${count} terminée${count > 1 ? "s" : ""}`,
  stepsRecorded: "Étapes enregistrées",
  germanyEyebrow: "Projet Allemagne",
  germanyTitle: "Choisissez votre objectif pour voir les étapes utiles.",
  germanyText: "Études, préparation aux études ou cours de langue : indiquez ce que vous voulez faire.",
  pathwayCta: "Voir mes étapes",
  projectCta: "Choisir mon objectif",
  deadlineOverdue: "Échéance dépassée",
  nextDeadline: "Prochaine échéance",
  noDeadline: "Aucune date enregistrée",
  applicationFallback: "Consultez cette candidature active pour vérifier la prochaine action.",
  noActiveDeadline: "Aucune échéance n’est enregistrée pour vos candidatures actives.",
  applicationsCta: "Voir mes candidatures",
  dossierEyebrow: "Votre dossier",
  dossierTitle: "Revenez ici pour voir votre prochaine étape.",
  dossierText: "Vous voyez ce qui est fait, ce qui manque et ce que vous pouvez faire maintenant, sans remplacer les décisions des universités ou des autorités.",
  dossierPills: ["Voir", "Préparer", "Continuer"],
  unavailableBadge: "Espace étudiant",
  unavailableTitle: "Dossier temporairement indisponible",
  unavailableText: "Impossible d’afficher votre dossier pour le moment. Réessayez dans quelques instants.",
  retry: "Réessayer",
};

const ar: DashboardCopy = {
  studentFallback: "طالب",
  heroEyebrow: "ملفي على AlmaGo",
  heroLead: "هذا هو الأهم الآن.",
  actionCount: (count) => `لديك ${count} ${count === 1 ? "خطوة تحتاج إلى إجراء" : "خطوات تحتاج إلى إجراء"}. ابدأ بالأهم أدناه.`,
  waitingCount: (count) => `لا يوجد إجراء مطلوب منك الآن. AlmaGo يتابع ${count} ${count === 1 ? "خطوة" : "خطوات"} في ملفك.`,
  noPriority: "لا توجد خطوة عاجلة الآن. يمكنك مراجعة أقسام ملفك أدناه.",
  documentsAction: "تصحيح مستنداتي",
  documentsActionDetail: (count) => `هناك ${count} ${count === 1 ? "مستند يجب استبداله" : "مستندات يجب استبدالها"} قبل متابعة الملف.`,
  applicationAction: "عرض طلب التقديم",
  checklistAction: "متابعة خطواتي",
  stepsAction: "عرض خطواتي",
  noPriorityDetail: "لا توجد خطوة عاجلة مسجلة الآن. يمكنك مراجعة الخطوات المعروفة في ملفك.",
  ownerStudent: "مطلوب منك",
  ownerAlmaGo: "يتابعه AlmaGo",
  ownerFile: "متابعة الملف",
  profileStage: "البيانات",
  profileStageDetail: "تم إدخال المعلومات",
  documentsStage: "المستندات",
  documentsCount: (count) => `${count} ${count === 1 ? "مستند مسجل" : "مستندات مسجلة"}`,
  noDocuments: "لا توجد مستندات مسجلة",
  programmesStage: "البرامج",
  programmesCount: (count) => `${count} ${count === 1 ? "برنامج للمقارنة" : "برامج للمقارنة"}`,
  noProgrammes: "لا توجد برامج مقترحة",
  preparationStage: "التحضير",
  stepsCount: (done, total) => `${done} من ${total} خطوة`,
  noSteps: "لا توجد خطوات مسجلة",
  applicationsStage: "طلبات التقديم",
  applicationsCount: (count) => `${count} ${count === 1 ? "طلب مسجل" : "طلبات مسجلة"}`,
  noApplications: "لا توجد طلبات تقديم مسجلة",
  nextStage: "الخطوات التالية",
  nextStageActive: "تابعها حسب طلباتك الحالية",
  nextStageLater: "ستظهر حسب مسارك",
  statusTodo: "مطلوب",
  statusTracked: "يتابعه AlmaGo",
  nextActionEyebrow: "خطوتك التالية",
  now: "افعلها الآن",
  tracking: "قيد المتابعة",
  upToDate: "محدّث",
  fileUpToDate: "ملفك محدّث حالياً.",
  preparation: "تقدم الملف",
  completedSteps: "خطوات مكتملة",
  progressLabel: "الخطوات المكتملة في الملف",
  progressBoundary: "يعرض هذا التقدم ما هو مسجل داخل AlmaGo فقط. ولا يعني قبولاً جامعياً أو قراراً نهائياً.",
  overviewAria: "أقسام ملفك",
  documentsCard: "المستندات",
  documentsFix: (count) => `${count} للتصحيح`,
  documentsApproved: (count) => `${count} تم التحقق منه`,
  documentsRecorded: "مستندات مسجلة",
  programmesCard: "البرامج",
  programmesCompare: "برامج للمقارنة",
  applicationsCard: "طلبات التقديم",
  activeApplications: (count) => `${count} ${count === 1 ? "نشط" : "نشطة"}`,
  applicationsRecorded: "طلبات مسجلة",
  stepsCard: "الخطوات",
  completedCount: (count) => `${count} مكتملة`,
  stepsRecorded: "خطوات مسجلة",
  germanyEyebrow: "مشروعي في ألمانيا",
  germanyTitle: "حدد هدفك لتظهر لك الخطوات المناسبة.",
  germanyText: "دراسة جامعية، تحضير للدراسة أو دورة لغة: أخبرنا بما تريد القيام به.",
  pathwayCta: "عرض خطواتي",
  projectCta: "تحديد هدفي",
  deadlineOverdue: "انتهى الموعد",
  nextDeadline: "الموعد القادم",
  noDeadline: "لا يوجد موعد مسجل",
  applicationFallback: "افتح طلب التقديم هذا لمعرفة الخطوة التالية.",
  noActiveDeadline: "لا يوجد موعد مسجل لطلباتك النشطة.",
  applicationsCta: "عرض طلباتي",
  dossierEyebrow: "ملفك",
  dossierTitle: "ارجع إلى هنا لمعرفة خطوتك التالية.",
  dossierText: "سترى ما تم إنجازه، وما ينقصك وما يمكنك فعله الآن. القرارات الرسمية تبقى للجامعات والسلطات المختصة.",
  dossierPills: ["راجع", "حضّر", "تابع"],
  unavailableBadge: "مساحة الطالب",
  unavailableTitle: "ملفك غير متاح مؤقتاً",
  unavailableText: "تعذر عرض ملفك الآن. حاول مرة أخرى بعد قليل.",
  retry: "إعادة المحاولة",
};

const en: DashboardCopy = {
  studentFallback: "student",
  heroEyebrow: "My AlmaGo file",
  heroLead: "Here is what matters now.",
  actionCount: (count) => `You have ${count} action${count === 1 ? "" : "s"} to take. Start with the most important one below.`,
  waitingCount: (count) => `Nothing is required from you right now. AlmaGo is tracking ${count} step${count === 1 ? "" : "s"} in your file.`,
  noPriority: "There is no priority action right now. You can review each part of your file below.",
  documentsAction: "Fix my documents",
  documentsActionDetail: (count) => `${count} document${count === 1 ? " needs" : "s need"} to be replaced before you continue.`,
  applicationAction: "View my application",
  checklistAction: "Continue my steps",
  stepsAction: "View my steps",
  noPriorityDetail: "There is no priority action right now. Review the known steps in your file.",
  ownerStudent: "For you to do",
  ownerAlmaGo: "Tracked by AlmaGo",
  ownerFile: "File tracking",
  profileStage: "Profile",
  profileStageDetail: "Information added",
  documentsStage: "Documents",
  documentsCount: (count) => `${count} document${count === 1 ? "" : "s"} added`,
  noDocuments: "No documents added",
  programmesStage: "Programmes",
  programmesCount: (count) => `${count} programme${count === 1 ? "" : "s"} to compare`,
  noProgrammes: "No programmes suggested",
  preparationStage: "Preparation",
  stepsCount: (done, total) => `${done} of ${total} step${total === 1 ? "" : "s"}`,
  noSteps: "No steps added",
  applicationsStage: "Applications",
  applicationsCount: (count) => `${count} application${count === 1 ? "" : "s"} added`,
  noApplications: "No applications added",
  nextStage: "What comes next",
  nextStageActive: "Follow your active applications",
  nextStageLater: "Will depend on your journey",
  statusTodo: "To do",
  statusTracked: "AlmaGo tracking",
  nextActionEyebrow: "Next action",
  now: "Do this now",
  tracking: "In progress",
  upToDate: "Up to date",
  fileUpToDate: "Your file is up to date for now.",
  preparation: "File preparation",
  completedSteps: "steps completed",
  progressLabel: "Steps completed in your file",
  progressBoundary: "This progress only reflects information recorded in AlmaGo. It is not an admission result or final decision.",
  overviewAria: "Your file at a glance",
  documentsCard: "Documents",
  documentsFix: (count) => `${count} to fix`,
  documentsApproved: (count) => `${count} approved`,
  documentsRecorded: "Documents added",
  programmesCard: "Programmes",
  programmesCompare: "Programmes to compare",
  applicationsCard: "Applications",
  activeApplications: (count) => `${count} active`,
  applicationsRecorded: "Applications added",
  stepsCard: "Steps",
  completedCount: (count) => `${count} completed`,
  stepsRecorded: "Steps added",
  germanyEyebrow: "Germany study plan",
  germanyTitle: "Choose your goal to see the steps that matter.",
  germanyText: "University study, study preparation or a language course: tell us what you want to do.",
  pathwayCta: "See my steps",
  projectCta: "Choose my goal",
  deadlineOverdue: "Deadline passed",
  nextDeadline: "Next deadline",
  noDeadline: "No date added",
  applicationFallback: "Open this active application to check the next action.",
  noActiveDeadline: "No deadline is recorded for your active applications.",
  applicationsCta: "View my applications",
  dossierEyebrow: "Your file",
  dossierTitle: "Come back here to see what to do next.",
  dossierText: "See what is done, what is missing and what you can do now. Universities and authorities still make the official decisions.",
  dossierPills: ["Review", "Prepare", "Continue"],
  unavailableBadge: "Student space",
  unavailableTitle: "Your file is temporarily unavailable",
  unavailableText: "We cannot display your file right now. Please try again shortly.",
  retry: "Try again",
};

const de: DashboardCopy = {
  studentFallback: "Student",
  heroEyebrow: "Meine AlmaGo-Akte",
  heroLead: "Das ist jetzt wichtig.",
  actionCount: (count) => `Du hast ${count} Aufgabe${count === 1 ? "" : "n"} zu erledigen. Starte unten mit der wichtigsten.`,
  waitingCount: (count) => `Im Moment musst du nichts tun. AlmaGo verfolgt ${count} Schritt${count === 1 ? "" : "e"} in deiner Akte.`,
  noPriority: "Im Moment gibt es keine dringende Aufgabe. Du kannst die Bereiche deiner Akte unten ansehen.",
  documentsAction: "Unterlagen korrigieren",
  documentsActionDetail: (count) => `${count} Dokument${count === 1 ? " muss" : "e müssen"} ersetzt werden, bevor es weitergeht.`,
  applicationAction: "Bewerbung ansehen",
  checklistAction: "Meine Schritte fortsetzen",
  stepsAction: "Meine Schritte ansehen",
  noPriorityDetail: "Im Moment gibt es keine dringende Aufgabe. Sieh dir die bekannten Schritte deiner Akte an.",
  ownerStudent: "Von dir zu erledigen",
  ownerAlmaGo: "Von AlmaGo verfolgt",
  ownerFile: "Akte im Blick",
  profileStage: "Profil",
  profileStageDetail: "Angaben eingetragen",
  documentsStage: "Unterlagen",
  documentsCount: (count) => `${count} Dokument${count === 1 ? "" : "e"} gespeichert`,
  noDocuments: "Keine Unterlagen gespeichert",
  programmesStage: "Studiengänge",
  programmesCount: (count) => `${count} Studiengang${count === 1 ? "" : "e"} zum Vergleichen`,
  noProgrammes: "Keine Studiengänge vorgeschlagen",
  preparationStage: "Vorbereitung",
  stepsCount: (done, total) => `${done} von ${total} Schritt${total === 1 ? "" : "en"}`,
  noSteps: "Keine Schritte gespeichert",
  applicationsStage: "Bewerbungen",
  applicationsCount: (count) => `${count} Bewerbung${count === 1 ? "" : "en"} gespeichert`,
  noApplications: "Keine Bewerbungen gespeichert",
  nextStage: "Nächste Schritte",
  nextStageActive: "Nach deinen aktiven Bewerbungen",
  nextStageLater: "Abhängig von deinem Studienweg",
  statusTodo: "Zu erledigen",
  statusTracked: "AlmaGo verfolgt",
  nextActionEyebrow: "Nächste Aufgabe",
  now: "Jetzt erledigen",
  tracking: "Wird verfolgt",
  upToDate: "Aktuell",
  fileUpToDate: "Deine Akte ist im Moment aktuell.",
  preparation: "Stand der Akte",
  completedSteps: "Schritte erledigt",
  progressLabel: "Erledigte Schritte in deiner Akte",
  progressBoundary: "Dieser Fortschritt zeigt nur die in AlmaGo gespeicherten Angaben. Er ist weder eine Zulassung noch eine endgültige Entscheidung.",
  overviewAria: "Deine Akte im Überblick",
  documentsCard: "Unterlagen",
  documentsFix: (count) => `${count} zu korrigieren`,
  documentsApproved: (count) => `${count} geprüft`,
  documentsRecorded: "Unterlagen gespeichert",
  programmesCard: "Studiengänge",
  programmesCompare: "Studiengänge zum Vergleichen",
  applicationsCard: "Bewerbungen",
  activeApplications: (count) => `${count} aktiv`,
  applicationsRecorded: "Bewerbungen gespeichert",
  stepsCard: "Schritte",
  completedCount: (count) => `${count} erledigt`,
  stepsRecorded: "Schritte gespeichert",
  germanyEyebrow: "Studienplan Deutschland",
  germanyTitle: "Wähle dein Ziel, damit du die passenden Schritte siehst.",
  germanyText: "Studium, Studienvorbereitung oder Sprachkurs: Sag uns, was du vorhast.",
  pathwayCta: "Meine Schritte ansehen",
  projectCta: "Mein Ziel wählen",
  deadlineOverdue: "Frist abgelaufen",
  nextDeadline: "Nächste Frist",
  noDeadline: "Kein Datum gespeichert",
  applicationFallback: "Öffne diese aktive Bewerbung und prüfe die nächste Aufgabe.",
  noActiveDeadline: "Für deine aktiven Bewerbungen ist keine Frist gespeichert.",
  applicationsCta: "Meine Bewerbungen ansehen",
  dossierEyebrow: "Deine Akte",
  dossierTitle: "Hier siehst du jederzeit deinen nächsten Schritt.",
  dossierText: "Du siehst, was erledigt ist, was fehlt und was du jetzt tun kannst. Hochschulen und Behörden treffen weiterhin die offiziellen Entscheidungen.",
  dossierPills: ["Prüfen", "Vorbereiten", "Weiter"],
  unavailableBadge: "Studierendenbereich",
  unavailableTitle: "Deine Akte ist vorübergehend nicht verfügbar",
  unavailableText: "Deine Akte kann gerade nicht angezeigt werden. Bitte versuche es gleich noch einmal.",
  retry: "Noch einmal versuchen",
};

export const studentDashboardCopy: Record<Locale, DashboardCopy> = { fr, ar, en, de };
