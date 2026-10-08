import type { Locale } from "@/lib/i18n";

/** Public-facing copy for the V4.2 homepage. Entitlements are deliberately
 * separated: public orientation, free prospect space and activated client area. */
export type HomepageV42Copy = {
  nav: { about: string; journey: string; services: string; faq: string; contact: string };
  about: {
    eyebrow: string; title: string; intro: string; missionLabel: string; mission: string;
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
    about: {
      eyebrow: "À propos de Campus Allemagne",
      title: "Votre projet d’études mérite plus que des informations éparpillées.",
      intro: "Campus Allemagne est une plateforme indépendante d’information, d’orientation et d’accompagnement pour les personnes qui souhaitent étudier en Allemagne. Notre objectif : vous aider à comprendre vos possibilités et à préparer chaque étape avec clarté.",
      missionLabel: "Notre mission",
      mission: "Rendre les démarches d’études en Allemagne plus simples à comprendre, sans confondre conseils, accompagnement et décisions officielles.",
      valuesTitle: "Ce qui fait notre différence",
      values: [
        ["Une orientation selon votre profil", "Vos études, vos langues et vos objectifs guident les pistes proposées."],
        ["Une prochaine étape visible", "Vous savez ce que vous pouvez préparer aujourd’hui et ce qui vient plus tard."],
        ["Une relation transparente", "Vous distinguez les outils gratuits, les offres d’accompagnement et les décisions des organismes officiels."],
      ],
      independence: "Campus Allemagne est une plateforme indépendante : les admissions et visas relèvent exclusivement des établissements et autorités compétents.",
    },
    experience: {
      eyebrow: "Découvrez votre espace",
      title: "Un espace adapté à l’avancement de votre projet.",
      intro: "L’orientation est gratuite. Si vous créez un compte, vous retrouvez vos informations et vos possibilités. L’accompagnement plus complet correspond à une prestation distincte.",
      freeTab: "Compte gratuit", clientTab: "Accompagnement",
      illustration: "Aperçu explicatif — données fictives, sans accès à un dossier réel",
      freeTitle: "Votre projet prend forme.",
      freeIntro: "Après une orientation liée à votre compte, avancez à votre rythme.",
      freeItems: [
        ["Mon orientation", "Retrouvez votre projet et mettez-le à jour."],
        ["Programmes à explorer", "Consultez des pistes et vérifiez leurs conditions officielles."],
        ["Mes prochaines étapes", "Voyez ce que vous pouvez préparer selon votre situation."],
      ],
      clientTitle: "Votre dossier, plus loin.",
      clientIntro: "Pour un client dont l’accompagnement est activé, les outils de suivi sont plus complets.",
      clientItems: [
        ["Documents", "Retrouvez les pièces à fournir et celles à compléter."],
        ["Candidatures", "Organisez les programmes, les actions et les statuts enregistrés."],
        ["Échéances", "Gardez les dates importantes en vue."],
        ["Échanges", "Retrouvez les messages liés à votre dossier."],
      ],
      freeNote: "L’inscription gratuite n’active pas automatiquement les services payants.",
      clientNote: "L’accès client dépend de la proposition acceptée, du paiement et de sa validation.",
      freeCta: "Commencer gratuitement", clientCta: "Nous contacter",
    },
    services: {
      eyebrow: "Nos services, en toute clarté",
      title: "Commencez gratuitement. Choisissez la suite.",
      intro: "Vous gardez la main sur votre projet. Les possibilités et prestations sont présentées au bon moment, selon votre situation.",
      options: [
        ["01 · Sans compte", "Orientation gratuite", "Répondez à quelques questions pour obtenir un premier point de départ personnalisé.", "Faire mon orientation"],
        ["02 · Compte gratuit", "Explorer mon projet", "Retrouvez votre orientation, des programmes à examiner et vos prochaines étapes selon votre parcours.", "Créer mon espace"],
        ["03 · Sur proposition", "Accompagnement personnalisé", "Après examen de votre projet, découvrez les prestations proposées et leurs conditions avant de décider.", "Poser une question"],
      ],
      note: "Aucun accompagnement payant n’est automatiquement inclus lors de l’inscription. Campus Allemagne ne garantit ni admission ni visa.",
    },
    faqExtra: [
      ["L’orientation gratuite m’oblige-t-elle à payer ?", "Non. Vous pouvez commencer l’orientation sans compte et sans paiement. Les éventuelles prestations d’accompagnement sont présentées séparément."],
      ["Qu’est-ce qui change avec un accompagnement ?", "Après étude de votre dossier et validation d’une offre, vous pouvez accéder aux outils de suivi prévus dans la prestation. Le contenu exact et le prix doivent être indiqués avant tout engagement."],
    ],
    footer: {
      tagline: "Information, orientation et accompagnement aux études en Allemagne — plateforme indépendante.",
      about: "À propos", services: "Nos services",
    },
  },
  ar: {
    nav: { about: "من نحن", journey: "مراحل الدراسة", services: "خدماتنا", faq: "الأسئلة", contact: "اتصل بنا" },
    about: {
      eyebrow: "من نحن — Campus Allemagne",
      title: "مشروع دراستك يستحق أكثر من معلومات متفرقة.",
      intro: "Campus Allemagne منصة مستقلة للمعلومات والتوجيه والمرافقة للراغبين في الدراسة في ألمانيا. هدفنا مساعدتك على فهم الخيارات المتاحة والاستعداد لكل مرحلة بوضوح.",
      missionLabel: "مهمتنا",
      mission: "تبسيط خطوات الدراسة في ألمانيا، مع توضيح الفرق بين النصيحة والمرافقة والقرارات الرسمية.",
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
    about: {
      eyebrow: "About Campus Allemagne",
      title: "Your study plans deserve more than scattered information.",
      intro: "Campus Allemagne is an independent information, guidance and support platform for people planning to study in Germany. Our goal is to make your options and next steps easier to understand.",
      missionLabel: "Our mission",
      mission: "Make the journey towards studying in Germany clearer, while distinguishing guidance and support from official decisions.",
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
    about: {
      eyebrow: "Über Campus Allemagne",
      title: "Dein Studienvorhaben verdient mehr als verstreute Informationen.",
      intro: "Campus Allemagne ist eine unabhängige Plattform für Information, Orientierung und Begleitung auf dem Weg zu einem Studium in Deutschland. Wir helfen dabei, Möglichkeiten und nächste Schritte besser zu verstehen.",
      missionLabel: "Unsere Aufgabe",
      mission: "Den Weg zum Studium in Deutschland verständlicher machen und dabei Beratung, Begleitung und behördliche Entscheidungen klar unterscheiden.",
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
