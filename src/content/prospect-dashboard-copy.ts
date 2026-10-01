import type { Locale } from "@/lib/i18n";

export type ProspectDashboardCopy = {
  shell: {
    area: string;
    freeBadge: string;
    intro: string;
    navigation: string;
    homeAria: string;
    logout: string;
    links: {
      orientation: string;
      possibilities: string;
      roadmap: string;
      missing: string;
      update: string;
    };
  };
  page: {
    eyebrow: string;
    title: string;
    subtitle: string;
    freeAccountTitle: string;
    freeAccountText: string;
    noOrientationTitle: string;
    noOrientationText: string;
    startOrientation: string;
    latestOrientation: string;
    possibilities: string;
    roadmap: string;
    roadmapNow: string;
    roadmapAfterResults: string;
    roadmapVerifyNext: string;
    missing: string;
    historyTitle: string;
    historyText: string;
    historyCurrent: string;
    updateProject: string;
    updateProjectText: string;
    updateProjectCta: string;
    savedOn: string;
    disclaimer: string;
  };
};

const fr: ProspectDashboardCopy = {
  shell: {
    area: "Espace gratuit",
    freeBadge: "Compte gratuit",
    intro: "Votre orientation, vos pistes et les prochaines vérifications.",
    navigation: "Mon espace",
    homeAria: "Accueil de mon espace gratuit",
    logout: "Déconnexion",
    links: {
      orientation: "Mon orientation",
      possibilities: "Mes possibilités",
      roadmap: "Mes prochaines étapes",
      missing: "Ce qu’il me manque",
      update: "Mettre à jour mon projet",
    },
  },
  page: {
    eyebrow: "Espace gratuit Campus Allemagne",
    title: "Votre projet Allemagne, sans ouvrir un dossier payant.",
    subtitle: "Retrouvez l’orientation liée à votre compte et avancez sur les points qui peuvent être préparés gratuitement.",
    freeAccountTitle: "Ce qui est gratuit et ce qui est réservé aux clients",
    freeAccountText: "La préparation des documents, le suivi des candidatures, la liste complète du dossier et l’accompagnement personnalisé sont réservés aux clients actifs.",
    noOrientationTitle: "Aucune orientation liée à ce compte",
    noOrientationText: "Commencez une orientation gratuite ou utilisez le lien sécurisé reçu par e-mail pour rattacher une orientation existante.",
    startOrientation: "Faire mon orientation",
    latestOrientation: "Mon orientation",
    possibilities: "Mes possibilités",
    roadmap: "Mes prochaines étapes",
    roadmapNow: "À faire maintenant",
    roadmapAfterResults: "Après vos résultats du Bac",
    roadmapVerifyNext: "À vérifier ensuite",
    missing: "Ce qu’il me manque",
    historyTitle: "Historique de mes orientations",
    historyText: "Chaque mise à jour crée une nouvelle version. Les versions précédentes restent conservées.",
    historyCurrent: "Version actuelle",
    updateProject: "Mettre à jour mon projet",
    updateProjectText: "Refaites le questionnaire lorsque votre Bac, votre moyenne, vos langues ou votre projet évoluent.",
    updateProjectCta: "Mettre à jour mon projet",
    savedOn: "Orientation enregistrée le",
    disclaimer: "Ces indications structurent votre recherche. Elles ne garantissent ni admission ni visa.",
  },
};

const ar: ProspectDashboardCopy = {
  shell: {
    area: "المساحة المجانية",
    freeBadge: "حساب مجاني",
    intro: "توجيهك والمسارات المقترحة والنقاط التي يجب التحقق منها.",
    navigation: "مساحتي",
    homeAria: "الصفحة الرئيسية لمساحتي المجانية",
    logout: "تسجيل الخروج",
    links: {
      orientation: "توجيهي",
      possibilities: "إمكانياتي",
      roadmap: "خارطة الطريق",
      missing: "ما الذي ينقصني",
      update: "تحديث مشروعي",
    },
  },
  page: {
    eyebrow: "المساحة المجانية Campus Allemagne",
    title: "مشروعك للدراسة في ألمانيا دون فتح ملف مدفوع.",
    subtitle: "استرجع التوجيه المرتبط بحسابك وواصل الخطوات التي يمكنك تحضيرها مجانًا.",
    freeAccountTitle: "الحساب المجاني لا يعني مرافقة مدفوعة",
    freeAccountText: "الوثائق وإدارة الترشحات وقائمة الملف والمتابعة الكاملة تبقى مخصصة للعملاء النشطين.",
    noOrientationTitle: "لا يوجد توجيه مرتبط بهذا الحساب",
    noOrientationText: "ابدأ توجيهًا مجانيًا أو استخدم الرابط الآمن الذي وصلك عبر البريد لربط توجيه موجود.",
    startOrientation: "ابدأ توجيهي",
    latestOrientation: "توجيهي",
    possibilities: "إمكانياتي",
    roadmap: "خارطة الطريق",
    roadmapNow: "ما يمكن القيام به الآن",
    roadmapAfterResults: "بعد نتائج البكالوريا",
    roadmapVerifyNext: "ما يجب التحقق منه لاحقًا",
    missing: "ما الذي ينقصني",
    historyTitle: "سجل التوجيهات",
    historyText: "كل تحديث ينشئ نسخة جديدة، مع الاحتفاظ بالنسخ السابقة.",
    historyCurrent: "النسخة الحالية",
    updateProject: "تحديث مشروعي",
    updateProjectText: "أعد الاستبيان عندما تتغير نتيجة البكالوريا أو المعدل أو اللغة أو هدفك.",
    updateProjectCta: "تحديث مشروعي",
    savedOn: "تم حفظ التوجيه في",
    disclaimer: "هذه المعلومات تنظّم بحثك فقط ولا تضمن القبول أو التأشيرة.",
  },
};

const en: ProspectDashboardCopy = {
  shell: {
    area: "Free space",
    freeBadge: "Free account",
    intro: "Your orientation, possible paths and the checks still ahead.",
    navigation: "My space",
    homeAria: "Free-space home",
    logout: "Sign out",
    links: {
      orientation: "My orientation",
      possibilities: "My possibilities",
      roadmap: "My roadmap",
      missing: "What I still need",
      update: "Update my project",
    },
  },
  page: {
    eyebrow: "Campus Allemagne free space",
    title: "Your Germany project, without opening a paid file.",
    subtitle: "Find the orientation linked to your account and work on the steps that can be prepared for free.",
    freeAccountTitle: "Free account ≠ paid support",
    freeAccountText: "Documents, managed applications, the client checklist and full support tracking remain available only to active clients.",
    noOrientationTitle: "No orientation is linked to this account",
    noOrientationText: "Start a free orientation or use the secure email link to attach an existing one.",
    startOrientation: "Start my orientation",
    latestOrientation: "My orientation",
    possibilities: "My possibilities",
    roadmap: "My roadmap",
    roadmapNow: "What to do now",
    roadmapAfterResults: "After your Baccalaureate results",
    roadmapVerifyNext: "What to verify next",
    missing: "What I still need",
    historyTitle: "My orientation history",
    historyText: "Each update creates a new version while earlier orientations remain available in your history.",
    historyCurrent: "Current version",
    updateProject: "Update my project",
    updateProjectText: "Run the questionnaire again when your Baccalaureate results, average, languages or study goal change.",
    updateProjectCta: "Update my project",
    savedOn: "Orientation saved on",
    disclaimer: "These indications organise your research. They do not guarantee admission or a visa.",
  },
};

const de: ProspectDashboardCopy = {
  shell: {
    area: "Kostenloser Bereich",
    freeBadge: "Kostenloses Konto",
    intro: "Deine Orientierung, mögliche Wege und die nächsten Prüfungen.",
    navigation: "Mein Bereich",
    homeAria: "Startseite meines kostenlosen Bereichs",
    logout: "Abmelden",
    links: {
      orientation: "Meine Orientierung",
      possibilities: "Meine Möglichkeiten",
      roadmap: "Meine Roadmap",
      missing: "Was noch fehlt",
      update: "Projekt aktualisieren",
    },
  },
  page: {
    eyebrow: "Kostenloser Campus-Allemagne-Bereich",
    title: "Dein Deutschland-Projekt, ohne ein kostenpflichtiges Dossier zu öffnen.",
    subtitle: "Finde die mit deinem Konto verknüpfte Orientierung und arbeite an den Schritten, die kostenlos vorbereitet werden können.",
    freeAccountTitle: "Kostenloses Konto ≠ bezahlte Begleitung",
    freeAccountText: "Dokumente, verwaltete Bewerbungen, Dossier-Checkliste und vollständige Begleitung bleiben aktiven Kunden vorbehalten.",
    noOrientationTitle: "Mit diesem Konto ist keine Orientierung verknüpft",
    noOrientationText: "Starte eine kostenlose Orientierung oder nutze den sicheren Link aus der E-Mail, um eine bestehende Orientierung zu verknüpfen.",
    startOrientation: "Orientierung starten",
    latestOrientation: "Meine Orientierung",
    possibilities: "Meine Möglichkeiten",
    roadmap: "Meine Roadmap",
    roadmapNow: "Was du jetzt tun kannst",
    roadmapAfterResults: "Nach deinen Baccalauréat-Ergebnissen",
    roadmapVerifyNext: "Danach prüfen",
    missing: "Was noch fehlt",
    historyTitle: "Verlauf meiner Orientierungen",
    historyText: "Jede Aktualisierung erstellt eine neue Version. Frühere Orientierungen bleiben erhalten.",
    historyCurrent: "Aktuelle Version",
    updateProject: "Projekt aktualisieren",
    updateProjectText: "Fülle den Fragebogen erneut aus, wenn sich Bac-Ergebnis, Durchschnitt, Sprachen oder Studienziel ändern.",
    updateProjectCta: "Projekt aktualisieren",
    savedOn: "Orientierung gespeichert am",
    disclaimer: "Diese Hinweise strukturieren deine Recherche. Sie garantieren weder Zulassung noch Visum.",
  },
};

export const prospectDashboardCopy: Record<Locale, ProspectDashboardCopy> = {
  fr,
  ar,
  en,
  de,
};
