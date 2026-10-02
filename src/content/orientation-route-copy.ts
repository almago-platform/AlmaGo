import type { Locale } from "@/lib/i18n";

export type OrientationRouteCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  routeLabel: string;
  responsibility: string;
  owners: {
    student: string;
    campus: string;
    official: string;
  };
  steps: {
    language: {
      title: string;
      active: (language: string, current: string, target: string) => string;
      advanced: (language: string, current: string) => string;
      undecided: string;
      campus: string;
      student: string;
    };
    academic: {
      title: string;
      body: string;
      campus: string;
      student: string;
    };
    programs: {
      title: string;
      withCities: (degree: string, field: string, cities: string) => string;
      withoutCities: (degree: string, field: string) => string;
      campus: string;
      student: string;
    };
    application: {
      title: string;
      body: string;
      campus: string;
      student: string;
    };
    afterAdmission: {
      title: string;
      body: string;
      campus: string;
      official: string;
    };
  };
  alternatives: {
    eyebrow: string;
    title: string;
    tunisia: {
      title: string;
      body: string;
    };
    germany: {
      title: string;
      body: string;
    };
    city: {
      title: string;
      withCities: (cities: string) => string;
      withoutCities: string;
    };
  };
  next: {
    eyebrow: string;
    title: string;
    active: (language: string, current: string, target: string, cities: string) => string;
    advanced: (language: string, current: string, cities: string) => string;
    undecided: (cities: string) => string;
  };
  note: string;
};

const fr: OrientationRouteCopy = {
  eyebrow: "Votre route personnalisée",
  title: "Voici le chemin que Campus Allemagne structure avec vous",
  intro: "Vous n’avez pas à transformer seul votre profil en démarches. Nous organisons la route, vérifions les points sensibles et distinguons ce qui dépend de vous, de Campus Allemagne et des organismes officiels.",
  routeLabel: "Route principale",
  responsibility: "Responsabilité",
  owners: {
    student: "Vous",
    campus: "Campus Allemagne",
    official: "Organisme officiel",
  },
  steps: {
    language: {
      title: "Renforcer la langue utile à votre projet",
      active: (language, current, target) =>
        `Vous êtes actuellement ${current} en ${language}. Votre prochain objectif de progression est ${target}. Le niveau final exigé sera confirmé programme par programme.`,
      advanced: (language, current) =>
        `Vous avez déjà un niveau ${current} en ${language}. Campus Allemagne doit maintenant vérifier le certificat et le niveau exact acceptés par les programmes retenus.`,
      undecided: "La langue d’études n’est pas encore fixée. Campus Allemagne doit d’abord comparer les routes en allemand et en anglais avant de définir l’objectif linguistique.",
      campus: "Nous vérifions le niveau et le certificat réellement demandés par les programmes retenus et pouvons comparer une préparation en Tunisie ou en Allemagne.",
      student: "Vous continuez votre progression linguistique et choisissez, avec nous, où vous souhaitez la poursuivre.",
    },
    academic: {
      title: "Confirmer votre accès académique",
      body: "Campus Allemagne vérifie quelle route s’applique à votre diplôme et à votre objectif : accès direct si confirmé, voie préparatoire si elle est nécessaire, ou autre parcours pertinent.",
      campus: "Nous vérifions votre diplôme, votre parcours et les règles officielles applicables avant de conclure sur la route.",
      student: "Vous fournissez uniquement les informations ou justificatifs manquants lorsqu’ils sont nécessaires.",
    },
    programs: {
      title: "Ouvrir des pistes de programmes et de villes",
      withCities: (degree, field, cities) =>
        `Campus Allemagne doit comparer de vrais programmes de ${degree} en ${field} à ${cities}, puis proposer des alternatives si une autre ville offre une route plus adaptée.`,
      withoutCities: (degree, field) =>
        `Campus Allemagne doit comparer de vrais programmes de ${degree} en ${field} en Allemagne et identifier les villes les plus cohérentes avec votre projet.`,
      campus: "Pour chaque piste, nous devons vérifier la langue, les conditions académiques, le canal de candidature, les échéances et la source officielle.",
      student: "Vous choisissez ensuite parmi des pistes déjà structurées au lieu de recommencer la recherche seul.",
    },
    application: {
      title: "Construire le dossier et la candidature",
      body: "Une fois les pistes retenues, Campus Allemagne organise les pièces, les étapes et le bon canal de candidature : université, uni-assist ou autre procédure officielle selon le programme.",
      campus: "Nous structurons la checklist du dossier et contrôlons les exigences publiées pour chaque candidature.",
      student: "Vous fournissez les pièces personnelles requises et effectuez les actions qui doivent légalement être faites en votre nom.",
    },
    afterAdmission: {
      title: "Préparer la suite après une admission",
      body: "Si une admission est obtenue, la route continue avec les étapes de financement, assurance, visa, logement et arrivée en Allemagne selon votre situation.",
      campus: "Nous organisons les prochaines démarches et les informations à préparer.",
      official: "L’université, l’ambassade et les autres autorités restent seules décisionnaires pour leurs procédures.",
    },
  },
  alternatives: {
    eyebrow: "Vos alternatives",
    title: "Plus d’une route peut être possible",
    tunisia: {
      title: "Langue d’abord en Tunisie",
      body: "Continuer la langue en Tunisie avant la candidature peut réduire les démarches de préparation en Allemagne. Campus Allemagne doit ensuite confirmer le niveau requis pour les programmes visés.",
    },
    germany: {
      title: "Poursuivre la langue en Allemagne",
      body: "Une préparation linguistique en Allemagne peut être étudiée comme alternative. Nous devons vérifier les options réelles dans la ville souhaitée ou ailleurs ; aucune école n’est présentée comme partenaire sans partenariat validé.",
    },
    city: {
      title: "Rester flexible sur la ville",
      withCities: (cities) =>
        `Votre préférence actuelle est ${cities}. Nous pouvons la garder comme priorité tout en comparant d’autres villes si elles offrent une meilleure route académique ou linguistique.`,
      withoutCities: "Aucune ville n’est imposée pour l’instant. Campus Allemagne peut donc chercher la route la plus cohérente avant de vous proposer des villes.",
    },
  },
  next: {
    eyebrow: "Votre prochaine action",
    title: "Une seule priorité maintenant",
    active: (language, current, target, cities) =>
      `Continuez votre ${language} de ${current} vers ${target}. En parallèle, Campus Allemagne doit vérifier votre accès académique et préparer une première sélection de programmes réels${cities ? ` autour de ${cities}` : ""}.`,
    advanced: (language, current, cities) =>
      `Conservez votre niveau ${current} en ${language}. La prochaine priorité de Campus Allemagne est de vérifier le certificat accepté et de préparer une première sélection de programmes réels${cities ? ` autour de ${cities}` : ""}.`,
    undecided: (cities) =>
      `Choisissez avec Campus Allemagne si votre route doit viser l’allemand, l’anglais ou les deux. Nous pouvons ensuite préparer les programmes réels${cities ? ` autour de ${cities}` : ""}.`,
  },
  note: "Cette route est une orientation de préparation. Elle ne constitue ni une admission universitaire ni une décision de visa.",
};

const ar: OrientationRouteCopy = {
  eyebrow: "مسارك الشخصي",
  title: "هذا هو المسار الذي ينظمه Campus Allemagne معك",
  intro: "لست مطالبًا بتحويل ملفك وحدك إلى سلسلة من الإجراءات. ننظم المسار، نتحقق من النقاط الحساسة، ونوضح ما يقع عليك وما نتولاه نحن وما تقرره الجهات الرسمية.",
  routeLabel: "المسار الرئيسي",
  responsibility: "المسؤولية",
  owners: {
    student: "أنت",
    campus: "Campus Allemagne",
    official: "جهة رسمية",
  },
  steps: {
    language: {
      title: "تطوير اللغة المناسبة لمشروعك",
      active: (language, current, target) =>
        `مستواك الحالي في ${language} هو ${current}. هدف التقدم التالي هو ${target}. أما المستوى النهائي المطلوب فسيتم تأكيده لكل برنامج على حدة.`,
      advanced: (language, current) =>
        `لديك مستوى متقدم ${current} في ${language}. الخطوة التالية هي أن يتحقق Campus Allemagne من الشهادة والمستوى المقبولين في البرامج المختارة.`,
      undecided: "لغة الدراسة لم تُحسم بعد. يجب أولًا مقارنة المسارات بالألمانية والإنجليزية قبل تحديد الهدف اللغوي.",
      campus: "نتحقق من المستوى والشهادة المطلوبين فعليًا ونقارن، عند الحاجة، بين التحضير في تونس أو ألمانيا.",
      student: "تواصل تطوير اللغة وتختار معنا المكان والطريقة الأنسب لمواصلة التعلم.",
    },
    academic: {
      title: "تأكيد مسار الدخول الأكاديمي",
      body: "يتحقق Campus Allemagne من المسار الذي ينطبق على شهادتك وهدفك: دخول مباشر إذا تأكد، مسار تحضيري إذا كان لازمًا، أو طريق آخر مناسب.",
      campus: "نراجع الشهادة والمسار والقواعد الرسمية قبل استخلاص أي نتيجة.",
      student: "تقدم فقط المعلومات أو الوثائق الناقصة عندما تكون ضرورية.",
    },
    programs: {
      title: "فتح مسارات برامج ومدن حقيقية",
      withCities: (degree, field, cities) =>
        `على Campus Allemagne مقارنة برامج ${degree} حقيقية في مجال ${field} في ${cities}، ثم اقتراح بدائل إذا كانت مدينة أخرى توفر مسارًا أنسب.`,
      withoutCities: (degree, field) =>
        `على Campus Allemagne مقارنة برامج ${degree} حقيقية في مجال ${field} داخل ألمانيا وتحديد المدن الأكثر انسجامًا مع مشروعك.`,
      campus: "نراجع لكل خيار لغة الدراسة والشروط الأكاديمية وطريقة التقديم والمواعيد والمصدر الرسمي.",
      student: "تختار من بين مسارات منظمة بدل البدء من الصفر في البحث.",
    },
    application: {
      title: "تنظيم الملف والتقديم",
      body: "بعد اختيار المسارات، ينظم Campus Allemagne الوثائق والخطوات وطريقة التقديم الصحيحة: مباشرة للجامعة أو عبر uni-assist أو عبر مسار رسمي آخر.",
      campus: "ننظم قائمة الوثائق ونراجع المتطلبات المنشورة لكل طلب.",
      student: "تقدم وثائقك الشخصية وتقوم بالإجراءات التي يجب قانونيًا أن تتم باسمك.",
    },
    afterAdmission: {
      title: "التحضير لما بعد القبول",
      body: "إذا حصلت على قبول، يستمر المسار مع التمويل والتأمين والتأشيرة والسكن والوصول إلى ألمانيا حسب وضعك.",
      campus: "ننظم المراحل التالية والمعلومات التي يجب تجهيزها.",
      official: "الجامعة والسفارة والجهات الرسمية وحدها تتخذ قراراتها النهائية.",
    },
  },
  alternatives: {
    eyebrow: "بدائل ممكنة",
    title: "قد يكون أمامك أكثر من مسار",
    tunisia: {
      title: "تطوير اللغة أولًا في تونس",
      body: "يمكن مواصلة اللغة في تونس قبل التقديم. بعد ذلك يحدد Campus Allemagne المستوى المطلوب فعليًا للبرامج المستهدفة.",
    },
    germany: {
      title: "مواصلة اللغة في ألمانيا",
      body: "يمكن دراسة خيار التحضير اللغوي في ألمانيا. نتحقق من الخيارات الحقيقية في مدينتك أو في مدن أخرى، ولا نصف أي مدرسة بأنها شريك إلا إذا كان هناك تعاون مؤكد.",
    },
    city: {
      title: "المرونة في اختيار المدينة",
      withCities: (cities) =>
        `تفضيلك الحالي هو ${cities}. يمكن أن يبقى أولوية مع مقارنة مدن أخرى إذا كانت تقدم مسارًا أكاديميًا أو لغويًا أنسب.`,
      withoutCities: "لم تحدد مدينة بعد، لذلك يمكن لـ Campus Allemagne البحث عن المسار الأنسب أولًا ثم اقتراح المدن.",
    },
  },
  next: {
    eyebrow: "خطوتك الآن",
    title: "أولوية واحدة الآن",
    active: (language, current, target, cities) =>
      `واصل ${language} من ${current} إلى ${target}. وفي الوقت نفسه، على Campus Allemagne التحقق من مسار دخولك الأكاديمي وإعداد أول قائمة لبرامج حقيقية${cities ? ` في ${cities} وما حولها` : ""}.`,
    advanced: (language, current, cities) =>
      `حافظ على مستوى ${current} في ${language}. أولوية Campus Allemagne الآن هي التحقق من الشهادة المقبولة وإعداد أول قائمة لبرامج حقيقية${cities ? ` في ${cities} وما حولها` : ""}.`,
    undecided: (cities) =>
      `حدد مع Campus Allemagne هل المسار سيكون بالألمانية أو الإنجليزية أو كليهما، ثم نعد البرامج الحقيقية${cities ? ` في ${cities} وما حولها` : ""}.`,
  },
  note: "هذا المسار توجيه للتحضير ولا يمثل قبولًا جامعيًا أو قرارًا للتأشيرة.",
};

const en: OrientationRouteCopy = {
  eyebrow: "Your personalised route",
  title: "Here is the route Campus Allemagne structures with you",
  intro: "You should not have to turn your profile into a complex checklist on your own. We organise the route, verify sensitive points and separate what you do, what Campus Allemagne does and what official bodies decide.",
  routeLabel: "Main route",
  responsibility: "Responsibility",
  owners: {
    student: "You",
    campus: "Campus Allemagne",
    official: "Official body",
  },
  steps: {
    language: {
      title: "Strengthen the language needed for your project",
      active: (language, current, target) =>
        `Your current ${language} level is ${current}. Your next progression target is ${target}. The final required level will be confirmed programme by programme.`,
      advanced: (language, current) =>
        `You already have an advanced ${current} level in ${language}. Campus Allemagne now needs to verify the exact certificate and level accepted by the selected programmes.`,
      undecided: "Your study language is not fixed yet. Campus Allemagne should first compare German- and English-taught routes before setting a language target.",
      campus: "We verify the exact level and certificate required and can compare preparation in Tunisia or Germany.",
      student: "You continue improving your language and decide with us where you want to continue it.",
    },
    academic: {
      title: "Confirm your academic access route",
      body: "Campus Allemagne checks which route applies to your diploma and objective: direct access if confirmed, a preparatory route if required, or another relevant path.",
      campus: "We verify your diploma, academic background and official rules before drawing a conclusion.",
      student: "You provide only the missing information or evidence when it is actually needed.",
    },
    programs: {
      title: "Open concrete programme and city options",
      withCities: (degree, field, cities) =>
        `Campus Allemagne should compare real ${degree} programmes in ${field} in ${cities}, then propose alternatives if another city offers a more suitable route.`,
      withoutCities: (degree, field) =>
        `Campus Allemagne should compare real ${degree} programmes in ${field} across Germany and identify the cities that best fit your project.`,
      campus: "For each option, we should verify teaching language, academic requirements, application channel, deadlines and the official source.",
      student: "You choose from structured options instead of restarting the research alone.",
    },
    application: {
      title: "Build the application file and submission route",
      body: "Once the options are selected, Campus Allemagne organises the documents, steps and correct application channel: university, uni-assist or another official route.",
      campus: "We structure the application checklist and check the published requirements for each application.",
      student: "You provide your personal documents and complete actions that legally have to be done in your own name.",
    },
    afterAdmission: {
      title: "Prepare the steps after admission",
      body: "If you receive an admission, the route continues with funding, insurance, visa, housing and arrival in Germany according to your situation.",
      campus: "We organise the next steps and the information to prepare.",
      official: "The university, embassy and other authorities remain the sole decision-makers for their procedures.",
    },
  },
  alternatives: {
    eyebrow: "Your alternatives",
    title: "More than one route may be possible",
    tunisia: {
      title: "Continue language preparation in Tunisia first",
      body: "Continuing the language in Tunisia before applying can be one route. Campus Allemagne then confirms the exact language requirement for the programmes you target.",
    },
    germany: {
      title: "Continue language preparation in Germany",
      body: "Language preparation in Germany can be explored as an alternative. We must verify real options in your preferred city or elsewhere; no school is described as a partner without a validated partnership.",
    },
    city: {
      title: "Stay flexible about the city",
      withCities: (cities) =>
        `Your current preference is ${cities}. We can keep it as a priority while comparing other cities if they offer a better academic or language route.`,
      withoutCities: "You have not fixed a city yet, so Campus Allemagne can first identify the most coherent route and then propose cities.",
    },
  },
  next: {
    eyebrow: "Your next action",
    title: "One priority now",
    active: (language, current, target, cities) =>
      `Continue your ${language} from ${current} toward ${target}. In parallel, Campus Allemagne should verify your academic access route and prepare a first shortlist of real programmes${cities ? ` around ${cities}` : ""}.`,
    advanced: (language, current, cities) =>
      `Maintain your ${current} level in ${language}. Campus Allemagne's next priority is to verify the accepted certificate and prepare a first shortlist of real programmes${cities ? ` around ${cities}` : ""}.`,
    undecided: (cities) =>
      `Decide with Campus Allemagne whether your route should focus on German, English or both. We can then prepare real programme options${cities ? ` around ${cities}` : ""}.`,
  },
  note: "This route is preparation guidance. It is neither a university admission decision nor a visa decision.",
};

const de: OrientationRouteCopy = {
  eyebrow: "Deine persönliche Route",
  title: "Diesen Weg strukturiert Campus Allemagne mit dir",
  intro: "Du sollst dein Profil nicht allein in eine komplizierte Aufgabenliste übersetzen müssen. Wir strukturieren den Weg, prüfen sensible Punkte und trennen klar zwischen deinen Aufgaben, unserer Arbeit und Entscheidungen offizieller Stellen.",
  routeLabel: "Hauptroute",
  responsibility: "Verantwortung",
  owners: {
    student: "Du",
    campus: "Campus Allemagne",
    official: "Offizielle Stelle",
  },
  steps: {
    language: {
      title: "Die passende Sprache für dein Projekt weiterentwickeln",
      active: (language, current, target) =>
        `Dein aktuelles Niveau in ${language} ist ${current}. Dein nächstes Lernziel ist ${target}. Das endgültig verlangte Niveau wird für jedes Programm einzeln bestätigt.`,
      advanced: (language, current) =>
        `Du hast bereits ein fortgeschrittenes Niveau ${current} in ${language}. Campus Allemagne muss jetzt prüfen, welches Zertifikat und welches Niveau die ausgewählten Programme akzeptieren.`,
      undecided: "Die Unterrichtssprache ist noch nicht festgelegt. Campus Allemagne sollte zuerst deutsch- und englischsprachige Wege vergleichen, bevor ein Sprachziel festgelegt wird.",
      campus: "Wir prüfen das tatsächlich verlangte Niveau und Zertifikat und können eine Vorbereitung in Tunesien oder Deutschland vergleichen.",
      student: "Du entwickelst deine Sprache weiter und entscheidest mit uns, wo du sie fortsetzen möchtest.",
    },
    academic: {
      title: "Den akademischen Zugangsweg bestätigen",
      body: "Campus Allemagne prüft, welcher Weg zu deinem Abschluss und Studienziel passt: direkter Zugang, falls bestätigt, ein Vorbereitungsweg falls nötig oder eine andere passende Route.",
      campus: "Wir prüfen Abschluss, Bildungsweg und offizielle Regeln, bevor wir eine Schlussfolgerung ziehen.",
      student: "Du stellst nur fehlende Informationen oder Nachweise bereit, wenn sie tatsächlich benötigt werden.",
    },
    programs: {
      title: "Konkrete Programme und Städte öffnen",
      withCities: (degree, field, cities) =>
        `Campus Allemagne sollte reale ${degree}-Programme im Bereich ${field} in ${cities} vergleichen und Alternativen vorschlagen, falls eine andere Stadt besser passt.`,
      withoutCities: (degree, field) =>
        `Campus Allemagne sollte reale ${degree}-Programme im Bereich ${field} in Deutschland vergleichen und passende Städte identifizieren.`,
      campus: "Für jede Option prüfen wir Unterrichtssprache, akademische Bedingungen, Bewerbungsweg, Fristen und die offizielle Quelle.",
      student: "Du wählst aus strukturierten Optionen, statt die Suche allein neu zu beginnen.",
    },
    application: {
      title: "Dossier und Bewerbung strukturieren",
      body: "Nach der Auswahl organisiert Campus Allemagne Unterlagen, Schritte und den richtigen Bewerbungsweg: Hochschule, uni-assist oder ein anderes offizielles Verfahren.",
      campus: "Wir strukturieren die Unterlagenliste und prüfen die veröffentlichten Anforderungen jeder Bewerbung.",
      student: "Du stellst persönliche Unterlagen bereit und erledigst Schritte, die rechtlich in deinem Namen erfolgen müssen.",
    },
    afterAdmission: {
      title: "Die Schritte nach einer Zulassung vorbereiten",
      body: "Wenn du eine Zulassung erhältst, geht die Route mit Finanzierung, Versicherung, Visum, Wohnen und Ankunft in Deutschland weiter.",
      campus: "Wir strukturieren die nächsten Schritte und die vorzubereitenden Informationen.",
      official: "Hochschule, Botschaft und andere Behörden treffen ihre Entscheidungen selbst.",
    },
  },
  alternatives: {
    eyebrow: "Deine Alternativen",
    title: "Mehr als ein Weg kann möglich sein",
    tunisia: {
      title: "Sprache zuerst in Tunesien weiterlernen",
      body: "Die Sprache zunächst in Tunesien weiterzulernen kann ein sinnvoller Weg sein. Campus Allemagne bestätigt danach die konkreten Anforderungen der Zielprogramme.",
    },
    germany: {
      title: "Sprachvorbereitung in Deutschland",
      body: "Eine Sprachvorbereitung in Deutschland kann als Alternative geprüft werden. Wir müssen reale Optionen in deiner Wunschstadt oder anderswo prüfen; eine Schule wird nur bei bestätigter Kooperation als Partner bezeichnet.",
    },
    city: {
      title: "Bei der Stadt flexibel bleiben",
      withCities: (cities) =>
        `Deine aktuelle Präferenz ist ${cities}. Sie kann Priorität bleiben, während wir andere Städte vergleichen, falls sie einen besseren akademischen oder sprachlichen Weg bieten.`,
      withoutCities: "Du hast noch keine Stadt festgelegt. Campus Allemagne kann daher zuerst die passende Route bestimmen und anschließend Städte vorschlagen.",
    },
  },
  next: {
    eyebrow: "Deine nächste Aktion",
    title: "Jetzt nur eine Priorität",
    active: (language, current, target, cities) =>
      `Entwickle dein ${language} von ${current} in Richtung ${target}. Parallel prüft Campus Allemagne deinen akademischen Zugangsweg und bereitet eine erste Auswahl realer Programme${cities ? ` rund um ${cities}` : ""} vor.`,
    advanced: (language, current, cities) =>
      `Halte dein Niveau ${current} in ${language}. Die nächste Aufgabe von Campus Allemagne ist die Prüfung des akzeptierten Zertifikats und eine erste Auswahl realer Programme${cities ? ` rund um ${cities}` : ""}.`,
    undecided: (cities) =>
      `Entscheide mit Campus Allemagne, ob dein Weg auf Deutsch, Englisch oder beides ausgerichtet sein soll. Danach können reale Programme${cities ? ` rund um ${cities}` : ""} vorbereitet werden.`,
  },
  note: "Diese Route ist eine Vorbereitungshilfe. Sie ist weder eine Hochschulzulassung noch eine Visumentscheidung.",
};

export const orientationRouteCopy: Record<Locale, OrientationRouteCopy> = {
  fr,
  ar,
  en,
  de,
};
