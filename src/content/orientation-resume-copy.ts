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
  signup: "Créer mon espace gratuit",
  signupNote: "Facultatif. Si vous créez ou utilisez un compte avec ce lien, cette orientation y sera rattachée. Aucun accompagnement payant n’est activé.",
};

const ar: OrientationResumeCopy = {
  created: "تم إنشاء التوجيه في",
  validUntil: "الرابط الآمن صالح حتى",
  home: "العودة إلى Campus Allemagne",
  signup: "إنشاء مساحتي المجانية",
  signupNote: "اختياري. إذا أنشأت حسابًا أو استخدمت حسابك عبر هذا الرابط، فسيتم ربط هذا التوجيه به. لا يتم تفعيل أي خدمة مدفوعة.",
};

const en: OrientationResumeCopy = {
  created: "Orientation created on",
  validUntil: "Secure link valid until",
  home: "Back to Campus Allemagne",
  signup: "Create my free space",
  signupNote: "Optional. If you create or use an account through this link, this orientation will be linked to it. No paid support is activated.",
};

const de: OrientationResumeCopy = {
  created: "Orientierung erstellt am",
  validUntil: "Sicherer Link gültig bis",
  home: "Zurück zu Campus Allemagne",
  signup: "Kostenlosen Bereich erstellen",
  signupNote: "Freiwillig. Wenn du über diesen Link ein Konto erstellst oder nutzt, wird diese Orientierung damit verknüpft. Es wird keine kostenpflichtige Begleitung aktiviert.",
};

export const orientationResumeCopy: Record<Locale, OrientationResumeCopy> = { fr, ar, en, de };
