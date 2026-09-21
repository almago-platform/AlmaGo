import Link from "next/link";

export default function UnauthorizedPage() {
  return <main className="flex min-h-screen items-center justify-center px-4 py-12"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">AlmaGo</p><h1 className="mt-3 text-2xl font-semibold text-slate-950">Accès non autorisé</h1><p className="mt-3 text-slate-600">Cet espace est réservé à l’équipe AlmaGo.</p><Link href="/student" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Retour au tableau de bord</Link></section></main>;
}
