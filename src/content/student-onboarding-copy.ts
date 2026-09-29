import type { Locale } from "@/lib/i18n";

type OnboardingCopy = {
  homeAria: string;
  unavailable: {
    eyebrow: string;
    title: string;
    text: string;
    retry: string;
    home: string;
  };
  imageAlt: string;
  dossierEyebrow: string;
  dossierTitle: string;
  currentStep: string;
  progress: string;
  saved: string;
  requiredNote: string;
  stepOf: (step: number) => string;
  steps: readonly { title: string; description: string; guidance: string }[];
  requiredError: string;
  saveError: string;
  networkError: string;
  sections: {
    identity: { title: string; text: string };
    studies: { title: string; text: string };
    languages: { title: string; text: string };
    project: { title: string; text: string };
    review: { title: string; text: string };
  };
  fields: {
    firstName: string;
    lastName: string;
    birthDate: string;
    nationality: string;
    city: string;
    phone: string;
    lastDiploma: string;
    bacTrack: string;
    bacYear: string;
    average: string;
    averagePlaceholder: string;
    institution: string;
    currentStudies: string;
    currentField: string;
    semesters: string;
    german: string;
    english: string;
    french: string;
    languageCertificate: string;
    otherCertificate: string;
    targetDegree: string;
    targetField: string;
    studyLanguage: string;
    targetIntake: string;
    targetIntakePlaceholder: string;
    budget: string;
  };
  review: {
    name: string;
    studies: string;
    languages: string;
    project: string;
    intake: string;
  };
  consent: string;
  mandatory: string;
  afterTitle: string;
  afterText: string;
  back: string;
  saving: string;
  finish: string;
  continue: string;
};

const fr: OnboardingCopy = {
  homeAria: "Retour à l’accueil AlmaGo",
  unavailable: {
    eyebrow: "Configuration du dossier",
    title: "Votre dossier initial est temporairement indisponible",
    text: "Nous n’arrivons pas à charger vos informations pour le moment. Aucune donnée n’a été modifiée.",
    retry: "Réessayer",
    home: "Retour à l’accueil",
  },
  imageAlt: "Des étudiants relisent ensemble des documents devant un bâtiment universitaire.",
  dossierEyebrow: "Votre dossier AlmaGo",
  dossierTitle: "Commencez par votre projet.",
  currentStep: "Étape actuelle",
  progress: "Progression",
  saved: "Vos réponses sont enregistrées",
  requiredNote: "Les champs marqués d’un * sont obligatoires. Les autres peuvent être complétés ou modifiés plus tard.",
  stepOf: (step) => `Étape ${step} sur 5`,
  steps: [
    { title: "Identité", description: "Vos informations principales", guidance: "Indiquez vos informations de base." },
    { title: "Parcours", description: "Votre parcours académique", guidance: "Ajoutez votre dernier diplôme et vos études actuelles." },
    { title: "Langues", description: "Vos niveaux et certificats", guidance: "Indiquez vos niveaux et certificats réels." },
    { title: "Projet", description: "Votre projet d’études", guidance: "Dites ce que vous souhaitez étudier en Allemagne." },
    { title: "Validation", description: "Vérification finale", guidance: "Vérifiez vos informations avant de continuer." },
  ],
  requiredError: "Complétez les champs marqués d’un * avant de continuer.",
  saveError: "Impossible d’enregistrer cette étape pour le moment. Réessayez.",
  networkError: "Impossible d’enregistrer cette étape. Vérifiez votre connexion puis réessayez.",
  sections: {
    identity: { title: "Informations personnelles", text: "Indiquez vos informations de base." },
    studies: { title: "Parcours académique", text: "Indiquez ce que vous savez déjà. Vous ajouterez les documents plus tard." },
    languages: { title: "Langues", text: "Indiquez vos niveaux et certificats réels." },
    project: { title: "Votre projet en Allemagne", text: "Dites ce que vous souhaitez étudier en Allemagne." },
    review: { title: "Vérifiez vos informations", text: "Vérifiez vos informations avant de continuer." },
  },
  fields: {
    firstName: "Prénom", lastName: "Nom", birthDate: "Date de naissance", nationality: "Nationalité",
    city: "Ville actuelle", phone: "Téléphone", lastDiploma: "Dernier diplôme",
    bacTrack: "Type / section du Bac tunisien", bacYear: "Année du Bac", average: "Moyenne générale",
    averagePlaceholder: "Ex. 14,50", institution: "Établissement", currentStudies: "Études universitaires actuelles",
    currentField: "Domaine actuel", semesters: "Nombre de semestres", german: "Allemand", english: "Anglais",
    french: "Français", languageCertificate: "Certificat de langue", otherCertificate: "Autre certificat",
    targetDegree: "Niveau visé", targetField: "Domaine souhaité", studyLanguage: "Langue d’études souhaitée",
    targetIntake: "Semestre / rentrée souhaitée", targetIntakePlaceholder: "Ex. hiver 2027", budget: "Budget indicatif",
  },
  review: { name: "Nom", studies: "Parcours", languages: "Langues", project: "Projet", intake: "Rentrée" },
  consent: "J’accepte que les informations fournies soient utilisées pour traiter mon dossier AlmaGo.",
  mandatory: "Obligatoire.",
  afterTitle: "Après validation",
  afterText: "Vous ouvrirez votre espace. Vous pourrez ajouter vos documents, comparer des programmes et suivre vos étapes.",
  back: "Retour",
  saving: "Enregistrement...",
  finish: "Confirmer et ouvrir mon espace",
  continue: "Continuer",
};

const ar: OnboardingCopy = {
  homeAria: "العودة إلى الصفحة الرئيسية لـ AlmaGo",
  unavailable: {
    eyebrow: "إعداد الملف",
    title: "تعذر فتح إعداد ملفك مؤقتًا",
    text: "تعذر تحميل معلوماتك الآن. لم يتم تعديل أي بيانات.",
    retry: "إعادة المحاولة",
    home: "العودة إلى الصفحة الرئيسية",
  },
  imageAlt: "طلاب يراجعون مستندات معًا أمام مبنى جامعي.",
  dossierEyebrow: "ملفك على AlmaGo",
  dossierTitle: "ابدأ بالمعلومات الأساسية عنك وعن هدفك.",
  currentStep: "أنت الآن في",
  progress: "التقدم",
  saved: "نحفظ إجاباتك أثناء التقدّم",
  requiredNote: "الحقول التي تحمل * إلزامية. يمكنك إكمال بقية المعلومات أو تعديلها لاحقًا.",
  stepOf: (step) => `الخطوة ${step} من 5`,
  steps: [
    { title: "معلوماتي", description: "بياناتك الأساسية", guidance: "أدخل بياناتك الأساسية كما هي في مستنداتك." },
    { title: "دراستي", description: "مسارك الدراسي", guidance: "أدخل آخر شهادة حصلت عليها ودراستك الحالية." },
    { title: "لغاتي", description: "مستوياتك وشهاداتك", guidance: "أدخل مستواك الحقيقي والشهادات التي لديك." },
    { title: "هدفي", description: "مشروعك في ألمانيا", guidance: "حدّد ما تريد دراسته ومتى تريد أن تبدأ." },
    { title: "المراجعة", description: "تأكد من معلوماتك", guidance: "راجع كل المعلومات قبل فتح ملفك." },
  ],
  requiredError: "أكمل الحقول التي تحمل * قبل المتابعة.",
  saveError: "تعذر حفظ هذه الخطوة الآن. حاول مرة أخرى.",
  networkError: "تعذر حفظ هذه الخطوة. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.",
  sections: {
    identity: { title: "المعلومات الشخصية", text: "أدخل معلوماتك الأساسية." },
    studies: { title: "المسار الدراسي", text: "أدخل ما تعرفه الآن. يمكنك إضافة المستندات لاحقًا." },
    languages: { title: "اللغات", text: "أدخل مستوياتك وشهاداتك الفعلية." },
    project: { title: "مشروعك في ألمانيا", text: "أخبرنا بما تريد دراسته في ألمانيا." },
    review: { title: "راجع معلوماتك", text: "تأكد من المعلومات قبل المتابعة." },
  },
  fields: {
    firstName: "الاسم الأول", lastName: "اسم العائلة", birthDate: "تاريخ الميلاد", nationality: "الجنسية",
    city: "المدينة الحالية", phone: "رقم الهاتف", lastDiploma: "آخر شهادة",
    bacTrack: "شعبة البكالوريا التونسية", bacYear: "سنة البكالوريا", average: "المعدل العام",
    averagePlaceholder: "مثال: 14.50", institution: "المؤسسة التعليمية", currentStudies: "الدراسة الجامعية الحالية",
    currentField: "التخصص الحالي", semesters: "عدد السداسيات", german: "الألمانية", english: "الإنجليزية",
    french: "الفرنسية", languageCertificate: "شهادة اللغة", otherCertificate: "شهادة أخرى",
    targetDegree: "الشهادة المطلوبة", targetField: "المجال المطلوب", studyLanguage: "لغة الدراسة المطلوبة",
    targetIntake: "موعد بدء الدراسة", targetIntakePlaceholder: "مثال: شتاء 2027", budget: "الميزانية التقريبية",
  },
  review: { name: "الاسم", studies: "الدراسة", languages: "اللغات", project: "المشروع", intake: "موعد البداية" },
  consent: "أوافق على استخدام المعلومات التي قدمتها لمعالجة ملفي في AlmaGo.",
  mandatory: "إلزامي.",
  afterTitle: "بعد التأكيد",
  afterText: "بعد التأكيد ستفتح مساحتك، ويمكنك إضافة مستنداتك ومقارنة البرامج ومتابعة خطواتك.",
  back: "السابق",
  saving: "جارٍ الحفظ...",
  finish: "تأكيد وفتح ملفك",
  continue: "متابعة",
};

const en: OnboardingCopy = {
  homeAria: "Back to AlmaGo home",
  unavailable: {
    eyebrow: "File setup",
    title: "Your initial file is temporarily unavailable",
    text: "We cannot load your information right now. No data has been changed.",
    retry: "Try again",
    home: "Back to home",
  },
  imageAlt: "Students reviewing documents together outside a university building.",
  dossierEyebrow: "Your AlmaGo file",
  dossierTitle: "Start with your study plan.",
  currentStep: "Current step",
  progress: "Progress",
  saved: "Your answers are saved",
  requiredNote: "Fields marked with * are required. You can complete or change the others later.",
  stepOf: (step) => `Step ${step} of 5`,
  steps: [
    { title: "About you", description: "Your basic details", guidance: "Add your basic information." },
    { title: "Education", description: "Your academic background", guidance: "Add your latest qualification and current studies." },
    { title: "Languages", description: "Your levels and certificates", guidance: "Add your actual language levels and certificates." },
    { title: "Study plan", description: "What you want to study", guidance: "Tell us what you want to study in Germany." },
    { title: "Review", description: "Final check", guidance: "Check your information before continuing." },
  ],
  requiredError: "Complete the fields marked with * before continuing.",
  saveError: "We could not save this step. Please try again.",
  networkError: "We could not save this step. Check your connection and try again.",
  sections: {
    identity: { title: "Personal details", text: "Add your basic information." },
    studies: { title: "Education", text: "Add what you know now. You can upload documents later." },
    languages: { title: "Languages", text: "Add your actual language levels and certificates." },
    project: { title: "Your study plan for Germany", text: "Tell us what you want to study in Germany." },
    review: { title: "Check your information", text: "Review your details before continuing." },
  },
  fields: {
    firstName: "First name", lastName: "Last name", birthDate: "Date of birth", nationality: "Nationality",
    city: "Current city", phone: "Phone", lastDiploma: "Latest qualification",
    bacTrack: "Tunisian Baccalaureate track", bacYear: "Baccalaureate year", average: "Overall average",
    averagePlaceholder: "e.g. 14.50", institution: "School / university", currentStudies: "Current university studies",
    currentField: "Current subject", semesters: "Number of semesters", german: "German", english: "English",
    french: "French", languageCertificate: "Language certificate", otherCertificate: "Other certificate",
    targetDegree: "Target degree", targetField: "Target subject", studyLanguage: "Preferred study language",
    targetIntake: "Preferred intake", targetIntakePlaceholder: "e.g. Winter 2027", budget: "Estimated budget",
  },
  review: { name: "Name", studies: "Education", languages: "Languages", project: "Study plan", intake: "Intake" },
  consent: "I agree that the information I provide may be used to process my AlmaGo file.",
  mandatory: "Required.",
  afterTitle: "After you confirm",
  afterText: "Your student space will open. You can then add documents, compare programmes and follow your next steps.",
  back: "Back",
  saving: "Saving...",
  finish: "Confirm and open my space",
  continue: "Continue",
};

const de: OnboardingCopy = {
  homeAria: "Zur AlmaGo-Startseite",
  unavailable: {
    eyebrow: "Akte einrichten",
    title: "Deine erste Akte ist vorübergehend nicht verfügbar",
    text: "Deine Angaben können gerade nicht geladen werden. Es wurden keine Daten geändert.",
    retry: "Noch einmal versuchen",
    home: "Zur Startseite",
  },
  imageAlt: "Studierende prüfen gemeinsam Unterlagen vor einem Hochschulgebäude.",
  dossierEyebrow: "Deine AlmaGo-Akte",
  dossierTitle: "Starte mit deinem Studienplan.",
  currentStep: "Aktueller Schritt",
  progress: "Fortschritt",
  saved: "Deine Antworten werden gespeichert",
  requiredNote: "Felder mit * sind Pflichtfelder. Die anderen Angaben kannst du später ergänzen oder ändern.",
  stepOf: (step) => `Schritt ${step} von 5`,
  steps: [
    { title: "Persönliche Angaben", description: "Deine wichtigsten Daten", guidance: "Trage deine wichtigsten Angaben ein." },
    { title: "Ausbildung", description: "Dein bisheriger Bildungsweg", guidance: "Trage deinen letzten Abschluss und dein aktuelles Studium ein." },
    { title: "Sprachen", description: "Sprachniveaus und Nachweise", guidance: "Trage deine tatsächlichen Niveaus und Zertifikate ein." },
    { title: "Studienplan", description: "Was du studieren möchtest", guidance: "Sag uns, was du in Deutschland studieren möchtest." },
    { title: "Prüfen", description: "Letzte Kontrolle", guidance: "Prüfe deine Angaben, bevor du weitermachst." },
  ],
  requiredError: "Fülle die mit * markierten Felder aus, bevor du weitermachst.",
  saveError: "Dieser Schritt konnte gerade nicht gespeichert werden. Bitte versuche es erneut.",
  networkError: "Dieser Schritt konnte nicht gespeichert werden. Prüfe deine Verbindung und versuche es erneut.",
  sections: {
    identity: { title: "Persönliche Angaben", text: "Trage deine wichtigsten Angaben ein." },
    studies: { title: "Ausbildung", text: "Trage ein, was du schon weißt. Unterlagen kannst du später hochladen." },
    languages: { title: "Sprachen", text: "Trage deine tatsächlichen Niveaus und Zertifikate ein." },
    project: { title: "Dein Studienplan für Deutschland", text: "Sag uns, was du in Deutschland studieren möchtest." },
    review: { title: "Angaben prüfen", text: "Kontrolliere deine Angaben, bevor du weitermachst." },
  },
  fields: {
    firstName: "Vorname", lastName: "Nachname", birthDate: "Geburtsdatum", nationality: "Staatsangehörigkeit",
    city: "Aktueller Wohnort", phone: "Telefon", lastDiploma: "Letzter Abschluss",
    bacTrack: "Fachrichtung des tunesischen Baccalauréat", bacYear: "Jahr des Baccalauréat", average: "Gesamtnote",
    averagePlaceholder: "z. B. 14,50", institution: "Schule / Hochschule", currentStudies: "Aktuelles Hochschulstudium",
    currentField: "Aktuelles Fach", semesters: "Anzahl der Semester", german: "Deutsch", english: "Englisch",
    french: "Französisch", languageCertificate: "Sprachzertifikat", otherCertificate: "Anderes Zertifikat",
    targetDegree: "Gewünschter Abschluss", targetField: "Gewünschtes Fach", studyLanguage: "Gewünschte Studiensprache",
    targetIntake: "Gewünschter Studienstart", targetIntakePlaceholder: "z. B. Wintersemester 2027", budget: "Ungefähres Budget",
  },
  review: { name: "Name", studies: "Ausbildung", languages: "Sprachen", project: "Studienplan", intake: "Studienstart" },
  consent: "Ich stimme zu, dass meine Angaben zur Bearbeitung meiner AlmaGo-Akte verwendet werden.",
  mandatory: "Pflicht.",
  afterTitle: "Nach der Bestätigung",
  afterText: "Dein Studierendenbereich wird geöffnet. Danach kannst du Unterlagen hinzufügen, Studiengänge vergleichen und deine Schritte verfolgen.",
  back: "Zurück",
  saving: "Wird gespeichert...",
  finish: "Bestätigen und Bereich öffnen",
  continue: "Weiter",
};

export const studentOnboardingCopy: Record<Locale, OnboardingCopy> = { fr, ar, en, de };
