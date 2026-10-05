import type { Locale } from "@/lib/i18n";

export type ProspectPaymentCopy = {
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  noneTitle: string;
  noneText: string;
  offersCta: string;
  proposalCta: string;
  studentCta: string;
  amount: string;
  status: string;
  created: string;
  lastEvent: string;
  noEvent: string;
  disclaimer: string;
  progression: string;
  stages: {
    proposal: string;
    payment: string;
    validation: string;
    student: string;
    done: string;
    current: string;
    later: string;
    locked: string;
  };
  nextAction: string;
  pendingTitle: string;
  pendingText: string;
  validatingTitle: string;
  validatingText: string;
  activeTitle: string;
  activeText: string;
  cancelledTitle: string;
  cancelledText: string;
  refundedTitle: string;
  refundedText: string;
  unavailableTitle: string;
  unavailableText: string;
  responsibility: {
    you: string;
    campus: string;
    access: string;
    pendingYou: string;
    pendingCampus: string;
    validatingYou: string;
    validatingCampus: string;
    activeYou: string;
    activeCampus: string;
    accessLocked: string;
    accessActive: string;
  };
  history: string;
  historyHint: string;
  attemptLabel: string;
  transactionLabel: string;
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
  intro: "Cette page affiche uniquement l’état enregistré côté serveur. L’espace Étudiant ne peut être activé qu’après confirmation du paiement puis validation Campus Allemagne.",
  noneTitle: "Aucun paiement en cours",
  noneText: "Votre paiement apparaîtra ici après acceptation d’une proposition Campus Allemagne.",
  offersCta: "Voir les offres",
  proposalCta: "Revenir à ma proposition",
  studentCta: "Ouvrir mon espace Étudiant",
  amount: "Montant de l’offre",
  status: "État du paiement",
  created: "Achat créé le",
  lastEvent: "Dernier événement enregistré",
  noEvent: "Aucune transaction enregistrée",
  disclaimer: "Un retour navigateur, un écran de succès ou un message externe ne peut jamais activer votre espace Étudiant à lui seul.",
  progression: "Progression du paiement",
  stages: {
    proposal: "Proposition",
    payment: "Paiement",
    validation: "Validation Campus",
    student: "Étudiant",
    done: "Terminé",
    current: "En cours",
    later: "À venir",
    locked: "Verrouillé",
  },
  nextAction: "Prochaine étape",
  pendingTitle: "Paiement en attente",
  pendingText: "Le paiement n’est pas encore confirmé dans AlmaGo. Votre espace Étudiant reste verrouillé.",
  validatingTitle: "Paiement reçu · validation Campus en cours",
  validatingText: "Le paiement est enregistré. Campus Allemagne effectue la vérification finale avant l’activation de l’espace Étudiant.",
  activeTitle: "Votre espace Étudiant est activé",
  activeText: "Le paiement et la validation Campus sont terminés. Vous pouvez poursuivre dans votre espace Étudiant.",
  cancelledTitle: "Paiement annulé",
  cancelledText: "Aucune activation Étudiant n’a lieu sur cet achat. Revenez à votre proposition pour vérifier la suite.",
  refundedTitle: "Paiement remboursé",
  refundedText: "L’achat a été remboursé. L’accès Étudiant lié à ce paiement n’est pas considéré comme actif.",
  unavailableTitle: "Paiement temporairement indisponible",
  unavailableText: "L’orchestration de paiement n’est pas active actuellement. Aucun paiement ni activation ne peut être déclenché depuis cette page.",
  responsibility: {
    you: "Vous",
    campus: "Campus Allemagne",
    access: "Accès Étudiant",
    pendingYou: "Attendre les modalités de paiement communiquées par Campus Allemagne.",
    pendingCampus: "Enregistrer et vérifier la réception du paiement.",
    validatingYou: "Aucune action requise pour le moment.",
    validatingCampus: "Effectuer la validation interne finale du paiement.",
    activeYou: "Poursuivre votre dossier dans l’espace Étudiant.",
    activeCampus: "Continuer l’accompagnement selon la proposition validée.",
    accessLocked: "Verrouillé jusqu’au paiement puis à la validation Campus.",
    accessActive: "Activé.",
  },
  history: "Historique du paiement",
  historyHint: "Les événements ci-dessous sont issus des enregistrements serveur ; aucun statut n’est déduit du navigateur.",
  attemptLabel: "Tentative de paiement",
  transactionLabel: "Transaction",
  statuses: {
    payment_pending: "Paiement en attente",
    paid_pending_validation: "Paiement reçu · validation en cours",
    client_active: "Espace Étudiant activé",
    cancelled: "Paiement annulé",
    refunded: "Paiement remboursé",
  },
};

const ar: ProspectPaymentCopy = {
  nav: "دفعي",
  eyebrow: "الدفع",
  title: "متابعة حالة الدفع",
  intro: "تعرض هذه الصفحة فقط الحالة المسجلة على الخادم. لا يتم تفعيل مساحة الطالب إلا بعد تأكيد الدفع ثم التحقق من Campus Allemagne.",
  noneTitle: "لا توجد عملية دفع حالية",
  noneText: "ستظهر عملية الدفع هنا بعد قبول اقتراح من Campus Allemagne.",
  offersCta: "عرض العروض",
  proposalCta: "العودة إلى اقتراحي",
  studentCta: "فتح مساحة الطالب",
  amount: "قيمة العرض",
  status: "حالة الدفع",
  created: "تم إنشاء عملية الشراء في",
  lastEvent: "آخر حدث مسجل",
  noEvent: "لا توجد معاملة مسجلة",
  disclaimer: "الرجوع من صفحة دفع أو ظهور شاشة نجاح أو رسالة خارجية لا يفعّل مساحة الطالب بمفرده.",
  progression: "تقدم عملية الدفع",
  stages: {
    proposal: "الاقتراح",
    payment: "الدفع",
    validation: "تحقق Campus",
    student: "الطالب",
    done: "مكتمل",
    current: "قيد الإنجاز",
    later: "لاحقًا",
    locked: "مقفل",
  },
  nextAction: "الخطوة التالية",
  pendingTitle: "الدفع في الانتظار",
  pendingText: "لم يتم تأكيد الدفع بعد داخل AlmaGo. تبقى مساحة الطالب مقفلة.",
  validatingTitle: "تم استلام الدفع · تحقق Campus جارٍ",
  validatingText: "تم تسجيل الدفع. تقوم Campus Allemagne بالمراجعة النهائية قبل تفعيل مساحة الطالب.",
  activeTitle: "تم تفعيل مساحة الطالب",
  activeText: "اكتمل الدفع والتحقق. يمكنك متابعة ملفك في مساحة الطالب.",
  cancelledTitle: "تم إلغاء الدفع",
  cancelledText: "لن يتم تفعيل مساحة الطالب عبر هذه العملية. ارجع إلى اقتراحك لمعرفة الخطوة التالية.",
  refundedTitle: "تم رد المبلغ",
  refundedText: "تم رد قيمة الشراء، ولا يعتبر وصول الطالب المرتبط بهذه العملية فعالًا.",
  unavailableTitle: "الدفع غير متاح مؤقتًا",
  unavailableText: "نظام تنسيق الدفع غير مفعل حاليًا. لا يمكن تنفيذ دفع أو تفعيل من هذه الصفحة.",
  responsibility: {
    you: "أنت",
    campus: "Campus Allemagne",
    access: "مساحة الطالب",
    pendingYou: "انتظر تعليمات الدفع التي ستقدمها Campus Allemagne.",
    pendingCampus: "تسجيل استلام الدفع والتحقق منه.",
    validatingYou: "لا يوجد إجراء مطلوب منك الآن.",
    validatingCampus: "إتمام التحقق الداخلي النهائي من الدفع.",
    activeYou: "متابعة الملف في مساحة الطالب.",
    activeCampus: "مواصلة المرافقة وفق الاقتراح الذي تم اعتماده.",
    accessLocked: "مقفلة حتى الدفع ثم تحقق Campus.",
    accessActive: "مفعلة.",
  },
  history: "سجل الدفع",
  historyHint: "الأحداث أدناه مأخوذة من سجلات الخادم، ولا يتم استنتاج أي حالة من المتصفح.",
  attemptLabel: "محاولة دفع",
  transactionLabel: "معاملة",
  statuses: {
    payment_pending: "الدفع في الانتظار",
    paid_pending_validation: "تم استلام الدفع · التحقق جارٍ",
    client_active: "تم تفعيل مساحة الطالب",
    cancelled: "تم إلغاء الدفع",
    refunded: "تم رد المبلغ",
  },
};

const en: ProspectPaymentCopy = {
  nav: "My payment",
  eyebrow: "Payment",
  title: "Track my payment",
  intro: "This page shows only the server-recorded state. Student access can be activated only after payment confirmation and Campus Allemagne validation.",
  noneTitle: "No payment in progress",
  noneText: "Your payment will appear here after you accept a Campus Allemagne proposal.",
  offersCta: "View offers",
  proposalCta: "Back to my proposal",
  studentCta: "Open my Student space",
  amount: "Offer amount",
  status: "Payment status",
  created: "Purchase created on",
  lastEvent: "Latest recorded event",
  noEvent: "No transaction recorded",
  disclaimer: "Returning from a payment page, seeing a success screen or receiving an external message can never unlock Student access by itself.",
  progression: "Payment progress",
  stages: {
    proposal: "Proposal",
    payment: "Payment",
    validation: "Campus validation",
    student: "Student",
    done: "Done",
    current: "In progress",
    later: "Later",
    locked: "Locked",
  },
  nextAction: "Next step",
  pendingTitle: "Payment pending",
  pendingText: "Payment is not yet confirmed in AlmaGo. Student access remains locked.",
  validatingTitle: "Payment received · Campus validation in progress",
  validatingText: "Payment is recorded. Campus Allemagne is completing the final review before Student access is activated.",
  activeTitle: "Your Student space is active",
  activeText: "Payment and Campus validation are complete. You can continue in your Student space.",
  cancelledTitle: "Payment cancelled",
  cancelledText: "This purchase does not activate Student access. Return to your proposal to review the next step.",
  refundedTitle: "Payment refunded",
  refundedText: "The purchase was refunded. Student access linked to this payment is not considered active.",
  unavailableTitle: "Payment temporarily unavailable",
  unavailableText: "Payment orchestration is currently disabled. No payment or activation can be triggered from this page.",
  responsibility: {
    you: "You",
    campus: "Campus Allemagne",
    access: "Student access",
    pendingYou: "Wait for the payment instructions provided by Campus Allemagne.",
    pendingCampus: "Record and verify payment receipt.",
    validatingYou: "No action is required from you right now.",
    validatingCampus: "Complete the final internal payment validation.",
    activeYou: "Continue your dossier in the Student space.",
    activeCampus: "Continue support under the validated proposal.",
    accessLocked: "Locked until payment and Campus validation are complete.",
    accessActive: "Active.",
  },
  history: "Payment history",
  historyHint: "The events below come from server records; no status is inferred from the browser.",
  attemptLabel: "Payment attempt",
  transactionLabel: "Transaction",
  statuses: {
    payment_pending: "Payment pending",
    paid_pending_validation: "Payment received · validation pending",
    client_active: "Student space active",
    cancelled: "Payment cancelled",
    refunded: "Payment refunded",
  },
};

const de: ProspectPaymentCopy = {
  nav: "Meine Zahlung",
  eyebrow: "Zahlung",
  title: "Zahlung verfolgen",
  intro: "Diese Seite zeigt ausschließlich den serverseitig gespeicherten Status. Der Studierendenbereich wird erst nach Zahlungsbestätigung und Campus-Prüfung aktiviert.",
  noneTitle: "Keine laufende Zahlung",
  noneText: "Deine Zahlung erscheint hier, nachdem du einen Vorschlag von Campus Allemagne angenommen hast.",
  offersCta: "Angebote ansehen",
  proposalCta: "Zurück zu meinem Vorschlag",
  studentCta: "Studierendenbereich öffnen",
  amount: "Angebotsbetrag",
  status: "Zahlungsstatus",
  created: "Kauf erstellt am",
  lastEvent: "Letztes gespeichertes Ereignis",
  noEvent: "Keine Transaktion gespeichert",
  disclaimer: "Die Rückkehr von einer Zahlungsseite, eine Erfolgsanzeige oder eine externe Nachricht kann den Studierendenbereich niemals allein freischalten.",
  progression: "Zahlungsfortschritt",
  stages: {
    proposal: "Vorschlag",
    payment: "Zahlung",
    validation: "Campus-Prüfung",
    student: "Studierende",
    done: "Erledigt",
    current: "In Bearbeitung",
    later: "Später",
    locked: "Gesperrt",
  },
  nextAction: "Nächster Schritt",
  pendingTitle: "Zahlung ausstehend",
  pendingText: "Die Zahlung ist in AlmaGo noch nicht bestätigt. Der Studierendenbereich bleibt gesperrt.",
  validatingTitle: "Zahlung erhalten · Campus-Prüfung läuft",
  validatingText: "Die Zahlung ist gespeichert. Campus Allemagne führt die letzte Prüfung vor der Aktivierung des Studierendenbereichs durch.",
  activeTitle: "Dein Studierendenbereich ist aktiv",
  activeText: "Zahlung und Campus-Prüfung sind abgeschlossen. Du kannst im Studierendenbereich fortfahren.",
  cancelledTitle: "Zahlung storniert",
  cancelledText: "Dieser Kauf aktiviert keinen Studierendenbereich. Kehre zu deinem Vorschlag zurück, um den nächsten Schritt zu prüfen.",
  refundedTitle: "Zahlung erstattet",
  refundedText: "Der Kauf wurde erstattet. Der mit dieser Zahlung verknüpfte Studierendenzugang gilt nicht als aktiv.",
  unavailableTitle: "Zahlung vorübergehend nicht verfügbar",
  unavailableText: "Die Zahlungsorchestrierung ist derzeit deaktiviert. Von dieser Seite kann keine Zahlung oder Aktivierung ausgelöst werden.",
  responsibility: {
    you: "Du",
    campus: "Campus Allemagne",
    access: "Studierendenbereich",
    pendingYou: "Warte auf die Zahlungsanweisungen von Campus Allemagne.",
    pendingCampus: "Zahlungseingang erfassen und prüfen.",
    validatingYou: "Im Moment ist keine Aktion von dir erforderlich.",
    validatingCampus: "Die abschließende interne Zahlungsprüfung durchführen.",
    activeYou: "Dein Dossier im Studierendenbereich fortsetzen.",
    activeCampus: "Die Begleitung gemäß dem bestätigten Vorschlag fortsetzen.",
    accessLocked: "Bis Zahlung und Campus-Prüfung abgeschlossen sind gesperrt.",
    accessActive: "Aktiv.",
  },
  history: "Zahlungsverlauf",
  historyHint: "Die folgenden Ereignisse stammen aus Serveraufzeichnungen; aus dem Browser wird kein Status abgeleitet.",
  attemptLabel: "Zahlungsversuch",
  transactionLabel: "Transaktion",
  statuses: {
    payment_pending: "Zahlung ausstehend",
    paid_pending_validation: "Zahlung erhalten · Prüfung läuft",
    client_active: "Studierendenbereich aktiv",
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
