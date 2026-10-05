import Link from "next/link";
import { ActivityTimeline, type ActivityTimelineItem } from "@/components/product/ActivityTimeline";
import { DossierHeader } from "@/components/product/DossierHeader";
import { JourneyRail, type JourneyRailStep } from "@/components/product/JourneyRail";
import { NextActionPanel } from "@/components/product/NextActionPanel";
import { ResponsibilityStrip } from "@/components/product/ResponsibilityStrip";
import { DataList } from "@/components/ui/DataList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { prospectPaymentCopy } from "@/content/prospect-payment-copy";
import { rebrandCopy } from "@/lib/brand";
import { getRequestLocale } from "@/lib/i18n-server";
import { formatMinorCurrency } from "@/lib/money";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { isPhase2PaymentOrchestrationEnabled } from "@/lib/phase2/config";

type PurchaseStatus =
  | "payment_pending"
  | "paid_pending_validation"
  | "client_active"
  | "cancelled"
  | "refunded";

type PurchaseRow = {
  id: string;
  user_id: string;
  offer_snapshot: unknown;
  amount_minor: number | string;
  currency: string;
  status: PurchaseStatus;
  created_at: string;
  updated_at: string;
};

type AttemptRow = {
  id: string;
  purchase_id: string;
  provider: string;
  status: string;
  created_at: string;
};

type TransactionRow = {
  id: string;
  attempt_id: string;
  kind: "charge" | "refund" | "dispute";
  status: string;
  occurred_at: string;
};

const localeTags = {
  fr: "fr-FR",
  ar: "ar-TN",
  en: "en-GB",
  de: "de-DE",
} as const;

function offerName(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") return null;
  const value = (snapshot as Record<string, unknown>).display_name;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function statusVariant(status: PurchaseStatus) {
  if (status === "client_active") return "success" as const;
  if (status === "cancelled" || status === "refunded") return "error" as const;
  if (status === "paid_pending_validation") return "warning" as const;
  return "info" as const;
}

function paymentStage(status: PurchaseStatus) {
  if (status === "client_active") return 3;
  if (status === "paid_pending_validation") return 2;
  return 1;
}

function humanAttemptStatus(locale: "fr" | "ar" | "en" | "de", status: string) {
  const labels = {
    fr: {
      created: "créée",
      pending: "en attente",
      succeeded: "confirmée",
      failed: "échouée",
      cancelled: "annulée",
    },
    ar: {
      created: "تم إنشاؤها",
      pending: "قيد الانتظار",
      succeeded: "تم تأكيدها",
      failed: "فشلت",
      cancelled: "تم إلغاؤها",
    },
    en: {
      created: "created",
      pending: "pending",
      succeeded: "confirmed",
      failed: "failed",
      cancelled: "cancelled",
    },
    de: {
      created: "erstellt",
      pending: "ausstehend",
      succeeded: "bestätigt",
      failed: "fehlgeschlagen",
      cancelled: "storniert",
    },
  } as const;

  const localized = labels[locale] as Record<string, string>;
  return localized[status]
    || (locale === "fr" ? "mise à jour" : locale === "ar" ? "تم التحديث" : locale === "de" ? "aktualisiert" : "updated");
}

function humanTransaction(
  locale: "fr" | "ar" | "en" | "de",
  transaction: TransactionRow,
) {
  const kindLabels = {
    fr: { charge: "Paiement", refund: "Remboursement", dispute: "Litige" },
    ar: { charge: "الدفع", refund: "استرداد", dispute: "نزاع" },
    en: { charge: "Payment", refund: "Refund", dispute: "Dispute" },
    de: { charge: "Zahlung", refund: "Erstattung", dispute: "Streitfall" },
  } as const;
  const statusLabels = {
    fr: { pending: "en attente", succeeded: "confirmé", failed: "échoué" },
    ar: { pending: "قيد الانتظار", succeeded: "تم التأكيد", failed: "فشل" },
    en: { pending: "pending", succeeded: "confirmed", failed: "failed" },
    de: { pending: "ausstehend", succeeded: "bestätigt", failed: "fehlgeschlagen" },
  } as const;

  const kind = kindLabels[locale][transaction.kind];
  const localizedStatuses = statusLabels[locale] as Record<string, string>;
  const status = localizedStatuses[transaction.status]
    || (locale === "fr" ? "mis à jour" : locale === "ar" ? "تم التحديث" : locale === "de" ? "aktualisiert" : "updated");
  return `${kind} · ${status}`;
}

export const dynamic = "force-dynamic";

export default async function ProspectPaymentPage() {
  const access = await getPhase2StudentAccess();
  const locale = await getRequestLocale();
  const copy = rebrandCopy(prospectPaymentCopy[locale]);
  const orchestrationEnabled = isPhase2PaymentOrchestrationEnabled();

  if (!access.user) return null;

  const { data: purchaseData } = await access.supabase
    .from("commercial_purchases")
    .select("id,user_id,offer_snapshot,amount_minor,currency,status,created_at,updated_at")
    .eq("user_id", access.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const purchases = (purchaseData ?? []) as PurchaseRow[];
  const latest = purchases[0] ?? null;

  if (!latest) {
    const emptySteps: JourneyRailStep[] = [
      { label: copy.stages.proposal, detail: copy.stages.current, status: "active", href: "/prospect/proposal" },
      { label: copy.stages.payment, detail: copy.stages.later, status: "upcoming" },
      { label: copy.stages.validation, detail: copy.stages.later, status: "upcoming" },
      { label: copy.stages.student, detail: copy.stages.locked, status: "locked" },
    ];

    return (
      <main className="space-y-6">
        <DossierHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.intro}
          status={copy.noneTitle}
          statusVariant="neutral"
        />

        <section className="space-y-3">
          <SectionHeader eyebrow={copy.progression} title={copy.noneTitle} />
          <JourneyRail steps={emptySteps} ariaLabel={copy.progression} />
        </section>

        <NextActionPanel
          eyebrow={copy.nextAction}
          title={copy.noneTitle}
          description={copy.noneText}
          action={
            <Link
              href="/prospect/proposal"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-white px-5 text-sm font-semibold text-[var(--foreground)]"
            >
              {copy.proposalCta}
            </Link>
          }
        />
      </main>
    );
  }

  const { data: attemptData } = await access.supabase
    .from("payment_attempts")
    .select("id,purchase_id,provider,status,created_at")
    .eq("purchase_id", latest.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const attempts = (attemptData ?? []) as AttemptRow[];
  const attemptIds = attempts.map((attempt) => attempt.id);

  let transactions: TransactionRow[] = [];
  if (attemptIds.length) {
    const { data } = await access.supabase
      .from("payment_transactions")
      .select("id,attempt_id,kind,status,occurred_at")
      .in("attempt_id", attemptIds)
      .order("occurred_at", { ascending: false })
      .limit(20);
    transactions = (data ?? []) as TransactionRow[];
  }

  const latestTransaction = transactions[0] ?? null;
  const dateFormatter = new Intl.DateTimeFormat(localeTags[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const amountLabel =
    formatMinorCurrency(latest.amount_minor, latest.currency, localeTags[locale]) ?? "—";
  const currentStage = paymentStage(latest.status);

  const steps: JourneyRailStep[] = [
    {
      label: copy.stages.proposal,
      detail: copy.stages.done,
      status: "done",
      href: "/prospect/proposal",
    },
    {
      label: copy.stages.payment,
      detail: currentStage > 1 ? copy.stages.done : copy.stages.current,
      status: currentStage > 1 ? "done" : "active",
    },
    {
      label: copy.stages.validation,
      detail:
        currentStage > 2
          ? copy.stages.done
          : currentStage === 2
            ? copy.stages.current
            : copy.stages.later,
      status: currentStage > 2 ? "done" : currentStage === 2 ? "active" : "upcoming",
    },
    {
      label: copy.stages.student,
      detail: currentStage === 3 ? copy.stages.current : copy.stages.locked,
      status: currentStage === 3 ? "active" : "locked",
    },
  ];

  const next =
    latest.status === "payment_pending" && !orchestrationEnabled
      ? {
          title: copy.unavailableTitle,
          description: copy.unavailableText,
          waiting: true,
          href: null as string | null,
          label: null as string | null,
        }
      : latest.status === "payment_pending"
        ? {
            title: copy.pendingTitle,
            description: copy.pendingText,
            waiting: true,
            href: null,
            label: null,
          }
        : latest.status === "paid_pending_validation"
          ? {
              title: copy.validatingTitle,
              description: copy.validatingText,
              waiting: true,
              href: null,
              label: null,
            }
          : latest.status === "client_active"
            ? {
                title: copy.activeTitle,
                description: copy.activeText,
                waiting: false,
                href: "/student",
                label: copy.studentCta,
              }
            : latest.status === "refunded"
              ? {
                  title: copy.refundedTitle,
                  description: copy.refundedText,
                  waiting: true,
                  href: "/prospect/proposal",
                  label: copy.proposalCta,
                }
              : {
                  title: copy.cancelledTitle,
                  description: copy.cancelledText,
                  waiting: true,
                  href: "/prospect/proposal",
                  label: copy.proposalCta,
                };

  const userResponsibility =
    latest.status === "client_active"
      ? copy.responsibility.activeYou
      : latest.status === "paid_pending_validation"
        ? copy.responsibility.validatingYou
        : latest.status === "payment_pending"
          ? copy.responsibility.pendingYou
          : copy.proposalCta;

  const campusResponsibility =
    latest.status === "client_active"
      ? copy.responsibility.activeCampus
      : latest.status === "paid_pending_validation"
        ? copy.responsibility.validatingCampus
        : latest.status === "payment_pending"
          ? copy.responsibility.pendingCampus
          : copy.responsibility.pendingCampus;

  const history: Array<ActivityTimelineItem & { sortKey: number }> = [
    ...attempts.map((attempt) => ({
      title: copy.attemptLabel,
      description: humanAttemptStatus(locale, attempt.status),
      timestamp: dateFormatter.format(new Date(attempt.created_at)),
      tone: attempt.status === "succeeded" ? "success" as const : attempt.status === "failed" ? "warning" as const : "neutral" as const,
      sortKey: new Date(attempt.created_at).getTime(),
    })),
    ...transactions.map((transaction) => ({
      title: copy.transactionLabel,
      description: humanTransaction(locale, transaction),
      timestamp: dateFormatter.format(new Date(transaction.occurred_at)),
      tone: transaction.status === "succeeded" ? "success" as const : transaction.status === "failed" ? "warning" as const : "info" as const,
      sortKey: new Date(transaction.occurred_at).getTime(),
    })),
  ].sort((left, right) => right.sortKey - left.sortKey);

  return (
    <main className="space-y-6">
      <DossierHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.intro}
        status={copy.statuses[latest.status]}
        statusVariant={statusVariant(latest.status)}
        facts={[
          { label: copy.amount, value: <bdi dir="auto">{amountLabel}</bdi> },
          { label: copy.status, value: copy.statuses[latest.status] },
          { label: copy.created, value: <bdi dir="auto">{dateFormatter.format(new Date(latest.created_at))}</bdi> },
          {
            label: copy.lastEvent,
            value: latestTransaction ? humanTransaction(locale, latestTransaction) : copy.noEvent,
          },
        ]}
      />

      <section className="space-y-3">
        <SectionHeader eyebrow={copy.progression} title={copy.statuses[latest.status]} />
        <JourneyRail steps={steps} ariaLabel={copy.progression} />
      </section>

      <NextActionPanel
        eyebrow={copy.nextAction}
        title={next.title}
        description={next.description}
        waiting={next.waiting}
        action={
          next.href && next.label ? (
            <Link
              href={next.href}
              className={
                next.waiting
                  ? "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--foreground)]"
                  : "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-white px-5 text-sm font-semibold text-[var(--foreground)]"
              }
            >
              {next.label}
            </Link>
          ) : undefined
        }
      />

      <ResponsibilityStrip
        items={[
          {
            label: copy.responsibility.you,
            detail: userResponsibility,
            tone: "user",
          },
          {
            label: copy.responsibility.campus,
            detail: campusResponsibility,
            tone: "campus",
          },
          {
            label: copy.responsibility.access,
            detail:
              latest.status === "client_active"
                ? copy.responsibility.accessActive
                : copy.responsibility.accessLocked,
            tone: "external",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)]">
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <SectionHeader
            eyebrow={offerName(latest.offer_snapshot) || copy.eyebrow}
            title={copy.statuses[latest.status]}
            description={copy.disclaimer}
          />
          <DataList
            className="mt-5"
            items={[
              { label: copy.amount, value: <bdi dir="auto">{amountLabel}</bdi> },
              { label: copy.status, value: copy.statuses[latest.status] },
              {
                label: copy.created,
                value: <bdi dir="auto">{dateFormatter.format(new Date(latest.created_at))}</bdi>,
              },
              {
                label: copy.lastEvent,
                value: latestTransaction ? humanTransaction(locale, latestTransaction) : copy.noEvent,
              },
            ]}
          />
        </section>

        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <SectionHeader
            eyebrow={copy.history}
            title={copy.history}
            description={copy.historyHint}
          />
          <div className="mt-5">
            <ActivityTimeline
              items={history.slice(0, 8)}
              empty={copy.noEvent}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
