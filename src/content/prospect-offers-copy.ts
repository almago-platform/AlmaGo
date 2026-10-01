import type { Locale } from "@/lib/i18n";

export type ProspectOffersCopy = {
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  lockedTitle: string;
  lockedBody: string;
  emptyTitle: string;
  emptyBody: string;
  backToSpace: string;
  services: string;
  price: string;
  select: string;
  selected: string;
  selectionNote: string;
  disclaimer: string;
};

const fr: ProspectOffersCopy = {
  nav: "Mes offres",
  eyebrow: "Accompagnement",
  title: "Choisir une offre",
  intro: "Retrouvez ici les offres disponibles pour votre projet.",
  lockedTitle: "Vos offres seront disponibles après vérification de votre projet",
  lockedBody: "Notre équipe doit d’abord vérifier votre projet. Revenez ensuite ici pour consulter les offres disponibles.",
  emptyTitle: "Les offres sont en préparation",
  emptyBody: "Dès qu’une offre sera publiée, elle apparaîtra ici avec les services inclus et le prix.",
  backToSpace: "Retour à mon espace",
  services: "Services inclus",
  price: "Prix publié",
  select: "Sélectionner cette offre",
  selected: "Offre sélectionnée",
  selectionNote: "Cette sélection prépare seulement l’étape suivante. Elle ne déclenche ni paiement ni accès client.",
  disclaimer: "Aucune offre AlmaGo ne garantit une admission universitaire ou un visa.",
};

const ar: ProspectOffersCopy = {
  nav: "عروضي",
  eyebrow: "المرافقة",
  title: "اختيار عرض",
  intro: "ستجد هنا العروض المتاحة لمشروعك.",
  lockedTitle: "ستظهر عروضك بعد مراجعة مشروعك",
  lockedBody: "يجب أن يراجع فريقنا مشروعك أولًا. بعد ذلك يمكنك العودة إلى هنا للاطلاع على العروض المتاحة.",
  emptyTitle: "العروض قيد الإعداد",
  emptyBody: "عند نشر عرض، سيظهر هنا مع الخدمات المشمولة والسعر.",
  backToSpace: "العودة إلى مساحتي",
  services: "الخدمات المشمولة",
  price: "السعر المنشور",
  select: "اختيار هذا العرض",
  selected: "تم اختيار العرض",
  selectionNote: "هذا الاختيار يجهز الخطوة التالية فقط، ولا يبدأ الدفع ولا يفتح مساحة العميل.",
  disclaimer: "لا يضمن أي عرض من AlmaGo القبول الجامعي أو التأشيرة.",
};

const en: ProspectOffersCopy = {
  nav: "My offers",
  eyebrow: "Support",
  title: "Choose an offer",
  intro: "Find the offers available for your project here.",
  lockedTitle: "Your offers will appear after your project is reviewed",
  lockedBody: "Our team first needs to review your project. You can then return here to see the available offers.",
  emptyTitle: "Offers are being prepared",
  emptyBody: "When an offer is published, it will appear here with the included services and price.",
  backToSpace: "Back to my space",
  services: "Included services",
  price: "Published price",
  select: "Select this offer",
  selected: "Offer selected",
  selectionNote: "This selection only prepares the next step. It does not start a payment or unlock client access.",
  disclaimer: "No AlmaGo offer guarantees university admission or a visa.",
};

const de: ProspectOffersCopy = {
  nav: "Meine Angebote",
  eyebrow: "Begleitung",
  title: "Angebot auswählen",
  intro: "Hier findest du die Angebote, die für dein Projekt verfügbar sind.",
  lockedTitle: "Deine Angebote erscheinen nach der Prüfung deines Projekts",
  lockedBody: "Unser Team prüft zuerst dein Projekt. Danach kannst du hier die verfügbaren Angebote ansehen.",
  emptyTitle: "Die Angebote werden vorbereitet",
  emptyBody: "Sobald ein Angebot veröffentlicht ist, erscheint es hier mit den enthaltenen Leistungen und dem Preis.",
  backToSpace: "Zurück zu meinem Bereich",
  services: "Enthaltene Leistungen",
  price: "Veröffentlichter Preis",
  select: "Dieses Angebot auswählen",
  selected: "Angebot ausgewählt",
  selectionNote: "Diese Auswahl bereitet nur den nächsten Schritt vor. Sie startet keine Zahlung und schaltet keinen Kundenzugang frei.",
  disclaimer: "Kein AlmaGo-Angebot garantiert eine Hochschulzulassung oder ein Visum.",
};

export const prospectOffersCopy: Record<Locale, ProspectOffersCopy> = {
  fr,
  ar,
  en,
  de,
};
