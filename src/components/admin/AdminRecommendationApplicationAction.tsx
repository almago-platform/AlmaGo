"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AdminRecommendationApplicationAction({
  recommendationId,
  hasApplication,
}: {
  recommendationId: string;
  hasApplication: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function createApplication() {
    if (hasApplication || busy) return;
    setBusy(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendation_id: recommendationId }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };

      if (!response.ok) {
        setNotice({
          tone: "error",
          text: payload.error || "Impossible de créer cette candidature.",
        });
        setBusy(false);
        return;
      }

      setNotice({
        tone: "success",
        text: "Candidature créée. Vérifiez maintenant sa deadline et sa prochaine action.",
      });
      setBusy(false);
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        text: "Impossible de créer cette candidature pour le moment. Vérifiez votre connexion puis réessayez.",
      });
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      {hasApplication ? (
        <p className="text-xs font-semibold text-emerald-800">Candidature déjà rattachée à ce programme.</p>
      ) : (
        <Button type="button" variant="secondary" disabled={busy} onClick={createApplication}>
          {busy ? "Création…" : "Créer la candidature"}
        </Button>
      )}
      {notice ? (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={`mt-2 text-xs font-semibold ${notice.tone === "error" ? "text-red-700" : "text-emerald-800"}`}
        >
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}
