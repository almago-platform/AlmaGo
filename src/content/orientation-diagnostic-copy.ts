import type { Locale } from "@/lib/i18n";
import type {
  PublicDiagnosticCode,
  PublicDiagnosticHeadlineCode,
  PublicDiagnosticStatus,
} from "@/lib/orientation/diagnostic";

type Message = { title: string; body: string };

type DiagnosticCopy = {
  status: Record<PublicDiagnosticStatus, string>;
  sections: {
    headline: string;
    paths: string;
    priorities: string;
    checks: string;
  };
  headlines: Record<PublicDiagnosticHeadlineCode, Message>;
  items: Record<PublicDiagnosticCode, Message>;
  disclaimer: string;
};

const fr: DiagnosticCopy = {
  status: {
    explore: "À explorer",
    needs_information: "À compléter",
    needs_verification: "À vérifier",
    known_gap: "À préparer",
  },
  sections: {
    headline: "Ce que votre projet montre maintenant",
    paths: "Pistes à explorer",
    priorities: "À faire maintenant",
    checks: "À vérifier avant d’avancer",
  },
  headlines: {
    future_bac: {
      title: "Votre projet peut déjà avancer avant le Bac.",
      body: "Utilisez cette période pour clarifier le domaine, progresser en langue et préparer les informations que vous aurez après les résultats.",
    },
    bachelor_project: {
      title: "Votre projet Bachelor est assez clair pour commencer la recherche.",
      body: "Commencez par comparer des programmes réels sur les sites officiels, puis vérifiez les conditions de chaque université.",
    },
    master_project: {
      title: "Vous pouvez commencer à chercher des Masters adaptés à votre parcours.",
      body: "Les conditions changent selon votre diplôme précédent, vos crédits, votre domaine et les langues. Vérifiez chaque programme séparément.",
    },
    other_project: {
      title: "Votre projet a besoin de quelques précisions.",
      body: "Cherchez d’abord des programmes concrets, puis vérifiez le niveau d’études et les conditions sur les sources officielles.",
    },
  },
  items: {
    future_bac_roadmap: {
      title: "Avant et après le Bac",
      body: "Avancez maintenant sur la langue et le choix d’études. Après les résultats, ajoutez votre moyenne finale pour mettre à jour votre orientation.",
    },
    bachelor_program_search: {
      title: "Chercher des Bachelors",
      body: "Comparez des programmes dans votre domaine. Le Bac ne donne pas automatiquement accès à tous les programmes.",
    },
    master_program_search: {
      title: "Chercher des Masters",
      body: "Cherchez des Masters proches de vos études précédentes et vérifiez leurs conditions.",
    },
    other_study_search: {
      title: "Chercher un parcours adapté",
      body: "Identifiez d’abord des programmes correspondant au niveau et au domaine souhaités, puis vérifiez leurs conditions.",
    },
    german_preparation: {
      title: "Progresser en allemand",
      body: "Votre niveau actuel montre que vous devez encore progresser en allemand. Le niveau demandé dépend du programme choisi.",
    },
    english_preparation: {
      title: "Progresser en anglais",
      body: "Votre niveau actuel montre que vous devez encore progresser en anglais. Le niveau ou le certificat demandé dépend du programme choisi.",
    },
    finish_bac: {
      title: "Obtenir les résultats définitifs du Bac",
      body: "Vous pouvez avancer maintenant, mais certaines vérifications devront attendre vos résultats finaux.",
    },
    add_average: {
      title: "Ajouter votre moyenne",
      body: "Votre moyenne aide à vérifier certaines conditions. Ne pas l’indiquer ne veut pas dire que votre projet est refusé.",
    },
    add_prior_diploma: {
      title: "Préciser votre diplôme actuel",
      body: "Pour un Master, nous avons besoin de connaître votre diplôme précédent pour vérifier les conditions.",
    },
    complete_prior_degree: {
      title: "Préciser votre diplôme avant un Master",
      body: "Le diplôme indiqué ne montre pas encore que vous avez terminé un premier diplôme universitaire. Clarifiez ce point avant de chercher des Masters.",
    },
    strengthen_german: {
      title: "Continuer l’allemand",
      body: "Progressez en allemand pendant la recherche. Nous vérifierons ensuite le niveau exact demandé par chaque programme.",
    },
    strengthen_english: {
      title: "Continuer l’anglais",
      body: "Progressez en anglais pendant la recherche. Nous vérifierons ensuite le niveau ou certificat demandé par chaque programme.",
    },
    compare_verified_programs: {
      title: "Comparer des programmes officiels",
      body: "Comparez des programmes réels à partir des sites officiels des universités.",
    },
    academic_access: {
      title: "Accès aux études",
      body: "Vérifiez si votre diplôme et votre parcours permettent de candidater au programme visé.",
    },
    master_entry_requirements: {
      title: "Conditions d’accès au Master",
      body: "Diplôme précédent, domaine, crédits, notes : les conditions changent selon le Master. Vérifiez-les sur la page officielle du programme.",
    },
    language_requirement: {
      title: "Langue demandée",
      body: "Vérifiez la langue d’enseignement ainsi que le niveau ou le certificat demandé pour chaque programme.",
    },
    budget_requirement: {
      title: "Budget à prévoir",
      body: "Comparez votre budget avec les coûts réels et les conditions financières officielles au moment de votre démarche.",
    },
    application_route_and_deadline: {
      title: "Où et quand candidater",
      body: "Vérifiez si vous devez candidater directement à l’université, via uni-assist ou ailleurs, ainsi que la date limite officielle.",
    },
  },
  disclaimer: "Cette orientation vous aide à organiser vos prochaines étapes. Elle ne constitue ni une décision d’admission, ni une décision de visa.",
};

const ar: DiagnosticCopy = {
  status: {
    explore: "للاستكشاف",
    needs_information: "معلومة ناقصة",
    needs_verification: "يحتاج إلى تحقق",
    known_gap: "يحتاج إلى تحضير",
  },
  sections: {
    headline: "قراءة أولية لمشروعك",
    paths: "مسارات يمكن استكشافها",
    priorities: "أولوياتك الآن",
    checks: "أمور يجب التحقق منها",
  },
  headlines: {
    future_bac: {
      title: "يمكنك تطوير مشروعك حتى قبل نتائج البكالوريا.",
      body: "استغل هذه الفترة لتحديد المجال وتحسين اللغة وتجهيز المعلومات التي ستكتمل بعد صدور النتائج.",
    },
    bachelor_project: {
      title: "مشروع البكالوريوس واضح بما يكفي لبدء البحث.",
      body: "الخطوة التالية هي مقارنة برامج موثوقة ثم التحقق من القبول الأكاديمي وشروط كل جامعة.",
    },
    master_project: {
      title: "يمكن تنظيم مشروع الماجستير حول الشروط المطلوبة.",
      body: "شروط الماجستير تختلف حسب الشهادة السابقة والرصيد الدراسي والمجال واللغة، لذلك يجب فحص كل برنامج على حدة.",
    },
    other_project: {
      title: "يحتاج مشروعك إلى برامج محددة للمقارنة.",
      body: "يمكن تنظيم البحث، لكن مستوى الدراسة والشروط الدقيقة يجب تأكيدها من المصادر الرسمية.",
    },
  },
  items: {
    future_bac_roadmap: {
      title: "خطة قبل وبعد البكالوريا",
      body: "ابدأ الآن باللغة وتحديد المشروع، ثم أضف المعدل النهائي بعد النتائج لتحديث التوجيه.",
    },
    bachelor_program_search: {
      title: "البحث عن برامج Bachelor",
      body: "قارن برامج في مجالك من دون افتراض أن البكالوريا تمنح تلقائيًا حق الدخول إلى كل برنامج.",
    },
    master_program_search: {
      title: "البحث عن برامج Master",
      body: "ابحث عن برامج قريبة من دراستك السابقة وتحقق من شروطها الأكاديمية بالتفصيل.",
    },
    other_study_search: {
      title: "البحث عن مسار دراسي مناسب",
      body: "حدد برامج توافق المستوى والمجال المطلوبين ثم تحقق من شروطها.",
    },
    german_preparation: {
      title: "التحضير للألمانية",
      body: "مستواك الحالي يعني أن اللغة ما زالت أولوية. المستوى المطلوب فعليًا يختلف حسب البرنامج.",
    },
    english_preparation: {
      title: "التحضير للإنجليزية",
      body: "مستواك الحالي يعني أن الإنجليزية تحتاج إلى تطوير. المستوى أو الشهادة المطلوبة تختلف حسب البرنامج.",
    },
    finish_bac: {
      title: "الحصول على نتيجة البكالوريا النهائية",
      body: "يمكنك التحضير الآن، لكن بعض التحققات الأكاديمية ستحتاج إلى النتيجة النهائية.",
    },
    add_average: {
      title: "إضافة المعدل",
      body: "المعدل يساعد في مقارنة بعض الشروط. عدم إدخاله لا يعني رفض المشروع.",
    },
    add_prior_diploma: {
      title: "تحديد شهادتك الحالية",
      body: "بالنسبة للماجستير، نحتاج إلى معرفة الشهادة السابقة قبل تحليل الشروط.",
    },
    complete_prior_degree: {
      title: "التحقق من الشهادة السابقة للماجستير",
      body: "الشهادة التي اخترتها لا تظهر بعد شهادة جامعية أولى مكتملة. يجب توضيح ذلك قبل استهداف برامج Master.",
    },
    strengthen_german: {
      title: "واصل تطوير الألمانية",
      body: "طوّر الألمانية أثناء البحث، ثم نتحقق من المستوى المطلوب لكل برنامج.",
    },
    strengthen_english: {
      title: "واصل تطوير الإنجليزية",
      body: "طوّر الإنجليزية أثناء البحث، ثم نتحقق من المستوى أو الشهادة المطلوبة لكل برنامج.",
    },
    compare_verified_programs: {
      title: "قارن برامج موثقة",
      body: "الاختيار النهائي يجب أن يعتمد على برامج حقيقية لها مصدر رسمي وتاريخ تحقق.",
    },
    academic_access: {
      title: "القبول الأكاديمي",
      body: "يجب التحقق من إمكانية الدخول إلى الدراسة حسب شهادتك ومسارك والبرنامج المحدد.",
    },
    master_entry_requirements: {
      title: "شروط الماجستير",
      body: "الشهادة السابقة والمجال والرصيد والدرجات وغيرها قد تختلف من برنامج إلى آخر ويجب التحقق منها من المصدر.",
    },
    language_requirement: {
      title: "شرط اللغة",
      body: "لغة التدريس والمستوى أو الشهادة المطلوبة يجب تأكيدها لكل برنامج.",
    },
    budget_requirement: {
      title: "الميزانية والمتطلبات المالية",
      body: "قارن ميزانيتك بالتكاليف الفعلية والمتطلبات المالية الرسمية وقت الإجراء.",
    },
    application_route_and_deadline: {
      title: "طريقة وموعد التقديم",
      body: "تحقق هل التقديم مباشر أو عبر uni-assist أو جهة أخرى، وتأكد من الموعد الرسمي.",
    },
  },
  disclaimer: "هذا التوجيه ينظم خطوات البحث القادمة فقط، ولا يمثل قرار قبول جامعي أو قرار تأشيرة.",
};

const en: DiagnosticCopy = {
  status: {
    explore: "Explore",
    needs_information: "Add information",
    needs_verification: "Check",
    known_gap: "Prepare",
  },
  sections: {
    headline: "First reading of your project",
    paths: "Paths to explore",
    priorities: "Your priorities now",
    checks: "Check before taking action",
  },
  headlines: {
    future_bac: {
      title: "You can move your project forward before your final Baccalaureate results.",
      body: "Use this time to clarify your subject, improve your language skills and prepare the information you will have after the results.",
    },
    bachelor_project: {
      title: "Your Bachelor project is clear enough to start searching.",
      body: "Next, compare sourced programmes and verify academic access and each institution’s requirements.",
    },
    master_project: {
      title: "Your Master project can now be organised around entry requirements.",
      body: "Master requirements vary by prior degree, credits, subject and language, so each programme needs its own verification.",
    },
    other_project: {
      title: "Your project needs concrete programmes before it can be narrowed down.",
      body: "The search can be organised, but the exact level and requirements must be confirmed from official sources.",
    },
  },
  items: {
    future_bac_roadmap: { title: "Roadmap before and after the Baccalaureate", body: "Work on language and study choices now, then add your final average after results to update the orientation." },
    bachelor_program_search: { title: "Search for Bachelor programmes", body: "Compare programmes in your subject without assuming that the Baccalaureate automatically gives access to every course." },
    master_program_search: { title: "Search for Master programmes", body: "Target programmes close to your previous studies and verify their detailed academic requirements." },
    other_study_search: { title: "Search for a suitable study route", body: "Identify programmes matching your target level and subject, then verify their conditions." },
    german_preparation: { title: "German preparation", body: "Your current level means German is still an important workstream. The exact required level depends on the programme." },
    english_preparation: { title: "English preparation", body: "Your current level means English still needs work. The exact level or certificate depends on the programme." },
    finish_bac: { title: "Get your final Baccalaureate results", body: "You can prepare now, but some academic checks will require your final results." },
    add_average: { title: "Add your average", body: "Your average helps compare some academic criteria. Missing it does not mean your project is rejected." },
    add_prior_diploma: { title: "Add your current qualification", body: "For a Master project, the prior qualification is needed before requirements can be analysed." },
    complete_prior_degree: { title: "Check the degree needed before a Master", body: "The qualification selected does not yet show a completed first university degree. Clarify this before targeting Master programmes." },
    strengthen_german: { title: "Keep improving your German", body: "Build your German while searching, then verify the exact level required by each programme." },
    strengthen_english: { title: "Keep improving your English", body: "Build your English while searching, then verify the exact level or certificate required by each programme." },
    compare_verified_programs: { title: "Compare verified programmes", body: "Final choices should start from real programmes with an official source and a verification date." },
    academic_access: { title: "Academic access", body: "Access must be checked against your qualification, academic history and the specific programme." },
    master_entry_requirements: { title: "Master entry requirements", body: "Prior degree, subject, credits, grades and other criteria can vary and must be checked on the programme source." },
    language_requirement: { title: "Language requirement", body: "Teaching language and required level or certificate must be confirmed for each programme." },
    budget_requirement: { title: "Budget and financial requirements", body: "Compare your indicative budget with real costs and official financial requirements at the time you apply." },
    application_route_and_deadline: { title: "Application route and deadline", body: "Check whether the application is direct, through uni-assist or another route, and confirm the official deadline." },
  },
  disclaimer: "This orientation organises your next research steps. It is not an admission or visa decision.",
};

const de: DiagnosticCopy = {
  status: {
    explore: "Prüfen",
    needs_information: "Angaben ergänzen",
    needs_verification: "Verifizieren",
    known_gap: "Vorbereiten",
  },
  sections: {
    headline: "Erste Einordnung deines Projekts",
    paths: "Mögliche Wege",
    priorities: "Deine nächsten Prioritäten",
    checks: "Vor einem Schritt prüfen",
  },
  headlines: {
    future_bac: {
      title: "Du kannst dein Projekt schon vor dem endgültigen Baccalauréat-Ergebnis weiterentwickeln.",
      body: "Nutze die Zeit für Fachwahl, Sprache und die Informationen, die nach den Ergebnissen ergänzt werden können.",
    },
    bachelor_project: {
      title: "Dein Bachelor-Projekt ist klar genug für die Programmsuche.",
      body: "Vergleiche als Nächstes belegte Programme und prüfe Hochschulzugang sowie die Anforderungen jeder Hochschule.",
    },
    master_project: {
      title: "Dein Master-Projekt kann jetzt nach Zulassungsvoraussetzungen strukturiert werden.",
      body: "Die Anforderungen unterscheiden sich je nach Vorabschluss, Credits, Fach und Sprache und müssen pro Programm geprüft werden.",
    },
    other_project: {
      title: "Dein Projekt braucht konkrete Programme für die weitere Einordnung.",
      body: "Die Suche kann strukturiert werden, aber Niveau und genaue Anforderungen müssen aus offiziellen Quellen bestätigt werden.",
    },
  },
  items: {
    future_bac_roadmap: { title: "Roadmap vor und nach dem Baccalauréat", body: "Arbeite jetzt an Sprache und Studienwahl und ergänze nach den Ergebnissen deine endgültige Note." },
    bachelor_program_search: { title: "Bachelor-Programme suchen", body: "Vergleiche Programme in deinem Fach, ohne automatisch von einem Zugang zu jedem Studiengang auszugehen." },
    master_program_search: { title: "Master-Programme suchen", body: "Suche Programme, die zu deinem bisherigen Studium passen, und prüfe ihre akademischen Voraussetzungen." },
    other_study_search: { title: "Passenden Studienweg suchen", body: "Finde Programme auf dem gewünschten Niveau und im gewünschten Fach und prüfe danach die Bedingungen." },
    german_preparation: { title: "Deutsch vorbereiten", body: "Dein aktuelles Niveau zeigt, dass Sprache noch wichtig ist. Das genaue erforderliche Niveau hängt vom Programm ab." },
    english_preparation: { title: "Englisch vorbereiten", body: "Dein aktuelles Niveau zeigt, dass Englisch noch ausgebaut werden sollte. Niveau und Zertifikat hängen vom Programm ab." },
    finish_bac: { title: "Endgültiges Baccalauréat-Ergebnis erhalten", body: "Du kannst jetzt vorbereiten, einige akademische Prüfungen brauchen aber das endgültige Ergebnis." },
    add_average: { title: "Durchschnittsnote ergänzen", body: "Die Note hilft bei einigen Kriterien. Eine fehlende Note bedeutet nicht, dass das Projekt abgelehnt ist." },
    add_prior_diploma: { title: "Aktuellen Abschluss angeben", body: "Für ein Master-Projekt muss der vorherige Abschluss bekannt sein, bevor Voraussetzungen geprüft werden können." },
    complete_prior_degree: { title: "Vorabschluss für den Master klären", body: "Der gewählte Abschluss zeigt noch keinen abgeschlossenen ersten Hochschulabschluss. Kläre das vor der Master-Suche." },
    strengthen_german: { title: "Deutsch weiter ausbauen", body: "Verbessere dein Deutsch während der Suche und prüfe anschließend das genaue Niveau je Programm." },
    strengthen_english: { title: "Englisch weiter ausbauen", body: "Verbessere dein Englisch während der Suche und prüfe anschließend Niveau oder Zertifikat je Programm." },
    compare_verified_programs: { title: "Verifizierte Programme vergleichen", body: "Die endgültige Auswahl sollte auf echten Programmen mit offizieller Quelle und Prüfdaten beruhen." },
    academic_access: { title: "Hochschulzugang", body: "Der Zugang muss anhand deines Abschlusses, bisherigen Wegs und des konkreten Programms geprüft werden." },
    master_entry_requirements: { title: "Master-Voraussetzungen", body: "Vorabschluss, Fach, Credits, Noten und weitere Kriterien können variieren und müssen aus der Programmquelle geprüft werden." },
    language_requirement: { title: "Sprachanforderung", body: "Unterrichtssprache sowie erforderliches Niveau oder Zertifikat müssen pro Programm bestätigt werden." },
    budget_requirement: { title: "Budget und finanzielle Anforderungen", body: "Vergleiche dein ungefähres Budget mit realen Kosten und den offiziellen finanziellen Anforderungen zum Zeitpunkt des Verfahrens." },
    application_route_and_deadline: { title: "Bewerbungsweg und Frist", body: "Prüfe, ob die Bewerbung direkt, über uni-assist oder anders erfolgt, und bestätige die offizielle Frist." },
  },
  disclaimer: "Diese Orientierung strukturiert die nächsten Rechercheschritte. Sie ist keine Zulassungs- oder Visumentscheidung.",
};

export const orientationDiagnosticCopy: Record<Locale, DiagnosticCopy> = { fr, ar, en, de };
