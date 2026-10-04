import Link from "next/link";
import { redirect } from "next/navigation";
import { IntakeFlowCard } from "@/components/prospect/IntakeFlowCard";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadProspectHubState } from "@/lib/prospect/hub";

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

  const t = prospectHubCopy[locale].proposal;
  const dashboardCopy = prospectHubCopy[locale].dashboard;
  const starterDocuments = state.intake?.status === "starter_documents";
  const proposalAvailable = ["route_proposed", "student_question", "procedure_created"]
    .includes(state.intake?.status || "");
  const documentPercent = state.starterSummary.required
    ? Math.round((state.starterSummary.approved / state.starterSummary.required) * 100)
    : 0;

  return (
    <main className="space-y-6">
      <header className="overflow-hidden rounded-[var(--radius-panel)] border border-slate-800 bg-[var(--foreground)] px-5 py-7 text-white shadow-[var(--shadow-soft)] sm:px-7 sm:py-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:text-base">{t.subtitle}</p>
      </header>

      {!state.intake && state.orientationConfirmed ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold">{t.waitingTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t.waitingBody}</p>
            </div>
          </div>
        </section>
      ) : null}

      {starterDocuments ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--brand)]">
                {dashboardCopy.proposalWaiting}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{t.documentsTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.documentsBody}</p>
            </div>
            <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--brand-strong)]">
              {dashboardCopy.documentsSummary(
                state.starterSummary.approved,
                state.starterSummary.required,
                state.starterSummary.pending,
                state.starterSummary.needsReplacement,
              )}
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/70">
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
                procedure_id: state.intake.procedure_id,
              }
            : null}
          starterSummary={state.starterSummary}
        />
      )}

      {!proposalAvailable ? (
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
