import type { Locale } from "@/lib/i18n";

type OrientationActivationCopy = {
  eyebrow: string;
  title: string;
  working: string;
  success: string;
  failure: string;
  viewOrientation: string;
  freeAccountNote: string;
};

const fr: OrientationActivationCopy = {
  eyebrow: "Espace gratuit",
  title: "Rattacher votre orientation",
  working: "Nous rattachons votre orientation à votre compte…",
  success: "Votre orientation est maintenant rattachée à votre compte.",
  failure: "Le rattachement n’a pas pu être effectué. Vérifiez que vous utilisez le même e-mail que celui de l’orientation et que le lien est encore valide.",
  viewOrientation: "Retrouver mon orientation",
  freeAccountNote: "Votre compte reste un compte gratuit. Aucun accompagnement payant n’est activé.",
};

const ar: OrientationActivationCopy = {
  eyebrow: "المساحة المجانية",
  title: "ربط توجيهك بحسابك",
  working: "جارٍ ربط توجيهك بحسابك…",
  success: "تم ربط توجيهك بحسابك.",
  failure: "تعذر ربط التوجيه. تأكد من استعمال نفس البريد الإلكتروني وأن الرابط ما زال صالحًا.",
  viewOrientation: "عرض توجيهي",
  freeAccountNote: "يبقى حسابك مجانيًا. لم يتم تفعيل أي خدمة مرافقة مدفوعة.",
};

const en: OrientationActivationCopy = {
  eyebrow: "Free space",
  title: "Link your orientation",
  working: "We are linking your orientation to your account…",
  success: "Your orientation is now linked to your account.",
  failure: "The orientation could not be linked. Make sure you are using the same email address and that the link is still valid.",
  viewOrientation: "View my orientation",
  freeAccountNote: "Your account remains free. No paid support has been activated.",
};

const de: OrientationActivationCopy = {
  eyebrow: "Kostenloser Bereich",
  title: "Orientierung verknüpfen",
  working: "Wir verknüpfen deine Orientierung mit deinem Konto…",
  success: "Deine Orientierung ist jetzt mit deinem Konto verknüpft.",
  failure: "Die Orientierung konnte nicht verknüpft werden. Verwende dieselbe E-Mail-Adresse und prüfe, ob der Link noch gültig ist.",
  viewOrientation: "Meine Orientierung ansehen",
  freeAccountNote: "Dein Konto bleibt kostenlos. Es wurde keine kostenpflichtige Begleitung aktiviert.",
};

export const orientationActivationCopy: Record<Locale, OrientationActivationCopy> = {
  fr,
  ar,
  en,
  de,
};
