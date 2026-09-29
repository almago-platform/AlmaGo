import type { Locale } from "@/lib/i18n";
import type { RegulatoryRoute } from "@/lib/regulatory-path-engine";

type RouteDetail = { title: string; description: string };
type ActionCopy = { title: string; description: string; label: string; href: string };

type PathwayCopy = {
  page: {
    eyebrow: string;
    title: string;
    description: string;
    editProject: string;
    routeUnknown: string;
    stepsEyebrow: string;
    stepsTitle: string;
    officialEyebrow: string;
    officialTitle: string;
    officialDescription: string;
    filingCountryNeeded: string;
    revalidation: string;
    noSource: string;
    whyEyebrow: string;
    whyTitle: string;
    nextAction: string;
    legalBoundary: string;
    yes: string;
    no: string;
    missing: string;
    facts: {
      project: string;
      filingCountry: string;
      admission: string;
      preparatoryBasis: string;
      preparationCourse: string;
      pendingEvidence: string;
      replacementEvidence: string;
    };
  };
  routes: Record<RegulatoryRoute, RouteDetail>;
  decisionStatus: Record<string, string>;
  decisionExplanations: Record<string, string>;
  academic: {
    labels: Record<string, string>;
    details: Record<string, string>;
  };
  cards: {
    project: string;
    filled: string;
    complete: string;
    projectPrompt: string;
    defineProject: string;
    edit: string;
    academicBasis: string;
    evidence: string;
    languagePreparation: string;
    courseSelected: string;
    noCourse: string;
    studyPreparation: string;
    standaloneLanguage: string;
    noCourseDetail: string;
    courses: string;
    administrativeStep: string;
    notDetermined: string;
    confirmedDetail: string;
    candidateDetail: string;
    blockedDetail: string;
    finance: string;
    verifiedOptions: (count: number) => string;
    catalogueIncomplete: string;
    financeAvailable: string;
    financeEmpty: string;
    options: string;
    finalSteps: string;
    checklistProgress: (done: number, total: number) => string;
    noChecklist: string;
    checklistAvailable: string;
    checklistEmpty: string;
    checklist: string;
  };
  nextActions: Record<string, ActionCopy>;
  sources: {
    verified: string;
    checkedOn: string;
    publishedAmount: string;
    monthly: string;
    yearly: string;
    reviewBefore: string;
    official: string;
    intlLocale: string;
  };
  unavailable: {
    title: string;
    heading: string;
    text: string;
    retry: string;
    back: string;
  };
};

const fr: PathwayCopy = {
  page: {
    eyebrow: "Mon dossier",
    title: "Mon parcours Allemagne",
    description: "Cette page montre les étapes utiles selon votre dossier. Elle ne constitue ni une décision d’admission ni une décision de visa ou de titre de séjour.",
    editProject: "Modifier mon projet",
    routeUnknown: "Parcours à préciser",
    stepsEyebrow: "Les étapes de votre parcours",
    stepsTitle: "De votre projet aux prochaines démarches",
    officialEyebrow: "Sources officielles",
    officialTitle: "Règles à vérifier pour votre situation",
    officialDescription: "Ces informations viennent de sources officielles vérifiées. Vérifiez-les encore sur la source officielle avant votre démarche.",
    filingCountryNeeded: "Indiquez votre pays de résidence / dépôt dans « Mon projet ». AlmaGo ne déduit pas ce pays de votre nationalité.",
    revalidation: "Revalidation requise",
    noSource: "Aucune source réglementaire actuellement vérifiée n’est disponible pour ce parcours. AlmaGo n’affiche donc pas de règle par défaut.",
    whyEyebrow: "Pourquoi ce résultat ?",
    whyTitle: "Pourquoi cette étape ?",
    nextAction: "Prochaine action",
    legalBoundary: "Les catégories affichées servent à structurer votre dossier AlmaGo. L’admission universitaire et toute décision relative à un visa ou à un titre de séjour restent du ressort des établissements et autorités compétents.",
    yes: "Oui",
    no: "Non",
    missing: "À renseigner",
    facts: {
      project: "Projet défini",
      filingCountry: "Pays de résidence / dépôt",
      admission: "Admission définitive acceptée",
      preparatoryBasis: "Base préparatoire acceptée",
      preparationCourse: "Cours de préparation vérifié publié",
      pendingEvidence: "Preuve en vérification",
      replacementEvidence: "Preuve à remplacer",
    },
  },
  routes: {
    STUDIUM: { title: "Études (Studium)", description: "Votre dossier contient une admission définitive vérifiée. L’autorité compétente décide ensuite du visa ou du séjour." },
    STUDIENVORBEREITUNG: { title: "Préparation aux études (Studienvorbereitung)", description: "Votre dossier contient un document préparatoire accepté et un cours de préparation vérifié. Vérifiez la suite avec la source officielle." },
    STUDIENPLATZSUCHE: { title: "Recherche de place d’études (Studienplatzsuche)", description: "Vous cherchez encore une place d’études. Comparez les programmes et préparez vos candidatures." },
    SPRACHKURS: { title: "Cours de langue (Sprachkurs)", description: "Votre objectif actuel est un cours de langue. Vérifiez les conditions pour votre dossier complet." },
  },
  decisionStatus: { confirmed_basis: "Base vérifiée", candidate: "Parcours à examiner", blocked: "Action requise" },
  decisionExplanations: {
    definitive_admission_accepted: "Une admission définitive a été vérifiée et acceptée comme preuve académique. Cette base correspond au parcours études.",
    preparatory_basis_and_course_confirmed: "Une base académique préparatoire acceptée et un cours préparatoire vérifié sont présents. Cette combinaison correspond au parcours de préparation aux études.",
    preparatory_course_missing: "La base académique préparatoire est acceptée, mais un cours préparatoire vérifié adapté doit encore être identifié avant de confirmer ce parcours.",
    academic_evidence_replacement_required: "Une preuve académique doit être remplacée avant de déterminer le parcours à partir de cette preuve.",
    academic_evidence_pending_review: "Une preuve académique est encore en cours de vérification. Le parcours sera réévalué lorsque son statut sera confirmé.",
    language_only_project: "Votre projet actuel concerne uniquement un séjour linguistique. Le parcours cours de langue correspond à cet objectif et doit encore être vérifié dans le dossier réglementaire.",
    study_place_search_candidate: "Vous cherchez encore une place d’études en Allemagne sans admission acceptée à ce stade. Le parcours de recherche de place est à examiner, sans préjuger de la décision réglementaire finale.",
    project_path_missing_or_unknown: "Le projet d’études ou de langue doit être précisé avant de proposer un parcours réglementaire.",
  },
  academic: {
    labels: {
      definitive: "Admission définitive acceptée",
      preparatory: "Base préparatoire acceptée",
      replacement: "Document à remplacer",
      pending: "Vérification en cours",
      none: "Aucune base acceptée",
    },
    details: {
      definitive: "Une admission définitive officielle a été vérifiée et acceptée comme preuve de parcours.",
      preparatory: "Une admission conditionnelle, Bewerberbestätigung ou correspondance universitaire admissible a été acceptée comme base préparatoire.",
      replacement: "Une preuve académique doit être remplacée avant de pouvoir être utilisée.",
      pending: "Une preuve académique est enregistrée mais doit encore être vérifiée ou complétée.",
      none: "Aucune preuve académique acceptée pour le parcours n’est enregistrée à ce stade.",
    },
  },
  cards: {
    project: "Projet académique", filled: "Renseigné", complete: "À compléter", projectPrompt: "Choisissez votre objectif réel en Allemagne avant de poursuivre.", defineProject: "Définir mon projet", edit: "Modifier",
    academicBasis: "Base académique", evidence: "Voir mes preuves",
    languagePreparation: "Préparation linguistique", courseSelected: "Cours sélectionné", noCourse: "Aucun cours sélectionné", studyPreparation: "Préparation aux études", standaloneLanguage: "Cours de langue autonome", noCourseDetail: "Choisissez explicitement une fiche vérifiée dans le catalogue. AlmaGo ne sélectionne aucun cours à votre place.", courses: "Voir les cours",
    administrativeStep: "Étape administrative à vérifier", notDetermined: "Non déterminé", confirmedDetail: "Une base factuelle vérifiée permet d’identifier ce parcours dans AlmaGo, sans remplacer la décision officielle.", candidateDetail: "Ce parcours est une piste à examiner à partir des informations actuellement enregistrées.", blockedDetail: "Un élément du dossier manque ou doit être vérifié avant d’aller plus loin.",
    finance: "Financement & assurance", verifiedOptions: (count) => `${count} option${count > 1 ? "s" : ""} vérifiée${count > 1 ? "s" : ""}`, catalogueIncomplete: "Catalogue à compléter", financeAvailable: "Consultez les options publiées avec leur source officielle. AlmaGo ne les classe pas et ne déduit pas votre éligibilité.", financeEmpty: "Aucune option vérifiée n’est actuellement publiée. Aucun fournisseur n’est proposé par défaut.", options: "Voir les options",
    finalSteps: "Démarches finales", checklistProgress: (done, total) => `${done}/${total} terminées`, noChecklist: "Aucune étape enregistrée", checklistAvailable: "La checklist regroupe les actions opérationnelles réellement enregistrées dans votre dossier.", checklistEmpty: "Les démarches apparaîtront ici lorsqu’elles seront enregistrées dans votre dossier.", checklist: "Voir mes démarches",
  },
  nextActions: {
    definitive_admission_accepted: { title: "Préparer les démarches après admission", description: "Votre admission acceptée permet de passer aux démarches opérationnelles enregistrées dans votre dossier.", label: "Voir mes démarches", href: "/student/checklist" },
    preparatory_basis_and_course_confirmed: { title: "Organiser la préparation aux études", description: "Votre base académique préparatoire et le catalogue de cours vérifiés permettent d’organiser la suite du dossier.", label: "Voir mes démarches", href: "/student/checklist" },
    preparatory_course_missing: { title: "Identifier un cours préparatoire vérifié", description: "La base académique existe, mais il manque encore un cours de préparation aux études vérifié dans les données disponibles.", label: "Voir les cours", href: "/student/language-courses" },
    academic_evidence_replacement_required: { title: "Remplacer la preuve académique", description: "Corrigez le document signalé avant de recalculer le parcours.", label: "Voir mes documents", href: "/student/documents" },
    academic_evidence_pending_review: { title: "Attendre ou compléter la vérification académique", description: "Une preuve est encore en cours de vérification. Consultez vos documents pour voir son état.", label: "Voir mes documents", href: "/student/documents" },
    language_only_project: { title: "Comparer les cours de langue vérifiés", description: "Votre objectif enregistré est linguistique. Consultez le catalogue avant d’organiser les démarches suivantes.", label: "Voir les cours", href: "/student/language-courses" },
    study_place_search_candidate: { title: "Continuer la recherche de programme", description: "Aucune admission acceptée n’est encore enregistrée. Continuez l’orientation et la préparation de vos candidatures.", label: "Voir mon orientation", href: "/student/orientation" },
    project_path_missing_or_unknown: { title: "Définir votre projet", description: "Précisez d’abord votre objectif en Allemagne pour que le parcours puisse être calculé.", label: "Définir mon projet", href: "/student/project" },
  },
  sources: { verified: "Vérifiée", checkedOn: "Contrôlée le", publishedAmount: "Montant publié", monthly: " / mois", yearly: " / an", reviewBefore: "À revoir avant le", official: "Source officielle", intlLocale: "fr-FR" },
  unavailable: { title: "Parcours temporairement indisponible", heading: "Impossible de calculer le parcours pour le moment", text: "Une donnée nécessaire au calcul n’a pas pu être chargée. AlmaGo ne propose aucun parcours par défaut lorsque les faits du dossier sont indisponibles.", retry: "Réessayer", back: "Retour à mon dossier" },
};

const ar: PathwayCopy = {
  page: {
    eyebrow: "ملفي", title: "مساري للدراسة في ألمانيا", description: "نعرض هنا المسار المناسب بحسب المعلومات المسجلة في ملفك. هذا ليس قرار قبول أو تأشيرة أو إقامة.", editProject: "عدّل هدفك", routeUnknown: "المسار يحتاج إلى تحديد",
    stepsEyebrow: "مراحل مسارك", stepsTitle: "من هدفك إلى الخطوة التالية",
    officialEyebrow: "المصادر الرسمية", officialTitle: "المعلومات الرسمية التي يجب التحقق منها", officialDescription: "نعرض المصدر الرسمي وتاريخ آخر تحقق عندما يتوفران. قبل أي إجراء مهم، راجع المصدر الرسمي مرة أخرى.",
    filingCountryNeeded: "أضف بلد الإقامة / تقديم الإجراءات في «مشروعي». AlmaGo لا يستنتج هذا البلد من جنسيتك.", revalidation: "يجب إعادة التحقق", noSource: "لا يوجد حاليًا مصدر تنظيمي تم التحقق منه لهذا المسار، لذلك لا يعرض AlmaGo قاعدة افتراضية.",
    whyEyebrow: "لماذا ظهرت هذه النتيجة؟", whyTitle: "لماذا هذه الخطوة؟", nextAction: "الخطوة التالية",
    legalBoundary: "تساعدك هذه الفئات على تنظيم ملفك داخل AlmaGo فقط. أما القبول الجامعي وقرارات التأشيرة أو الإقامة فتعود إلى الجامعات والجهات المختصة.",
    yes: "نعم", no: "لا", missing: "يجب إدخاله",
    facts: { project: "تم تحديد المشروع", filingCountry: "بلد الإقامة / التقديم", admission: "قبول نهائي مقبول", preparatoryBasis: "أساس تحضيري مقبول", preparationCourse: "دورة تحضير منشورة وتم التحقق منها", pendingEvidence: "إثبات قيد المراجعة", replacementEvidence: "إثبات يجب استبداله" },
  },
  routes: {
    STUDIUM: { title: "الدراسة (\u2066Studium\u2069)", description: "ملفك يحتوي على قبول نهائي تم التحقق منه. الجهة المختصة هي التي تقرر بعد ذلك بشأن التأشيرة أو الإقامة." },
    STUDIENVORBEREITUNG: { title: "التحضير للدراسة (\u2066Studienvorbereitung\u2069)", description: "ملفك يحتوي على أساس تحضيري مقبول ودورة تحضير تم التحقق منها. راجع المصدر الرسمي للخطوات التالية." },
    STUDIENPLATZSUCHE: { title: "البحث عن مقعد دراسي (\u2066Studienplatzsuche\u2069)", description: "ما زلت تبحث عن مقعد دراسي. قارن البرامج وجهّز طلبات التقديم." },
    SPRACHKURS: { title: "دورة لغة (\u2066Sprachkurs\u2069)", description: "هدفك الحالي هو دورة لغة. تحقق من الشروط المطلوبة لملفك الكامل." },
  },
  decisionStatus: { confirmed_basis: "أساس موثّق", candidate: "مسار يحتاج إلى مراجعة", blocked: "أكمل هذه الخطوة" },
  decisionExplanations: {
    definitive_admission_accepted: "تم التحقق من قبول نهائي وقبوله كإثبات أكاديمي. هذا الأساس يتوافق مع مسار الدراسة.",
    preparatory_basis_and_course_confirmed: "يوجد أساس أكاديمي تحضيري مقبول ودورة تحضير تم التحقق منها. هذه المجموعة تتوافق مع مسار التحضير للدراسة.",
    preparatory_course_missing: "الأساس الأكاديمي التحضيري مقبول، لكن يجب تحديد دورة تحضيرية مناسبة تم التحقق منها قبل تأكيد هذا المسار.",
    academic_evidence_replacement_required: "يجب استبدال إثبات أكاديمي قبل تحديد المسار بناءً عليه.",
    academic_evidence_pending_review: "هناك إثبات أكاديمي ما زال قيد المراجعة. سيُعاد تقييم المسار عند تأكيد حالته.",
    language_only_project: "مشروعك الحالي يخص دراسة اللغة فقط. لذلك يظهر مسار دورة اللغة، مع ضرورة التحقق من المتطلبات الرسمية التي تنطبق على حالتك.",
    study_place_search_candidate: "ما زلت تبحث عن مقعد دراسي في ألمانيا ولا يوجد قبول مقبول في هذه المرحلة. مسار البحث عن مقعد يحتاج إلى مراجعة ولا يعني قرارًا رسميًا نهائيًا.",
    project_path_missing_or_unknown: "يجب تحديد مشروع الدراسة أو اللغة قبل اقتراح مسار.",
  },
  academic: {
    labels: { definitive: "قبول نهائي مقبول", preparatory: "أساس تحضيري مقبول", replacement: "مستند يجب استبداله", pending: "المراجعة جارية", none: "لا يوجد أساس مقبول" },
    details: { definitive: "تم التحقق من قبول نهائي رسمي وقبوله كإثبات للمسار.", preparatory: "تم اعتماد قبول مشروط أو إثبات من الجامعة (\u2066Bewerberbestätigung\u2069) أو مراسلة جامعية مناسبة كأساس تحضيري.", replacement: "يجب استبدال إثبات أكاديمي قبل استخدامه.", pending: "هناك إثبات أكاديمي مسجل لكنه ما زال يحتاج إلى مراجعة أو استكمال.", none: "لا يوجد في هذه المرحلة إثبات أكاديمي مقبول للمسار." },
  },
  cards: {
    project: "المشروع الأكاديمي", filled: "تم إدخاله", complete: "يحتاج إلى استكمال", projectPrompt: "حدّد ما تريد فعله في ألمانيا قبل المتابعة.", defineProject: "حدّد هدفك", edit: "تعديل",
    academicBasis: "الأساس الأكاديمي", evidence: "استعرض إثباتاتك",
    languagePreparation: "التحضير اللغوي", courseSelected: "تم اختيار دورة", noCourse: "لم يتم اختيار دورة", studyPreparation: "تحضير للدراسة", standaloneLanguage: "دورة لغة مستقلة", noCourseDetail: "اختر بنفسك دورة تم التحقق منها من الكتالوج. AlmaGo لا يختار دورة نيابةً عنك.", courses: "استعرض الدورات",
    administrativeStep: "المسار الذي يجب التحقق منه", notDetermined: "غير محدد", confirmedDetail: "توجد وقائع تم التحقق منها تسمح بتحديد هذا المسار داخل AlmaGo، من دون أن تستبدل القرار الرسمي.", candidateDetail: "هذا المسار يحتاج إلى مراجعة بناءً على المعلومات المسجلة حاليًا في ملفك.", blockedDetail: "هناك عنصر ناقص أو يحتاج إلى مراجعة قبل المتابعة.",
    finance: "التمويل والتأمين", verifiedOptions: (count) => `${count} ${count === 1 ? "خيار تم التحقق منه" : "خيارات تم التحقق منها"}`, catalogueIncomplete: "الكتالوج يحتاج إلى استكمال", financeAvailable: "راجع الخيارات المنشورة ومصادرها الرسمية. AlmaGo لا يرتبها ولا يستنتج أهليتك.", financeEmpty: "لا يوجد خيار تم التحقق منه منشور حاليًا. لا يتم اقتراح مقدم خدمة تلقائيًا.", options: "استعرض الخيارات",
    finalSteps: "الخطوات النهائية", checklistProgress: (done, total) => `${done}/${total} مكتملة`, noChecklist: "لا توجد خطوات مسجلة", checklistAvailable: "تجمع قائمة الخطوات الإجراءات العملية المسجلة فعليًا في ملفك.", checklistEmpty: "ستظهر الخطوات هنا عندما تتم إضافتها إلى ملفك.", checklist: "استعرض خطواتك",
  },
  nextActions: {
    definitive_admission_accepted: { title: "تحضير الإجراءات بعد القبول", description: "القبول المقبول يسمح بالانتقال إلى الإجراءات العملية المسجلة في ملفك.", label: "استعرض خطواتك", href: "/student/checklist" },
    preparatory_basis_and_course_confirmed: { title: "تنظيم التحضير للدراسة", description: "الأساس الأكاديمي التحضيري ودورة التحضير التي تم التحقق منها يسمحان بتنظيم بقية الملف.", label: "استعرض خطواتك", href: "/student/checklist" },
    preparatory_course_missing: { title: "تحديد دورة تحضيرية تم التحقق منها", description: "الأساس الأكاديمي موجود، لكن لا تزال هناك حاجة إلى دورة تحضير للدراسة تم التحقق منها.", label: "استعرض الدورات", href: "/student/language-courses" },
    academic_evidence_replacement_required: { title: "استبدال الإثبات الأكاديمي", description: "صحح المستند المطلوب قبل إعادة حساب المسار.", label: "استعرض مستنداتك", href: "/student/documents" },
    academic_evidence_pending_review: { title: "انتظار أو استكمال المراجعة الأكاديمية", description: "هناك إثبات ما زال قيد المراجعة. راجع مستنداتك لمعرفة حالته.", label: "استعرض مستنداتك", href: "/student/documents" },
    language_only_project: { title: "مقارنة دورات اللغة التي تم التحقق منها", description: "هدفك المسجل لغوي. راجع الكتالوج قبل تنظيم الخطوات التالية.", label: "استعرض الدورات", href: "/student/language-courses" },
    study_place_search_candidate: { title: "مواصلة البحث عن برنامج", description: "لا يوجد قبول مقبول مسجل بعد. واصل مقارنة البرامج وتجهيز طلبات التقديم.", label: "استعرض برامجك", href: "/student/orientation" },
    project_path_missing_or_unknown: { title: "تحديد مشروعك", description: "حدد أولاً هدفك في ألمانيا حتى يمكن حساب المسار.", label: "حدّد هدفك", href: "/student/project" },
  },
  sources: { verified: "تم التحقق", checkedOn: "آخر تحقق", publishedAmount: "المبلغ المنشور", monthly: " / شهر", yearly: " / سنة", reviewBefore: "يجب مراجعته قبل", official: "المصدر الرسمي", intlLocale: "ar-TN" },
  unavailable: { title: "المسار غير متاح مؤقتًا", heading: "تعذر حساب المسار الآن", text: "تعذر تحميل معلومة ضرورية للحساب. AlmaGo لا يعرض مسارًا افتراضيًا عندما تكون حقائق الملف غير متاحة.", retry: "إعادة المحاولة", back: "العودة إلى ملفي" },
};

const en: PathwayCopy = {
  page: {
    eyebrow: "My file", title: "My Germany pathway", description: "This page shows useful steps based on your file. It is not an admission, visa or residence decision.", editProject: "Edit my study plan", routeUnknown: "Pathway to be confirmed",
    stepsEyebrow: "Your pathway steps", stepsTitle: "From your study plan to the next steps",
    officialEyebrow: "Official sources", officialTitle: "Rules to check for your situation", officialDescription: "This information comes from checked official sources. Check the official source again before taking action.",
    filingCountryNeeded: "Add your country of residence / application in “My study plan”. AlmaGo does not infer it from your nationality.", revalidation: "Recheck required", noSource: "There is currently no checked regulatory source for this pathway, so AlmaGo does not show a default rule.",
    whyEyebrow: "Why this result?", whyTitle: "Why this step?", nextAction: "Next action",
    legalBoundary: "The categories shown help organise your AlmaGo file. Universities and the responsible authorities still decide admission, visas and residence matters.",
    yes: "Yes", no: "No", missing: "Add this",
    facts: { project: "Study plan defined", filingCountry: "Country of residence / application", admission: "Definitive admission accepted", preparatoryBasis: "Preparatory basis accepted", preparationCourse: "Checked preparation course published", pendingEvidence: "Evidence under review", replacementEvidence: "Evidence to replace" },
  },
  routes: {
    STUDIUM: { title: "University study (Studium)", description: "Your file contains a checked definitive admission. The responsible authority then decides the visa or residence matter." },
    STUDIENVORBEREITUNG: { title: "Study preparation (Studienvorbereitung)", description: "Your file contains an accepted preparatory document and a checked preparation course. Check the official source for the next steps." },
    STUDIENPLATZSUCHE: { title: "Searching for a study place (Studienplatzsuche)", description: "You are still looking for a study place. Compare programmes and prepare your applications." },
    SPRACHKURS: { title: "Language course (Sprachkurs)", description: "Your current goal is a language course. Check the requirements for your full file." },
  },
  decisionStatus: { confirmed_basis: "Checked basis", candidate: "Pathway to review", blocked: "Action required" },
  decisionExplanations: {
    definitive_admission_accepted: "A definitive admission has been checked and accepted as academic evidence. This basis corresponds to the university-study pathway.",
    preparatory_basis_and_course_confirmed: "An accepted preparatory academic basis and a checked preparation course are present. Together they correspond to the study-preparation pathway.",
    preparatory_course_missing: "The preparatory academic basis is accepted, but a suitable checked preparation course still needs to be identified before this pathway can be confirmed.",
    academic_evidence_replacement_required: "Academic evidence must be replaced before a pathway can be determined from it.",
    academic_evidence_pending_review: "Academic evidence is still under review. The pathway will be reassessed once its status is confirmed.",
    language_only_project: "Your current goal is a language-only stay. The language-course pathway matches this goal and still needs to be checked in the regulatory file.",
    study_place_search_candidate: "You are still looking for a study place in Germany without an accepted admission at this stage. The study-place-search pathway should be reviewed without prejudging the final regulatory decision.",
    project_path_missing_or_unknown: "Your study or language goal must be defined before a regulatory pathway can be suggested.",
  },
  academic: {
    labels: { definitive: "Definitive admission accepted", preparatory: "Preparatory basis accepted", replacement: "Document to replace", pending: "Review in progress", none: "No accepted basis" },
    details: { definitive: "An official definitive admission has been checked and accepted as pathway evidence.", preparatory: "A conditional admission, Bewerberbestätigung or acceptable university correspondence has been accepted as a preparatory basis.", replacement: "Academic evidence must be replaced before it can be used.", pending: "Academic evidence is recorded but still needs to be checked or completed.", none: "No academic evidence accepted for the pathway is recorded at this stage." },
  },
  cards: {
    project: "Study plan", filled: "Added", complete: "To complete", projectPrompt: "Choose your actual goal in Germany before continuing.", defineProject: "Define my study plan", edit: "Edit",
    academicBasis: "Academic basis", evidence: "View my evidence",
    languagePreparation: "Language preparation", courseSelected: "Course selected", noCourse: "No course selected", studyPreparation: "Study preparation", standaloneLanguage: "Standalone language course", noCourseDetail: "Explicitly choose a checked catalogue entry. AlmaGo does not choose a course for you.", courses: "View courses",
    administrativeStep: "Administrative step to check", notDetermined: "Not determined", confirmedDetail: "Checked facts allow this pathway to be identified in AlmaGo without replacing the official decision.", candidateDetail: "This pathway is an option to review based on the information currently recorded.", blockedDetail: "Something is missing or needs checking before you can continue.",
    finance: "Funding & insurance", verifiedOptions: (count) => `${count} checked option${count === 1 ? "" : "s"}`, catalogueIncomplete: "Catalogue to complete", financeAvailable: "Review published options with their official sources. AlmaGo does not rank them or infer your eligibility.", financeEmpty: "No checked option is currently published. No provider is selected by default.", options: "View options",
    finalSteps: "Final steps", checklistProgress: (done, total) => `${done}/${total} completed`, noChecklist: "No steps recorded", checklistAvailable: "The checklist brings together operational actions actually recorded in your file.", checklistEmpty: "Steps will appear here when they are recorded in your file.", checklist: "View my steps",
  },
  nextActions: {
    definitive_admission_accepted: { title: "Prepare the steps after admission", description: "Your accepted admission lets you move on to the operational steps recorded in your file.", label: "View my steps", href: "/student/checklist" },
    preparatory_basis_and_course_confirmed: { title: "Organise study preparation", description: "Your preparatory academic basis and checked course allow the next parts of your file to be organised.", label: "View my steps", href: "/student/checklist" },
    preparatory_course_missing: { title: "Find a checked preparation course", description: "The academic basis is present, but a checked study-preparation course is still missing.", label: "View courses", href: "/student/language-courses" },
    academic_evidence_replacement_required: { title: "Replace the academic evidence", description: "Fix the flagged document before recalculating the pathway.", label: "View my documents", href: "/student/documents" },
    academic_evidence_pending_review: { title: "Wait for or complete the academic review", description: "Evidence is still under review. Check your documents to see its status.", label: "View my documents", href: "/student/documents" },
    language_only_project: { title: "Compare checked language courses", description: "Your recorded goal is language study. Review the catalogue before organising the next steps.", label: "View courses", href: "/student/language-courses" },
    study_place_search_candidate: { title: "Keep searching for a programme", description: "No accepted admission is recorded yet. Continue comparing programmes and preparing applications.", label: "View my programmes", href: "/student/orientation" },
    project_path_missing_or_unknown: { title: "Define your study plan", description: "First define your goal in Germany so the pathway can be calculated.", label: "Define my study plan", href: "/student/project" },
  },
  sources: { verified: "Checked", checkedOn: "Checked on", publishedAmount: "Published amount", monthly: " / month", yearly: " / year", reviewBefore: "Recheck before", official: "Official source", intlLocale: "en-GB" },
  unavailable: { title: "Pathway temporarily unavailable", heading: "We cannot calculate the pathway right now", text: "A fact needed for the calculation could not be loaded. AlmaGo does not suggest a default pathway when the file facts are unavailable.", retry: "Try again", back: "Back to my file" },
};

const de: PathwayCopy = {
  page: {
    eyebrow: "Meine Akte", title: "Mein Weg in Deutschland", description: "Diese Seite zeigt passende Schritte auf Basis deiner Akte. Sie ist weder eine Zulassungs- noch eine Visum- oder Aufenthaltsentscheidung.", editProject: "Studienplan bearbeiten", routeUnknown: "Studienweg noch zu klären",
    stepsEyebrow: "Schritte deines Studienwegs", stepsTitle: "Vom Studienplan zu den nächsten Schritten",
    officialEyebrow: "Offizielle Quellen", officialTitle: "Regeln für deine Situation prüfen", officialDescription: "Diese Angaben stammen aus geprüften offiziellen Quellen. Prüfe die offizielle Quelle vor deinem nächsten Schritt erneut.",
    filingCountryNeeded: "Trage dein Wohnsitzland / Land der Antragstellung unter „Mein Studienplan“ ein. AlmaGo leitet es nicht aus deiner Staatsangehörigkeit ab.", revalidation: "Erneute Prüfung erforderlich", noSource: "Für diesen Studienweg ist derzeit keine geprüfte regulatorische Quelle verfügbar. AlmaGo zeigt deshalb keine Standardregel an.",
    whyEyebrow: "Warum dieses Ergebnis?", whyTitle: "Warum dieser Schritt?", nextAction: "Nächste Aufgabe",
    legalBoundary: "Die angezeigten Kategorien strukturieren deine AlmaGo-Akte. Über Zulassung, Visum und Aufenthalt entscheiden weiterhin Hochschulen und zuständige Behörden.",
    yes: "Ja", no: "Nein", missing: "Bitte eintragen",
    facts: { project: "Studienplan festgelegt", filingCountry: "Wohnsitz / Land der Antragstellung", admission: "Endgültige Zulassung akzeptiert", preparatoryBasis: "Vorbereitungsgrundlage akzeptiert", preparationCourse: "Geprüfter Vorbereitungskurs veröffentlicht", pendingEvidence: "Nachweis in Prüfung", replacementEvidence: "Nachweis zu ersetzen" },
  },
  routes: {
    STUDIUM: { title: "Studium", description: "Deine Akte enthält eine geprüfte endgültige Zulassung. Über Visum oder Aufenthalt entscheidet anschließend die zuständige Behörde." },
    STUDIENVORBEREITUNG: { title: "Studienvorbereitung", description: "Deine Akte enthält einen akzeptierten Vorbereitungsnachweis und einen geprüften Vorbereitungskurs. Prüfe die nächsten Schritte in der offiziellen Quelle." },
    STUDIENPLATZSUCHE: { title: "Studienplatzsuche", description: "Du suchst noch einen Studienplatz. Vergleiche Studiengänge und bereite deine Bewerbungen vor." },
    SPRACHKURS: { title: "Sprachkurs", description: "Dein aktuelles Ziel ist ein Sprachkurs. Prüfe die Anforderungen für deine vollständige Akte." },
  },
  decisionStatus: { confirmed_basis: "Grundlage geprüft", candidate: "Studienweg prüfen", blocked: "Aktion erforderlich" },
  decisionExplanations: {
    definitive_admission_accepted: "Eine endgültige Zulassung wurde geprüft und als akademischer Nachweis akzeptiert. Diese Grundlage entspricht dem Weg Studium.",
    preparatory_basis_and_course_confirmed: "Eine akzeptierte akademische Vorbereitungsgrundlage und ein geprüfter Vorbereitungskurs sind vorhanden. Zusammen entsprechen sie dem Weg Studienvorbereitung.",
    preparatory_course_missing: "Die akademische Vorbereitungsgrundlage ist akzeptiert, aber ein passender geprüfter Vorbereitungskurs muss noch gefunden werden, bevor dieser Weg bestätigt werden kann.",
    academic_evidence_replacement_required: "Ein akademischer Nachweis muss ersetzt werden, bevor daraus ein Studienweg bestimmt werden kann.",
    academic_evidence_pending_review: "Ein akademischer Nachweis wird noch geprüft. Der Studienweg wird erneut bewertet, sobald der Status bestätigt ist.",
    language_only_project: "Dein aktuelles Ziel ist ausschließlich ein Sprachaufenthalt. Der Weg Sprachkurs passt zu diesem Ziel und muss im regulatorischen Teil der Akte noch geprüft werden.",
    study_place_search_candidate: "Du suchst noch einen Studienplatz in Deutschland und hast derzeit keine akzeptierte Zulassung. Der Weg Studienplatzsuche ist zu prüfen, ohne die endgültige regulatorische Entscheidung vorwegzunehmen.",
    project_path_missing_or_unknown: "Dein Studien- oder Sprachziel muss festgelegt werden, bevor ein regulatorischer Weg vorgeschlagen werden kann.",
  },
  academic: {
    labels: { definitive: "Endgültige Zulassung akzeptiert", preparatory: "Vorbereitungsgrundlage akzeptiert", replacement: "Dokument zu ersetzen", pending: "Prüfung läuft", none: "Keine akzeptierte Grundlage" },
    details: { definitive: "Eine offizielle endgültige Zulassung wurde geprüft und als Nachweis für den Studienweg akzeptiert.", preparatory: "Eine bedingte Zulassung, Bewerberbestätigung oder zulässige Hochschulkorrespondenz wurde als Vorbereitungsgrundlage akzeptiert.", replacement: "Ein akademischer Nachweis muss ersetzt werden, bevor er verwendet werden kann.", pending: "Ein akademischer Nachweis ist gespeichert, muss aber noch geprüft oder ergänzt werden.", none: "Derzeit ist kein akademischer Nachweis als Grundlage für den Studienweg akzeptiert." },
  },
  cards: {
    project: "Studienplan", filled: "Eingetragen", complete: "Zu ergänzen", projectPrompt: "Lege dein tatsächliches Ziel in Deutschland fest, bevor du weitermachst.", defineProject: "Studienplan festlegen", edit: "Bearbeiten",
    academicBasis: "Akademische Grundlage", evidence: "Nachweise ansehen",
    languagePreparation: "Sprachliche Vorbereitung", courseSelected: "Kurs ausgewählt", noCourse: "Kein Kurs ausgewählt", studyPreparation: "Studienvorbereitung", standaloneLanguage: "Eigenständiger Sprachkurs", noCourseDetail: "Wähle ausdrücklich einen geprüften Eintrag aus dem Katalog. AlmaGo wählt keinen Kurs für dich aus.", courses: "Kurse ansehen",
    administrativeStep: "Zu prüfender administrativer Schritt", notDetermined: "Nicht bestimmt", confirmedDetail: "Geprüfte Tatsachen erlauben die Einordnung dieses Wegs in AlmaGo, ohne die offizielle Entscheidung zu ersetzen.", candidateDetail: "Dieser Weg ist auf Basis der aktuell gespeicherten Angaben zu prüfen.", blockedDetail: "Etwas fehlt oder muss geprüft werden, bevor es weitergeht.",
    finance: "Finanzierung & Versicherung", verifiedOptions: (count) => `${count} geprüfte Option${count === 1 ? "" : "en"}`, catalogueIncomplete: "Katalog noch unvollständig", financeAvailable: "Sieh dir veröffentlichte Optionen mit offizieller Quelle an. AlmaGo bewertet sie nicht und leitet deine Berechtigung nicht ab.", financeEmpty: "Derzeit ist keine geprüfte Option veröffentlicht. Kein Anbieter wird standardmäßig vorgeschlagen.", options: "Optionen ansehen",
    finalSteps: "Abschließende Schritte", checklistProgress: (done, total) => `${done}/${total} erledigt`, noChecklist: "Keine Schritte gespeichert", checklistAvailable: "Die Checkliste enthält die operativen Aufgaben, die tatsächlich in deiner Akte gespeichert sind.", checklistEmpty: "Schritte erscheinen hier, sobald sie in deiner Akte gespeichert werden.", checklist: "Meine Schritte ansehen",
  },
  nextActions: {
    definitive_admission_accepted: { title: "Schritte nach der Zulassung vorbereiten", description: "Mit deiner akzeptierten Zulassung kannst du zu den operativen Schritten in deiner Akte übergehen.", label: "Meine Schritte ansehen", href: "/student/checklist" },
    preparatory_basis_and_course_confirmed: { title: "Studienvorbereitung organisieren", description: "Deine akademische Vorbereitungsgrundlage und der geprüfte Kurs ermöglichen die Planung der nächsten Schritte.", label: "Meine Schritte ansehen", href: "/student/checklist" },
    preparatory_course_missing: { title: "Geprüften Vorbereitungskurs finden", description: "Die akademische Grundlage ist vorhanden, aber ein geprüfter Studienvorbereitungskurs fehlt noch.", label: "Kurse ansehen", href: "/student/language-courses" },
    academic_evidence_replacement_required: { title: "Akademischen Nachweis ersetzen", description: "Korrigiere die markierte Unterlage, bevor der Studienweg neu berechnet wird.", label: "Meine Unterlagen ansehen", href: "/student/documents" },
    academic_evidence_pending_review: { title: "Akademische Prüfung abwarten oder ergänzen", description: "Ein Nachweis wird noch geprüft. Sieh in deinen Unterlagen nach dem aktuellen Status.", label: "Meine Unterlagen ansehen", href: "/student/documents" },
    language_only_project: { title: "Geprüfte Sprachkurse vergleichen", description: "Dein gespeichertes Ziel ist ein Sprachkurs. Sieh dir den Katalog an, bevor du die nächsten Schritte organisierst.", label: "Kurse ansehen", href: "/student/language-courses" },
    study_place_search_candidate: { title: "Weiter nach einem Studiengang suchen", description: "Noch keine akzeptierte Zulassung ist gespeichert. Vergleiche weiter Studiengänge und bereite Bewerbungen vor.", label: "Meine Studiengänge ansehen", href: "/student/orientation" },
    project_path_missing_or_unknown: { title: "Studienplan festlegen", description: "Lege zuerst dein Ziel in Deutschland fest, damit der Studienweg berechnet werden kann.", label: "Studienplan festlegen", href: "/student/project" },
  },
  sources: { verified: "Geprüft", checkedOn: "Geprüft am", publishedAmount: "Veröffentlichter Betrag", monthly: " / Monat", yearly: " / Jahr", reviewBefore: "Erneut prüfen vor", official: "Offizielle Quelle", intlLocale: "de-DE" },
  unavailable: { title: "Studienweg vorübergehend nicht verfügbar", heading: "Der Studienweg kann gerade nicht berechnet werden", text: "Eine für die Berechnung nötige Angabe konnte nicht geladen werden. AlmaGo schlägt keinen Standardweg vor, wenn Tatsachen aus der Akte fehlen.", retry: "Noch einmal versuchen", back: "Zurück zu meiner Akte" },
};

export const studentPathwayCopy: Record<Locale, PathwayCopy> = { fr, ar, en, de };
