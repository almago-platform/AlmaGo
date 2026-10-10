import Link from "next/link";
import { redirect } from "next/navigation";
import { IntakeFlowCard } from "@/components/prospect/IntakeFlowCard";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { ProspectQualificationSummary } from "@/components/prospect/ProspectQualificationSummary";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { buttonClassName } from "@/components/ui/Button";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { prospectQualificationCopy } from "@/content/prospect-qualification-copy";
import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import { loadProspectHubState } from "@/lib/prospect/hub";
import { orientationProjectFacts, orientationVersionSummary } from "@/lib/prospect/orientation-presentation";
import { prospectCatalogueRecommendations } from "@/lib/prospect/programmes";
import { prospectMedia } from "@/lib/prospect/media";
import { getProvisionalIdentity } from "@/lib/prospect/provisional-auth";
import { loadProvisionalProspectHubState } from "@/lib/prospect/provisional-hub";

export const dynamic = "force-dynamic";

export default async function ProspectOrientationPage() {
  const [access, locale] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
  ]);

  const provisional = !access.user ? await getProvisionalIdentity() : null;
  if (!access.user && !provisional) redirect("/login");
  if (access.user && !access.isStudent) redirect("/unauthorized");
  if (access.user && (!access.phase2Enabled || access.canUseClientFeatures)) redirect("/student");

  const [state, catalogue] = await Promise.all([
    provisional
      ? loadProvisionalProspectHubState(provisional)
      : loadProspectHubState({
          userId: access.user!.id,
          email: access.user!.email,
          emailConfirmed: Boolean(access.user!.email_confirmed_at),
        }),
    loadVerifiedProgrammeCatalogue(),
  ]);
  const t = prospectHubCopy[locale].orientation;
  const dashboardCopy = prospectHubCopy[locale].dashboard;
  const catalogueCopy = prospectHubCopy[locale].catalogue;
  const diagnosticCopy = orientationDiagnosticCopy[locale];
  const qualificationCopy = prospectQualificationCopy[locale];
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const preBac = state.answers?.bacStatus === "preparing";
  const showIntakeAction = !provisional && Boolean(
    state.recovery
    || (state.current && !state.orientationConfirmed)
    || (preBac && state.orientationConfirmed && state.intake?.status === "starter_documents"),
  );
  const waitingForDocuments =
    !provisional && !preBac
    && state.orientationConfirmed
    && state.intake?.status === "starter_documents";
  const recommendations = prospectCatalogueRecommendations(state.answers, catalogue);
  return (
    <main className="space-y-6">
      <ProspectPageHero
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
        variant="split"
        imageSrc={prospectMedia.orientationHero}
        imagePriority
      >
        {state.orientationConfirmed ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-100">
            <span className="size-2 rounded-full bg-emerald-300" aria-hidden="true" />
            {preBac ? "Projet avant le Bac enregistré" : t.confirmed}
          </div>
        ) : null}
      </ProspectPageHero>

      {showIntakeAction ? (
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
        />
      ) : null}

      {waitingForDocuments ? (
        <section className="pc-panel pc-premium-card pc-theme-neutral p-5 sm:p-6">
          <PremiumSectionHeader
            eyebrow={t.confirmed}
            title={t.nextDocuments}
            description={t.nextDocumentsBody}
            actions={
              <Link href="/prospect/documents" className={buttonClassName("primary")}>
                {dashboardCopy.browseDocuments}
              </Link>
            }
          />
        </section>
      ) : null}

      {state.current ? (
        <>
          <section className="pc-panel pc-premium-card pc-theme-blue overflow-hidden">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_12.5rem]">
              <div className="p-5 sm:p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">{t.current}</p>
                <h2 className="mt-2 max-w-3xl text-[clamp(1.55rem,2.5vw,2.15rem)] font-semibold tracking-[-0.035em] text-[#1c1f21]">
                  {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                  {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {state.answers ? orientationProjectFacts(state.answers, locale).map((value) => (
                    <span key={value} className="rounded-full border border-black/[.05] bg-[#f3f0ea] px-3 py-1.5 text-xs font-semibold text-[#34383b]">
                      <bdi dir="auto">{value}</bdi>
                    </span>
                  )) : null}
                </div>
              </div>

              <div className="pc-glass border-t border-[var(--premium-border)] p-4 lg:border-s lg:border-t-0">
                <p className="text-xs font-semibold text-[var(--muted)]">{t.savedOn}</p>
                <p className="mt-1 text-sm font-bold">
                  <bdi dir="auto">{dateFormatter.format(new Date(state.current.created_at))}</bdi>
                </p>
                <Link
                  href="/orientation?mode=update"
                  className={buttonClassName("secondary", "mt-4 w-full min-h-10 px-4 py-2")}
                >
                  {t.update}
                </Link>
              </div>
            </div>
          </section>

          {state.qualification ? (
            <ProspectQualificationSummary
              qualification={state.qualification}
              copy={qualificationCopy}
            />
          ) : null}

          {recommendations.length ? (
            <section className="pc-panel pc-premium-card pc-theme-gold p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <span className="grid size-12 place-items-center rounded-full bg-[var(--premium-ink)] text-sm font-extrabold text-white shadow-[var(--premium-shadow-card)]">
                  {recommendations.length}
                </span>
                <PremiumSectionHeader
                  eyebrow={catalogueCopy.projectMatch}
                  eyebrowTone="success"
                  title={catalogueCopy.recommendedTitle}
                  description={catalogueCopy.recommendedSubtitle}
                />
                <Link href="/prospect/catalogue" className={buttonClassName("secondary", "min-h-10 px-4 py-2")}>
                  {dashboardCopy.recommendedViewAll}
                </Link>
              </div>
            </section>
          ) : (
            <section className="pc-panel pc-premium-card pc-theme-gold p-5 sm:p-6">
              <h2 className="text-xl font-bold">{diagnosticCopy.sections.paths}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {state.current.diagnostic.paths.map((item) => {
                  const itemCopy = diagnosticCopy.items[item.code];
                  return (
                    <article key={item.code} className="rounded-xl border border-black/[.05] bg-[#f6f3ed] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="font-semibold">{itemCopy.title}</h3>
                        <span className="rounded-full border border-black/[.06] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.04em] text-[var(--muted)]">
                          {diagnosticCopy.status[item.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{itemCopy.body}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {state.orientations.length > 1 ? (
            <details className="pc-panel pc-premium-card pc-theme-blue p-5 sm:p-6">
              <summary className="cursor-pointer text-lg font-bold">{t.history}</summary>
              <div className="mt-4 grid gap-2">
                {state.orientations.slice(1, 6).map((orientation) => (
                  <div key={orientation.id} className="rounded-xl border border-black/[.05] bg-[#f6f3ed] p-3.5">
                    <p className="font-semibold">
                      {orientationVersionSummary(orientation.answers, locale)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      <bdi dir="auto">{dateFormatter.format(new Date(orientation.created_at))}</bdi>
                    </p>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </>
      ) : (
        <PremiumEmptyState
          eyebrow={t.eyebrow}
          title={t.noOrientation}
          action={
            <Link href="/orientation" className={buttonClassName("primary")}>
              {t.update}
            </Link>
          }
        />
      )}
    </main>
  );
}
