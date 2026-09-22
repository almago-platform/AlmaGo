"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  ["Vue d’ensemble", "/admin"],
  ["Universités", "/admin/universities"],
  ["Programmes", "/admin/programs"],
  ["Orientation", "/admin/orientation"],
  ["Candidatures", "/admin/applications"],
  ["Documents", "/admin/documents"],
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  return <nav className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3"><Link href="/admin" className="mr-auto text-lg font-bold text-emerald-800">AlmaGo <span className="text-xs font-medium text-slate-400">ADMIN</span></Link>{links.map(([label, href]) => <Link key={href} href={href} className={`rounded-lg px-3 py-2 text-sm ${pathname === href ? "bg-emerald-50 font-semibold text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`}>{label}</Link>)}<button type="button" onClick={async () => { await createClient().auth.signOut(); router.push("/"); }} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">Déconnexion</button></div></nav>;
}
