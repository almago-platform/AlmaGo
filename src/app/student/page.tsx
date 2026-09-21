import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentEntry() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("first_name,onboarding_completed").eq("id", user.id).single();
  if (!profile?.onboarding_completed) redirect("/student/onboarding");
  const [{ data: items }, { data: documents }] = await Promise.all([
    supabase.from("student_checklist_items").select("title,status").order("created_at"),
    supabase.from("documents").select("id,status"),
  ]);
  const [{ data: recommendations }, { data: applications }] = await Promise.all([
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
  return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Tableau de bord</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Bonjour, {profile.first_name || "étudiant"} 👋</h1><p className="mt-2 text-slate-600">Étudier en Allemagne, étape par étape. 🇹🇳 → 🇩🇪</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><DashboardCard title="Progression du dossier" value={`${progression}%`} detail={`${completed} tâche${completed > 1 ? "s" : ""} terminée${completed > 1 ? "s" : ""} sur ${checklist.length}`} /><DashboardCard title="Action requise" value={String(waitingStudent.length + documentsNeedingAction)} detail="Tâches ou documents qui demandent ton intervention." /><DashboardCard title="En attente d’AlmaGo" value={String(waitingAlmaGo.length)} detail="Éléments en cours de traitement par notre équipe." /><DashboardCard title="Documents" value={String((documents || []).length)} detail={documentsNeedingAction ? `${documentsNeedingAction} document(s) à remplacer.` : "Aucun document à remplacer."} /></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><DashboardCard title="Recommandations" value={String(recommendations?.length || 0)} detail="Programmes sélectionnés par AlmaGo." /><DashboardCard title="Candidatures en cours" value={String(applications?.length || 0)} detail="Retrouve la timeline de chaque dossier." /><DashboardCard title="Prochaine échéance" value={nextApplication?.deadline || "—"} detail={nextApplication?.next_action || "Aucune action urgente."} /></div><section className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-6"><p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Prochaine action</p><p className="mt-2 text-lg text-slate-800">{nextApplication?.next_action || (nextItem ? nextItem.title : "Ton dossier est à jour. AlmaGo reviendra vers toi si nécessaire.")}</p></section></main>;
}

function DashboardCard({ title, value, detail }: { title: string; value: string; detail: string }) { return <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-medium text-slate-500">{title}</h2><p className="mt-4 text-xl font-semibold text-slate-950">{value}</p><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></article>; }
