"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminWorkflowSection } from "@/components/admin/AdminWorkflowSection";
import { universityTypes } from "@/lib/phase4";

type University = {
  id: string;
  name: string;
  city: string;
  bundesland: string | null;
  university_type: string;
  website_url: string | null;
  logo_url: string | null;
  description: string | null;
  is_public: boolean;
  tuition_notes: string | null;
  is_active: boolean;
};

type UniversityForm = {
  name: string;
  city: string;
  bundesland: string;
  university_type: string;
  website_url: string;
  logo_url: string;
  description: string;
  is_public: boolean;
  tuition_notes: string;
  is_active: boolean;
};

type Notice = {
  tone: "success" | "error";
  text: string;
};

const empty: UniversityForm = {
  name: "",
  city: "",
  bundesland: "",
  university_type: "Universität",
  website_url: "",
  logo_url: "",
  description: "",
  is_public: true,
  tuition_notes: "",
  is_active: true,
};

export function AdminUniversitiesPanel({ universities }: { universities: University[] }) {
  const [items] = useState(universities);
  const [form, setForm] = useState<UniversityForm>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return items.filter((university) => {
      if (type !== "all" && university.university_type !== type) return false;
      if (!normalized) return true;
      return [
        university.name,
        university.city,
        university.bundesland,
        university.university_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr")
        .includes(normalized);
    });
  }, [items, query, type]);

  function change(key: keyof UniversityForm, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditing(null);
    setForm(empty);
    setFormOpen(false);
  }

  function edit(university: University) {
    setEditing(university.id);
    setFormOpen(true);
    setForm({
      name: university.name,
      city: university.city,
      bundesland: university.bundesland || "",
      university_type: university.university_type,
      website_url: university.website_url || "",
      logo_url: university.logo_url || "",
      description: university.description || "",
      is_public: university.is_public,
      tuition_notes: university.tuition_notes || "",
      is_active: university.is_active,
    });
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);

    try {
      const response = await fetch(
        editing ? `/api/admin/universities/${editing}` : "/api/admin/universities",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice({
          tone: "error",
          text: result.error || "Nous n’arrivons pas à enregistrer cette université pour le moment. Rien d’autre n’a été modifié.",
        });
        return;
      }

      setNotice({
        tone: "success",
        text: editing
          ? "Les informations de l’université ont bien été mises à jour."
          : "L’université a bien été ajoutée au catalogue.",
      });
      resetForm();
      window.location.reload();
    } catch {
      setNotice({
        tone: "error",
        text: "Nous n’arrivons pas à enregistrer cette université pour le moment. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(university: University) {
    setTogglingId(university.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/universities/${university.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_active: !university.is_active }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice({
          tone: "error",
          text: result.error || "Nous n’arrivons pas à modifier l’état de cette université pour le moment.",
        });
        return;
      }

      window.location.reload();
    } catch {
      setNotice({
        tone: "error",
        text: "Nous n’arrivons pas à modifier l’état de cette université pour le moment. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">Catalogue des universités</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Recherchez une fiche existante avant d’ajouter un établissement.</p>
        </div>
        <Button type="button" onClick={() => { resetForm(); setFormOpen(true); }} className="w-full justify-center sm:w-auto">+ Ajouter une université</Button>
      </div>

      {formOpen && (
      <Card aria-labelledby="admin-university-form-title" className="min-w-0 overflow-hidden">
        <form onSubmit={save}>
          <div className="mb-6 flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                {editing ? "Modification catalogue" : "Nouvel établissement"}
              </p>
              <h2 id="admin-university-form-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                {editing ? "Modifier l’université" : "Ajouter une université"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Renseignez uniquement des informations vérifiées et, pour les liens, privilégiez les sources officielles.
              </p>
            </div>
            {editing && (
              <Button type="button" variant="secondary" onClick={resetForm} className="w-full justify-center sm:w-auto">
                Annuler la modification
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <AdminWorkflowSection step="A" title="Identité et localisation" description="Nom, ville et région de l’établissement." defaultOpen>
              <label className="block text-sm font-medium text-slate-700">
                Nom de l’université
                <input
                  required
                  value={form.name}
                  onChange={(event) => change("name", event.target.value)}
                  placeholder="Ex. RWTH Aachen University"
                  className="field"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Ville
                  <input
                    required
                    value={form.city}
                    onChange={(event) => change("city", event.target.value)}
                    placeholder="Aachen"
                    className="field"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Bundesland
                  <input
                    value={form.bundesland}
                    onChange={(event) => change("bundesland", event.target.value)}
                    placeholder="Nordrhein-Westfalen"
                    className="field"
                  />
                </label>
              </div>
            </AdminWorkflowSection>

            <AdminWorkflowSection step="B" title="Type et état AlmaGo" description="Type d’établissement, statut public et activation dans le catalogue.">
              <label className="block text-sm font-medium text-slate-700">
                Type d’établissement
                <select
                  value={form.university_type}
                  onChange={(event) => change("university_type", event.target.value)}
                  className="field"
                >
                  {universityTypes.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleField
                  label="Établissement public"
                  checked={form.is_public}
                  onChange={(checked) => change("is_public", checked)}
                />
                <ToggleField
                  label="Actif dans AlmaGo"
                  checked={form.is_active}
                  onChange={(checked) => change("is_active", checked)}
                />
              </div>
            </AdminWorkflowSection>

            <AdminWorkflowSection step="C" title="Sources officielles" description="Site institutionnel et identité visuelle de référence.">
              <label className="block text-sm font-medium text-slate-700">
                Site officiel
                <input
                  value={form.website_url}
                  onChange={(event) => change("website_url", event.target.value)}
                  placeholder="https://..."
                  className="field"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                URL du logo
                <input
                  value={form.logo_url}
                  onChange={(event) => change("logo_url", event.target.value)}
                  placeholder="https://..."
                  className="field"
                />
              </label>
            </AdminWorkflowSection>

            <AdminWorkflowSection step="D" title="Description et informations financières" description="Conservez uniquement des informations factuelles et vérifiées.">
              <label className="block text-sm font-medium text-slate-700">
                Description courte
                <textarea
                  value={form.description}
                  onChange={(event) => change("description", event.target.value)}
                  placeholder="Résumé factuel de l’établissement."
                  className="field min-h-24 resize-y"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Frais / notes financières
                <textarea
                  value={form.tuition_notes}
                  onChange={(event) => change("tuition_notes", event.target.value)}
                  placeholder="Informations vérifiées sur les frais ou contributions."
                  className="field min-h-24 resize-y"
                />
              </label>
            </AdminWorkflowSection>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              L’état actif contrôle si cet établissement peut être utilisé dans les parcours AlmaGo qui s’appuient sur le catalogue actif.
            </p>
            <Button type="submit" disabled={busy} className="w-full justify-center sm:w-auto">
              {busy ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Ajouter au catalogue"}
            </Button>
          </div>

          {notice && (
            <p
              role={notice.tone === "error" ? "alert" : "status"}
              className={
                "mt-4 rounded-[var(--radius-control)] border p-3.5 text-sm " +
                (notice.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800")
              }
            >
              {notice.text}
            </p>
          )}
        </form>
      </Card>
      )}

      <section aria-labelledby="university-catalogue-title">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Catalogue</p>
            <h2 id="university-catalogue-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Établissements enregistrés
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Recherchez, vérifiez puis modifiez uniquement l’établissement concerné.
            </p>
          </div>
          <Badge variant={filtered.length ? "info" : "neutral"}>{filtered.length} affiché{filtered.length > 1 ? "s" : ""}</Badge>
        </div>

        <Card className="mb-5 shadow-none">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <label className="block text-sm font-medium text-slate-700">
              Rechercher
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nom, ville, Bundesland ou type"
                className="field"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Type
              <select value={type} onChange={(event) => setType(event.target.value)} className="field">
                <option value="all">Tous les types</option>
                {universityTypes.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((university) => (
            <Card
              as="article"
              key={university.id}
              aria-labelledby={`admin-university-title-${university.id}`}
              className={`min-w-0 overflow-hidden break-words ${university.is_active ? "" : "bg-slate-50/70"}`}
            >
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">{university.university_type}</Badge>
                    <Badge variant={university.is_public ? "info" : "neutral"}>
                      {university.is_public ? "Public" : "Privé"}
                    </Badge>
                  </div>
                  <h3
                    id={`admin-university-title-${university.id}`}
                    className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]"
                  >
                    {university.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {university.city}{university.bundesland ? ` · ${university.bundesland}` : ""}
                  </p>
                </div>
                <Badge variant={university.is_active ? "success" : "neutral"}>
                  {university.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
                {university.description || "Aucune description enregistrée."}
              </p>

              {university.website_url && (
                <a
                  href={university.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
                >
                  Voir le site officiel
                </a>
              )}

              <div className="mt-5 flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:flex-wrap">
                <Button type="button" variant="secondary" onClick={() => edit(university)} className="w-full justify-center sm:w-auto">
                  Modifier
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-center sm:w-auto"
                  disabled={togglingId === university.id}
                  onClick={() => toggleActive(university)}
                >
                  {togglingId === university.id
                    ? "Enregistrement…"
                    : university.is_active
                      ? "Désactiver"
                      : "Réactiver"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="mt-4 border-dashed bg-white/70 py-9 text-center shadow-none">
            <h3 className="font-bold text-slate-950">Aucune université ne correspond à ces filtres.</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Modifiez la recherche ou le type sélectionné. Aucun établissement n’a été supprimé ou modifié.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
