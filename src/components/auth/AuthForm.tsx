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
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (resetError) setError(resetError.message);
        else setMessage("Si cette adresse existe, un lien de réinitialisation a été envoyé.");
      } else if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: `${firstName} ${lastName}`.trim() } },
        });
        if (signUpError) setError(signUpError.message);
        else if (data.session) router.push("/student");
        else setMessage("Vérifie ton adresse email pour continuer.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) setError("Email ou mot de passe incorrect.");
        else router.push("/student");
      }
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "login"
      ? "Connexion sécurisée"
      : mode === "signup"
        ? "Créer mon compte étudiant"
        : "Réinitialiser mon accès";
  const subtitle =
    mode === "signup"
      ? "Ouvre ton espace AlmaGo pour préparer ton dossier Allemagne étape par étape."
      : mode === "forgot"
        ? "Indique ton email et nous t'enverrons un lien pour récupérer ton accès."
        : "Retrouve ton dossier, tes documents, tes recommandations et tes prochaines actions.";

  return (
    <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">AlmaGo</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>
      </div>

      <form onSubmit={submit} className="space-y-5 px-6 py-6 sm:px-8">
        {mode === "signup" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Prénom
              <input
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="field mt-2"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Nom
              <input
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="field mt-2"
              />
            </label>
          </div>
        )}

        <label className="block text-sm font-semibold text-slate-700">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field mt-2"
          />
        </label>

        {mode !== "forgot" && (
          <label className="block text-sm font-semibold text-slate-700">
            Mot de passe
            <input
              required
              minLength={8}
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              aria-describedby={mode === "signup" ? "signup-password-hint" : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field mt-2"
            />
          </label>
        )}

        {mode === "signup" && (
          <p id="signup-password-hint" className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Utilise au moins 8 caractères. Tu recevras ensuite un email de confirmation.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className={buttonClassName("primary", "w-full justify-center py-3 text-base")}>
          {loading
            ? "Patiente..."
            : mode === "login"
              ? "Se connecter"
              : mode === "signup"
                ? "Créer mon compte"
                : "Envoyer le lien"}
        </button>
      </form>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 text-sm font-semibold text-emerald-800 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <button
          type="button"
          className="rounded text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Créer un compte étudiant" : "J'ai déjà un compte"}
        </button>
        {mode !== "signup" && (
          <button
            type="button"
            className="rounded text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}
          >
            {mode === "forgot" ? "Retour à la connexion" : "Mot de passe oublié ?"}
          </button>
        )}
      </div>
    </section>
  );
}
