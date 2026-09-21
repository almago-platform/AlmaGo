import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function AdminEntry() {
  const supabase = await createClient();
  const [{ count: universityCount }, { count: programCount }, { count: applicationCount }, { count: pendingDocuments }] = await Promise.all([
    supabase.from("universities").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("programs").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("applications").select("id", { count: "exact", head: true }).not("status", "in", "(admission,rejection,withdrawn)"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12"><p className="eyebrow">AlmaGo</p><h1 className="page-title">Pilotage Phase 4</h1><p className="page-subtitle">Catalogue, orientation et candidatures au même endroit.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><DashboardCard title="Universités actives" value={universityCount || 0} href="/admin/universities" /><DashboardCard title="Programmes actifs" value={programCount || 0} href="/admin/programs" /><DashboardCard title="Candidatures ouvertes" value={applicationCount || 0} href="/admin/applications" /><DashboardCard title="Documents en attente" value={pendingDocuments || 0} href="/admin/documents" /></div><div className="mt-8 flex flex-wrap gap-3"><Link href="/admin/orientation" className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Préparer une orientation</Link><Link href="/admin/applications" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">Suivre les candidatures</Link></div></main>;
}

function DashboardCard({ title, value, href }: { title: string; value: number; href: string }) { return <Link href={href} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300"><p className="text-sm text-slate-500">{title}</p><p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-3 text-sm font-semibold text-emerald-700">Ouvrir →</p></Link>; }
