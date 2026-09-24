"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SwitchAccountButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function switchAccount() {
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const { error: signOutError } = await createClient().auth.signOut();
      if (signOutError) {
        setError("Nous n’arrivons pas à fermer cette session pour le moment.");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setError("Nous n’arrivons pas à fermer cette session pour le moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={switchAccount}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 shadow-sm transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? "Déconnexion…" : "Changer de compte"}
      </button>
      {error && (
        <p role="alert" className="max-w-sm text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
