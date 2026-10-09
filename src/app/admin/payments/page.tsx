import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPaymentActivationForm } from "@/components/admin/AdminPaymentActivationForm";
import { isPhase2PaymentOrchestrationEnabled } from "@/lib/phase2/config";
import { createClient } from "@/lib/supabase/server";
import { formatMinorCurrency } from "@/lib/money";
import { buttonClassName } from "@/components/ui/Button";

type PurchaseRow = {
  id: string;
  user_id: string;
  offer_snapshot: unknown;
  amount_minor: number | string;
  currency: string;
  status: "payment_pending" | "paid_pending_validation" | "client_active" | "cancelled" | "refunded";
  created_at: string;
  updated_at: string;
};

type AttemptRow = {
  id: string;
  purchase_id: string;
  provider: string;
  status: "created" | "pending" | "succeeded" | "failed" | "cancelled";
  created_at: string;
};

type TransactionRow = {
  id: string;
  attempt_id: string;
  kind: "charge" | "refund" | "dispute";
  status: "pending" | "succeeded" | "failed";
  occurred_at: string;
};

type ProspectRow = {
  user_id: string | null;
  email: string;
};

type AccessRow = {
  user_id: string;
  status: string;
};

const statusLabels: Record<PurchaseRow["status"], string> = {
  payment_pending: "Paiement en attente",
  paid_pending_validation: "Payé · validation requise",
  client_active: "Client actif",
  cancelled: "Annulé / révoqué",
  refunded: "Remboursé",
};

function offerName(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") return "Offre historisée";
  const value = (snapshot as Record<string, unknown>).display_name;
  return typeof value === "string" && value.trim() ? value : "Offre historisée";
}

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const orchestrationEnabled = isPhase2PaymentOrchestrationEnabled();

  const { data: purchaseData, error: purchaseError } = await supabase
    .from("commercial_purchases")
    .select("id,user_id,offer_snapshot,amount_minor,currency,status,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (purchaseError) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader
          section="Paiements"
          title="Paiements et activation client"
          description="La file des paiements est temporairement indisponible."
        />
      </main>
    );
  }

  const purchases = (purchaseData ?? []) as PurchaseRow[];
  const purchaseIds = purchases.map((purchase) => purchase.id);
  const userIds = [...new Set(purchases.map((purchase) => purchase.user_id))];

  let attempts: AttemptRow[] = [];
  if (purchaseIds.length) {
    const { data } = await supabase
      .from("payment_attempts")
      .select("id,purchase_id,provider,status,created_at")
      .in("purchase_id", purchaseIds)
      .order("created_at", { ascending: false });
    attempts = (data ?? []) as AttemptRow[];
  }

  const latestAttemptByPurchase = new Map<string, AttemptRow>();
  for (const attempt of attempts) {
    if (!latestAttemptByPurchase.has(attempt.purchase_id)) {
      latestAttemptByPurchase.set(attempt.purchase_id, attempt);
    }
  }

  const attemptIds = attempts.map((attempt) => attempt.id);
  let transactions: TransactionRow[] = [];
  if (attemptIds.length) {
    const { data } = await supabase
      .from("payment_transactions")
      .select("id,attempt_id,kind,status,occurred_at")
      .in("attempt_id", attemptIds)
      .order("occurred_at", { ascending: false });
    transactions = (data ?? []) as TransactionRow[];
  }

  const latestTransactionByAttempt = new Map<string, TransactionRow>();
  for (const transaction of transactions) {
    if (!latestTransactionByAttempt.has(transaction.attempt_id)) {
      latestTransactionByAttempt.set(transaction.attempt_id, transaction);
    }
  }

  let prospects: ProspectRow[] = [];
  if (userIds.length) {
    const { data } = await supabase
      .from("prospects")
      .select("user_id,email")
      .in("user_id", userIds);
    prospects = (data ?? []) as ProspectRow[];
  }
  const emailByUser = new Map(
    prospects.flatMap((prospect) =>
      prospect.user_id ? [[prospect.user_id, prospect.email] as const] : [],
    ),
  );

  let accessRows: AccessRow[] = [];
  if (userIds.length) {
    const { data } = await supabase
      .from("customer_access")
      .select("user_id,status")
      .in("user_id", userIds);
    accessRows = (data ?? []) as AccessRow[];
  }
  const accessByUser = new Map(accessRows.map((row) => [row.user_id, row.status]));

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Paiements"
        title="Paiements et activation client"
        description="Vérifiez chaque paiement. Confirmez sa réception, puis validez séparément l’activation de l’accès payant."
      />

      <section className="mb-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5">
        <p className="text-sm font-bold text-[var(--foreground)]">État de l’orchestration</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {orchestrationEnabled
            ? "L’orchestration serveur est active. Un paiement en attente peut être marqué reçu manuellement après vérification, puis validé pour activer le client."
            : "L’orchestration serveur est désactivée. Aucun nouveau paiement ni activation ne peut être déclenché depuis cette interface."}
        </p>
      </section>

      {!purchases.length ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">Aucun achat enregistré</h2>
          <p className="mt-2 text-sm text-slate-700">
            Les achats apparaîtront ici lorsque l’orchestration P2.9 sera activée et qu’un prospect qualifié commencera le parcours de paiement.
          </p>
        </section>
      ) : (
        <div className="grid gap-4">
          {purchases.map((purchase) => {
            const attempt = latestAttemptByPurchase.get(purchase.id) ?? null;
            const transaction = attempt
              ? latestTransactionByAttempt.get(attempt.id) ?? null
              : null;
            const email = emailByUser.get(purchase.user_id) ?? null;
            const accessStatus = accessByUser.get(purchase.user_id) ?? "inconnu";

            return (
              <article
                key={purchase.id}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                      {offerName(purchase.offer_snapshot)}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      <bdi dir="auto">{formatMinorCurrency(purchase.amount_minor, purchase.currency, "fr-FR") ?? "Montant indisponible"}</bdi>
                    </h2>
                    <p className="mt-2 text-sm text-slate-700">
                      {email ? <bdi dir="auto">{email}</bdi> : "Compte " + purchase.user_id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                      {statusLabels[purchase.status]}
                    </span>
                    <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand-strong)]">
                      accès : {accessStatus}
                    </span>
                    <Link
                      href={`/admin/dossiers/${purchase.user_id}`}
                      className={buttonClassName("ghost", "min-h-8 px-2.5 py-1 text-xs")}
                    >
                      Dossier 360°
                    </Link>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-bold text-slate-700">Créé</dt>
                    <dd className="mt-1 text-slate-950">
                      <bdi dir="auto">{dateFormatter.format(new Date(purchase.created_at))}</bdi>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-slate-700">Tentative</dt>
                    <dd className="mt-1 text-slate-950">
                      {attempt ? `${attempt.provider === "manual_admin" ? "manuel admin" : attempt.provider} · ${attempt.status}` : "Aucune"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-slate-700">Dernière transaction</dt>
                    <dd className="mt-1 text-slate-950">
                      {transaction ? `${transaction.kind} · ${transaction.status}` : "Aucune"}
                    </dd>
                  </div>
                </dl>

                {purchase.status === "payment_pending" || purchase.status === "paid_pending_validation" ? (
                  <AdminPaymentActivationForm
                    purchaseId={purchase.id}
                    enabled={orchestrationEnabled}
                    status={purchase.status}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
