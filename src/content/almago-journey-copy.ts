import type { Locale } from "@/lib/i18n";

export type AlmagoJourneyCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  goal: string;
  completed: string;
  remaining: string;
  nextAction: string;
  blocker: string;
  open: string;
  statuses: {
    completed: string;
    current: string;
    upcoming: string;
    blocked: string;
  };
  steps: {
    project: string;
    profile: string;
    documents: string;
    programmes: string;
    applications: string;
    admission: string;
    visa: string;
    departure: string;
  };
  blockerAdmission: string;
  blockerDocuments: string;
  blockerApplications: string;
};

const fr: AlmagoJourneyCopy = {
  eyebrow: "Almago Journey",
  title: "Ton chemin vers l’Allemagne",
  intro: "Chaque étape franchie rapproche ton dossier de l’objectif final.",
  goal: "Objectif final · Départ",
  completed: "étapes franchies",
  remaining: "tâches restantes",
  nextAction: "Prochaine action",
  blocker: "Blocage",
  open: "Ouvrir",
  statuses: {
    completed: "Terminé",
    current: "En cours",
    upcoming: "À venir",
    blocked: "Bloqué",
  },
  steps: {
    project: "Projet",
    profile: "Profil",
    documents: "Documents",
    programmes: "Programmes",
    applications: "Candidatures",
    admission: "Admission",
    visa: "Visa & préparation",
    departure: "Départ",
  },
  blockerAdmission: "Une admission doit être enregistrée avant de préparer cette étape.",
  blockerDocuments: "Un ou plusieurs documents demandent une correction.",
  blockerApplications: "Des documents manquent dans une candidature active.",
};

const en: AlmagoJourneyCopy = {
  eyebrow: "Almago Journey",
  title: "Your path to Germany",
  intro: "Every completed step moves your file closer to the final goal.",
  goal: "Final goal · Departure",
  completed: "steps completed",
  remaining: "tasks remaining",
  nextAction: "Next action",
  blocker: "Blocker",
  open: "Open",
  statuses: {
    completed: "Completed",
    current: "Current",
    upcoming: "Upcoming",
    blocked: "Blocked",
  },
  steps: {
    project: "Project",
    profile: "Profile",
    documents: "Documents",
    programmes: "Programmes",
    applications: "Applications",
    admission: "Admission",
    visa: "Visa & preparation",
    departure: "Departure",
  },
  blockerAdmission: "An admission must be recorded before this stage can move forward.",
  blockerDocuments: "One or more documents need correction.",
  blockerApplications: "An active application is missing documents.",
};

const de: AlmagoJourneyCopy = {
  eyebrow: "Almago Journey",
  title: "Dein Weg nach Deutschland",
  intro: "Jeder abgeschlossene Schritt bringt deine Akte näher ans Ziel.",
  goal: "Ziel · Abreise",
  completed: "Schritte geschafft",
  remaining: "offene Aufgaben",
  nextAction: "Nächste Aktion",
  blocker: "Blockierung",
  open: "Öffnen",
  statuses: {
    completed: "Erledigt",
    current: "Aktuell",
    upcoming: "Später",
    blocked: "Blockiert",
  },
  steps: {
    project: "Projekt",
    profile: "Profil",
    documents: "Unterlagen",
    programmes: "Studiengänge",
    applications: "Bewerbungen",
    admission: "Zulassung",
    visa: "Visum & Vorbereitung",
    departure: "Abreise",
  },
  blockerAdmission: "Vor diesem Schritt muss eine Zulassung eingetragen sein.",
  blockerDocuments: "Ein oder mehrere Dokumente müssen korrigiert werden.",
  blockerApplications: "In einer aktiven Bewerbung fehlen Unterlagen.",
};

const ar: AlmagoJourneyCopy = {
  eyebrow: "Almago Journey",
  title: "طريقك نحو ألمانيا",
  intro: "كل خطوة مكتملة تقرّب ملفك من الهدف النهائي.",
  goal: "الهدف النهائي · السفر",
  completed: "خطوات مكتملة",
  remaining: "مهام متبقية",
  nextAction: "الخطوة التالية",
  blocker: "عائق",
  open: "فتح",
  statuses: {
    completed: "مكتمل",
    current: "الحالي",
    upcoming: "لاحقًا",
    blocked: "متوقف",
  },
  steps: {
    project: "المشروع",
    profile: "الملف الشخصي",
    documents: "الوثائق",
    programmes: "البرامج",
    applications: "طلبات التقديم",
    admission: "القبول",
    visa: "التأشيرة والتحضير",
    departure: "السفر",
  },
  blockerAdmission: "يجب تسجيل قبول قبل الانتقال إلى هذه المرحلة.",
  blockerDocuments: "هناك وثيقة أو أكثر تحتاج إلى تصحيح.",
  blockerApplications: "هناك وثائق ناقصة في طلب تقديم نشط.",
};

export const almagoJourneyCopy: Record<Locale, AlmagoJourneyCopy> = { fr, ar, en, de };
