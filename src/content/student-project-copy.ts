import type { Locale } from "@/lib/i18n";
import type { ProjectPath } from "@/lib/student/project";

type ProjectCopy = {
  header: { eyebrow: string; title: string; description: string };
  choosePath: string;
  choosePathError: string;
  saveError: string;
  saved: string;
  paths: Record<ProjectPath, { title: string; description: string }>;
  fields: {
    currentDiploma: string;
    currentDiplomaPlaceholder: string;
    diplomaCountry: string;
    diplomaCountryPlaceholder: string;
    diplomaCountryHint: string;
    filingCountry: string;
    filingCountryPlaceholder: string;
    filingCountryHint: string;
    targetDegree: string;
    targetDegreePlaceholder: string;
    targetField: string;
    targetFieldPlaceholder: string;
    targetIntake: string;
    targetIntakePlaceholder: string;
    studyLanguage: string;
    studyLanguagePlaceholder: string;
    preferredCities: string;
    preferredCitiesPlaceholder: string;
    preferredCitiesHint: string;
    currentGerman: string;
    currentGermanPlaceholder: string;
    targetGerman: string;
    targetGermanPlaceholder: string;
    monthlyBudget: string;
    monthlyBudgetPlaceholder: string;
    currencyHint: string;
    objective: string;
    objectivePlaceholder: string;
    notes: string;
  };
  saving: string;
  save: string;
};

const fr: ProjectCopy = {
  header: {
    eyebrow: "Mon dossier",
    title: "Quel est votre projet ?",
    description: "Décrivez votre situation et votre objectif. Ces informations servent à afficher les étapes utiles. Vous n’avez pas à choisir un type de visa.",
  },
  choosePath: "Quel accompagnement recherchez-vous ?",
  choosePathError: "Choisissez d’abord votre parcours.",
  saveError: "Enregistrement impossible.",
  saved: "Votre projet a été enregistré.",
  paths: {
    university_search: { title: "Trouver une université", description: "Chercher des programmes qui correspondent à votre projet." },
    german_preparation_and_studies: { title: "Allemand + études", description: "Préparer votre allemand avant vos études." },
    master_and_language: { title: "Master + langue", description: "Chercher un Master et préparer la langue demandée." },
    language_only: { title: "Langue uniquement", description: "Préparer un séjour pour apprendre l’allemand, sans candidature universitaire pour le moment." },
  },
  fields: {
    currentDiploma: "Diplôme actuel",
    currentDiplomaPlaceholder: "Ex. Licence en informatique",
    diplomaCountry: "Pays du diplôme",
    diplomaCountryPlaceholder: "Ex. TN",
    diplomaCountryHint: "Code pays à 2 lettres, par exemple TN, FR ou DE.",
    filingCountry: "Pays de résidence / dépôt",
    filingCountryPlaceholder: "Ex. TN",
    filingCountryHint: "Pays depuis lequel vous prévoyez de faire vos démarches. AlmaGo ne le déduit pas de votre nationalité.",
    targetDegree: "Diplôme visé",
    targetDegreePlaceholder: "Ex. Master",
    targetField: "Domaine visé",
    targetFieldPlaceholder: "Ex. Informatique",
    targetIntake: "Rentrée souhaitée",
    targetIntakePlaceholder: "Ex. Hiver 2027",
    studyLanguage: "Langue d’études souhaitée",
    studyLanguagePlaceholder: "Ex. allemand ou anglais",
    preferredCities: "Villes préférées",
    preferredCitiesPlaceholder: "Berlin, Munich…",
    preferredCitiesHint: "Séparez les villes par une virgule.",
    currentGerman: "Niveau d’allemand actuel",
    currentGermanPlaceholder: "Ex. A2",
    targetGerman: "Niveau d’allemand visé",
    targetGermanPlaceholder: "Ex. B2",
    monthlyBudget: "Budget mensuel prévu",
    monthlyBudgetPlaceholder: "Ex. 1200",
    currencyHint: "La devise enregistrée est toujours EUR.",
    objective: "Votre objectif actuel",
    objectivePlaceholder: "Expliquez ce que vous souhaitez réellement faire en Allemagne.",
    notes: "Précisions utiles",
  },
  saving: "Enregistrement…",
  save: "Enregistrer mon projet",
};

const ar: ProjectCopy = {
  header: {
    eyebrow: "ملفي",
    title: "حدّد مشروعك في ألمانيا",
    description: "حدّد وضعك الحالي وهدفك. نستخدم هذه المعلومات لعرض الخطوات المناسبة لملفك، ولا تحتاج إلى اختيار نوع التأشيرة بنفسك.",
  },
  choosePath: "ما هدفك الحالي في ألمانيا؟",
  choosePathError: "اختر مسارك أولاً.",
  saveError: "تعذر حفظ المشروع.",
  saved: "تم حفظ مشروعك.",
  paths: {
    university_search: { title: "البحث عن جامعة", description: "ابحث عن برامج تناسب مشروعك الدراسي." },
    german_preparation_and_studies: { title: "التحضير بالألمانية قبل الدراسة", description: "حضّر مستواك في الألمانية قبل بدء دراستك الجامعية." },
    master_and_language: { title: "ماجستير مع التحضير اللغوي", description: "ابحث عن برنامج ماجستير وحضّر مستوى اللغة الذي يطلبه البرنامج." },
    language_only: { title: "دورة لغة فقط", description: "اختر هذا المسار إذا كان هدفك الحالي دراسة الألمانية فقط، من دون تقديم جامعي في هذه المرحلة." },
  },
  fields: {
    currentDiploma: "شهادتك الحالية",
    currentDiplomaPlaceholder: "مثال: إجازة في الإعلامية",
    diplomaCountry: "بلد الشهادة",
    diplomaCountryPlaceholder: "مثال: TN",
    diplomaCountryHint: "استخدم رمز البلد من حرفين، مثل TN أو FR أو DE.",
    filingCountry: "بلد الإقامة / تقديم الإجراءات",
    filingCountryPlaceholder: "مثال: TN",
    filingCountryHint: "البلد الذي تنوي القيام منه بإجراءاتك. AlmaGo لا يستنتجه من جنسيتك.",
    targetDegree: "الشهادة التي تستهدفها",
    targetDegreePlaceholder: "مثال: ماجستير",
    targetField: "المجال الذي تريده",
    targetFieldPlaceholder: "مثال: علوم الحاسوب",
    targetIntake: "موعد بدء الدراسة",
    targetIntakePlaceholder: "مثال: الفصل الشتوي 2027",
    studyLanguage: "لغة الدراسة التي تفضلها",
    studyLanguagePlaceholder: "مثال: الألمانية أو الإنجليزية",
    preferredCities: "المدن المفضلة",
    preferredCitiesPlaceholder: "برلين، ميونخ…",
    preferredCitiesHint: "افصل بين المدن بفاصلة.",
    currentGerman: "مستواك الحالي في الألمانية",
    currentGermanPlaceholder: "مثال: A2",
    targetGerman: "المستوى الذي تستهدفه في الألمانية",
    targetGermanPlaceholder: "مثال: B2",
    monthlyBudget: "ميزانيتك الشهرية المتوقعة",
    monthlyBudgetPlaceholder: "مثال: 1200",
    currencyHint: "يتم حفظ الميزانية دائماً باليورو (EUR).",
    objective: "ما الذي تريد تحقيقه؟",
    objectivePlaceholder: "اشرح باختصار ما الذي تريد فعله فعلياً في ألمانيا.",
    notes: "معلومات إضافية مفيدة",
  },
  saving: "جارٍ الحفظ…",
  save: "حفظ مشروعي",
};

const en: ProjectCopy = {
  header: {
    eyebrow: "My file",
    title: "What are you planning to do?",
    description: "Tell us about your situation and goal. We use this to show the steps that matter. You do not need to choose a visa category yourself.",
  },
  choosePath: "What do you want help with?",
  choosePathError: "Choose your path first.",
  saveError: "We could not save your study plan.",
  saved: "Your study plan has been saved.",
  paths: {
    university_search: { title: "Find a university", description: "Look for programmes that fit your study plan." },
    german_preparation_and_studies: { title: "German + university study", description: "Prepare your German before starting your studies." },
    master_and_language: { title: "Master’s + language", description: "Find a Master’s programme and prepare the language level it requires." },
    language_only: { title: "Language course only", description: "Plan a stay to learn German without a university application at this stage." },
  },
  fields: {
    currentDiploma: "Current qualification",
    currentDiplomaPlaceholder: "e.g. Bachelor’s in Computer Science",
    diplomaCountry: "Country of qualification",
    diplomaCountryPlaceholder: "e.g. TN",
    diplomaCountryHint: "Use the 2-letter country code, such as TN, FR or DE.",
    filingCountry: "Country of residence / application",
    filingCountryPlaceholder: "e.g. TN",
    filingCountryHint: "The country where you plan to complete your formalities. AlmaGo does not infer this from your nationality.",
    targetDegree: "Target degree",
    targetDegreePlaceholder: "e.g. Master",
    targetField: "Target subject",
    targetFieldPlaceholder: "e.g. Computer Science",
    targetIntake: "Preferred intake",
    targetIntakePlaceholder: "e.g. Winter 2027",
    studyLanguage: "Preferred study language",
    studyLanguagePlaceholder: "e.g. German or English",
    preferredCities: "Preferred cities",
    preferredCitiesPlaceholder: "Berlin, Munich…",
    preferredCitiesHint: "Separate cities with commas.",
    currentGerman: "Current German level",
    currentGermanPlaceholder: "e.g. A2",
    targetGerman: "Target German level",
    targetGermanPlaceholder: "e.g. B2",
    monthlyBudget: "Planned monthly budget",
    monthlyBudgetPlaceholder: "e.g. 1200",
    currencyHint: "The saved currency is always EUR.",
    objective: "Your current goal",
    objectivePlaceholder: "Describe what you actually want to do in Germany.",
    notes: "Anything else we should know",
  },
  saving: "Saving…",
  save: "Save my study plan",
};

const de: ProjectCopy = {
  header: {
    eyebrow: "Meine Akte",
    title: "Was hast du vor?",
    description: "Beschreibe deine Situation und dein Ziel. Daraus zeigen wir dir die passenden Schritte. Du musst selbst keine Visumkategorie auswählen.",
  },
  choosePath: "Wobei möchtest du Unterstützung?",
  choosePathError: "Wähle zuerst deinen Weg.",
  saveError: "Dein Studienplan konnte nicht gespeichert werden.",
  saved: "Dein Studienplan wurde gespeichert.",
  paths: {
    university_search: { title: "Hochschule finden", description: "Finde Studiengänge, die zu deinem Studienplan passen." },
    german_preparation_and_studies: { title: "Deutsch + Studium", description: "Bereite deine Deutschkenntnisse vor dem Studium vor." },
    master_and_language: { title: "Master + Sprache", description: "Finde einen Masterstudiengang und bereite das geforderte Sprachniveau vor." },
    language_only: { title: "Nur Sprachkurs", description: "Plane einen Aufenthalt zum Deutschlernen, ohne derzeit eine Hochschulbewerbung vorzubereiten." },
  },
  fields: {
    currentDiploma: "Aktueller Abschluss",
    currentDiplomaPlaceholder: "z. B. Bachelor Informatik",
    diplomaCountry: "Land des Abschlusses",
    diplomaCountryPlaceholder: "z. B. TN",
    diplomaCountryHint: "Verwende den zweistelligen Ländercode, z. B. TN, FR oder DE.",
    filingCountry: "Wohnsitz / Land der Antragstellung",
    filingCountryPlaceholder: "z. B. TN",
    filingCountryHint: "Das Land, von dem aus du deine Formalitäten erledigen möchtest. AlmaGo leitet es nicht aus deiner Staatsangehörigkeit ab.",
    targetDegree: "Gewünschter Abschluss",
    targetDegreePlaceholder: "z. B. Master",
    targetField: "Gewünschtes Fach",
    targetFieldPlaceholder: "z. B. Informatik",
    targetIntake: "Gewünschter Studienstart",
    targetIntakePlaceholder: "z. B. Wintersemester 2027",
    studyLanguage: "Gewünschte Studiensprache",
    studyLanguagePlaceholder: "z. B. Deutsch oder Englisch",
    preferredCities: "Bevorzugte Städte",
    preferredCitiesPlaceholder: "برلين، ميونخ…",
    preferredCitiesHint: "Trenne mehrere Städte durch Kommas.",
    currentGerman: "Aktuelles Deutschniveau",
    currentGermanPlaceholder: "z. B. A2",
    targetGerman: "Angestrebtes Deutschniveau",
    targetGermanPlaceholder: "z. B. B2",
    monthlyBudget: "Geplantes Monatsbudget",
    monthlyBudgetPlaceholder: "z. B. 1200",
    currencyHint: "Das Budget wird immer in EUR gespeichert.",
    objective: "Dein aktuelles Ziel",
    objectivePlaceholder: "Beschreibe, was du in Deutschland tatsächlich vorhast.",
    notes: "Weitere hilfreiche Angaben",
  },
  saving: "Wird gespeichert…",
  save: "Studienplan speichern",
};

export const studentProjectCopy: Record<Locale, ProjectCopy> = { fr, ar, en, de };
