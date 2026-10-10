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
    includedEmailNotice: string;
    includedEmailEyebrow: string;
    includedEmailTitle: string;
    includedEmailText: string;
    includedEmailSuccessTitle: string;
    includedEmailSuccessText: string;
    includedEmailFailureTitle: string;
    optionalAccountLabel: string;
    optionalAccountNote: string;
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
    subtitle: "Votre projet, des formations à découvrir et la suite avec Campus Allemagne.",
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
    emailText: "Facultatif. Vous recevrez le résumé A4 et le dossier détaillé dans le même format que sur notre site. Si le dossier détaillé n’est pas disponible, le rapport candidat le remplace. Aucun compte n’est nécessaire.",
    emailPrivacyLabel: "J’ai lu l’information de confidentialité et je demande l’enregistrement et l’envoi de mes rapports à cette adresse e-mail.",
    emailOptionalAccount: "Votre orientation est sauvegardée. Avec la même adresse e-mail, retrouvez-la dans votre espace Prospect après confirmation de l’inscription. Créer un compte reste votre choix.",
    automaticEmailConsent: "Oui, je demande l’envoi automatique de deux PDF identiques aux documents du site : le résumé A4 et le dossier détaillé s’il est disponible, sinon le rapport candidat. J’ai lu la notice de confidentialité et j’accepte leur enregistrement et leur envoi à cette adresse. Aucun compte n’est créé.",
    includedEmailNotice: "Pour les candidats majeurs, le service envoie deux PDF correspondant aux documents imprimables du site : résumé A4 et dossier détaillé quand il est disponible, sinon rapport candidat. Aucun compte n’est créé et aucun e-mail publicitaire n’est envoyé.",
    includedEmailEyebrow: "Envoi automatique",
    includedEmailTitle: "Vos deux rapports PDF",
    includedEmailText: "Votre orientation est prête. Les deux rapports sont envoyés automatiquement à votre adresse e-mail, sans autre démarche.",
    includedEmailSuccessTitle: "Vos deux rapports ont été envoyés",
    includedEmailSuccessText: "Vos deux rapports PDF ont été envoyés à l’adresse indiquée. Vous pouvez également enregistrer une copie ici.",
    includedEmailFailureTitle: "Vos rapports sont prêts",
    optionalAccountLabel: "Une option pour plus tard",
    optionalAccountNote: "Facultatif : aucun compte n'a été créé automatiquement.",
    automaticEmailMinorNotice: "Vous pourrez enregistrer votre résultat en PDF. L’envoi par e-mail n’est pas disponible pour les moins de 18 ans pendant ce lancement.",
    automaticEmailPreparing: "Vous avez demandé l’envoi automatique. Préparation et envoi des deux rapports PDF en cours…",
    automaticEmailAlreadyRequested: "Une demande d’envoi a déjà été effectuée pendant cette orientation. Vérifiez votre boîte de réception et vos spams.",
    automaticEmailRetry: "Réessayer l’envoi",
    sendingEmail: "Envoi…",
    emailSent: "Orientation sauvegardée et e-mail envoyé. Aucun compte n’a été créé.",
    deliveryFailure: "Orientation sauvegardée, mais l’e-mail n’a pas pu être envoyé. Vous pouvez toujours enregistrer le rapport en PDF depuis cette page.",
    interestEyebrow: "Continuer avec nous",
    interestTitle: "Souhaitez-vous poursuivre avec Campus Allemagne ?",
    interestText: "Demandez à Campus Allemagne d’examiner votre projet pour une prochaine étape ou un éventuel pilote gratuit. Aucun paiement n’est demandé ici. Ce choix n’ouvre pas automatiquement l’espace documents.",
    interestSubmit: "Je veux continuer avec Campus Allemagne",
    interestSaving: "Enregistrement…",
    interestSuccess: "Votre intérêt est enregistré. Campus Allemagne pourra examiner votre projet pour la prochaine étape.",
    interestFailure: "Nous n’avons pas pu enregistrer ce choix. Vous pouvez réessayer.",
    continueEyebrow: "La suite de votre projet",
    continueTitle: "Votre avenir en Allemagne commence ici",
    continueText: "Vous nous avez présenté votre projet, vos envies et votre budget. Créez votre espace gratuit pour retrouver cette orientation et, si vous le souhaitez, demander à notre équipe d’étudier les possibilités adaptées et de vous accompagner.",
    continueBoundary: "Aucun paiement n’est demandé. L’espace étudiant et les documents ne sont pas activés automatiquement ; une proposition et une validation séparées restent nécessaires.",
    continueSubmit: "Créer mon espace gratuit et continuer",
    continueSaving: "Enregistrement de votre choix…",
    ageRestrictionEyebrow: "Premier lancement",
    ageRestrictionTitle: "Sauvegarde réservée aux 18 ans et plus",
    ageRestrictionText: "Vous pouvez utiliser votre orientation et enregistrer votre rapport en PDF. Pendant ce premier lancement, la sauvegarde avec e-mail et la création de compte sont réservées aux personnes de 18 ans ou plus.",
  },
};

const ar: OrientationProspectCopy = {
  report: {
    label: "تقرير Campus Allemagne",
    title: "توجيهي للدراسة في ألمانيا",
    subtitle: "مشروعك الدراسي، وبرامج يمكنك اكتشافها، والخطوة التالية مع Campus Allemagne.",
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
    emailText: "اختياري. سيصلك ملخص A4 والملف المفصل كما يظهران على الموقع. إذا لم يتوفر الملف المفصل، نرسل تقرير المترشح بدلًا منه. لا يلزم إنشاء حساب.",
    emailPrivacyLabel: "قرأت معلومات الخصوصية وأطلب حفظ التقريرين وإرسالهما إلى هذا البريد الإلكتروني.",
    emailOptionalAccount: "تم حفظ توجيهك. أنشئ حسابًا مجانيًا بالبريد الإلكتروني نفسه للعثور على توجيهك في مساحة Prospect بعد تأكيد التسجيل. هذه الخطوة اختيارية.",
    automaticEmailConsent: "نعم، أطلب إرسال ملفين PDF مطابقين لنسختي الموقع: الملخص والملف المفصل عند توفره، وإلا تقرير المترشح. قرأت معلومات الخصوصية وأوافق على الحفظ والإرسال إلى بريدي. لا يتم إنشاء حساب.",
    includedEmailNotice: "بالنسبة للبالغين، نرسل ملفين PDF مطابقين للوثائق المطبوعة من الموقع: الملخص والملف المفصل عند توفره، وإلا تقرير المترشح. لا يُنشأ حساب ولا تُرسل رسائل تسويقية.",
    includedEmailEyebrow: "إرسال تلقائي",
    includedEmailTitle: "تقريرا التوجيه PDF",
    includedEmailText: "نتيجة توجيهك جاهزة. سيتم إرسال التقريرين تلقائيًا إلى بريدك الإلكتروني دون أي إجراء إضافي.",
    includedEmailSuccessTitle: "تم إرسال تقريريك",
    includedEmailSuccessText: "أُرسل التقريران بصيغة PDF إلى بريدك الإلكتروني. يمكنك أيضًا حفظ نسخة من هذه الصفحة.",
    includedEmailFailureTitle: "تقريرا التوجيه جاهزان",
    optionalAccountLabel: "خيار يمكنك اتخاذه لاحقًا",
    optionalAccountNote: "اختياري: لم يتم إنشاء حساب تلقائيًا.",
    automaticEmailMinorNotice: "يمكنك حفظ نتيجتك بصيغة PDF. إرسال التقارير بالبريد الإلكتروني غير متاح لمن هم دون 18 عامًا خلال هذا الإطلاق.",
    automaticEmailPreparing: "لقد طلبت الإرسال التلقائي. يتم الآن إعداد تقريريّ PDF وإرسالهما…",
    automaticEmailAlreadyRequested: "تم تقديم طلب إرسال سابقًا خلال هذه الجلسة. تحقق من بريدك الوارد والبريد غير المرغوب فيه.",
    automaticEmailRetry: "إعادة محاولة الإرسال",
    sendingEmail: "جارٍ الإرسال…",
    emailSent: "تم حفظ التوجيه وإرسال البريد الإلكتروني. لم يتم إنشاء أي حساب.",
    deliveryFailure: "تم حفظ التوجيه، لكن تعذر إرسال البريد الإلكتروني. يمكنك ما زلت حفظ التقرير بصيغة PDF من هذه الصفحة.",
    interestEyebrow: "المتابعة معنا",
    interestTitle: "هل ترغب في متابعة مشروعك مع Campus Allemagne؟",
    interestText: "يمكنك طلب دراسة مشروعك للمرحلة التالية أو لبرنامج تجريبي مجاني محتمل. لا يوجد أي دفع الآن، ولن يتم فتح مساحة الوثائق تلقائيًا.",
    interestSubmit: "أريد المتابعة مع Campus Allemagne",
    interestSaving: "جارٍ التسجيل…",
    interestSuccess: "تم تسجيل اهتمامك. يمكن لـ Campus Allemagne مراجعة مشروعك للمرحلة التالية.",
    interestFailure: "تعذر تسجيل هذا الاختيار. يمكنك المحاولة من جديد.",
    continueEyebrow: "الخطوة التالية في مشروعك",
    continueTitle: "مستقبلك الدراسي في ألمانيا يبدأ من هنا",
    continueText: "لقد شاركتنا مشروعك الدراسي وطموحاتك وميزانيتك. أنشئ مساحتك المجانية للاحتفاظ بتوجيهك وطلب دراسة الخيارات المناسبة من فريقنا، إذا رغبت في المتابعة.",
    continueBoundary: "لا يُطلب أي دفع الآن. لا تُفتح مساحة الطالب أو الوثائق تلقائيًا؛ يلزم عرض منفصل وموافقة لاحقة.",
    continueSubmit: "إنشاء مساحتي المجانية والمتابعة",
    continueSaving: "جارٍ تسجيل اختيارك…",
    ageRestrictionEyebrow: "الإطلاق الأول",
    ageRestrictionTitle: "الحفظ متاح لمن يبلغ 18 عامًا أو أكثر",
    ageRestrictionText: "يمكنك استخدام نتيجة التوجيه وحفظ تقريرك بصيغة PDF. خلال هذا الإطلاق الأول، يقتصر الحفظ بالبريد الإلكتروني وإنشاء الحساب على من يبلغ 18 عامًا أو أكثر.",
  },
};

const en: OrientationProspectCopy = {
  report: {
    label: "Campus Allemagne report",
    title: "My Germany orientation",
    subtitle: "Your study plans, programmes to explore and how Campus Allemagne can help.",
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
    emailText: "Optional. You will receive the same A4 summary and detailed dossier PDFs available on the site. If the detailed dossier is unavailable, the candidate report replaces it. No account required.",
    emailPrivacyLabel: "I have read the privacy information and request that my reports be saved and emailed to this address.",
    emailOptionalAccount: "Your orientation has been saved. Create a free account with the same email address to find it in your Prospect space after your registration is confirmed. This step is optional.",
    automaticEmailConsent: "Yes, send two PDFs identical to the documents on the site: the A4 summary and detailed dossier when available, otherwise the candidate report. I have read the privacy information and agree to saving and emailing the reports. No account is created.",
    includedEmailNotice: "For adults, we send exactly two PDFs matching the website print documents: the A4 summary and detailed dossier when available, otherwise the candidate report. No account is created or marketing email sent.",
    includedEmailEyebrow: "Automatic delivery",
    includedEmailTitle: "Your two PDF reports",
    includedEmailText: "Your orientation is ready. Both reports are emailed automatically to your address without another action.",
    includedEmailSuccessTitle: "Both reports have been sent",
    includedEmailSuccessText: "Your two PDFs have been sent to your email address. You can also keep a copy from this page.",
    includedEmailFailureTitle: "Your reports are ready",
    optionalAccountLabel: "An option for later",
    optionalAccountNote: "Optional: no account has been created automatically.",
    automaticEmailMinorNotice: "You can save your result as a PDF. Email delivery is not available to people under 18 during this launch.",
    automaticEmailPreparing: "Automatic email requested. Preparing and sending both PDF reports…",
    automaticEmailAlreadyRequested: "A delivery request has already been made during this orientation. Check your inbox and spam folder.",
    automaticEmailRetry: "Retry email delivery",
    sendingEmail: "Sending…",
    emailSent: "Orientation saved and email sent. No account was created.",
    deliveryFailure: "Orientation saved, but the email could not be sent. You can still save the report as a PDF from this page.",
    interestEyebrow: "Continue with us",
    interestTitle: "Would you like to go further with Campus Allemagne?",
    interestText: "Ask Campus Allemagne to review your project for a next step or a possible free pilot. No payment is requested here, and this does not automatically open document access.",
    interestSubmit: "I want to continue with Campus Allemagne",
    interestSaving: "Recording…",
    interestSuccess: "Your interest has been recorded. Campus Allemagne can review your project for the next step.",
    interestFailure: "We could not record this choice. You can try again.",
    continueEyebrow: "The next step in your project",
    continueTitle: "Your future in Germany starts here",
    continueText: "You have shared your study plans, preferences and budget. Create your free space to keep this orientation and, if you wish, ask our team to explore suitable options and guide your next steps.",
    continueBoundary: "No payment is requested. Student access and documents are not automatically enabled; a separate proposal and approval are required.",
    continueSubmit: "Create my free space and continue",
    continueSaving: "Recording your choice…",
    ageRestrictionEyebrow: "Initial launch",
    ageRestrictionTitle: "Saving is limited to people aged 18 or over",
    ageRestrictionText: "You can still use your orientation and save the report as a PDF. During this initial launch, email saving and account creation are limited to people aged 18 or over.",
  },
};

const de: OrientationProspectCopy = {
  report: {
    label: "Campus Allemagne Bericht",
    title: "Meine Deutschland-Orientierung",
    subtitle: "Dein Studienwunsch, mögliche Studiengänge und deine nächsten Schritte mit Campus Allemagne.",
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
    emailText: "Freiwillig. Du erhältst die gleichen A4-Zusammenfassung- und Detaildossier-PDFs wie auf der Website. Wenn das Dossier nicht verfügbar ist, wird stattdessen der Bewerberbericht gesendet. Kein Konto erforderlich.",
    emailPrivacyLabel: "Ich habe die Datenschutzhinweise gelesen und bitte darum, meine Berichte zu speichern und an diese E-Mail-Adresse zu senden.",
    emailOptionalAccount: "Deine Orientierung wurde gespeichert. Erstelle mit derselben E-Mail-Adresse ein kostenloses Konto, um sie nach der Bestätigung der Registrierung im Prospect-Bereich wiederzufinden. Dieser Schritt ist freiwillig.",
    automaticEmailConsent: "Ja, ich möchte zwei mit der Website übereinstimmende PDFs erhalten: die A4-Zusammenfassung und das ausführliche Dossier, sofern vorhanden, sonst den Bewerberbericht. Ich stimme der Speicherung und dem E-Mail-Versand zu. Es wird kein Konto erstellt.",
    includedEmailNotice: "Für Volljährige werden genau zwei PDFs passend zu den Druckdokumenten der Website versendet: A4-Zusammenfassung und ausführliches Dossier, falls vorhanden, sonst Bewerberbericht. Kein Konto und keine Werbung.",
    includedEmailEyebrow: "Automatischer Versand",
    includedEmailTitle: "Deine zwei PDF-Berichte",
    includedEmailText: "Deine Orientierung ist fertig. Beide Berichte werden ohne weiteren Klick automatisch an deine E-Mail-Adresse geschickt.",
    includedEmailSuccessTitle: "Beide Berichte wurden versendet",
    includedEmailSuccessText: "Deine zwei PDFs wurden an deine E-Mail-Adresse gesendet. Du kannst hier auch eine Kopie speichern.",
    includedEmailFailureTitle: "Deine Berichte sind fertig",
    optionalAccountLabel: "Eine Möglichkeit für später",
    optionalAccountNote: "Freiwillig: Es wurde nicht automatisch ein Konto erstellt.",
    automaticEmailMinorNotice: "Du kannst dein Ergebnis als PDF speichern. Der E-Mail-Versand ist bei diesem Start für unter 18-Jährige nicht verfügbar.",
    automaticEmailPreparing: "Automatischen Versand angefordert. Beide PDF-Berichte werden vorbereitet und verschickt…",
    automaticEmailAlreadyRequested: "Während dieser Orientierung wurde bereits ein Versand angefordert. Überprüfe dein Postfach und den Spamordner.",
    automaticEmailRetry: "E-Mail-Versand erneut versuchen",
    sendingEmail: "Wird gesendet…",
    emailSent: "Orientierung gespeichert und E-Mail gesendet. Es wurde kein Konto erstellt.",
    deliveryFailure: "Orientierung gespeichert, aber die E-Mail konnte nicht gesendet werden. Du kannst den Bericht weiterhin auf dieser Seite als PDF speichern.",
    interestEyebrow: "Mit uns weitermachen",
    interestTitle: "Möchtest du mit Campus Allemagne weitergehen?",
    interestText: "Bitte Campus Allemagne, dein Projekt für einen nächsten Schritt oder ein mögliches kostenloses Pilotprojekt zu prüfen. Dafür ist jetzt keine Zahlung nötig. Der Dokumentenbereich öffnet sich nicht automatisch.",
    interestSubmit: "Ich möchte mit Campus Allemagne weitermachen",
    interestSaving: "Wird gespeichert…",
    interestSuccess: "Dein Interesse wurde gespeichert. Campus Allemagne kann dein Projekt für den nächsten Schritt prüfen.",
    interestFailure: "Diese Auswahl konnte nicht gespeichert werden. Du kannst es erneut versuchen.",
    continueEyebrow: "Der nächste Schritt deines Projekts",
    continueTitle: "Deine Zukunft in Deutschland beginnt hier",
    continueText: "Du hast uns von deinem Studienwunsch, deinen Interessen und deinem Budget erzählt. Erstelle deinen kostenlosen Bereich, um die Orientierung wiederzufinden und unser Team auf Wunsch um Begleitung bei den nächsten Schritten zu bitten.",
    continueBoundary: "Es wird keine Zahlung verlangt. Studierendenbereich und Dokumente werden nicht automatisch freigeschaltet; dafür sind ein gesondertes Angebot und eine Freigabe nötig.",
    continueSubmit: "Kostenlosen Bereich erstellen und fortfahren",
    continueSaving: "Deine Entscheidung wird gespeichert…",
    ageRestrictionEyebrow: "Erster Start",
    ageRestrictionTitle: "Speichern ist nur ab 18 Jahren verfügbar",
    ageRestrictionText: "Du kannst deine Orientierung weiterhin nutzen und den Bericht als PDF speichern. Während dieses ersten Starts sind das Speichern per E-Mail und die Kontoerstellung Personen ab 18 Jahren vorbehalten.",
  },
};

export const orientationProspectCopy: Record<Locale, OrientationProspectCopy> = { fr, ar, en, de };
