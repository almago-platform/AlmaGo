import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StudentJourneyOverview, type StudentJourneyStage } from "@/components/student/StudentJourneyOverview";
import { createClient } from "@/lib/supabase/server";
import { formatDeadline, isActiveApplication, isPastDeadline, nextActiveDeadline } from "@/lib/phase4";

export const dynamic = "force-dynamic";

export default async function StudentEntry() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
  ] = await Promise.all([
    supabase.from("student_checklist_items").select("title,status").order("created_at"),
    supabase.from("documents").select("id,status"),
    supabase.from("program_recommendations").select("id,programs(name,universities(name))").eq("is_archived", false),
    supabase.from("applications").select("id,status,deadline,next_action,programs(name)").order("deadline", { ascending: true, nullsFirst: false }),
  ]);

  if (itemsError || documentsError || recommendationsError || applicationsError) {
    return <DashboardUnavailable />;
  }

  const checklist = items || [];
  const studentDocuments = documents || [];
  const studentRecommendations = recommendations || [];
  const studentApplications = applications || [];

  const completed = checklist.filter((item) => item.status === "completed").length;
  const progression = checklist.length ? Math.round((completed / checklist.length) * 100) : 0;
  const actionableChecklist = checklist.filter((item) => ["waiting_student", "todo", "in_progress", "not_started"].includes(item.status));
  const waitingAlmaGo = checklist.filter((item) => item.status === "waiting_almago");
  const nextItem = actionableChecklist.find((item) => item.status === "waiting_student") || actionableChecklist[0];

  const approvedDocuments = studentDocuments.filter((document) => document.status === "approved").length;
  const documentsNeedingAction = studentDocuments.filter((document) => ["rejected", "replace_required"].includes(document.status)).length;

  const activeApplications = studentApplications.filter((application) => isActiveApplication(application.status));
  const nextApplication = nextActiveDeadline(activeApplications);
  const deadlineOverdue = nextApplication?.deadline ? isPastDeadline(nextApplication.deadline) : false;
  const actionableApplications = activeApplications.filter((application) => Boolean(application.next_action));
  const actionableApplication = actionableApplications[0];

  const studentActionCount = actionableChecklist.length + documentsNeedingAction + actionableApplications.length;
  const hasActionRequired = studentActionCount > 0;

  const nextAction = documentsNeedingAction
    ? {
        label: "Corriger mes documents",
        detail: `${documentsNeedingAction} document${documentsNeedingAction > 1 ? "s doivent" : " doit"} être remplacé${documentsNeedingAction > 1 ? "s" : ""} avant la suite du dossier.`,
        href: "/student/documents",
        owner: "À faire par vous",
      }
    : actionableApplication?.next_action
      ? {
          label: "Voir ma candidature",
          detail: actionableApplication.next_action,
          href: "/student/applications",
          owner: "À faire par vous",
        }
      : nextItem
        ? {
            label: "Continuer mes démarches",
            detail: nextItem.title,
            href: "/student/checklist",
            owner: "À faire par vous",
          }
        : {
            label: "Voir mes démarches",
            detail: "Aucune action prioritaire n’est enregistrée pour le moment. Vous pouvez consulter les étapes connues de votre dossier.",
            href: "/student/checklist",
            owner: waitingAlmaGo.length ? "Suivi par AlmaGo" : "Suivi du dossier",
          };

  const welcomeMessage = hasActionRequired
    ? `Vous avez ${studentActionCount} action${studentActionCount > 1 ? "s" : ""} à traiter. Commencez par la plus importante ci-dessous.`
    : waitingAlmaGo.length
      ? `Aucune action n’est demandée de votre côté actuellement. AlmaGo suit ${waitingAlmaGo.length} étape${waitingAlmaGo.length > 1 ? "s" : ""} de votre dossier.`
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
            Bonjour {profile.first_name || "étudiant"}, voici votre dossier.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {welcomeMessage}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusPill label="À traiter" value={studentActionCount} tone={studentActionCount ? "warning" : "neutral"} />
          <StatusPill label="Suivi AlmaGo" value={waitingAlmaGo.length} tone="info" />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.82fr)]" aria-label="Priorités du dossier">
        <Card className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-[0_24px_55px_-38px_rgba(41,48,139,0.5)]">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Ce qui compte maintenant</p>
              <Badge variant={hasActionRequired ? "warning" : waitingAlmaGo.length ? "info" : "neutral"}>
                {hasActionRequired ? "Action à faire" : waitingAlmaGo.length ? "Suivi en cours" : "Aucune action prioritaire"}
              </Badge>
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              {hasActionRequired ? "Votre prochaine action" : "Votre dossier est à jour pour le moment"}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">{nextAction.detail}</p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-bold text-slate-600">
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${hasActionRequired ? "bg-[var(--accent)]" : "bg-[var(--brand)]"}`} />
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

      <Card className="mt-8 border-[var(--brand-border)] bg-[var(--brand-soft)] shadow-none">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Projet Allemagne</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Choisissez votre parcours d’accompagnement</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Université, préparation allemand + études, Master + langue, ou langue uniquement : précisez votre objectif pour adapter les prochaines étapes.</p>
          </div>
          <ButtonLink href="/student/project">Définir mon projet</ButtonLink>
        </div>
      </Card>

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
            <ButtonLink href="/student/applications" variant="secondary">Voir mes candidatures</ButtonLink>
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
