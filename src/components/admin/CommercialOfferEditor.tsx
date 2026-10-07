"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminWorkflowSection } from "@/components/admin/AdminWorkflowSection";
import { Button } from "@/components/ui/Button";

export function CommercialOfferEditor({
  offerCode,
  initialName,
  initialSummary,
  initialServices,
  initialPriceMinor,
  initialCurrency,
}: Readonly<{
  offerCode: "bronze" | "silver" | "gold";
  initialName?: string | null;
  initialSummary?: string | null;
  initialServices?: string[];
  initialPriceMinor?: number | null;
  initialCurrency?: string | null;
}>) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialName ?? "");
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [services, setServices] = useState((initialServices ?? []).join("\n"));
  const [priceMinor, setPriceMinor] = useState(
    initialPriceMinor === null || initialPriceMinor === undefined
      ? ""
      : String(initialPriceMinor),
  );
  const [currency, setCurrency] = useState(initialCurrency ?? "");
  const [pending, setPending] = useState<"draft" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(action: "draft" | "publish") {
    const serviceItems = services
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    setPending(action);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          offerCode,
          action,
          displayName,
          summary,
          serviceItems,
          priceMinor: priceMinor.trim() ? Number(priceMinor) : null,
          currency: currency.trim() || null,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          typeof payload.error === "string"
            ? payload.error
            : "Impossible d’enregistrer cette version.",
        );
        return;
      }

      setMessage(action === "publish" ? "Nouvelle version publiée." : "Nouvelle version brouillon enregistrée.");
      router.refresh();
    } catch {
      setMessage("Impossible de contacter le service des offres.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <AdminWorkflowSection
        step="A"
        title="Présentation de l’offre"
        description="Définissez le nom et le résumé qui seront visibles lorsqu’une version sera publiée."
        defaultOpen
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-900" htmlFor={offerCode + "-name"}>
              Nom affiché
            </label>
            <input
              id={offerCode + "-name"}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={80}
              className="field mt-2 bg-white"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-900" htmlFor={offerCode + "-summary"}>
              Résumé
            </label>
            <textarea
              id={offerCode + "-summary"}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={3}
              maxLength={500}
              className="field mt-2 min-h-24 resize-y bg-white"
            />
          </div>
        </div>
      </AdminWorkflowSection>

      <AdminWorkflowSection
        step="B"
        title="Services inclus"
        description="Un service par ligne. La publication exige au moins un service."
      >
        <label className="text-sm font-semibold text-slate-900" htmlFor={offerCode + "-services"}>
          Services inclus — un par ligne
        </label>
        <textarea
          id={offerCode + "-services"}
          value={services}
          onChange={(event) => setServices(event.target.value)}
          rows={6}
          className="field mt-2 min-h-36 resize-y bg-white"
        />
      </AdminWorkflowSection>

      <AdminWorkflowSection
        step="C"
        title="Prix et devise"
        description="Le montant reste stocké dans l’unité monétaire minimale et la devise doit utiliser le code ISO."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-900" htmlFor={offerCode + "-price"}>
              Prix en unité monétaire minimale
            </label>
            <input
              id={offerCode + "-price"}
              type="number"
              min="0"
              step="1"
              value={priceMinor}
              onChange={(event) => setPriceMinor(event.target.value)}
              className="field mt-2 bg-white"
            />
            <p className="mt-1 text-xs text-slate-600">Ex. EUR : 9900 = 99,00 €. TND : 590000 = 590 DT.</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-900" htmlFor={offerCode + "-currency"}>
              Devise ISO
            </label>
            <input
              id={offerCode + "-currency"}
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              maxLength={3}
              placeholder="EUR"
              className="field mt-2 bg-white uppercase"
            />
          </div>
        </div>
      </AdminWorkflowSection>

      <AdminWorkflowSection
        step="D"
        title="Version et publication"
        description="Un brouillon reste interne. Publier crée une nouvelle version visible selon les règles commerciales existantes."
        defaultOpen
        tone="brand"
      >
        {message ? (
          <p role="status" className="mb-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-3 text-sm text-slate-700">
            {message}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="secondary"
            onClick={() => submit("draft")}
            disabled={pending !== null}
          >
            {pending === "draft" ? "Enregistrement…" : "Créer un brouillon"}
          </Button>
          <Button
            type="button"
            onClick={() => submit("publish")}
            disabled={pending !== null}
          >
            {pending === "publish" ? "Publication…" : "Publier cette version"}
          </Button>
        </div>
      </AdminWorkflowSection>
    </div>
  );
}
