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
  text: "Votre orientation précédente restera dans votre historique. Cette version deviendra la plus récente dans votre espace gratuit.",
  save: "Enregistrer la mise à jour",
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
  text: "سيبقى توجيهك السابق في السجل، وستصبح هذه النسخة هي الأحدث في مساحتك المجانية.",
  save: "حفظ التحديث",
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
  text: "Your previous orientation will stay in your history. This version will become the latest one in your free space.",
  save: "Save the update",
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
  text: "Deine bisherige Orientierung bleibt im Verlauf. Diese Version wird die aktuelle Orientierung im kostenlosen Bereich.",
  save: "Aktualisierung speichern",
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
