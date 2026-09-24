"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: userData, error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError || !userData.user) {
        setError("Le lien est expiré ou invalide. Demandez un nouveau lien depuis la page de connexion.");
      } else {
        const { data: role, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .maybeSingle();

        if (roleError || !role) {
          await supabase.auth.signOut();
          setError("Nous n’arrivons pas à déterminer l’espace associé à ce compte.");
        } else {
          const destination = role.role === "admin"
            ? "/admin"
            : role.role === "student"
              ? "/student"
              : null;

          if (!destination) {
            await supabase.auth.signOut();
            setError("Ce compte ne dispose pas d’un espace AlmaGo autorisé.");
          } else {
            setMessage("Mot de passe mis à jour. Redirection vers votre espace AlmaGo…");
            setTimeout(() => router.push(destination), 700);
          }
        }
      }
    } catch {
      setError("Une erreur est survenue. Réessayez dans un instant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">AlmaGo</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Nouveau mot de passe</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Saisissez un mot de passe solide pour sécuriser votre accès AlmaGo.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="block text-sm font-medium text-slate-700">
          Nouveau mot de passe
          <input
            required
            minLength={8}
            type="password"
            autoComplete="new-password"
            aria-describedby="reset-password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-2"
          />
        </label>

        <p id="reset-password-hint" className="text-sm leading-6 text-slate-600">
          Utilisez au moins 8 caractères. Un mot de passe long et unique protège mieux votre compte.
        </p>

        <p
          role="alert"
          className={
            error
              ? "rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              : "sr-only"
          }
        >
          {error}
        </p>

        <p
          role="status"
          className={
            message
              ? "rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              : "sr-only"
          }
        >
          {message}
        </p>

        <Button type="submit" disabled={saving} className="w-full justify-center">
          {saving ? "Enregistrement..." : "Enregistrer le mot de passe"}
        </Button>
      </form>
    </section>
  );
}
