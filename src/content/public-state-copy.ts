import type { Locale } from "@/lib/i18n";

type PublicStateCopy = {
  notFound: {
    eyebrow: string;
    title: string;
    text: string;
    home: string;
    contact: string;
    homeAria: string;
  };
  error: {
    eyebrow: string;
    title: string;
    text: string;
    retry: string;
    home: string;
    homeAria: string;
  };
};

export const publicStateCopy: Record<Locale, PublicStateCopy> = {
  fr: {
    notFound: {
      eyebrow: "Page introuvable",
      title: "Cette page n’existe pas ou a été déplacée.",
      text: "Vous pouvez revenir à l’accueil ou nous écrire si vous cherchiez une information précise.",
      home: "Retour à l’accueil",
      contact: "Nous contacter",
      homeAria: "Retour à l’accueil AlmaGo",
    },
    error: {
      eyebrow: "Un problème est survenu",
      title: "La page n’a pas pu s’afficher correctement.",
      text: "Réessayez dans un instant. Rien n’a été modifié dans votre dossier à cause de cet écran.",
      retry: "Réessayer",
      home: "Retour à l’accueil",
      homeAria: "Retour à l’accueil AlmaGo",
    },
  },
  ar: {
    notFound: {
      eyebrow: "الصفحة غير موجودة",
      title: "هذه الصفحة غير موجودة أو تم نقلها.",
      text: "يمكنك العودة إلى الصفحة الرئيسية أو التواصل معنا إذا كنت تبحث عن معلومة محددة.",
      home: "العودة إلى الرئيسية",
      contact: "تواصل معنا",
      homeAria: "العودة إلى الصفحة الرئيسية لـ AlmaGo",
    },
    error: {
      eyebrow: "حدثت مشكلة",
      title: "تعذر عرض الصفحة بشكل صحيح.",
      text: "حاول مرة أخرى بعد قليل. لم يتم تعديل أي شيء في ملفك بسبب هذه الشاشة.",
      retry: "حاول مرة أخرى",
      home: "العودة إلى الرئيسية",
      homeAria: "العودة إلى الصفحة الرئيسية لـ AlmaGo",
    },
  },
  en: {
    notFound: {
      eyebrow: "Page not found",
      title: "This page does not exist or has moved.",
      text: "You can go back home or contact us if you were looking for something specific.",
      home: "Back to home",
      contact: "Contact us",
      homeAria: "Back to AlmaGo home",
    },
    error: {
      eyebrow: "Something went wrong",
      title: "This page could not be displayed correctly.",
      text: "Please try again shortly. Nothing in your file was changed because of this screen.",
      retry: "Try again",
      home: "Back to home",
      homeAria: "Back to AlmaGo home",
    },
  },
  de: {
    notFound: {
      eyebrow: "Seite nicht gefunden",
      title: "Diese Seite existiert nicht oder wurde verschoben.",
      text: "Du kannst zur Startseite zurückkehren oder uns schreiben, wenn du etwas Bestimmtes gesucht hast.",
      home: "Zur Startseite",
      contact: "Kontakt",
      homeAria: "Zurück zur AlmaGo-Startseite",
    },
    error: {
      eyebrow: "Etwas ist schiefgelaufen",
      title: "Die Seite konnte nicht korrekt angezeigt werden.",
      text: "Versuche es gleich noch einmal. Wegen dieses Bildschirms wurde nichts in deiner Akte geändert.",
      retry: "Erneut versuchen",
      home: "Zur Startseite",
      homeAria: "Zurück zur AlmaGo-Startseite",
    },
  },
};
