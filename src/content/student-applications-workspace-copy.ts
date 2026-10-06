import type { Locale } from "@/lib/i18n";

type ApplicationsWorkspaceCopy = {
  pipelineEyebrow: string;
  pipelineTitle: string;
  pipelineDescription: string;
  stages: {
    preparing: string;
    ready: string;
    submitted: string;
    decision: string;
  };
  filtersAria: string;
  filterLabel: string;
  universityFilter: string;
  all: string;
  action: string;
  urgent: string;
  submitted: string;
  decision: string;
  visibleCount: (visible: number, total: number) => string;
  urgentBadge: string;
  overdueBadge: string;
  filteredEmptyTitle: string;
  filteredEmptyText: string;
  reset: string;
};

const fr: ApplicationsWorkspaceCopy = {
  pipelineEyebrow: "Pipeline candidatures",
  pipelineTitle: "Où en sont tes candidatures ?",
  pipelineDescription: "Repère rapidement ce qui est en préparation, prêt à partir, déjà envoyé ou arrivé à une décision.",
  stages: {
    preparing: "Préparation",
    ready: "Prêtes",
    submitted: "Envoyées / en attente",
    decision: "Décisions",
  },
  filtersAria: "Filtres des candidatures",
  filterLabel: "Filtrer les candidatures",
  universityFilter: "Filtrer par université",
  all: "Toutes",
  action: "À traiter",
  urgent: "Urgentes",
  submitted: "Envoyées",
  decision: "Décisions",
  visibleCount: (visible, total) => visible === total ? `${total} candidature${total > 1 ? "s" : ""}` : `${visible} sur ${total} candidatures`,
  urgentBadge: "Sous 14 jours",
  overdueBadge: "Deadline dépassée",
  filteredEmptyTitle: "Aucune candidature ne correspond à ces filtres.",
  filteredEmptyText: "Change le filtre ou l’université pour retrouver tes autres candidatures.",
  reset: "Réinitialiser",
};

const ar: ApplicationsWorkspaceCopy = {
  pipelineEyebrow: "مسار طلبات التقديم",
  pipelineTitle: "أين وصلت طلباتك؟",
  pipelineDescription: "اعرف بسرعة ما هو قيد التحضير أو جاهز للإرسال أو تم إرساله أو وصل إلى قرار.",
  stages: {
    preparing: "التحضير",
    ready: "جاهزة",
    submitted: "مرسلة / قيد الانتظار",
    decision: "القرارات",
  },
  filtersAria: "فلاتر طلبات التقديم",
  filterLabel: "تصفية طلبات التقديم",
  universityFilter: "التصفية حسب الجامعة",
  all: "الكل",
  action: "تحتاج إلى إجراء",
  urgent: "عاجلة",
  submitted: "مرسلة",
  decision: "قرارات",
  visibleCount: (visible, total) => visible === total ? `${total} طلب` : `${visible} من ${total} طلبات`,
  urgentBadge: "خلال 14 يومًا",
  overdueBadge: "انتهى الموعد",
  filteredEmptyTitle: "لا توجد طلبات مطابقة لهذه الفلاتر.",
  filteredEmptyText: "غيّر الفلتر أو الجامعة لعرض بقية طلباتك.",
  reset: "إعادة الضبط",
};

const en: ApplicationsWorkspaceCopy = {
  pipelineEyebrow: "Application pipeline",
  pipelineTitle: "Where are your applications now?",
  pipelineDescription: "See what is being prepared, ready to submit, already sent or has reached a decision.",
  stages: {
    preparing: "Preparing",
    ready: "Ready",
    submitted: "Submitted / waiting",
    decision: "Decisions",
  },
  filtersAria: "Application filters",
  filterLabel: "Filter applications",
  universityFilter: "Filter by university",
  all: "All",
  action: "Needs action",
  urgent: "Urgent",
  submitted: "Submitted",
  decision: "Decisions",
  visibleCount: (visible, total) => visible === total ? `${total} application${total === 1 ? "" : "s"}` : `${visible} of ${total} applications`,
  urgentBadge: "Within 14 days",
  overdueBadge: "Deadline passed",
  filteredEmptyTitle: "No applications match these filters.",
  filteredEmptyText: "Change the filter or university to show your other applications.",
  reset: "Reset",
};

const de: ApplicationsWorkspaceCopy = {
  pipelineEyebrow: "Bewerbungs-Pipeline",
  pipelineTitle: "Wo stehen deine Bewerbungen?",
  pipelineDescription: "Sieh sofort, was vorbereitet wird, einreichungsbereit ist, bereits versendet wurde oder eine Entscheidung erreicht hat.",
  stages: {
    preparing: "Vorbereitung",
    ready: "Bereit",
    submitted: "Versendet / wartet",
    decision: "Entscheidungen",
  },
  filtersAria: "Bewerbungsfilter",
  filterLabel: "Bewerbungen filtern",
  universityFilter: "Nach Hochschule filtern",
  all: "Alle",
  action: "Handlungsbedarf",
  urgent: "Dringend",
  submitted: "Versendet",
  decision: "Entscheidungen",
  visibleCount: (visible, total) => visible === total ? `${total} Bewerbung${total === 1 ? "" : "en"}` : `${visible} von ${total} Bewerbungen`,
  urgentBadge: "Innerhalb 14 Tagen",
  overdueBadge: "Frist abgelaufen",
  filteredEmptyTitle: "Keine Bewerbung entspricht diesen Filtern.",
  filteredEmptyText: "Ändere den Filter oder die Hochschule, um andere Bewerbungen anzuzeigen.",
  reset: "Zurücksetzen",
};

export const studentApplicationsWorkspaceCopy: Record<Locale, ApplicationsWorkspaceCopy> = { fr, ar, en, de };
