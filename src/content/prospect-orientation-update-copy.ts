import type { Locale } from "@/lib/i18n";

export type ProspectOrientationUpdateCopy = {
  introEyebrow: string;
  introTitle: string;
  introLead: string;
  introNotice: string;
  eyebrow: string;
  title: string;
  text: string;
  save: string;
  saving: string;
  successTitle: string;
  successText: string;
  returnSpace: string;
  error: string;
};

const fr: ProspectOrientationUpdateCopy = {
  introEyebrow: "Mettre à jour mon projet",
  introTitle: "Actualisez uniquement ce qui a changé.",
  introLead: "Votre dernière orientation est préremplie. Modifiez votre Bac, votre moyenne, vos langues, votre budget ou votre objectif si nécessaire.",
  introNotice: "L’enregistrement ajoute une nouvelle version à votre historique. Votre orientation précédente n’est pas écrasée.",
  eyebrow: "Mise à jour du projet",
  title: "Enregistrer cette nouvelle orientation",
  text: "Votre orientation précédente restera dans votre historique. Après l’enregistrement, le tableau de bord, le catalogue, la roadmap et la proposition seront recalculés à partir de cette nouvelle version.",
  save: "Enregistrer et actualiser mon espace",
  saving: "Enregistrement…",
  successTitle: "Votre projet est mis à jour",
  successText: "La nouvelle orientation et sa roadmap ont été recalculées. Les versions précédentes restent conservées.",
  returnSpace: "Voir mon espace gratuit",
  error: "La mise à jour n’a pas pu être enregistrée. Vérifiez votre connexion puis réessayez.",
};

const ar: ProspectOrientationUpdateCopy = {
  introEyebrow: "تحديث مشروعي",
  introTitle: "عدّل فقط المعلومات التي تغيّرت.",
  introLead: "تم ملء آخر توجيه تلقائيًا. عدّل البكالوريا أو المعدل أو اللغات أو الميزانية أو الهدف عند الحاجة.",
  introNotice: "عند الحفظ تُضاف نسخة جديدة إلى السجل، ولا يتم حذف التوجيه السابق أو الكتابة فوقه.",
  eyebrow: "تحديث المشروع",
  title: "حفظ هذا التوجيه الجديد",
  text: "سيبقى توجيهك السابق في السجل. بعد الحفظ سيتم تحديث لوحة التحكم والكتالوج وخارطة الطريق والاقتراح انطلاقًا من هذه النسخة الجديدة.",
  save: "حفظ التحديث وتحديث مساحتي",
  saving: "جارٍ الحفظ…",
  successTitle: "تم تحديث مشروعك",
  successText: "أُعيد حساب التوجيه الجديد وخارطة الطريق، مع الاحتفاظ بالنسخ السابقة.",
  returnSpace: "عرض مساحتي المجانية",
  error: "تعذر حفظ التحديث. تحقق من الاتصال ثم حاول من جديد.",
};

const en: ProspectOrientationUpdateCopy = {
  introEyebrow: "Update my project",
  introTitle: "Change only what is new.",
  introLead: "Your latest orientation is prefilled. Update your Baccalaureate, average, languages, budget or study goal where needed.",
  introNotice: "Saving adds a new version to your history. Your previous orientation is not overwritten.",
  eyebrow: "Project update",
  title: "Save this new orientation",
  text: "Your previous orientation will stay in your history. After saving, your dashboard, catalogue, roadmap and proposal will be recalculated from this new version.",
  save: "Save and refresh my space",
  saving: "Saving…",
  successTitle: "Your project is updated",
  successText: "The new orientation and roadmap were recalculated. Earlier versions remain in your history.",
  returnSpace: "View my free space",
  error: "The update could not be saved. Check your connection and try again.",
};

const de: ProspectOrientationUpdateCopy = {
  introEyebrow: "Projekt aktualisieren",
  introTitle: "Ändere nur, was sich verändert hat.",
  introLead: "Deine letzte Orientierung ist vorausgefüllt. Aktualisiere Baccalauréat, Durchschnitt, Sprachen, Budget oder Studienziel bei Bedarf.",
  introNotice: "Beim Speichern wird eine neue Version zum Verlauf hinzugefügt. Die bisherige Orientierung wird nicht überschrieben.",
  eyebrow: "Projekt aktualisieren",
  title: "Diese neue Orientierung speichern",
  text: "Deine bisherige Orientierung bleibt im Verlauf. Nach dem Speichern werden Dashboard, Katalog, Roadmap und Vorschlag anhand dieser neuen Version neu berechnet.",
  save: "Speichern und Bereich aktualisieren",
  saving: "Wird gespeichert…",
  successTitle: "Dein Projekt wurde aktualisiert",
  successText: "Orientierung und Roadmap wurden neu berechnet. Frühere Versionen bleiben erhalten.",
  returnSpace: "Kostenlosen Bereich öffnen",
  error: "Die Aktualisierung konnte nicht gespeichert werden. Prüfe die Verbindung und versuche es erneut.",
};

export const prospectOrientationUpdateCopy: Record<Locale, ProspectOrientationUpdateCopy> = {
  fr,
  ar,
  en,
  de,
};
