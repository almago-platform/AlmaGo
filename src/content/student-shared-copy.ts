import type { Locale } from "@/lib/i18n";

export const studentSharedCopy: Record<Locale, {
  journeyAria: string;
  journeySteps: readonly string[];
  resourceEyebrow: string;
  resourceAria: string;
  resourceLinks: readonly string[];
  overview: {
    eyebrow: string;
    title: string;
    intro: string;
    completed: string;
    active: string;
    done: string;
    inProgress: string;
    upcoming: string;
    open: string;
  };
}> = {
  fr: {
    journeyAria: "Étapes de mon dossier",
    journeySteps: ["Mon projet", "Documents", "Programmes", "Démarches", "Candidatures", "Mon dossier", "Parcours"],
    resourceEyebrow: "Pour préparer votre projet",
    resourceAria: "Ressources liées au parcours Allemagne",
    resourceLinks: ["Parcours", "Cours de langue", "Finance & assurance"],
    overview: {
      eyebrow: "Parcours du dossier",
      title: "Voici où en est votre dossier.",
      intro: "Voyez ce qui est fait, ce qui est en cours et votre prochaine étape.",
      completed: "étapes terminées",
      active: "Étape en cours",
      done: "Terminé",
      inProgress: "En cours",
      upcoming: "À venir",
      open: "Ouvrir",
    },
  },
  ar: {
    journeyAria: "خطوات ملفي",
    journeySteps: ["مشروعي", "المستندات", "البرامج", "الخطوات", "طلبات التقديم", "ملفي", "المسار"],
    resourceEyebrow: "لتحضير مشروعك",
    resourceAria: "موارد مرتبطة بمسار الدراسة في ألمانيا",
    resourceLinks: ["المسار", "دورات اللغة", "التمويل والتأمين"],
    overview: {
      eyebrow: "تقدم الملف",
      title: "اعرف أين وصلت.",
      intro: "راجع ما أنجزته، وما يجري الآن، وما الخطوة التالية.",
      completed: "خطوات مكتملة",
      active: "الخطوة الحالية",
      done: "مكتمل",
      inProgress: "قيد المتابعة",
      upcoming: "لاحقًا",
      open: "افتح",
    },
  },
  en: {
    journeyAria: "Steps in my file",
    journeySteps: ["My plan", "Documents", "Programmes", "Steps", "Applications", "My file", "Journey"],
    resourceEyebrow: "To prepare your plan",
    resourceAria: "Resources for your Germany study journey",
    resourceLinks: ["Journey", "Language courses", "Funding & insurance"],
    overview: {
      eyebrow: "Your file journey",
      title: "See where your file stands.",
      intro: "See what is done, what is in progress and what comes next.",
      completed: "steps completed",
      active: "Current step",
      done: "Done",
      inProgress: "In progress",
      upcoming: "Coming up",
      open: "Open",
    },
  },
  de: {
    journeyAria: "Schritte in meiner Akte",
    journeySteps: ["Mein Plan", "Unterlagen", "Studiengänge", "Schritte", "Bewerbungen", "Meine Akte", "Studienweg"],
    resourceEyebrow: "Für deine Vorbereitung",
    resourceAria: "Ressourcen für deinen Studienweg in Deutschland",
    resourceLinks: ["Studienweg", "Sprachkurse", "Finanzierung & Versicherung"],
    overview: {
      eyebrow: "Stand deiner Akte",
      title: "Hier siehst du, wo deine Akte steht.",
      intro: "Sieh, was erledigt ist, was gerade läuft und was als Nächstes kommt.",
      completed: "Schritte erledigt",
      active: "Aktueller Schritt",
      done: "Erledigt",
      inProgress: "In Arbeit",
      upcoming: "Später",
      open: "Öffnen",
    },
  },
};
