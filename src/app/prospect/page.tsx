import Link from "next/link";
import { redirect } from "next/navigation";
import { DossierHeader } from "@/components/product/DossierHeader";
import { JourneyRail, type JourneyRailStep } from "@/components/product/JourneyRail";
import { NextActionPanel } from "@/components/product/NextActionPanel";
import { ResponsibilityStrip } from "@/components/product/ResponsibilityStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
      paid: "Votre paiement est enregistré. Campus Allemagne doit encore le valider avant d’activer votre espace étudiant.",
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
      paid: "تم تسجيل الدفع. يجب على Campus Allemagne التحقق منه قبل تفعيل مساحة الطالب.",
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
      paid: "Your payment is recorded. Campus Allemagne must still validate it before Student access is activated.",
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
      paid: "Deine Zahlung ist erfasst. Campus Allemagne muss sie noch prüfen, bevor der Studierendenbereich aktiviert wird.",
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


function prospectV2Labels(locale: "fr" | "ar" | "en" | "de") {
  return {
    fr: {
      space: "Espace Prospect",
      accessLocked: "Espace étudiant non activé",
      accessHelp: "L’espace étudiant s’active seulement après proposition, paiement et validation Campus.",
      waitingTitle: "Rien à faire de votre côté pour le moment",
      waitingReview: "Campus Allemagne analyse votre dossier et prépare la prochaine étape.",
      waitingValidation: "Votre paiement est reçu. Campus Allemagne effectue la validation finale avant l’activation étudiant.",
      yourSide: "À vous",
      campusSide: "Campus Allemagne",
      accessSide: "Accès étudiant",
      noAction: "Aucune action demandée aujourd’hui.",
      lifecycle: "Votre progression",
      orientation: "Orientation",
      documents: "Documents",
      review: "Analyse Campus",
      proposal: "Proposition",
      payment: "Paiement",
      student: "Étudiant",
      done: "Terminé",
      locked: "Verrouillé",
      current: "En cours",
      later: "À venir",
      explore: "Programmes à explorer",
      historyLabel: "Détails du projet",
    },
    ar: {
      space: "مساحة Prospect",
      accessLocked: "مساحة الطالب غير مفعّلة",
      accessHelp: "تُفعّل مساحة الطالب فقط بعد الاقتراح والدفع وتأكيد Campus Allemagne.",
      waitingTitle: "لا يوجد ما يجب عليك فعله الآن",
      waitingReview: "تقوم Campus Allemagne بتحليل ملفك وتحضير الخطوة التالية.",
      waitingValidation: "تم استلام الدفع وتقوم Campus Allemagne بالتحقق النهائي قبل تفعيل مساحة الطالب.",
      yourSide: "أنت",
      campusSide: "Campus Allemagne",
      accessSide: "مساحة الطالب",
      noAction: "لا يوجد إجراء مطلوب منك اليوم.",
      lifecycle: "تقدم مشروعك",
      orientation: "التوجيه",
      documents: "الوثائق",
      review: "مراجعة Campus",
      proposal: "الاقتراح",
      payment: "الدفع",
      student: "الطالب",
      done: "مكتمل",
      locked: "مقفل",
      current: "قيد الإنجاز",
      later: "لاحقًا",
      explore: "برامج للاستكشاف",
      historyLabel: "تفاصيل المشروع",
    },
    en: {
      space: "Prospect space",
      accessLocked: "Student space not activated",
      accessHelp: "Student access opens only after proposal, payment and Campus validation.",
      waitingTitle: "Nothing is required from you right now",
      waitingReview: "Campus Allemagne is reviewing your dossier and preparing the next step.",
      waitingValidation: "Your payment is received. Campus Allemagne is completing final validation before Student activation.",
      yourSide: "You",
      campusSide: "Campus Allemagne",
      accessSide: "Student access",
      noAction: "No action is required from you today.",
      lifecycle: "Your progress",
      orientation: "Orientation",
      documents: "Documents",
      review: "Campus review",
      proposal: "Proposal",
      payment: "Payment",
      student: "Student",
      done: "Done",
      locked: "Locked",
      current: "In progress",
      later: "Later",
      explore: "Programmes to explore",
      historyLabel: "Project details",
    },
    de: {
      space: "Prospect-Bereich",
      accessLocked: "Studierendenbereich noch nicht aktiviert",
      accessHelp: "Der Studierendenbereich wird erst nach Vorschlag, Zahlung und Campus-Bestätigung aktiviert.",
      waitingTitle: "Im Moment musst du nichts tun",
      waitingReview: "Campus Allemagne prüft dein Dossier und bereitet den nächsten Schritt vor.",
      waitingValidation: "Deine Zahlung ist eingegangen. Campus Allemagne führt die letzte Prüfung vor der Aktivierung durch.",
      yourSide: "Du",
      campusSide: "Campus Allemagne",
      accessSide: "Studierendenbereich",
      noAction: "Heute ist keine Aktion von dir erforderlich.",
      lifecycle: "Dein Fortschritt",
      orientation: "Orientierung",
      documents: "Dokumente",
      review: "Campus-Prüfung",
      proposal: "Vorschlag",
      payment: "Zahlung",
      student: "Studierende",
      done: "Erledigt",
      locked: "Gesperrt",
      current: "In Bearbeitung",
      later: "Später",
      explore: "Programme zum Erkunden",
      historyLabel: "Projektdetails",
    },
  }[locale];
}

function prospectLifecycleSteps(
  state: Awaited<ReturnType<typeof loadProspectHubState>>,
  locale: "fr" | "ar" | "en" | "de",
): JourneyRailStep[] {
  const l = prospectV2Labels(locale);
  const status = state.intake?.status;
  const rank =
    status === "starter_documents" || !status ? 1
      : status === "campus_review" ? 2
        : status === "route_proposed" || status === "student_question" ? 3
          : status === "payment_pending" || status === "paid_pending_validation" ? 4
            : status === "procedure_created" ? 5
              : 1;
  const orientationRank = !state.current || !state.orientationConfirmed ? 0 : rank;
  const labels = [l.orientation, l.documents, l.review, l.proposal, l.payment, l.student];

  return labels.map((label, index) => {
    const effectiveRank = index === 0 ? orientationRank : rank;
    const stepStatus: JourneyRailStep["status"] =
      index < effectiveRank ? "done"
        : index === effectiveRank ? (index === 5 ? "active" : "active")
          : index === 5 ? "locked"
            : "upcoming";
    return {
      label,
      detail:
        stepStatus === "done" ? l.done
          : stepStatus === "active" ? l.current
            : stepStatus === "locked" ? l.locked
              : l.later,
      status: stepStatus,
    };
  });
}

function prospectWaitingState(
  state: Awaited<ReturnType<typeof loadProspectHubState>>,
) {
  return state.intake?.status === "campus_review"
    || state.intake?.status === "paid_pending_validation";
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
  const v2 = prospectV2Labels(locale);
  const lifecycleSteps = prospectLifecycleSteps(state, locale);
  const waiting = prospectWaitingState(state);
  const waitingDescription =
    state.intake?.status === "paid_pending_validation"
      ? v2.waitingValidation
      : v2.waitingReview;
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
      <DossierHeader
        eyebrow={v2.space}
        title={t.title}
        description={t.subtitle}
        status={v2.accessLocked}
        statusVariant="warning"
        facts={facts.slice(0, 4).map((fact, index) => ({
          label: index === 0 ? t.project : v2.historyLabel,
          value: <bdi dir="auto">{fact}</bdi>,
        }))}
      />

      <section className="space-y-3">
        <SectionHeader eyebrow={v2.lifecycle} title={t.progress} />
        <JourneyRail steps={lifecycleSteps} />
      </section>

      <NextActionPanel
        eyebrow={t.nextAction}
        title={waiting ? v2.waitingTitle : action.label}
        description={
          waiting
            ? waitingDescription
            : !preBac && (!state.intake || state.intake.status === "starter_documents")
              ? t.documentsSummary(
                  state.starterSummary.approved,
                  state.starterSummary.required,
                  state.starterSummary.pending,
                  state.starterSummary.needsReplacement,
                )
              : undefined
        }
        waiting={waiting}
        action={
          waiting ? undefined : (
            <Link
              href={action.href}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-md"
            >
              {action.label}
            </Link>
          )
        }
      />

      <ResponsibilityStrip
        items={[
          {
            label: v2.yourSide,
            detail: waiting ? v2.noAction : action.label,
            tone: "user",
          },
          {
            label: v2.campusSide,
            detail: campusWork(state, locale),
            tone: "campus",
          },
          {
            label: v2.accessSide,
            detail: state.intake?.status === "procedure_created" ? t.proposalConfirmed : v2.accessHelp,
            tone: "external",
          },
        ]}
      />

      <section className="overflow-hidden rounded-[1.35rem] border border-black/[.07] bg-white p-4 shadow-[0_22px_60px_-42px_rgba(0,0,0,.34)] sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
              {t.proposal}
            </p>
            <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.025em] text-[#202326]">
              {proposalStatus(state.intake, t)}
            </h2>
          </div>
          <Link
            href="/prospect/proposal"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
          >
            {t.viewProposal}
          </Link>
        </div>
      </section>

      {recommendations.length ? (
        <section className="rounded-[1.4rem] border border-black/[.06] bg-white/75 p-4 shadow-[0_24px_64px_-44px_rgba(0,0,0,.34)] backdrop-blur-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
                {catalogueT.projectMatch}
              </p>
              <h2 className="mt-2 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-[-0.035em] text-[#1b1e20]">{t.recommendedTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[0.95rem]">
                {t.recommendedText}
              </p>
            </div>
            <Link
              href="/prospect/catalogue"
              className="inline-flex min-h-10 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
            >
              {t.recommendedViewAll}
            </Link>
          </div>

          <div className="mt-4 grid items-start gap-3 xl:grid-cols-3">
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
        className="grid gap-2 rounded-[1.25rem] border border-black/[.06] bg-[#17191b] p-2.5 text-white shadow-[0_24px_60px_-40px_rgba(0,0,0,.55)] sm:grid-cols-3"
      >
        <Link
          href="/prospect/catalogue"
          className="rounded-xl px-4 py-3.5 text-sm font-semibold text-white/82 transition-all duration-200 hover:bg-white/[.08] hover:text-white"
        >
          {t.browseCatalogue} →
        </Link>
        <Link
          href="/prospect/solutions"
          className="rounded-xl px-4 py-3.5 text-sm font-semibold text-white/82 transition-all duration-200 hover:bg-white/[.08] hover:text-white"
        >
          {t.browseSolutions} →
        </Link>
        <Link
          href="/prospect/orientation"
          className="rounded-xl px-4 py-3.5 text-sm font-semibold text-white/82 transition-all duration-200 hover:bg-white/[.08] hover:text-white"
        >
          {t.updateProject} →
        </Link>
      </nav>

      {state.current ? (
        <section className="rounded-[1.3rem] border border-black/[.07] bg-white/80 p-4 shadow-[0_20px_55px_-42px_rgba(0,0,0,.3)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
                {t.project}
              </p>
              <h2 className="mt-1 text-lg font-bold">
                {diagnosticCopy.headlines[state.current.diagnostic.headlineCode].title}
              </h2>
            </div>
            <Link
              href="/prospect/orientation"
              className="inline-flex min-h-10 shrink-0 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
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
        <section className="rounded-[1.35rem] border border-dashed border-black/15 bg-white/70 p-8 text-center shadow-[0_18px_50px_-40px_rgba(0,0,0,.3)]">
          <h2 className="text-xl font-bold">{t.noOrientation}</h2>
          <Link
            href="/prospect/orientation"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] transition-all hover:-translate-y-px hover:bg-[var(--brand-strong)]"
          >
            {t.startOrientation}
          </Link>
        </section>
      )}
    </main>
  );
}
