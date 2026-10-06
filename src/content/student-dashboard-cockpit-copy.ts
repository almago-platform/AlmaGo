import type { Locale } from "@/lib/i18n";

type CockpitCopy = {
  greeting: string;
  projectLabel: string;
  germany: string;
  projectFallback: string;
  progressEyebrow: string;
  progressTitle: string;
  progressMeta: (done: number, total: number) => string;
  nextActionReason: string;
  duration: string;
  continue: string;
  durationDocuments: string;
  durationApplication: string;
  durationChecklist: string;
  durationReview: string;
  documentsReason: (count: number) => string;
  applicationReason: string;
  checklistReason: string;
  noActionReason: string;
  urgentDeadlineReason: string;
  attentionEyebrow: string;
  attentionTitle: string;
  attentionDescription: string;
  overdueDeadlines: string;
  dueSoonDeadlines: string;
  documentsAttention: string;
  blockedApplications: string;
  overdue: string;
  dueSoon: string;
  upcoming: string;
  deadlinesTitle: string;
  deadlinesEmpty: string;
  applicationDeadline: string;
  stepDeadline: string;
  programmesTitle: string;
  programmesEmpty: string;
  programmesCta: string;
  documentsTitle: string;
  documentsEmpty: string;
  documentsCta: string;
  missing: string;
  toFix: string;
  applicationsTitle: string;
  applicationsEmpty: string;
  applicationsCta: string;
  activityTitle: string;
  activityEmpty: string;
  activityApplication: string;
  activityDocument: string;
  activityProgramme: string;
  viewAll: string;
};

const fr: CockpitCopy = {
  greeting: "Bonjour",
  projectLabel: "Ton projet",
  germany: "Allemagne",
  projectFallback: "Projet d’études à préciser",
  progressEyebrow: "Progression globale",
  progressTitle: "Ton projet avance.",
  progressMeta: (done, total) => `${done} étape${done > 1 ? "s" : ""} terminée${done > 1 ? "s" : ""} sur ${total}`,
  nextActionReason: "Pourquoi maintenant",
  duration: "Durée estimée",
  continue: "Continuer",
  durationDocuments: "10–15 min",
  durationApplication: "5–10 min",
  durationChecklist: "10 min",
  durationReview: "5 min",
  documentsReason: (count) => `${count} document${count > 1 ? "s doivent" : " doit"} être corrigé${count > 1 ? "s" : ""} avant de poursuivre sereinement.`,
  applicationReason: "Une candidature active contient une prochaine action enregistrée.",
  checklistReason: "Cette étape est la prochaine action ouverte dans ton parcours.",
  noActionReason: "Aucune urgence n’est enregistrée. Profite-en pour vérifier l’état général de ton dossier.",
  urgentDeadlineReason: "Une échéance est dépassée ou arrive dans les 14 prochains jours.",
  attentionEyebrow: "À surveiller maintenant",
  attentionTitle: "Les points qui peuvent ralentir ton dossier",
  attentionDescription: "Traite d’abord les éléments urgents ou bloquants, puis reprends le reste de ton parcours.",
  overdueDeadlines: "Deadlines dépassées",
  dueSoonDeadlines: "Deadlines sous 14 jours",
  documentsAttention: "Documents à traiter",
  blockedApplications: "Candidatures bloquées",
  overdue: "Dépassée",
  dueSoon: "Sous 14 jours",
  upcoming: "À venir",
  deadlinesTitle: "Deadlines importantes",
  deadlinesEmpty: "Aucune échéance importante enregistrée pour le moment.",
  applicationDeadline: "Candidature",
  stepDeadline: "Étape",
  programmesTitle: "Programmes enregistrés",
  programmesEmpty: "Aucun programme enregistré pour le moment.",
  programmesCta: "Voir les programmes",
  documentsTitle: "Documents manquants",
  documentsEmpty: "Aucun document manquant ou à corriger n’est signalé.",
  documentsCta: "Voir mes documents",
  missing: "Manquant",
  toFix: "À corriger",
  applicationsTitle: "Candidatures en cours",
  applicationsEmpty: "Aucune candidature active.",
  applicationsCta: "Voir mes candidatures",
  activityTitle: "Activité récente",
  activityEmpty: "Aucune activité récente visible.",
  activityApplication: "Candidature mise à jour",
  activityDocument: "Document ajouté",
  activityProgramme: "Programme enregistré",
  viewAll: "Tout voir",
};

const en: CockpitCopy = {
  greeting: "Hello",
  projectLabel: "Your project",
  germany: "Germany",
  projectFallback: "Study project to define",
  progressEyebrow: "Overall progress",
  progressTitle: "Your project is moving forward.",
  progressMeta: (done, total) => `${done} of ${total} steps completed`,
  nextActionReason: "Why now",
  duration: "Estimated time",
  continue: "Continue",
  durationDocuments: "10–15 min",
  durationApplication: "5–10 min",
  durationChecklist: "10 min",
  durationReview: "5 min",
  documentsReason: (count) => `${count} document${count === 1 ? " needs" : "s need"} attention before you move forward.`,
  applicationReason: "An active application has a next action recorded.",
  checklistReason: "This is the next open step in your journey.",
  noActionReason: "Nothing urgent is recorded. Use this moment to review the overall state of your file.",
  urgentDeadlineReason: "A deadline is overdue or falls within the next 14 days.",
  attentionEyebrow: "Watch now",
  attentionTitle: "Items that can slow down your dossier",
  attentionDescription: "Handle urgent or blocking items first, then continue with the rest of your journey.",
  overdueDeadlines: "Overdue deadlines",
  dueSoonDeadlines: "Deadlines within 14 days",
  documentsAttention: "Documents needing action",
  blockedApplications: "Blocked applications",
  overdue: "Overdue",
  dueSoon: "Within 14 days",
  upcoming: "Upcoming",
  deadlinesTitle: "Important deadlines",
  deadlinesEmpty: "No important deadline is recorded right now.",
  applicationDeadline: "Application",
  stepDeadline: "Step",
  programmesTitle: "Saved programmes",
  programmesEmpty: "No programme saved yet.",
  programmesCta: "View programmes",
  documentsTitle: "Missing documents",
  documentsEmpty: "No missing or corrective document action is flagged.",
  documentsCta: "View my documents",
  missing: "Missing",
  toFix: "Fix",
  applicationsTitle: "Active applications",
  applicationsEmpty: "No active application.",
  applicationsCta: "View applications",
  activityTitle: "Recent activity",
  activityEmpty: "No recent visible activity.",
  activityApplication: "Application updated",
  activityDocument: "Document added",
  activityProgramme: "Programme saved",
  viewAll: "View all",
};

const de: CockpitCopy = {
  greeting: "Hallo",
  projectLabel: "Dein Projekt",
  germany: "Deutschland",
  projectFallback: "Studienprojekt noch festzulegen",
  progressEyebrow: "Gesamtfortschritt",
  progressTitle: "Dein Projekt kommt voran.",
  progressMeta: (done, total) => `${done} von ${total} Schritten erledigt`,
  nextActionReason: "Warum jetzt",
  duration: "Geschätzte Dauer",
  continue: "Weiter",
  durationDocuments: "10–15 Min.",
  durationApplication: "5–10 Min.",
  durationChecklist: "10 Min.",
  durationReview: "5 Min.",
  documentsReason: (count) => `${count} Dokument${count === 1 ? " braucht" : "e brauchen"} Aufmerksamkeit, bevor es weitergeht.`,
  applicationReason: "Für eine aktive Bewerbung ist eine nächste Aktion hinterlegt.",
  checklistReason: "Das ist der nächste offene Schritt in deinem Ablauf.",
  noActionReason: "Es gibt keine dringende Aufgabe. Nutze den Moment für einen Überblick über deine Akte.",
  urgentDeadlineReason: "Eine Frist ist abgelaufen oder liegt innerhalb der nächsten 14 Tage.",
  attentionEyebrow: "Jetzt beachten",
  attentionTitle: "Punkte, die dein Dossier ausbremsen können",
  attentionDescription: "Bearbeite zuerst dringende oder blockierende Punkte und setze danach deinen Weg fort.",
  overdueDeadlines: "Abgelaufene Fristen",
  dueSoonDeadlines: "Fristen in 14 Tagen",
  documentsAttention: "Unterlagen mit Handlungsbedarf",
  blockedApplications: "Blockierte Bewerbungen",
  overdue: "Abgelaufen",
  dueSoon: "In 14 Tagen",
  upcoming: "Bevorstehend",
  deadlinesTitle: "Wichtige Fristen",
  deadlinesEmpty: "Derzeit ist keine wichtige Frist gespeichert.",
  applicationDeadline: "Bewerbung",
  stepDeadline: "Schritt",
  programmesTitle: "Gespeicherte Studiengänge",
  programmesEmpty: "Noch kein Studiengang gespeichert.",
  programmesCta: "Studiengänge ansehen",
  documentsTitle: "Fehlende Unterlagen",
  documentsEmpty: "Keine fehlenden oder zu korrigierenden Unterlagen markiert.",
  documentsCta: "Unterlagen ansehen",
  missing: "Fehlt",
  toFix: "Korrigieren",
  applicationsTitle: "Laufende Bewerbungen",
  applicationsEmpty: "Keine aktive Bewerbung.",
  applicationsCta: "Bewerbungen ansehen",
  activityTitle: "Letzte Aktivitäten",
  activityEmpty: "Keine aktuelle sichtbare Aktivität.",
  activityApplication: "Bewerbung aktualisiert",
  activityDocument: "Dokument hinzugefügt",
  activityProgramme: "Studiengang gespeichert",
  viewAll: "Alle ansehen",
};

const ar: CockpitCopy = {
  greeting: "مرحبًا",
  projectLabel: "مشروعك",
  germany: "ألمانيا",
  projectFallback: "مشروع الدراسة يحتاج إلى تحديد",
  progressEyebrow: "التقدم العام",
  progressTitle: "مشروعك يتقدم.",
  progressMeta: (done, total) => `اكتملت ${done} من ${total} خطوات`,
  nextActionReason: "لماذا الآن",
  duration: "المدة التقريبية",
  continue: "متابعة",
  durationDocuments: "10–15 دقيقة",
  durationApplication: "5–10 دقائق",
  durationChecklist: "10 دقائق",
  durationReview: "5 دقائق",
  documentsReason: (count) => `هناك ${count} ${count === 1 ? "وثيقة تحتاج" : "وثائق تحتاج"} إلى إجراء قبل المتابعة.`,
  applicationReason: "يوجد طلب تقديم نشط له خطوة تالية مسجلة.",
  checklistReason: "هذه هي الخطوة المفتوحة التالية في مسارك.",
  noActionReason: "لا توجد أولوية عاجلة الآن. يمكنك مراجعة الحالة العامة لملفك.",
  urgentDeadlineReason: "هناك موعد منتهٍ أو موعد خلال الأيام الأربعة عشر القادمة.",
  attentionEyebrow: "ما يجب مراقبته الآن",
  attentionTitle: "نقاط قد تؤخر ملفك",
  attentionDescription: "عالج أولًا العناصر العاجلة أو المعرقلة، ثم واصل باقي خطواتك.",
  overdueDeadlines: "مواعيد منتهية",
  dueSoonDeadlines: "مواعيد خلال 14 يومًا",
  documentsAttention: "وثائق تحتاج إلى إجراء",
  blockedApplications: "طلبات تقديم معرّقلة",
  overdue: "منتهٍ",
  dueSoon: "خلال 14 يومًا",
  upcoming: "قادم",
  deadlinesTitle: "المواعيد المهمة",
  deadlinesEmpty: "لا توجد مواعيد مهمة مسجلة حاليًا.",
  applicationDeadline: "طلب تقديم",
  stepDeadline: "خطوة",
  programmesTitle: "البرامج المحفوظة",
  programmesEmpty: "لا توجد برامج محفوظة حتى الآن.",
  programmesCta: "عرض البرامج",
  documentsTitle: "الوثائق الناقصة",
  documentsEmpty: "لا توجد وثائق ناقصة أو تحتاج إلى تصحيح.",
  documentsCta: "عرض وثائقي",
  missing: "ناقص",
  toFix: "يحتاج تصحيحًا",
  applicationsTitle: "طلبات التقديم الجارية",
  applicationsEmpty: "لا توجد طلبات تقديم نشطة.",
  applicationsCta: "عرض طلباتي",
  activityTitle: "النشاط الأخير",
  activityEmpty: "لا يوجد نشاط حديث ظاهر.",
  activityApplication: "تم تحديث طلب تقديم",
  activityDocument: "تمت إضافة وثيقة",
  activityProgramme: "تم حفظ برنامج",
  viewAll: "عرض الكل",
};

export const studentDashboardCockpitCopy: Record<Locale, CockpitCopy> = { fr, ar, en, de };
