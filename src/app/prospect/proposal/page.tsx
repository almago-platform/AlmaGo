import Link from "next/link";
import { redirect } from "next/navigation";
import { IntakeFlowCard } from "@/components/prospect/IntakeFlowCard";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { isPhase2PaymentOrchestrationEnabled } from "@/lib/phase2/config";
import { loadProspectHubState } from "@/lib/prospect/hub";
import { formatMinorCurrency } from "@/lib/money";

const localeTags = {
  fr: "fr-FR",
  ar: "ar-TN",
  en: "en-GB",
  de: "de-DE",
} as const;

function serviceItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 20)
    : [];
}

export const dynamic = "force-dynamic";

export default async function ProspectProposalPage() {
  const [access, locale] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
  ]);

  if (!access.user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (!access.phase2Enabled || access.canUseClientFeatures) redirect("/student");

  const state = await loadProspectHubState({
    userId: access.user.id,
    email: access.user.email,
    emailConfirmed: Boolean(access.user.email_confirmed_at),
  });

  let proposalOffer: {
    id: string;
    displayName: string;
    summary: string;
    services: string[];
    priceLabel: string;
  } | null = null;

  if (state.intake?.proposed_offer_version_id) {
    const { data } = await access.supabase
      .from("commercial_offer_versions")
      .select("id,display_name,summary,service_items,price_minor,currency")
      .eq("id", state.intake.proposed_offer_version_id)
      .maybeSingle();

    if (data) {
      proposalOffer = {
        id: data.id,
        displayName: data.display_name,
        summary: data.summary,
        services: serviceItems(data.service_items),
        priceLabel: formatMinorCurrency(data.price_minor, data.currency, localeTags[locale]) ?? "—",
      };
    }
  }

  const t = prospectHubCopy[locale].proposal;
  const dashboardCopy = prospectHubCopy[locale].dashboard;
  const preBac = state.answers?.bacStatus === "preparing";
  const paymentEnabled = isPhase2PaymentOrchestrationEnabled();
  const starterDocuments = state.intake?.status === "starter_documents";
  const proposalAvailable = [
    "route_proposed",
    "student_question",
    "payment_pending",
    "paid_pending_validation",
    "procedure_created",
  ].includes(state.intake?.status || "");
  const documentPercent = state.starterSummary.required
    ? Math.round((state.starterSummary.approved / state.starterSummary.required) * 100)
    : 0;

  return (
    <main className="space-y-7">
      <ProspectPageHero eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      {!state.intake && state.orientationConfirmed ? (
        <section className="rounded-[1.35rem] border border-black/[.07] bg-white p-6 shadow-[0_22px_60px_-42px_rgba(0,0,0,.34)]">
          <div className="flex items-start gap-3">
            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#202326]">{t.waitingTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.waitingBody}</p>
            </div>
          </div>
        </section>
      ) : null}

      {preBac && starterDocuments ? (
        <section className="rounded-[1.35rem] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[0_22px_58px_-42px_rgba(216,6,33,.28)] sm:p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-strong)]">
            Projet avant le Bac
          </p>
          <h2 className="mt-2 text-[clamp(1.55rem,2.7vw,2.2rem)] font-semibold tracking-[-0.035em] text-[#202326]">Votre accompagnement de préparation est déjà actif</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Vous n’avez pas besoin de fournir le Bac ni le relevé final maintenant. Campus Allemagne peut déjà
            vous guider sur la langue, les programmes, le budget et les prochaines étapes. La proposition académique
            définitive viendra après vos résultats et la mise à jour du projet.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/prospect/roadmap"
              className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-md"
            >
              Continuer ma préparation
            </Link>
            <Link
              href="/prospect/catalogue"
              className="inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
            >
              Explorer les programmes
            </Link>
            <Link
              href="/prospect/solutions"
              className="inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
            >
              Langue & solutions
            </Link>
            <Link
              href="/prospect/documents"
              className="inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
            >
              Documents facultatifs
            </Link>
          </div>
        </section>
      ) : starterDocuments ? (
        <section className="rounded-[1.35rem] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[0_22px_58px_-42px_rgba(216,6,33,.28)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-strong)]">
                {dashboardCopy.proposalWaiting}
              </p>
              <h2 className="mt-2 text-[clamp(1.55rem,2.7vw,2.2rem)] font-semibold tracking-[-0.035em] text-[#202326]">{t.documentsTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.documentsBody}</p>
            </div>
            <span className="rounded-full border border-[var(--brand-border)]/60 bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--brand-strong)]">
              {dashboardCopy.documentsSummary(
                state.starterSummary.approved,
                state.starterSummary.required,
                state.starterSummary.pending,
                state.starterSummary.needsReplacement,
              )}
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-inset ring-black/[.04]">
            <div
              className="h-full rounded-full bg-[var(--brand)]"
              style={{ width: String(documentPercent) + "%" }}
              aria-hidden="true"
            />
          </div>

          <Link
            href="/prospect/documents"
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
          >
            {dashboardCopy.browseDocuments}
          </Link>
        </section>
      ) : (
        <IntakeFlowCard
          recovery={state.recovery}
          orientationId={state.current?.id ?? null}
          orientationConfirmed={state.orientationConfirmed}
          intake={state.intake
            ? {
                status: state.intake.status,
                proposed_route_key: state.intake.proposed_route_key,
                proposal_reason: state.intake.proposal_reason,
                proposed_offer_version_id: state.intake.proposed_offer_version_id,
                purchase_id: state.intake.purchase_id,
                procedure_id: state.intake.procedure_id,
              }
            : null}
          starterSummary={state.starterSummary}
          bacStatus={state.answers?.bacStatus}
          offer={proposalOffer}
          paymentEnabled={paymentEnabled}
        />
      )}

      {!proposalAvailable && !preBac ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-bold">{t.waitingTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{t.waitingBody}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/prospect/catalogue"
                className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:border-[var(--brand-border)]"
              >
                {dashboardCopy.browseCatalogue}
              </Link>
              <Link
                href="/prospect/solutions"
                className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:border-[var(--brand-border)]"
              >
                {dashboardCopy.browseSolutions}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
