"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); const router = useRouter();
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); setMessage(""); setSaving(true); const { error: updateError } = await createClient().auth.updateUser({ password }); setSaving(false); if (updateError) setError("Le lien est expiré ou invalide."); else { setMessage("Mot de passe mis à jour."); setTimeout(() => router.push("/student"), 700); } }
  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">AlmaGo</p>
      <h1 className="mt-2 text-2xl font-semibold">Nouveau mot de passe</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm text-slate-700">
          Nouveau mot de passe
          <input
            required
            minLength={8}
            type="password"
            autoComplete="new-password"
            aria-describedby="reset-password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
        </label>
        <p id="reset-password-hint" className="text-sm text-slate-600">Utilise au moins 8 caractères.</p>
        <p role="alert" className={error ? "text-sm text-red-700" : "sr-only"}>{error}</p>
        <p role="status" className={message ? "text-sm text-emerald-700" : "sr-only"}>{message}</p>
        <Button type="submit" disabled={saving} className="w-full">{saving ? "Enregistrement…" : "Enregistrer"}</Button>
      </form>
    </section>
  );
}
