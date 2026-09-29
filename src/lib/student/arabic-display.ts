import type { Locale } from "@/lib/i18n";

const applicationStoredTextAr: Record<string, string> = {
  "Préparer les prochaines étapes avant l’échéance enregistrée.": "حضّر الخطوات التالية قبل الموعد النهائي المسجل.",
  "Confirmer l’échéance officielle puis préparer les prochaines étapes.": "تحقق من الموعد النهائي الرسمي، ثم حضّر الخطوات التالية.",
  "Admission reçue": "تم استلام القبول",
  "Décision de candidature": "قرار بشأن طلب التقديم",
  "Candidature envoyée": "تم إرسال طلب التقديم",
  "Réponse de l’université attendue": "في انتظار رد الجامعة",
  "Candidature mise à jour": "تم تحديث طلب التقديم",
};

const applicationStatusAr: Record<string, string> = {
  interested: "مهتم",
  preparing: "قيد التحضير",
  documents_missing: "مستندات ناقصة",
  ready_to_submit: "جاهز للإرسال",
  submitted: "تم الإرسال",
  waiting_university: "في انتظار الجامعة",
  admission: "قبول",
  rejection: "رفض",
  withdrawn: "تم السحب",
};

export function localizeApplicationStoredText(locale: Locale, value: string | null | undefined) {
  if (!value || locale !== "ar") return value || "";
  const exact = applicationStoredTextAr[value];
  if (exact) return exact;
  const statusEvent = value.match(/^(.+?)\s*:\s*([a-z_]+)$/);
  if (statusEvent && applicationStoredTextAr[statusEvent[1]]) {
    const status = applicationStatusAr[statusEvent[2]] || `\u2066${statusEvent[2]}\u2069`;
    return `${applicationStoredTextAr[statusEvent[1]]}: ${status}`;
  }
  return value;
}

const catalogueLabelAr: Record<string, string> = {
  Bachelor: "بكالوريوس",
  Master: "ماجستير",
  "Computer Science": "علوم الحاسوب",
  "Computer Engineering": "هندسة الحاسوب",
  English: "الإنجليزية",
  German: "الألمانية",
  Deutsch: "الألمانية",
  "Predominantly English": "الإنجليزية أساسًا",
  "Blocked Account": "الحساب المغلق",
  "Student health insurance": "التأمين الصحي للطلاب",
  "Student health insurance / international students": "التأمين الصحي للطلاب الدوليين",
};
export function localizeCatalogueLabel(locale: Locale, value: string | null | undefined) {
  if (!value || locale !== "ar") return value || "";
  const exact = catalogueLabelAr[value];
  if (exact) return exact;
  if (/^Winter\b/.test(value)) return value.replace(/^Winter\b/, "شتاء");
  if (/^Summer\b/.test(value)) return value.replace(/^Summer\b/, "صيف");
  return value;
}

const programRequirementAr: Record<string, string> = {
  "Premier diplôme universitaire reconnu avec une formation académique dans un domaine lié au programme.": "شهادة جامعية أولى معترف بها وخلفية أكاديمية مرتبطة بالبرنامج.",
  "Premier diplôme universitaire pertinent donnant accès au programme, avec les justificatifs demandés pour la candidature.": "شهادة جامعية أولى مناسبة للبرنامج مع إثباتات التقديم المطلوبة.",
  "Diplôme donnant un accès direct aux études de Bachelor en Allemagne, avec les justificatifs de sélection demandés par le programme.": "شهادة تتيح الدخول المباشر إلى دراسة البكالوريوس في ألمانيا، مع إثباتات الاختيار التي يطلبها البرنامج.",
  "Premier diplôme qualifiant professionnellement en informatique ou dans un domaine très proche.": "شهادة جامعية أولى مؤهلة مهنيًا في علوم الحاسوب أو مجال قريب جدًا.",
  "Diplôme donnant accès à l’enseignement supérieur ; les diplômes étrangers sont évalués selon la procédure de la TUM.": "شهادة تتيح الالتحاق بالتعليم العالي؛ وتُقيّم الشهادات الأجنبية وفق إجراءات TUM.",
  "Diplôme de Bachelor pertinent, évalué dans la procédure d’aptitude de la TUM.": "شهادة بكالوريوس مناسبة تُقيّم ضمن إجراءات الأهلية في TUM.",
  "Recognized first university degree with subject-specific academic background": "شهادة جامعية أولى معترف بها وخلفية أكاديمية مرتبطة بالبرنامج.",
  "Relevant qualifying first university degree and programme-specific application evidence": "شهادة جامعية أولى مناسبة للبرنامج مع إثباتات التقديم المطلوبة.",
  "University entrance qualification allowing direct access to undergraduate study in Germany plus programme-specific selection evidence": "شهادة تتيح الدخول المباشر إلى دراسة البكالوريوس في ألمانيا، مع إثباتات الاختيار التي يطلبها البرنامج.",
  "First professionally qualifying degree in computer science or a closely related programme": "شهادة جامعية أولى مؤهلة مهنيًا في علوم الحاسوب أو مجال قريب جدًا.",
  "Higher education entrance qualification; international qualifications are assessed under the applicable TUM procedure": "شهادة تتيح الالتحاق بالتعليم العالي؛ وتُقيّم الشهادات الأجنبية وفق إجراءات TUM.",
  "Relevant undergraduate degree assessed through the TUM aptitude assessment": "شهادة بكالوريوس مناسبة تُقيّم ضمن إجراءات الأهلية في TUM.",
};
export function localizeProgramRequirement(locale: Locale, value: string | null | undefined) {
  if (!value || locale !== "ar") return value || "";
  return programRequirementAr[value] || value;
}

type FinanceField = "description" | "price" | "eligibility";
const financeAr: Record<string, Record<FinanceField, string>> = {
  AOK: {
    description: "معلومات عن التأمين الصحي الحكومي الألماني للطلاب الدوليين، بما في ذلك إثبات التأمين الإلكتروني الذي تطلبه الجامعة.",
    price: "تختلف المساهمة حسب فرع AOK ووضعك. تحقق من المبلغ الحالي على الموقع الرسمي.",
    eligibility: "لدى تونس اتفاقية ضمان اجتماعي مع ألمانيا. اطلب الوثيقة المطلوبة من جهة التأمين في تونس، ثم تحقق من وضعك لدى شركة تأمين صحي حكومية في ألمانيا.",
  },
  Expatrio: {
    description: "خدمة رقمية للحساب المغلق لإجراءات التأشيرة والإقامة في ألمانيا. راجع الصفحة الرسمية لرسوم الفتح والإدارة.",
    price: "تم التحقق في 26 سبتمبر 2026: 119 EUR رسوم فتح و9 EUR شهريًا. المبلغ المغلق يبقى مالك، وهذه الرسوم تضاف إليه.",
    eligibility: "تحقق لدى الجهة المختصة من المبلغ المطلوب وما إذا كان الحساب المغلق مناسبًا لحالتك.",
  },
  Fintiba: {
    description: "خدمة رقمية للحساب المغلق لإثبات التمويل. يُفتح الحساب باسمك وتصدر وثيقة الحجز بعد إيداع الأموال.",
    price: "تم التحقق في 26 سبتمبر 2026: 159 EUR رسوم فتح، ثم 9.90 EUR شهريًا. المبلغ المغلق منفصل عن الرسوم وتحدده الجهة المختصة.",
    eligibility: "الحساب المغلق طريقة واحدة فقط لإثبات التمويل. تحقق من المبلغ والإثبات المقبول لدى البعثة الألمانية أو الجهة المختصة.",
  },
  KfW: {
    description: "قرض لتكاليف المعيشة خلال بعض برامج الدراسة أو الدكتوراه في مؤسسة معترف بها في ألمانيا.",
    price: "تنشر KfW دفعات شهرية من 100 إلى 650 EUR. سعر الفائدة متغير وقد يتغير كل ستة أشهر. تحقق من السعر الحالي قبل التقديم.",
    eligibility: "يمكن فقط للفئات التي تحددها KfW التقديم لهذا القرض. الطالب الدولي من خارج الاتحاد الأوروبي لا يحق له الحصول عليه تلقائيًا.",
  },
  "Techniker Krankenkasse (TK)": {
    description: "تأمين صحي حكومي ألماني للطلاب. تطلب الجامعة عادةً إثبات التأمين إلكترونيًا.",
    price: "يعتمد مبلغ 2026 على عوامل منها العمر ووجود أطفال. تحقق من المبلغ الحالي الكامل قبل الاشتراك.",
    eligibility: "يعتمد الاستفادة من تعرفة الطلاب على التسجيل ووضع التأمين. دورة لغة أو Studienkolleg أو بعض برامج التحضير لا تمنح هذه التعرفة تلقائيًا.",
  },
};
export function localizeFinanceCatalogueField(locale: Locale, provider: string, field: FinanceField, value: string | null | undefined) {
  if (!value || locale !== "ar") return value || "";
  return financeAr[provider]?.[field] || value;
}

const regulatorySummaryAr: Record<string, string> = {
  standalone_language_tunisia: "لدورة ألمانية من دون دراسة جامعية مخططة، تطلب صفحة السفارة في تونس دورة لا تقل عن 18 ساعة أسبوعيًا، وإثبات التمويل والتأمين الصحي. هذا المسار منفصل عن الدراسة الجامعية.",
  study_preparation_tunisia: "للتحضير للدراسة، تطلب قائمة السفارة في تونس دورة لا تقل عن 20 ساعة أسبوعيًا، ومستوى \u2066A2\u2069 على الأقل لدى جهة معتمدة من \u2066ALTE\u2069، وأساسًا أكاديميًا مثل قبول مشروط أو \u2066Bewerberbestätigung\u2069، إضافة إلى إثبات التمويل والتأمين الصحي.",
  study_visa: "لتأشيرة الدراسة، تطلب المعلومات الاتحادية قبولًا جامعيًا وإثبات تمويل. وقد يكون البحث عن مقعد دراسي ممكنًا في بعض الحالات قبل اختيار الجامعة نهائيًا.",
  study_place_search: "توضح المعلومات الاتحادية أنه يمكن في حالات كثيرة طلب تأشيرة للبحث عن مقعد دراسي قبل اختيار الجامعة نهائيًا.",
  study_visa_financing: "تذكر المعلومات الاتحادية عدة طرق لإثبات التمويل، منها موارد الوالدين، أو تعهد بالتكفل، أو حساب مغلق، أو ضمان مصرفي ألماني، أو بعض المنح.",
  university_admission: "تشرح \u2066uni-assist\u2069 كيفية التحقق من الشروط الدراسية ومعايير كل جامعة للبكالوريوس أو الماجستير أو \u2066Studienkolleg\u2069 أو التحضير اللغوي.",
};
export function localizeRegulatorySummary(locale: Locale, topic: string, value: string | null | undefined) {
  if (!value || locale !== "ar") return value || "";
  return regulatorySummaryAr[topic] || value;
}
