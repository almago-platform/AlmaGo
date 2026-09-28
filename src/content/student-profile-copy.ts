import type { Locale } from "@/lib/i18n";
import type { SelectOption } from "@/lib/student/profile-options";

type ProfileCopy = {
  controls: {
    choose: string;
    updateSuffix: string;
    updateWarning: string;
    nationalitySearch: string;
    preferredCities: string;
    citySearch: string;
    legacyCities: string;
    selection: string;
  };
  page: {
    badge: string;
    title: string;
    description: string;
    back: string;
    unavailableTitle: string;
    unavailableText: string;
    retry: string;
    landmarks: string;
    accountReady: string;
    profileBadge: string;
    profileFilled: string;
    progressLabel: string;
    progressBoundary: string;
    whyEyebrow: string;
    whyTitle: string;
    whyText: string;
    checkEyebrow: string;
    checkText: string;
  };
  form: {
    identityBadge: string;
    identityTitle: string;
    identityText: string;
    studiesBadge: string;
    studiesTitle: string;
    studiesText: string;
    languagesBadge: string;
    languagesTitle: string;
    languagesText: string;
    projectBadge: string;
    projectTitle: string;
    projectText: string;
    fields: Record<string, string>;
    saveHint: string;
    saving: string;
    save: string;
    saved: string;
    saveError: string;
    networkError: string;
  };
};

const optionLabels: Record<Locale, Record<string, string>> = {
  fr: {},
  ar: {
    none: "لا يوجد",
    other: "أخرى",
    Informatique: "علوم الحاسوب",
    Ingénierie: "الهندسة",
    "Économie/Gestion": "الاقتصاد / التصرف",
    Architecture: "الهندسة المعمارية",
    Sciences: "العلوم",
    "Médecine/Santé": "الطب / الصحة",
    "Lettres/Langues": "الآداب / اللغات",
    "Sciences expérimentales": "العلوم التجريبية",
    Mathématiques: "الرياضيات",
    "Sciences techniques": "العلوم التقنية",
    "Économie et gestion": "الاقتصاد والتصرف",
    Lettres: "الآداب",
    Sport: "الرياضة",
    Baccalauréat: "البكالوريا",
    "Bac + 1": "سنة بعد البكالوريا",
    "Bac + 2": "سنتان بعد البكالوريا",
    Licence: "إجازة / Bachelor",
    Allemand: "الألمانية",
    Anglais: "الإنجليزية",
    "Allemand et anglais": "الألمانية والإنجليزية",
    "À définir": "لم أحدد بعد",
    "Moins de 800 € / mois": "أقل من 800 € شهرياً",
    "800–1 000 € / mois": "800–1,000 € شهرياً",
    "1 000–1 200 € / mois": "1,000–1,200 € شهرياً",
    "Plus de 1 200 € / mois": "أكثر من 1,200 € شهرياً",
    Algérienne: "جزائرية",
    Allemande: "ألمانية",
    Belge: "بلجيكية",
    Camerounaise: "كاميرونية",
    Canadienne: "كندية",
    Égyptienne: "مصرية",
    Française: "فرنسية",
    Italienne: "إيطالية",
    Libyenne: "ليبية",
    Marocaine: "مغربية",
    Mauritanienne: "موريتانية",
    Sénégalaise: "سنغالية",
    Suisse: "سويسرية",
    Tunisienne: "تونسية",
    Turque: "تركية",
    Autre: "أخرى",
  },
  en: {
    none: "None",
    other: "Other",
    Informatique: "Computer Science",
    Ingénierie: "Engineering",
    "Économie/Gestion": "Economics / Management",
    Architecture: "Architecture",
    Sciences: "Sciences",
    "Médecine/Santé": "Medicine / Health",
    "Lettres/Langues": "Humanities / Languages",
    "Sciences expérimentales": "Experimental Sciences",
    Mathématiques: "Mathematics",
    "Sciences techniques": "Technical Sciences",
    "Économie et gestion": "Economics and Management",
    Lettres: "Literature",
    Sport: "Sport",
    Baccalauréat: "Tunisian Baccalaureate",
    "Bac + 1": "1 year after Baccalaureate",
    "Bac + 2": "2 years after Baccalaureate",
    Licence: "Bachelor’s / Licence",
    Allemand: "German",
    Anglais: "English",
    "Allemand et anglais": "German and English",
    "À définir": "Not sure yet",
    "Moins de 800 € / mois": "Under €800 / month",
    "800–1 000 € / mois": "€800–1,000 / month",
    "1 000–1 200 € / mois": "€1,000–1,200 / month",
    "Plus de 1 200 € / mois": "Over €1,200 / month",
    Algérienne: "Algerian",
    Allemande: "German",
    Belge: "Belgian",
    Camerounaise: "Cameroonian",
    Canadienne: "Canadian",
    Égyptienne: "Egyptian",
    Française: "French",
    Italienne: "Italian",
    Libyenne: "Libyan",
    Marocaine: "Moroccan",
    Mauritanienne: "Mauritanian",
    Sénégalaise: "Senegalese",
    Suisse: "Swiss",
    Tunisienne: "Tunisian",
    Turque: "Turkish",
    Autre: "Other",
  },
  de: {
    none: "Keine",
    other: "Andere",
    Informatique: "Informatik",
    Ingénierie: "Ingenieurwissenschaften",
    "Économie/Gestion": "Wirtschaft / Management",
    Architecture: "Architektur",
    Sciences: "Naturwissenschaften",
    "Médecine/Santé": "Medizin / Gesundheit",
    "Lettres/Langues": "Geisteswissenschaften / Sprachen",
    "Sciences expérimentales": "Experimentelle Wissenschaften",
    Mathématiques: "Mathematik",
    "Sciences techniques": "Technische Wissenschaften",
    "Économie et gestion": "Wirtschaft und Management",
    Lettres: "Literatur",
    Sport: "Sport",
    Baccalauréat: "Tunesisches Baccalauréat",
    "Bac + 1": "1 Jahr nach dem Baccalauréat",
    "Bac + 2": "2 Jahre nach dem Baccalauréat",
    Licence: "Bachelor / Licence",
    Allemand: "Deutsch",
    Anglais: "Englisch",
    "Allemand et anglais": "Deutsch und Englisch",
    "À définir": "Noch offen",
    "Moins de 800 € / mois": "Unter 800 € / Monat",
    "800–1 000 € / mois": "800–1.000 € / Monat",
    "1 000–1 200 € / mois": "1.000–1.200 € / Monat",
    "Plus de 1 200 € / mois": "Über 1.200 € / Monat",
    Algérienne: "Algerisch",
    Allemande: "Deutsch",
    Belge: "Belgisch",
    Camerounaise: "Kamerunisch",
    Canadienne: "Kanadisch",
    Égyptienne: "Ägyptisch",
    Française: "Französisch",
    Italienne: "Italienisch",
    Libyenne: "Libysch",
    Marocaine: "Marokkanisch",
    Mauritanienne: "Mauretanisch",
    Sénégalaise: "Senegalesisch",
    Suisse: "Schweizerisch",
    Tunisienne: "Tunesisch",
    Turque: "Türkisch",
    Autre: "Andere",
  },
};

const cityLabels: Record<Locale, Record<string, string>> = {
  fr: {},
  ar: {
    Brême: "بريمن", Cologne: "كولونيا", Dresde: "دريسدن", Francfort: "فرانكفورت",
    Fribourg: "فرايبورغ", Hambourg: "هامبورغ", Hanovre: "هانوفر", Iéna: "يينا",
    Mayence: "ماينتس", Munich: "ميونخ", Nuremberg: "نورنبيرغ", Sarrebruck: "زاربروكن",
  },
  en: {
    Brême: "Bremen", Cologne: "Cologne", Dresde: "Dresden", Francfort: "Frankfurt",
    Fribourg: "Freiburg", Hambourg: "Hamburg", Hanovre: "Hanover", Iéna: "Jena",
    Mayence: "Mainz", Munich: "Munich", Nuremberg: "Nuremberg", Sarrebruck: "Saarbrücken",
  },
  de: {
    Brême: "Bremen", Cologne: "Köln", Dresde: "Dresden", Francfort: "Frankfurt",
    Fribourg: "Freiburg", Hambourg: "Hamburg", Hanovre: "Hannover", Iéna: "Jena",
    Mayence: "Mainz", Munich: "München", Nuremberg: "Nürnberg", Sarrebruck: "Saarbrücken",
  },
};

export function localizeProfileOptions(locale: Locale, options: readonly SelectOption[]): readonly SelectOption[] {
  return options.map((option) => ({
    ...option,
    label: optionLabels[locale][option.value] || option.label,
  }));
}

export function localizePreferredCity(locale: Locale, city: string) {
  return cityLabels[locale][city] || city;
}

const fr: ProfileCopy = {
  controls: {
    choose: "Choisir…", updateSuffix: "à mettre à jour",
    updateWarning: "Choisissez une valeur de la liste avant d’enregistrer.",
    nationalitySearch: "Rechercher une nationalité", preferredCities: "Villes préférées",
    citySearch: "Rechercher une ville en Allemagne", legacyCities: "Valeur existante à remplacer ou retirer",
    selection: "Sélection",
  },
  page: {
    badge: "Espace étudiant · Mon profil", title: "Informations du dossier",
    description: "Mettez à jour vos informations pour garder votre dossier clair.", back: "Retour à mon dossier",
    unavailableTitle: "Profil temporairement indisponible", unavailableText: "Impossible de charger votre profil pour le moment. Réessayez ou revenez à votre dossier.",
    retry: "Réessayer", landmarks: "Repères du profil", accountReady: "Votre compte est prêt. Vous pouvez modifier vos informations à tout moment.",
    profileBadge: "Profil étudiant", profileFilled: "Profil rempli", progressLabel: "Champs requis du profil complétés",
    progressBoundary: "Ce pourcentage montre les champs obligatoires remplis. Il ne prédit pas une admission.",
    whyEyebrow: "À quoi ça sert ?", whyTitle: "Garder votre dossier à jour",
    whyText: "Ces informations servent à afficher des programmes et des étapes adaptés à votre dossier.",
    checkEyebrow: "À vérifier", checkText: "Si une ancienne valeur apparaît avec “à mettre à jour”, choisissez une valeur proposée avant d’enregistrer.",
  },
  form: {
    identityBadge: "Identité", identityTitle: "Informations personnelles", identityText: "Indiquez vos informations de base.",
    studiesBadge: "Études", studiesTitle: "Mes études", studiesText: "Indiquez votre dernier diplôme et vos études actuelles.",
    languagesBadge: "Langues", languagesTitle: "Mes langues", languagesText: "Indiquez vos niveaux et certificats réels.",
    projectBadge: "Projet", projectTitle: "Mon projet en Allemagne", projectText: "Indiquez ce que vous souhaitez étudier.",
    fields: {
      first_name: "Prénom", last_name: "Nom", birth_date: "Date de naissance", nationality: "Nationalité",
      current_city: "Ville actuelle", phone: "Téléphone", last_diploma: "Dernier diplôme",
      bac_track: "Type / section du Bac tunisien", bac_year: "Année du Bac", general_average: "Moyenne générale",
      institution: "Établissement", current_university_studies: "Études universitaires actuelles", current_field: "Domaine actuel",
      university_semesters: "Nombre de semestres", german_level: "Allemand", english_level: "Anglais", french_level: "Français",
      language_certificate: "Certificat", language_certificate_other: "Autre certificat", target_degree: "Niveau visé",
      target_field: "Domaine souhaité", study_language: "Langue d’études souhaitée", target_intake: "Semestre / rentrée souhaitée",
      budget_range: "Budget indicatif",
    },
    saveHint: "Enregistrez avant de quitter la page.", saving: "Enregistrement…", save: "Enregistrer les modifications",
    saved: "Vos modifications sont enregistrées.", saveError: "Impossible d’enregistrer vos modifications pour le moment.",
    networkError: "Impossible d’enregistrer votre profil. Vérifiez votre connexion puis réessayez.",
  },
};

const ar: ProfileCopy = {
  controls: {
    choose: "اختر…", updateSuffix: "يحتاج إلى تحديث",
    updateWarning: "اختر قيمة من القائمة قبل الحفظ.",
    nationalitySearch: "ابحث عن الجنسية", preferredCities: "المدن المفضلة",
    citySearch: "ابحث عن مدينة في ألمانيا", legacyCities: "قيمة قديمة يجب استبدالها أو حذفها",
    selection: "الاختيار",
  },
  page: {
    badge: "ملفي · بياناتي", title: "معلوماتي",
    description: "حدّث معلوماتك حتى يبقى ملفك واضحاً ودقيقاً.", back: "العودة إلى ملفي",
    unavailableTitle: "بياناتك غير متاحة مؤقتاً", unavailableText: "تعذر تحميل بياناتك الآن. حاول مرة أخرى أو ارجع إلى ملفك.",
    retry: "إعادة المحاولة", landmarks: "ملخص بياناتك", accountReady: "حسابك جاهز. يمكنك تعديل معلوماتك في أي وقت.",
    profileBadge: "بيانات الطالب", profileFilled: "البيانات المكتملة", progressLabel: "الحقول الإلزامية المكتملة",
    progressBoundary: "هذه النسبة تعرض الحقول الإلزامية المكتملة فقط. ولا تتنبأ بالقبول الجامعي.",
    whyEyebrow: "لماذا نطلب هذه المعلومات؟", whyTitle: "لماذا هذه المعلومات مهمة؟",
    whyText: "تساعدنا هذه المعلومات على عرض برامج وخطوات أقرب إلى وضعك الدراسي.",
    checkEyebrow: "يرجى الانتباه", checkText: "إذا ظهرت قيمة قديمة، اختر القيمة الصحيحة من القائمة قبل الحفظ.",
  },
  form: {
    identityBadge: "البيانات", identityTitle: "المعلومات الشخصية", identityText: "أدخل معلوماتك الأساسية.",
    studiesBadge: "الدراسة", studiesTitle: "دراستي", studiesText: "أدخل آخر شهادة ودراستك الحالية.",
    languagesBadge: "اللغات", languagesTitle: "لغاتي", languagesText: "أدخل مستوياتك وشهاداتك الفعلية.",
    projectBadge: "المشروع", projectTitle: "مشروعي في ألمانيا", projectText: "حدّد ما تريد دراسته في ألمانيا.",
    fields: {
      first_name: "الاسم الأول", last_name: "اسم العائلة", birth_date: "تاريخ الميلاد", nationality: "الجنسية",
      current_city: "المدينة الحالية", phone: "رقم الهاتف", last_diploma: "آخر شهادة",
      bac_track: "شعبة البكالوريا التونسية", bac_year: "سنة البكالوريا", general_average: "المعدل العام",
      institution: "المؤسسة التعليمية", current_university_studies: "الدراسة الجامعية الحالية", current_field: "التخصص الحالي",
      university_semesters: "عدد السداسيات", german_level: "الألمانية", english_level: "الإنجليزية", french_level: "الفرنسية",
      language_certificate: "شهادة اللغة", language_certificate_other: "شهادة أخرى", target_degree: "الدرجة المستهدفة",
      target_field: "المجال المطلوب", study_language: "لغة الدراسة المطلوبة", target_intake: "موعد بدء الدراسة",
      budget_range: "الميزانية التقريبية",
    },
    saveHint: "احفظ التغييرات قبل مغادرة الصفحة.", saving: "جارٍ الحفظ…", save: "حفظ التغييرات",
    saved: "تم حفظ التغييرات.", saveError: "تعذر حفظ التغييرات الآن.",
    networkError: "تعذر حفظ بياناتك. تحقق من اتصالك وحاول مرة أخرى.",
  },
};

const en: ProfileCopy = {
  controls: {
    choose: "Choose…", updateSuffix: "needs updating",
    updateWarning: "Choose a value from the list before saving.",
    nationalitySearch: "Search nationality", preferredCities: "Preferred cities",
    citySearch: "Search for a city in Germany", legacyCities: "Existing value to replace or remove",
    selection: "Selected",
  },
  page: {
    badge: "Student space · My profile", title: "My file information",
    description: "Keep your information up to date so your file stays clear.", back: "Back to my file",
    unavailableTitle: "Your profile is temporarily unavailable", unavailableText: "We cannot load your profile right now. Try again or go back to your file.",
    retry: "Try again", landmarks: "Profile overview", accountReady: "Your account is ready. You can update your information at any time.",
    profileBadge: "Student profile", profileFilled: "Profile completed", progressLabel: "Required profile fields completed",
    progressBoundary: "This percentage only shows required fields you have completed. It does not predict admission.",
    whyEyebrow: "Why do we need this?", whyTitle: "Keep your file up to date",
    whyText: "We use this information to show programmes and steps that fit your file.",
    checkEyebrow: "Check this", checkText: "If an old value is marked as needing an update, choose a value from the list before saving.",
  },
  form: {
    identityBadge: "About you", identityTitle: "Personal details", identityText: "Add your basic information.",
    studiesBadge: "Education", studiesTitle: "My education", studiesText: "Add your latest qualification and current studies.",
    languagesBadge: "Languages", languagesTitle: "My languages", languagesText: "Add your actual language levels and certificates.",
    projectBadge: "Study plan", projectTitle: "My Germany study plan", projectText: "Add what you want to study.",
    fields: {
      first_name: "First name", last_name: "Last name", birth_date: "Date of birth", nationality: "Nationality",
      current_city: "Current city", phone: "Phone", last_diploma: "Latest qualification",
      bac_track: "Tunisian Baccalaureate track", bac_year: "Baccalaureate year", general_average: "Overall average",
      institution: "School / university", current_university_studies: "Current university studies", current_field: "Current subject",
      university_semesters: "Number of semesters", german_level: "German", english_level: "English", french_level: "French",
      language_certificate: "Certificate", language_certificate_other: "Other certificate", target_degree: "Target degree",
      target_field: "Target subject", study_language: "Preferred study language", target_intake: "Preferred intake",
      budget_range: "Estimated budget",
    },
    saveHint: "Save your changes before leaving this page.", saving: "Saving…", save: "Save changes",
    saved: "Your changes have been saved.", saveError: "We could not save your changes right now.",
    networkError: "We could not save your profile. Check your connection and try again.",
  },
};

const de: ProfileCopy = {
  controls: {
    choose: "Auswählen…", updateSuffix: "muss aktualisiert werden",
    updateWarning: "Wähle vor dem Speichern einen Wert aus der Liste.",
    nationalitySearch: "Staatsangehörigkeit suchen", preferredCities: "Bevorzugte Städte",
    citySearch: "Stadt in Deutschland suchen", legacyCities: "Vorhandenen Wert ersetzen oder entfernen",
    selection: "Auswahl",
  },
  page: {
    badge: "Studierendenbereich · Mein Profil", title: "Angaben in meiner Akte",
    description: "Halte deine Angaben aktuell, damit deine Akte übersichtlich bleibt.", back: "Zurück zu meiner Akte",
    unavailableTitle: "Dein Profil ist vorübergehend nicht verfügbar", unavailableText: "Dein Profil kann gerade nicht geladen werden. Versuche es erneut oder gehe zurück zu deiner Akte.",
    retry: "Noch einmal versuchen", landmarks: "Profilübersicht", accountReady: "Dein Konto ist eingerichtet. Du kannst deine Angaben jederzeit ändern.",
    profileBadge: "Studierendenprofil", profileFilled: "Profil ausgefüllt", progressLabel: "Ausgefüllte Pflichtfelder",
    progressBoundary: "Diese Prozentzahl zeigt nur die ausgefüllten Pflichtfelder. Sie sagt nichts über eine Zulassung aus.",
    whyEyebrow: "Wofür brauchen wir das?", whyTitle: "Akte aktuell halten",
    whyText: "Mit diesen Angaben zeigen wir dir Studiengänge und Schritte, die zu deiner Akte passen.",
    checkEyebrow: "Bitte prüfen", checkText: "Wenn ein alter Wert als aktualisierungsbedürftig markiert ist, wähle vor dem Speichern einen Wert aus der Liste.",
  },
  form: {
    identityBadge: "Persönlich", identityTitle: "Persönliche Angaben", identityText: "Trage deine wichtigsten Angaben ein.",
    studiesBadge: "Ausbildung", studiesTitle: "Meine Ausbildung", studiesText: "Trage deinen letzten Abschluss und dein aktuelles Studium ein.",
    languagesBadge: "Sprachen", languagesTitle: "Meine Sprachen", languagesText: "Trage deine tatsächlichen Niveaus und Zertifikate ein.",
    projectBadge: "Studienplan", projectTitle: "Mein Studienplan für Deutschland", projectText: "Trage ein, was du studieren möchtest.",
    fields: {
      first_name: "Vorname", last_name: "Nachname", birth_date: "Geburtsdatum", nationality: "Staatsangehörigkeit",
      current_city: "Aktueller Wohnort", phone: "Telefon", last_diploma: "Letzter Abschluss",
      bac_track: "Fachrichtung des tunesischen Baccalauréat", bac_year: "Jahr des Baccalauréat", general_average: "Gesamtnote",
      institution: "Schule / Hochschule", current_university_studies: "Aktuelles Hochschulstudium", current_field: "Aktuelles Fach",
      university_semesters: "Anzahl der Semester", german_level: "Deutsch", english_level: "Englisch", french_level: "Französisch",
      language_certificate: "Zertifikat", language_certificate_other: "Anderes Zertifikat", target_degree: "Gewünschter Abschluss",
      target_field: "Gewünschtes Fach", study_language: "Gewünschte Studiensprache", target_intake: "Gewünschter Studienstart",
      budget_range: "Ungefähres Budget",
    },
    saveHint: "Speichere deine Änderungen, bevor du die Seite verlässt.", saving: "Wird gespeichert…", save: "Änderungen speichern",
    saved: "Deine Änderungen wurden gespeichert.", saveError: "Deine Änderungen konnten gerade nicht gespeichert werden.",
    networkError: "Dein Profil konnte nicht gespeichert werden. Prüfe deine Verbindung und versuche es erneut.",
  },
};

export const studentProfileCopy: Record<Locale, ProfileCopy> = { fr, ar, en, de };
