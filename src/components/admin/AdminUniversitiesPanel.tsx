"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { universityTypes } from "@/lib/phase4";

type University = {
  id: string;
  name: string;
  city: string;
  bundesland: string | null;
  university_type: string;
  website_url: string | null;
  source_url: string | null;
  verified_at: string | null;
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
  source_url: string;
  mark_verified: boolean;
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
  source_url: "",
  mark_verified: false,
  logo_url: "",
  description: "",
  is_public: true,
  tuition_notes: "",
  is_active: true,
};

function formatVerificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function AdminUniversitiesPanel({ universities }: { universities: University[] }) {
  const [items] = useState(universities);
  const [form, setForm] = useState<UniversityForm>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [quality, setQuality] = useState("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activeUniversities = items.filter((university) => university.is_active);
  const missingSourceCount = activeUniversities.filter(
    (university) => !university.source_url && !university.website_url,
  ).length;
  const missingVerificationCount = activeUniversities.filter((university) => !university.verified_at).length;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return items.filter((university) => {
      if (type !== "all" && university.university_type !== type) return false;
      if (quality === "missing_source" && (university.source_url || university.website_url)) return false;
      if (quality === "missing_verification" && university.verified_at) return false;
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
  }, [items, query, type, quality]);

  function change(key: keyof UniversityForm, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditing(null);
    setForm(empty);
  }

  function edit(university: University) {
    setEditing(university.id);
    setForm({
      name: university.name,
      city: university.city,
      bundesland: university.bundesland || "",
      university_type: university.university_type,
      website_url: university.website_url || "",
      source_url: university.source_url || "",
      mark_verified: false,
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
    <div className="space-y-7">
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

          <div className="grid gap-4 lg:grid-cols-2">
            <FormSection title="Identité et localisation">
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
            </FormSection>

            <FormSection title="Type et publication">
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
            </FormSection>

            <FormSection title="Liens officiels">
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
                Source officielle des informations
                <input
                  value={form.source_url}
                  onChange={(event) => change("source_url", event.target.value)}
                  placeholder="https://..."
                  className="field"
                />
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Utilisez une page officielle pertinente lorsque les informations de la fiche vont au-delà du simple site d’accueil.
                </span>
              </label>
              <ToggleField
                label="J’ai vérifié les informations auprès de cette source aujourd’hui"
                checked={form.mark_verified}
                onChange={(checked) => change("mark_verified", checked)}
              />
              <p className="text-xs leading-5 text-slate-500">
                Cette confirmation met à jour la date de vérification. Une modification simple de la fiche ne change pas cette date.
              </p>
              <label className="block text-sm font-medium text-slate-700">
                URL du logo
                <input
                  value={form.logo_url}
                  onChange={(event) => change("logo_url", event.target.value)}
                  placeholder="https://..."
                  className="field"
                />
              </label>
            </FormSection>

            <FormSection title="Description et finances">
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
            </FormSection>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
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

      <section aria-labelledby="university-catalogue-title">
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <QualityCard
            title="Source à compléter"
            value={missingSourceCount}
            detail="Établissements actifs sans source officielle enregistrée"
            tone={missingSourceCount ? "warning" : "success"}
          />
          <QualityCard
            title="Vérification à compléter"
            value={missingVerificationCount}
            detail="Établissements actifs sans date de vérification enregistrée"
            tone={missingVerificationCount ? "warning" : "success"}
          />
        </div>

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
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_16rem]">
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
            <label className="block text-sm font-medium text-slate-700">
              Qualité de la fiche
              <select value={quality} onChange={(event) => setQuality(event.target.value)} className="field">
                <option value="all">Toutes les fiches</option>
                <option value="missing_source">Source officielle à compléter</option>
                <option value="missing_verification">Date de vérification à compléter</option>
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
                    <Badge variant={university.source_url || university.website_url ? "info" : "warning"}>
                      {university.source_url || university.website_url ? "Source officielle enregistrée" : "Source officielle à compléter"}
                    </Badge>
                    <Badge variant={university.verified_at ? "success" : "warning"}>
                      {university.verified_at ? `Vérifié le ${formatVerificationDate(university.verified_at)}` : "Vérification à compléter"}
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

              {(university.source_url || university.website_url) && (
                <a
                  href={university.source_url || university.website_url || "#"}
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

function QualityCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: number;
  detail: string;
  tone: "success" | "warning";
}) {
  return (
    <Card as="article" className="shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span
          aria-hidden="true"
          className={`mt-1 h-2.5 w-2.5 rounded-full ${tone === "warning" ? "bg-amber-500" : "bg-emerald-600"}`}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </Card>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-muted)]/35 p-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
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
