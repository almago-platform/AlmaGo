import type { Locale } from "@/lib/i18n";

type WorkspaceCopy = {
  checklistEyebrow: string;
  checklistTitle: string;
  checklistDescription: string;
  validatedCount: (ready: number, total: number) => string;
  groups: {
    identity: string;
    academic: string;
    languages: string;
    application: string;
    visa: string;
  };
  groupReady: string;
  groupReview: string;
  groupAction: string;
  groupPrepare: string;
  groupDocuments: string;
  groupEmpty: string;
  nextAction: string;
  nextCorrection: string;
  nextReview: string;
  nextUpload: string;
  nextStart: string;
  filtersAria: string;
  statusFilter: string;
  categoryFilter: string;
  all: string;
  action: string;
  review: string;
  approved: string;
  filteredCount: (visible: number, total: number) => string;
  filteredEmptyTitle: string;
  filteredEmptyText: string;
};

const fr: WorkspaceCopy = {
  checklistEyebrow: "Checklist intelligente",
  checklistTitle: "Ton dossier, catégorie par catégorie",
  checklistDescription: "Vois immédiatement ce qui est validé, en vérification ou demande une action. Les exigences supplémentaires apparaissent seulement lorsqu’elles deviennent pertinentes pour ton parcours.",
  validatedCount: (ready, total) => `${ready} / ${total} document${total > 1 ? "s" : ""} validé${ready > 1 ? "s" : ""}`,
  groups: {
    identity: "Identité",
    academic: "Académique",
    languages: "Langues",
    application: "Candidature",
    visa: "Visa & préparation",
  },
  groupReady: "Prêt",
  groupReview: "À vérifier",
  groupAction: "Action requise",
  groupPrepare: "À préparer",
  groupDocuments: "documents de cette catégorie",
  groupEmpty: "aucun document envoyé pour l’instant",
  nextAction: "Prochaine action",
  nextCorrection: "Corrige d’abord le document signalé par l’équipe AlmaGo.",
  nextReview: "Tes documents envoyés sont en vérification. Tu peux continuer les autres étapes de ton projet.",
  nextUpload: "Ajoute uniquement le prochain document demandé par ton parcours ou une candidature.",
  nextStart: "Commence par les documents essentiels indiqués dans ton parcours.",
  filtersAria: "Filtres de documents",
  statusFilter: "Filtrer par statut",
  categoryFilter: "Filtrer par catégorie",
  all: "Tous",
  action: "À traiter",
  review: "En vérification",
  approved: "Validés",
  filteredCount: (visible, total) => visible === total ? `${total} document${total > 1 ? "s" : ""}` : `${visible} sur ${total} documents`,
  filteredEmptyTitle: "Aucun document ne correspond à ces filtres.",
  filteredEmptyText: "Modifie le statut ou la catégorie pour afficher d’autres documents.",
};

const ar: WorkspaceCopy = {
  checklistEyebrow: "قائمة الوثائق الذكية",
  checklistTitle: "ملفك حسب الفئة",
  checklistDescription: "اعرف فورًا ما تم قبوله وما هو قيد المراجعة وما يحتاج إلى إجراء. تظهر المتطلبات الإضافية فقط عندما تصبح ضرورية لمسارك.",
  validatedCount: (ready, total) => `${ready} / ${total} وثيقة معتمدة`,
  groups: {
    identity: "الهوية",
    academic: "أكاديمي",
    languages: "اللغات",
    application: "الترشح",
    visa: "التأشيرة والتحضير",
  },
  groupReady: "جاهز",
  groupReview: "قيد المراجعة",
  groupAction: "إجراء مطلوب",
  groupPrepare: "للتحضير",
  groupDocuments: "وثائق في هذه الفئة",
  groupEmpty: "لم يتم إرسال أي وثيقة بعد",
  nextAction: "الخطوة التالية",
  nextCorrection: "صحّح أولاً الوثيقة التي أشار إليها فريق AlmaGo.",
  nextReview: "وثائقك المرسلة قيد المراجعة. يمكنك متابعة بقية خطوات مشروعك.",
  nextUpload: "أضف فقط الوثيقة التالية المطلوبة لمسارك أو لترشحك.",
  nextStart: "ابدأ بالوثائق الأساسية الموضحة في مسارك.",
  filtersAria: "فلاتر الوثائق",
  statusFilter: "التصفية حسب الحالة",
  categoryFilter: "التصفية حسب الفئة",
  all: "الكل",
  action: "تحتاج إلى إجراء",
  review: "قيد المراجعة",
  approved: "معتمدة",
  filteredCount: (visible, total) => visible === total ? `${total} وثيقة` : `${visible} من ${total} وثيقة`,
  filteredEmptyTitle: "لا توجد وثائق مطابقة لهذه الفلاتر.",
  filteredEmptyText: "غيّر الحالة أو الفئة لعرض وثائق أخرى.",
};

const en: WorkspaceCopy = {
  checklistEyebrow: "Smart checklist",
  checklistTitle: "Your dossier, category by category",
  checklistDescription: "See immediately what is approved, under review or needs action. Additional requirements appear only when they become relevant to your journey.",
  validatedCount: (ready, total) => `${ready} / ${total} document${total === 1 ? "" : "s"} approved`,
  groups: {
    identity: "Identity",
    academic: "Academic",
    languages: "Languages",
    application: "Application",
    visa: "Visa & preparation",
  },
  groupReady: "Ready",
  groupReview: "Under review",
  groupAction: "Action required",
  groupPrepare: "To prepare",
  groupDocuments: "documents in this category",
  groupEmpty: "no document uploaded yet",
  nextAction: "Next action",
  nextCorrection: "Fix the document flagged by the AlmaGo team first.",
  nextReview: "Your uploaded documents are under review. You can continue with the other steps of your project.",
  nextUpload: "Upload only the next document required by your journey or an application.",
  nextStart: "Start with the essential documents shown in your journey.",
  filtersAria: "Document filters",
  statusFilter: "Filter by status",
  categoryFilter: "Filter by category",
  all: "All",
  action: "Needs action",
  review: "Under review",
  approved: "Approved",
  filteredCount: (visible, total) => visible === total ? `${total} document${total === 1 ? "" : "s"}` : `${visible} of ${total} documents`,
  filteredEmptyTitle: "No documents match these filters.",
  filteredEmptyText: "Change the status or category to show other documents.",
};

const de: WorkspaceCopy = {
  checklistEyebrow: "Intelligente Checkliste",
  checklistTitle: "Deine Akte nach Kategorien",
  checklistDescription: "Sieh sofort, was geprüft ist, was gerade geprüft wird und wo du handeln musst. Zusätzliche Anforderungen erscheinen nur, wenn sie für deinen Weg relevant werden.",
  validatedCount: (ready, total) => `${ready} / ${total} Dokument${total === 1 ? "" : "e"} geprüft`,
  groups: {
    identity: "Identität",
    academic: "Akademisch",
    languages: "Sprachen",
    application: "Bewerbung",
    visa: "Visum & Vorbereitung",
  },
  groupReady: "Bereit",
  groupReview: "Wird geprüft",
  groupAction: "Aktion erforderlich",
  groupPrepare: "Vorbereiten",
  groupDocuments: "Dokumente in dieser Kategorie",
  groupEmpty: "noch kein Dokument hochgeladen",
  nextAction: "Nächste Aktion",
  nextCorrection: "Korrigiere zuerst das von AlmaGo markierte Dokument.",
  nextReview: "Deine hochgeladenen Unterlagen werden geprüft. Du kannst mit den anderen Schritten deines Projekts fortfahren.",
  nextUpload: "Lade nur die nächste Unterlage hoch, die für deinen Weg oder eine Bewerbung benötigt wird.",
  nextStart: "Beginne mit den grundlegenden Unterlagen aus deinem Studienweg.",
  filtersAria: "Dokumentfilter",
  statusFilter: "Nach Status filtern",
  categoryFilter: "Nach Kategorie filtern",
  all: "Alle",
  action: "Handlungsbedarf",
  review: "Wird geprüft",
  approved: "Geprüft",
  filteredCount: (visible, total) => visible === total ? `${total} Dokument${total === 1 ? "" : "e"}` : `${visible} von ${total} Dokumenten`,
  filteredEmptyTitle: "Keine Unterlagen entsprechen diesen Filtern.",
  filteredEmptyText: "Ändere den Status oder die Kategorie, um andere Unterlagen anzuzeigen.",
};

export const studentDocumentsWorkspaceCopy: Record<Locale, WorkspaceCopy> = { fr, ar, en, de };
