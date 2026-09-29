import type { Locale } from "@/lib/i18n";

type DocumentsCopy = {
  page: {
    eyebrow: string;
    title: string;
    description: string;
    unavailableTitle: string;
    unavailableText: string;
    retry: string;
    back: string;
  };
  intlLocale: string;
  unknown: string;
  sentOn: string;
  fileSizes: { kb: string; mb: string };
  categories: Record<string, string>;
  statuses: Record<string, string>;
  evidenceTypes: Record<string, string>;
  evidenceStatuses: Record<string, string>;
  feedback: {
    chooseFile: string;
    uploadError: string;
    uploadSuccess: string;
    networkError: string;
    deleteConfirm: string;
    deleteError: string;
    deleteSuccess: string;
  };
  priority: {
    aria: string;
    correctionBadge: string;
    reviewBadge: string;
    documentsBadge: string;
    correctionTitle: string;
    reviewTitle: string;
    documentsTitle: string;
    correctionText: (count: number) => string;
    reviewText: string;
    hasDocumentsText: string;
    emptyText: string;
    tracked: string;
    correctionWhy: string;
  };
  summary: {
    aria: string;
    approvedTitle: string;
    approvedBadge: string;
    reviewTitle: string;
    reviewBadge: string;
    correctionTitle: string;
    actionRequired: string;
    nothing: string;
  };
  evidence: {
    eyebrow: string;
    title: string;
    count: (count: number) => string;
    boundary: string;
    loadError: string;
    emptyTitle: string;
    emptyText: string;
    file: string;
    institution: string;
    date: string;
  };
  upload: {
    badge: string;
    title: string;
    text: string;
    stepType: string;
    typeLabel: string;
    stepFile: string;
    fileLabel: string;
    stepSend: string;
    sending: string;
    send: string;
    footer: string;
  };
  list: {
    title: string;
    count: (count: number) => string;
    emptyTitle: string;
    emptyText: string;
    commentTitle: string;
    commentBoundary: string;
    open: string;
    openAria: (name: string) => string;
    remove: string;
    removeAria: (name: string) => string;
  };
  history: {
    title: string;
    description: string;
    loadError: string;
    empty: string;
  };
};

const fr: DocumentsCopy = {
  page: {
    eyebrow: "Mon dossier",
    title: "Vos documents",
    description: "Voyez immédiatement ce qui est validé, ce qui est en vérification et ce qui demande une action de votre part.",
    unavailableTitle: "Documents temporairement indisponibles",
    unavailableText: "Impossible de charger vos documents pour le moment. Aucun document n’a été supprimé ou remplacé. Vous pouvez relancer le chargement ou revenir à votre dossier.",
    retry: "Réessayer",
    back: "Retour à mon dossier",
  },
  intlLocale: "fr-FR",
  unknown: "À confirmer",
  sentOn: "envoyé le",
  fileSizes: { kb: "Ko", mb: "MiB" },
  categories: {
    passport: "Passeport",
    baccalaureate: "Baccalauréat",
    transcripts: "Relevés de notes",
    language_certificate: "Certificat de langue",
    university_attestation: "Attestation universitaire",
    cv: "CV",
    motivation_letter: "Lettre de motivation",
    translation: "Traduction",
    admission: "Admission",
    other: "Autre",
  },
  statuses: {
    pending: "En attente de revue",
    approved: "Approuvé",
    rejected: "Rejeté",
    replace_required: "À remplacer",
    reviewed: "Revu",
    quarantined: "En quarantaine",
  },
  evidenceTypes: {
    definitive_admission: "Admission définitive",
    conditional_admission: "Admission conditionnelle",
    bewerberbestaetigung: "Bewerberbestätigung (attestation de l’université)",
    admissible_university_correspondence: "Courrier d’université accepté pour votre parcours",
    other: "Preuve académique",
  },
  evidenceStatuses: {
    received: "Reçue",
    needs_review: "À vérifier",
    accepted_for_pathway: "Acceptée comme preuve de parcours",
    replace_required: "À remplacer",
    other: "État à confirmer",
  },
  feedback: {
    chooseFile: "Choisissez un fichier avant de continuer.",
    uploadError: "Impossible d’envoyer le document.",
    uploadSuccess: "Votre fichier est bien enregistré. Son statut sera mis à jour après vérification.",
    networkError: "Erreur réseau. Vérifiez votre connexion puis réessayez.",
    deleteConfirm: "Voulez-vous supprimer ce document ?",
    deleteError: "Impossible de supprimer le document.",
    deleteSuccess: "Le document a bien été supprimé de votre dossier.",
  },
  priority: {
    aria: "Priorité documentaire",
    correctionBadge: "Correction demandée",
    reviewBadge: "En vérification",
    documentsBadge: "Vos documents",
    correctionTitle: "Une action est nécessaire sur vos documents",
    reviewTitle: "Vos documents sont en cours de vérification",
    documentsTitle: "Vos documents",
    correctionText: (count) => `${count} document${count > 1 ? "s doivent" : " doit"} être corrigé${count > 1 ? "s" : ""}. Consultez le message AlmaGo avant de remplacer le fichier.`,
    reviewText: "Aucune action n’est demandée de votre côté pendant cette vérification. Les retours apparaîtront sur cette page.",
    hasDocumentsText: "Aucune correction n’est demandée actuellement. Vous pouvez ajouter une nouvelle pièce lorsqu’elle est nécessaire.",
    emptyText: "Vous n’avez encore ajouté aucun document. Lorsque votre dossier nécessitera une pièce, vous pourrez la déposer ci-dessous.",
    tracked: "Document suivi",
    correctionWhy: "Pourquoi cette correction ?",
  },
  summary: {
    aria: "Résumé des documents",
    approvedTitle: "Validés",
    approvedBadge: "Conformes",
    reviewTitle: "En vérification",
    reviewBadge: "Chez AlmaGo",
    correctionTitle: "À corriger",
    actionRequired: "Action requise",
    nothing: "Rien à signaler",
  },
  evidence: {
    eyebrow: "Documents scolaires",
    title: "Ce qu’ils permettent de vérifier",
    count: (count) => `${count} classification${count > 1 ? "s" : ""}`,
    boundary: "Le statut d’un fichier et son statut comme preuve académique sont deux choses différentes. Un document peut être approuvé sans être encore accepté comme preuve de parcours. Cette classification ne constitue ni une admission ni une décision de visa.",
    loadError: "Les classifications académiques sont temporairement indisponibles. Vos fichiers restent accessibles normalement.",
    emptyTitle: "Aucune preuve académique n’est encore classée.",
    emptyText: "Lorsqu’une pièce académique sera examinée pour votre parcours, son état apparaîtra ici séparément du statut du fichier.",
    file: "Fichier",
    institution: "Établissement",
    date: "Date de la preuve",
  },
  upload: {
    badge: "Nouveau fichier",
    title: "Ajouter un document",
    text: "Ajoutez un PDF, JPEG ou PNG (10 Mo max.). Vos fichiers restent privés.",
    stepType: "Choisir le type",
    typeLabel: "Type de document",
    stepFile: "Choisir le fichier",
    fileLabel: "Fichier à envoyer",
    stepSend: "Envoyer",
    sending: "Envoi en cours…",
    send: "Envoyer le document",
    footer: "Un nouveau fichier ne supprime pas automatiquement un fichier déjà validé.",
  },
  list: {
    title: "Mes documents",
    count: (count) => `${count} document${count > 1 ? "s" : ""} dans votre dossier.`,
    emptyTitle: "Vous n’avez encore ajouté aucun document.",
    emptyText: "Lorsque votre dossier nécessitera une pièce, vous pourrez la déposer avec le formulaire ci-dessus.",
    commentTitle: "Message pour ce document",
    commentBoundary: "Ce commentaire est destiné à votre espace étudiant et concerne uniquement ce document.",
    open: "Ouvrir",
    openAria: (name) => `Ouvrir ${name} (nouvel onglet)`,
    remove: "Supprimer",
    removeAria: (name) => `Supprimer ${name}`,
  },
  history: {
    title: "Historique visible du dossier",
    description: "Cette chronologie reprend les décisions et demandes communiquées dans votre espace. Les notes internes de l’équipe n’y apparaissent pas.",
    loadError: "Historique indisponible pour le moment. Réessayez dans quelques instants.",
    empty: "Les décisions et mises à jour qui vous sont communiquées apparaîtront ici.",
  },
};

const ar: DocumentsCopy = {
  page: {
    eyebrow: "ملفي",
    title: "مستنداتي",
    description: "اعرف بسرعة ما تم التحقق منه، وما هو قيد المراجعة، وما يحتاج إلى إجراء منك.",
    unavailableTitle: "المستندات غير متاحة مؤقتًا",
    unavailableText: "تعذر تحميل مستنداتك الآن. لم يتم حذف أو استبدال أي مستند. يمكنك إعادة المحاولة أو العودة إلى ملفك.",
    retry: "إعادة المحاولة",
    back: "العودة إلى ملفي",
  },
  intlLocale: "ar-TN",
  unknown: "يحتاج إلى تأكيد",
  sentOn: "أُرسل في",
  fileSizes: { kb: "ك.ب", mb: "م.ب" },
  categories: {
    passport: "جواز السفر",
    baccalaureate: "شهادة البكالوريا",
    transcripts: "كشوف الأعداد",
    language_certificate: "شهادة لغة",
    university_attestation: "شهادة جامعية",
    cv: "السيرة الذاتية",
    motivation_letter: "رسالة الدافع",
    translation: "ترجمة",
    admission: "قبول جامعي",
    other: "أخرى",
  },
  statuses: {
    pending: "في انتظار المراجعة",
    approved: "تمت الموافقة",
    rejected: "مرفوض",
    replace_required: "يجب استبداله",
    reviewed: "تمت مراجعته",
    quarantined: "موقوف للمراجعة الأمنية",
  },
  evidenceTypes: {
    definitive_admission: "قبول نهائي",
    conditional_admission: "قبول مشروط",
    bewerberbestaetigung: "إثبات من الجامعة (\u2066Bewerberbestätigung\u2069)",
    admissible_university_correspondence: "مراسلة جامعية مقبولة للمسار",
    other: "إثبات أكاديمي",
  },
  evidenceStatuses: {
    received: "تم الاستلام",
    needs_review: "يحتاج إلى مراجعة",
    accepted_for_pathway: "مقبول كإثبات للمسار",
    replace_required: "يجب استبداله",
    other: "الحالة تحتاج إلى تأكيد",
  },
  feedback: {
    chooseFile: "اختر ملفاً قبل المتابعة.",
    uploadError: "تعذر رفع المستند.",
    uploadSuccess: "تم حفظ الملف. سيتم تحديث حالته بعد المراجعة.",
    networkError: "حدث خطأ في الاتصال. تحقق من اتصالك وحاول مرة أخرى.",
    deleteConfirm: "هل تريد حذف هذا المستند؟",
    deleteError: "تعذر حذف المستند.",
    deleteSuccess: "تم حذف المستند من ملفك.",
  },
  priority: {
    aria: "أولوية المستندات",
    correctionBadge: "مطلوب تصحيح",
    reviewBadge: "قيد المراجعة",
    documentsBadge: "مستنداتك",
    correctionTitle: "يلزم تعديل بعض مستنداتك",
    reviewTitle: "مستنداتك قيد المراجعة",
    documentsTitle: "مستنداتك",
    correctionText: (count) => `هناك ${count} ${count === 1 ? "مستند يحتاج إلى تصحيح" : "مستندات تحتاج إلى تصحيح"}. اقرأ رسالة AlmaGo قبل استبدال الملف.`,
    reviewText: "لا يوجد إجراء مطلوب منك أثناء المراجعة. ستظهر الملاحظات في هذه الصفحة.",
    hasDocumentsText: "لا يوجد تصحيح مطلوب حاليًا. يمكنك إضافة مستند جديد عندما تحتاج إليه.",
    emptyText: "لم تضف أي مستند بعد. عندما يحتاج ملفك إلى وثيقة، يمكنك رفعها أدناه.",
    tracked: "المستند المتابع",
    correctionWhy: "لماذا طُلب هذا التصحيح؟",
  },
  summary: {
    aria: "ملخص المستندات",
    approvedTitle: "مستندات مقبولة",
    approvedBadge: "مقبولة",
    reviewTitle: "قيد المراجعة",
    reviewBadge: "لدى AlmaGo",
    correctionTitle: "تحتاج إلى تصحيح",
    actionRequired: "إجراء مطلوب",
    nothing: "لا شيء مطلوب",
  },
  evidence: {
    eyebrow: "المستندات الدراسية",
    title: "الإثباتات الأكاديمية في ملفك",
    count: (count) => `${count} تصنيف`,
    boundary: "حالة المستند وحالته كإثبات أكاديمي ليستا الشيء نفسه. قد يكون الملف مقبولًا تقنيًا لكنه لم يُقبل بعد كأساس لمسارك. ولا يعني هذا التصنيف قبولًا جامعيًا أو قرار تأشيرة.",
    loadError: "تصنيفات الإثبات الأكاديمي غير متاحة مؤقتًا. ملفاتك نفسها تبقى متاحة.",
    emptyTitle: "لا يوجد إثبات أكاديمي مصنّف بعد.",
    emptyText: "عندما تتم مراجعة مستند أكاديمي لمسارك، ستظهر حالته هنا بشكل منفصل عن حالة الملف.",
    file: "الملف",
    institution: "المؤسسة",
    date: "تاريخ الإثبات",
  },
  upload: {
    badge: "ملف جديد",
    title: "إضافة مستند",
    text: "أضف ملف PDF أو صورة JPEG أو PNG، بحد أقصى 10 م.ب. تبقى ملفاتك خاصة.",
    stepType: "اختر النوع",
    typeLabel: "نوع المستند",
    stepFile: "اختر الملف",
    fileLabel: "الملف المراد رفعه",
    stepSend: "إرسال",
    sending: "جارٍ الرفع…",
    send: "رفع المستند",
    footer: "إضافة ملف جديد لا تحذف تلقائيًا ملفاً سبق التحقق منه.",
  },
  list: {
    title: "مستنداتي",
    count: (count) => `${count} ${count === 1 ? "مستند في ملفك." : "مستندات في ملفك."}`,
    emptyTitle: "لم تضف أي مستند بعد.",
    emptyText: "عندما يحتاج ملفك إلى وثيقة، يمكنك رفعها باستعمال النموذج أعلاه.",
    commentTitle: "رسالة حول هذا المستند",
    commentBoundary: "هذه الملاحظة موجهة إلى مساحتك الطلابية وتتعلق بهذا المستند فقط.",
    open: "فتح",
    openAria: (name) => `فتح ${name} في علامة تبويب جديدة`,
    remove: "حذف",
    removeAria: (name) => `حذف ${name}`,
  },
  history: {
    title: "سجل التحديثات",
    description: "يعرض هذا السجل التحديثات والطلبات التي ظهرت في مساحتك. الملاحظات الداخلية للفريق لا تظهر هنا.",
    loadError: "السجل غير متاح مؤقتاً. حاول مرة أخرى بعد قليل.",
    empty: "ستظهر هنا القرارات والتحديثات التي يتم إرسالها إليك.",
  },
};

const en: DocumentsCopy = {
  page: {
    eyebrow: "My file",
    title: "My documents",
    description: "See what has been approved, what is under review and what needs action from you.",
    unavailableTitle: "Documents temporarily unavailable",
    unavailableText: "We cannot load your documents right now. Nothing has been deleted or replaced. Try again or go back to your file.",
    retry: "Try again",
    back: "Back to my file",
  },
  intlLocale: "en-GB",
  unknown: "To be confirmed",
  sentOn: "uploaded on",
  fileSizes: { kb: "KB", mb: "MiB" },
  categories: {
    passport: "Passport",
    baccalaureate: "Baccalaureate certificate",
    transcripts: "Transcripts",
    language_certificate: "Language certificate",
    university_attestation: "University certificate",
    cv: "CV",
    motivation_letter: "Motivation letter",
    translation: "Translation",
    admission: "Admission",
    other: "Other",
  },
  statuses: {
    pending: "Waiting for review",
    approved: "Approved",
    rejected: "Rejected",
    replace_required: "Replacement required",
    reviewed: "Reviewed",
    quarantined: "Quarantined",
  },
  evidenceTypes: {
    definitive_admission: "Definitive admission",
    conditional_admission: "Conditional admission",
    bewerberbestaetigung: "Bewerberbestätigung (university confirmation)",
    admissible_university_correspondence: "University correspondence accepted for the pathway",
    other: "Academic evidence",
  },
  evidenceStatuses: {
    received: "Received",
    needs_review: "Needs review",
    accepted_for_pathway: "Accepted as pathway evidence",
    replace_required: "Replacement required",
    other: "Status to be confirmed",
  },
  feedback: {
    chooseFile: "Choose a file before continuing.",
    uploadError: "We could not upload the document.",
    uploadSuccess: "Your file has been saved. Its status will be updated after review.",
    networkError: "Network error. Check your connection and try again.",
    deleteConfirm: "Do you want to delete this document?",
    deleteError: "We could not delete the document.",
    deleteSuccess: "The document has been deleted from your file.",
  },
  priority: {
    aria: "Document priority",
    correctionBadge: "Correction requested",
    reviewBadge: "Under review",
    documentsBadge: "Your documents",
    correctionTitle: "Your documents need attention",
    reviewTitle: "Your documents are under review",
    documentsTitle: "Your documents",
    correctionText: (count) => `${count} document${count === 1 ? " needs" : "s need"} to be corrected. Read the AlmaGo message before replacing the file.`,
    reviewText: "You do not need to do anything while this review is in progress. Updates will appear on this page.",
    hasDocumentsText: "No correction is required right now. Add another document when your file needs one.",
    emptyText: "You have not added any documents yet. When your file needs one, you can upload it below.",
    tracked: "Document being tracked",
    correctionWhy: "Why is this correction needed?",
  },
  summary: {
    aria: "Document summary",
    approvedTitle: "Approved",
    approvedBadge: "Accepted",
    reviewTitle: "Under review",
    reviewBadge: "With AlmaGo",
    correctionTitle: "To fix",
    actionRequired: "Action required",
    nothing: "Nothing to do",
  },
  evidence: {
    eyebrow: "Academic documents",
    title: "What they can be used to check",
    count: (count) => `${count} classification${count === 1 ? "" : "s"}`,
    boundary: "A file status and its status as academic evidence are different. A document can be approved without yet being accepted as pathway evidence. This classification is not an admission or visa decision.",
    loadError: "Academic evidence classifications are temporarily unavailable. Your files are still available.",
    emptyTitle: "No academic evidence has been classified yet.",
    emptyText: "When an academic document is reviewed for your pathway, its evidence status will appear here separately from the file status.",
    file: "File",
    institution: "Institution",
    date: "Evidence date",
  },
  upload: {
    badge: "New file",
    title: "Add a document",
    text: "Upload a PDF, JPEG or PNG (max. 10 MB). Your files remain private.",
    stepType: "Choose the type",
    typeLabel: "Document type",
    stepFile: "Choose the file",
    fileLabel: "File to upload",
    stepSend: "Upload",
    sending: "Uploading…",
    send: "Upload document",
    footer: "Uploading a new file does not automatically remove a file that has already been approved.",
  },
  list: {
    title: "My documents",
    count: (count) => `${count} document${count === 1 ? "" : "s"} in your file.`,
    emptyTitle: "You have not added any documents yet.",
    emptyText: "When your file needs one, you can upload it with the form above.",
    commentTitle: "Message about this document",
    commentBoundary: "This message is shown in your student space and only concerns this document.",
    open: "Open",
    openAria: (name) => `Open ${name} in a new tab`,
    remove: "Delete",
    removeAria: (name) => `Delete ${name}`,
  },
  history: {
    title: "Visible file history",
    description: "This timeline shows decisions and requests shared with you. Internal team notes are not shown here.",
    loadError: "History is temporarily unavailable. Please try again shortly.",
    empty: "Decisions and updates shared with you will appear here.",
  },
};

const de: DocumentsCopy = {
  page: {
    eyebrow: "Meine Akte",
    title: "Meine Unterlagen",
    description: "Sieh sofort, was geprüft ist, was gerade geprüft wird und wo du etwas tun musst.",
    unavailableTitle: "Unterlagen vorübergehend nicht verfügbar",
    unavailableText: "Deine Unterlagen können gerade nicht geladen werden. Es wurde nichts gelöscht oder ersetzt. Versuche es erneut oder gehe zurück zu deiner Akte.",
    retry: "Noch einmal versuchen",
    back: "Zurück zu meiner Akte",
  },
  intlLocale: "de-DE",
  unknown: "Noch zu bestätigen",
  sentOn: "hochgeladen am",
  fileSizes: { kb: "KB", mb: "MiB" },
  categories: {
    passport: "Reisepass",
    baccalaureate: "Baccalauréat-Zeugnis",
    transcripts: "Notenübersichten",
    language_certificate: "Sprachzertifikat",
    university_attestation: "Hochschulbescheinigung",
    cv: "Lebenslauf",
    motivation_letter: "Motivationsschreiben",
    translation: "Übersetzung",
    admission: "Zulassung",
    other: "Sonstiges",
  },
  statuses: {
    pending: "Wartet auf Prüfung",
    approved: "Geprüft",
    rejected: "Abgelehnt",
    replace_required: "Muss ersetzt werden",
    reviewed: "Geprüft",
    quarantined: "In Quarantäne",
  },
  evidenceTypes: {
    definitive_admission: "Endgültige Zulassung",
    conditional_admission: "Bedingte Zulassung",
    bewerberbestaetigung: "Bewerberbestätigung",
    admissible_university_correspondence: "Für den Studienweg akzeptierte Hochschulkorrespondenz",
    other: "Akademischer Nachweis",
  },
  evidenceStatuses: {
    received: "Eingegangen",
    needs_review: "Muss geprüft werden",
    accepted_for_pathway: "Als Nachweis für den Studienweg akzeptiert",
    replace_required: "Muss ersetzt werden",
    other: "Status noch zu bestätigen",
  },
  feedback: {
    chooseFile: "Wähle zuerst eine Datei aus.",
    uploadError: "Das Dokument konnte nicht hochgeladen werden.",
    uploadSuccess: "Deine Datei wurde gespeichert. Der Status wird nach der Prüfung aktualisiert.",
    networkError: "Netzwerkfehler. Prüfe deine Verbindung und versuche es erneut.",
    deleteConfirm: "Möchtest du dieses Dokument löschen?",
    deleteError: "Das Dokument konnte nicht gelöscht werden.",
    deleteSuccess: "Das Dokument wurde aus deiner Akte gelöscht.",
  },
  priority: {
    aria: "Priorität bei Unterlagen",
    correctionBadge: "Korrektur erforderlich",
    reviewBadge: "Wird geprüft",
    documentsBadge: "Deine Unterlagen",
    correctionTitle: "Bei deinen Unterlagen ist etwas zu tun",
    reviewTitle: "Deine Unterlagen werden geprüft",
    documentsTitle: "Deine Unterlagen",
    correctionText: (count) => `${count} Dokument${count === 1 ? " muss" : "e müssen"} korrigiert werden. Lies die AlmaGo-Nachricht, bevor du die Datei ersetzt.`,
    reviewText: "Während dieser Prüfung musst du nichts tun. Rückmeldungen erscheinen auf dieser Seite.",
    hasDocumentsText: "Aktuell ist keine Korrektur erforderlich. Füge eine weitere Unterlage hinzu, wenn sie für deine Akte gebraucht wird.",
    emptyText: "Du hast noch keine Unterlagen hinzugefügt. Wenn deine Akte eine Unterlage braucht, kannst du sie unten hochladen.",
    tracked: "Unterlage im Blick",
    correctionWhy: "Warum ist diese Korrektur nötig?",
  },
  summary: {
    aria: "Zusammenfassung der Unterlagen",
    approvedTitle: "Geprüft",
    approvedBadge: "In Ordnung",
    reviewTitle: "Wird geprüft",
    reviewBadge: "Bei AlmaGo",
    correctionTitle: "Zu korrigieren",
    actionRequired: "Aktion erforderlich",
    nothing: "Nichts zu tun",
  },
  evidence: {
    eyebrow: "Schul- und Hochschulunterlagen",
    title: "Was damit geprüft werden kann",
    count: (count) => `${count} Einordnung${count === 1 ? "" : "en"}`,
    boundary: "Der Dateistatus und der Status als akademischer Nachweis sind zwei verschiedene Dinge. Eine Datei kann geprüft sein, ohne bereits als Nachweis für den Studienweg akzeptiert zu sein. Diese Einordnung ist weder eine Zulassung noch eine Visumentscheidung.",
    loadError: "Die Einordnung akademischer Nachweise ist vorübergehend nicht verfügbar. Deine Dateien bleiben zugänglich.",
    emptyTitle: "Noch kein akademischer Nachweis ist eingeordnet.",
    emptyText: "Wenn eine akademische Unterlage für deinen Studienweg geprüft wurde, erscheint ihr Nachweisstatus hier getrennt vom Dateistatus.",
    file: "Datei",
    institution: "Einrichtung",
    date: "Datum des Nachweises",
  },
  upload: {
    badge: "Neue Datei",
    title: "Dokument hinzufügen",
    text: "Lade PDF, JPEG oder PNG hoch (max. 10 MB). Deine Dateien bleiben privat.",
    stepType: "Typ auswählen",
    typeLabel: "Dokumenttyp",
    stepFile: "Datei auswählen",
    fileLabel: "Datei zum Hochladen",
    stepSend: "Hochladen",
    sending: "Wird hochgeladen…",
    send: "Dokument hochladen",
    footer: "Eine neue Datei entfernt eine bereits geprüfte Datei nicht automatisch.",
  },
  list: {
    title: "Meine Unterlagen",
    count: (count) => `${count} Dokument${count === 1 ? "" : "e"} in deiner Akte.`,
    emptyTitle: "Du hast noch keine Unterlagen hinzugefügt.",
    emptyText: "Wenn deine Akte eine Unterlage braucht, kannst du sie mit dem Formular oben hochladen.",
    commentTitle: "Nachricht zu diesem Dokument",
    commentBoundary: "Diese Nachricht wird in deinem Studierendenbereich angezeigt und bezieht sich nur auf dieses Dokument.",
    open: "Öffnen",
    openAria: (name) => `${name} in neuem Tab öffnen`,
    remove: "Löschen",
    removeAria: (name) => `${name} löschen`,
  },
  history: {
    title: "Sichtbarer Verlauf deiner Akte",
    description: "Diese Zeitleiste zeigt Entscheidungen und Anfragen, die dir mitgeteilt wurden. Interne Teamnotizen werden hier nicht angezeigt.",
    loadError: "Der Verlauf ist vorübergehend nicht verfügbar. Bitte versuche es gleich noch einmal.",
    empty: "Entscheidungen und Aktualisierungen, die dir mitgeteilt werden, erscheinen hier.",
  },
};

export const studentDocumentsCopy: Record<Locale, DocumentsCopy> = { fr, ar, en, de };
