"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const router = useRouter();
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); const { error: updateError } = await createClient().auth.updateUser({ password }); if (updateError) setError("Le lien est expiré ou invalide."); else { setMessage("Mot de passe mis à jour."); setTimeout(() => router.push("/student"), 700); } }
  return <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">AlmaGo</p><h1 className="mt-2 text-2xl font-semibold">Nouveau mot de passe</h1><form onSubmit={submit} className="mt-6 space-y-4"><input required minLength={8} type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="field" />{error && <p className="text-sm text-red-700">{error}</p>}{message && <p className="text-sm text-emerald-700">{message}</p>}<button className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white">Enregistrer</button></form></section>;
}
