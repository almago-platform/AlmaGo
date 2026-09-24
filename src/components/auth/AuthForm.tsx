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
        else setMessage("Vérifiez votre adresse e-mail pour continuer.");
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError("Email ou mot de passe incorrect.");
        } else {
          const { data: role, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", signInData.user.id)
            .maybeSingle();

          if (roleError || !role) {
            await supabase.auth.signOut();
            setError("Nous n’arrivons pas à déterminer l’espace associé à ce compte.");
          } else if (role.role === "admin") {
            router.push("/admin");
          } else if (role.role === "student") {
            router.push("/student");
          } else {
            await supabase.auth.signOut();
            setError("Ce compte ne dispose pas d’un espace AlmaGo autorisé.");
          }
        }
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
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
      ? "Ouvrez votre espace AlmaGo pour préparer votre dossier Allemagne étape par étape."
      : mode === "forgot"
        ? "Indiquez votre e-mail et nous vous enverrons un lien pour récupérer votre accès."
        : "Retrouvez votre dossier, vos documents, vos pistes d’orientation et vos prochaines actions.";

  return (
    <section className="w-full max-w-xl rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--border)] px-6 py-6 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">AlmaGo</p>
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
          <p id="signup-password-hint" className="rounded-[var(--radius-control)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-slate-600">
            Utilisez au moins 8 caractères. Vous recevrez ensuite un e-mail de confirmation.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-[var(--radius-control)] border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-[var(--radius-control)] border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className={buttonClassName("primary", "w-full justify-center py-3 text-base")}>
          {loading
            ? "Connexion…"
            : mode === "login"
              ? "Se connecter"
              : mode === "signup"
                ? "Créer mon compte"
                : "Envoyer le lien"}
        </button>
      </form>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-5 text-sm font-semibold text-[var(--brand)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <button
          type="button"
          className="min-h-11 rounded-[var(--radius-control)] px-1 text-left transition-colors hover:text-[var(--brand-strong)] focus-visible:outline-none"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Créer un compte étudiant" : "J'ai déjà un compte"}
        </button>
        {mode !== "signup" && (
          <button
            type="button"
            className="min-h-11 rounded-[var(--radius-control)] px-1 text-left transition-colors hover:text-[var(--brand-strong)] focus-visible:outline-none"
            onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}
          >
            {mode === "forgot" ? "Retour à la connexion" : "Mot de passe oublié ?"}
          </button>
        )}
      </div>
    </section>
  );
}
