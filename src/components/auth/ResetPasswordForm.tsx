"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/brand/BrandLogo";

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
      const { error: updateError } = await createClient().auth.updateUser({ password });

      if (updateError) {
        setError("Le lien est expiré ou invalide. Demandez un nouveau lien depuis la page de connexion.");
      } else {
        setMessage("Mot de passe mis à jour. Redirection vers votre espace étudiant...");
        setTimeout(() => router.push("/student"), 700);
      }
    } catch {
      setError("Une erreur est survenue. Réessayez dans un instant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="w-full rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] shadow-none">
      <div className="border-b border-[var(--border)] px-6 py-6 sm:px-8">
        <BrandLogo className="h-auto w-36" />
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950">Nouveau mot de passe</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Saisissez un mot de passe solide pour sécuriser votre accès au dossier.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 px-6 py-6 sm:px-8">
        <label className="block text-sm font-semibold text-slate-700">
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

        <p id="reset-password-hint" className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm leading-6 text-slate-600">
          Utilisez au moins 8 caractères. Un mot de passe long et unique protège mieux votre espace.
        </p>

        <p
          role="alert"
          className={
            error
              ? "rounded-[var(--radius-control)] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              : "sr-only"
          }
        >
          {error}
        </p>

        <p
          role="status"
          className={
            message
              ? "rounded-[var(--radius-control)] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
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
