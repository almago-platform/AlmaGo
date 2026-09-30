"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { financeInsuranceKinds, type FinanceInsuranceKind } from "@/lib/finance-insurance";
import { catalogVerificationExpiresAt, isCatalogVerificationCurrent } from "@/lib/catalog-freshness";

type Option = {
  id: string;
  provider_name: string;
  product_name: string | null;
  kind: FinanceInsuranceKind;
  description: string | null;
  official_source_url: string;
  application_url: string | null;
  price_notes: string | null;
  eligibility_notes: string | null;
  verified_at: string | null;
  is_active: boolean;
};

type FormState = {
  provider_name: string;
  product_name: string;
  kind: FinanceInsuranceKind;
  description: string;
  official_source_url: string;
  application_url: string;
  price_notes: string;
  eligibility_notes: string;
  verified_at: string;
  is_active: boolean;
};

const empty: FormState = {
  provider_name: "",
  product_name: "",
  kind: "blocked_account_provider",
  description: "",
  official_source_url: "",
  application_url: "",
  price_notes: "",
  eligibility_notes: "",
  verified_at: "",
  is_active: false,
};

const kindLabels: Record<FinanceInsuranceKind, string> = {
  blocked_account_provider: "Compte bloqué",
  health_insurance_provider: "Assurance santé",
  student_financing_option: "Financement étudiant",
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function AdminFinanceInsurancePanel({ options }: { options: Option[] }) {
  const [form, setForm] = useState<FormState>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<FinanceInsuranceKind | "all">("all");
  const [busy, setBusy] = useState(false);
  const [revalidatingId, setRevalidatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const visible = useMemo(
    () => options.filter((option) => filter === "all" || option.kind === filter),
    [options, filter],
  );

  function change<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function edit(option: Option) {
    setEditing(option.id);
    setFormOpen(true);
    setForm({
      provider_name: option.provider_name,
      product_name: option.product_name || "",
      kind: option.kind,
      description: option.description || "",
      official_source_url: option.official_source_url,
      application_url: option.application_url || "",
      price_notes: option.price_notes || "",
      eligibility_notes: option.eligibility_notes || "",
      verified_at: toLocalInput(option.verified_at),
      is_active: option.is_active,
    });
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setForm(empty);
    setFormOpen(false);
  }

  async function revalidate(option: Option) {
    if (!window.confirm("Confirmez que vous avez ouvert la source officielle et vérifié les informations affichées avant de revalider cette fiche.")) {
      return;
    }

    setRevalidatingId(option.id);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/finance-insurance", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: option.id,
          provider_name: option.provider_name,
          product_name: option.product_name,
          kind: option.kind,
          description: option.description,
          official_source_url: option.official_source_url,
          application_url: option.application_url,
          price_notes: option.price_notes,
          eligibility_notes: option.eligibility_notes,
          verified_at: new Date().toISOString(),
          is_active: option.is_active,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice({ tone: "error", text: result.error || "Revalidation impossible." });
        return;
      }
      setNotice({ tone: "success", text: "Fiche revalidée après contrôle de la source officielle." });
      window.location.reload();
    } catch {
      setNotice({ tone: "error", text: "Revalidation impossible. Vérifiez votre connexion puis réessayez." });
    } finally {
      setRevalidatingId(null);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const payload = {
      ...form,
      product_name: form.product_name || null,
      description: form.description || null,
      application_url: form.application_url || null,
      price_notes: form.price_notes || null,
      eligibility_notes: form.eligibility_notes || null,
      verified_at: form.verified_at ? new Date(form.verified_at).toISOString() : null,
      ...(editing ? { id: editing } : {}),
    };

    try {
      const response = await fetch("/api/admin/finance-insurance", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice({ tone: "error", text: result.error || "Enregistrement impossible." });
        return;
      }
      setNotice({ tone: "success", text: editing ? "Option mise à jour." : "Option ajoutée." });
      reset();
      window.location.reload();
    } catch {
      setNotice({ tone: "error", text: "Enregistrement impossible. Vérifiez votre connexion puis réessayez." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">Catalogue finance & assurance</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Contrôlez les sources et les dates de vérification avant d’ajouter une option.</p>
        </div>
        <Button type="button" onClick={() => { reset(); setFormOpen(true); }} className="w-full justify-center sm:w-auto">+ Ajouter une option</Button>
      </div>

      {formOpen && (
      <Card>
        <form onSubmit={save} className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{editing ? "Modification" : "Nouvelle option"}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">{editing ? "Modifier l’option" : "Ajouter une option"}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Une option active doit avoir une source officielle et une date de vérification.</p>
            </div>
            {editing && <Button type="button" variant="secondary" onClick={reset}>Annuler</Button>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Fournisseur" required value={form.provider_name} onChange={(value) => change("provider_name", value)} />
            <Field label="Produit" value={form.product_name} onChange={(value) => change("product_name", value)} />
            <label className="text-sm font-medium text-slate-700">
              Catégorie
              <select className="field" value={form.kind} onChange={(event) => change("kind", event.target.value as FinanceInsuranceKind)}>
                {financeInsuranceKinds.map((kind) => <option key={kind} value={kind}>{kindLabels[kind]}</option>)}
              </select>
            </label>
            <Field label="Source officielle" required placeholder="https://..." value={form.official_source_url} onChange={(value) => change("official_source_url", value)} />
            <Field label="Lien fournisseur / candidature" placeholder="https://..." value={form.application_url} onChange={(value) => change("application_url", value)} />
            <label className="text-sm font-medium text-slate-700">
              Vérifié le
              <input className="field" type="datetime-local" value={form.verified_at} onChange={(event) => change("verified_at", event.target.value)} />
            </label>
            <TextArea label="Description factuelle" value={form.description} onChange={(value) => change("description", value)} />
            <TextArea label="Prix / frais publiés" value={form.price_notes} onChange={(value) => change("price_notes", value)} />
            <TextArea label="Conditions publiées" value={form.eligibility_notes} onChange={(value) => change("eligibility_notes", value)} />
            <label className="flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border)] px-4 py-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.is_active} onChange={(event) => change("is_active", event.target.checked)} />
              Publier dans l’espace étudiant
            </label>
          </div>

          <Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : editing ? "Enregistrer" : "Ajouter"}</Button>
          {notice && <p role={notice.tone === "error" ? "alert" : "status"} className={notice.tone === "error" ? "text-sm font-semibold text-red-700" : "text-sm font-semibold text-emerald-700"}>{notice.text}</p>}
        </form>
      </Card>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Catalogue</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{visible.length} option{visible.length > 1 ? "s" : ""}</h2>
          </div>
          <select aria-label="Filtrer le catalogue finance et assurance par catégorie" className="field max-w-xs" value={filter} onChange={(event) => setFilter(event.target.value as FinanceInsuranceKind | "all")}>
            <option value="all">Toutes les catégories</option>
            {financeInsuranceKinds.map((kind) => <option key={kind} value={kind}>{kindLabels[kind]}</option>)}
          </select>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((option) => (
            <Card key={option.id} className="shadow-none">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-950">{option.provider_name}</p>
                  <p className="mt-1 text-sm text-slate-600">{option.product_name || kindLabels[option.kind]}</p>
                </div>
                <Badge variant={option.is_active && isCatalogVerificationCurrent(option.verified_at) ? "success" : option.is_active ? "warning" : "neutral"}>
                  {option.is_active && isCatalogVerificationCurrent(option.verified_at) ? "Publié" : option.is_active ? "À revalider" : "Brouillon"}
                </Badge>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{kindLabels[option.kind]}</p>
              {option.verified_at && (
                <p className="mt-2 text-xs text-slate-500">À revalider avant : {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(catalogVerificationExpiresAt(option.verified_at) as string))}</p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={option.official_source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
                >
                  Ouvrir la source officielle
                </a>
                <Button type="button" variant="secondary" onClick={() => edit(option)}>Modifier</Button>
                <Button
                  type="button"
                  onClick={() => revalidate(option)}
                  disabled={revalidatingId === option.id}
                >
                  {revalidatingId === option.id ? "Revalidation…" : "Source vérifiée aujourd’hui"}
                </Button>
              </div>
            </Card>
          ))}
          {!visible.length && <Card className="shadow-none"><p className="text-sm text-slate-600">Aucune option dans cette catégorie.</p></Card>}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, required = false, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) {
  return <label className="text-sm font-medium text-slate-700">{label}<input className="field" required={required} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-sm font-medium text-slate-700">{label}<textarea className="field min-h-24 resize-y" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
