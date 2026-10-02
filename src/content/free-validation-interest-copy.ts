import type { Locale } from "@/lib/i18n";

type FreeValidationInterestConfirmationCopy = {
  eyebrow: string;
  title: string;
  text: string;
  button: string;
  saving: string;
  successTitle: string;
  successText: string;
  error: string;
  home: string;
  privacyNote: string;
};

export const freeValidationInterestConfirmationCopy: Record<
  Locale,
  FreeValidationInterestConfirmationCopy
> = {
  fr: {
    eyebrow: "Free Validation",
    title: "Confirmer que vous souhaitez continuer",
    text: "Ce bouton indique à Campus Allemagne que vous souhaitez que votre projet soit considéré pour la prochaine étape ou un futur pilote gratuit. Aucun paiement n’est demandé et aucun accès documents n’est ouvert automatiquement.",
    button: "Oui, je veux continuer avec Campus Allemagne",
    saving: "Enregistrement…",
    successTitle: "Votre intérêt est enregistré",
    successText: "Campus Allemagne pourra examiner votre projet pour la prochaine étape. Cette confirmation ne constitue ni une admission, ni une garantie de visa, ni un engagement de paiement.",
    error: "Nous n’avons pas pu enregistrer votre choix. Vérifiez que le lien est toujours valide puis réessayez.",
    home: "Retour à l’accueil",
    privacyNote: "Le simple fait d’ouvrir cette page n’enregistre aucune demande. Seul le bouton ci-dessus confirme votre choix.",
  },
  ar: {
    eyebrow: "مرحلة التحقق المجاني",
    title: "أكد أنك ترغب في المتابعة",
    text: "هذا الزر يخبر Campus Allemagne بأنك ترغب في أن نأخذ مشروعك بعين الاعتبار للمرحلة التالية أو لبرنامج تجريبي مجاني مستقبلاً. لا يوجد أي دفع ولا يتم فتح مساحة الوثائق تلقائيًا.",
    button: "نعم، أريد المتابعة مع Campus Allemagne",
    saving: "جارٍ التسجيل…",
    successTitle: "تم تسجيل اهتمامك",
    successText: "يمكن لـ Campus Allemagne مراجعة مشروعك للمرحلة التالية. هذا التأكيد لا يمثل قبولًا جامعيًا أو ضمانًا للتأشيرة أو التزامًا بالدفع.",
    error: "تعذر تسجيل اختيارك. تحقق من أن الرابط ما زال صالحًا ثم حاول مرة أخرى.",
    home: "العودة إلى الصفحة الرئيسية",
    privacyNote: "مجرد فتح هذه الصفحة لا يسجل أي طلب. الضغط على الزر أعلاه وحده يؤكد اختيارك.",
  },
  en: {
    eyebrow: "Free Validation",
    title: "Confirm that you want to continue",
    text: "This button tells Campus Allemagne that you want your project to be considered for the next step or a future free pilot. No payment is requested and document access is not opened automatically.",
    button: "Yes, I want to continue with Campus Allemagne",
    saving: "Recording…",
    successTitle: "Your interest has been recorded",
    successText: "Campus Allemagne can review your project for the next step. This confirmation is not an admission decision, a visa guarantee or a payment commitment.",
    error: "We could not record your choice. Check that the link is still valid and try again.",
    home: "Back to home",
    privacyNote: "Simply opening this page records no request. Only the button above confirms your choice.",
  },
  de: {
    eyebrow: "Free Validation",
    title: "Bestätige, dass du weitermachen möchtest",
    text: "Mit diesem Button teilst du Campus Allemagne mit, dass dein Projekt für den nächsten Schritt oder einen zukünftigen kostenlosen Pilot berücksichtigt werden soll. Es wird keine Zahlung verlangt und der Dokumentenbereich wird nicht automatisch freigeschaltet.",
    button: "Ja, ich möchte mit Campus Allemagne weitermachen",
    saving: "Wird gespeichert…",
    successTitle: "Dein Interesse wurde gespeichert",
    successText: "Campus Allemagne kann dein Projekt für den nächsten Schritt prüfen. Diese Bestätigung ist weder eine Zulassung noch eine Visumgarantie oder Zahlungsverpflichtung.",
    error: "Deine Auswahl konnte nicht gespeichert werden. Prüfe, ob der Link noch gültig ist, und versuche es erneut.",
    home: "Zur Startseite",
    privacyNote: "Allein das Öffnen dieser Seite speichert keine Anfrage. Erst der Button oben bestätigt deine Auswahl.",
  },
};
