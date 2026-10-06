import Link from "next/link";
import { redirect } from "next/navigation";
import { IntakeFlowCard } from "@/components/prospect/IntakeFlowCard";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { ProspectProgrammeRecommendationCard } from "@/components/prospect/ProspectProgrammeRecommendationCard";
import { ProspectQualificationSummary } from "@/components/prospect/ProspectQualificationSummary";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { prospectQualificationCopy } from "@/content/prospect-qualification-copy";
import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import { loadProspectHubState } from "@/lib/prospect/hub";
import { orientationProjectFacts, orientationVersionSummary } from "@/lib/prospect/orientation-presentation";
import { prospectCatalogueRecommendations } from "@/lib/prospect/programmes";

export const dynamic = "force-dynamic";

export default async function ProspectOrientationPage() {
  const [access, locale] = await Promise.all([
    getPhase2StudentAccess(),
    getRequestLocale(),
  ]);

  if (!access.user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (!access.phase2Enabled || access.canUseClientFeatures) redirect("/student");

  const [state, catalogue] = await Promise.all([
    loadProspectHubState({
      userId: access.user.id,
      email: access.user.email,
      emailConfirmed: Boolean(access.user.email_confirmed_at),
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
  const showIntakeAction = Boolean(
    state.recovery
    || (state.current && !state.orientationConfirmed)
    || (preBac && state.orientationConfirmed && state.intake?.status === "starter_documents"),
  );
  const waitingForDocuments =
    !preBac
    && state.orientationConfirmed
    && state.intake?.status === "starter_documents";
  const recommendations = prospectCatalogueRecommendations(state.answers, catalogue);
  const recommendationLabels = {
    projectMatch: catalogueCopy.projectMatch,
    preferredCity: catalogueCopy.preferredCity,
    requirementCheck: catalogueCopy.requirementCheck,
    field: catalogueCopy.field,
    german: catalogueCopy.german,
    uniAssist: catalogueCopy.uniAssist,
    yes: catalogueCopy.yes,
    source: catalogueCopy.source,
    applyLink: catalogueCopy.applyLink,
  };

  return (
    <main className="space-y-6">
      <ProspectPageHero eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
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
        <section className="rounded-[1.35rem] border border-[var(--brand-border)]/70 bg-[linear-gradient(135deg,#fff0f2,#fffaf9)] p-5 shadow-[0_24px_64px_-44px_rgba(216,6,33,.34)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
                {t.confirmed}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#202326]">{t.nextDocuments}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.nextDocumentsBody}</p>
            </div>
            <Link
              href="/prospect/documents"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-md"
            >
              {dashboardCopy.browseDocuments}
            </Link>
          </div>
        </section>
      ) : null}

      {state.current ? (
        <>
          <section className="overflow-hidden rounded-[1.4rem] border border-black/[.07] bg-white shadow-[0_26px_70px_-44px_rgba(0,0,0,.38)]">
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

              <div className="border-t border-black/[.06] bg-[#f5f1ea] p-4 lg:border-s lg:border-t-0">
                <p className="text-xs font-semibold text-[var(--muted)]">{t.savedOn}</p>
                <p className="mt-1 text-sm font-bold">
                  <bdi dir="auto">{dateFormatter.format(new Date(state.current.created_at))}</bdi>
                </p>
                <Link
                  href="/orientation?mode=update"
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[var(--brand-border)] bg-white px-4 text-sm font-bold text-[var(--brand-strong)] shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-soft)] hover:shadow-md"
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
            <section className="rounded-[1.4rem] border border-black/[.07] bg-white/80 p-5 shadow-[0_24px_64px_-44px_rgba(0,0,0,.34)] backdrop-blur-sm sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
                    {catalogueCopy.projectMatch}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{catalogueCopy.recommendedTitle}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                    {catalogueCopy.recommendedSubtitle}
                  </p>
                </div>
                <Link
                  href="/prospect/catalogue"
                  className="inline-flex min-h-10 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
                >
                  {dashboardCopy.recommendedViewAll}
                </Link>
              </div>
              <div className="mt-4 grid items-start gap-4 xl:grid-cols-3">
                {recommendations.map((recommendation) => (
                  <ProspectProgrammeRecommendationCard
                    key={recommendation.programme.id}
                    recommendation={recommendation}
                    labels={recommendationLabels}
                    compact
                  />
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-[1.4rem] border border-black/[.07] bg-white/80 p-5 shadow-[0_24px_64px_-44px_rgba(0,0,0,.34)] backdrop-blur-sm sm:p-6">
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
            <details className="rounded-[1.4rem] border border-black/[.07] bg-white/80 p-5 shadow-[0_24px_64px_-44px_rgba(0,0,0,.34)] backdrop-blur-sm sm:p-6">
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
        <section className="rounded-[1.35rem] border border-dashed border-black/15 bg-white/70 p-8 text-center shadow-[0_18px_50px_-40px_rgba(0,0,0,.3)]">
          <p className="text-sm text-[var(--muted)]">{t.noOrientation}</p>
          <Link
            href="/orientation"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)]"
          >
            {t.update}
          </Link>
        </section>
      )}
    </main>
  );
}
