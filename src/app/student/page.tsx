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
      href: "/student/pathway",
      tone: activeApplications.length ? "active" : "neutral",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <section className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_28px_70px_-58px_rgba(28,33,36,0.5)]">
        <div className="grid gap-6 bg-[linear-gradient(115deg,#1c2124_0%,#252b2f_65%,#332a22_100%)] px-5 py-6 text-white sm:px-7 sm:py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#fcb50a]">Mon dossier AlmaGo</p>
            <h1 className="editorial-accent mt-2 text-[2rem] leading-[1.05] sm:text-[2.7rem]">
              Bonjour {profile.first_name || "étudiant"}.
              <br />
              <span className="text-[#f7f4ec]">Voici ce qui compte maintenant.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d9d3c7] sm:text-base sm:leading-7">
              {welcomeMessage}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:min-w-[17rem]">
            <StatusPill label="À traiter" value={studentActionCount} tone={studentActionCount ? "warning" : "neutral"} />
            <StatusPill label="Suivi AlmaGo" value={waitingAlmaGo.length} tone="info" />
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
          <section className="relative border-b border-[var(--border)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div aria-hidden="true" className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-[var(--brand)]" />
            <div className="pl-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">Prochaine action</p>
                <Badge variant={hasActionRequired ? "warning" : waitingAlmaGo.length ? "info" : "neutral"}>
                  {hasActionRequired ? "À faire maintenant" : waitingAlmaGo.length ? "Suivi en cours" : "À jour"}
                </Badge>
              </div>
              <h2 className="editorial-accent mt-3 text-[1.7rem] leading-[1.08] text-[var(--foreground)] sm:text-[2.15rem]">
                {hasActionRequired ? nextAction.label : "Votre dossier est à jour pour le moment."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                {nextAction.detail}
              </p>

              <div className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 text-xs font-bold text-[var(--muted)]">
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${hasActionRequired ? "bg-[var(--accent)]" : "bg-[var(--brand)]"}`} />
                {nextAction.owner}
              </div>

              <div className="mt-5 [&_a]:w-full sm:[&_a]:w-auto">
                <ButtonLink href={nextAction.href}>{hasActionRequired ? nextAction.label : "Voir mes démarches"}</ButtonLink>
              </div>
            </div>
          </section>

          <section className="bg-[var(--surface-subtle)] p-5 sm:p-6">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Préparation du dossier</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
                  {checklist.length ? `${completed}/${checklist.length}` : "—"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">démarches terminées</p>
              </div>
              {checklist.length > 0 && <span className="text-lg font-bold text-[var(--brand)]">{progression}%</span>}
            </div>

            {checklist.length > 0 && (
              <div className="mt-4">
                <ProgressBar value={progression} label="Étapes terminées dans le dossier" />
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              Cette progression décrit uniquement les éléments enregistrés dans AlmaGo. Elle ne représente ni une admission ni une validation finale.
            </p>

            <div className="mt-4 [&_a]:w-full">
              <ButtonLink href="/student/checklist" variant="secondary">Voir mes démarches</ButtonLink>
            </div>
          </section>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-labelledby="overview-title">
        <h2 id="overview-title" className="sr-only">Les éléments de votre dossier</h2>
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
      </section>

      <StudentJourneyOverview stages={journeyStages} />

      <section className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <Card className="border-[var(--brand-border)] bg-[var(--brand-soft)]/55 shadow-none">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand)]">Projet Allemagne</p>
          <h2 className="editorial-accent mt-2 text-[1.55rem] leading-[1.1] text-[var(--foreground)]">
            Précisez votre parcours pour adapter les prochaines étapes.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Université, préparation allemand + études, Master + langue ou langue uniquement : votre objectif sert de base au parcours affiché.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <ButtonLink href="/student/pathway">Voir mon parcours</ButtonLink>
            <ButtonLink href="/student/project" variant="secondary">Définir mon projet</ButtonLink>
          </div>
        </Card>

        <Card className="shadow-none">
          <Badge variant={deadlineOverdue ? "warning" : "neutral"}>
            {deadlineOverdue ? "Échéance dépassée" : "Prochaine échéance"}
          </Badge>
          <h2 className="mt-3 text-xl font-bold text-[var(--foreground)]">
            {nextApplication?.deadline ? formatDeadline(nextApplication.deadline) : "Aucune date enregistrée"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {nextApplication?.next_action || (nextApplication
              ? "Consultez cette candidature active pour vérifier la prochaine action."
              : "Aucune échéance n’est enregistrée pour vos candidatures actives.")}
          </p>
          <div className="mt-5 [&_a]:w-full">
            <ButtonLink href="/student/applications" variant="secondary">Voir mes candidatures</ButtonLink>
          </div>
        </Card>
      </section>

      <section className="mt-7 rounded-[1rem] border border-[var(--border)] bg-[#1c2124] px-5 py-5 text-white sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[#fcb50a]">Votre repère AlmaGo</p>
            <h2 className="mt-2 text-lg font-bold sm:text-xl">Vous gardez les décisions. AlmaGo garde les étapes lisibles.</h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-[#d9d3c7] sm:text-sm sm:leading-6">
              Revenez ici pour voir ce qui est enregistré, ce qui manque et la prochaine action utile, sans remplacer les décisions des universités ou des autorités.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#f7f4ec]">Comprendre</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#f7f4ec]">Préparer</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#f7f4ec]">Vérifier</span>
          </div>
        </div>
      </section>
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
    <div className={`inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border px-3.5 py-2 text-sm font-semibold ${toneClass}`}>
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
