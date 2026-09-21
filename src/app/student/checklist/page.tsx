import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const labels: Record<string, string> = { not_started: "À démarrer", todo: "À faire", in_progress: "En cours", waiting_student: "Action requise", waiting_almago: "En attente d’AlmaGo", completed: "Terminé" };
const styles: Record<string, string> = { completed: "bg-emerald-100 text-emerald-800", waiting_student: "bg-amber-100 text-amber-900", waiting_almago: "bg-blue-100 text-blue-800", todo: "bg-slate-100 text-slate-700", in_progress: "bg-violet-100 text-violet-800", not_started: "bg-slate-100 text-slate-700" };

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle();
  if (!profile?.onboarding_completed) redirect("/student/onboarding");
  const { data: items } = await supabase.from("student_checklist_items").select("id,title,description,status,completed_at,checklist_templates(category,sort_order)").order("created_at");
  const checklistItems = items || [];
  const groups = new Map<string, (typeof checklistItems)[number][]>();
  for (const item of checklistItems) {
    const relation = Array.isArray(item.checklist_templates) ? item.checklist_templates[0] : item.checklist_templates;
    const category = relation?.category || "Autre";
    groups.set(category, [...(groups.get(category) || []), item]);
  }
  return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Checklist</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Mes prochaines étapes</h1><p className="mt-2 mb-8 text-slate-600">AlmaGo met à jour cette checklist au fil de ton dossier.</p><div className="space-y-7">{[...groups.entries()].map(([category, group]) => <section key={category}><h2 className="mb-3 text-lg font-semibold text-slate-900">{category}</h2><div className="space-y-3">{group.map((item) => <article key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="font-semibold text-slate-950">{item.title}</h3>{item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}</div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${styles[item.status] || styles.todo}`}>{labels[item.status] || item.status}</span></article>)}</div></section>)}</div></main>;
}
