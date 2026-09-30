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
  intro: "Comparez uniquement les versions réellement publiées par l’équipe AlmaGo.",
  lockedTitle: "Les offres seront disponibles après qualification",
  lockedBody: "Votre projet doit d’abord atteindre l’étape de qualification humaine avant de pouvoir comparer les offres d’accompagnement.",
  emptyTitle: "Aucune offre n’est publiée pour le moment",
  emptyBody: "L’équipe prépare encore le contenu commercial. Aucun prix ni service n’est inventé ou affiché avant publication.",
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
  intro: "قارن فقط العروض التي نشرتها AlmaGo فعليًا.",
  lockedTitle: "ستظهر العروض بعد تأهيل المشروع",
  lockedBody: "يجب أولًا أن يصل مشروعك إلى مرحلة التأهيل البشري قبل مقارنة عروض المرافقة.",
  emptyTitle: "لا يوجد عرض منشور حاليًا",
  emptyBody: "ما زال الفريق يجهز المحتوى التجاري. لا يتم اختراع أو عرض أي سعر أو خدمة قبل النشر.",
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
  intro: "Compare only offer versions that AlmaGo has actually published.",
  lockedTitle: "Offers become available after qualification",
  lockedBody: "Your project must first reach the human qualification stage before you can compare support offers.",
  emptyTitle: "No offer is published yet",
  emptyBody: "The team is still preparing the commercial content. No price or service is invented or displayed before publication.",
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
  intro: "Vergleiche nur Angebotsversionen, die AlmaGo tatsächlich veröffentlicht hat.",
  lockedTitle: "Angebote werden nach der Qualifikation verfügbar",
  lockedBody: "Dein Projekt muss zuerst die menschliche Qualifikationsstufe erreichen, bevor du Begleitangebote vergleichen kannst.",
  emptyTitle: "Noch kein Angebot veröffentlicht",
  emptyBody: "Das Team bereitet die kommerziellen Inhalte noch vor. Vor der Veröffentlichung werden keine Preise oder Leistungen erfunden oder angezeigt.",
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
