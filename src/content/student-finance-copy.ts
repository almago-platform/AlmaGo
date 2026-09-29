import type { Locale } from "@/lib/i18n";
import type { FinanceInsuranceKind } from "@/lib/finance-insurance";

type FinanceCopy = {
  title: string;
  description: string;
  back: string;
  guidance: {
    eyebrow: string;
    title: string;
    description: string;
    points: readonly [string, string, string];
  };
  kinds: Record<FinanceInsuranceKind, { title: string; description: string }>;
  emptyBadge: string;
  emptyText: string;
  boundary: string;
  verified: string;
  officialSource: string;
  providerSite: string;
  facts: {
    price: string;
    eligibility: string;
    verifiedAt: string;
    revalidateBefore: string;
  };
  unknownOfficial: string;
  unknownProvider: string;
  unknown: string;
  unavailableDescription: string;
  unavailableTitle: string;
  unavailableText: string;
  retry: string;
  intlLocale: string;
};

export const studentFinanceCopy: Record<Locale, FinanceCopy> = {
  fr: {
    title: "Financement et assurance",
    description: "Comparez des options dont la source et la date de vérification sont visibles. AlmaGo ne classe pas les fournisseurs et ne déduit ni votre éligibilité ni une exigence de visa.",
    back: "Retour à mon parcours",
    guidance: {
      eyebrow: "Avant toute démarche ou paiement",
      title: "Vérifiez la source officielle avant de choisir.",
      description: "Les prix et les conditions peuvent changer. Vérifiez toujours la source officielle avant de choisir.",
      points: ["Regarder la date de vérification.", "Lire les conditions du fournisseur.", "Vérifier les exigences auprès de l’autorité compétente."],
    },
    kinds: {
      blocked_account_provider: { title: "Compte bloqué", description: "Comparez les offres et vérifiez les conditions sur la source officielle." },
      health_insurance_provider: { title: "Assurance santé", description: "Comparez les offres et vérifiez les conditions auprès de l’assureur." },
      student_financing_option: { title: "Financement étudiant", description: "Comparez les solutions et vérifiez qui peut en bénéficier." },
    },
    emptyBadge: "Aucune option publiée",
    emptyText: "Aucune option vérifiée n’est disponible dans cette catégorie pour le moment.",
    boundary: "Les fournisseurs fixent leurs conditions. Les autorités décident des exigences de visa, de séjour et d’assurance.",
    verified: "Source vérifiée",
    officialSource: "Source officielle",
    providerSite: "Site du fournisseur",
    facts: { price: "Prix / frais", eligibility: "Conditions publiées", verifiedAt: "Dernière vérification", revalidateBefore: "À revalider avant" },
    unknownOfficial: "À confirmer sur la source officielle",
    unknownProvider: "À confirmer auprès du fournisseur",
    unknown: "À confirmer",
    unavailableDescription: "Les options vérifiées sont temporairement indisponibles.",
    unavailableTitle: "Catalogue temporairement indisponible",
    unavailableText: "Impossible de charger les options vérifiées pour le moment. Réessayez.",
    retry: "Réessayer",
    intlLocale: "fr-FR",
  },
  ar: {
    title: "التمويل والتأمين",
    description: "قارن الخيارات والمصادر وتاريخ آخر تحقق. AlmaGo لا يرتّب مقدمي الخدمات ولا يقرر أهليتك أو متطلبات التأشيرة.",
    back: "العودة إلى مساري",
    guidance: {
      eyebrow: "قبل أي إجراء أو دفع",
      title: "تحقق من المصدر الرسمي قبل الاختيار.",
      description: "الأسعار والشروط قد تتغير. راجع دائمًا المصدر الرسمي قبل اتخاذ القرار.",
      points: ["راجع تاريخ آخر تحقق.", "اقرأ شروط مقدم الخدمة.", "تحقق من المتطلبات لدى الجهة المختصة."],
    },
    kinds: {
      blocked_account_provider: { title: "الحساب المغلق", description: "قارن العروض وتحقق من الشروط في المصدر الرسمي." },
      health_insurance_provider: { title: "التأمين الصحي", description: "قارن العروض وتحقق من الشروط مباشرة لدى شركة التأمين." },
      student_financing_option: { title: "خيارات تمويل للطلاب", description: "قارن الحلول وراجع شروط الاستفادة من كل خيار." },
    },
    emptyBadge: "لا توجد خيارات منشورة",
    emptyText: "لا يوجد حاليًا خيار تم التحقق منه في هذه الفئة.",
    boundary: "يحدد كل مقدم خدمة شروطه الخاصة، وتحدد الجهات المختصة متطلبات التأشيرة والإقامة والتأمين.",
    verified: "تم التحقق من المصدر",
    officialSource: "المصدر الرسمي",
    providerSite: "موقع مقدم الخدمة",
    facts: { price: "السعر / الرسوم", eligibility: "الشروط المنشورة", verifiedAt: "آخر تحقق", revalidateBefore: "يجب إعادة التحقق قبل" },
    unknownOfficial: "تحقق من المصدر الرسمي",
    unknownProvider: "تحقق لدى مقدم الخدمة",
    unknown: "يحتاج إلى تأكيد",
    unavailableDescription: "الخيارات التي تم التحقق منها غير متاحة مؤقتًا.",
    unavailableTitle: "قائمة الخيارات غير متاحة مؤقتًا",
    unavailableText: "تعذر تحميل الخيارات التي تم التحقق منها الآن. حاول مرة أخرى.",
    retry: "إعادة المحاولة",
    intlLocale: "ar-TN",
  },
  en: {
    title: "Funding and insurance",
    description: "Compare options with a visible source and review date. AlmaGo does not rank providers or infer your eligibility or visa requirements.",
    back: "Back to my journey",
    guidance: {
      eyebrow: "Before taking action or paying",
      title: "Check the official source before you choose.",
      description: "Prices and conditions can change. Always confirm them on the official source before choosing.",
      points: ["Check the review date.", "Read the provider’s conditions.", "Confirm requirements with the responsible authority."],
    },
    kinds: {
      blocked_account_provider: { title: "Blocked account", description: "Compare offers and confirm the conditions on the official source." },
      health_insurance_provider: { title: "Health insurance", description: "Compare offers and confirm the conditions with the insurer." },
      student_financing_option: { title: "Student funding", description: "Compare funding options and check who can use them." },
    },
    emptyBadge: "No published option",
    emptyText: "There is currently no verified option in this category.",
    boundary: "Providers set their own conditions. Public authorities decide visa, residence and insurance requirements.",
    verified: "Source checked",
    officialSource: "Official source",
    providerSite: "Provider website",
    facts: { price: "Price / fees", eligibility: "Published conditions", verifiedAt: "Last checked", revalidateBefore: "Recheck before" },
    unknownOfficial: "Confirm on the official source",
    unknownProvider: "Confirm with the provider",
    unknown: "To be confirmed",
    unavailableDescription: "Verified options are temporarily unavailable.",
    unavailableTitle: "Catalogue temporarily unavailable",
    unavailableText: "We cannot load the verified options right now. Please try again.",
    retry: "Try again",
    intlLocale: "en-GB",
  },
  de: {
    title: "Finanzierung und Versicherung",
    description: "Vergleiche Optionen mit sichtbarer Quelle und Prüfdatum. AlmaGo bewertet Anbieter nicht und leitet weder deine Berechtigung noch Visumvorgaben ab.",
    back: "Zurück zu meinem Studienweg",
    guidance: {
      eyebrow: "Vor jedem Schritt oder jeder Zahlung",
      title: "Prüfe die offizielle Quelle, bevor du dich entscheidest.",
      description: "Preise und Bedingungen können sich ändern. Prüfe sie vor deiner Entscheidung immer in der offiziellen Quelle.",
      points: ["Prüfdatum ansehen.", "Bedingungen des Anbieters lesen.", "Anforderungen bei der zuständigen Stelle prüfen."],
    },
    kinds: {
      blocked_account_provider: { title: "Sperrkonto", description: "Vergleiche Angebote und prüfe die Bedingungen in der offiziellen Quelle." },
      health_insurance_provider: { title: "Krankenversicherung", description: "Vergleiche Angebote und prüfe die Bedingungen direkt beim Versicherer." },
      student_financing_option: { title: "Studienfinanzierung", description: "Vergleiche Möglichkeiten und prüfe, wer sie nutzen kann." },
    },
    emptyBadge: "Keine veröffentlichte Option",
    emptyText: "In dieser Kategorie ist derzeit keine geprüfte Option verfügbar.",
    boundary: "Anbieter legen ihre Bedingungen fest. Die zuständigen Behörden entscheiden über Vorgaben zu Visum, Aufenthalt und Versicherung.",
    verified: "Quelle geprüft",
    officialSource: "Offizielle Quelle",
    providerSite: "Website des Anbieters",
    facts: { price: "Preis / Gebühren", eligibility: "Veröffentlichte Bedingungen", verifiedAt: "Zuletzt geprüft", revalidateBefore: "Erneut prüfen vor" },
    unknownOfficial: "In der offiziellen Quelle prüfen",
    unknownProvider: "Beim Anbieter prüfen",
    unknown: "Noch zu bestätigen",
    unavailableDescription: "Geprüfte Optionen sind vorübergehend nicht verfügbar.",
    unavailableTitle: "Katalog vorübergehend nicht verfügbar",
    unavailableText: "Die geprüften Optionen können gerade nicht geladen werden. Bitte versuche es erneut.",
    retry: "Noch einmal versuchen",
    intlLocale: "de-DE",
  },
};
