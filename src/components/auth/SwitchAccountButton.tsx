"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SwitchAccountButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function switchAccount() {
    if (busy) return;
    setBusy(true);

    try {
      await createClient().auth.signOut();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={switchAccount}
      disabled={busy}
      className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 shadow-sm transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-wait disabled:opacity-70"
    >
      {busy ? "Déconnexion…" : "Changer de compte"}
    </button>
  );
}
