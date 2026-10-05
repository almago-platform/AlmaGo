"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { ProposalSummary } from "@/components/product/ProposalSummary";

type ProposalOffer = {
  id: string;
  displayName: string;
  summary: string;
  services: string[];
  priceLabel: string;
};

const routeLabels = {
  fr: {
    study_preparation: "Préparation aux études",
    studies_bachelor: "Études — Bachelor",
    studies_master: "Études — Master",
    study_place_search: "Recherche d’une place d’études",
    standalone_language: "Cours de langue autonome",
  },
  ar: {
    study_preparation: "التحضير للدراسة",
    studies_bachelor: "دراسة بكالوريوس",
    studies_master: "دراسة ماجستير",
    study_place_search: "البحث عن مقعد دراسي",
    standalone_language: "دورة لغة مستقلة",
  },
  en: {
    study_preparation: "Study preparation",
    studies_bachelor: "Bachelor studies",
    studies_master: "Master studies",
    study_place_search: "Study-place search",
    standalone_language: "Standalone language course",
  },
  de: {
    study_preparation: "Studienvorbereitung",
    studies_bachelor: "Bachelorstudium",
    studies_master: "Masterstudium",
    study_place_search: "Studienplatzsuche",
    standalone_language: "Eigenständiger Sprachkurs",
  },
} as const;

const copy = {
  fr: {
    eyebrow: "Proposition Campus Allemagne",
    ready: "Prête à décider",
    included: "Inclus",
    total: "Total",
    paymentNote: "Le paiement active l’accompagnement prévu dans cette proposition après validation Campus. Il ne garantit pas une admission universitaire.",
    boundary: "Votre espace Étudiant reste verrouillé jusqu’au paiement puis à sa validation par Campus Allemagne.",
    accept: "Accepter et passer au paiement",
    accepting: "Confirmation…",
    paymentUnavailable: "Paiement temporairement indisponible",
    paymentUnavailableHelp: "Vous pouvez consulter la proposition, mais son acceptation est désactivée tant que l’orchestration de paiement n’est pas activée.",
    discussTitle: "Vous souhaitez revoir un point ?",
    discussHelp: "Envoyez une demande de discussion. Campus Allemagne pourra ajuster ou expliquer la proposition avant tout paiement.",
    notePlaceholder: "Expliquez ce que vous souhaitez revoir avec Campus Allemagne.",
    discuss: "Demander une discussion",
    sending: "Envoi…",
    genericError: "Action impossible pour le moment.",
    connectionError: "Connexion impossible. Réessayez.",
  },
  ar: {
    eyebrow: "اقتراح Campus Allemagne",
    ready: "جاهز لاتخاذ القرار",
    included: "يشمل",
    total: "الإجمالي",
    paymentNote: "الدفع يفعّل المرافقة المحددة في هذا الاقتراح بعد تأكيد Campus Allemagne. ولا يضمن القبول الجامعي.",
    boundary: "تبقى مساحة الطالب مقفلة إلى أن يتم الدفع ثم تأكيده من Campus Allemagne.",
    accept: "قبول الاقتراح والانتقال إلى الدفع",
    accepting: "جارٍ التأكيد…",
    paymentUnavailable: "الدفع غير متاح مؤقتًا",
    paymentUnavailableHelp: "يمكنك مراجعة الاقتراح، لكن قبوله معطّل إلى أن يتم تفعيل نظام الدفع.",
    discussTitle: "هل تريد مراجعة نقطة ما؟",
    discussHelp: "أرسل طلب نقاش. يمكن لـ Campus Allemagne شرح الاقتراح أو تعديله قبل أي دفع.",
    notePlaceholder: "اشرح ما الذي ترغب في مراجعته مع Campus Allemagne.",
    discuss: "طلب نقاش",
    sending: "جارٍ الإرسال…",
    genericError: "لا يمكن تنفيذ الإجراء الآن.",
    connectionError: "تعذر الاتصال. أعد المحاولة.",
  },
  en: {
    eyebrow: "Campus Allemagne proposal",
    ready: "Ready for decision",
    included: "Included",
    total: "Total",
    paymentNote: "Payment activates the support described in this proposal after Campus validation. It does not guarantee university admission.",
    boundary: "Student access stays locked until payment is completed and then validated by Campus Allemagne.",
    accept: "Accept and continue to payment",
    accepting: "Confirming…",
    paymentUnavailable: "Payment temporarily unavailable",
    paymentUnavailableHelp: "You can review the proposal, but acceptance is disabled until payment orchestration is enabled.",
    discussTitle: "Want to review something?",
    discussHelp: "Send a discussion request. Campus Allemagne can explain or adjust the proposal before any payment.",
    notePlaceholder: "Explain what you would like to review with Campus Allemagne.",
    discuss: "Request a discussion",
    sending: "Sending…",
    genericError: "This action is unavailable right now.",
    connectionError: "Connection failed. Please try again.",
  },
  de: {
    eyebrow: "Vorschlag von Campus Allemagne",
    ready: "Entscheidungsbereit",
    included: "Enthalten",
    total: "Gesamt",
    paymentNote: "Die Zahlung aktiviert die in diesem Vorschlag beschriebene Begleitung nach Campus-Bestätigung. Sie garantiert keine Hochschulzulassung.",
    boundary: "Der Studierendenbereich bleibt bis zur Zahlung und anschließenden Bestätigung durch Campus Allemagne gesperrt.",
    accept: "Annehmen und zur Zahlung",
    accepting: "Bestätigung…",
    paymentUnavailable: "Zahlung vorübergehend nicht verfügbar",
    paymentUnavailableHelp: "Du kannst den Vorschlag prüfen, aber die Annahme bleibt deaktiviert, bis die Zahlungsorchestrierung aktiviert ist.",
    discussTitle: "Möchtest du etwas klären?",
    discussHelp: "Sende eine Rückfrage. Campus Allemagne kann den Vorschlag vor einer Zahlung erklären oder anpassen.",
    notePlaceholder: "Beschreibe, was du mit Campus Allemagne klären möchtest.",
    discuss: "Rückfrage senden",
    sending: "Wird gesendet…",
    genericError: "Diese Aktion ist derzeit nicht möglich.",
    connectionError: "Verbindung fehlgeschlagen. Bitte erneut versuchen.",
  },
} as const;

export function ProposalDecisionPanel({
  routeKey,
  rationale,
  offer,
  paymentEnabled,
}: {
  routeKey: string | null;
  rationale: string | null;
  offer: ProposalOffer | null;
  paymentEnabled: boolean;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const [busyAction, setBusyAction] = useState<"accept" | "discuss" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fallbackRoute =
    locale === "fr"
      ? "Parcours à confirmer"
      : locale === "ar"
        ? "المسار يحتاج إلى تأكيد"
        : locale === "de"
          ? "Weg noch zu bestätigen"
          : "Path to be confirmed";
  const localizedRoutes = routeLabels[locale] as Record<string, string>;
  const route = routeKey ? localizedRoutes[routeKey] ?? fallbackRoute : fallbackRoute;

  async function acceptProposal() {
    if (!paymentEnabled || busyAction) return;
    setBusyAction("accept");
    setError(null);

    try {
      const response = await fetch("/api/intake/route/confirm", { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : t.genericError);
        return;
      }
      router.push("/prospect/payment");
    } catch {
      setError(t.connectionError);
    } finally {
      setBusyAction(null);
    }
  }

  async function requestDiscussion() {
    if (busyAction) return;
    setBusyAction("discuss");
    setError(null);

    try {
      const response = await fetch("/api/intake/route/discuss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : t.genericError);
        return;
      }
      router.refresh();
    } catch {
      setError(t.connectionError);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <ProposalSummary
        eyebrow={t.eyebrow}
        route={route}
        service={offer?.displayName || t.ready}
        price={offer?.priceLabel || "—"}
        status={t.ready}
        statusVariant="success"
        rationale={rationale}
        included={offer?.services || []}
        includedLabel={t.included}
        totalLabel={t.total}
        paymentNote={t.paymentNote}
        boundaries={t.boundary}
        actions={
          paymentEnabled ? (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={acceptProposal}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-white px-5 text-sm font-semibold text-[var(--foreground)] disabled:opacity-60"
            >
              {busyAction === "accept" ? t.accepting : t.accept}
            </button>
          ) : (
            <div className="rounded-[var(--radius-control)] border border-white/20 bg-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-white">{t.paymentUnavailable}</p>
              <p className="mt-1 text-xs leading-5 text-white/70">{t.paymentUnavailableHelp}</p>
            </div>
          )
        }
      />

      {error ? (
        <p role="alert" className="rounded-[var(--radius-control)] border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t.discussTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.discussHelp}</p>
        <label className="mt-4 block text-sm font-semibold text-[var(--foreground)]">
          <span className="sr-only">{t.discussTitle}</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1000}
            rows={3}
            className="field"
            placeholder={t.notePlaceholder}
          />
        </label>
        <button
          type="button"
          disabled={busyAction !== null}
          onClick={requestDiscussion}
          className="mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--foreground)] disabled:opacity-60"
        >
          {busyAction === "discuss" ? t.sending : t.discuss}
        </button>
      </section>
    </div>
  );
}
