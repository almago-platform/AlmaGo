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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        badge="Espace étudiant"
        title="Votre dossier"
        description={<>Bonjour {profile.first_name || "étudiant"}. Retrouvez vos démarches, documents et candidatures au même endroit.</>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.85fr)]">
        <Card className="relative overflow-hidden border-emerald-200 shadow-none">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[var(--brand)]" />
          <div className="pl-2">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">À suivre maintenant</p>
              <Badge variant={hasActionRequired ? "warning" : waitingAlmaGo.length ? "info" : "neutral"}>
                {hasActionRequired ? "Action à faire" : waitingAlmaGo.length ? "En attente" : "Aucune action enregistrée"}
              </Badge>
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Votre prochaine étape</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">{nextAction.detail}</p>
            <p className="mt-4 text-sm font-medium text-slate-500">Responsable : {nextAction.owner}</p>
            <div className="mt-6 [&_a]:w-full sm:[&_a]:w-auto"><ButtonLink href={nextAction.href}>{nextAction.label}</ButtonLink></div>
          </div>
        </Card>

        <Card className="shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Préparation</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Étapes du dossier</h2>
          <div className="mt-6 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold text-slate-950">{checklist.length ? `${completed} sur ${checklist.length}` : "Aucune étape"}</p>
            {checklist.length > 0 && <span className="text-sm font-semibold text-[var(--brand)]">{progression}%</span>}
          </div>
          {checklist.length > 0 && <div className="mt-4"><ProgressBar value={progression} label="Étapes terminées dans le dossier" /></div>}
          <p className="mt-5 text-sm leading-6 text-slate-600">Ce suivi concerne les démarches enregistrées. Il ne représente ni une admission ni une validation finale.</p>
          <div className="mt-5"><ButtonLink href="/student/checklist" variant="secondary">Voir les démarches</ButtonLink></div>
        </Card>
      </div>

      <section className="mt-10" aria-labelledby="overview-title">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Vue d’ensemble</p>
          <h2 id="overview-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Le suivi de votre dossier</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric title="À traiter" value={studentActionCount} detail="Actions enregistrées pour vous." tone={studentActionCount ? "warning" : "neutral"} />
          <Metric title="En attente côté AlmaGo" value={waitingAlmaGo.length} detail="Étapes suivies par l’équipe." tone="info" />
          <Metric title="Recommandations" value={recommendations?.length || 0} detail="Pistes d’études proposées." />
          <Metric title="Candidatures" value={applications?.length || 0} detail="Dossiers enregistrés." />
        </div>
      </section>

      <Card className="mt-8 shadow-none">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Badge variant={deadlineOverdue ? "warning" : "neutral"}>{deadlineOverdue ? "Échéance dépassée" : "Prochaine échéance"}</Badge>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">{nextApplication?.deadline ? formatDeadline(nextApplication.deadline) : "Aucune date enregistrée"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{nextApplication?.next_action || (nextApplication ? "Vérifiez les détails de cette candidature active." : "Aucune échéance n’est enregistrée pour les candidatures actives.")}</p>
          </div>
          <div className="shrink-0"><ButtonLink href="/student/applications" variant="secondary">Voir mes candidatures</ButtonLink></div>
        </div>
      </Card>
    </main>
  );
}

function Metric({ title, value, detail, tone = "neutral" }: { title: string; value: number; detail: string; tone?: "success" | "info" | "warning" | "neutral" }) {
  return <Card as="article" className="shadow-none"><h3><Badge variant={tone}>{title}</Badge></h3><p className="mt-4 text-2xl font-semibold text-slate-950">{value}</p><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></Card>;
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
