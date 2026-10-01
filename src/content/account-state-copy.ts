import type { Locale } from "@/lib/i18n";

type AccountStateCopy = {
  reset: {
    homeAria: string;
    eyebrow: string;
    storyTitle: string;
    storyText: string;
    securityTitle: string;
    securityText: string;
    accessTitle: string;
    accessText: string;
    login: string;
    formTitle: string;
    formText: string;
    password: string;
    showPassword: string;
    hidePassword: string;
    hint: string;
    invalid: string;
    saved: string;
    genericError: string;
    saving: string;
    save: string;
  };
  unauthorized: {
    homeAria: string;
    badge: string;
    title: string;
    text: string;
    back: string;
    switchAccount: string;
  };
  unknownStudent: {
    eyebrow: string;
    labels: Record<string, string>;
    fallback: string;
    text: string;
    back: string;
    steps: string;
  };
};

export const accountStateCopy: Record<Locale, AccountStateCopy> = {
  fr: {
    reset: {
      homeAria: "Retour à l’accueil AlmaGo",
      eyebrow: "Réinitialisation",
      storyTitle: "Choisissez un nouveau mot de passe pour retrouver votre espace.",
      storyText: "Cette étape sécurise l’accès à votre dossier étudiant. Après validation, vous serez redirigé vers votre tableau de bord.",
      securityTitle: "Conseil sécurité",
      securityText: "Utilisez au moins 8 caractères et évitez un mot de passe déjà utilisé.",
      accessTitle: "Accès au dossier",
      accessText: "Le changement concerne seulement votre compte, pas les données enregistrées dans votre dossier.",
      login: "Connexion",
      formTitle: "Nouveau mot de passe",
      formText: "Saisissez un mot de passe solide pour sécuriser votre accès au dossier.",
      password: "Nouveau mot de passe",
      showPassword: "Afficher",
      hidePassword: "Masquer",
      hint: "Utilisez au moins 8 caractères. Un mot de passe long et unique protège mieux votre espace.",
      invalid: "Le lien est expiré ou invalide. Demandez un nouveau lien depuis la page de connexion.",
      saved: "Mot de passe mis à jour. Redirection vers votre espace étudiant…",
      genericError: "Une erreur est survenue. Réessayez dans un instant.",
      saving: "Enregistrement…",
      save: "Enregistrer le mot de passe",
    },
    unauthorized: {
      homeAria: "Retour à l’accueil AlmaGo",
      badge: "Autorisation requise",
      title: "Cet espace n’est pas disponible pour ce compte.",
      text: "Votre compte est bien connecté, mais le rôle associé ne permet pas d’ouvrir cette page. Rien n’a été modifié dans votre dossier.",
      back: "Retour à mon dossier",
      switchAccount: "Changer de compte",
    },
    unknownStudent: {
      eyebrow: "Espace étudiant",
      labels: { documents: "Documents", orientation: "Orientation", checklist: "Démarches", applications: "Candidatures" },
      fallback: "Espace étudiant",
      text: "Cette adresse ne correspond pas à une page active de votre espace. Rien n’a été modifié dans votre dossier.",
      back: "Retour à mon dossier",
      steps: "Voir mes démarches",
    },
  },
  ar: {
    reset: {
      homeAria: "العودة إلى الصفحة الرئيسية لـ AlmaGo",
      eyebrow: "إعادة تعيين كلمة المرور",
      storyTitle: "اختر كلمة مرور جديدة للعودة إلى ملفك.",
      storyText: "تحمي هذه الخطوة الوصول إلى ملفك. بعد الحفظ ستعود إلى لوحة الطالب.",
      securityTitle: "نصيحة أمان",
      securityText: "استخدم 8 أحرف على الأقل وتجنب كلمة مرور سبق أن استخدمتها.",
      accessTitle: "الوصول إلى الملف",
      accessText: "التغيير يخص حسابك فقط ولا يغير البيانات المسجلة في ملفك.",
      login: "تسجيل الدخول",
      formTitle: "كلمة مرور جديدة",
      formText: "اختر كلمة مرور قوية لحماية الوصول إلى ملفك.",
      password: "كلمة المرور الجديدة",
      showPassword: "إظهار",
      hidePassword: "إخفاء",
      hint: "استخدم 8 أحرف على الأقل. كلمة مرور طويلة وفريدة تحمي حسابك بشكل أفضل.",
      invalid: "الرابط منتهي الصلاحية أو غير صالح. اطلب رابطًا جديدًا من صفحة تسجيل الدخول.",
      saved: "تم تحديث كلمة المرور. جارٍ تحويلك إلى ملفك…",
      genericError: "حدث خطأ. حاول مرة أخرى بعد قليل.",
      saving: "جارٍ الحفظ…",
      save: "حفظ كلمة المرور",
    },
    unauthorized: {
      homeAria: "العودة إلى الصفحة الرئيسية لـ AlmaGo",
      badge: "لا تملك صلاحية الوصول",
      title: "هذه المساحة غير متاحة لهذا الحساب.",
      text: "حسابك متصل، لكن الصلاحية المرتبطة به لا تسمح بفتح هذه الصفحة. لم يتم تعديل أي شيء في ملفك.",
      back: "العودة إلى ملفي",
      switchAccount: "استخدام حساب آخر",
    },
    unknownStudent: {
      eyebrow: "مساحة الطالب",
      labels: { documents: "المستندات", orientation: "البرامج", checklist: "الخطوات", applications: "طلبات التقديم" },
      fallback: "ملف الطالب",
      text: "هذا العنوان لا يطابق صفحة نشطة في مساحتك. لم يتم تعديل أي شيء في ملفك.",
      back: "العودة إلى ملفي",
      steps: "عرض خطواتي",
    },
  },
  en: {
    reset: {
      homeAria: "Back to AlmaGo home",
      eyebrow: "Password reset",
      storyTitle: "Choose a new password to get back into your space.",
      storyText: "This secures access to your student file. After saving, you will be redirected to your dashboard.",
      securityTitle: "Security tip",
      securityText: "Use at least 8 characters and avoid reusing an old password.",
      accessTitle: "Access to your file",
      accessText: "This only changes your account password. It does not change the data saved in your file.",
      login: "Sign in",
      formTitle: "New password",
      formText: "Choose a strong password to protect access to your file.",
      password: "New password",
      showPassword: "Show",
      hidePassword: "Hide",
      hint: "Use at least 8 characters. A long, unique password protects your account better.",
      invalid: "This link has expired or is invalid. Request a new link from the sign-in page.",
      saved: "Password updated. Redirecting to your student space…",
      genericError: "Something went wrong. Please try again shortly.",
      saving: "Saving…",
      save: "Save password",
    },
    unauthorized: {
      homeAria: "Back to AlmaGo home",
      badge: "Permission required",
      title: "This space is not available for this account.",
      text: "Your account is signed in, but its role does not allow access to this page. Nothing in your file has been changed.",
      back: "Back to my file",
      switchAccount: "Use another account",
    },
    unknownStudent: {
      eyebrow: "Student space",
      labels: { documents: "Documents", orientation: "Programmes", checklist: "Steps", applications: "Applications" },
      fallback: "Student space",
      text: "This address does not match an active page in your space. Nothing in your file has been changed.",
      back: "Back to my file",
      steps: "View my steps",
    },
  },
  de: {
    reset: {
      homeAria: "Zurück zur AlmaGo-Startseite",
      eyebrow: "Passwort zurücksetzen",
      storyTitle: "Wähle ein neues Passwort, um wieder auf deinen Bereich zuzugreifen.",
      storyText: "Damit sicherst du den Zugriff auf deine Studierendenakte. Nach dem Speichern wirst du zu deiner Übersicht weitergeleitet.",
      securityTitle: "Sicherheitstipp",
      securityText: "Verwende mindestens 8 Zeichen und möglichst kein bereits verwendetes Passwort.",
      accessTitle: "Zugriff auf deine Akte",
      accessText: "Die Änderung betrifft nur dein Konto. Die Daten in deiner Akte bleiben unverändert.",
      login: "Anmelden",
      formTitle: "Neues Passwort",
      formText: "Wähle ein starkes Passwort, um den Zugriff auf deine Akte zu schützen.",
      password: "Neues Passwort",
      showPassword: "Anzeigen",
      hidePassword: "Ausblenden",
      hint: "Verwende mindestens 8 Zeichen. Ein langes, einzigartiges Passwort schützt dein Konto besser.",
      invalid: "Der Link ist abgelaufen oder ungültig. Fordere auf der Anmeldeseite einen neuen Link an.",
      saved: "Passwort aktualisiert. Du wirst zu deinem Studierendenbereich weitergeleitet…",
      genericError: "Etwas ist schiefgelaufen. Bitte versuche es gleich noch einmal.",
      saving: "Wird gespeichert…",
      save: "Passwort speichern",
    },
    unauthorized: {
      homeAria: "Zurück zur AlmaGo-Startseite",
      badge: "Berechtigung erforderlich",
      title: "Dieser Bereich ist für dieses Konto nicht verfügbar.",
      text: "Dein Konto ist angemeldet, aber die zugehörige Rolle erlaubt den Zugriff auf diese Seite nicht. In deiner Akte wurde nichts geändert.",
      back: "Zurück zu meiner Akte",
      switchAccount: "Anderes Konto verwenden",
    },
    unknownStudent: {
      eyebrow: "Studierendenbereich",
      labels: { documents: "Unterlagen", orientation: "Studiengänge", checklist: "Schritte", applications: "Bewerbungen" },
      fallback: "Studierendenbereich",
      text: "Diese Adresse gehört zu keiner aktiven Seite in deinem Bereich. In deiner Akte wurde nichts geändert.",
      back: "Zurück zu meiner Akte",
      steps: "Meine Schritte ansehen",
    },
  },
};
