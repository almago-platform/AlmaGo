"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClassName } from "@/components/ui/Button";

type Mode = "login" | "signup" | "forgot";

export function AuthForm({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
        if (resetError) setError(resetError.message); else setMessage("Si cette adresse existe, un lien de réinitialisation a été envoyé.");
      } else if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: `${firstName} ${lastName}`.trim() } } });
        if (signUpError) setError(signUpError.message);
        else if (data.session) router.push("/student");
        else setMessage("Vérifie ton adresse email pour continuer.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) setError("Email ou mot de passe incorrect."); else router.push("/student");
      }
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "login" ? "Connexion" : mode === "signup" ? "Créer mon compte étudiant" : "Mot de passe oublié";
  return <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">AlmaGo</p><h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-600">Étudier en Allemagne, étape par étape. 🇹🇳 → 🇩🇪</p></div>
    <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && <div className="grid grid-cols-2 gap-3"><label className="text-sm text-slate-700">Prénom<input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="field" /></label><label className="text-sm text-slate-700">Nom<input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="field" /></label></div>}
      <label className="block text-sm text-slate-700">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" /></label>
      {mode !== "forgot" && <label className="block text-sm text-slate-700">Mot de passe<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" /></label>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      <button type="submit" disabled={loading} className={buttonClassName("primary", "w-full")}>{loading ? "Patiente…" : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}</button>
    </form>
    <div className="mt-5 flex flex-wrap gap-3 text-sm text-emerald-700"><button type="button" className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Créer un compte" : "J’ai déjà un compte"}</button>{mode !== "signup" && <button type="button" className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}>{mode === "forgot" ? "Retour à la connexion" : "Mot de passe oublié ?"}</button>}</div>
  </section>;
}
