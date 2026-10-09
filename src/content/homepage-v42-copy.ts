import type { Locale } from "@/lib/i18n";

/** Public-facing copy for the V4.2 homepage. Entitlements are deliberately
 * separated: public orientation, free prospect space and activated client area. */
export type HomepageV42Copy = {
  nav: { about: string; journey: string; services: string; faq: string; contact: string };
  journeyPhases: readonly [string, string, string];
  about: {
    eyebrow: string; title: string; intro: string; missionLabel: string; mission: string; contactLabel: string;
    valuesTitle: string; values: readonly (readonly [string, string])[]; independence: string;
  };
  experience: {
    eyebrow: string; title: string; intro: string; freeTab: string; clientTab: string;
    illustration: string; freeTitle: string; freeIntro: string;
    freeItems: readonly (readonly [string, string])[];
    clientTitle: string; clientIntro: string; clientItems: readonly (readonly [string, string])[];
    freeNote: string; clientNote: string; freeCta: string; clientCta: string;
  };
  services: {
    eyebrow: string; title: string; intro: string;
    options: readonly (readonly [string, string, string, string])[];
    note: string;
  };
  faqExtra: readonly (readonly [string, string])[];
  footer: { tagline: string; about: string; services: string };
};

export const homepageV42Copy: Record<Locale, HomepageV42Copy> = {
  fr: {
    nav: { about: "À propos", journey: "Le parcours", services: "Nos services", faq: "Questions", contact: "Contact" },
    journeyPhases: ["S’orienter", "Choisir et candidater", "Préparer la suite"],
    about: {
      eyebrow: "À propos de Campus Allemagne",
      title: "Préparez vos études en Allemagne plus facilement.",
      intro: "Campus Allemagne est une plateforme indépendante pour les personnes qui veulent étudier en Allemagne. Nous proposons des informations, une orientation gratuite et, si besoin, un accompagnement proposé séparément.",
      missionLabel: "Notre mission",
      mission: "Nous vous aidons à préparer vos études en Allemagne, étape par étape. Les universités décident des admissions et les autorités décident des visas.",
      contactLabel: "Une question ? Contactez-nous",
      valuesTitle: "Ce qui fait notre différence",
      values: [
        ["Une orientation adaptée à votre situation", "Nous tenons compte de vos études, de vos langues et de vos objectifs."],
        ["Savoir quoi faire ensuite", "Découvrez ce que vous pouvez faire maintenant et plus tard."],
        ["Des services expliqués clairement", "Vous savez ce qui est gratuit, ce qui est payant et qui prend les décisions officielles."],
      ],
      independence: "Campus Allemagne est indépendant. Les universités décident des admissions et les autorités décident des visas.",
    },
    experience: {
      eyebrow: "Découvrez votre espace",
      title: "Un espace pour suivre votre projet.",
      intro: "L’orientation est gratuite. Avec un compte gratuit, retrouvez votre projet et vos possibilités. Un accompagnement plus complet peut être proposé séparément.",
      freeTab: "Compte gratuit", clientTab: "Accompagnement",
      illustration: "Exemple uniquement — ce n’est pas un vrai dossier",
      freeTitle: "Votre projet prend forme.",
      freeIntro: "Si votre orientation est liée à votre compte, vous pouvez la retrouver plus tard.",
      freeItems: [
        ["Mon orientation", "Retrouvez votre projet et mettez-le à jour."],
        ["Programmes à explorer", "Consultez des programmes et vérifiez les conditions sur les sites officiels."],
        ["Mes prochaines étapes", "Voyez ce que vous pouvez préparer selon votre situation."],
      ],
      clientTitle: "Suivez votre dossier plus facilement.",
      clientIntro: "Si votre accompagnement est activé, vous avez accès à plus d’outils pour suivre votre dossier.",
      clientItems: [
        ["Documents", "Retrouvez les pièces à fournir et celles à compléter."],
        ["Candidatures", "Retrouvez les programmes, les actions et leur état d’avancement."],
        ["Dates importantes", "Retrouvez les dates à ne pas oublier."],
        ["Échanges", "Retrouvez les messages liés à votre dossier."],
      ],
      freeNote: "L’inscription gratuite n’active pas automatiquement les services payants.",
      clientNote: "Pour accéder aux services payants, il faut accepter une offre, payer et recevoir une confirmation.",
      freeCta: "Commencer gratuitement", clientCta: "Nous contacter",
    },
    services: {
      eyebrow: "Nos services, en toute clarté",
      title: "Commencez gratuitement. Choisissez la suite.",
      intro: "Vous choisissez comment avancer. Nous vous montrons les possibilités selon votre situation.",
      options: [
        ["01 · Sans compte", "Orientation gratuite", "Répondez à quelques questions pour savoir par où commencer.", "Faire mon orientation"],
        ["02 · Compte gratuit", "Explorer mon projet", "Retrouvez votre orientation, les programmes à découvrir et vos prochaines étapes.", "Créer mon espace"],
        ["03 · Après une offre", "Accompagnement personnalisé", "Nous étudions votre projet et pouvons vous proposer une aide payante. Vous voyez les services et le prix avant de décider.", "Poser une question"],
      ],
      note: "Aucun accompagnement payant n’est automatiquement inclus lors de l’inscription. Campus Allemagne ne garantit ni admission ni visa.",
    },
    faqExtra: [
      ["Est-ce que je dois payer après l’orientation gratuite ?", "Non. Vous pouvez commencer sans compte et sans payer. Si vous souhaitez plus d’aide, nos services payants sont proposés séparément."],
      ["Qu’est-ce qui change avec un accompagnement ?", "Après étude de votre dossier, vous pouvez accepter une offre d’accompagnement. L’accès aux outils prévus commence après confirmation. Vous connaissez les services et le prix avant de choisir."],
    ],
    footer: {
      tagline: "Informations, orientation et accompagnement pour étudier en Allemagne. Plateforme indépendante.",
      about: "À propos", services: "Nos services",
    },
  },
  ar: {
    nav: { about: "من نحن", journey: "مراحل الدراسة", services: "خدماتنا", faq: "الأسئلة", contact: "اتصل بنا" },
    journeyPhases: ["تحديد الهدف", "اختيار التخصص والتقديم", "الاستعداد والمتابعة"],
    about: {
      eyebrow: "من نحن — Campus Allemagne",
      title: "مشروع دراستك يستحق أكثر من معلومات متفرقة.",
      intro: "Campus Allemagne منصة مستقلة للمعلومات والتوجيه والمرافقة للراغبين في الدراسة في ألمانيا. هدفنا مساعدتك على فهم الخيارات المتاحة والاستعداد لكل مرحلة بوضوح.",
      missionLabel: "مهمتنا",
      mission: "تبسيط خطوات الدراسة في ألمانيا، مع توضيح الفرق بين النصيحة والمرافقة والقرارات الرسمية.",
      contactLabel: "لديك سؤال؟ تواصل معنا",
      valuesTitle: "ما الذي يميز طريقتنا؟",
      values: [
        ["توجيه حسب وضعك", "نأخذ دراستك ومستواك اللغوي وأهدافك في الاعتبار عند عرض الخيارات."],
        ["خطوة تالية واضحة", "تعرف ما يمكنك تحضيره الآن وما يجب تأجيله إلى مرحلة لاحقة."],
        ["شفافية من البداية", "نوضح ما هو مجاني وما يندرج ضمن المرافقة المدفوعة وما تقرره الجهات الرسمية."],
      ],
      independence: "Campus Allemagne منصة مستقلة. قرارات القبول والتأشيرة تعود حصريًا للمؤسسات والسلطات المختصة.",
    },
    experience: {
      eyebrow: "اكتشف مساحتك",
      title: "مساحة تناسب المرحلة التي وصل إليها مشروعك.",
      intro: "التوجيه مجاني. وإذا أنشأت حسابًا، يمكنك الرجوع إلى معلوماتك وخياراتك. أما المرافقة الأشمل فهي خدمة منفصلة.",
      freeTab: "الحساب المجاني", clientTab: "المرافقة",
      illustration: "عرض توضيحي ببيانات افتراضية، وليس ملفًا حقيقيًا",
      freeTitle: "ابدأ بتنظيم مشروعك.",
      freeIntro: "بعد ربط التوجيه بحسابك، تابع الخطوات حسب وقتك.",
      freeItems: [
        ["توجيهي", "ارجع إلى معلومات مشروعك وعدّلها عند الحاجة."],
        ["البرامج المتاحة للبحث", "استكشف الخيارات وتحقق من شروطها عبر المصادر الرسمية."],
        ["خطواتي التالية", "اعرف ما يمكنك تحضيره وفقًا لوضعك."],
      ],
      clientTitle: "متابعة أشمل لملفك.",
      clientIntro: "عند تفعيل المرافقة، تتوفر أدوات إضافية لمتابعة الملف.",
      clientItems: [
        ["الوثائق", "تابع الوثائق المطلوبة وما يجب استكماله."],
        ["الترشحات", "نظّم البرامج والإجراءات والحالات المسجلة."],
        ["المواعيد المهمة", "احتفظ بمواعيدك المهمة أمامك."],
        ["الرسائل", "راجع الرسائل المتعلقة بملفك."],
      ],
      freeNote: "إنشاء حساب مجاني لا يفعّل الخدمات المدفوعة تلقائيًا.",
      clientNote: "يُفعّل وصول العميل بعد قبول العرض والدفع والتحقق منه.",
      freeCta: "ابدأ مجانًا", clientCta: "تواصل معنا",
    },
    services: {
      eyebrow: "خدماتنا بوضوح",
      title: "ابدأ مجانًا، ثم اختر الخطوة المناسبة.",
      intro: "أنت من يقرر كيف يتقدم مشروعك. نعرض الخدمات المتاحة حسب وضعك وفي الوقت المناسب.",
      options: [
        ["01 · دون حساب", "توجيه مجاني", "أجب عن أسئلة بسيطة للحصول على نقطة انطلاق تناسب وضعك.", "ابدأ التوجيه"],
        ["02 · حساب مجاني", "استكشف مشروعي", "ارجع إلى توجيهك وبرامج الدراسة وخطواتك التالية حسب مسارك.", "أنشئ مساحتي"],
        ["03 · بعد تقديم عرض", "مرافقة شخصية", "بعد دراسة مشروعك، اطلع على الخدمات المقترحة وشروطها قبل أن تقرر.", "اطرح سؤالًا"],
      ],
      note: "الحساب المجاني لا يشمل المرافقة المدفوعة تلقائيًا. ولا تضمن Campus Allemagne القبول أو التأشيرة.",
    },
    faqExtra: [
      ["هل التوجيه المجاني يلزمني بالدفع؟", "لا. يمكنك البدء من دون حساب أو دفع. وتُعرض خدمات المرافقة المحتملة بشكل منفصل."],
      ["ماذا يتغير عند اختيار المرافقة؟", "بعد دراسة ملفك والموافقة على عرض والتحقق منه، يمكنك استخدام أدوات المتابعة المحددة في الخدمة. يجب توضيح الخدمات والسعر قبل أي التزام."],
    ],
    footer: { tagline: "معلومات وتوجيه ومرافقة للدراسة في ألمانيا — منصة مستقلة.", about: "من نحن", services: "خدماتنا" },
  },
  en: {
    nav: { about: "About us", journey: "The journey", services: "Services", faq: "Questions", contact: "Contact" },
    journeyPhases: ["Explore your options", "Choose and apply", "Prepare and follow up"],
    about: {
      eyebrow: "About Campus Allemagne",
      title: "Your study plans deserve more than scattered information.",
      intro: "Campus Allemagne is an independent information, guidance and support platform for people planning to study in Germany. Our goal is to make your options and next steps easier to understand.",
      missionLabel: "Our mission",
      mission: "Make the journey towards studying in Germany clearer, while distinguishing guidance and support from official decisions.",
      contactLabel: "Questions? Contact us",
      valuesTitle: "What makes our approach different",
      values: [
        ["Guidance based on your profile", "Your education, languages and goals shape the options to explore."],
        ["A clear next step", "See what you can prepare today and what comes later."],
        ["Transparency first", "Know what is free, what is part of paid support, and who makes official decisions."],
      ],
      independence: "Campus Allemagne is independent. Admission and visa decisions are made solely by the relevant institutions and authorities.",
    },
    experience: {
      eyebrow: "Explore your space",
      title: "A space that grows with your study plans.",
      intro: "Guidance is free. With a free account you can revisit your project and options. More extensive support is a separate service.",
      freeTab: "Free account", clientTab: "Supported journey",
      illustration: "Illustrative preview with fictional data — not a live student dossier",
      freeTitle: "Your project starts taking shape.",
      freeIntro: "Once your guidance is linked to an account, explore at your own pace.",
      freeItems: [
        ["My guidance", "Review and update your study plans."],
        ["Programmes to explore", "Browse options and check official requirements."],
        ["My next steps", "See what to prepare according to your situation."],
      ],
      clientTitle: "Take your dossier further.",
      clientIntro: "Activated clients have access to more extensive tracking tools.",
      clientItems: [
        ["Documents", "See the documents to provide and those still missing."],
        ["Applications", "Organise your saved programmes, actions and statuses."],
        ["Deadlines", "Keep important dates in view."],
        ["Messages", "Find updates and exchanges linked to your dossier."],
      ],
      freeNote: "A free account does not automatically include paid services.",
      clientNote: "Client access depends on an accepted proposal, payment and validation.",
      freeCta: "Start for free", clientCta: "Contact us",
    },
    services: {
      eyebrow: "Clear about our services",
      title: "Start free. Decide what comes next.",
      intro: "You remain in control. Options and services are presented when relevant to your situation.",
      options: [
        ["01 · No account", "Free guidance", "Answer a few questions for an initial personalised starting point.", "Start guidance"],
        ["02 · Free account", "Explore my project", "Revisit your guidance, discover programmes and follow the next steps available to you.", "Create my space"],
        ["03 · By proposal", "Personalised support", "After your project is reviewed, see any proposed services and their terms before deciding.", "Ask a question"],
      ],
      note: "Paid support is not automatically included when signing up. Campus Allemagne cannot guarantee admission or a visa.",
    },
    faqExtra: [
      ["Does free guidance require payment?", "No. You can start without an account or payment. Any additional support services are offered separately."],
      ["What changes with support?", "After your dossier is reviewed and an offer is accepted and validated, you can access the tools included in that service. The scope and price must be shown before you commit."],
    ],
    footer: { tagline: "Information, guidance and support for studying in Germany — an independent platform.", about: "About us", services: "Services" },
  },
  de: {
    nav: { about: "Über uns", journey: "Der Weg", services: "Leistungen", faq: "Fragen", contact: "Kontakt" },
    journeyPhases: ["Orientieren", "Auswählen und bewerben", "Vorbereiten und begleiten"],
    about: {
      eyebrow: "Über Campus Allemagne",
      title: "Dein Studienvorhaben verdient mehr als verstreute Informationen.",
      intro: "Campus Allemagne ist eine unabhängige Plattform für Information, Orientierung und Begleitung auf dem Weg zu einem Studium in Deutschland. Wir helfen dabei, Möglichkeiten und nächste Schritte besser zu verstehen.",
      missionLabel: "Unsere Aufgabe",
      mission: "Den Weg zum Studium in Deutschland verständlicher machen und dabei Beratung, Begleitung und behördliche Entscheidungen klar unterscheiden.",
      contactLabel: "Fragen? Kontakt aufnehmen",
      valuesTitle: "Was unseren Ansatz auszeichnet",
      values: [
        ["Orientierung für dein Profil", "Ausbildung, Sprachkenntnisse und Ziele bestimmen die Studienoptionen, die du erkunden kannst."],
        ["Ein klarer nächster Schritt", "Erkenne, was du jetzt vorbereiten kannst und was erst später ansteht."],
        ["Transparenz von Anfang an", "Du erkennst, was kostenlos ist, welche Leistungen zusätzlich kosten und wer offiziell entscheidet."],
      ],
      independence: "Campus Allemagne ist unabhängig. Über Zulassung und Visa entscheiden ausschließlich die zuständigen Einrichtungen und Behörden.",
    },
    experience: {
      eyebrow: "Entdecke deinen Bereich",
      title: "Ein Bereich, der zu deinem Studienweg passt.",
      intro: "Die Orientierung ist kostenlos. Mit einem kostenlosen Konto kannst du zu deinem Vorhaben und deinen Optionen zurückkehren. Erweiterte Begleitung ist eine separate Leistung.",
      freeTab: "Kostenloses Konto", clientTab: "Begleitung",
      illustration: "Erklärende Vorschau mit Beispieldaten — keine echte Studierendenakte",
      freeTitle: "Dein Vorhaben nimmt Gestalt an.",
      freeIntro: "Sobald deine Orientierung mit dem Konto verknüpft ist, kannst du in deinem Tempo weitermachen.",
      freeItems: [
        ["Meine Orientierung", "Studienvorhaben ansehen und bei Bedarf aktualisieren."],
        ["Studiengänge entdecken", "Optionen erkunden und offizielle Voraussetzungen prüfen."],
        ["Meine nächsten Schritte", "Sehen, was du in deiner Situation vorbereiten kannst."],
      ],
      clientTitle: "Mehr Überblick über deine Akte.",
      clientIntro: "Mit aktivierter Begleitung stehen erweiterte Werkzeuge zur Verfügung.",
      clientItems: [
        ["Unterlagen", "Benötigte und fehlende Dokumente im Blick behalten."],
        ["Bewerbungen", "Gespeicherte Studiengänge, Aufgaben und Status ordnen."],
        ["Fristen", "Wichtige Termine im Auge behalten."],
        ["Nachrichten", "Austausch rund um deine Akte wiederfinden."],
      ],
      freeNote: "Ein kostenloses Konto schaltet kostenpflichtige Leistungen nicht automatisch frei.",
      clientNote: "Der Kundenzugang setzt ein angenommenes Angebot, Zahlung und Bestätigung voraus.",
      freeCta: "Kostenlos starten", clientCta: "Kontakt aufnehmen",
    },
    services: {
      eyebrow: "Unsere Leistungen im Überblick",
      title: "Kostenlos starten. Danach selbst entscheiden.",
      intro: "Du entscheidest, wie es weitergeht. Passende Möglichkeiten und Leistungen zeigen wir zum richtigen Zeitpunkt.",
      options: [
        ["01 · Ohne Konto", "Kostenlose Orientierung", "Beantworte einige Fragen und erhalte einen ersten, auf dich zugeschnittenen Ausgangspunkt.", "Orientierung starten"],
        ["02 · Kostenloses Konto", "Mein Vorhaben erkunden", "Deine Orientierung, Studienoptionen und nächsten Schritte an einem Ort.", "Mein Konto erstellen"],
        ["03 · Nach Angebot", "Persönliche Begleitung", "Nach Prüfung deines Vorhabens kannst du vorgeschlagene Leistungen und Bedingungen einsehen, bevor du dich entscheidest.", "Frage stellen"],
      ],
      note: "Kostenpflichtige Begleitung ist nicht automatisch Teil der Anmeldung. Campus Allemagne garantiert weder Studienplatz noch Visum.",
    },
    faqExtra: [
      ["Muss ich für die kostenlose Orientierung bezahlen?", "Nein. Du kannst ohne Konto und ohne Zahlung beginnen. Zusätzliche Begleitung wird separat angeboten."],
      ["Was ändert sich mit einer Begleitung?", "Nach Prüfung deiner Akte und Annahme sowie Freigabe eines Angebots kannst du die enthaltenen Werkzeuge nutzen. Umfang und Preis müssen vor deiner Entscheidung sichtbar sein."],
    ],
    footer: { tagline: "Information, Orientierung und Begleitung für ein Studium in Deutschland — unabhängige Plattform.", about: "Über uns", services: "Leistungen" },
  },
};
