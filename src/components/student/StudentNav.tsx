"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [["Tableau de bord", "/student"], ["Mon profil", "/student/profile"], ["Documents", "/student/documents"], ["Orientation", "/student/orientation"], ["Checklist", "/student/checklist"], ["Candidatures", "/student/applications"]];
const navLinkClass = "rounded-lg px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]";
const brandLinkClass = "mr-auto rounded-lg text-lg font-bold text-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]";

export function StudentNav() {
  const pathname = usePathname();
  const router = useRouter();

  return <nav className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3"><Link href="/student" className={brandLinkClass}>AlmaGo</Link>{links.map(([label, href]) => {
    const active = pathname === href;
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`${navLinkClass} ${active ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand)]" : "text-slate-600 hover:bg-slate-50"}`}>{label}</Link>;
  })}<button type="button" onClick={async () => { await createClient().auth.signOut(); router.push("/"); }} className={`${navLinkClass} text-slate-500 hover:bg-slate-50`}>Déconnexion</button></div></nav>;
}
