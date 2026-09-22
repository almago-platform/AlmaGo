import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";
export default async function AdminEntry() {
  const supabase = await createClient();
  const [{ count: universityCount }, { count: programCount }, { count: applicationCount }, { count: pendingDocuments }] = await Promise.all([
    supabase.from("universities").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("programs").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("applications").select("id", { count: "exact", head: true }).not("status", "in", "(admission,rejection,withdrawn)"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12"><PageHeader badge="AlmaGo" title="Pilotage Phase 4" description="Catalogue, orientation et candidatures au même endroit." actions={<><ButtonLink href="/admin/orientation">Préparer une orientation</ButtonLink><ButtonLink href="/admin/applications" variant="secondary">Suivre les candidatures</ButtonLink></>} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><DashboardCard title="Universités actives" value={universityCount || 0} href="/admin/universities" /><DashboardCard title="Programmes actifs" value={programCount || 0} href="/admin/programs" /><DashboardCard title="Candidatures ouvertes" value={applicationCount || 0} href="/admin/applications" /><DashboardCard title="Documents en attente" value={pendingDocuments || 0} href="/admin/documents" /></div></main>;
}

function DashboardCard({ title, value, href }: { title: string; value: number; href: string }) { return <Link href={href} aria-label={`Ouvrir ${title}`} className="block rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><Card className="transition hover:-translate-y-0.5 hover:border-emerald-300"><p className="text-sm text-slate-500">{title}</p><p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-3 text-sm font-semibold text-emerald-700">Ouvrir <span aria-hidden="true">→</span></p></Card></Link>; }
