import type { Locale } from "@/lib/i18n";

type OrientationCopy = {
  page: {
    eyebrow: string;
    title: string;
    description: string;
    applications: string;
    guidanceEyebrow: string;
    guidanceTitle: string;
    guidanceDescription: string;
    guidancePoints: readonly [string, string, string];
    imageAlt: string;
    imageCredit: string;
    applicationsStateError: string;
    criteriaStateError: string;
    unavailableTitle: string;
    unavailableText: string;
    retry: string;
    back: string;
  };
  panel: {
    recommendationLabels: Record<string, string>;
    addError: string;
    addSuccess: string;
    networkError: string;
    loadTitle: string;
    retryVerification: string;
    applicationStateDetail: string;
    criteriaStateDetail: string;
    summaryAria: string;
    programsEyebrow: string;
    programsAvailable: string;
    noPrograms: string;
    compareTitle: string;
    interestStateUnknown: string;
    selectedPrograms: string;
    noProgramsText: string;
    startWith: (name: string) => string;
    lookNow: string;
    fieldUnknown: string;
    summaryPrograms: string;
    proposed: string;
    compare: string;
    decide: string;
    added: string;
    unavailable: string;
    trackingStarted: string;
    none: string;
    orientationSummaryAria: string;
    emptyTitle: string;
    emptyText: string;
    profile: string;
    listEyebrow: string;
    listTitle: string;
    listDescription: string;
    universityUnknown: string;
    addedToApplications: string;
    proposedBoundary: string;
    teachingLanguage: string;
    winterDeadline: string;
    summerDeadline: string;
    diplomaRequired: string;
    officialCheck: string;
    officialSource: string;
    saving: string;
    unavailableAction: string;
    addToApplications: string;
    pointToComplete: string;
    verificationNeeded: string;
    missingInformation: string;
    criteriaCompared: string;
    minimumEcts: string;
    minimumGrade: string;
    priorDegree: string;
    intake: string;
    deadline: string;
    programCriterion: string;
    deadlineOpen: string;
    deadlinePassed: string;
    criterionMet: string;
    pointToCheck: string;
    check: string;
    missing: string;
    comparisonAria: string;
    comparisonBoundary: string;
    applicationRoute: string;
    routeDirect: string;
    routeUniAssist: string;
    routeVpd: string;
    routeUnknown: string;
    whyProgram: string;
    recordedCriteria: string;
    languageLevels: string;
    institution: string;
    german: string;
    english: string;
    languagePrefix: string;
    creditsPrefix: string;
    languageNames: Record<string, string>;
    subjectNames: Record<string, string>;
    yourInformation: string;
    publishedCriterion: string;
    programLeadBoundary: string;
    officialVerify: string;
    officialSourceAria: (name: string) => string;
    statusLabels: Record<string, string>;
    reasonLabels: Record<string, string>;
    requirementLabels: Record<string, string>;
  };
};

const fr: OrientationCopy = {
  page: {
    eyebrow: "Mon dossier",
    title: "Mes programmes",
    description: "Comparez les programmes proposés et vérifiez les critères avant de choisir. Un programme proposé n’est pas une admission.",
    applications: "Mes candidatures",
    guidanceEyebrow: "Pour choisir un programme",
    guidanceTitle: "Comparez avant de choisir.",
    guidanceDescription: "Vérifiez la langue, les critères, la date limite et la source officielle.",
    guidancePoints: ["Vérifier les critères du programme.", "Regarder la date limite et la langue.", "Choisir si vous voulez le suivre dans vos candidatures."],
    imageAlt: "Groupe d’étudiants échangeant dans un amphithéâtre universitaire.",
    imageCredit: "Photo : Vitaly Gariev / Unsplash",
    applicationsStateError: "Impossible de vérifier vos intérêts enregistrés pour le moment.",
    criteriaStateError: "Impossible de comparer les critères avec votre projet pour le moment.",
    unavailableTitle: "Orientation temporairement indisponible",
    unavailableText: "Impossible d’afficher vos programmes pour le moment. Réessayez.",
    retry: "Réessayer",
    back: "Retour à mon dossier",
  },
  panel: {
    recommendationLabels: {
      recommended: "Programme proposé",
      possible: "Programme possible",
      ambitious: "Programme ambitieux",
      missing_requirements: "Conditions à vérifier",
      not_recommended: "Non recommandé",
    },
    addError: "Impossible d’ajouter ce programme aux candidatures.",
    addSuccess: "Ce programme a été ajouté à vos candidatures. Il n’a pas été envoyé à l’université.",
    networkError: "Erreur réseau. Vérifiez votre connexion puis réessayez.",
    loadTitle: "Recommandations indisponibles",
    retryVerification: "Réessayer la vérification",
    applicationStateDetail: "Vos recommandations restent visibles, mais les boutons d’intérêt sont désactivés jusqu’à ce que l’état puisse être revérifié.",
    criteriaStateDetail: "Les programmes restent visibles. Les comparaisons personnalisées réapparaîtront dès que votre projet pourra être relu.",
    summaryAria: "Synthèse orientation",
    programsEyebrow: "Vos programmes",
    programsAvailable: "Programmes disponibles",
    noPrograms: "Aucun programme proposé",
    compareTitle: "Comparez avant de décider.",
    interestStateUnknown: "Vos recommandations restent visibles, mais nous ne pouvons pas confirmer l’état de vos intérêts enregistrés pour le moment.",
    selectedPrograms: "Les programmes choisis sont déjà visibles dans vos candidatures.",
    noProgramsText: "Aucun programme n’est proposé pour le moment. Vérifiez que votre profil contient les informations utiles.",
    startWith: (name) => `Commencez par ${name}. Vérifiez les critères et la source officielle avant de l’ajouter à vos candidatures.`,
    lookNow: "À regarder maintenant",
    fieldUnknown: "Domaine à préciser",
    summaryPrograms: "Programmes",
    proposed: "Proposés",
    compare: "À comparer",
    decide: "À décider",
    added: "Ajoutés aux candidatures",
    unavailable: "Indisponible",
    trackingStarted: "Suivi démarré",
    none: "Aucun",
    orientationSummaryAria: "Résumé de l’orientation",
    emptyTitle: "Aucun programme n’est proposé pour le moment.",
    emptyText: "Vérifiez que votre profil est à jour. Les nouveaux programmes apparaîtront ici lorsqu’ils seront proposés.",
    profile: "Vérifier mon profil",
    listEyebrow: "Programmes à comparer",
    listTitle: "Mes programmes",
    listDescription: "Vérifiez les critères, les dates et la source officielle avant de choisir.",
    universityUnknown: "Université à confirmer",
    addedToApplications: "Ajouté aux candidatures",
    proposedBoundary: "Ce programme a été proposé pour votre dossier. Vérifiez les critères et la source officielle avant de décider.",
    teachingLanguage: "Langue d’enseignement",
    winterDeadline: "Échéance hiver",
    summerDeadline: "Échéance été",
    diplomaRequired: "Diplôme demandé",
    officialCheck: "À vérifier sur la source officielle",
    officialSource: "Source officielle",
    saving: "Enregistrement…",
    unavailableAction: "Non disponible",
    addToApplications: "Ajouter à mes candidatures",
    pointToComplete: "Point à compléter",
    verificationNeeded: "Vérification nécessaire",
    missingInformation: "Informations manquantes",
    criteriaCompared: "Critères comparés",
    minimumEcts: "ECTS minimum",
    minimumGrade: "Note minimale",
    priorDegree: "Diplôme antérieur",
    intake: "Rentrée",
    deadline: "Échéance",
    programCriterion: "Critère du programme",
    deadlineOpen: "Échéance ouverte",
    deadlinePassed: "Échéance dépassée",
    criterionMet: "Critère rempli",
    pointToCheck: "Point à vérifier",
    check: "À vérifier",
    missing: "Information manquante",
    comparisonAria: "Comparaison avec votre projet",
    comparisonBoundary: "Comparaison des informations disponibles. L’université décide au final.",
    applicationRoute: "Mode de candidature",
    routeDirect: "candidature directe auprès de l’établissement",
    routeUniAssist: "candidature via uni-assist",
    routeVpd: "VPD à obtenir avant la candidature",
    routeUnknown: "à confirmer",
    whyProgram: "Pourquoi ce programme apparaît ?",
    recordedCriteria: "Critères enregistrés",
    languageLevels: "Niveaux linguistiques demandés",
    institution: "Établissement",
    german: "Allemand",
    english: "Anglais",
    languagePrefix: "Langue",
    creditsPrefix: "Crédits",
    languageNames: { german: "Allemand", deutsch: "Allemand", english: "Anglais", french: "Français" },
    subjectNames: { math: "Mathématiques", mathematics: "Mathématiques", maths: "Mathématiques", "computer science": "Informatique", cs: "Informatique", physics: "Physique", chemistry: "Chimie" },
    yourInformation: "Votre information",
    publishedCriterion: "Critère publié",
    programLeadBoundary: "Ce programme est une piste. L’université vérifie les conditions et prend la décision.",
    officialVerify: "Vérifier la source officielle",
    officialSourceAria: (name) => `Site officiel de ${name} (nouvel onglet)`,
    statusLabels: {
      satisfied: "Critère rempli",
      not_satisfied: "Point à vérifier",
      needs_manual_review: "À vérifier",
      unknown: "Information manquante",
    },
    requirementLabels: {
      minimum_ects: "ECTS minimum",
      minimum_grade: "Note minimale",
      prior_degree: "Diplôme antérieur",
      intake: "Rentrée",
      deadline: "Échéance",
      other: "Critère du programme",
    },
    reasonLabels: {
      "Nous n’avons pas encore assez d’informations pour comparer vos ECTS.": "Nous n’avons pas encore assez d’informations pour comparer vos ECTS.",
      "Votre note n’est pas encore disponible dans un format comparable.": "Votre note n’est pas encore disponible dans un format comparable.",
      "Vos crédits par matière ne sont pas encore disponibles pour cette comparaison.": "Vos crédits par matière ne sont pas encore disponibles pour cette comparaison.",
      "Votre niveau dans cette langue n’est pas encore disponible pour la comparaison.": "Votre niveau dans cette langue n’est pas encore disponible pour la comparaison.",
      "La compatibilité de votre diplôme doit être vérifiée avant de conclure.": "La compatibilité de votre diplôme doit être vérifiée avant de conclure.",
      "Le total de vos ECTS n’est pas encore indiqué dans votre projet.": "Le total de vos ECTS n’est pas encore indiqué dans votre projet.",
      "Vos crédits par matière ne sont pas encore renseignés de manière structurée dans votre projet.": "Vos crédits par matière ne sont pas encore renseignés de manière structurée dans votre projet.",
      "Votre moyenne n’est pas encore indiquée dans un format utilisable pour la comparaison.": "Votre moyenne n’est pas encore indiquée dans un format utilisable pour la comparaison.",
      "Votre diplôme actuel n’est pas encore renseigné dans votre profil.": "Votre diplôme actuel n’est pas encore renseigné dans votre profil.",
      "L’université doit confirmer si votre diplôme correspond à ce programme.": "L’université doit confirmer si votre diplôme correspond à ce programme.",
      "Votre niveau de langue n’est pas encore structuré dans votre projet.": "Votre niveau de langue n’est pas encore structuré dans votre projet.",
      "Votre niveau d’allemand n’est pas renseigné ou n’est pas sous un format comparable.": "Votre niveau d’allemand n’est pas renseigné ou n’est pas sous un format comparable.",
      "Le niveau demandé n’utilise pas les niveaux A1–C2. Vérifiez la source officielle.": "Le niveau demandé n’utilise pas les niveaux A1–C2. Vérifiez la source officielle.",
      "Votre période de rentrée souhaitée n’est pas renseignée ou structurée.": "Votre période de rentrée souhaitée n’est pas renseignée ou structurée.",
      "La date de rentrée du programme nécessite une analyse manuelle.": "La date de rentrée du programme nécessite une analyse manuelle.",
      "La date limite de candidature n’est pas disponible sous un format comparable.": "La date limite de candidature n’est pas disponible sous un format comparable.",
      "Cette information n’est pas encore disponible ou renseignée.": "Cette information n’est pas encore disponible ou renseignée.",
      "Les sources officielles de cette information doivent être vérifiées à nouveau.": "Les sources officielles de cette information doivent être vérifiées à nouveau.",
      "La source donne ce critère en texte. Lisez-la avant de décider.": "La source donne ce critère en texte. Lisez-la avant de décider.",
      "L’information vérifiée n’est pas disponible.": "L’information vérifiée n’est pas disponible.",
      "La valeur chiffrée présente un format non exploitable.": "La valeur chiffrée présente un format non exploitable.",
    },
  },
};

const ar: OrientationCopy = {
  page: {
    eyebrow: "ملفي",
    title: "برامجي",
    description: "قارن البرامج والشروط والمواعيد قبل أن تختار. ظهور برنامج هنا لا يعني حصولك على قبول.",
    applications: "طلبات التقديم",
    guidanceEyebrow: "قبل اختيار برنامج",
    guidanceTitle: "قارن قبل أن تقرر.",
    guidanceDescription: "راجع اللغة والشروط والموعد النهائي والمصدر الرسمي.",
    guidancePoints: ["راجع شروط البرنامج.", "تحقق من الموعد النهائي ولغة الدراسة.", "قرر إن كنت تريد متابعته ضمن طلبات التقديم."],
    imageAlt: "طلاب يتناقشون داخل قاعة جامعية.",
    imageCredit: "الصورة: Vitaly Gariev / Unsplash",
    applicationsStateError: "تعذر التحقق من البرامج التي أضفتها إلى طلباتك الآن.",
    criteriaStateError: "تعذر مقارنة شروط البرامج مع مشروعك الآن.",
    unavailableTitle: "البرامج غير متاحة مؤقتاً",
    unavailableText: "تعذر عرض البرامج الآن. حاول مرة أخرى.",
    retry: "إعادة المحاولة",
    back: "العودة إلى ملفي",
  },
  panel: {
    recommendationLabels: {
      recommended: "برنامج مقترح",
      possible: "خيار للمقارنة",
      ambitious: "برنامج طموح",
      missing_requirements: "شروط تحتاج إلى تحقق",
      not_recommended: "غير مقترح",
    },
    addError: "تعذر إضافة هذا البرنامج إلى طلبات التقديم.",
    addSuccess: "تمت إضافة البرنامج إلى طلبات التقديم. لم يتم إرسال أي طلب إلى الجامعة.",
    networkError: "حدث خطأ في الاتصال. تحقق من اتصالك وحاول مرة أخرى.",
    loadTitle: "البرامج المقترحة غير متاحة",
    retryVerification: "إعادة التحقق",
    applicationStateDetail: "تبقى البرامج المقترحة ظاهرة، لكن أزرار الإضافة معطلة إلى أن نتمكن من التحقق من حالتها.",
    criteriaStateDetail: "تبقى البرامج ظاهرة. ستعود المقارنة الشخصية عندما نتمكن من قراءة مشروعك من جديد.",
    summaryAria: "ملخص البرامج",
    programsEyebrow: "برامجك",
    programsAvailable: "برامج متاحة",
    noPrograms: "لا توجد برامج مقترحة",
    compareTitle: "قارن قبل أن تقرر.",
    interestStateUnknown: "البرامج المقترحة ظاهرة، لكن لا يمكننا حالياً تأكيد حالة البرامج التي أضفتها.",
    selectedPrograms: "البرامج التي اخترتها موجودة بالفعل في طلبات التقديم.",
    noProgramsText: "لا توجد برامج للمقارنة حالياً. تأكد من أن ملفك يحتوي على المعلومات اللازمة.",
    startWith: (name) => `ابدأ بمراجعة ${name}. تحقق من الشروط والمصدر الرسمي قبل إضافته إلى طلبات التقديم.`,
    lookNow: "راجع الآن",
    fieldUnknown: "المجال يحتاج إلى توضيح",
    summaryPrograms: "البرامج",
    proposed: "مقترحة",
    compare: "للمقارنة",
    decide: "تحتاج إلى قرار",
    added: "مضافة إلى الطلبات",
    unavailable: "غير متاح",
    trackingStarted: "بدأت المتابعة",
    none: "لا يوجد",
    orientationSummaryAria: "ملخص البرامج",
    emptyTitle: "لا يوجد برنامج مقترح حالياً.",
    emptyText: "تأكد من تحديث ملفك. ستظهر هنا البرامج الجديدة عندما تتم إضافتها.",
    profile: "مراجعة ملفي",
    listEyebrow: "برامج للمقارنة",
    listTitle: "برامجي",
    listDescription: "راجع الشروط والمواعيد والمصدر الرسمي قبل الاختيار.",
    universityUnknown: "الجامعة تحتاج إلى تأكيد",
    addedToApplications: "مضاف إلى طلبات التقديم",
    proposedBoundary: "تم اقتراح هذا البرنامج لملفك. راجع الشروط والمصدر الرسمي قبل اتخاذ القرار.",
    teachingLanguage: "لغة الدراسة",
    winterDeadline: "موعد الفصل الشتوي",
    summerDeadline: "موعد الفصل الصيفي",
    diplomaRequired: "الشهادة المطلوبة",
    officialCheck: "تحقق من المصدر الرسمي",
    officialSource: "المصدر الرسمي",
    saving: "جارٍ الحفظ…",
    unavailableAction: "غير متاح",
    addToApplications: "إضافة إلى طلبات التقديم",
    pointToComplete: "شرط غير مستوفى",
    verificationNeeded: "تحتاج إلى مراجعة",
    missingInformation: "معلومات ناقصة",
    criteriaCompared: "الشروط المقارَنة",
    minimumEcts: "الحد الأدنى من ECTS",
    minimumGrade: "الحد الأدنى للمعدل",
    priorDegree: "الشهادة السابقة",
    intake: "موعد البدء",
    deadline: "الموعد النهائي",
    programCriterion: "شرط البرنامج",
    deadlineOpen: "الموعد ما زال مفتوحاً",
    deadlinePassed: "انتهى الموعد",
    criterionMet: "الشرط مستوفى",
    pointToCheck: "نقطة تحتاج إلى مراجعة",
    check: "تحقق",
    missing: "معلومة ناقصة",
    comparisonAria: "مقارنة مع مشروعك",
    comparisonBoundary: "هذه مقارنة للمعلومات المتاحة فقط. الجامعة هي التي تتخذ القرار النهائي.",
    applicationRoute: "طريقة التقديم",
    routeDirect: "تقديم مباشر إلى المؤسسة",
    routeUniAssist: "تقديم عبر uni-assist",
    routeVpd: "الحصول على VPD قبل التقديم",
    routeUnknown: "طريقة التقديم تحتاج إلى تأكيد",
    whyProgram: "لماذا يظهر هذا البرنامج؟",
    recordedCriteria: "الشروط المسجلة",
    languageLevels: "مستويات اللغة المطلوبة",
    institution: "المؤسسة",
    german: "الألمانية",
    english: "الإنجليزية",
    languagePrefix: "اللغة",
    creditsPrefix: "الرصيد",
    languageNames: { german: "الألمانية", deutsch: "الألمانية", english: "الإنجليزية", french: "الفرنسية" },
    subjectNames: { math: "الرياضيات", mathematics: "الرياضيات", maths: "الرياضيات", "computer science": "علوم الحاسوب", cs: "علوم الحاسوب", physics: "الفيزياء", chemistry: "الكيمياء" },
    yourInformation: "بياناتك",
    publishedCriterion: "الشرط المنشور",
    programLeadBoundary: "هذا البرنامج خيار للمقارنة فقط. الجامعة تتحقق من الشروط وتتخذ القرار.",
    officialVerify: "التحقق من المصدر الرسمي",
    officialSourceAria: (name) => `الموقع الرسمي لبرنامج ${name} في علامة تبويب جديدة`,
    statusLabels: {
      satisfied: "الشرط مستوفى",
      not_satisfied: "الشرط غير مستوفى",
      needs_manual_review: "يحتاج إلى مراجعة",
      unknown: "المعلومة غير متوفرة",
    },
    requirementLabels: {
      minimum_ects: "الحد الأدنى من ECTS",
      minimum_grade: "الحد الأدنى للمعدل",
      prior_degree: "الشهادة السابقة",
      intake: "موعد البدء",
      deadline: "الموعد النهائي",
      other: "شرط البرنامج",
    },
    reasonLabels: {
      "Nous n’avons pas encore assez d’informations pour comparer vos ECTS.": "لا تتوفر بعد معلومات كافية لمقارنة رصيد ECTS.",
      "Votre note n’est pas encore disponible dans un format comparable.": "معدلك غير مسجّل بعد بصيغة تسمح بالمقارنة.",
      "Vos crédits par matière ne sont pas encore disponibles pour cette comparaison.": "رصيدك حسب المادة غير متوفر بعد لهذه المقارنة.",
      "Votre niveau dans cette langue n’est pas encore disponible pour la comparaison.": "مستواك في هذه اللغة غير متوفر بعد للمقارنة.",
      "La compatibilité de votre diplôme doit être vérifiée avant de conclure.": "يجب التحقق من توافق شهادتك قبل الوصول إلى نتيجة.",
      "Le total de vos ECTS n’est pas encore indiqué dans votre projet.": "إجمالي ECTS غير مذكور بعد في مشروعك.",
      "Vos crédits par matière ne sont pas encore renseignés de manière structurée dans votre projet.": "رصيدك حسب المادة غير مسجل بعد بشكل منظم في مشروعك.",
      "Votre moyenne n’est pas encore indiquée dans un format utilisable pour la comparaison.": "معدلك غير مسجل بعد بصيغة صالحة للمقارنة.",
      "Votre diplôme actuel n’est pas encore renseigné dans votre profil.": "شهادتك الحالية غير مذكورة بعد في ملفك.",
      "L’université doit confirmer si votre diplôme correspond à ce programme.": "يجب أن تؤكد الجامعة ما إذا كانت شهادتك مناسبة لهذا البرنامج.",
      "Votre niveau de langue n’est pas encore structuré dans votre projet.": "مستوى اللغة غير مسجل بعد بشكل منظم في مشروعك.",
      "Votre niveau d’allemand n’est pas renseigné ou n’est pas sous un format comparable.": "مستواك في الألمانية غير مذكور أو ليس بصيغة تسمح بالمقارنة.",
      "Le niveau demandé n’utilise pas les niveaux A1–C2. Vérifiez la source officielle.": "المستوى المطلوب لا يستخدم سلم A1–C2. راجع المصدر الرسمي.",
      "Votre période de rentrée souhaitée n’est pas renseignée ou structurée.": "موعد بدء الدراسة الذي تريده غير مسجّل بصيغة تسمح بالمقارنة.",
      "La date de rentrée du programme nécessite une analyse manuelle.": "موعد بدء البرنامج يحتاج إلى مراجعة يدوية.",
      "La date limite de candidature n’est pas disponible sous un format comparable.": "الموعد النهائي للتقديم غير متوفر بصيغة قابلة للمقارنة.",
      "Cette information n’est pas encore disponible ou renseignée.": "هذه المعلومة غير متوفرة أو غير مسجلة بعد.",
      "Les sources officielles de cette information doivent être vérifiées à nouveau.": "يجب إعادة التحقق من المصادر الرسمية لهذه المعلومة.",
      "La source donne ce critère en texte. Lisez-la avant de décider.": "المصدر يعرض هذا الشرط كنص. اقرأه قبل اتخاذ القرار.",
      "L’information vérifiée n’est pas disponible.": "المعلومة التي تم التحقق منها غير متوفرة.",
      "La valeur chiffrée présente un format non exploitable.": "القيمة الرقمية مسجّلة بصيغة لا يمكن مقارنتها تلقائياً.",
    },
  },
};

const en: OrientationCopy = {
  page: {
    eyebrow: "My file",
    title: "My programmes",
    description: "Compare suggested programmes and check the requirements before choosing. A suggested programme is not an admission offer.",
    applications: "My applications",
    guidanceEyebrow: "Before choosing a programme",
    guidanceTitle: "Compare before you decide.",
    guidanceDescription: "Check the language, requirements, deadline and official source.",
    guidancePoints: ["Check the programme requirements.", "Check the deadline and teaching language.", "Decide whether you want to track it in your applications."],
    imageAlt: "Students talking in a university lecture hall.",
    imageCredit: "Photo: Vitaly Gariev / Unsplash",
    applicationsStateError: "We cannot check your saved programme interests right now.",
    criteriaStateError: "We cannot compare the programme requirements with your study plan right now.",
    unavailableTitle: "Programmes temporarily unavailable",
    unavailableText: "We cannot display your programmes right now. Please try again.",
    retry: "Try again",
    back: "Back to my file",
  },
  panel: {
    recommendationLabels: {
      recommended: "Suggested programme",
      possible: "Possible programme",
      ambitious: "Ambitious programme",
      missing_requirements: "Requirements to check",
      not_recommended: "Not recommended",
    },
    addError: "We could not add this programme to your applications.",
    addSuccess: "This programme was added to your applications. Nothing was submitted to the university.",
    networkError: "Network error. Check your connection and try again.",
    loadTitle: "Recommendations unavailable",
    retryVerification: "Try checking again",
    applicationStateDetail: "Your recommendations remain visible, but the interest buttons are disabled until the saved state can be checked again.",
    criteriaStateDetail: "The programmes remain visible. Personalised comparisons will return when your study plan can be read again.",
    summaryAria: "Programme summary",
    programsEyebrow: "Your programmes",
    programsAvailable: "Programmes available",
    noPrograms: "No programme suggested",
    compareTitle: "Compare before you decide.",
    interestStateUnknown: "Your recommendations remain visible, but we cannot confirm the state of your saved interests right now.",
    selectedPrograms: "The programmes you selected are already visible in your applications.",
    noProgramsText: "No programme is suggested right now. Check that your profile contains the information needed.",
    startWith: (name) => `Start with ${name}. Check the requirements and official source before adding it to your applications.`,
    lookNow: "Look at this now",
    fieldUnknown: "Subject to be confirmed",
    summaryPrograms: "Programmes",
    proposed: "Suggested",
    compare: "To compare",
    decide: "To decide",
    added: "Added to applications",
    unavailable: "Unavailable",
    trackingStarted: "Tracking started",
    none: "None",
    orientationSummaryAria: "Programme overview",
    emptyTitle: "No programme is suggested right now.",
    emptyText: "Check that your profile is up to date. New programmes will appear here when they are suggested.",
    profile: "Check my profile",
    listEyebrow: "Programmes to compare",
    listTitle: "My programmes",
    listDescription: "Check requirements, deadlines and the official source before choosing.",
    universityUnknown: "University to be confirmed",
    addedToApplications: "Added to applications",
    proposedBoundary: "This programme was suggested for your file. Check the requirements and official source before deciding.",
    teachingLanguage: "Teaching language",
    winterDeadline: "Winter deadline",
    summerDeadline: "Summer deadline",
    diplomaRequired: "Required qualification",
    officialCheck: "Check on the official source",
    officialSource: "Official source",
    saving: "Saving…",
    unavailableAction: "Unavailable",
    addToApplications: "Add to my applications",
    pointToComplete: "Point to complete",
    verificationNeeded: "Needs checking",
    missingInformation: "Missing information",
    criteriaCompared: "Requirements compared",
    minimumEcts: "Minimum ECTS",
    minimumGrade: "Minimum grade",
    priorDegree: "Previous qualification",
    intake: "Intake",
    deadline: "Deadline",
    programCriterion: "Programme requirement",
    deadlineOpen: "Deadline open",
    deadlinePassed: "Deadline passed",
    criterionMet: "Requirement met",
    pointToCheck: "Point to check",
    check: "Check",
    missing: "Missing information",
    comparisonAria: "Comparison with your study plan",
    comparisonBoundary: "Comparison based on the information available. The university makes the final decision.",
    applicationRoute: "Application route",
    routeDirect: "direct application to the institution",
    routeUniAssist: "application through uni-assist",
    routeVpd: "obtain a VPD before applying",
    routeUnknown: "to be confirmed",
    whyProgram: "Why does this programme appear?",
    recordedCriteria: "Recorded requirements",
    languageLevels: "Required language levels",
    institution: "Institution",
    german: "German",
    english: "English",
    languagePrefix: "Language",
    creditsPrefix: "Credits",
    languageNames: { german: "German", deutsch: "German", english: "English", french: "French" },
    subjectNames: { math: "Mathematics", mathematics: "Mathematics", maths: "Mathematics", "computer science": "Computer Science", cs: "Computer Science", physics: "Physics", chemistry: "Chemistry" },
    yourInformation: "Your information",
    publishedCriterion: "Published requirement",
    programLeadBoundary: "This programme is an option to consider. The university checks the requirements and makes the decision.",
    officialVerify: "Check the official source",
    officialSourceAria: (name) => `Official website for ${name} (opens in a new tab)`,
    statusLabels: {
      satisfied: "Requirement met",
      not_satisfied: "Point to check",
      needs_manual_review: "Needs checking",
      unknown: "Missing information",
    },
    requirementLabels: {
      minimum_ects: "Minimum ECTS",
      minimum_grade: "Minimum grade",
      prior_degree: "Previous qualification",
      intake: "Intake",
      deadline: "Deadline",
      other: "Programme requirement",
    },
    reasonLabels: {
      "Nous n’avons pas encore assez d’informations pour comparer vos ECTS.": "We do not yet have enough information to compare your ECTS.",
      "Votre note n’est pas encore disponible dans un format comparable.": "Your grade is not yet available in a comparable format.",
      "Vos crédits par matière ne sont pas encore disponibles pour cette comparaison.": "Your subject credits are not yet available for this comparison.",
      "Votre niveau dans cette langue n’est pas encore disponible pour la comparaison.": "Your level in this language is not yet available for comparison.",
      "La compatibilité de votre diplôme doit être vérifiée avant de conclure.": "The compatibility of your qualification must be checked before drawing a conclusion.",
      "Le total de vos ECTS n’est pas encore indiqué dans votre projet.": "Your total ECTS is not yet recorded in your study plan.",
      "Vos crédits par matière ne sont pas encore renseignés de manière structurée dans votre projet.": "Your subject credits are not yet recorded in a structured way in your study plan.",
      "Votre moyenne n’est pas encore indiquée dans un format utilisable pour la comparaison.": "Your average grade is not yet recorded in a format that can be compared.",
      "Votre diplôme actuel n’est pas encore renseigné dans votre profil.": "Your current qualification is not yet recorded in your profile.",
      "L’université doit confirmer si votre diplôme correspond à ce programme.": "The university must confirm whether your qualification matches this programme.",
      "Votre niveau de langue n’est pas encore structuré dans votre projet.": "Your language level is not yet recorded in a structured way in your study plan.",
      "Votre niveau d’allemand n’est pas renseigné ou n’est pas sous un format comparable.": "Your German level is missing or not in a comparable format.",
      "Le niveau demandé n’utilise pas les niveaux A1–C2. Vérifiez la source officielle.": "The required level does not use the A1–C2 scale. Check the official source.",
      "Votre période de rentrée souhaitée n’est pas renseignée ou structurée.": "Your preferred intake is missing or not structured.",
      "La date de rentrée du programme nécessite une analyse manuelle.": "The programme intake date needs manual review.",
      "La date limite de candidature n’est pas disponible sous un format comparable.": "The application deadline is not available in a comparable format.",
      "Cette information n’est pas encore disponible ou renseignée.": "This information is not yet available or recorded.",
      "Les sources officielles de cette information doivent être vérifiées à nouveau.": "The official sources for this information need to be checked again.",
      "La source donne ce critère en texte. Lisez-la avant de décider.": "The source gives this requirement as free text. Read it before deciding.",
      "L’information vérifiée n’est pas disponible.": "The verified information is not available.",
      "La valeur chiffrée présente un format non exploitable.": "The numeric value is not in a usable format.",
    },
  },
};

const de: OrientationCopy = {
  page: {
    eyebrow: "Meine Akte",
    title: "Meine Studiengänge",
    description: "Vergleiche vorgeschlagene Studiengänge und prüfe die Voraussetzungen. Ein Vorschlag ist keine Zulassung.",
    applications: "Meine Bewerbungen",
    guidanceEyebrow: "Bevor du einen Studiengang auswählst",
    guidanceTitle: "Vergleiche, bevor du dich entscheidest.",
    guidanceDescription: "Prüfe Sprache, Voraussetzungen, Frist und offizielle Quelle.",
    guidancePoints: ["Voraussetzungen des Studiengangs prüfen.", "Frist und Unterrichtssprache ansehen.", "Entscheiden, ob du ihn in deinen Bewerbungen verfolgen möchtest."],
    imageAlt: "Studierende sprechen in einem Hörsaal miteinander.",
    imageCredit: "Foto: Vitaly Gariev / Unsplash",
    applicationsStateError: "Deine gespeicherten Interessen können gerade nicht geprüft werden.",
    criteriaStateError: "Die Voraussetzungen können gerade nicht mit deinem Studienplan verglichen werden.",
    unavailableTitle: "Studiengänge vorübergehend nicht verfügbar",
    unavailableText: "Deine Studiengänge können gerade nicht angezeigt werden. Bitte versuche es erneut.",
    retry: "Noch einmal versuchen",
    back: "Zurück zu meiner Akte",
  },
  panel: {
    recommendationLabels: {
      recommended: "Vorgeschlagener Studiengang",
      possible: "Möglicher Studiengang",
      ambitious: "Anspruchsvoller Studiengang",
      missing_requirements: "Voraussetzungen prüfen",
      not_recommended: "Nicht empfohlen",
    },
    addError: "Der Studiengang konnte nicht zu deinen Bewerbungen hinzugefügt werden.",
    addSuccess: "Der Studiengang wurde zu deinen Bewerbungen hinzugefügt. Es wurde nichts an die Hochschule gesendet.",
    networkError: "Netzwerkfehler. Prüfe deine Verbindung und versuche es erneut.",
    loadTitle: "Empfehlungen nicht verfügbar",
    retryVerification: "Prüfung erneut versuchen",
    applicationStateDetail: "Deine Vorschläge bleiben sichtbar. Die Auswahlbuttons bleiben deaktiviert, bis der gespeicherte Status erneut geprüft werden kann.",
    criteriaStateDetail: "Die Studiengänge bleiben sichtbar. Persönliche Vergleiche erscheinen wieder, sobald dein Studienplan gelesen werden kann.",
    summaryAria: "Übersicht Studiengänge",
    programsEyebrow: "Deine Studiengänge",
    programsAvailable: "Studiengänge verfügbar",
    noPrograms: "Kein Studiengang vorgeschlagen",
    compareTitle: "Vergleiche, bevor du dich entscheidest.",
    interestStateUnknown: "Deine Vorschläge bleiben sichtbar, aber der Status deiner gespeicherten Auswahl kann gerade nicht bestätigt werden.",
    selectedPrograms: "Deine ausgewählten Studiengänge sind bereits in deinen Bewerbungen sichtbar.",
    noProgramsText: "Derzeit ist kein Studiengang vorgeschlagen. Prüfe, ob dein Profil die nötigen Angaben enthält.",
    startWith: (name) => `Starte mit ${name}. Prüfe Voraussetzungen und offizielle Quelle, bevor du ihn zu deinen Bewerbungen hinzufügst.`,
    lookNow: "Jetzt ansehen",
    fieldUnknown: "Fach noch zu klären",
    summaryPrograms: "Studiengänge",
    proposed: "Vorgeschlagen",
    compare: "Zu vergleichen",
    decide: "Zu entscheiden",
    added: "Zu Bewerbungen hinzugefügt",
    unavailable: "Nicht verfügbar",
    trackingStarted: "Verfolgung gestartet",
    none: "Keine",
    orientationSummaryAria: "Übersicht der Studiengänge",
    emptyTitle: "Derzeit ist kein Studiengang vorgeschlagen.",
    emptyText: "Prüfe, ob dein Profil aktuell ist. Neue Vorschläge erscheinen hier, sobald sie verfügbar sind.",
    profile: "Profil prüfen",
    listEyebrow: "Studiengänge vergleichen",
    listTitle: "Meine Studiengänge",
    listDescription: "Prüfe Voraussetzungen, Fristen und die offizielle Quelle, bevor du dich entscheidest.",
    universityUnknown: "Hochschule noch zu bestätigen",
    addedToApplications: "Zu Bewerbungen hinzugefügt",
    proposedBoundary: "Dieser Studiengang wurde für deine Akte vorgeschlagen. Prüfe Voraussetzungen und offizielle Quelle, bevor du dich entscheidest.",
    teachingLanguage: "Unterrichtssprache",
    winterDeadline: "Frist Wintersemester",
    summerDeadline: "Frist Sommersemester",
    diplomaRequired: "Erforderlicher Abschluss",
    officialCheck: "In der offiziellen Quelle prüfen",
    officialSource: "Offizielle Quelle",
    saving: "Wird gespeichert…",
    unavailableAction: "Nicht verfügbar",
    addToApplications: "Zu meinen Bewerbungen hinzufügen",
    pointToComplete: "Noch zu ergänzen",
    verificationNeeded: "Prüfung erforderlich",
    missingInformation: "Fehlende Angaben",
    criteriaCompared: "Verglichene Voraussetzungen",
    minimumEcts: "Mindest-ECTS",
    minimumGrade: "Mindestnote",
    priorDegree: "Vorheriger Abschluss",
    intake: "Studienstart",
    deadline: "Frist",
    programCriterion: "Voraussetzung des Studiengangs",
    deadlineOpen: "Frist offen",
    deadlinePassed: "Frist abgelaufen",
    criterionMet: "Voraussetzung erfüllt",
    pointToCheck: "Zu prüfen",
    check: "Prüfen",
    missing: "Fehlende Angabe",
    comparisonAria: "Vergleich mit deinem Studienplan",
    comparisonBoundary: "Vergleich auf Basis der verfügbaren Angaben. Die Hochschule trifft die endgültige Entscheidung.",
    applicationRoute: "Bewerbungsweg",
    routeDirect: "direkte Bewerbung bei der Hochschule",
    routeUniAssist: "Bewerbung über uni-assist",
    routeVpd: "VPD vor der Bewerbung einholen",
    routeUnknown: "noch zu bestätigen",
    whyProgram: "Warum wird dieser Studiengang angezeigt?",
    recordedCriteria: "Gespeicherte Voraussetzungen",
    languageLevels: "Geforderte Sprachniveaus",
    institution: "Hochschule",
    german: "Deutsch",
    english: "Englisch",
    languagePrefix: "Sprache",
    creditsPrefix: "Credits",
    languageNames: { german: "Deutsch", deutsch: "Deutsch", english: "Englisch", french: "Französisch" },
    subjectNames: { math: "Mathematik", mathematics: "Mathematik", maths: "Mathematik", "computer science": "Informatik", cs: "Informatik", physics: "Physik", chemistry: "Chemie" },
    yourInformation: "Deine Angabe",
    publishedCriterion: "Veröffentlichte Voraussetzung",
    programLeadBoundary: "Dieser Studiengang ist eine mögliche Option. Die Hochschule prüft die Voraussetzungen und trifft die Entscheidung.",
    officialVerify: "Offizielle Quelle prüfen",
    officialSourceAria: (name) => `Offizielle Website von ${name} (öffnet in einem neuen Tab)`,
    statusLabels: {
      satisfied: "Voraussetzung erfüllt",
      not_satisfied: "Zu prüfen",
      needs_manual_review: "Prüfung erforderlich",
      unknown: "Fehlende Angabe",
    },
    requirementLabels: {
      minimum_ects: "Mindest-ECTS",
      minimum_grade: "Mindestnote",
      prior_degree: "Vorheriger Abschluss",
      intake: "Studienstart",
      deadline: "Frist",
      other: "Voraussetzung des Studiengangs",
    },
    reasonLabels: {
      "Nous n’avons pas encore assez d’informations pour comparer vos ECTS.": "Es liegen noch nicht genug Angaben vor, um deine ECTS zu vergleichen.",
      "Votre note n’est pas encore disponible dans un format comparable.": "Deine Note liegt noch nicht in einem vergleichbaren Format vor.",
      "Vos crédits par matière ne sont pas encore disponibles pour cette comparaison.": "Deine Fach-ECTS sind für diesen Vergleich noch nicht verfügbar.",
      "Votre niveau dans cette langue n’est pas encore disponible pour la comparaison.": "Dein Niveau in dieser Sprache ist für den Vergleich noch nicht verfügbar.",
      "La compatibilité de votre diplôme doit être vérifiée avant de conclure.": "Die Passung deines Abschlusses muss geprüft werden, bevor eine Aussage möglich ist.",
      "Le total de vos ECTS n’est pas encore indiqué dans votre projet.": "Die Gesamtzahl deiner ECTS ist in deinem Studienplan noch nicht eingetragen.",
      "Vos crédits par matière ne sont pas encore renseignés de manière structurée dans votre projet.": "Deine Fach-ECTS sind in deinem Studienplan noch nicht strukturiert erfasst.",
      "Votre moyenne n’est pas encore indiquée dans un format utilisable pour la comparaison.": "Deine Durchschnittsnote ist noch nicht in einem vergleichbaren Format erfasst.",
      "Votre diplôme actuel n’est pas encore renseigné dans votre profil.": "Dein aktueller Abschluss ist noch nicht im Profil eingetragen.",
      "L’université doit confirmer si votre diplôme correspond à ce programme.": "Die Hochschule muss bestätigen, ob dein Abschluss zu diesem Studiengang passt.",
      "Votre niveau de langue n’est pas encore structuré dans votre projet.": "Dein Sprachniveau ist in deinem Studienplan noch nicht strukturiert erfasst.",
      "Votre niveau d’allemand n’est pas renseigné ou n’est pas sous un format comparable.": "Dein Deutschniveau fehlt oder liegt nicht in einem vergleichbaren Format vor.",
      "Le niveau demandé n’utilise pas les niveaux A1–C2. Vérifiez la source officielle.": "Das geforderte Niveau verwendet nicht die Skala A1–C2. Prüfe die offizielle Quelle.",
      "Votre période de rentrée souhaitée n’est pas renseignée ou structurée.": "Dein gewünschter Studienstart fehlt oder ist nicht strukturiert erfasst.",
      "La date de rentrée du programme nécessite une analyse manuelle.": "Der Studienstart des Programms muss manuell geprüft werden.",
      "La date limite de candidature n’est pas disponible sous un format comparable.": "Die Bewerbungsfrist liegt nicht in einem vergleichbaren Format vor.",
      "Cette information n’est pas encore disponible ou renseignée.": "Diese Information ist noch nicht verfügbar oder eingetragen.",
      "Les sources officielles de cette information doivent être vérifiées à nouveau.": "Die offiziellen Quellen für diese Angabe müssen erneut geprüft werden.",
      "La source donne ce critère en texte. Lisez-la avant de décider.": "Die Quelle nennt diese Voraussetzung als Freitext. Lies sie vor deiner Entscheidung.",
      "L’information vérifiée n’est pas disponible.": "Die geprüfte Information ist nicht verfügbar.",
      "La valeur chiffrée présente un format non exploitable.": "Der Zahlenwert liegt nicht in einem nutzbaren Format vor.",
    },
  },
};

export const studentOrientationCopy: Record<Locale, OrientationCopy> = { fr, ar, en, de };
