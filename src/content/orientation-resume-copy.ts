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
  signupNote: "Facultatif. Le rattachement automatique de cette orientation au compte sera activé dans l’étape P2.4 avant toute mise en production.",
};

const ar: OrientationResumeCopy = {
  created: "تم إنشاء التوجيه في",
  validUntil: "الرابط الآمن صالح حتى",
  home: "العودة إلى Campus Allemagne",
  signup: "إنشاء مساحتي المجانية",
  signupNote: "اختياري. سيتم تفعيل الربط التلقائي بين هذا التوجيه والحساب في مرحلة P2.4 قبل أي إطلاق عام.",
};

const en: OrientationResumeCopy = {
  created: "Orientation created on",
  validUntil: "Secure link valid until",
  home: "Back to Campus Allemagne",
  signup: "Create my free space",
  signupNote: "Optional. Automatic linking of this orientation to the account will be enabled in P2.4 before any public rollout.",
};

const de: OrientationResumeCopy = {
  created: "Orientierung erstellt am",
  validUntil: "Sicherer Link gültig bis",
  home: "Zurück zu Campus Allemagne",
  signup: "Kostenlosen Bereich erstellen",
  signupNote: "Freiwillig. Die automatische Verknüpfung dieser Orientierung mit dem Konto wird in P2.4 vor jeder öffentlichen Aktivierung ergänzt.",
};

export const orientationResumeCopy: Record<Locale, OrientationResumeCopy> = { fr, ar, en, de };
