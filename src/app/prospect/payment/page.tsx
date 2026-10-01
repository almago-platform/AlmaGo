import Link from "next/link";
import { prospectPaymentCopy } from "@/content/prospect-payment-copy";
import { rebrandCopy } from "@/lib/brand";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";

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
};

type AttemptRow = {
  id: string;
  purchase_id: string;
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
  return typeof value === "string" && value.trim() ? value : null;
}

function formatPrice(
  value: number | string,
  currency: string,
  locale: keyof typeof localeTags,
) {
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0 || !/^[A-Z]{3}$/.test(currency)) {
    return "—";
  }

  try {
    const formatter = new Intl.NumberFormat(localeTags[locale], {
      style: "currency",
      currency,
    });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(amount / 10 ** digits);
  } catch {
    return "—";
  }
}

export const dynamic = "force-dynamic";

export default async function ProspectPaymentPage() {
  const access = await getPhase2StudentAccess();
  const locale = await getRequestLocale();
  const copy = rebrandCopy(prospectPaymentCopy[locale]);

  if (!access.user) return null;

  const { data: purchaseData } = await access.supabase
    .from("commercial_purchases")
    .select("id,user_id,offer_snapshot,amount_minor,currency,status,created_at")
    .eq("user_id", access.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const purchases = (purchaseData ?? []) as PurchaseRow[];
  const latest = purchases[0] ?? null;

  if (!latest) {
    return (
      <main>
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{copy.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">{copy.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{copy.intro}</p>
        </header>

        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">{copy.noneTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.noneText}</p>
          <Link
            href="/prospect/offers"
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 text-sm font-bold text-[var(--brand-strong)]"
          >
            {copy.offersCta}
          </Link>
        </section>
      </main>
    );
  }

  const { data: attemptData } = await access.supabase
    .from("payment_attempts")
    .select("id,purchase_id,status,created_at")
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
  });

  return (
    <main>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">{copy.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{copy.intro}</p>
      </header>

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        {offerName(latest.offer_snapshot) ? (
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
            {offerName(latest.offer_snapshot)}
          </p>
        ) : null}

        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-4">
            <dt className="text-xs font-bold text-[var(--muted)]">{copy.amount}</dt>
            <dd className="mt-1 text-xl font-bold text-[var(--foreground)]">
              <bdi dir="auto">{formatPrice(latest.amount_minor, latest.currency, locale)}</bdi>
            </dd>
          </div>
          <div className="rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-4">
            <dt className="text-xs font-bold text-[var(--muted)]">{copy.status}</dt>
            <dd className="mt-1 text-sm font-bold text-[var(--foreground)]">
              {copy.statuses[latest.status]}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-sm text-[var(--muted)]">
          {copy.created} <bdi dir="auto">{dateFormatter.format(new Date(latest.created_at))}</bdi>
        </p>

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            {copy.lastEvent}
          </p>
          <p className="mt-2 text-sm text-[var(--foreground)]">
            {latestTransaction
              ? `${latestTransaction.kind} · ${latestTransaction.status}`
              : copy.noEvent}
          </p>
        </div>

        <p className="mt-5 text-xs leading-5 text-[var(--muted)]">{copy.disclaimer}</p>
      </section>
    </main>
  );
}
