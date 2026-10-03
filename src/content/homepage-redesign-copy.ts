import type { Locale } from "@/lib/i18n";

export type HomepageRedesignCopy = {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    primary: string;
    secondary: string;
    previewLabel: string;
    dashboard: {
      eyebrow: string;
      hello: string;
      intro: string;
      nextAction: string;
      nextActionTitle: string;
      nextActionMeta: string;
      progress: string;
      progressValue: string;
      progressMeta: string;
      cards: readonly [string, string, string][];
    };
  };
  steps: {
    eyebrow: string;
    title: string;
    intro: string;
    items: readonly [string, string][];
  };
  benefits: {
    eyebrow: string;
    title: string;
    items: readonly [string, string][];
  };
  programmes: {
    eyebrow: string;
    title: string;
    text: string;
    rows: readonly [string, string, string][];
    note: string;
  };
  documents: {
    eyebrow: string;
    title: string;
    text: string;
    rows: readonly [string, string][];
  };
  applications: {
    eyebrow: string;
    title: string;
    text: string;
    rows: readonly [string, string, string][];
  };
  sources: {
    eyebrow: string;
    title: string;
    text: string;
    points: readonly [string, string][];
  };
  faq: {
    eyebrow: string;
    title: string;
    intro: string;
    items: readonly [string, string][];
  };
  final: {
    eyebrow: string;
    title: string;
    text: string;
    primary: string;
    secondary: string;
  };
};

const fr: HomepageRedesignCopy = {
  hero: {
    eyebrow: "Pour les étudiants qui préparent leurs études en Allemagne",
    title: "Ton projet d’études en Allemagne, organisé de A à Z.",
    lead: "Trouve les programmes adaptés à ton profil, prépare tes documents et suis tes candidatures depuis un seul espace.",
    primary: "Commencer mon projet",
    secondary: "Découvrir comment ça marche",
    previewLabel: "Aperçu du dashboard AlmaGo · exemple",
    dashboard: {
      eyebrow: "Tableau de bord",
      hello: "Bonjour, Lina.",
      intro: "Voici ce qui demande ton attention maintenant.",
      nextAction: "Prochaine action",
      nextActionTitle: "Ajouter ton relevé de notes",
      nextActionMeta: "Documents · À faire",
      progress: "Préparation",
      progressValue: "4/6",
      progressMeta: "étapes terminées",
      cards: [
        ["Documents", "8", "6 prêts"],
        ["Programmes", "12", "à comparer"],
        ["Candidatures", "3", "2 en cours"],
        ["Étapes", "6", "4 terminées"],
      ],
    },
  },
  steps: {
    eyebrow: "Comment ça marche",
    title: "Trois étapes pour garder ton projet sous contrôle.",
    intro: "Tu avances dans le bon ordre, sans devoir tout comprendre dès le premier jour.",
    items: [
      ["Décris ton projet", "Indique ton niveau, ton domaine, la langue et la rentrée visée pour structurer ton point de départ."],
      ["Compare et prépare", "Repère les programmes pertinents et prépare les documents demandés au fur et à mesure."],
      ["Suis tes candidatures", "Visualise les statuts, les échéances et la prochaine action pour chaque dossier."],
    ],
  },
  benefits: {
    eyebrow: "Pourquoi AlmaGo",
    title: "Moins de dispersion. Plus de visibilité.",
    items: [
      ["Un seul espace", "Programmes, documents, candidatures et prochaines étapes restent réunis."],
      ["Priorités claires", "Tu vois ce qui demande ton attention maintenant, sans reconstruire ta checklist à chaque fois."],
      ["Sources visibles", "Les informations importantes peuvent être reliées à leur source officielle et à leur date de vérification."],
      ["Suivi continu", "Ton espace évolue avec ton projet, de la préparation jusqu’au suivi des candidatures."],
    ],
  },
  programmes: {
    eyebrow: "Programmes",
    title: "Compare des options adaptées à ton projet.",
    text: "Centralise les programmes qui t’intéressent et compare les critères importants avant de décider où candidater.",
    rows: [
      ["M.Sc. Computer Science", "Berlin · Master", "À comparer"],
      ["B.Sc. Data Science", "Munich · Bachelor", "Bon alignement"],
      ["M.Sc. Information Systems", "Hamburg · Master", "À vérifier"],
    ],
    note: "Aperçu d’exemple · les conditions doivent toujours être vérifiées sur la source officielle.",
  },
  documents: {
    eyebrow: "Documents",
    title: "Sais toujours ce qui est prêt et ce qui manque.",
    text: "Regroupe tes pièces, leur statut et les corrections éventuelles dans un suivi simple.",
    rows: [
      ["Passeport", "Prêt"],
      ["Diplôme / attestation", "Prêt"],
      ["Relevé de notes", "À ajouter"],
      ["Certificat de langue", "À vérifier"],
    ],
  },
  applications: {
    eyebrow: "Candidatures",
    title: "Suis chaque candidature sans perdre le fil.",
    text: "Conserve le statut, la prochaine action et les échéances au même endroit pour savoir quoi faire ensuite.",
    rows: [
      ["Université A", "Dossier en préparation", "12 oct."],
      ["Université B", "Prête à envoyer", "28 oct."],
      ["Université C", "Envoyée", "En suivi"],
    ],
  },
  sources: {
    eyebrow: "Sources et transparence",
    title: "Tu dois pouvoir vérifier une information importante.",
    text: "AlmaGo organise ta préparation. Les universités et autorités restent les seules sources de décision officielle.",
    points: [
      ["Source officielle", "Quand elle est disponible, l’information renvoie vers l’organisme ou l’établissement concerné."],
      ["Date de vérification", "Les informations sensibles au temps peuvent afficher quand elles ont été vérifiées."],
      ["Limites claires", "AlmaGo n’accorde ni admission ni visa et ne remplace pas les autorités compétentes."],
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Les questions essentielles avant de commencer.",
    intro: "Des réponses courtes pour savoir exactement ce que la plateforme fait — et ne fait pas.",
    items: [
      ["Est-ce que je peux commencer sans admission ?", "Oui. Tu peux commencer par ton projet, tes documents et la comparaison des programmes avant d’avoir une admission."],
      ["Est-ce qu’AlmaGo envoie mes candidatures ?", "Non. AlmaGo t’aide à préparer et suivre tes dossiers. L’envoi se fait par le canal demandé par l’université, par exemple directement ou via uni-assist."],
      ["Est-ce que les programmes sont garantis pour mon profil ?", "Non. AlmaGo t’aide à comparer et structurer tes options. L’éligibilité finale dépend toujours des critères officiels de chaque établissement."],
      ["Est-ce que mes documents restent organisés au même endroit ?", "Oui. Ton espace permet de suivre les pièces ajoutées, leur statut et les éléments qui demandent encore une action."],
      ["Est-ce qu’AlmaGo garantit une admission ou un visa ?", "Non. Les décisions appartiennent aux universités, ambassades et autorités compétentes."],
    ],
  },
  final: {
    eyebrow: "Prêt à commencer ?",
    title: "Transforme ton projet en prochaines étapes claires.",
    text: "Crée ton espace, structure ton projet et avance avec une vue claire sur les programmes, documents et candidatures.",
    primary: "Commencer mon projet",
    secondary: "J’ai déjà un compte",
  },
};

const en: HomepageRedesignCopy = {
  hero: {
    eyebrow: "For students preparing to study in Germany",
    title: "Your study project in Germany, organised from A to Z.",
    lead: "Find programmes that fit your profile, prepare your documents, and track your applications from one workspace.",
    primary: "Start my project",
    secondary: "See how it works",
    previewLabel: "AlmaGo dashboard preview · example",
    dashboard: {
      eyebrow: "Dashboard",
      hello: "Hello, Lina.",
      intro: "Here is what needs your attention now.",
      nextAction: "Next action",
      nextActionTitle: "Add your transcript",
      nextActionMeta: "Documents · To do",
      progress: "Preparation",
      progressValue: "4/6",
      progressMeta: "steps completed",
      cards: [
        ["Documents", "8", "6 ready"],
        ["Programmes", "12", "to compare"],
        ["Applications", "3", "2 active"],
        ["Steps", "6", "4 completed"],
      ],
    },
  },
  steps: {
    eyebrow: "How it works",
    title: "Three steps to keep your study project under control.",
    intro: "Move forward in the right order without needing to understand everything on day one.",
    items: [
      ["Describe your project", "Add your level, field, language and target intake to structure your starting point."],
      ["Compare and prepare", "Identify relevant programmes and prepare the required documents progressively."],
      ["Track applications", "See statuses, deadlines and the next action for each application."],
    ],
  },
  benefits: {
    eyebrow: "Why AlmaGo",
    title: "Less fragmentation. More visibility.",
    items: [
      ["One workspace", "Programmes, documents, applications and next steps stay together."],
      ["Clear priorities", "See what needs attention now instead of rebuilding your checklist every time."],
      ["Visible sources", "Important information can be linked to an official source and verification date."],
      ["Continuous tracking", "Your workspace evolves with your project from preparation to application follow-up."],
    ],
  },
  programmes: {
    eyebrow: "Programmes",
    title: "Compare options that fit your project.",
    text: "Keep the programmes you care about in one place and compare the criteria that matter before applying.",
    rows: [
      ["M.Sc. Computer Science", "Berlin · Master", "Compare"],
      ["B.Sc. Data Science", "Munich · Bachelor", "Strong fit"],
      ["M.Sc. Information Systems", "Hamburg · Master", "Check"],
    ],
    note: "Example preview · always verify requirements with the official source.",
  },
  documents: {
    eyebrow: "Documents",
    title: "Always know what is ready and what is missing.",
    text: "Keep your files, status and any corrections in one simple view.",
    rows: [
      ["Passport", "Ready"],
      ["Diploma / certificate", "Ready"],
      ["Transcript", "Add"],
      ["Language certificate", "Check"],
    ],
  },
  applications: {
    eyebrow: "Applications",
    title: "Track every application without losing the thread.",
    text: "Keep the status, next action and deadlines together so you always know what to do next.",
    rows: [
      ["University A", "Preparing", "Oct 12"],
      ["University B", "Ready to submit", "Oct 28"],
      ["University C", "Submitted", "Tracking"],
    ],
  },
  sources: {
    eyebrow: "Sources and transparency",
    title: "You should be able to verify important information.",
    text: "AlmaGo organises your preparation. Universities and authorities remain the official decision-makers.",
    points: [
      ["Official source", "When available, information links back to the relevant institution or authority."],
      ["Verification date", "Time-sensitive information can show when it was last checked."],
      ["Clear boundaries", "AlmaGo does not grant admission or visas and does not replace competent authorities."],
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "The essential questions before you start.",
    intro: "Short answers so you know exactly what the platform does — and does not do.",
    items: [
      ["Can I start without admission?", "Yes. You can begin with your project, documents and programme comparison before you have an admission offer."],
      ["Does AlmaGo submit applications for me?", "No. AlmaGo helps you prepare and track them. Submission happens through the route required by each university, for example directly or through uni-assist."],
      ["Are programmes guaranteed to fit my profile?", "No. AlmaGo helps you compare and structure options. Final eligibility always depends on each institution’s official criteria."],
      ["Can I keep my documents organised in one place?", "Yes. Your workspace tracks uploaded documents, their status and anything that still needs action."],
      ["Does AlmaGo guarantee admission or a visa?", "No. Universities, embassies and competent authorities make those decisions."],
    ],
  },
  final: {
    eyebrow: "Ready to begin?",
    title: "Turn your study project into clear next steps.",
    text: "Create your workspace, structure your project and move forward with a clear view of programmes, documents and applications.",
    primary: "Start my project",
    secondary: "I already have an account",
  },
};

const de: HomepageRedesignCopy = {
  hero: {
    eyebrow: "Für Studierende, die ihr Studium in Deutschland vorbereiten",
    title: "Dein Studienprojekt in Deutschland – von A bis Z organisiert.",
    lead: "Finde passende Studiengänge, bereite deine Unterlagen vor und verfolge deine Bewerbungen in einem einzigen Bereich.",
    primary: "Mein Projekt starten",
    secondary: "So funktioniert es",
    previewLabel: "AlmaGo-Dashboard · Beispiel",
    dashboard: {
      eyebrow: "Übersicht",
      hello: "Hallo, Lina.",
      intro: "Das braucht jetzt deine Aufmerksamkeit.",
      nextAction: "Nächste Aktion",
      nextActionTitle: "Notenübersicht hinzufügen",
      nextActionMeta: "Unterlagen · Offen",
      progress: "Vorbereitung",
      progressValue: "4/6",
      progressMeta: "Schritte erledigt",
      cards: [
        ["Unterlagen", "8", "6 bereit"],
        ["Studiengänge", "12", "zu vergleichen"],
        ["Bewerbungen", "3", "2 aktiv"],
        ["Schritte", "6", "4 erledigt"],
      ],
    },
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Drei Schritte, damit dein Studienprojekt übersichtlich bleibt.",
    intro: "Gehe in der richtigen Reihenfolge vor, ohne am ersten Tag alles wissen zu müssen.",
    items: [
      ["Projekt beschreiben", "Gib Abschluss, Fach, Sprache und gewünschten Studienstart an."],
      ["Vergleichen und vorbereiten", "Finde relevante Studiengänge und bereite die benötigten Unterlagen schrittweise vor."],
      ["Bewerbungen verfolgen", "Sieh Status, Fristen und die nächste Aktion für jede Bewerbung."],
    ],
  },
  benefits: {
    eyebrow: "Warum AlmaGo",
    title: "Weniger verstreut. Mehr Überblick.",
    items: [
      ["Ein Bereich", "Studiengänge, Unterlagen, Bewerbungen und nächste Schritte bleiben zusammen."],
      ["Klare Prioritäten", "Sieh sofort, was jetzt deine Aufmerksamkeit braucht."],
      ["Sichtbare Quellen", "Wichtige Informationen können mit offizieller Quelle und Prüfdatum verknüpft werden."],
      ["Laufende Übersicht", "Dein Bereich entwickelt sich mit deinem Projekt von der Vorbereitung bis zur Bewerbung."],
    ],
  },
  programmes: {
    eyebrow: "Studiengänge",
    title: "Vergleiche Optionen, die zu deinem Projekt passen.",
    text: "Sammle interessante Studiengänge an einem Ort und vergleiche wichtige Kriterien vor der Bewerbung.",
    rows: [
      ["M.Sc. Computer Science", "Berlin · Master", "Vergleichen"],
      ["B.Sc. Data Science", "München · Bachelor", "Gute Passung"],
      ["M.Sc. Information Systems", "Hamburg · Master", "Prüfen"],
    ],
    note: "Beispielansicht · Voraussetzungen immer bei der offiziellen Quelle prüfen.",
  },
  documents: {
    eyebrow: "Unterlagen",
    title: "Wisse jederzeit, was bereit ist und was noch fehlt.",
    text: "Behalte Dateien, Status und mögliche Korrekturen in einer einfachen Übersicht.",
    rows: [
      ["Reisepass", "Bereit"],
      ["Abschluss / Bescheinigung", "Bereit"],
      ["Notenübersicht", "Hinzufügen"],
      ["Sprachzertifikat", "Prüfen"],
    ],
  },
  applications: {
    eyebrow: "Bewerbungen",
    title: "Verfolge jede Bewerbung, ohne den Überblick zu verlieren.",
    text: "Behalte Status, nächste Aktion und Fristen zusammen, damit du weißt, was als Nächstes ansteht.",
    rows: [
      ["Universität A", "In Vorbereitung", "12. Okt."],
      ["Universität B", "Versandbereit", "28. Okt."],
      ["Universität C", "Eingereicht", "In Beobachtung"],
    ],
  },
  sources: {
    eyebrow: "Quellen und Transparenz",
    title: "Wichtige Informationen sollten überprüfbar sein.",
    text: "AlmaGo organisiert deine Vorbereitung. Hochschulen und Behörden bleiben die offiziellen Entscheidungsträger.",
    points: [
      ["Offizielle Quelle", "Wenn verfügbar, führt die Information zur zuständigen Institution oder Behörde."],
      ["Prüfdatum", "Zeitkritische Angaben können zeigen, wann sie zuletzt geprüft wurden."],
      ["Klare Grenzen", "AlmaGo erteilt weder Zulassungen noch Visa und ersetzt keine zuständige Behörde."],
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Die wichtigsten Fragen vor dem Start.",
    intro: "Kurze Antworten darauf, was die Plattform tut – und was nicht.",
    items: [
      ["Kann ich ohne Zulassung starten?", "Ja. Du kannst mit deinem Projekt, deinen Unterlagen und dem Studiengangvergleich beginnen, bevor du eine Zulassung hast."],
      ["Schickt AlmaGo meine Bewerbungen ab?", "Nein. AlmaGo hilft dir bei Vorbereitung und Nachverfolgung. Die Bewerbung wird über den von der Hochschule verlangten Kanal eingereicht."],
      ["Sind Studiengänge für mein Profil garantiert geeignet?", "Nein. AlmaGo hilft beim Vergleichen. Die endgültige Eignung richtet sich nach den offiziellen Kriterien der jeweiligen Hochschule."],
      ["Kann ich meine Unterlagen an einem Ort organisieren?", "Ja. Dein Bereich zeigt hinzugefügte Unterlagen, ihren Status und was noch erledigt werden muss."],
      ["Garantiert AlmaGo Zulassung oder Visum?", "Nein. Hochschulen, Botschaften und zuständige Behörden treffen diese Entscheidungen."],
    ],
  },
  final: {
    eyebrow: "Bereit für den Start?",
    title: "Mach aus deinem Studienprojekt klare nächste Schritte.",
    text: "Erstelle deinen Bereich, strukturiere dein Projekt und behalte Studiengänge, Unterlagen und Bewerbungen im Blick.",
    primary: "Mein Projekt starten",
    secondary: "Ich habe schon ein Konto",
  },
};

const ar: HomepageRedesignCopy = {
  hero: {
    eyebrow: "للطلاب الذين يخططون للدراسة في ألمانيا",
    title: "مشروع دراستك في ألمانيا، منظّم من الألف إلى الياء.",
    lead: "اعثر على البرامج المناسبة لملفك، جهّز وثائقك وتابع طلبات التقديم من مساحة واحدة.",
    primary: "ابدأ مشروعي",
    secondary: "اكتشف كيف تعمل المنصة",
    previewLabel: "معاينة لوحة AlmaGo · مثال",
    dashboard: {
      eyebrow: "لوحة المتابعة",
      hello: "مرحبًا، لينا.",
      intro: "هذا ما يحتاج إلى انتباهك الآن.",
      nextAction: "الخطوة التالية",
      nextActionTitle: "أضف كشف الدرجات",
      nextActionMeta: "الوثائق · مطلوب",
      progress: "التحضير",
      progressValue: "4/6",
      progressMeta: "خطوات مكتملة",
      cards: [
        ["الوثائق", "8", "6 جاهزة"],
        ["البرامج", "12", "للمقارنة"],
        ["الطلبات", "3", "2 قيد المتابعة"],
        ["الخطوات", "6", "4 مكتملة"],
      ],
    },
  },
  steps: {
    eyebrow: "كيف تعمل المنصة",
    title: "ثلاث خطوات لتبقى صورة مشروعك واضحة.",
    intro: "تتقدم بالترتيب المناسب دون الحاجة إلى فهم كل شيء منذ اليوم الأول.",
    items: [
      ["حدّد مشروعك", "أدخل مستواك، تخصصك، اللغة وموعد الدراسة المستهدف لتحديد نقطة البداية."],
      ["قارن وجهّز", "حدّد البرامج المناسبة وجهّز الوثائق المطلوبة تدريجيًا."],
      ["تابع طلباتك", "اطّلع على الحالة والمواعيد والخطوة التالية لكل طلب."],
    ],
  },
  benefits: {
    eyebrow: "لماذا AlmaGo",
    title: "تشتّت أقل. رؤية أوضح.",
    items: [
      ["مساحة واحدة", "البرامج والوثائق والطلبات والخطوات التالية في مكان واحد."],
      ["أولويات واضحة", "اعرف ما يحتاج إلى انتباهك الآن بدل إعادة بناء قائمتك كل مرة."],
      ["مصادر ظاهرة", "يمكن ربط المعلومات المهمة بمصدرها الرسمي وتاريخ التحقق منها."],
      ["متابعة مستمرة", "تتطور مساحتك مع مشروعك من التحضير إلى متابعة طلبات التقديم."],
    ],
  },
  programmes: {
    eyebrow: "البرامج",
    title: "قارن الخيارات التي تناسب مشروعك.",
    text: "اجمع البرامج التي تهمك وقارن المعايير المهمة قبل اختيار أماكن التقديم.",
    rows: [
      ["M.Sc. Computer Science", "برلين · ماجستير", "للمقارنة"],
      ["B.Sc. Data Science", "ميونخ · بكالوريوس", "ملاءمة جيدة"],
      ["M.Sc. Information Systems", "هامبورغ · ماجستير", "يحتاج تحققًا"],
    ],
    note: "معاينة توضيحية · يجب دائمًا التحقق من الشروط عبر المصدر الرسمي.",
  },
  documents: {
    eyebrow: "الوثائق",
    title: "اعرف دائمًا ما هو جاهز وما الذي ينقصك.",
    text: "اجمع وثائقك وحالتها وأي تصحيحات مطلوبة في متابعة واحدة بسيطة.",
    rows: [
      ["جواز السفر", "جاهز"],
      ["الشهادة / الإفادة", "جاهزة"],
      ["كشف الدرجات", "يجب إضافته"],
      ["شهادة اللغة", "تحتاج تحققًا"],
    ],
  },
  applications: {
    eyebrow: "طلبات التقديم",
    title: "تابع كل طلب دون أن تفقد التفاصيل.",
    text: "احتفظ بالحالة والخطوة التالية والمواعيد في مكان واحد لتعرف دائمًا ماذا تفعل.",
    rows: [
      ["الجامعة A", "قيد التحضير", "12 أكتوبر"],
      ["الجامعة B", "جاهز للإرسال", "28 أكتوبر"],
      ["الجامعة C", "تم الإرسال", "قيد المتابعة"],
    ],
  },
  sources: {
    eyebrow: "المصادر والشفافية",
    title: "يجب أن تتمكن من التحقق من أي معلومة مهمة.",
    text: "AlmaGo تنظّم تحضيرك، بينما تبقى الجامعات والسلطات الجهات صاحبة القرار الرسمي.",
    points: [
      ["المصدر الرسمي", "عندما يكون متاحًا، ترتبط المعلومة بالجامعة أو الجهة الرسمية المعنية."],
      ["تاريخ التحقق", "يمكن للمعلومات الحساسة للوقت أن توضح متى تم التحقق منها آخر مرة."],
      ["حدود واضحة", "AlmaGo لا تمنح قبولًا أو تأشيرة ولا تحل محل الجهات المختصة."],
    ],
  },
  faq: {
    eyebrow: "الأسئلة الشائعة",
    title: "الأسئلة الأساسية قبل أن تبدأ.",
    intro: "إجابات قصيرة لتعرف بدقة ما الذي تفعله المنصة وما الذي لا تفعله.",
    items: [
      ["هل يمكنني البدء دون قبول جامعي؟", "نعم. يمكنك البدء بمشروعك ووثائقك ومقارنة البرامج قبل حصولك على قبول."],
      ["هل ترسل AlmaGo طلبات التقديم نيابة عني؟", "لا. تساعدك AlmaGo على التحضير والمتابعة، بينما يتم الإرسال عبر المسار الذي تحدده الجامعة."],
      ["هل البرامج مضمونة لتناسب ملفي؟", "لا. تساعدك AlmaGo على المقارنة وتنظيم الخيارات، لكن الأهلية النهائية تعتمد على الشروط الرسمية لكل جامعة."],
      ["هل أستطيع تنظيم وثائقي في مكان واحد؟", "نعم. تعرض مساحتك الوثائق المضافة وحالتها وما يحتاج إلى إجراء إضافي."],
      ["هل تضمن AlmaGo القبول أو التأشيرة؟", "لا. القرارات تعود إلى الجامعات والسفارات والسلطات المختصة."],
    ],
  },
  final: {
    eyebrow: "جاهز للبدء؟",
    title: "حوّل مشروعك الدراسي إلى خطوات تالية واضحة.",
    text: "أنشئ مساحتك، نظّم مشروعك وتابع البرامج والوثائق وطلبات التقديم بوضوح.",
    primary: "ابدأ مشروعي",
    secondary: "لدي حساب بالفعل",
  },
};

export const homepageRedesignCopy: Record<Locale, HomepageRedesignCopy> = { fr, ar, en, de };
