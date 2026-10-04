import Link from "next/link";
import { redirect } from "next/navigation";
import { ProspectJourneyProgress } from "@/components/prospect/ProspectJourneyProgress";
import { ProspectProgrammeRecommendationCard } from "@/components/prospect/ProspectProgrammeRecommendationCard";
import { ProspectQualificationSummary } from "@/components/prospect/ProspectQualificationSummary";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { prospectQualificationCopy } from "@/content/prospect-qualification-copy";
import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import { loadProspectHubState } from "@/lib/prospect/hub";
import { prospectCatalogueRecommendations } from "@/lib/prospect/programmes";

function projectFacts(
  answers: NonNullable<Awaited<ReturnType<typeof loadProspectHubState>>["answers"]>,
) {
  const facts = [
    answers.targetDegree || null,
    answers.targetField || null,
    answers.preferredCities.length ? answers.preferredCities.join(", ") : null,
    answers.germanLevel ? `Allemand ${answers.germanLevel}` : null,
    answers.targetIntakeYear
      ? `${answers.targetIntakeSeason || ""} ${answers.targetIntakeYear}`.trim()
      : null,
  ];

  return facts.filter((value): value is string => Boolean(value));
}

function proposalStatus(
  intake: Awaited<ReturnType<typeof loadProspectHubState>>["intake"],
  copy: (typeof prospectHubCopy)["fr"]["dashboard"],
) {
  if (!intake) return copy.proposalWaiting;
  if (intake.status === "route_proposed") return copy.proposalReady;
  if (intake.status === "procedure_created") return copy.proposalConfirmed;
  return copy.proposalWaiting;
}

function nextAction(
  state: Awaited<ReturnType<typeof loadProspectHubState>>,
  copy: (typeof prospectHubCopy)["fr"]["dashboard"],
) {
  if (state.recovery || !state.current) {
    return { href: "/prospect/orientation", label: copy.startOrientation };
  }

  if (!state.orientationConfirmed) {
    return { href: "/prospect/orientation", label: copy.updateProject };
  }

  if (!state.intake || state.intake.status === "starter_documents") {
    return { href: "/prospect/documents", label: copy.browseDocuments };
  }

  if (
    state.intake.status === "route_proposed"
    || state.intake.status === "student_question"
  ) {
    return { href: "/prospect/proposal", label: copy.viewProposal };
  }

  return { href: "/prospect/roadmap", label: copy.progress };
}

function campusWork(
  state: Awaited<ReturnType<typeof loadProspectHubState>>,
  locale: "fr" | "ar" | "en" | "de",
) {
  const status = state.intake?.status;

  const copy = {
    fr: {
      none: "En attente de vos premières informations.",
      documents: "Nous attendons vos pièces de départ pour pouvoir analyser le dossier.",
      review: "Nous vérifions votre orientation et vos documents pour préparer votre proposition.",
      proposal: "Votre proposition est prête : nous attendons votre décision ou vos questions.",
      question: "Nous examinons votre demande de modification.",
      procedure: "Votre parcours est confirmé. La procédure peut maintenant avancer.",
    },
    ar: {
      none: "ننتظر معلوماتك الأولى.",
      documents: "ننتظر الوثائق الأساسية حتى نتمكن من تحليل الملف.",
      review: "نراجع توجيهك ووثائقك لإعداد اقتراحك.",
      proposal: "اقتراحك جاهز وننتظر قرارك أو أسئلتك.",
      question: "نراجع طلبك لتعديل الاقتراح.",
      procedure: "تم تأكيد المسار ويمكن الآن متابعة الإجراءات.",
    },
    en: {
      none: "We are waiting for your first project information.",
      documents: "We are waiting for your starter documents before reviewing your file.",
      review: "We are reviewing your orientation and documents to prepare your proposal.",
      proposal: "Your proposal is ready; we are waiting for your decision or questions.",
      question: "We are reviewing your request to change the proposal.",
      procedure: "Your route is confirmed and the procedure can now move forward.",
    },
    de: {
      none: "Wir warten auf die ersten Angaben zu deinem Projekt.",
      documents: "Wir warten auf deine Startdokumente, bevor wir dein Dossier prüfen.",
      review: "Wir prüfen Orientierung und Dokumente, um deinen Vorschlag vorzubereiten.",
      proposal: "Dein Vorschlag ist bereit; wir warten auf deine Entscheidung oder Fragen.",
      question: "Wir prüfen deinen Änderungswunsch.",
      procedure: "Dein Weg ist bestätigt und die weitere Bearbeitung kann beginnen.",
    },
  } as const;

  if (!status) return copy[locale].none;
  if (status === "starter_documents") return copy[locale].documents;
  if (status === "campus_review") return copy[locale].review;
  if (status === "route_proposed") return copy[locale].proposal;
  if (status === "student_question") return copy[locale].question;
  if (status === "procedure_created") return copy[locale].procedure;
  return copy[locale].none;
}

export const dynamic = "force-dynamic";

export default async function ProspectDashboardPage() {
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

  const t = prospectHubCopy[locale].dashboard;
  const catalogueT = prospectHubCopy[locale].catalogue;
  const recommendations = prospectCatalogueRecommendations(state.answers, catalogue);
  const diagnosticCopy = orientationDiagnosticCopy[locale];
  const qualificationCopy = prospectQualificationCopy[locale];
  const action = nextAction(state, t);
  const facts = state.answers ? projectFacts(state.answers) : [];
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="space-y-6">
      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">
          {t.eyebrow}
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          {t.subtitle}
        </p>

        {facts.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <span
                key={fact}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
              >
                <bdi dir="auto">{fact}</bdi>
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{t.progress}</h2>
          <Link
            href="/prospect/roadmap"
            className="text-sm font-semibold text-[var(--brand-strong)] underline underline-offset-4"
          >
            {t.progress}
          </Link>
        </div>
        <ProspectJourneyProgress
          hasOrientation={Boolean(state.current)}
          orientationConfirmed={state.orientationConfirmed}
          intake={state.intake}
          starterSummary={state.starterSummary}
          locale={locale}
          compact
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
            {t.nextAction}
          </p>
          <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
            {action.label}
          </h2>
          <Link
            href={action.href}
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white"
          >
            {action.label}
          </Link>
        </section>

        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            {t.campusAction}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
            {campusWork(state, locale)}
          </p>
        </section>

        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            {t.proposal}
          </p>
          <p className="mt-2 text-xl font-bold text-[var(--foreground)]">
            {proposalStatus(state.intake, t)}
          </p>
          <Link
            href="/prospect/proposal"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-strong)] underline underline-offset-4"
          >
            {t.viewProposal}
          </Link>
        </section>
      </div>

      <ProspectQualificationSummary
        qualification={state.qualification}
        copy={qualificationCopy}
      />

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">{t.documents}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t.documentsSummary(
                state.starterSummary.approved,
                state.starterSummary.required,
                state.starterSummary.pending,
                state.starterSummary.needsReplacement,
              )}
            </p>
          </div>
          <Link
            href="/prospect/documents"
            className="inline-flex min-h-10 items-center text-sm font-semibold text-[var(--brand-strong)] underline underline-offset-4"
          >
            {t.browseDocuments}
          </Link>
        </div>
      </section>

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-xl font-bold">{t.browseTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {t.browseText}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link
            href="/prospect/catalogue"
            className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 font-semibold hover:border-[var(--brand-border)]"
          >
            {t.browseCatalogue}
          </Link>
          <Link
            href="/prospect/solutions"
            className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 font-semibold hover:border-[var(--brand-border)]"
          >
            {t.browseSolutions}
          </Link>
          <Link
            href="/prospect/proposal"
            className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 font-semibold hover:border-[var(--brand-border)]"
          >
            {t.viewProposal}
          </Link>
        </div>
      </section>

      {state.current ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                {t.project}
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].body}
              </p>
            </div>
            <Link
              href="/prospect/orientation"
              className="text-sm font-semibold text-[var(--brand-strong)] underline underline-offset-4"
            >
              {t.updateProject}
            </Link>
          </div>

          {state.orientations.length > 1 ? (
            <details className="mt-5 border-t border-[var(--border)] pt-4">
              <summary className="cursor-pointer text-sm font-bold">
                {t.history}
              </summary>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                {t.historyHint}
              </p>
              <div className="mt-3 grid gap-2">
                {state.orientations.slice(0, 5).map((orientation, index) => (
                  <div
                    key={orientation.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] px-3 py-2.5"
                  >
                    <span className="text-sm font-semibold">
                      {diagnosticCopy.headlines[orientation.diagnostic.headlineCode].title}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {index === 0 ? `${t.currentVersion} · ` : ""}
                      <bdi dir="auto">
                        {dateFormatter.format(new Date(orientation.created_at))}
                      </bdi>
                    </span>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </section>
      ) : (
        <section className="rounded-[var(--radius-panel)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center">
          <h2 className="text-xl font-bold">{t.noOrientation}</h2>
          <Link
            href="/prospect/orientation"
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
          >
            {t.startOrientation}
          </Link>
        </section>
      )}
    </main>
  );
}
