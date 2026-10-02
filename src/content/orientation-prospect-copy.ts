import type { Locale } from "@/lib/i18n";

export type OrientationProspectCopy = {
  report: {
    label: string;
    title: string;
    subtitle: string;
    print: string;
    printHelp: string;
  };
  capture: {
    eyebrow: string;
    title: string;
    text: string;
    emailLabel: string;
    privacyLabel: string;
    privacyLink: string;
    contactConsentLabel: string;
    contactConsentHelp: string;
    submit: string;
    sending: string;
    success: string;
    failure: string;
    invalidEmail: string;
    emailSubmit: string;
    sendingEmail: string;
    emailSent: string;
    deliveryFailure: string;
    interestEyebrow: string;
    interestTitle: string;
    interestText: string;
    interestSubmit: string;
    interestSaving: string;
    interestSuccess: string;
    interestFailure: string;
  };
};

const fr: OrientationProspectCopy = {
  report: {
    label: "Rapport Campus Allemagne",
    title: "Mon orientation Allemagne",
    subtitle: "Votre profil, vos pistes et les vérifications à faire avant de préparer un dossier.",
    print: "Enregistrer mon rapport en PDF",
    printHelp: "Le bouton ouvre l’impression du navigateur. Choisissez « Enregistrer au format PDF ».",
  },
  capture: {
    eyebrow: "Conserver mon orientation",
    title: "Sauvegarder avec mon e-mail",
    text: "Facultatif. Aucun compte n’est créé. Votre e-mail sert à rattacher cette orientation si vous décidez plus tard de créer votre espace gratuit.",
    emailLabel: "Adresse e-mail",
    privacyLabel: "J’ai lu l’information de confidentialité et je demande la sauvegarde de cette orientation.",
    privacyLink: "Confidentialité",
    contactConsentLabel: "J’accepte que Campus Allemagne me contacte au sujet de mon projet d’études.",
    contactConsentHelp: "Facultatif. Ce choix n’est pas nécessaire pour sauvegarder ou recevoir votre orientation.",
    submit: "Sauvegarder mon orientation",
    sending: "Sauvegarde…",
    success: "Orientation sauvegardée. Aucun compte n’a été créé.",
    failure: "La sauvegarde n’a pas fonctionné. Votre résultat reste disponible dans cet onglet.",
    invalidEmail: "Indiquez une adresse e-mail valide.",
    emailSubmit: "Recevoir mon orientation par e-mail",
    sendingEmail: "Envoi…",
    emailSent: "Orientation sauvegardée et e-mail envoyé. Aucun compte n’a été créé.",
    deliveryFailure: "Orientation sauvegardée, mais l’e-mail n’a pas pu être envoyé. Vous pouvez toujours enregistrer le rapport en PDF depuis cette page.",
    interestEyebrow: "Continuer avec nous",
    interestTitle: "Vous souhaitez aller plus loin avec Campus Allemagne ?",
    interestText: "Dites-le explicitement si vous souhaitez que votre projet soit considéré pour la prochaine étape ou un pilote gratuit. Aucun paiement n’est demandé et ce choix n’ouvre pas automatiquement l’espace documents.",
    interestSubmit: "Je veux continuer avec Campus Allemagne",
    interestSaving: "Enregistrement…",
    interestSuccess: "Votre intérêt est enregistré. Campus Allemagne pourra examiner votre projet pour la prochaine étape.",
    interestFailure: "Nous n’avons pas pu enregistrer ce choix. Vous pouvez réessayer.",
  },
};

const ar: OrientationProspectCopy = {
  report: {
    label: "تقرير Campus Allemagne",
    title: "توجيهي للدراسة في ألمانيا",
    subtitle: "ملفك والمسارات المقترحة والنقاط التي يجب التحقق منها قبل بدء الملف.",
    print: "حفظ تقريري بصيغة PDF",
    printHelp: "سيتم فتح نافذة الطباعة. اختر الحفظ بصيغة PDF.",
  },
  capture: {
    eyebrow: "الاحتفاظ بالتوجيه",
    title: "حفظه باستخدام بريدي الإلكتروني",
    text: "اختياري. لن يتم إنشاء حساب. نستخدم البريد لربط هذا التوجيه بحسابك المجاني إذا قررت إنشاءه لاحقًا.",
    emailLabel: "البريد الإلكتروني",
    privacyLabel: "قرأت معلومات الخصوصية وأطلب حفظ هذا التوجيه.",
    privacyLink: "الخصوصية",
    contactConsentLabel: "أوافق على أن يتواصل معي Campus Allemagne بخصوص مشروعي الدراسي.",
    contactConsentHelp: "اختياري. لا يلزم هذا الاختيار لحفظ توجيهك أو استلامه.",
    submit: "حفظ توجيهي",
    sending: "جارٍ الحفظ…",
    success: "تم حفظ التوجيه. لم يتم إنشاء أي حساب.",
    failure: "تعذر الحفظ. نتيجتك ما زالت متاحة في هذا التبويب.",
    invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
    emailSubmit: "إرسال توجيهي إلى بريدي الإلكتروني",
    sendingEmail: "جارٍ الإرسال…",
    emailSent: "تم حفظ التوجيه وإرسال البريد الإلكتروني. لم يتم إنشاء أي حساب.",
    deliveryFailure: "تم حفظ التوجيه، لكن تعذر إرسال البريد الإلكتروني. يمكنك ما زلت حفظ التقرير بصيغة PDF من هذه الصفحة.",
    interestEyebrow: "المتابعة معنا",
    interestTitle: "هل ترغب في متابعة مشروعك مع Campus Allemagne؟",
    interestText: "اختر ذلك بوضوح إذا كنت تريد أن نأخذ مشروعك بعين الاعتبار للمرحلة التالية أو لبرنامج تجريبي مجاني. لا يوجد أي دفع، ولن يتم فتح مساحة الوثائق تلقائيًا.",
    interestSubmit: "أريد المتابعة مع Campus Allemagne",
    interestSaving: "جارٍ التسجيل…",
    interestSuccess: "تم تسجيل اهتمامك. يمكن لـ Campus Allemagne مراجعة مشروعك للمرحلة التالية.",
    interestFailure: "تعذر تسجيل هذا الاختيار. يمكنك المحاولة من جديد.",
  },
};

const en: OrientationProspectCopy = {
  report: {
    label: "Campus Allemagne report",
    title: "My Germany orientation",
    subtitle: "Your profile, paths to explore and checks to make before preparing an application file.",
    print: "Save my report as PDF",
    printHelp: "Your browser print dialog will open. Choose “Save as PDF”.",
  },
  capture: {
    eyebrow: "Keep my orientation",
    title: "Save it with my email",
    text: "Optional. No account is created. Your email is used to reconnect this orientation if you later create a free account.",
    emailLabel: "Email address",
    privacyLabel: "I have read the privacy information and request that this orientation be saved.",
    privacyLink: "Privacy",
    contactConsentLabel: "I agree that Campus Allemagne may contact me about my study project.",
    contactConsentHelp: "Optional. This is not required to save or receive your orientation.",
    submit: "Save my orientation",
    sending: "Saving…",
    success: "Orientation saved. No account was created.",
    failure: "Saving failed. Your result is still available in this browser tab.",
    invalidEmail: "Enter a valid email address.",
    emailSubmit: "Email me my orientation",
    sendingEmail: "Sending…",
    emailSent: "Orientation saved and email sent. No account was created.",
    deliveryFailure: "Orientation saved, but the email could not be sent. You can still save the report as a PDF from this page.",
    interestEyebrow: "Continue with us",
    interestTitle: "Would you like to go further with Campus Allemagne?",
    interestText: "Say so explicitly if you would like your project to be considered for the next step or a free pilot. No payment is requested and this does not automatically open document access.",
    interestSubmit: "I want to continue with Campus Allemagne",
    interestSaving: "Recording…",
    interestSuccess: "Your interest has been recorded. Campus Allemagne can review your project for the next step.",
    interestFailure: "We could not record this choice. You can try again.",
  },
};

const de: OrientationProspectCopy = {
  report: {
    label: "Campus Allemagne Bericht",
    title: "Meine Deutschland-Orientierung",
    subtitle: "Dein Profil, mögliche Wege und Punkte, die vor der Dossiervorbereitung geprüft werden sollten.",
    print: "Bericht als PDF speichern",
    printHelp: "Der Druckdialog deines Browsers öffnet sich. Wähle „Als PDF speichern“.",
  },
  capture: {
    eyebrow: "Orientierung behalten",
    title: "Mit meiner E-Mail speichern",
    text: "Optional. Es wird kein Konto erstellt. Die E-Mail dient dazu, diese Orientierung später mit deinem kostenlosen Konto zu verbinden.",
    emailLabel: "E-Mail-Adresse",
    privacyLabel: "Ich habe die Datenschutzhinweise gelesen und bitte um Speicherung dieser Orientierung.",
    privacyLink: "Datenschutz",
    contactConsentLabel: "Ich bin damit einverstanden, dass Campus Allemagne mich zu meinem Studienprojekt kontaktiert.",
    contactConsentHelp: "Optional. Diese Zustimmung ist nicht nötig, um deine Orientierung zu speichern oder zu erhalten.",
    submit: "Orientierung speichern",
    sending: "Wird gespeichert…",
    success: "Orientierung gespeichert. Es wurde kein Konto erstellt.",
    failure: "Die Speicherung ist fehlgeschlagen. Dein Ergebnis bleibt in diesem Browser-Tab verfügbar.",
    invalidEmail: "Gib eine gültige E-Mail-Adresse ein.",
    emailSubmit: "Orientierung per E-Mail erhalten",
    sendingEmail: "Wird gesendet…",
    emailSent: "Orientierung gespeichert und E-Mail gesendet. Es wurde kein Konto erstellt.",
    deliveryFailure: "Orientierung gespeichert, aber die E-Mail konnte nicht gesendet werden. Du kannst den Bericht weiterhin auf dieser Seite als PDF speichern.",
    interestEyebrow: "Mit uns weitermachen",
    interestTitle: "Möchtest du mit Campus Allemagne weitergehen?",
    interestText: "Bestätige dies ausdrücklich, wenn dein Projekt für den nächsten Schritt oder einen kostenlosen Pilot berücksichtigt werden soll. Es wird keine Zahlung verlangt und der Dokumentenbereich wird nicht automatisch freigeschaltet.",
    interestSubmit: "Ich möchte mit Campus Allemagne weitermachen",
    interestSaving: "Wird gespeichert…",
    interestSuccess: "Dein Interesse wurde gespeichert. Campus Allemagne kann dein Projekt für den nächsten Schritt prüfen.",
    interestFailure: "Diese Auswahl konnte nicht gespeichert werden. Du kannst es erneut versuchen.",
  },
};

export const orientationProspectCopy: Record<Locale, OrientationProspectCopy> = { fr, ar, en, de };
