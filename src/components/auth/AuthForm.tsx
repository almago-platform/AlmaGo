"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClassName } from "@/components/ui/Button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { StudentEntryProgress } from "@/components/student/StudentEntryProgress";

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
  const [showPassword, setShowPassword] = useState(false);
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
        else setMessage("Vérifiez votre adresse email pour continuer.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) setError("Email ou mot de passe incorrect.");
        else router.push("/student");
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
        ? "Indiquez votre email et nous vous enverrons un lien pour récupérer votre accès."
        : "Retrouvez votre dossier, vos documents, vos recommandations et vos prochaines actions.";

  return (
    <section className="w-full overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_-54px_rgba(28,33,36,0.5)]">
      <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo className="hidden h-auto w-32 lg:block" />
          {mode === "signup" && (
            <span className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
              Compte étudiant
            </span>
          )}
        </div>
        <h1 className="editorial-accent mt-2 text-[2rem] leading-[1.06] text-[var(--foreground)] sm:text-[2.2rem]">{title}</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">{subtitle}</p>
        {mode === "signup" && (
          <div className="mt-5">
            <StudentEntryProgress current={1} compact />
          </div>
        )}
      </div>

      <form onSubmit={submit} aria-busy={loading} className="space-y-4 px-5 py-5 sm:px-7 sm:py-6">
        {mode === "signup" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[var(--foreground)]">
              Prénom
              <input
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Votre prénom"
                className="field mt-2 min-h-12"
              />
            </label>
            <label className="block text-sm font-semibold text-[var(--foreground)]">
              Nom
              <input
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Votre nom"
                className="field mt-2 min-h-12"
              />
            </label>
          </div>
        )}

        <label className="block text-sm font-semibold text-[var(--foreground)]">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@exemple.com"
            className="field mt-2 min-h-12"
          />
        </label>

        {mode !== "forgot" && (
          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Mot de passe
            <span className="relative mt-2 block">
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                aria-describedby={mode === "signup" ? "signup-password-hint" : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field mt-0 min-h-12 pr-24"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 my-auto min-h-10 rounded-[var(--radius-control)] px-2 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-strong)]"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </span>
          </label>
        )}

        {mode === "signup" && (
          <div id="signup-password-hint" className="grid gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-3 text-xs text-[var(--muted)] sm:grid-cols-2">
            <span>• 8 caractères minimum</span>
            <span>• Confirmation par email</span>
          </div>
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

        <button type="submit" disabled={loading} className={buttonClassName("primary", "w-full min-h-12 justify-center py-3 text-base")}>
          {loading
            ? "Patientez..."
            : mode === "login"
              ? "Se connecter"
              : mode === "signup"
                ? "Créer mon compte"
                : "Envoyer le lien"}
        </button>
      </form>

      <div className="flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-4 text-sm font-semibold text-[var(--brand)] sm:flex-row sm:items-center sm:justify-between sm:px-7">
        {mode === "signup" ? (
          <p className="text-[var(--muted)]">
            Déjà un compte ?{" "}
            <Link href="/login" className="inline-flex min-h-11 items-center text-[var(--brand)] hover:text-[var(--brand-strong)]">
              Se connecter
            </Link>
          </p>
        ) : (
          <Link href="/signup" className="inline-flex min-h-11 items-center text-[var(--brand)] hover:text-[var(--brand-strong)]">
            Créer un compte étudiant
          </Link>
        )}
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
