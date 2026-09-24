import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StudentJourneyOverview, type StudentJourneyStage } from "@/components/student/StudentJourneyOverview";
import { getStudentUser } from "@/lib/auth/access";
import { applicationEventDisplayMessage, daysUntilDeadline, formatDeadline, isActiveApplication, isPastDeadline, nextActiveDeadline, studentHistoryDisplayMessage } from "@/lib/phase4";
import { isPublishableProgram } from "@/lib/source-verification";

export const dynamic = "force-dynamic";

export default async function StudentEntry() {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) redirect("/login");
  if (!isStudent) redirect("/unauthorized");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name,onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return <DashboardUnavailable />;
  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  const [
    { data: items, error: itemsError },
    { data: documents, error: documentsError },
    { data: recommendations, error: recommendationsError },
    { data: applications, error: applicationsError },
    { data: dossierHistory, error: dossierHistoryError },
  ] = await Promise.all([
    supabase.from("student_checklist_items").select("title,status").order("created_at"),
    supabase.from("documents").select("id,status"),
    supabase.from("program_recommendations").select("id,programs(name,source_url,application_url,verified_at,is_active,universities(name,is_active))").eq("is_archived", false),
    supabase.from("applications").select("id,status,deadline,next_action,programs(name),application_events(id,event_type,message,visible_to_student,created_at)").order("deadline", { ascending: true, nullsFirst: false }),
    supabase
      .from("student_history")
      .select("id,event_type,message,created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (itemsError || documentsError || recommendationsError || applicationsError) {
    return <DashboardUnavailable />;
  }

  const checklist = items || [];
  const studentDocuments = documents || [];
  const studentRecommendations = (recommendations || []).filter((recommendation) => {
    const program = Array.isArray(recommendation.programs) ? recommendation.programs[0] : recommendation.programs;
    return isPublishableProgram(program);
  });
  const studentApplications = applications || [];
  const documentHistory = dossierHistory || [];

  const applicationHistory = studentApplications.flatMap((application) => {
    const program = Array.isArray(application.programs) ? application.programs[0] : application.programs;
    const events = Array.isArray(application.application_events)
      ? application.application_events.filter((event) => event.visible_to_student === true)
      : [];

    return events.map((event) => ({
      id: `application-${event.id}`,
      kind: "Candidature" as const,
      message: applicationEventDisplayMessage(event.event_type, event.message),
      created_at: event.created_at,
      href: "/student/applications",
      context: program?.name || null,
    }));
  });

  const visibleHistory = [
    ...documentHistory.map((event) => ({
      id: `document-${event.id}`,
      kind: "Document" as const,
      message: studentHistoryDisplayMessage(event.message),
      created_at: event.created_at,
      href: "/student/documents",
      context: null,
    })),
    ...applicationHistory,
  ]
    .filter((event) => Boolean(event.created_at))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const completed = checklist.filter((item) => item.status === "completed").length;
  const progression = checklist.length ? Math.round((completed / checklist.length) * 100) : 0;
  const openChecklist = checklist.filter((item) => item.status === "todo");
  const nextItem = openChecklist[0];

  const approvedDocuments = studentDocuments.filter((document) => document.status === "approved").length;
  const documentsNeedingAction = studentDocuments.filter((document) => ["rejected", "replace_required"].includes(document.status)).length;
  const documentsUnderReview = studentDocuments.filter((document) => ["pending", "reviewed"].includes(document.status)).length;

  const activeApplications = studentApplications.filter((application) => isActiveApplication(application.status));
  const nextApplication = nextActiveDeadline(activeApplications);
  const nextDeadlineDays = nextApplication?.deadline
    ? daysUntilDeadline(nextApplication.deadline)
    : null;
  const deadlineOverdue = nextDeadlineDays !== null && nextDeadlineDays < 0;
  const deadlineSoon = nextDeadlineDays !== null && nextDeadlineDays >= 0 && nextDeadlineDays <= 7;
  const actionableApplications = activeApplications.filter((application) => Boolean(application.next_action?.trim()));
  const actionableApplication = actionableApplications[0];

  const hasStudentActionRequired = documentsNeedingAction > 0;
  const hasDeadlinePriority = deadlineOverdue || deadlineSoon;
  const hasRecordedNextStep = Boolean(actionableApplication?.next_action?.trim() || nextItem);
  const hasStudentFacingNextStep = hasStudentActionRequired || hasDeadlinePriority || hasRecordedNextStep;

  const nextAction = documentsNeedingAction
    ? {
        label: "Corriger mes documents",
        detail: `${documentsNeedingAction} document${documentsNeedingAction > 1 ? "s doivent" : " doit"} être remplacé${documentsNeedingAction > 1 ? "s" : ""} avant la suite du dossier.`,
        href: "/student/documents",
        owner: "À faire par vous",
      }
    : deadlineOverdue && nextApplication?.deadline
      ? {
          label: "Vérifier mes échéances",
          detail: `L’échéance enregistrée du ${formatDeadline(nextApplication.deadline)} est dépassée. Vérifiez cette candidature et confirmez la date sur la source officielle disponible.`,
          href: "/student/echeances",
          owner: "Échéance à vérifier",
        }
      : deadlineSoon && nextApplication?.deadline
        ? {
            label: "Voir mes échéances",
            detail: nextDeadlineDays === 0
              ? `Une échéance est enregistrée aujourd’hui (${formatDeadline(nextApplication.deadline)}). Consultez le calendrier du dossier et la source officielle.`
              : `Une échéance est enregistrée dans ${nextDeadlineDays} jour${nextDeadlineDays > 1 ? "s" : ""} (${formatDeadline(nextApplication.deadline)}). Consultez le calendrier du dossier et la source officielle.`,
            href: "/student/echeances",
            owner: "Échéance enregistrée",
          }
        : actionableApplication?.next_action?.trim()
          ? {
              label: "Voir ma candidature",
              detail: actionableApplication.next_action.trim(),
              href: "/student/applications",
              owner: "Prochaine action enregistrée",
            }
          : nextItem
            ? {
                label: "Continuer mes démarches",
                detail: nextItem.title,
                href: "/student/checklist",
                owner: "Étape enregistrée",
              }
            : documentsUnderReview
              ? {
                  label: "Voir mes documents",
                  detail: `${documentsUnderReview} document${documentsUnderReview > 1 ? "s sont" : " est"} actuellement en vérification chez AlmaGo. Aucune correction n’est demandée de votre côté pour ces pièces.`,
                  href: "/student/documents",
                  owner: "Chez AlmaGo",
                }
              : {
                  label: "Voir mes démarches",
                  detail: "Aucune action prioritaire n’est enregistrée pour le moment. Vous pouvez consulter les étapes connues de votre dossier.",
                  href: "/student/checklist",
                  owner: "Aucune action demandée",
                };

  const welcomeMessage = hasStudentActionRequired
    ? `${documentsNeedingAction} document${documentsNeedingAction > 1 ? "s demandent" : " demande"} une correction de votre part. Commencez par les pièces signalées ci-dessous.`
    : deadlineOverdue
      ? "Une échéance enregistrée pour une candidature active est dépassée. Vérifiez le calendrier du dossier et confirmez la date sur la source officielle."
      : deadlineSoon
        ? "Une échéance de candidature est proche. Consultez le calendrier du dossier pour voir la date enregistrée et la source officielle disponible."
        : hasRecordedNextStep
          ? "Une prochaine étape est enregistrée dans votre dossier. Consultez-la ci-dessous pour connaître le détail disponible."
          : documentsUnderReview
            ? `${documentsUnderReview} document${documentsUnderReview > 1 ? "s sont" : " est"} actuellement en vérification chez AlmaGo. Aucune correction n’est demandée de votre côté pour ces pièces.`
            : "Aucune action prioritaire n’est enregistrée actuellement. Vous pouvez consulter les différentes parties de votre dossier ci-dessous.";

  const journeyStages: StudentJourneyStage[] = [
    {
      label: "Profil",
      detail: "Informations renseignées",
      href: "/student/profile",
      tone: "done",
    },
    {
      label: "Documents",
      detail: studentDocuments.length
        ? `${studentDocuments.length} document${studentDocuments.length > 1 ? "s" : ""} enregistré${studentDocuments.length > 1 ? "s" : ""}`
        : "Aucun document enregistré",
      href: "/student/documents",
      tone: documentsNeedingAction ? "active" : studentDocuments.length ? "done" : "neutral",
    },
    {
      label: "Orientation",
      detail: studentRecommendations.length
        ? `${studentRecommendations.length} piste${studentRecommendations.length > 1 ? "s" : ""} proposée${studentRecommendations.length > 1 ? "s" : ""}`
        : "Aucune piste enregistrée",
      href: "/student/orientation",
      tone: studentRecommendations.length ? "active" : "neutral",
    },
    {
      label: "Préparation",
      detail: checklist.length ? `${completed} sur ${checklist.length} étape${checklist.length > 1 ? "s" : ""}` : "Aucune étape enregistrée",
      href: "/student/checklist",
      tone: checklist.length && completed === checklist.length ? "done" : checklist.length ? "active" : "neutral",
    },
    {
      label: "Candidatures",
      detail: studentApplications.length
        ? `${studentApplications.length} dossier${studentApplications.length > 1 ? "s" : ""} enregistré${studentApplications.length > 1 ? "s" : ""}`
        : "Aucune candidature enregistrée",
      href: "/student/applications",
      tone: activeApplications.length ? "active" : studentApplications.length ? "done" : "neutral",
    },
    {
      label: "Démarches suivantes",
      detail: activeApplications.length ? "À suivre selon vos dossiers actifs" : "À venir selon votre parcours",
      tone: activeApplications.length ? "active" : "neutral",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <section className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Mon dossier</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Bonjour {profile.first_name || "étudiant"}, voici où en est votre dossier.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {welcomeMessage}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusPill label="À corriger par vous" value={documentsNeedingAction} tone={documentsNeedingAction ? "warning" : "neutral"} />
          <StatusPill label="Chez AlmaGo" value={documentsUnderReview} tone="info" />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.82fr)]" aria-label="Situation actuelle du dossier">
        <Card className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-[0_24px_55px_-38px_rgba(41,48,139,0.5)]">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Où en est votre dossier ?</p>
              <Badge variant={hasStudentActionRequired || deadlineOverdue ? "warning" : hasDeadlinePriority || hasRecordedNextStep || documentsUnderReview ? "info" : "neutral"}>
                {hasStudentActionRequired
                  ? "Correction demandée"
                  : deadlineOverdue
                    ? "Échéance dépassée"
                    : deadlineSoon
                      ? "Échéance proche"
                      : hasRecordedNextStep
                        ? "Étape enregistrée"
                        : documentsUnderReview
                          ? "En vérification"
                          : "Aucune action prioritaire"}
              </Badge>
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              {hasStudentFacingNextStep ? "Votre prochaine étape" : documentsUnderReview ? "Votre dossier est en cours de vérification" : "Votre dossier est à jour pour le moment"}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">{nextAction.detail}</p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-bold text-slate-600">
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${hasStudentActionRequired || deadlineOverdue ? "bg-[var(--accent)]" : "bg-[var(--brand)]"}`} />
              {nextAction.owner}
            </div>

            <div className="mt-6 [&_a]:w-full sm:[&_a]:w-auto">
              <ButtonLink href={nextAction.href}>{nextAction.label}</ButtonLink>
            </div>
          </div>
        </Card>

        <Card className="bg-[#fbfbfd] shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Préparation du dossier</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Démarches enregistrées</h2>

          <div className="mt-6 flex items-end justify-between gap-3">
            <p className="text-3xl font-bold tracking-tight text-slate-950">
              {checklist.length ? `${completed} sur ${checklist.length}` : "Aucune étape"}
            </p>
            {checklist.length > 0 && <span className="text-sm font-bold text-[var(--brand)]">{progression}%</span>}
          </div>

          {checklist.length > 0 && (
            <div className="mt-4">
              <ProgressBar value={progression} label="Étapes terminées dans le dossier" />
            </div>
          )}

          <p className="mt-5 text-sm leading-6 text-slate-600">
            Cette progression concerne uniquement les démarches enregistrées dans AlmaGo. Elle ne représente ni une admission ni une validation finale.
          </p>

          <div className="mt-5">
            <ButtonLink href="/student/checklist" variant="secondary">Voir mes démarches</ButtonLink>
          </div>
        </Card>
      </section>

      <StudentJourneyOverview stages={journeyStages} />

      <section className="mt-10" aria-labelledby="history-title">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Suivi du dossier</p>
            <h2 id="history-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Historique de mon dossier
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Retrouvez ici les derniers événements visibles enregistrés pour vos documents et vos candidatures.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden bg-white shadow-none">
          {visibleHistory.length ? (
            <ol className="divide-y divide-[var(--border)]" aria-label="Derniers événements visibles du dossier">
              {visibleHistory.map((event) => (
                <li key={event.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${
                      event.kind === "Document"
                        ? "bg-blue-50 text-blue-800"
                        : "bg-[var(--brand-soft)] text-[var(--brand)]"
                    }`}
                  >
                    {event.kind}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-6 text-slate-900">{event.message}</p>
                    {event.context && (
                      <p className="mt-1 text-xs leading-5 text-slate-500">{event.context}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">{formatHistoryDate(event.created_at)}</p>
                  </div>
                  <Link
                    href={event.href}
                    className="inline-flex min-h-10 items-center text-sm font-bold text-[var(--brand)] hover:underline hover:underline-offset-4"
                  >
                    Voir
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-[var(--radius-control)] bg-[var(--surface-muted)]/55 p-5">
              <p className="font-bold text-slate-900">Aucun événement visible n’est encore enregistré.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Les mises à jour visibles de documents et de candidatures apparaîtront ici lorsqu’elles seront enregistrées.
              </p>
              {dossierHistoryError && (
                <p className="mt-3 text-xs leading-5 text-amber-800">
                  L’historique des documents est temporairement incomplet.
                </p>
              )}
            </div>
          )}
        </Card>
      </section>

      <section className="mt-10" aria-labelledby="overview-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Vue d’ensemble</p>
          <h2 id="overview-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">Les éléments de votre dossier</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            href="/student/documents"
            title="Documents"
            value={studentDocuments.length}
            detail={documentsNeedingAction ? `${documentsNeedingAction} à corriger` : approvedDocuments ? `${approvedDocuments} validé${approvedDocuments > 1 ? "s" : ""}` : "Pièces enregistrées"}
            tone={documentsNeedingAction ? "warning" : "neutral"}
          />
          <OverviewCard
            href="/student/orientation"
            title="Orientation"
            value={studentRecommendations.length}
            detail="Pistes d’études enregistrées"
          />
          <OverviewCard
            href="/student/applications"
            title="Candidatures"
            value={studentApplications.length}
            detail={activeApplications.length ? `${activeApplications.length} active${activeApplications.length > 1 ? "s" : ""}` : "Dossiers enregistrés"}
          />
          <OverviewCard
            href="/student/checklist"
            title="Démarches"
            value={checklist.length}
            detail={checklist.length ? `${completed} terminée${completed > 1 ? "s" : ""}` : "Étapes enregistrées"}
          />
        </div>
      </section>

      <Card className="mt-8 overflow-hidden border-[var(--border)] bg-white shadow-none">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Badge variant={deadlineOverdue ? "warning" : "neutral"}>
              {deadlineOverdue ? "Échéance dépassée" : "Prochaine échéance"}
            </Badge>
            <h2 className="mt-3 text-xl font-bold text-slate-950">
              {nextApplication?.deadline ? formatDeadline(nextApplication.deadline) : "Aucune date enregistrée"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {nextApplication?.next_action || (nextApplication
                ? "Consultez les détails de cette candidature active pour vérifier la prochaine action."
                : "Aucune échéance n’est enregistrée pour les candidatures actives.")}
            </p>
          </div>

          <div className="shrink-0">
            <ButtonLink href="/student/echeances" variant="secondary">Voir toutes mes échéances</ButtonLink>
          </div>
        </div>
      </Card>
    </main>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "info" | "neutral";
}) {
  const toneClass =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "info"
        ? "border-blue-200 bg-blue-50 text-blue-900"
        : "border-[var(--border)] bg-white text-slate-700";

  return (
    <div className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold ${toneClass}`}>
      <span className="text-lg font-bold">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function OverviewCard({
  href,
  title,
  value,
  detail,
  tone = "neutral",
}: {
  href: string;
  title: string;
  value: number;
  detail: string;
  tone?: "warning" | "neutral";
}) {
  return (
    <Link
      href={href}
      className="professional-hover group rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span
          aria-hidden="true"
          className={`grid h-9 w-9 place-items-center rounded-full text-sm transition-transform group-hover:translate-x-0.5 ${
            tone === "warning"
              ? "bg-amber-50 text-amber-800"
              : "bg-[var(--brand-soft)] text-[var(--brand)]"
          }`}
        >
          →
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
    </Link>
  );
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date non disponible";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function DashboardUnavailable() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader badge="Espace étudiant" title="Mon dossier Allemagne" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Dossier temporairement indisponible</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Nous n’arrivons pas à afficher votre dossier pour le moment. Rien n’a été supprimé ou modifié. Vous pouvez réessayer dans quelques instants.
          </p>
        </div>
        <div className="mt-5">
          <ButtonLink href="/student">Réessayer</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
