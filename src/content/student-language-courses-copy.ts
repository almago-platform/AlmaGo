import type { Locale } from "@/lib/i18n";

type LanguageCoursesCopy = {
  page: {
    title: string;
    description: string;
    back: string;
    guidanceEyebrow: string;
    guidanceTitle: string;
    guidanceDescription: string;
    guidancePoints: readonly [string, string, string];
  };
  panel: {
    purpose: { study_preparation: string; standalone_language: string };
    unknown: string;
    selectionLoadError: string;
    coursesLoadError: string;
    selectionSaveError: string;
    selectionRemoveError: string;
    currentTitle: string;
    currentLoading: string;
    currentSelected: string;
    currentStale: string;
    currentNone: string;
    selectionBoundary: string;
    removing: string;
    remove: string;
    catalogueTitle: string;
    catalogueDescription: string;
    filterAria: string;
    courseType: string;
    all: string;
    city: string;
    cityPlaceholder: string;
    language: string;
    languagePlaceholder: string;
    startLevel: string;
    targetLevel: string;
    apply: string;
    clear: string;
    catalogueEyebrow: string;
    available: string;
    resultCount: (count: number) => string;
    loading: string;
    unavailableTitle: string;
    emptyTitle: string;
    emptyText: string;
    levels: string;
    volume: string;
    hoursWeek: (hours: number) => string;
    period: string;
    price: string;
    lastVerified: string;
    revalidateBefore: string;
    officialSource: string;
    selected: string;
    saving: string;
    choose: string;
    applicationLink: string;
    intlLocale: string;
  };
};

export const studentLanguageCoursesCopy: Record<Locale, LanguageCoursesCopy> = {
  fr: {
    page: {
      title: "Cours de langue vérifiés",
      description: "Consultez les cours enregistrés à partir de sources officielles et distinguez clairement une préparation aux études d’un cours de langue autonome.",
      back: "Retour à mon parcours",
      guidanceEyebrow: "Avant de choisir un cours",
      guidanceTitle: "Le bon cours dépend de votre objectif d’études, pas seulement du niveau affiché.",
      guidanceDescription: "Utilisez le catalogue pour comprendre le rôle du cours dans votre projet. Vérifiez ensuite les conditions directement auprès de l’organisme qui le propose.",
      guidancePoints: ["Distinguer préparation aux études et cours de langue autonome.", "Vérifier le niveau, le format et la source officielle.", "Relier votre choix au parcours académique réellement visé."],
    },
    panel: {
      purpose: { study_preparation: "Préparation aux études", standalone_language: "Cours de langue autonome" },
      unknown: "À confirmer",
      selectionLoadError: "Impossible de charger votre choix de cours.",
      coursesLoadError: "Impossible de charger les cours vérifiés pour le moment.",
      selectionSaveError: "Impossible d’enregistrer ce choix.",
      selectionRemoveError: "Impossible de retirer ce choix.",
      currentTitle: "Votre choix actuel",
      currentLoading: "Chargement de votre choix…",
      currentSelected: "Un cours vérifié est associé à votre projet. Vous pouvez le remplacer en choisissant une autre fiche ci-dessous.",
      currentStale: "Votre ancien choix n’est plus publiable et doit être revalidé. Choisissez une autre fiche vérifiée ou retirez ce choix.",
      currentNone: "Aucun cours n’est encore associé à votre projet.",
      selectionBoundary: "Ce choix enregistre votre intention. Il ne constitue ni une décision d’admission ni une décision de visa.",
      removing: "Retrait…",
      remove: "Retirer mon choix",
      catalogueTitle: "Cours de langue",
      catalogueDescription: "Les cours affichés ont une source et une date de vérification. Un cours intensif n’est pas automatiquement une préparation universitaire.",
      filterAria: "Filtrer les cours de langue",
      courseType: "Type de cours",
      all: "Tous",
      city: "Ville",
      cityPlaceholder: "Ex. Berlin",
      language: "Langue",
      languagePlaceholder: "Ex. allemand",
      startLevel: "Niveau de départ",
      targetLevel: "Niveau cible",
      apply: "Appliquer les filtres",
      clear: "Effacer les filtres",
      catalogueEyebrow: "Catalogue vérifié",
      available: "Cours disponibles",
      resultCount: (count) => `${count} cours affiché${count > 1 ? "s" : ""}`,
      loading: "Chargement des cours vérifiés…",
      unavailableTitle: "Catalogue temporairement indisponible",
      emptyTitle: "Aucun cours ne correspond à ces filtres.",
      emptyText: "Essayez moins de filtres. AlmaGo n’invente pas les informations manquantes.",
      levels: "Niveaux",
      volume: "Volume",
      hoursWeek: (hours) => `${hours} h / semaine`,
      period: "Période",
      price: "Prix",
      lastVerified: "Dernière vérification enregistrée",
      revalidateBefore: "à revalider avant",
      officialSource: "Voir la source officielle",
      selected: "Cours sélectionné",
      saving: "Enregistrement…",
      choose: "Choisir pour mon projet",
      applicationLink: "Voir le lien d’inscription",
      intlLocale: "fr-FR",
    },
  },
  ar: {
    page: {
      title: "دورات لغة بمصادر موثّقة",
      description: "قارن الدورات التي لها مصادر واضحة، وميّز بين دورة التحضير للدراسة ودورة اللغة المستقلة.",
      back: "العودة إلى مساري",
      guidanceEyebrow: "قبل اختيار دورة",
      guidanceTitle: "اختر الدورة حسب هدفك الدراسي، لا حسب المستوى فقط.",
      guidanceDescription: "استخدم الكتالوج لفهم دور الدورة في مشروعك، ثم تحقق من الشروط مباشرة لدى الجهة التي تقدمها.",
      guidancePoints: ["ميّز بين التحضير للدراسة ودورة اللغة المستقلة.", "تحقق من المستوى والصيغة والمصدر الرسمي.", "اربط اختيارك بالمسار الأكاديمي الذي تستهدفه فعلياً."],
    },
    panel: {
      purpose: { study_preparation: "تحضير للدراسة", standalone_language: "دورة لغة مستقلة" },
      unknown: "يحتاج إلى تأكيد",
      selectionLoadError: "تعذر تحميل الدورة التي اخترتها.",
      coursesLoadError: "تعذر تحميل الدورات التي تم التحقق منها الآن.",
      selectionSaveError: "تعذر حفظ هذا الاختيار.",
      selectionRemoveError: "تعذر حذف هذا الاختيار.",
      currentTitle: "اختيارك الحالي",
      currentLoading: "جارٍ تحميل اختيارك…",
      currentSelected: "هذه الدورة مرتبطة حالياً بمشروعك. يمكنك تغييرها باختيار دورة أخرى أدناه.",
      currentStale: "اختيارك السابق لم يعد منشوراً ويحتاج إلى إعادة تحقق. اختر دورة أخرى تم التحقق منها أو احذف هذا الاختيار.",
      currentNone: "لا توجد دورة مرتبطة بمشروعك حتى الآن.",
      selectionBoundary: "هذا الاختيار يُسجّل اختيارك داخل AlmaGo فقط، ولا يعني قبولاً جامعياً أو قرار تأشيرة.",
      removing: "جارٍ الحذف…",
      remove: "حذف اختياري",
      catalogueTitle: "دورات اللغة",
      catalogueDescription: "كل دورة معروضة لها مصدر وتاريخ تحقق. الدورة المكثفة ليست تلقائياً دورة تحضير جامعي.",
      filterAria: "تصفية دورات اللغة",
      courseType: "نوع الدورة",
      all: "الكل",
      city: "المدينة",
      cityPlaceholder: "مثال: برلين",
      language: "اللغة",
      languagePlaceholder: "مثال: الألمانية",
      startLevel: "مستوى البداية",
      targetLevel: "المستوى المستهدف",
      apply: "تطبيق الفلاتر",
      clear: "إلغاء الفلاتر",
      catalogueEyebrow: "كتالوج تم التحقق منه",
      available: "الدورات المتاحة",
      resultCount: (count) => `${count} ${count === 1 ? "دورة معروضة" : "دورات معروضة"}`,
      loading: "جارٍ تحميل الدورات…",
      unavailableTitle: "الكتالوج غير متاح مؤقتاً",
      emptyTitle: "لا توجد دورة تطابق هذه الفلاتر.",
      emptyText: "جرّب عدداً أقل من الفلاتر. AlmaGo لا يخمّن المعلومات الناقصة.",
      levels: "المستويات",
      volume: "عدد الساعات",
      hoursWeek: (hours) => `${hours} ساعة أسبوعياً`,
      period: "الفترة",
      price: "السعر",
      lastVerified: "آخر تحقق مسجل",
      revalidateBefore: "يجب إعادة التحقق قبل",
      officialSource: "عرض المصدر الرسمي",
      selected: "محددة لمشروعي",
      saving: "جارٍ الحفظ…",
      choose: "اختيار هذه الدورة",
      applicationLink: "عرض رابط التسجيل",
      intlLocale: "ar-TN",
    },
  },
  en: {
    page: {
      title: "Checked language courses",
      description: "Browse courses recorded from official sources and clearly distinguish study preparation from a standalone language course.",
      back: "Back to my journey",
      guidanceEyebrow: "Before choosing a course",
      guidanceTitle: "The right course depends on your study goal, not only the level shown.",
      guidanceDescription: "Use the catalogue to understand the course’s role in your plan, then confirm the conditions directly with the provider.",
      guidancePoints: ["Distinguish study preparation from a standalone language course.", "Check the level, format and official source.", "Link your choice to the academic pathway you are actually aiming for."],
    },
    panel: {
      purpose: { study_preparation: "Study preparation", standalone_language: "Standalone language course" },
      unknown: "To be confirmed",
      selectionLoadError: "We could not load your selected course.",
      coursesLoadError: "We could not load the checked courses right now.",
      selectionSaveError: "We could not save this choice.",
      selectionRemoveError: "We could not remove this choice.",
      currentTitle: "Your current choice",
      currentLoading: "Loading your choice…",
      currentSelected: "A checked course is linked to your study plan. You can replace it by choosing another course below.",
      currentStale: "Your previous choice is no longer publishable and must be rechecked. Choose another checked course or remove this choice.",
      currentNone: "No course is linked to your study plan yet.",
      selectionBoundary: "This choice records your intention. It is not an admission or visa decision.",
      removing: "Removing…",
      remove: "Remove my choice",
      catalogueTitle: "Language courses",
      catalogueDescription: "The courses shown have a source and review date. An intensive course is not automatically a university-preparation course.",
      filterAria: "Filter language courses",
      courseType: "Course type",
      all: "All",
      city: "City",
      cityPlaceholder: "e.g. Berlin",
      language: "Language",
      languagePlaceholder: "e.g. German",
      startLevel: "Starting level",
      targetLevel: "Target level",
      apply: "Apply filters",
      clear: "Clear filters",
      catalogueEyebrow: "Checked catalogue",
      available: "Available courses",
      resultCount: (count) => `${count} course${count === 1 ? "" : "s"} shown`,
      loading: "Loading checked courses…",
      unavailableTitle: "Catalogue temporarily unavailable",
      emptyTitle: "No course matches these filters.",
      emptyText: "Try fewer filters. AlmaGo does not invent missing information.",
      levels: "Levels",
      volume: "Hours",
      hoursWeek: (hours) => `${hours} h / week`,
      period: "Period",
      price: "Price",
      lastVerified: "Last recorded check",
      revalidateBefore: "recheck before",
      officialSource: "View official source",
      selected: "Course selected",
      saving: "Saving…",
      choose: "Choose for my study plan",
      applicationLink: "View application link",
      intlLocale: "en-GB",
    },
  },
  de: {
    page: {
      title: "Geprüfte Sprachkurse",
      description: "Sieh dir Kurse aus offiziellen Quellen an und unterscheide klar zwischen Studienvorbereitung und einem eigenständigen Sprachkurs.",
      back: "Zurück zu meinem Studienweg",
      guidanceEyebrow: "Bevor du einen Kurs auswählst",
      guidanceTitle: "Der passende Kurs hängt von deinem Studienziel ab, nicht nur vom angezeigten Niveau.",
      guidanceDescription: "Nutze den Katalog, um die Rolle des Kurses in deinem Plan zu verstehen. Prüfe die Bedingungen anschließend direkt beim Anbieter.",
      guidancePoints: ["Studienvorbereitung und eigenständigen Sprachkurs unterscheiden.", "Niveau, Format und offizielle Quelle prüfen.", "Die Auswahl mit deinem tatsächlichen akademischen Ziel verbinden."],
    },
    panel: {
      purpose: { study_preparation: "Studienvorbereitung", standalone_language: "Eigenständiger Sprachkurs" },
      unknown: "Noch zu bestätigen",
      selectionLoadError: "Dein ausgewählter Kurs konnte nicht geladen werden.",
      coursesLoadError: "Die geprüften Kurse können gerade nicht geladen werden.",
      selectionSaveError: "Diese Auswahl konnte nicht gespeichert werden.",
      selectionRemoveError: "Diese Auswahl konnte nicht entfernt werden.",
      currentTitle: "Deine aktuelle Auswahl",
      currentLoading: "Auswahl wird geladen…",
      currentSelected: "Ein geprüfter Kurs ist mit deinem Studienplan verknüpft. Du kannst ihn durch einen anderen Kurs unten ersetzen.",
      currentStale: "Deine frühere Auswahl ist nicht mehr veröffentlichbar und muss erneut geprüft werden. Wähle einen anderen geprüften Kurs oder entferne die Auswahl.",
      currentNone: "Noch kein Kurs ist mit deinem Studienplan verknüpft.",
      selectionBoundary: "Diese Auswahl speichert deine Absicht. Sie ist weder eine Zulassungs- noch eine Visumentscheidung.",
      removing: "Wird entfernt…",
      remove: "Auswahl entfernen",
      catalogueTitle: "Sprachkurse",
      catalogueDescription: "Die angezeigten Kurse haben eine Quelle und ein Prüfdatum. Ein Intensivkurs ist nicht automatisch ein Studienvorbereitungskurs.",
      filterAria: "Sprachkurse filtern",
      courseType: "Kursart",
      all: "Alle",
      city: "Stadt",
      cityPlaceholder: "z. B. Berlin",
      language: "Sprache",
      languagePlaceholder: "z. B. Deutsch",
      startLevel: "Startniveau",
      targetLevel: "Zielniveau",
      apply: "Filter anwenden",
      clear: "Filter löschen",
      catalogueEyebrow: "Geprüfter Katalog",
      available: "Verfügbare Kurse",
      resultCount: (count) => `${count} Kurs${count === 1 ? "" : "e"} angezeigt`,
      loading: "Geprüfte Kurse werden geladen…",
      unavailableTitle: "Katalog vorübergehend nicht verfügbar",
      emptyTitle: "Kein Kurs passt zu diesen Filtern.",
      emptyText: "Versuche es mit weniger Filtern. AlmaGo ergänzt fehlende Angaben nicht durch Vermutungen.",
      levels: "Niveaus",
      volume: "Umfang",
      hoursWeek: (hours) => `${hours} Std. / Woche`,
      period: "Zeitraum",
      price: "Preis",
      lastVerified: "Zuletzt geprüft",
      revalidateBefore: "erneut prüfen vor",
      officialSource: "Offizielle Quelle ansehen",
      selected: "Kurs ausgewählt",
      saving: "Wird gespeichert…",
      choose: "Für meinen Studienplan auswählen",
      applicationLink: "Anmeldelink ansehen",
      intlLocale: "de-DE",
    },
  },
};
