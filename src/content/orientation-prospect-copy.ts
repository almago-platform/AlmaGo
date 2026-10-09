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
    continuePrivacyLabel: string;
    continueReady: string;
    submit: string;
    sending: string;
    success: string;
    failure: string;
    invalidEmail: string;
    emailSubmit: string;
    emailEyebrow: string;
    emailTitle: string;
    emailText: string;
    emailPrivacyLabel: string;
    emailOptionalAccount: string;
    automaticEmailConsent: string;
    automaticEmailMinorNotice: string;
    automaticEmailPreparing: string;
    automaticEmailAlreadyRequested: string;
    automaticEmailRetry: string;
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
    continueEyebrow: string;
    continueTitle: string;
    continueText: string;
    continueBoundary: string;
    continueSubmit: string;
    continueSaving: string;
    ageRestrictionEyebrow: string;
    ageRestrictionTitle: string;
    ageRestrictionText: string;
  };
};

const fr: OrientationProspectCopy = {
  report: {
    label: "Rapport Campus Allemagne",
    title: "Mon orientation Allemagne",
    subtitle: "Votre profil, votre route personnalisée et la répartition claire des prochaines étapes.",
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
    continuePrivacyLabel: "J’ai lu l’information de confidentialité et j’accepte la sauvegarde de cette orientation pour continuer mon parcours.",
    continueReady: "Votre orientation est prête. Vous pouvez maintenant continuer votre projet Allemagne.",
    submit: "Sauvegarder mon orientation",
    sending: "Sauvegarde…",
    success: "Orientation sauvegardée. Aucun compte n’a été créé.",
    failure: "La sauvegarde n’a pas fonctionné. Votre résultat reste disponible dans cet onglet.",
    invalidEmail: "Indiquez une adresse e-mail valide.",
    emailSubmit: "Recevoir mes deux rapports par e-mail",
    emailEyebrow: "Votre orientation par e-mail",
    emailTitle: "Recevoir mes deux rapports PDF",
    emailText: "Facultatif. Vous recevrez votre orientation personnalisée et votre rapport candidat en pièces jointes. Aucun compte n’est nécessaire.",
    emailPrivacyLabel: "J’ai lu l’information de confidentialité et je demande l’enregistrement et l’envoi de mes rapports à cette adresse e-mail.",
    emailOptionalAccount: "L’e-mail est indépendant de la création de compte. Si vous le souhaitez :",
    automaticEmailConsent: "Oui, je souhaite recevoir automatiquement mes deux rapports PDF par e-mail dès que mon orientation est prête. J’accepte leur enregistrement et leur envoi à l’adresse indiquée. C’est facultatif et aucun compte n’est créé.",
    automaticEmailMinorNotice: "Vous pourrez enregistrer votre résultat en PDF. L’envoi par e-mail n’est pas disponible pour les moins de 18 ans pendant ce lancement.",
    automaticEmailPreparing: "Vous avez demandé l’envoi automatique. Préparation et envoi des deux rapports PDF en cours…",
    automaticEmailAlreadyRequested: "Une demande d’envoi a déjà été effectuée pendant cette orientation. Vérifiez votre boîte de réception et vos spams.",
    automaticEmailRetry: "Réessayer l’envoi",
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
    continueEyebrow: "La suite de votre projet",
    continueTitle: "Créer mon espace Prospect gratuit",
    continueText: "Créez votre espace Prospect gratuit pour garder cette orientation, explorer le catalogue, compléter votre projet et recevoir une proposition Campus Allemagne. L’espace étudiant n’est pas encore activé.",
    continueBoundary: "Votre compte ouvre l’espace Prospect. L’espace étudiant reste verrouillé jusqu’à la proposition, au paiement et à la validation Campus.",
    continueSubmit: "Créer mon espace Prospect gratuit",
    continueSaving: "Création de votre espace Prospect…",
    ageRestrictionEyebrow: "Premier lancement",
    ageRestrictionTitle: "Sauvegarde réservée aux 18 ans et plus",
    ageRestrictionText: "Vous pouvez utiliser votre orientation et enregistrer votre rapport en PDF. Pendant ce premier lancement, la sauvegarde avec e-mail et la création de compte sont réservées aux personnes de 18 ans ou plus.",
  },
};

const ar: OrientationProspectCopy = {
  report: {
    label: "تقرير Campus Allemagne",
    title: "توجيهي للدراسة في ألمانيا",
    subtitle: "ملفك ومسارك الشخصي وتوزيع واضح للخطوات القادمة.",
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
    continuePrivacyLabel: "قرأت معلومات الخصوصية وأوافق على حفظ هذا التوجيه لمواصلة مساري.",
    continueReady: "توجيهك جاهز. يمكنك الآن متابعة مشروعك للدراسة في ألمانيا.",
    submit: "حفظ توجيهي",
    sending: "جارٍ الحفظ…",
    success: "تم حفظ التوجيه. لم يتم إنشاء أي حساب.",
    failure: "تعذر الحفظ. نتيجتك ما زالت متاحة في هذا التبويب.",
    invalidEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
    emailSubmit: "إرسال تقريري التوجيه إلى بريدي الإلكتروني",
    emailEyebrow: "توجيهك عبر البريد الإلكتروني",
    emailTitle: "استلام تقريري بصيغة PDF",
    emailText: "اختياري. ستصلك نتيجة التوجيه الشخصية وتقرير المترشح كمرفقين بالبريد الإلكتروني. لا يلزم إنشاء حساب.",
    emailPrivacyLabel: "قرأت معلومات الخصوصية وأطلب حفظ التقريرين وإرسالهما إلى هذا البريد الإلكتروني.",
    emailOptionalAccount: "لا يتطلب استلام التقريرين إنشاء حساب. إذا أردت المتابعة:",
    automaticEmailConsent: "نعم، أريد استلام تقريريّ PDF تلقائيًا عبر البريد الإلكتروني عند جاهزية نتيجة التوجيه. أوافق على حفظهما وإرسالهما إلى العنوان المذكور. هذا اختياري ولا يتطلب إنشاء حساب.",
    automaticEmailMinorNotice: "يمكنك حفظ نتيجتك بصيغة PDF. إرسال التقارير بالبريد الإلكتروني غير متاح لمن هم دون 18 عامًا خلال هذا الإطلاق.",
    automaticEmailPreparing: "لقد طلبت الإرسال التلقائي. يتم الآن إعداد تقريريّ PDF وإرسالهما…",
    automaticEmailAlreadyRequested: "تم تقديم طلب إرسال سابقًا خلال هذه الجلسة. تحقق من بريدك الوارد والبريد غير المرغوب فيه.",
    automaticEmailRetry: "إعادة محاولة الإرسال",
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
    continueEyebrow: "الخطوة التالية في مشروعك",
    continueTitle: "إنشاء مساحة Prospect المجانية",
    continueText: "أنشئ مساحة Prospect المجانية للاحتفاظ بهذا التوجيه واستكشاف البرامج وإكمال مشروعك واستلام اقتراح من Campus Allemagne. مساحة الطالب ليست مفعّلة بعد.",
    continueBoundary: "الحساب يفتح مساحة Prospect فقط. تبقى مساحة الطالب مقفلة حتى استلام الاقتراح والدفع ثم تأكيد Campus Allemagne.",
    continueSubmit: "إنشاء مساحة Prospect المجانية",
    continueSaving: "جارٍ إنشاء مساحة Prospect…",
    ageRestrictionEyebrow: "الإطلاق الأول",
    ageRestrictionTitle: "الحفظ متاح لمن يبلغ 18 عامًا أو أكثر",
    ageRestrictionText: "يمكنك استخدام نتيجة التوجيه وحفظ تقريرك بصيغة PDF. خلال هذا الإطلاق الأول، يقتصر الحفظ بالبريد الإلكتروني وإنشاء الحساب على من يبلغ 18 عامًا أو أكثر.",
  },
};

const en: OrientationProspectCopy = {
  report: {
    label: "Campus Allemagne report",
    title: "My Germany orientation",
    subtitle: "Your profile, personalised route and a clear split of the next steps.",
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
    continuePrivacyLabel: "I have read the privacy information and agree to save this orientation so I can continue my journey.",
    continueReady: "Your orientation is ready. You can now continue your Germany project.",
    submit: "Save my orientation",
    sending: "Saving…",
    success: "Orientation saved. No account was created.",
    failure: "Saving failed. Your result is still available in this browser tab.",
    invalidEmail: "Enter a valid email address.",
    emailSubmit: "Email me both PDF reports",
    emailEyebrow: "Your orientation by email",
    emailTitle: "Get both of my PDF reports",
    emailText: "Optional. Your personalised orientation and candidate report will be attached to the email. No account required.",
    emailPrivacyLabel: "I have read the privacy information and request that my reports be saved and emailed to this address.",
    emailOptionalAccount: "No account is needed to receive your reports. If you would like to continue:",
    automaticEmailConsent: "Yes, automatically email both PDF reports to the address above when my orientation is ready. I agree to the reports being saved and sent. This is optional and no account is created.",
    automaticEmailMinorNotice: "You can save your result as a PDF. Email delivery is not available to people under 18 during this launch.",
    automaticEmailPreparing: "Automatic email requested. Preparing and sending both PDF reports…",
    automaticEmailAlreadyRequested: "A delivery request has already been made during this orientation. Check your inbox and spam folder.",
    automaticEmailRetry: "Retry email delivery",
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
    continueEyebrow: "The next step in your project",
    continueTitle: "Create my free Prospect space",
    continueText: "Create your free Prospect space to keep this orientation, explore the catalogue, complete your project and receive a Campus Allemagne proposal. Student access is not active yet.",
    continueBoundary: "Your account opens the Prospect space. Student access stays locked until proposal, payment and Campus validation are complete.",
    continueSubmit: "Create my free Prospect space",
    continueSaving: "Creating your Prospect space…",
    ageRestrictionEyebrow: "Initial launch",
    ageRestrictionTitle: "Saving is limited to people aged 18 or over",
    ageRestrictionText: "You can still use your orientation and save the report as a PDF. During this initial launch, email saving and account creation are limited to people aged 18 or over.",
  },
};

const de: OrientationProspectCopy = {
  report: {
    label: "Campus Allemagne Bericht",
    title: "Meine Deutschland-Orientierung",
    subtitle: "Dein Profil, deine persönliche Route und eine klare Aufteilung der nächsten Schritte.",
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
    continuePrivacyLabel: "Ich habe die Datenschutzhinweise gelesen und stimme der Speicherung dieser Orientierung zu, um meinen Weg fortzusetzen.",
    continueReady: "Deine Orientierung ist fertig. Du kannst jetzt dein Deutschland-Projekt fortsetzen.",
    submit: "Orientierung speichern",
    sending: "Wird gespeichert…",
    success: "Orientierung gespeichert. Es wurde kein Konto erstellt.",
    failure: "Die Speicherung ist fehlgeschlagen. Dein Ergebnis bleibt in diesem Browser-Tab verfügbar.",
    invalidEmail: "Gib eine gültige E-Mail-Adresse ein.",
    emailSubmit: "Beide PDF-Berichte per E-Mail erhalten",
    emailEyebrow: "Deine Orientierung per E-Mail",
    emailTitle: "Beide PDF-Berichte erhalten",
    emailText: "Freiwillig. Deine persönliche Orientierung und dein Bewerberbericht werden per E-Mail als Anhänge zugestellt. Kein Konto erforderlich.",
    emailPrivacyLabel: "Ich habe die Datenschutzhinweise gelesen und bitte darum, meine Berichte zu speichern und an diese E-Mail-Adresse zu senden.",
    emailOptionalAccount: "Du brauchst für die Berichte kein Konto. Wenn du weitermachen möchtest:",
    automaticEmailConsent: "Ja, ich möchte beide PDF-Berichte automatisch per E-Mail erhalten, sobald meine Orientierung fertig ist. Ich stimme ihrer Speicherung und dem Versand an diese Adresse zu. Das ist freiwillig und es wird kein Konto erstellt.",
    automaticEmailMinorNotice: "Du kannst dein Ergebnis als PDF speichern. Der E-Mail-Versand ist bei diesem Start für unter 18-Jährige nicht verfügbar.",
    automaticEmailPreparing: "Automatischen Versand angefordert. Beide PDF-Berichte werden vorbereitet und verschickt…",
    automaticEmailAlreadyRequested: "Während dieser Orientierung wurde bereits ein Versand angefordert. Überprüfe dein Postfach und den Spamordner.",
    automaticEmailRetry: "E-Mail-Versand erneut versuchen",
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
    continueEyebrow: "Der nächste Schritt deines Projekts",
    continueTitle: "Kostenlosen Prospect-Bereich erstellen",
    continueText: "Erstelle deinen kostenlosen Prospect-Bereich, um diese Orientierung zu behalten, den Katalog zu erkunden, dein Projekt zu vervollständigen und einen Vorschlag von Campus Allemagne zu erhalten. Der Studierendenbereich ist noch nicht aktiviert.",
    continueBoundary: "Dein Konto öffnet den Prospect-Bereich. Der Studierendenbereich bleibt bis zum Vorschlag, zur Zahlung und zur Campus-Bestätigung gesperrt.",
    continueSubmit: "Kostenlosen Prospect-Bereich erstellen",
    continueSaving: "Prospect-Bereich wird erstellt…",
    ageRestrictionEyebrow: "Erster Start",
    ageRestrictionTitle: "Speichern ist nur ab 18 Jahren verfügbar",
    ageRestrictionText: "Du kannst deine Orientierung weiterhin nutzen und den Bericht als PDF speichern. Während dieses ersten Starts sind das Speichern per E-Mail und die Kontoerstellung Personen ab 18 Jahren vorbehalten.",
  },
};

export const orientationProspectCopy: Record<Locale, OrientationProspectCopy> = { fr, ar, en, de };
