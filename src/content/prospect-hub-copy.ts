import type { Locale } from "@/lib/i18n";

type ProspectHubCopy = {
  shell: {
    area: string;
    badge: string;
    intro: string;
    navigation: string;
    journeyGroup: string;
    servicesGroup: string;
    homeAria: string;
    logout: string;
    links: {
      dashboard: string;
      orientation: string;
      catalogue: string;
      proposal: string;
      roadmap: string;
      documents: string;
      solutions: string;
      offers: string;
      payment: string;
    };
  };
  dashboard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    project: string;
    progress: string;
    nextAction: string;
    campusAction: string;
    proposal: string;
    proposalWaiting: string;
    proposalReady: string;
    proposalConfirmed: string;
    documents: string;
    documentsSummary: (approved: number, required: number, pending: number, replacement: number) => string;
    browseTitle: string;
    browseText: string;
    browseCatalogue: string;
    browseSolutions: string;
    browseDocuments: string;
    viewProposal: string;
    recommendedTitle: string;
    recommendedText: string;
    recommendedViewAll: string;
    history: string;
    historyHint: string;
    currentVersion: string;
    updateProject: string;
    noOrientation: string;
    startOrientation: string;
  };
  orientation: {
    eyebrow: string;
    title: string;
    subtitle: string;
    update: string;
    current: string;
    history: string;
    savedOn: string;
    confirmed: string;
    nextDocuments: string;
    nextDocumentsBody: string;
    noOrientation: string;
  };
  catalogue: {
    eyebrow: string;
    title: string;
    subtitle: string;
    boundary: string;
    filters: string;
    degree: string;
    field: string;
    city: string;
    german: string;
    uniAssist: string;
    yes: string;
    all: string;
    apply: string;
    reset: string;
    results: (count: number) => string;
    projectMatch: string;
    generalCatalogue: string;
    recommendedTitle: string;
    recommendedSubtitle: string;
    preferredCity: string;
    requirementCheck: string;
    browseAllTitle: string;
    browseAllSubtitle: string;
    source: string;
    applyLink: string;
    noResults: string;
  };
  proposal: {
    eyebrow: string;
    title: string;
    subtitle: string;
    waitingTitle: string;
    waitingBody: string;
    documentsTitle: string;
    documentsBody: string;
    reviewTitle: string;
    reviewBody: string;
    readyTitle: string;
    confirmedTitle: string;
    questionTitle: string;
  };
  roadmap: {
    eyebrow: string;
    title: string;
    subtitle: string;
    current: string;
    done: string;
    next: string;
    later: string;
    completedGroup: string;
    futureGroup: string;
  };
  solutions: {
    eyebrow: string;
    title: string;
    subtitle: string;
    boundary: string;
    language: string;
    languageText: string;
    finance: string;
    financeText: string;
    official: string;
    provider: string;
    forYourProject: string;
    empty: string;
  };
};

const fr: ProspectHubCopy = {
  shell: {
    area: "Mon espace Campus Allemagne",
    badge: "Compte gratuit",
    intro: "Votre projet, vos documents, votre proposition et les solutions utiles au même endroit.",
    navigation: "Navigation de mon espace",
    journeyGroup: "Mon parcours",
    servicesGroup: "Services & solutions",
    homeAria: "Accueil de mon espace Campus Allemagne",
    logout: "Déconnexion",
    links: {
      dashboard: "Tableau de bord",
      orientation: "Mon orientation",
      catalogue: "Programmes & catalogue",
      proposal: "Ma proposition",
      roadmap: "Mes prochaines étapes",
      documents: "Mes documents",
      solutions: "Prestataires & solutions",
      offers: "Mes offres",
      payment: "Mon paiement",
    },
  },
  dashboard: {
    eyebrow: "Mon projet Allemagne",
    title: "Voici où en est votre projet aujourd’hui.",
    subtitle: "Suivez votre progression, voyez ce que Campus Allemagne prépare et avancez sur les actions qui dépendent de vous.",
    project: "Votre projet",
    progress: "Progression",
    nextAction: "Votre prochaine action",
    campusAction: "Campus Allemagne travaille sur",
    proposal: "Ma proposition Campus Allemagne",
    proposalWaiting: "En préparation",
    proposalReady: "Prête à consulter",
    proposalConfirmed: "Parcours confirmé",
    documents: "Documents de qualification",
    documentsSummary: (approved, required, pending, replacement) =>
      `${approved}/${required} validés${pending ? ` · ${pending} en vérification` : ""}${replacement ? ` · ${replacement} à corriger` : ""}`,
    browseTitle: "Vous pouvez déjà explorer votre projet",
    browseText: "Le catalogue, les cours de langue et les solutions de financement restent accessibles pendant que nous préparons votre proposition.",
    browseCatalogue: "Explorer les programmes",
    browseSolutions: "Voir les solutions",
    browseDocuments: "Gérer mes documents",
    viewProposal: "Voir ma proposition",
    recommendedTitle: "Programmes à regarder en priorité",
    recommendedText: "Ces programmes vérifiés correspondent le mieux aux critères enregistrés dans votre orientation. Ils restent à vérifier programme par programme.",
    recommendedViewAll: "Voir tous les programmes",
    history: "Historique de mon orientation",
    historyHint: "Les anciennes versions restent disponibles sans encombrer votre tableau de bord.",
    currentVersion: "Version actuelle",
    updateProject: "Mettre à jour mon projet",
    noOrientation: "Aucune orientation n’est encore liée à ce compte.",
    startOrientation: "Faire mon orientation",
  },
  orientation: {
    eyebrow: "Mon orientation",
    title: "Votre orientation actuelle",
    subtitle: "Retrouvez les informations qui servent de point de départ à votre projet et mettez-les à jour lorsqu’elles évoluent.",
    update: "Mettre mon orientation à jour",
    current: "Orientation actuelle",
    history: "Voir les versions précédentes",
    savedOn: "Enregistrée le",
    confirmed: "Orientation confirmée",
    nextDocuments: "Prochaine étape : vos documents",
    nextDocumentsBody: "Votre orientation est enregistrée. Complétez maintenant les pièces de départ pour permettre la vérification de votre dossier.",
    noOrientation: "Aucune orientation n’est encore disponible.",
  },
  catalogue: {
    eyebrow: "Catalogue académique vérifié",
    title: "Programmes & universités",
    subtitle: "Explorez le catalogue même avant votre proposition personnalisée. Les résultats du catalogue ne sont pas, à eux seuls, une recommandation Campus Allemagne.",
    boundary: "Les conditions peuvent évoluer. Vérifiez toujours la source officielle avant toute candidature.",
    filters: "Filtrer le catalogue",
    degree: "Diplôme",
    field: "Domaine",
    city: "Ville",
    german: "Allemand",
    uniAssist: "uni-assist",
    yes: "Oui",
    all: "Tous",
    apply: "Appliquer",
    reset: "Réinitialiser",
    results: (count) => `${count} programme${count > 1 ? "s" : ""} affiché${count > 1 ? "s" : ""}`,
    projectMatch: "Correspond à des critères de votre projet",
    generalCatalogue: "Catalogue général",
    recommendedTitle: "Recommandés pour votre projet",
    recommendedSubtitle: "Sélection issue de votre orientation et du catalogue vérifié. Une correspondance ne garantit ni admission ni éligibilité finale.",
    preferredCity: "Ville préférée",
    requirementCheck: "Conditions à vérifier",
    browseAllTitle: "Explorer tout le catalogue",
    browseAllSubtitle: "Utilisez les filtres pour chercher au-delà de votre sélection personnalisée.",
    source: "Source officielle",
    applyLink: "Voir la candidature",
    noResults: "Aucun programme vérifié ne correspond à ces filtres pour le moment.",
  },
  proposal: {
    eyebrow: "Ma proposition Campus Allemagne",
    title: "Votre parcours proposé",
    subtitle: "Cette page distingue ce que vous pouvez explorer librement de la proposition que Campus Allemagne prépare après vérification de votre dossier.",
    waitingTitle: "Votre proposition n’est pas encore prête",
    waitingBody: "Vous pouvez continuer à explorer les programmes et les solutions pendant la vérification.",
    documentsTitle: "Complétez d’abord vos pièces de départ",
    documentsBody: "Nous avons besoin des pièces obligatoires avant de pouvoir finaliser une proposition personnalisée.",
    reviewTitle: "Votre dossier est en analyse",
    reviewBody: "Campus Allemagne vérifie votre orientation et vos pièces pour préparer le parcours adapté.",
    readyTitle: "Votre proposition est prête",
    confirmedTitle: "Votre parcours est confirmé",
    questionTitle: "Votre demande de révision a été transmise",
  },
  roadmap: {
    eyebrow: "Mes prochaines étapes",
    title: "Votre parcours, étape par étape",
    subtitle: "Une seule étape doit être prioritaire à la fois. Les étapes suivantes restent visibles pour que vous sachiez ce qui vient ensuite.",
    current: "En cours",
    done: "Terminé",
    next: "Prochaine étape",
    later: "Plus tard",
    completedGroup: "Étapes terminées",
    futureGroup: "Étapes suivantes",
  },
  solutions: {
    eyebrow: "Solutions utiles",
    title: "Prestataires & solutions",
    subtitle: "Explorez les solutions publiées pour la langue, le compte bloqué, l’assurance et le financement, même avant votre proposition personnalisée.",
    boundary: "La présence dans ce catalogue ne signifie pas automatiquement qu’un prestataire est recommandé pour votre cas. Vérifiez toujours les conditions officielles.",
    language: "Cours de langue",
    languageText: "Cours publiés et récemment vérifiés pour préparer votre niveau d’allemand.",
    finance: "Compte bloqué, assurance & financement",
    financeText: "Options publiées avec source officielle et date de vérification.",
    official: "Source officielle",
    provider: "Site du prestataire",
    forYourProject: "Près de votre ville",
    empty: "Aucune option vérifiée n’est disponible dans cette catégorie pour le moment.",
  },
};

const en: ProspectHubCopy = {
  shell: {
    area: "My Campus Allemagne space",
    badge: "Free account",
    intro: "Your project, documents, proposal and useful solutions in one place.",
    navigation: "My space navigation",
    journeyGroup: "My journey",
    servicesGroup: "Services & solutions",
    homeAria: "My Campus Allemagne home",
    logout: "Sign out",
    links: {
      dashboard: "Dashboard",
      orientation: "My orientation",
      catalogue: "Programmes & catalogue",
      proposal: "My proposal",
      roadmap: "My next steps",
      documents: "My documents",
      solutions: "Providers & solutions",
      offers: "My offers",
      payment: "My payment",
    },
  },
  dashboard: {
    eyebrow: "My Germany project",
    title: "Here is where your project stands today.",
    subtitle: "Track your progress, see what Campus Allemagne is preparing and complete the actions that depend on you.",
    project: "Your project",
    progress: "Progress",
    nextAction: "Your next action",
    campusAction: "Campus Allemagne is working on",
    proposal: "My Campus Allemagne proposal",
    proposalWaiting: "In preparation",
    proposalReady: "Ready to review",
    proposalConfirmed: "Route confirmed",
    documents: "Qualification documents",
    documentsSummary: (approved, required, pending, replacement) =>
      `${approved}/${required} approved${pending ? ` · ${pending} under review` : ""}${replacement ? ` · ${replacement} to fix` : ""}`,
    browseTitle: "You can already explore your project",
    browseText: "The programme catalogue, language courses and funding solutions remain available while we prepare your proposal.",
    browseCatalogue: "Explore programmes",
    browseSolutions: "View solutions",
    browseDocuments: "Manage my documents",
    viewProposal: "View my proposal",
    recommendedTitle: "Programmes to review first",
    recommendedText: "These verified programmes best match the criteria saved in your orientation. Each programme still needs its own requirement check.",
    recommendedViewAll: "View all programmes",
    history: "Orientation history",
    historyHint: "Older versions remain available without cluttering your dashboard.",
    currentVersion: "Current version",
    updateProject: "Update my project",
    noOrientation: "No orientation is linked to this account yet.",
    startOrientation: "Start my orientation",
  },
  orientation: {
    eyebrow: "My orientation",
    title: "Your current orientation",
    subtitle: "Review the information used as the starting point for your project and update it when it changes.",
    update: "Update my orientation",
    current: "Current orientation",
    history: "View previous versions",
    savedOn: "Saved on",
    confirmed: "Orientation confirmed",
    nextDocuments: "Next step: your documents",
    nextDocumentsBody: "Your orientation is saved. Add the starter documents so your file can be reviewed.",
    noOrientation: "No orientation is available yet.",
  },
  catalogue: {
    eyebrow: "Verified academic catalogue",
    title: "Programmes & universities",
    subtitle: "Browse the catalogue even before your personalised proposal is ready. Catalogue results alone are not a Campus Allemagne recommendation.",
    boundary: "Requirements can change. Always check the official source before applying.",
    filters: "Filter the catalogue",
    degree: "Degree",
    field: "Field",
    city: "City",
    german: "German",
    uniAssist: "uni-assist",
    yes: "Yes",
    all: "All",
    apply: "Apply",
    reset: "Reset",
    results: (count) => `${count} programme${count === 1 ? "" : "s"} shown`,
    projectMatch: "Matches criteria from your project",
    generalCatalogue: "General catalogue",
    recommendedTitle: "Recommended for your project",
    recommendedSubtitle: "Selected from your orientation and the verified catalogue. A match does not guarantee admission or final eligibility.",
    preferredCity: "Preferred city",
    requirementCheck: "Requirements to check",
    browseAllTitle: "Explore the full catalogue",
    browseAllSubtitle: "Use the filters to search beyond your personalised selection.",
    source: "Official source",
    applyLink: "Application information",
    noResults: "No verified programme currently matches these filters.",
  },
  proposal: {
    eyebrow: "My Campus Allemagne proposal",
    title: "Your proposed route",
    subtitle: "This page separates what you can explore freely from the proposal Campus Allemagne prepares after reviewing your file.",
    waitingTitle: "Your proposal is not ready yet",
    waitingBody: "You can continue exploring programmes and solutions while the review is in progress.",
    documentsTitle: "Complete your starter documents first",
    documentsBody: "We need the required documents before we can finalise a personalised proposal.",
    reviewTitle: "Your file is under review",
    reviewBody: "Campus Allemagne is reviewing your orientation and documents to prepare the appropriate route.",
    readyTitle: "Your proposal is ready",
    confirmedTitle: "Your route is confirmed",
    questionTitle: "Your review request has been sent",
  },
  roadmap: {
    eyebrow: "My next steps",
    title: "Your journey, step by step",
    subtitle: "Only one step should be the priority at a time. Later steps remain visible so you know what comes next.",
    current: "In progress",
    done: "Done",
    next: "Next",
    later: "Later",
    completedGroup: "Completed steps",
    futureGroup: "Later steps",
  },
  solutions: {
    eyebrow: "Useful solutions",
    title: "Providers & solutions",
    subtitle: "Browse published options for language study, blocked accounts, insurance and funding even before your personalised proposal.",
    boundary: "Being listed does not automatically mean a provider is recommended for your case. Always check the official conditions.",
    language: "Language courses",
    languageText: "Published and recently verified courses for improving your German.",
    finance: "Blocked account, insurance & funding",
    financeText: "Published options with an official source and verification date.",
    official: "Official source",
    provider: "Provider website",
    forYourProject: "Near your preferred city",
    empty: "No verified option is currently available in this category.",
  },
};

const de: ProspectHubCopy = {
  shell: {
    area: "Mein Campus-Allemagne-Bereich",
    badge: "Kostenloses Konto",
    intro: "Projekt, Dokumente, Vorschlag und nützliche Lösungen an einem Ort.",
    navigation: "Navigation meines Bereichs",
    journeyGroup: "Mein Weg",
    servicesGroup: "Services & Lösungen",
    homeAria: "Startseite meines Campus-Allemagne-Bereichs",
    logout: "Abmelden",
    links: {
      dashboard: "Übersicht",
      orientation: "Meine Orientierung",
      catalogue: "Programme & Katalog",
      proposal: "Mein Vorschlag",
      roadmap: "Meine nächsten Schritte",
      documents: "Meine Dokumente",
      solutions: "Anbieter & Lösungen",
      offers: "Meine Angebote",
      payment: "Meine Zahlung",
    },
  },
  dashboard: {
    eyebrow: "Mein Deutschland-Projekt",
    title: "Hier steht dein Projekt heute.",
    subtitle: "Verfolge deinen Fortschritt, sieh was Campus Allemagne vorbereitet und erledige deine nächsten Aufgaben.",
    project: "Dein Projekt",
    progress: "Fortschritt",
    nextAction: "Deine nächste Aktion",
    campusAction: "Campus Allemagne arbeitet an",
    proposal: "Mein Campus-Allemagne-Vorschlag",
    proposalWaiting: "In Vorbereitung",
    proposalReady: "Bereit zur Prüfung",
    proposalConfirmed: "Weg bestätigt",
    documents: "Qualifikationsdokumente",
    documentsSummary: (approved, required, pending, replacement) =>
      `${approved}/${required} bestätigt${pending ? ` · ${pending} in Prüfung` : ""}${replacement ? ` · ${replacement} zu korrigieren` : ""}`,
    browseTitle: "Du kannst dein Projekt schon jetzt erkunden",
    browseText: "Studienprogramme, Sprachkurse und Finanzierungslösungen bleiben verfügbar, während wir deinen Vorschlag vorbereiten.",
    browseCatalogue: "Programme ansehen",
    browseSolutions: "Lösungen ansehen",
    browseDocuments: "Dokumente verwalten",
    viewProposal: "Vorschlag ansehen",
    recommendedTitle: "Programme zuerst ansehen",
    recommendedText: "Diese geprüften Programme passen am besten zu den in deiner Orientierung gespeicherten Kriterien. Die Bedingungen jedes Programms müssen trotzdem einzeln geprüft werden.",
    recommendedViewAll: "Alle Programme ansehen",
    history: "Orientierungsverlauf",
    historyHint: "Frühere Versionen bleiben verfügbar, ohne die Übersicht zu überladen.",
    currentVersion: "Aktuelle Version",
    updateProject: "Projekt aktualisieren",
    noOrientation: "Mit diesem Konto ist noch keine Orientierung verknüpft.",
    startOrientation: "Orientierung starten",
  },
  orientation: {
    eyebrow: "Meine Orientierung",
    title: "Deine aktuelle Orientierung",
    subtitle: "Prüfe die Angaben, die als Ausgangspunkt dienen, und aktualisiere sie bei Änderungen.",
    update: "Orientierung aktualisieren",
    current: "Aktuelle Orientierung",
    history: "Frühere Versionen ansehen",
    savedOn: "Gespeichert am",
    confirmed: "Orientierung bestätigt",
    nextDocuments: "Nächster Schritt: deine Dokumente",
    nextDocumentsBody: "Deine Orientierung ist gespeichert. Füge jetzt die Startdokumente hinzu, damit dein Dossier geprüft werden kann.",
    noOrientation: "Noch keine Orientierung verfügbar.",
  },
  catalogue: {
    eyebrow: "Geprüfter Studienkatalog",
    title: "Programme & Hochschulen",
    subtitle: "Du kannst den Katalog schon vor deinem persönlichen Vorschlag durchsuchen. Katalogergebnisse allein sind keine Campus-Allemagne-Empfehlung.",
    boundary: "Anforderungen können sich ändern. Prüfe vor einer Bewerbung immer die offizielle Quelle.",
    filters: "Katalog filtern",
    degree: "Abschluss",
    field: "Fach",
    city: "Stadt",
    german: "Deutsch",
    uniAssist: "uni-assist",
    yes: "Ja",
    all: "Alle",
    apply: "Anwenden",
    reset: "Zurücksetzen",
    results: (count) => `${count} Programm${count === 1 ? "" : "e"} angezeigt`,
    projectMatch: "Passt zu Kriterien deines Projekts",
    generalCatalogue: "Allgemeiner Katalog",
    recommendedTitle: "Für dein Projekt empfohlen",
    recommendedSubtitle: "Aus deiner Orientierung und dem geprüften Katalog abgeleitet. Eine Übereinstimmung garantiert weder Zulassung noch endgültige Eignung.",
    preferredCity: "Bevorzugte Stadt",
    requirementCheck: "Bedingungen prüfen",
    browseAllTitle: "Gesamten Katalog durchsuchen",
    browseAllSubtitle: "Nutze die Filter, um über deine persönliche Auswahl hinaus zu suchen.",
    source: "Offizielle Quelle",
    applyLink: "Bewerbungsinfo",
    noResults: "Zu diesen Filtern ist derzeit kein geprüftes Programm verfügbar.",
  },
  proposal: {
    eyebrow: "Mein Campus-Allemagne-Vorschlag",
    title: "Dein vorgeschlagener Weg",
    subtitle: "Hier wird klar zwischen frei erkundbaren Optionen und dem nach Prüfung deines Dossiers erstellten Vorschlag unterschieden.",
    waitingTitle: "Dein Vorschlag ist noch nicht fertig",
    waitingBody: "Während der Prüfung kannst du Programme und Lösungen weiter erkunden.",
    documentsTitle: "Vervollständige zuerst deine Startdokumente",
    documentsBody: "Wir brauchen die Pflichtdokumente, bevor wir einen persönlichen Vorschlag fertigstellen können.",
    reviewTitle: "Dein Dossier wird geprüft",
    reviewBody: "Campus Allemagne prüft Orientierung und Dokumente, um den passenden Weg vorzubereiten.",
    readyTitle: "Dein Vorschlag ist bereit",
    confirmedTitle: "Dein Weg ist bestätigt",
    questionTitle: "Deine Rückfrage wurde übermittelt",
  },
  roadmap: {
    eyebrow: "Meine nächsten Schritte",
    title: "Dein Weg Schritt für Schritt",
    subtitle: "Immer nur ein Schritt sollte Priorität haben. Spätere Schritte bleiben sichtbar.",
    current: "In Bearbeitung",
    done: "Erledigt",
    next: "Als Nächstes",
    later: "Später",
    completedGroup: "Erledigte Schritte",
    futureGroup: "Spätere Schritte",
  },
  solutions: {
    eyebrow: "Nützliche Lösungen",
    title: "Anbieter & Lösungen",
    subtitle: "Erkunde Sprachkurse, Sperrkonto, Versicherung und Finanzierung schon vor deinem persönlichen Vorschlag.",
    boundary: "Ein Eintrag bedeutet nicht automatisch eine Empfehlung für deinen Fall. Prüfe immer die offiziellen Bedingungen.",
    language: "Sprachkurse",
    languageText: "Veröffentlichte und kürzlich geprüfte Kurse zur Vorbereitung auf dein Deutschniveau.",
    finance: "Sperrkonto, Versicherung & Finanzierung",
    financeText: "Veröffentlichte Optionen mit offizieller Quelle und Prüfdatum.",
    official: "Offizielle Quelle",
    provider: "Anbieter-Website",
    forYourProject: "In deiner bevorzugten Stadt",
    empty: "In dieser Kategorie ist derzeit keine geprüfte Option verfügbar.",
  },
};

const ar: ProspectHubCopy = {
  shell: {
    area: "مساحتي في Campus Allemagne",
    badge: "حساب مجاني",
    intro: "مشروعك ووثائقك واقتراحك والحلول المفيدة في مكان واحد.",
    navigation: "التنقل داخل مساحتي",
    journeyGroup: "مساري",
    servicesGroup: "الخدمات والحلول",
    homeAria: "الصفحة الرئيسية لمساحتي في Campus Allemagne",
    logout: "تسجيل الخروج",
    links: {
      dashboard: "لوحة المتابعة",
      orientation: "توجيهي",
      catalogue: "البرامج والكتالوج",
      proposal: "اقتراحي",
      roadmap: "خطواتي القادمة",
      documents: "وثائقي",
      solutions: "مقدمو الخدمات والحلول",
      offers: "عروضي",
      payment: "الدفع",
    },
  },
  dashboard: {
    eyebrow: "مشروعي في ألمانيا",
    title: "هذه هي وضعية مشروعك اليوم.",
    subtitle: "تابع تقدمك، واعرف ما الذي تعمل عليه Campus Allemagne، وأنجز ما هو مطلوب منك.",
    project: "مشروعك",
    progress: "التقدم",
    nextAction: "خطوتك التالية",
    campusAction: "Campus Allemagne تعمل على",
    proposal: "اقتراحي من Campus Allemagne",
    proposalWaiting: "قيد الإعداد",
    proposalReady: "جاهز للمراجعة",
    proposalConfirmed: "تم تأكيد المسار",
    documents: "وثائق التأهيل",
    documentsSummary: (approved, required, pending, replacement) =>
      `${approved}/${required} مصادق عليها${pending ? ` · ${pending} قيد المراجعة` : ""}${replacement ? ` · ${replacement} تحتاج إلى تصحيح` : ""}`,
    browseTitle: "يمكنك استكشاف مشروعك من الآن",
    browseText: "يبقى كتالوج البرامج ودورات اللغة وحلول التمويل متاحًا أثناء إعداد اقتراحك.",
    browseCatalogue: "استكشاف البرامج",
    browseSolutions: "عرض الحلول",
    browseDocuments: "إدارة الوثائق",
    viewProposal: "عرض اقتراحي",
    recommendedTitle: "برامج ننصحك بمراجعتها أولًا",
    recommendedText: "هذه البرامج الموثقة هي الأقرب إلى المعايير المسجلة في توجيهك، مع ضرورة التحقق من شروط كل برنامج على حدة.",
    recommendedViewAll: "عرض جميع البرامج",
    history: "سجل التوجيه",
    historyHint: "تبقى النسخ السابقة متاحة دون أن تملأ لوحة المتابعة.",
    currentVersion: "النسخة الحالية",
    updateProject: "تحديث مشروعي",
    noOrientation: "لا يوجد توجيه مرتبط بهذا الحساب بعد.",
    startOrientation: "بدء التوجيه",
  },
  orientation: {
    eyebrow: "توجيهي",
    title: "توجيهك الحالي",
    subtitle: "راجع المعلومات التي يعتمد عليها مشروعك وحدّثها عندما تتغير.",
    update: "تحديث توجيهي",
    current: "التوجيه الحالي",
    history: "عرض النسخ السابقة",
    savedOn: "تم الحفظ في",
    confirmed: "تم تأكيد التوجيه",
    nextDocuments: "الخطوة التالية: وثائقك",
    nextDocumentsBody: "تم حفظ توجيهك. أضف الآن الوثائق الأساسية حتى يمكن مراجعة ملفك.",
    noOrientation: "لا يوجد توجيه متاح بعد.",
  },
  catalogue: {
    eyebrow: "كتالوج أكاديمي تم التحقق منه",
    title: "البرامج والجامعات",
    subtitle: "يمكنك تصفح الكتالوج حتى قبل جاهزية اقتراحك الشخصي. نتائج الكتالوج وحدها ليست توصية من Campus Allemagne.",
    boundary: "قد تتغير الشروط. تحقق دائمًا من المصدر الرسمي قبل التقديم.",
    filters: "تصفية الكتالوج",
    degree: "الدرجة",
    field: "المجال",
    city: "المدينة",
    german: "الألمانية",
    uniAssist: "uni-assist",
    yes: "نعم",
    all: "الكل",
    apply: "تطبيق",
    reset: "إعادة ضبط",
    results: (count) => `تم عرض ${count} برنامج`,
    projectMatch: "يتوافق مع معايير من مشروعك",
    generalCatalogue: "الكتالوج العام",
    recommendedTitle: "مقترحة لمشروعك",
    recommendedSubtitle: "اختيار مبني على توجيهك والكتالوج الموثق. التطابق لا يضمن القبول أو الأهلية النهائية.",
    preferredCity: "المدينة المفضلة",
    requirementCheck: "شروط تحتاج إلى التحقق",
    browseAllTitle: "استكشاف كامل الكتالوج",
    browseAllSubtitle: "استخدم الفلاتر للبحث خارج اختيارك الشخصي.",
    source: "المصدر الرسمي",
    applyLink: "معلومات التقديم",
    noResults: "لا يوجد حاليًا برنامج موثّق يطابق هذه الفلاتر.",
  },
  proposal: {
    eyebrow: "اقتراحي من Campus Allemagne",
    title: "المسار المقترح لك",
    subtitle: "تفصل هذه الصفحة بين ما يمكنك استكشافه بحرية وبين الاقتراح الذي تعدّه Campus Allemagne بعد مراجعة ملفك.",
    waitingTitle: "اقتراحك ليس جاهزًا بعد",
    waitingBody: "يمكنك مواصلة استكشاف البرامج والحلول أثناء المراجعة.",
    documentsTitle: "أكمل أولًا الوثائق الأساسية",
    documentsBody: "نحتاج إلى الوثائق الإلزامية قبل إنهاء اقتراح شخصي.",
    reviewTitle: "ملفك قيد المراجعة",
    reviewBody: "تراجع Campus Allemagne توجيهك ووثائقك لإعداد المسار المناسب.",
    readyTitle: "اقتراحك جاهز",
    confirmedTitle: "تم تأكيد مسارك",
    questionTitle: "تم إرسال طلب المراجعة",
  },
  roadmap: {
    eyebrow: "خطواتي القادمة",
    title: "مسارك خطوة بخطوة",
    subtitle: "يجب أن تكون هناك خطوة واحدة ذات أولوية في كل مرة، مع بقاء الخطوات اللاحقة واضحة.",
    current: "قيد الإنجاز",
    done: "مكتمل",
    next: "التالي",
    later: "لاحقًا",
    completedGroup: "الخطوات المكتملة",
    futureGroup: "الخطوات اللاحقة",
  },
  solutions: {
    eyebrow: "حلول مفيدة",
    title: "مقدمو الخدمات والحلول",
    subtitle: "استكشف دورات اللغة والحساب المغلق والتأمين والتمويل حتى قبل اقتراحك الشخصي.",
    boundary: "وجود مقدم خدمة في الكتالوج لا يعني تلقائيًا أنه موصى به لحالتك. تحقق دائمًا من الشروط الرسمية.",
    language: "دورات اللغة",
    languageText: "دورات منشورة وتم التحقق منها مؤخرًا لتحسين مستواك في الألمانية.",
    finance: "الحساب المغلق والتأمين والتمويل",
    financeText: "خيارات منشورة مع مصدر رسمي وتاريخ تحقق.",
    official: "المصدر الرسمي",
    provider: "موقع مقدم الخدمة",
    forYourProject: "قريب من مدينتك المفضلة",
    empty: "لا يوجد خيار تم التحقق منه في هذه الفئة حاليًا.",
  },
};

export const prospectHubCopy: Record<Locale, ProspectHubCopy> = {
  fr,
  ar,
  en,
  de,
};
