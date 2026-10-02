import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import {
  getAcademicAccessConclusion,
  getVerifiedProgrammeSet,
} from "@/lib/orientation/verified-academic-options";
import {
  localizePreferredCity,
  localizeProfileOptions,
} from "@/content/student-profile-copy";
import {
  degreeOptions,
  diplomaOptions,
  studyFieldOptions,
} from "@/lib/student/profile-options";

const levelRank: Record<string, number> = {
  none: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

const nextLevel: Record<string, string | null> = {
  none: "A1",
  A1: "A2",
  A2: "B1",
  B1: "B2",
  B2: "C1",
  C1: null,
  C2: null,
};

export type UniversalGuidance = {
  priorityKey: "german" | "english" | "language_choice" | "applications";
  priorityTitle: string;
  priorityBody: string;
  languageChoices: string[];
  academicTitle: string;
  academicBody: string;
  cityTitle: string;
  cityBody: string;
  parallelTitle: string;
  parallelBody: string;
  timeline: {
    now: string;
    next: string;
    then: string;
    afterAdmission: string;
  };
  ctaTitle: string;
  ctaBody: string;
  officialSourceDate: string;
};

function localizedValue(
  value: string,
  locale: Locale,
  options: readonly { value: string; label: string }[],
) {
  return localizeProfileOptions(locale, options).find((option) => option.value === value)?.label
    || value
    || "—";
}

function languagePriority(answers: PublicOrientationAnswers) {
  const germanRank = levelRank[answers.germanLevel] ?? 0;
  const englishRank = levelRank[answers.englishLevel] ?? 0;

  if (!answers.studyLanguage || answers.studyLanguage === "À définir") {
    return { key: "language_choice" as const, level: "", next: null };
  }

  if (answers.studyLanguage === "Anglais") {
    return englishRank < levelRank.B2
      ? { key: "english" as const, level: answers.englishLevel || "none", next: nextLevel[answers.englishLevel || "none"] }
      : { key: "applications" as const, level: answers.englishLevel, next: nextLevel[answers.englishLevel] };
  }

  if (answers.studyLanguage === "Allemand et anglais") {
    if (germanRank < levelRank.B2) {
      return { key: "german" as const, level: answers.germanLevel || "none", next: nextLevel[answers.germanLevel || "none"] };
    }
    if (englishRank < levelRank.B2) {
      return { key: "english" as const, level: answers.englishLevel || "none", next: nextLevel[answers.englishLevel || "none"] };
    }
    return { key: "applications" as const, level: answers.germanLevel, next: nextLevel[answers.germanLevel] };
  }

  return germanRank < levelRank.B2
    ? { key: "german" as const, level: answers.germanLevel || "none", next: nextLevel[answers.germanLevel || "none"] }
    : { key: "applications" as const, level: answers.germanLevel, next: nextLevel[answers.germanLevel] };
}

function joinCities(answers: PublicOrientationAnswers, locale: Locale) {
  return answers.preferredCities
    .map((city) => localizePreferredCity(locale, city))
    .join(", ");
}

export function buildUniversalOrientationGuidance(
  answers: PublicOrientationAnswers,
  locale: Locale,
): UniversalGuidance {
  const access = getAcademicAccessConclusion(answers);
  const programmeSet = getVerifiedProgrammeSet(answers);
  const priority = languagePriority(answers);
  const degree = localizedValue(answers.targetDegree, locale, degreeOptions);
  const field = localizedValue(answers.targetField, locale, studyFieldOptions);
  const lastDiploma = localizedValue(answers.lastDiploma, locale, diplomaOptions);
  const cities = joinCities(answers, locale);
  const bac = answers.bacTrack || {
    fr: "votre diplôme",
    ar: "شهادتك",
    en: "your qualification",
    de: "dein Abschluss",
  }[locale];
  const currentLevel = priority.level === "none"
    ? { fr: "aucun niveau", ar: "من دون مستوى", en: "no current level", de: "noch kein Niveau" }[locale]
    : priority.level;

  const language = (() => {
    if (priority.key === "german") {
      const target = priority.next || "B2/C1";
      return {
        title: {
          fr: "Votre priorité maintenant : l’allemand",
          ar: "أولويتك الآن: اللغة الألمانية",
          en: "Your priority now: German",
          de: "Deine Priorität jetzt: Deutsch",
        }[locale],
        body: {
          fr: `Votre niveau actuel est ${currentLevel}. Prochaine étape : ${target}, puis le niveau exact demandé par les programmes retenus. Pendant cette progression, votre projet universitaire continue d’avancer.`,
          ar: `مستواك الحالي هو ${currentLevel}. الخطوة التالية: ${target}، ثم المستوى الدقيق المطلوب في البرامج المختارة. وفي الوقت نفسه يستمر ملفك الجامعي في التقدم.`,
          en: `Your current level is ${currentLevel}. Next target: ${target}, then the exact level required by the programmes we select. Your university project keeps moving while you study.`,
          de: `Dein aktuelles Niveau ist ${currentLevel}. Nächstes Ziel: ${target}, danach das genaue Niveau der ausgewählten Studiengänge. Dein Hochschulprojekt läuft währenddessen weiter.`,
        }[locale],
        choices: {
          fr: [
            "Tunisie : continuer l’allemand sur place, avec une école partenaire uniquement si un partenariat validé est disponible.",
            "En ligne : suivre une préparation à distance avec Campus Allemagne lorsqu’elle est disponible pour votre niveau.",
            "Allemagne : étudier une préparation linguistique sur place avec une école partenaire validée, si votre situation et la voie administrative le permettent.",
          ],
          ar: [
            "تونس: مواصلة الألمانية هناك، مع مدرسة شريكة فقط إذا كان هناك تعاون موثق ومتاح.",
            "عن بُعد: متابعة تحضير لغوي مع Campus Allemagne عندما يكون متاحًا لمستواك.",
            "ألمانيا: دراسة تحضير لغوي هناك مع مدرسة شريكة موثقة إذا كان وضعك والمسار الإداري يسمحان بذلك.",
          ],
          en: [
            "Tunisia: continue German locally, with a partner school only when a validated partnership is available.",
            "Online: follow remote preparation with Campus Allemagne when it is available for your level.",
            "Germany: explore language preparation in Germany with a validated partner school when your situation and administrative route allow it.",
          ],
          de: [
            "Tunesien: Deutsch vor Ort weiterlernen; eine Partnerschule wird nur genannt, wenn eine bestätigte Kooperation verfügbar ist.",
            "Online: Fernvorbereitung mit Campus Allemagne, wenn sie für dein Niveau verfügbar ist.",
            "Deutschland: Sprachvorbereitung bei einer bestätigten Partnerschule prüfen, sofern dein Profil und der Verwaltungsweg dies erlauben.",
          ],
        }[locale],
      };
    }

    if (priority.key === "english") {
      const target = priority.next || "B2";
      return {
        title: {
          fr: "Votre priorité maintenant : l’anglais",
          ar: "أولويتك الآن: اللغة الإنجليزية",
          en: "Your priority now: English",
          de: "Deine Priorität jetzt: Englisch",
        }[locale],
        body: {
          fr: `Votre niveau actuel est ${currentLevel}. Visez d’abord ${target}. Campus Allemagne vérifiera ensuite le niveau et le certificat réellement acceptés par chaque programme anglophone.`,
          ar: `مستواك الحالي هو ${currentLevel}. استهدف أولًا ${target}. بعد ذلك يتحقق Campus Allemagne من المستوى والشهادة المقبولين فعليًا لكل برنامج باللغة الإنجليزية.`,
          en: `Your current level is ${currentLevel}. First target ${target}. Campus Allemagne will then verify the exact level and certificate accepted by each English-taught programme.`,
          de: `Dein aktuelles Niveau ist ${currentLevel}. Zunächst solltest du ${target} erreichen. Danach prüft Campus Allemagne Niveau und Nachweis für jeden englischsprachigen Studiengang.`,
        }[locale],
        choices: [],
      };
    }

    if (priority.key === "language_choice") {
      return {
        title: {
          fr: "Votre priorité maintenant : choisir la langue d’études",
          ar: "أولويتك الآن: تحديد لغة الدراسة",
          en: "Your priority now: choose the study language",
          de: "Deine Priorität jetzt: Unterrichtssprache festlegen",
        }[locale],
        body: {
          fr: "Nous comparons avec vous les possibilités en allemand et en anglais avant de fixer un objectif linguistique. Le choix dépend du domaine, des programmes disponibles et de votre niveau actuel.",
          ar: "نقارن معك الخيارات بالألمانية والإنجليزية قبل تحديد الهدف اللغوي. يعتمد الاختيار على التخصص والبرامج المتاحة ومستواك الحالي.",
          en: "We compare German- and English-taught options with you before setting a language target. The choice depends on your field, available programmes and current level.",
          de: "Wir vergleichen deutsch- und englischsprachige Möglichkeiten, bevor wir ein Sprachziel festlegen. Entscheidend sind Fach, verfügbare Programme und dein aktuelles Niveau.",
        }[locale],
        choices: [],
      };
    }

    return {
      title: {
        fr: "Votre priorité maintenant : universités et dossier",
        ar: "أولويتك الآن: الجامعات والملف",
        en: "Your priority now: universities and application file",
        de: "Deine Priorität jetzt: Hochschulen und Bewerbungsunterlagen",
      }[locale],
      body: {
        fr: "Votre niveau de langue est assez avancé pour commencer la sélection académique. Nous vérifierons quand même le certificat et le niveau exact exigés par chaque programme.",
        ar: "مستواك اللغوي متقدم بما يكفي لبدء الاختيار الأكاديمي. ومع ذلك نتحقق من الشهادة والمستوى الدقيق المطلوبين لكل برنامج.",
        en: "Your language level is advanced enough to begin the academic selection. We still verify the exact certificate and level required by each programme.",
        de: "Dein Sprachniveau ist weit genug fortgeschritten, um mit der akademischen Auswahl zu beginnen. Den genauen Nachweis prüfen wir trotzdem für jeden Studiengang.",
      }[locale],
      choices: [],
    };
  })();

  const academic = (() => {
    if (answers.bacStatus === "no_bac") {
      return {
        title: {
          fr: "Votre point de départ académique doit être vérifié",
          ar: "يجب التحقق من نقطة انطلاقك الأكاديمية",
          en: "Your academic starting point must be checked",
          de: "Dein akademischer Ausgangspunkt muss geprüft werden",
        }[locale],
        body: {
          fr: `Vous avez indiqué ne pas avoir de Bac ni de diplôme secondaire équivalent. Votre dernier niveau déclaré est : ${lastDiploma}. Cela n’est pas un refus : Campus Allemagne vérifie d’abord quelle voie officielle est réellement possible avant de vous proposer une candidature universitaire.`,
          ar: `ذكرت أنك لا تملك بكالوريا ولا شهادة ثانوية معادلة. آخر مستوى دراسي صرحت به هو: ${lastDiploma}. هذا ليس رفضًا؛ يتحقق Campus Allemagne أولًا من المسار الرسمي الممكن فعلًا قبل اقتراح تقديم جامعي.`,
          en: `You indicated that you do not have a Baccalaureate or equivalent school-leaving qualification. Your latest declared education level is: ${lastDiploma}. This is not a rejection: Campus Allemagne first verifies which official route is genuinely possible before proposing a university application.`,
          de: `Du hast angegeben, kein Baccalauréat und keinen gleichwertigen Schulabschluss zu haben. Dein zuletzt angegebener Bildungsstand ist: ${lastDiploma}. Das ist keine Ablehnung: Campus Allemagne prüft zuerst, welcher offizielle Weg tatsächlich möglich ist, bevor eine Hochschulbewerbung vorgeschlagen wird.`,
        }[locale],
      };
    }

    if (access.status === "direct_subject_restricted") {
      return {
        title: {
          fr: "Votre projet académique est compatible",
          ar: "مشروعك الأكاديمي متوافق",
          en: "Your academic project is compatible",
          de: "Dein akademisches Vorhaben ist grundsätzlich passend",
        }[locale],
        body: {
          fr: `Votre Bac ${bac} peut ouvrir un accès direct lié au domaine vers des études en ${field}. Référence DAAD/ZAB vérifiée le ${access.verifiedAt}. La décision finale appartient à l’établissement.`,
          ar: `شهادة ${bac} قد تفتح دخولًا مباشرًا مرتبطًا بالتخصص لدراسة ${field}. مرجع DAAD/ZAB تم التحقق منه في ${access.verifiedAt}. القرار النهائي للمؤسسة الجامعية.`,
          en: `Your ${bac} may provide direct subject-linked access to ${field}. DAAD/ZAB reference verified on ${access.verifiedAt}. The institution makes the final decision.`,
          de: `Dein Abschluss ${bac} kann einen direkten fachgebundenen Zugang zu ${field} ermöglichen. DAAD/ZAB-Quelle geprüft am ${access.verifiedAt}. Die Hochschule entscheidet endgültig.`,
        }[locale],
      };
    }

    if (access.status === "verified_subject_mismatch") {
      return {
        title: {
          fr: "Votre domaine demande une vérification supplémentaire",
          ar: "تخصصك يحتاج إلى تحقق إضافي",
          en: "Your field needs an additional check",
          de: "Dein Fach benötigt eine zusätzliche Prüfung",
        }[locale],
        body: {
          fr: `La règle officielle liée à votre Bac est identifiée, mais elle ne confirme pas encore automatiquement votre objectif en ${field}. Campus Allemagne vérifie une alternative adaptée avant toute candidature.`,
          ar: `تم تحديد القاعدة الرسمية الخاصة بشهادتك، لكنها لا تؤكد تلقائيًا بعد هدفك في ${field}. يتحقق Campus Allemagne من مسار مناسب قبل أي تقديم.`,
          en: `The official rule for your qualification is identified, but it does not yet automatically confirm your ${field} objective. Campus Allemagne verifies a suitable alternative before any application.`,
          de: `Die offizielle Regel für deinen Abschluss ist bekannt, bestätigt dein Ziel ${field} aber noch nicht automatisch. Campus Allemagne prüft vor jeder Bewerbung eine passende Alternative.`,
        }[locale],
      };
    }

    return {
      title: {
        fr: "Votre accès académique doit être confirmé",
        ar: "يجب تأكيد دخولك الأكاديمي",
        en: "Your academic access must be confirmed",
        de: "Dein Hochschulzugang muss bestätigt werden",
      }[locale],
      body: {
        fr: `Pour cette combinaison (${degree}, ${field}, ${bac}), nous ne donnons pas de conclusion automatique. Campus Allemagne vérifie la règle officielle et les conditions du programme avant de confirmer la candidature.`,
        ar: `لهذه الحالة (${degree}، ${field}، ${bac}) لا نعطي نتيجة تلقائية. يتحقق Campus Allemagne من القاعدة الرسمية وشروط البرنامج قبل تأكيد التقديم.`,
        en: `For this combination (${degree}, ${field}, ${bac}), we do not issue an automatic conclusion. Campus Allemagne verifies the official rule and programme requirements before confirming an application.`,
        de: `Für diese Kombination (${degree}, ${field}, ${bac}) geben wir keine automatische Aussage ab. Campus Allemagne prüft die offizielle Regel und die Programmbedingungen vor einer Bewerbung.`,
      }[locale],
    };
  })();

  const programmeOptions = programmeSet?.options || [];
  const programmeNames = programmeOptions
    .map((option) => `${option.institution} — ${option.programme} ${option.degree}`)
    .join(" · ");

  const city = (() => {
    if (programmeOptions.length > 0 && programmeSet) {
      const selected = programmeSet.selectionReason === "preferred_city";
      return {
        title: selected
          ? {
              fr: `Vos premières pistes à ${programmeSet.city}`,
              ar: `خياراتك الأولى في ${programmeSet.city}`,
              en: `Your first options in ${programmeSet.city}`,
              de: `Deine ersten Optionen in ${programmeSet.city}`,
            }[locale]
          : {
              fr: `Première suggestion de ville : ${programmeSet.city}`,
              ar: `أول اقتراح للمدينة: ${programmeSet.city}`,
              en: `First city suggestion: ${programmeSet.city}`,
              de: `Erster Stadtvorschlag: ${programmeSet.city}`,
            }[locale],
        body: {
          fr: `Nous avons déjà des pistes vérifiées pour votre profil : ${programmeNames}. Nous confirmerons avec vous 2 ou 3 choix avant la candidature.`,
          ar: `لدينا بالفعل خيارات موثقة لملفك: ${programmeNames}. سنؤكد معك خيارين أو ثلاثة قبل التقديم.`,
          en: `We already have verified options for your profile: ${programmeNames}. We will confirm 2 or 3 choices with you before applying.`,
          de: `Für dein Profil gibt es bereits geprüfte Optionen: ${programmeNames}. Vor der Bewerbung bestätigen wir mit dir 2 oder 3 Möglichkeiten.`,
        }[locale],
      };
    }

    if (cities) {
      return {
        title: {
          fr: `Votre choix de ville : ${cities}`,
          ar: `اختيارك للمدينة: ${cities}`,
          en: `Your city choice: ${cities}`,
          de: `Deine Stadtwahl: ${cities}`,
        }[locale],
        body: {
          fr: `Nous gardons cette préférence comme priorité. Campus Allemagne vérifie 2 ou 3 établissements réellement adaptés à votre ${degree} en ${field}, avec la langue, les conditions, la candidature et les échéances. Nous ne donnons pas de noms non vérifiés.`,
          ar: `نحتفظ بهذا الاختيار كأولوية. يتحقق Campus Allemagne من مؤسستين أو ثلاث تناسبان فعليًا ${degree} في ${field}، مع اللغة والشروط وطريقة التقديم والمواعيد. لا نعرض أسماء غير موثقة.`,
          en: `We keep this preference as a priority. Campus Allemagne verifies 2 or 3 institutions that genuinely fit your ${degree} in ${field}, including language, requirements, application route and deadlines. We do not show unverified names.`,
          de: `Diese Präferenz bleibt Priorität. Campus Allemagne prüft 2 oder 3 Hochschulen, die wirklich zu deinem ${degree} in ${field} passen, einschließlich Sprache, Voraussetzungen, Bewerbungsweg und Fristen. Ungeprüfte Namen zeigen wir nicht.`,
        }[locale],
      };
    }

    return {
      title: {
        fr: "Votre ville est encore ouverte",
        ar: "اختيار المدينة ما زال مفتوحًا",
        en: "Your city is still open",
        de: "Deine Stadt ist noch offen",
      }[locale],
      body: {
        fr: `Campus Allemagne comparera 2 ou 3 villes pertinentes pour votre ${degree} en ${field}. Nous tiendrons compte de la langue, des programmes réellement disponibles et de vos préférences avant de vous proposer des établissements.`,
        ar: `سيقارن Campus Allemagne مدينتين أو ثلاثًا مناسبتين لـ ${degree} في ${field}. نأخذ في الاعتبار اللغة والبرامج المتاحة فعليًا وتفضيلاتك قبل اقتراح المؤسسات.`,
        en: `Campus Allemagne will compare 2 or 3 relevant cities for your ${degree} in ${field}. We consider language, programmes that actually exist and your preferences before proposing institutions.`,
        de: `Campus Allemagne vergleicht 2 oder 3 passende Städte für deinen ${degree} in ${field}. Sprache, tatsächlich verfügbare Programme und deine Präferenzen werden berücksichtigt, bevor Hochschulen vorgeschlagen werden.`,
      }[locale],
    };
  })();

  const parallel = {
    title: {
      fr: priority.key === "german" || priority.key === "english"
        ? "Pendant que vous apprenez la langue, votre dossier avance"
        : "Votre dossier avance en parallèle",
      ar: priority.key === "german" || priority.key === "english"
        ? "أثناء تعلم اللغة، يستمر ملفك في التقدم"
        : "ملفك يتقدم بالتوازي",
      en: priority.key === "german" || priority.key === "english"
        ? "While you learn the language, your application file moves forward"
        : "Your application file moves forward in parallel",
      de: priority.key === "german" || priority.key === "english"
        ? "Während du die Sprache lernst, läuft dein Dossier weiter"
        : "Dein Dossier läuft parallel weiter",
    }[locale],
    body: {
      fr: "Campus Allemagne prépare avec vous : diplôme/Bac et relevés, traductions et légalisations lorsqu’elles sont nécessaires, passeport et pièces personnelles, calendrier, sélection des programmes et préparation des candidatures. Vous ne perdez pas des mois à attendre la fin de la langue.",
      ar: "يجهز Campus Allemagne معك: الشهادة وكشوف النقاط، الترجمات والتصديقات عند الحاجة، جواز السفر والوثائق الشخصية، الجدول الزمني، اختيار البرامج وتجهيز التقديمات. لا تضيع أشهرًا في انتظار نهاية دراسة اللغة.",
      en: "Campus Allemagne prepares with you: diploma/Bac and transcripts, translations and legalisations when required, passport and personal documents, timeline, programme selection and application preparation. You do not lose months waiting for language study to finish.",
      de: "Campus Allemagne bereitet mit dir vor: Abschluss/Bac und Notenübersichten, Übersetzungen und Legalisierungen wenn nötig, Pass und persönliche Unterlagen, Zeitplan, Programmauswahl und Bewerbungen. Du verlierst keine Monate, nur weil die Sprachvorbereitung noch läuft.",
    }[locale],
  };

  return {
    priorityKey: priority.key,
    priorityTitle: language.title,
    priorityBody: language.body,
    languageChoices: language.choices,
    academicTitle: academic.title,
    academicBody: answers.targetField === "Médecine/Santé"
      ? `${academic.body} ${{
          fr: "Pour Médecine/Santé, Campus Allemagne maintient toujours une vérification humaine renforcée des conditions du programme.",
          ar: "في الطب/الصحة، يحافظ Campus Allemagne دائمًا على مراجعة بشرية إضافية لشروط البرنامج.",
          en: "For Medicine/Health, Campus Allemagne always keeps an enhanced human review of programme-specific conditions.",
          de: "Für Medizin/Gesundheit führt Campus Allemagne immer eine zusätzliche manuelle Prüfung der Programmbedingungen durch.",
        }[locale]}`
      : academic.body,
    cityTitle: city.title,
    cityBody: city.body,
    parallelTitle: parallel.title,
    parallelBody: parallel.body,
    timeline: {
      now: {
        fr: priority.key === "applications" ? "Maintenant : confirmer les universités et commencer le dossier." : "Maintenant : traiter la priorité ci-dessus et ouvrir le dossier.",
        ar: priority.key === "applications" ? "الآن: تأكيد الجامعات وبدء الملف." : "الآن: معالجة الأولوية أعلاه وفتح الملف.",
        en: priority.key === "applications" ? "Now: confirm universities and start the application file." : "Now: work on the priority above and open the application file.",
        de: priority.key === "applications" ? "Jetzt: Hochschulen bestätigen und Dossier starten." : "Jetzt: die Priorität oben angehen und das Dossier starten.",
      }[locale],
      next: {
        fr: "Ensuite : retenir 2 ou 3 programmes vérifiés et finaliser les pièces.",
        ar: "بعد ذلك: اختيار برنامجين أو ثلاثة موثقة واستكمال الوثائق.",
        en: "Next: keep 2 or 3 verified programmes and complete the documents.",
        de: "Danach: 2 oder 3 geprüfte Programme auswählen und Unterlagen vervollständigen.",
      }[locale],
      then: {
        fr: "Puis : envoyer les candidatures par le canal officiel et suivre les réponses.",
        ar: "ثم: إرسال الطلبات عبر المسار الرسمي ومتابعة الردود.",
        en: "Then: submit through the official application channel and follow the responses.",
        de: "Dann: über den offiziellen Bewerbungsweg einreichen und Antworten verfolgen.",
      }[locale],
      afterAdmission: {
        fr: "Après une admission : financement, assurance, visa, puis préparation du logement et de l’arrivée selon l’accompagnement choisi.",
        ar: "بعد القبول: التمويل والتأمين والتأشيرة ثم التحضير للسكن والوصول حسب نوع المرافقة المختار.",
        en: "After admission: funding, insurance, visa, then housing and arrival preparation according to the support selected.",
        de: "Nach einer Zulassung: Finanzierung, Versicherung, Visum sowie Wohnungs- und Ankunftsvorbereitung je nach gewählter Begleitung.",
      }[locale],
    },
    ctaTitle: {
      fr: "Prochaine étape : construire votre plan avec Campus Allemagne",
      ar: "الخطوة التالية: بناء خطتك مع Campus Allemagne",
      en: "Next step: build your plan with Campus Allemagne",
      de: "Nächster Schritt: deinen Plan mit Campus Allemagne aufbauen",
    }[locale],
    ctaBody: {
      fr: "Lors du premier échange, nous confirmons votre priorité, les documents déjà disponibles, votre choix de ville et les premières candidatures à préparer. Vos parents peuvent participer si vous souhaitez aussi cadrer le budget et l’organisation du départ.",
      ar: "في أول تواصل نؤكد الأولوية والوثائق المتوفرة واختيار المدينة وأول طلبات التقديم. ويمكن لوالديك المشاركة إذا أردتم أيضًا مناقشة الميزانية وتنظيم السفر.",
      en: "In the first discussion, we confirm your priority, the documents you already have, your city choice and the first applications to prepare. Your parents can join if you also want to frame the budget and departure planning.",
      de: "Im ersten Gespräch bestätigen wir deine Priorität, vorhandene Unterlagen, Stadtwahl und die ersten Bewerbungen. Deine Eltern können teilnehmen, wenn Budget und Abreiseplanung ebenfalls besprochen werden sollen.",
    }[locale],
    officialSourceDate: access.verifiedAt,
  };
}
