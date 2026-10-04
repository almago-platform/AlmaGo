"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="mt-4 grid gap-4">
      <div>
        <label className="text-sm font-semibold text-slate-900" htmlFor={offerCode + "-name"}>
          Nom affiché
        </label>
        <input
          id={offerCode + "-name"}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={80}
          className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950"
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
          className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900" htmlFor={offerCode + "-services"}>
          Services inclus — un par ligne
        </label>
        <textarea
          id={offerCode + "-services"}
          value={services}
          onChange={(event) => setServices(event.target.value)}
          rows={6}
          className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
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
            className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-950"
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
            className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2 text-sm uppercase text-slate-950"
          />
        </div>
      </div>

      {message ? <p role="status" className="text-sm text-slate-700">{message}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit("draft")}
          disabled={pending !== null}
          className="min-h-10 rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-4 text-sm font-bold text-slate-900 disabled:opacity-60"
        >
          {pending === "draft" ? "Enregistrement…" : "Créer un brouillon"}
        </button>
        <button
          type="button"
          onClick={() => submit("publish")}
          disabled={pending !== null}
          className="min-h-10 rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending === "publish" ? "Publication…" : "Publier cette version"}
        </button>
      </div>
    </div>
  );
}
