import type { Locale } from "@/lib/i18n";

export type OrientationCopy = {
  header: { home: string; login: string; skip: string };
  intro: { eyebrow: string; title: string; lead: string; privacy: string };
  progress: { label: string; step: string };
  steps: {
    situation: { title: string; text: string };
    project: { title: string; text: string };
    languages: { title: string; text: string };
    resources: { title: string; text: string };
  };
  bacStatus: { label: string; obtained: string; preparing: string; no_bac: string };
  fields: {
    yearHelp: string;
    averageHelp: string;
    lastDiplomaHelp: string;
    cities: string;
    citiesHelp: string;
  };
  controls: {
    choose: string;
    optional: string;
    previous: string;
    next: string;
    summary: string;
    selected: string;
  };
  validation: {
    required: string;
    year: string;
    average: string;
  };
  summary: {
    eyebrow: string;
    title: string;
    text: string;
    noticeTitle: string;
    noticeText: string;
    edit: string;
    restart: string;
    home: string;
    labels: {
      bacStatus: string;
      bacYear: string;
      bacTrack: string;
      average: string;
      diploma: string;
      degree: string;
      field: string;
      german: string;
      english: string;
      studyLanguage: string;
      budget: string;
      cities: string;
    };
  };
};

const fr: OrientationCopy = {
  header: { home: "Accueil", login: "Se connecter", skip: "Aller au contenu" },
  intro: {
    eyebrow: "Orientation gratuite",
    title: "Par où commencer pour étudier en Allemagne ?",
    lead: "Répondez à quelques questions simples. Aucun compte n’est nécessaire.",
    privacy: "Pour le moment, vos réponses restent uniquement dans cet onglet. Rien n’est envoyé à AlmaGo.",
  },
  progress: { label: "Progression de l’orientation", step: "Étape" },
  steps: {
    situation: { title: "Votre situation scolaire", text: "Commençons par votre dernier niveau d’études. L’orientation fonctionne aussi si vous n’avez pas de Bac." },
    project: { title: "Votre projet d’études", text: "Dites-nous ce que vous souhaitez étudier en Allemagne." },
    languages: { title: "Vos langues", text: "Indiquez vos niveaux actuels, même si vous débutez." },
    resources: { title: "Budget et villes", text: "Ces informations nous aideront ensuite à mieux organiser les pistes." },
  },
  bacStatus: { label: "Votre situation scolaire", obtained: "J’ai un Bac ou diplôme secondaire équivalent", preparing: "Je prépare encore mon Bac", no_bac: "Je n’ai pas de Bac ni de diplôme secondaire équivalent" },
  fields: {
    yearHelp: "Année obtenue ou prévue.",
    averageHelp: "Facultatif. Moyenne sur 20, réelle ou estimée.",
    lastDiplomaHelp: "Facultatif si le Bac est votre dernier diplôme.",
    cities: "Villes qui vous intéressent",
    citiesHelp: "Facultatif · jusqu’à 3 villes. Vous pourrez changer plus tard.",
  },
  controls: {
    choose: "Choisir…", optional: "Facultatif", previous: "Retour", next: "Continuer",
    summary: "Voir mon orientation", selected: "sélectionnée(s)",
  },
  validation: {
    required: "Complétez les champs demandés pour continuer.",
    year: "Indiquez une année valide entre 2000 et 2035.",
    average: "La moyenne doit être comprise entre 0 et 20.",
  },
  summary: {
    eyebrow: "Votre point de départ",
    title: "Voici ce que vous nous avez indiqué.",
    text: "Voici le résumé de vos réponses. Il ne confirme pas une admission.",
    noticeTitle: "Important",
    noticeText: "Avant de décider, vérifiez toujours les conditions sur le site officiel du programme ou de l’organisme concerné.",
    edit: "Modifier mes réponses",
    restart: "Recommencer",
    home: "Retour à l’accueil",
    labels: {
      bacStatus: "Bac", bacYear: "Année du Bac", bacTrack: "Section", average: "Moyenne",
      diploma: "Dernier diplôme", degree: "Niveau visé", field: "Domaine", german: "Allemand",
      english: "Anglais", studyLanguage: "Langue d’études", budget: "Budget", cities: "Villes",
    },
  },
};

const ar: OrientationCopy = {
  header: { home: "الرئيسية", login: "تسجيل الدخول", skip: "الانتقال إلى المحتوى" },
  intro: {
    eyebrow: "توجيه مجاني",
    title: "من أين تبدأ مشروع الدراسة في ألمانيا؟",
    lead: "أجب عن أسئلة بسيطة حول دراستك ولغتك. لا تحتاج إلى إنشاء حساب.",
    privacy: "في هذه المرحلة تبقى إجاباتك داخل هذا التبويب فقط، ولا يتم إرسالها إلى AlmaGo.",
  },
  progress: { label: "تقدم التوجيه", step: "الخطوة" },
  steps: {
    situation: { title: "وضعك الدراسي", text: "نبدأ بآخر مستوى دراسي لديك. يعمل التوجيه أيضًا إذا لم تكن لديك بكالوريا." },
    project: { title: "مشروعك الدراسي", text: "اختر ما تريد دراسته في ألمانيا." },
    languages: { title: "اللغات", text: "اختر مستواك الحالي كما هو، حتى لو كنت في البداية." },
    resources: { title: "الميزانية والمدن", text: "ستساعدنا هذه المعلومات لاحقًا على ترتيب الخيارات المناسبة." },
  },
  bacStatus: { label: "وضعك الدراسي", obtained: "لدي بكالوريا أو شهادة ثانوية معادلة", preparing: "ما زلت أستعد للبكالوريا", no_bac: "ليس لدي بكالوريا ولا شهادة ثانوية معادلة" },
  fields: {
    yearHelp: "سنة الحصول عليها أو السنة المتوقعة.",
    averageHelp: "اختياري. المعدل من 20، الفعلي أو المتوقع.",
    lastDiplomaHelp: "اختياري إذا كانت البكالوريا آخر شهادة لديك.",
    cities: "المدن التي تهمك",
    citiesHelp: "اختياري · حتى 3 مدن. يمكنك تغييرها لاحقًا.",
  },
  controls: {
    choose: "اختر…", optional: "اختياري", previous: "رجوع", next: "متابعة",
    summary: "عرض توجيهي", selected: "تم اختيار",
  },
  validation: {
    required: "أكمل الحقول المطلوبة للمتابعة.",
    year: "أدخل سنة صحيحة بين 2000 و2035.",
    average: "يجب أن يكون المعدل بين 0 و20.",
  },
  summary: {
    eyebrow: "نقطة البداية",
    title: "هذا ملخص المعلومات التي أدخلتها.",
    text: "هذا ملخص فقط، وليس قرار قبول أو تقييمًا نهائيًا.",
    noticeTitle: "مهم",
    noticeText: "هذا التوجيه يساعدك على تنظيم البحث. يجب التحقق من الشروط الدقيقة عبر المصادر الرسمية للبرامج والجهات المعنية.",
    edit: "تعديل إجاباتي",
    restart: "البدء من جديد",
    home: "العودة إلى الرئيسية",
    labels: {
      bacStatus: "البكالوريا", bacYear: "سنة البكالوريا", bacTrack: "الشعبة", average: "المعدل",
      diploma: "آخر شهادة", degree: "الدرجة المستهدفة", field: "المجال", german: "الألمانية",
      english: "الإنجليزية", studyLanguage: "لغة الدراسة", budget: "الميزانية", cities: "المدن",
    },
  },
};

const en: OrientationCopy = {
  header: { home: "Home", login: "Sign in", skip: "Skip to content" },
  intro: {
    eyebrow: "Free orientation",
    title: "Where should you start for studying in Germany?",
    lead: "Answer a few simple questions about your studies and languages. No account is required.",
    privacy: "For now, your answers stay only in this browser tab. Nothing is sent to AlmaGo.",
  },
  progress: { label: "Orientation progress", step: "Step" },
  steps: {
    situation: { title: "Your education situation", text: "Start with your latest education level. The orientation also works if you do not have a Baccalaureate." },
    project: { title: "Your study plan", text: "Tell us what you would like to study in Germany." },
    languages: { title: "Your languages", text: "Enter your current levels, even if you are just starting." },
    resources: { title: "Budget and cities", text: "These details will later help us organise relevant paths." },
  },
  bacStatus: { label: "Your education situation", obtained: "I have a Baccalaureate or equivalent school-leaving qualification", preparing: "I am still preparing my Baccalaureate", no_bac: "I do not have a Baccalaureate or equivalent school-leaving qualification" },
  fields: {
    yearHelp: "Year completed or expected.",
    averageHelp: "Optional. Actual or estimated average out of 20.",
    lastDiplomaHelp: "Optional if the Baccalaureate is your latest qualification.",
    cities: "Cities you are interested in",
    citiesHelp: "Optional · up to 3 cities. You can change this later.",
  },
  controls: {
    choose: "Choose…", optional: "Optional", previous: "Back", next: "Continue",
    summary: "See my orientation", selected: "selected",
  },
  validation: {
    required: "Complete the required fields to continue.",
    year: "Enter a valid year between 2000 and 2035.",
    average: "The average must be between 0 and 20.",
  },
  summary: {
    eyebrow: "Your starting point",
    title: "Here is what you told us.",
    text: "This is a summary of your answers, not an admission assessment.",
    noticeTitle: "Keep in mind",
    noticeText: "This orientation helps organise your research. Exact criteria still need to be checked on official programme and authority sources.",
    edit: "Edit my answers",
    restart: "Start again",
    home: "Back to home",
    labels: {
      bacStatus: "Baccalaureate", bacYear: "Baccalaureate year", bacTrack: "Track", average: "Average",
      diploma: "Latest qualification", degree: "Target degree", field: "Subject", german: "German",
      english: "English", studyLanguage: "Study language", budget: "Budget", cities: "Cities",
    },
  },
};

const de: OrientationCopy = {
  header: { home: "Startseite", login: "Anmelden", skip: "Zum Inhalt springen" },
  intro: {
    eyebrow: "Kostenlose Orientierung",
    title: "Wo solltest du für ein Studium in Deutschland anfangen?",
    lead: "Beantworte ein paar einfache Fragen zu deiner Ausbildung und deinen Sprachen. Ein Konto ist nicht nötig.",
    privacy: "Deine Antworten bleiben vorerst nur in diesem Browser-Tab. Es wird nichts an AlmaGo gesendet.",
  },
  progress: { label: "Fortschritt der Orientierung", step: "Schritt" },
  steps: {
    situation: { title: "Deine schulische Situation", text: "Wir beginnen mit deinem letzten Bildungsstand. Die Orientierung funktioniert auch ohne Baccalauréat." },
    project: { title: "Dein Studienplan", text: "Sag uns, was du in Deutschland studieren möchtest." },
    languages: { title: "Deine Sprachen", text: "Gib deine aktuellen Niveaus an, auch wenn du gerade erst anfängst." },
    resources: { title: "Budget und Städte", text: "Diese Angaben helfen später, passende Wege besser einzuordnen." },
  },
  bacStatus: { label: "Deine schulische Situation", obtained: "Ich habe ein Baccalauréat oder einen gleichwertigen Schulabschluss", preparing: "Ich bereite mein Baccalauréat noch vor", no_bac: "Ich habe kein Baccalauréat und keinen gleichwertigen Schulabschluss" },
  fields: {
    yearHelp: "Abschlussjahr oder erwartetes Jahr.",
    averageHelp: "Optional. Tatsächlicher oder geschätzter Durchschnitt von 20.",
    lastDiplomaHelp: "Optional, wenn das Baccalauréat dein letzter Abschluss ist.",
    cities: "Städte, die dich interessieren",
    citiesHelp: "Optional · bis zu 3 Städte. Du kannst das später ändern.",
  },
  controls: {
    choose: "Auswählen…", optional: "Optional", previous: "Zurück", next: "Weiter",
    summary: "Meine Orientierung ansehen", selected: "ausgewählt",
  },
  validation: {
    required: "Fülle die erforderlichen Felder aus, um fortzufahren.",
    year: "Gib ein gültiges Jahr zwischen 2000 und 2035 ein.",
    average: "Der Durchschnitt muss zwischen 0 und 20 liegen.",
  },
  summary: {
    eyebrow: "Dein Ausgangspunkt",
    title: "Das hast du uns angegeben.",
    text: "Dies ist nur eine Zusammenfassung deiner Antworten, noch keine Zulassungsbewertung.",
    noticeTitle: "Wichtig",
    noticeText: "Diese Orientierung hilft, deine Recherche zu strukturieren. Genaue Kriterien müssen in offiziellen Programm- und Behördenquellen geprüft werden.",
    edit: "Antworten bearbeiten",
    restart: "Neu beginnen",
    home: "Zurück zur Startseite",
    labels: {
      bacStatus: "Baccalauréat", bacYear: "Jahr des Baccalauréat", bacTrack: "Fachrichtung", average: "Durchschnitt",
      diploma: "Letzter Abschluss", degree: "Gewünschter Abschluss", field: "Fach", german: "Deutsch",
      english: "Englisch", studyLanguage: "Studiensprache", budget: "Budget", cities: "Städte",
    },
  },
};

export const orientationCopy: Record<Locale, OrientationCopy> = { fr, ar, en, de };
