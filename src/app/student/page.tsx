import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/server";
import { formatDeadline, isActiveApplication, isPastDeadline, nextActiveDeadline } from "@/lib/phase4";

export const dynamic = "force-dynamic";

export default async function StudentEntry() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("first_name,onboarding_completed").eq("id", user.id).maybeSingle();
  if (profileError) return <DashboardUnavailable />;
  if (!profile?.onboarding_completed) redirect("/student/onboarding");
  const [{ data: items, error: itemsError }, { data: documents, error: documentsError }, { data: recommendations, error: recommendationsError }, { data: applications, error: applicationsError }] = await Promise.all([
    supabase.from("student_checklist_items").select("title,status").order("created_at"),
    supabase.from("documents").select("id,status"),
    supabase.from("program_recommendations").select("id,programs(name,universities(name))").eq("is_archived", false),
    supabase.from("applications").select("id,status,deadline,next_action,programs(name)").order("deadline", { ascending: true, nullsFirst: false }),
  ]);
  if (itemsError || documentsError || recommendationsError || applicationsError) return <DashboardUnavailable />;

  const checklist = items || [];
  const completed = checklist.filter((item) => item.status === "completed").length;
  const progression = checklist.length ? Math.round((completed / checklist.length) * 100) : 0;
  const actionableChecklist = checklist.filter((item) => ["waiting_student", "todo", "in_progress", "not_started"].includes(item.status));
  const waitingAlmaGo = checklist.filter((item) => item.status === "waiting_almago");
  const nextItem = actionableChecklist.find((item) => item.status === "waiting_student") || actionableChecklist[0];
  const documentsNeedingAction = (documents || []).filter((document) => ["rejected", "replace_required"].includes(document.status)).length;
  const activeApplications = (applications || []).filter((application) => isActiveApplication(application.status));
  const nextApplication = nextActiveDeadline(activeApplications);
  const deadlineOverdue = nextApplication?.deadline ? isPastDeadline(nextApplication.deadline) : false;
  const actionableApplications = activeApplications.filter((application) => Boolean(application.next_action));
  const actionableApplication = actionableApplications[0];
  const studentActionCount = actionableChecklist.length + documentsNeedingAction + actionableApplications.length;
  const hasActionRequired = studentActionCount > 0;
  const nextAction = documentsNeedingAction
    ? { label: "Corriger mes documents", detail: `${documentsNeedingAction} document${documentsNeedingAction > 1 ? "s doivent" : " doit"} être remplacé${documentsNeedingAction > 1 ? "s" : ""} avant la suite du dossier.`, href: "/student/documents", owner: "À faire par toi" }
    : actionableApplication?.next_action
      ? { label: "Voir ma candidature", detail: actionableApplication.next_action, href: "/student/applications", owner: "À faire par toi" }
      : nextItem
        ? { label: "Continuer ma checklist", detail: nextItem.title, href: "/student/checklist", owner: "À faire par toi" }
        : { label: "Consulter ma checklist", detail: "Aucune action à faire n’est enregistrée pour le moment. Consulte tes démarches pour voir les étapes connues.", href: "/student/checklist", owner: "Suivi du dossier" };

  return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
    <PageHeader
      badge="Espace étudiant"
      title={<>Mon dossier Allemagne</>}
      description={<>Bonjour {profile.first_name || "étudiant"}. Retrouvez ici l’état réel de votre dossier, votre prochaine action et les éléments suivis par AlmaGo.</>}
      actions={<ButtonLink href={nextAction.href}>{nextAction.label}</ButtonLink>}
    />

    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="bg-slate-950 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">État du dossier</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Progression générale</h2>
          </div>
          <Badge variant={checklist.length > 0 && progression === 100 ? "success" : "info"}>{checklist.length ? `${completed} / ${checklist.length} étapes` : "Aucune étape"}</Badge>
        </div>
        <div className="mt-8">
          <div className="mb-3 flex items-end justify-between gap-4">
            <p className="text-5xl font-semibold tracking-tight">{checklist.length ? `${progression}%` : "—"}</p>
            <p className="text-right text-sm text-slate-300">Basé sur votre checklist actuelle</p>
          </div>
          {checklist.length > 0 && <div className="[&_[role=progressbar]]:bg-white/15 [&_[role=progressbar]>div]:bg-emerald-300"><ProgressBar value={progression} label="Progression du dossier" /></div>}
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-300">La progression indique les étapes déjà terminées. Elle ne remplace pas la vérification finale des documents ou des candidatures.</p>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <Badge variant={hasActionRequired ? "warning" : waitingAlmaGo.length ? "info" : "neutral"}>{hasActionRequired ? "Action requise" : waitingAlmaGo.length ? "En attente" : "Aucune action enregistrée"}</Badge>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{nextAction.owner}</span>
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">Prochaine étape</h2>
        <p className="mt-3 text-base leading-7 text-slate-700">{nextAction.detail}</p>
        <div className="mt-6"><ButtonLink href={nextAction.href}>{nextAction.label}</ButtonLink></div>
      </Card>
    </div>

    <section className="mt-8" aria-labelledby="overview-title">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Vue d’ensemble</p>
          <h2 id="overview-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Ce qui demande votre attention</h2>
        </div>
        <ButtonLink href="/student/checklist" variant="secondary">Voir toutes les étapes</ButtonLink>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="À traiter" value={studentActionCount} detail="Actions étudiant, documents ou candidatures." tone={studentActionCount ? "warning" : "success"} />
        <Metric title="Suivi AlmaGo" value={waitingAlmaGo.length} detail="Éléments en attente côté équipe." tone="info" />
        <Metric title="Recommandations" value={recommendations?.length || 0} detail="Programmes actuellement proposés." />
        <Metric title="Candidatures" value={applications?.length || 0} detail="Dossiers suivis dans votre espace." />
      </div>
    </section>

    <Card className="mt-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <Badge variant={deadlineOverdue ? "warning" : "neutral"}>{deadlineOverdue ? "Échéance dépassée" : "Prochaine échéance"}</Badge>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">{nextApplication?.deadline ? formatDeadline(nextApplication.deadline) : "Aucune date enregistrée"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{nextApplication?.next_action || (nextApplication ? "Vérifiez les détails de cette candidature active." : "Aucune échéance n’est enregistrée pour les candidatures actives.")}</p>
        </div>
        <ButtonLink href="/student/applications" variant="secondary">Suivre mes candidatures</ButtonLink>
      </div>
    </Card>
  </main>;
}

function Metric({ title, value, detail, tone = "neutral" }: { title: string; value: number; detail: string; tone?: "success" | "info" | "warning" | "neutral" }) {
  return <Card as="article"><h3><Badge variant={tone}>{title}</Badge></h3><p className="mt-5 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></Card>;
}

function DashboardUnavailable() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader badge="Espace étudiant" title="Mon dossier Allemagne" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Dossier temporairement indisponible</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Impossible de charger les informations de votre dossier. Aucune modification n’a été effectuée. Réessayez dans quelques instants.</p>
        </div>
        <div className="mt-5"><ButtonLink href="/student">Réessayer</ButtonLink></div>
      </Card>
    </main>
  );
}
