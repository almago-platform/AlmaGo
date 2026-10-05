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
import { orientationProjectFacts, orientationVersionSummary } from "@/lib/prospect/orientation-presentation";
import { prospectCatalogueRecommendations } from "@/lib/prospect/programmes";

function proposalStatus(
  intake: Awaited<ReturnType<typeof loadProspectHubState>>["intake"],
  copy: (typeof prospectHubCopy)["fr"]["dashboard"],
) {
  if (!intake) return copy.proposalWaiting;
  if (
    intake.status === "route_proposed"
    || intake.status === "student_question"
    || intake.status === "payment_pending"
    || intake.status === "paid_pending_validation"
  ) return copy.proposalReady;
  if (intake.status === "procedure_created") return copy.proposalConfirmed;
  return copy.proposalWaiting;
}

function nextAction(
  state: Awaited<ReturnType<typeof loadProspectHubState>>,
  copy: (typeof prospectHubCopy)["fr"]["dashboard"],
  locale: "fr" | "ar" | "en" | "de",
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

  if (state.intake.status === "payment_pending") {
    const labels = {
      fr: "Finaliser mon paiement",
      ar: "إتمام الدفع",
      en: "Complete my payment",
      de: "Zahlung abschließen",
    } as const;
    return { href: "/prospect/payment", label: labels[locale] };
  }

  if (state.intake.status === "paid_pending_validation") {
    const labels = {
      fr: "Voir le statut du paiement",
      ar: "عرض حالة الدفع",
      en: "View payment status",
      de: "Zahlungsstatus ansehen",
    } as const;
    return { href: "/prospect/payment", label: labels[locale] };
  }

  if (state.answers?.bacStatus === "preparing") {
    const labels = {
      fr: "Continuer ma préparation",
      ar: "متابعة التحضير",
      en: "Continue my preparation",
      de: "Vorbereitung fortsetzen",
    } as const;
    return { href: "/prospect/roadmap", label: labels[locale] };
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
      payment: "Votre proposition est acceptée. Nous attendons maintenant le paiement avant toute ouverture de la phase suivante.",
      paid: "Votre paiement est enregistré. Campus Allemagne doit encore le valider avant d’activer votre espace client.",
      procedure: "Votre parcours est confirmé. La procédure peut maintenant avancer.",
      preBac: "Nous suivons votre projet avant le Bac. Aucun dossier académique final n’est requis maintenant ; concentrez-vous sur la langue, les programmes et la préparation de la suite.",
    },
    ar: {
      none: "ننتظر معلوماتك الأولى.",
      documents: "ننتظر الوثائق الأساسية حتى نتمكن من تحليل الملف.",
      review: "نراجع توجيهك ووثائقك لإعداد اقتراحك.",
      proposal: "اقتراحك جاهز وننتظر قرارك أو أسئلتك.",
      question: "نراجع طلبك لتعديل الاقتراح.",
      payment: "تم قبول الاقتراح. ننتظر الآن الدفع قبل فتح المرحلة التالية.",
      paid: "تم تسجيل الدفع. يجب على Campus Allemagne التحقق منه قبل تفعيل مساحة العميل.",
      procedure: "تم تأكيد المسار ويمكن الآن متابعة الإجراءات.",
      preBac: "نتابع مشروعك قبل البكالوريا. لا نطلب الآن ملفًا أكاديميًا نهائيًا؛ ركّز على اللغة والبرامج والاستعداد للمرحلة التالية.",
    },
    en: {
      none: "We are waiting for your first project information.",
      documents: "We are waiting for your starter documents before reviewing your file.",
      review: "We are reviewing your orientation and documents to prepare your proposal.",
      proposal: "Your proposal is ready; we are waiting for your decision or questions.",
      question: "We are reviewing your request to change the proposal.",
      payment: "Your proposal is accepted. Payment is now required before the next phase can open.",
      paid: "Your payment is recorded. Campus Allemagne must still validate it before client access is activated.",
      procedure: "Your route is confirmed and the procedure can now move forward.",
      preBac: "We are following your project before the Bac. No final academic file is required now; focus on language, programmes and preparing the next stage.",
    },
    de: {
      none: "Wir warten auf die ersten Angaben zu deinem Projekt.",
      documents: "Wir warten auf deine Startdokumente, bevor wir dein Dossier prüfen.",
      review: "Wir prüfen Orientierung und Dokumente, um deinen Vorschlag vorzubereiten.",
      proposal: "Dein Vorschlag ist bereit; wir warten auf deine Entscheidung oder Fragen.",
      question: "Wir prüfen deinen Änderungswunsch.",
      payment: "Dein Vorschlag ist angenommen. Vor dem Start der nächsten Phase ist jetzt die Zahlung erforderlich.",
      paid: "Deine Zahlung ist erfasst. Campus Allemagne muss sie noch prüfen, bevor der Kundenzugang aktiviert wird.",
      procedure: "Dein Weg ist bestätigt und die weitere Bearbeitung kann beginnen.",
      preBac: "Wir begleiten dein Projekt schon vor dem Abitur. Ein endgültiges akademisches Dossier ist jetzt nicht nötig; konzentriere dich auf Sprache, Programme und die Vorbereitung der nächsten Phase.",
    },
  } as const;

  if (!status) return state.answers?.bacStatus === "preparing" ? copy[locale].preBac : copy[locale].none;
  if (status === "starter_documents") return state.answers?.bacStatus === "preparing" ? copy[locale].preBac : copy[locale].documents;
  if (status === "campus_review") return copy[locale].review;
  if (status === "route_proposed") return copy[locale].proposal;
  if (status === "student_question") return copy[locale].question;
  if (status === "payment_pending") return copy[locale].payment;
  if (status === "paid_pending_validation") return copy[locale].paid;
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
  const preBac = state.answers?.bacStatus === "preparing";
  const action = nextAction(state, t, locale);
  const facts = state.answers ? orientationProjectFacts(state.answers, locale) : [];
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const recommendationLabels = {
    projectMatch: catalogueT.projectMatch,
    preferredCity: catalogueT.preferredCity,
    requirementCheck: catalogueT.requirementCheck,
    field: catalogueT.field,
    german: catalogueT.german,
    uniAssist: catalogueT.uniAssist,
    yes: catalogueT.yes,
    source: catalogueT.source,
    applyLink: catalogueT.applyLink,
  };

  return (
    <main className="space-y-5">
      <section className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] border-t-[3px] border-t-[var(--brand)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            {t.eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)] sm:text-[2rem]">
            {t.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[0.95rem]">
            {t.subtitle}
          </p>

          {facts.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {facts.map((fact) => (
                <span
                  key={fact}
                  className="rounded-full bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
                >
                  <bdi dir="auto">{fact}</bdi>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
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
          preBac={preBac}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_1fr]">
        <section className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
            {t.nextAction}
          </p>
          <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
            {action.label}
          </h2>
          {!preBac && (!state.intake || state.intake.status === "starter_documents") ? (
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t.documentsSummary(
                state.starterSummary.approved,
                state.starterSummary.required,
                state.starterSummary.pending,
                state.starterSummary.needsReplacement,
              )}
            </p>
          ) : null}
          <Link
            href={action.href}
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-strong)]"
          >
            {action.label}
          </Link>
        </section>

        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-400" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              {t.campusAction}
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
            {campusWork(state, locale)}
          </p>
        </section>

        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              {t.proposal}
            </p>
          </div>
          <p className="mt-2 text-xl font-bold text-[var(--foreground)]">
            {proposalStatus(state.intake, t)}
          </p>
          <Link
            href="/prospect/proposal"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-strong)] underline decoration-[var(--brand-border)] underline-offset-4"
          >
            {t.viewProposal}
          </Link>
        </section>
      </div>

      {recommendations.length ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                {catalogueT.projectMatch}
              </p>
              <h2 className="mt-1 text-2xl font-bold">{t.recommendedTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                {t.recommendedText}
              </p>
            </div>
            <Link
              href="/prospect/catalogue"
              className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:border-[var(--brand-border)]"
            >
              {t.recommendedViewAll}
            </Link>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-3">
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
      ) : null}

      {state.qualification ? (
        <ProspectQualificationSummary
          qualification={state.qualification}
          copy={qualificationCopy}
        />
      ) : null}

      <nav
        aria-label={t.browseTitle}
        className="grid gap-2 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-card)] sm:grid-cols-3"
      >
        <Link
          href="/prospect/catalogue"
          className="rounded-[var(--radius-control)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--surface-subtle)]"
        >
          {t.browseCatalogue} →
        </Link>
        <Link
          href="/prospect/solutions"
          className="rounded-[var(--radius-control)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--surface-subtle)]"
        >
          {t.browseSolutions} →
        </Link>
        <Link
          href="/prospect/orientation"
          className="rounded-[var(--radius-control)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--surface-subtle)]"
        >
          {t.updateProject} →
        </Link>
      </nav>

      {state.current ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                {t.project}
              </p>
              <h2 className="mt-1 text-lg font-bold">
                {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].title}
              </h2>
            </div>
            <Link
              href="/prospect/orientation"
              className="inline-flex min-h-10 shrink-0 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-4 text-sm font-semibold transition hover:border-[var(--brand-border)]"
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
                      {orientationVersionSummary(orientation.answers, locale)}
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
