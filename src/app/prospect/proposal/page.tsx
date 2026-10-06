import Link from "next/link";
import { redirect } from "next/navigation";
import { IntakeFlowCard } from "@/components/prospect/IntakeFlowCard";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { prospectMedia } from "@/lib/prospect/media";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { buttonClassName } from "@/components/ui/Button";
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
    <main className="space-y-6">
      <ProspectPageHero
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
        variant="split"
        imageSrc={prospectMedia.proposalHero}
      />

      {!state.intake && state.orientationConfirmed ? (
        <PremiumEmptyState
          eyebrow={t.eyebrow}
          title={t.waitingTitle}
          description={t.waitingBody}
          action={
            <Link href="/prospect/catalogue" className={buttonClassName("secondary", "min-h-10 px-4 py-2")}>
              {dashboardCopy.browseCatalogue}
            </Link>
          }
          secondaryAction={
            <Link href="/prospect/solutions" className={buttonClassName("ghost", "min-h-10 px-4 py-2")}>
              {dashboardCopy.browseSolutions}
            </Link>
          }
          compact
        />
      ) : null}

      {preBac && starterDocuments ? (
        <section className="pc-panel bg-[linear-gradient(135deg,var(--premium-red-wash),var(--premium-paper))] p-4 sm:p-5">
          <PremiumSectionHeader
            eyebrow="Projet avant le Bac"
            title="Votre accompagnement de préparation est déjà actif"
            description={
              <>Vous n’avez pas besoin de fournir le Bac ni le relevé final maintenant. Campus Allemagne peut déjà
              vous guider sur la langue, les programmes, le budget et les prochaines étapes. La proposition académique
              définitive viendra après vos résultats et la mise à jour du projet.</>
            }
          />
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href="/prospect/roadmap"
              className={buttonClassName("primary")}
            >
              Continuer ma préparation
            </Link>
            <Link
              href="/prospect/catalogue"
              className={buttonClassName("secondary")}
            >
              Explorer les programmes
            </Link>
            <Link
              href="/prospect/solutions"
              className={buttonClassName("secondary")}
            >
              Langue & solutions
            </Link>
            <Link
              href="/prospect/documents"
              className={buttonClassName("secondary")}
            >
              Documents facultatifs
            </Link>
          </div>
        </section>
      ) : starterDocuments ? (
        <section className="pc-panel bg-[linear-gradient(135deg,var(--premium-red-wash),var(--premium-paper))] p-4 sm:p-5">
          <PremiumSectionHeader
            eyebrow={dashboardCopy.proposalWaiting}
            title={t.documentsTitle}
            description={t.documentsBody}
            actions={
              <span className="rounded-full border border-[var(--brand-border)]/60 bg-white px-3 py-1.5 text-xs font-bold text-[var(--brand-strong)] shadow-sm">
                {dashboardCopy.documentsSummary(
                  state.starterSummary.approved,
                  state.starterSummary.required,
                  state.starterSummary.pending,
                  state.starterSummary.needsReplacement,
                )}
              </span>
            }
          />

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-inset ring-black/[.04]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand),#f03248)] shadow-[0_0_14px_rgba(216,6,33,.18)]"
              style={{ width: String(documentPercent) + "%" }}
              aria-hidden="true"
            />
          </div>

          <Link
            href="/prospect/documents"
            className={buttonClassName("primary", "mt-5")}
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

      {!proposalAvailable && !preBac && !(!state.intake && state.orientationConfirmed) ? (
        <PremiumEmptyState
          eyebrow={t.eyebrow}
          title={t.waitingTitle}
          description={t.waitingBody}
          action={
            <Link href="/prospect/catalogue" className={buttonClassName("secondary", "min-h-10 px-4 py-2")}>
              {dashboardCopy.browseCatalogue}
            </Link>
          }
          secondaryAction={
            <Link href="/prospect/solutions" className={buttonClassName("ghost", "min-h-10 px-4 py-2")}>
              {dashboardCopy.browseSolutions}
            </Link>
          }
        />
      ) : null}
    </main>
  );
}
