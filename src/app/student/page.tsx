import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentEntry() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("first_name,onboarding_completed").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/student/onboarding");
  const [{ data: items }, { data: documents }, { data: recommendations }, { data: applications }] = await Promise.all([
    supabase.from("student_checklist_items").select("title,status").order("created_at"),
    supabase.from("documents").select("id,status"),
    supabase.from("program_recommendations").select("id,programs(name,universities(name))").eq("is_archived", false),
    supabase.from("applications").select("id,status,deadline,next_action,programs(name)").order("deadline", { ascending: true, nullsFirst: false }),
  ]);
  const checklist = items || [];
  const completed = checklist.filter((item) => item.status === "completed").length;
  const progression = checklist.length ? Math.round((completed / checklist.length) * 100) : 0;
  const waitingStudent = checklist.filter((item) => item.status === "waiting_student");
  const waitingAlmaGo = checklist.filter((item) => item.status === "waiting_almago");
  const nextItem = waitingStudent[0] || checklist.find((item) => ["todo", "in_progress", "not_started"].includes(item.status));
  const documentsNeedingAction = (documents || []).filter((document) => ["rejected", "replace_required"].includes(document.status)).length;
  const nextApplication = applications?.[0];
  const actionableApplication = applications?.find((application) => Boolean(application.next_action));
  const hasActionRequired = documentsNeedingAction > 0 || Boolean(actionableApplication?.next_action) || Boolean(nextItem);
  const nextAction = documentsNeedingAction
    ? { label: "Remplacer mes documents", detail: `${documentsNeedingAction} document${documentsNeedingAction > 1 ? "s sont" : " est"} à corriger pour poursuivre ton dossier.`, href: "/student/documents" }
    : actionableApplication?.next_action
      ? { label: "Voir ma candidature", detail: actionableApplication.next_action, href: "/student/applications" }
      : nextItem
        ? { label: "Continuer ma checklist", detail: nextItem.title, href: "/student/checklist" }
        : { label: "Voir ma checklist", detail: "Ton dossier est à jour. AlmaGo reviendra vers toi si nécessaire.", href: "/student/checklist" };

  return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
    <header className="mb-8"><Badge variant="success">Tableau de bord étudiant</Badge><h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Bonjour, {profile.first_name || "étudiant"} 👋</h1><p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">Suis ton projet d’études en Allemagne et retrouve toujours la prochaine étape utile.</p></header>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <Card className="bg-gradient-to-br from-emerald-950 to-emerald-800 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-100">Progression de ton dossier</p><p className="mt-3 text-4xl font-semibold">{progression}%</p></div><Badge variant={progression === 100 ? "success" : "info"}>{completed} sur {checklist.length} étapes</Badge></div>
        <div className="mt-6 [&_[role=progressbar]]:bg-white/20 [&_[role=progressbar]>div]:bg-emerald-300"><ProgressBar value={progression} label="Progression du dossier" /></div>
        <p className="mt-4 text-sm leading-6 text-emerald-100">Chaque étape terminée rapproche ton dossier de son dépôt.</p>
      </Card>
      <Card><Badge variant={hasActionRequired ? "warning" : "success"}>{hasActionRequired ? "Action requise" : "Dossier à jour"}</Badge><h2 className="mt-4 text-xl font-semibold text-slate-950">Ta prochaine action</h2><p className="mt-2 text-sm leading-6 text-slate-600">{nextAction.detail}</p><div className="mt-5"><ButtonLink href={nextAction.href}>{nextAction.label}</ButtonLink></div></Card>
    </div>
    <section className="mt-8" aria-labelledby="overview-title"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">Vue d’ensemble</p><h2 id="overview-title" className="mt-1 text-2xl font-semibold text-slate-950">Ton parcours aujourd’hui</h2></div><ButtonLink href="/student/checklist" variant="secondary">Voir toutes les étapes</ButtonLink></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Actions pour toi" value={waitingStudent.length + documentsNeedingAction} detail="Tâches ou documents à traiter." tone={waitingStudent.length + documentsNeedingAction ? "warning" : "success"} />
        <Metric title="Avec AlmaGo" value={waitingAlmaGo.length} detail="Éléments suivis par notre équipe." tone="info" />
        <Metric title="Recommandations" value={recommendations?.length || 0} detail="Programmes sélectionnés pour toi." />
        <Metric title="Candidatures" value={applications?.length || 0} detail="Dossiers actuellement suivis." />
      </div>
    </section>
    <Card className="mt-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><Badge variant="neutral">Prochaine échéance</Badge><h2 className="mt-3 text-xl font-semibold text-slate-950">{nextApplication?.deadline || "Aucune date planifiée"}</h2><p className="mt-1 text-sm text-slate-600">{nextApplication?.next_action || "Nous t’informerons dès qu’une nouvelle échéance sera disponible."}</p></div><ButtonLink href="/student/applications" variant="secondary">Suivre mes candidatures</ButtonLink></div></Card>
  </main>;
}

function Metric({ title, value, detail, tone = "neutral" }: { title: string; value: number; detail: string; tone?: "success" | "info" | "warning" | "neutral" }) {
  return <Card as="article"><h3><Badge variant={tone}>{title}</Badge></h3><p className="mt-5 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></Card>;
}
