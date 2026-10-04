import type { Locale } from "@/lib/i18n";

type OrientationResumeCopy = {
  created: string;
  validUntil: string;
  home: string;
  signup: string;
  signupNote: string;
};

const fr: OrientationResumeCopy = {
  created: "Orientation créée le",
  validUntil: "Lien sécurisé valable jusqu’au",
  home: "Retour à Campus Allemagne",
  signup: "Continuer ma procédure et créer mon compte",
  signupNote: "Votre orientation sera rattachée à votre espace étudiant gratuit. Vous pourrez reprendre votre parcours sans recommencer. Aucun accompagnement payant n’est activé automatiquement.",
};

const ar: OrientationResumeCopy = {
  created: "تم إنشاء التوجيه في",
  validUntil: "الرابط الآمن صالح حتى",
  home: "العودة إلى Campus Allemagne",
  signup: "متابعة إجراءاتي وإنشاء حسابي",
  signupNote: "سيتم ربط هذا التوجيه بمساحتك الطلابية المجانية لتواصل المسار من دون البدء من جديد. لا يتم تفعيل أي خدمة مدفوعة تلقائيًا.",
};

const en: OrientationResumeCopy = {
  created: "Orientation created on",
  validUntil: "Secure link valid until",
  home: "Back to Campus Allemagne",
  signup: "Continue my procedure and create my account",
  signupNote: "This orientation will be attached to your free student space so you can continue without starting again. No paid support is activated automatically.",
};

const de: OrientationResumeCopy = {
  created: "Orientierung erstellt am",
  validUntil: "Sicherer Link gültig bis",
  home: "Zurück zu Campus Allemagne",
  signup: "Verfahren fortsetzen und Konto erstellen",
  signupNote: "Diese Orientierung wird mit deinem kostenlosen Studierendenbereich verknüpft, damit du ohne Neustart weitermachen kannst. Eine kostenpflichtige Begleitung wird nicht automatisch aktiviert.",
};

export const orientationResumeCopy: Record<Locale, OrientationResumeCopy> = { fr, ar, en, de };
