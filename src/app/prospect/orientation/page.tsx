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
  const showIntakeAction = Boolean(state.recovery || (state.current && !state.orientationConfirmed));
  const waitingForDocuments = state.orientationConfirmed && state.intake?.status === "starter_documents";
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
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-100">
            <span className="size-2 rounded-full bg-emerald-300" aria-hidden="true" />
            {t.confirmed}
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
                procedure_id: state.intake.procedure_id,
              }
            : null}
          starterSummary={state.starterSummary}
        />
      ) : null}

      {waitingForDocuments ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                {t.confirmed}
              </p>
              <h2 className="mt-2 text-xl font-bold">{t.nextDocuments}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.nextDocumentsBody}</p>
            </div>
            <Link
              href="/prospect/documents"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
            >
              {dashboardCopy.browseDocuments}
            </Link>
          </div>
        </section>
      ) : null}

      {state.current ? (
        <>
          <section className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_14rem]">
              <div className="p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">{t.current}</p>
                <h2 className="mt-2 max-w-3xl text-2xl font-bold">
                  {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                  {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {state.answers ? orientationProjectFacts(state.answers, locale).map((value) => (
                    <span key={value} className="rounded-full bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-semibold">
                      <bdi dir="auto">{value}</bdi>
                    </span>
                  )) : null}
                </div>
              </div>

              <div className="border-t border-[var(--border)] bg-[var(--surface-subtle)] p-5 lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold text-[var(--muted)]">{t.savedOn}</p>
                <p className="mt-1 text-sm font-bold">
                  <bdi dir="auto">{dateFormatter.format(new Date(state.current.created_at))}</bdi>
                </p>
                <Link
                  href="/orientation?mode=update"
                  className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--brand-strong)] transition hover:bg-[var(--brand-soft)]"
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
            <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                    {catalogueCopy.projectMatch}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{catalogueCopy.recommendedTitle}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                    {catalogueCopy.recommendedSubtitle}
                  </p>
                </div>
                <Link
                  href="/prospect/catalogue"
                  className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-4 text-sm font-semibold transition hover:border-[var(--brand-border)]"
                >
                  {dashboardCopy.recommendedViewAll}
                </Link>
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
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
            <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
              <h2 className="text-xl font-bold">{diagnosticCopy.sections.paths}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {state.current.diagnostic.paths.map((item) => {
                  const itemCopy = diagnosticCopy.items[item.code];
                  return (
                    <article key={item.code} className="rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="font-semibold">{itemCopy.title}</h3>
                        <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[11px] font-bold text-[var(--muted)]">
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
            <details className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
              <summary className="cursor-pointer text-lg font-bold">{t.history}</summary>
              <div className="mt-4 grid gap-2">
                {state.orientations.slice(1, 6).map((orientation) => (
                  <div key={orientation.id} className="rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-3">
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
        <section className="rounded-[var(--radius-panel)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--muted)]">{t.noOrientation}</p>
          <Link
            href="/orientation"
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
          >
            {t.update}
          </Link>
        </section>
      )}
    </main>
  );
}
