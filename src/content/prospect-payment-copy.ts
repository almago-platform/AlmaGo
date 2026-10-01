import type { Locale } from "@/lib/i18n";

export type ProspectPaymentCopy = {
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  noneTitle: string;
  noneText: string;
  offersCta: string;
  amount: string;
  status: string;
  created: string;
  lastEvent: string;
  noEvent: string;
  disclaimer: string;
  statuses: {
    payment_pending: string;
    paid_pending_validation: string;
    client_active: string;
    cancelled: string;
    refunded: string;
  };
};

const fr: ProspectPaymentCopy = {
  nav: "Mon paiement",
  eyebrow: "Paiement",
  title: "Suivre mon paiement",
  intro: "Consultez ici l’état enregistré côté serveur. Un retour navigateur ne peut jamais activer votre espace client.",
  noneTitle: "Aucun paiement en cours",
  noneText: "Lorsque le paiement sera disponible et que vous commencerez un achat, son état apparaîtra ici.",
  offersCta: "Voir mes offres",
  amount: "Montant de l’offre",
  status: "État",
  created: "Achat créé le",
  lastEvent: "Dernier événement enregistré",
  noEvent: "Aucune transaction enregistrée",
  disclaimer: "Un paiement confirmé peut nécessiter une validation interne avant l’activation de l’espace client.",
  statuses: {
    payment_pending: "Paiement en attente",
    paid_pending_validation: "Paiement reçu · validation en cours",
    client_active: "Client actif",
    cancelled: "Paiement annulé",
    refunded: "Paiement remboursé",
  },
};

const ar: ProspectPaymentCopy = {
  nav: "دفعي",
  eyebrow: "الدفع",
  title: "متابعة حالة الدفع",
  intro: "يمكنك هنا رؤية الحالة المسجلة على الخادم. الرجوع من صفحة الدفع لا يفتح مساحة العميل تلقائيًا.",
  noneTitle: "لا توجد عملية دفع حالية",
  noneText: "عندما يصبح الدفع متاحًا وتبدأ عملية شراء، ستظهر حالتها هنا.",
  offersCta: "عرض العروض",
  amount: "قيمة العرض",
  status: "الحالة",
  created: "تم إنشاء عملية الشراء في",
  lastEvent: "آخر حدث مسجل",
  noEvent: "لا توجد معاملة مسجلة",
  disclaimer: "قد يحتاج الدفع المؤكد إلى مراجعة داخلية قبل تفعيل مساحة العميل.",
  statuses: {
    payment_pending: "الدفع في الانتظار",
    paid_pending_validation: "تم استلام الدفع · المراجعة جارية",
    client_active: "تم تفعيل العميل",
    cancelled: "تم إلغاء الدفع",
    refunded: "تم رد المبلغ",
  },
};

const en: ProspectPaymentCopy = {
  nav: "My payment",
  eyebrow: "Payment",
  title: "Track my payment",
  intro: "See the server-recorded status here. Returning from a payment page can never unlock client access by itself.",
  noneTitle: "No payment in progress",
  noneText: "When payment becomes available and you start a purchase, its status will appear here.",
  offersCta: "View my offers",
  amount: "Offer amount",
  status: "Status",
  created: "Purchase created on",
  lastEvent: "Latest recorded event",
  noEvent: "No transaction recorded",
  disclaimer: "A confirmed payment may still require internal validation before client access is activated.",
  statuses: {
    payment_pending: "Payment pending",
    paid_pending_validation: "Payment received · validation pending",
    client_active: "Client active",
    cancelled: "Payment cancelled",
    refunded: "Payment refunded",
  },
};

const de: ProspectPaymentCopy = {
  nav: "Meine Zahlung",
  eyebrow: "Zahlung",
  title: "Zahlung verfolgen",
  intro: "Hier siehst du den serverseitig gespeicherten Status. Eine Rückkehr von einer Zahlungsseite schaltet den Kundenzugang niemals selbst frei.",
  noneTitle: "Keine laufende Zahlung",
  noneText: "Sobald Zahlungen verfügbar sind und du einen Kauf startest, erscheint der Status hier.",
  offersCta: "Meine Angebote ansehen",
  amount: "Angebotsbetrag",
  status: "Status",
  created: "Kauf erstellt am",
  lastEvent: "Letztes gespeichertes Ereignis",
  noEvent: "Keine Transaktion gespeichert",
  disclaimer: "Eine bestätigte Zahlung kann vor der Freischaltung des Kundenzugangs noch intern geprüft werden.",
  statuses: {
    payment_pending: "Zahlung ausstehend",
    paid_pending_validation: "Zahlung erhalten · Prüfung läuft",
    client_active: "Kundenzugang aktiv",
    cancelled: "Zahlung storniert",
    refunded: "Zahlung erstattet",
  },
};

export const prospectPaymentCopy: Record<Locale, ProspectPaymentCopy> = {
  fr,
  ar,
  en,
  de,
};
