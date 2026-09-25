"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { degreeLevels } from "@/lib/phase4";
import { hasVerifiedProgramSource, isHttpSourceUrl, isKnownCatalogueFixtureName, isPublishableProgram } from "@/lib/source-verification";

type Program = {
  id: string;
  university_id: string;
  name: string;
  degree_level: string;
  field: string | null;
  teaching_language: string | null;
  intake_terms: string[] | null;
  duration: string | null;
  nc_requirement: string | null;
  german_level_required: string | null;
  english_level_required: string | null;
  diploma_required: string | null;
  indicative_average: number | null;
  studienkolleg_required: boolean;
  testas_required: boolean;
  uni_assist_required: boolean;
  application_fee_notes: string | null;
  winter_deadline: string | null;
  summer_deadline: string | null;
  application_url: string | null;
  source_url: string | null;
  verified_at: string | null;
  almago_notes: string | null;
  is_active: boolean;
  universities: { name: string; city: string; is_active: boolean } | { name: string; city: string; is_active: boolean }[] | null;
};

type ProgramForm = {
  university_id: string;
  name: string;
  degree_level: string;
  field: string;
  language: string;
  intake_terms: string;
  duration: string;
  nc_requirement: string;
  german_level_required: string;
  english_level_required: string;
  diploma_required: string;
  indicative_average: string;
  studienkolleg_required: boolean;
  testas_required: boolean;
  uni_assist_required: boolean;
  application_fee_notes: string;
  winter_deadline: string;
  summer_deadline: string;
  official_url: string;
  source_url: string;
  mark_verified: boolean;
  almago_notes: string;
  is_active: boolean;
};

type Notice = { tone: "success" | "error"; text: string };

const empty: ProgramForm = {
  university_id: "",
  name: "",
  degree_level: "Bachelor",
  field: "",
  language: "",
  intake_terms: "Winter, Summer",
  duration: "",
  nc_requirement: "",
  german_level_required: "",
  english_level_required: "",
  diploma_required: "",
  indicative_average: "",
  studienkolleg_required: false,
  testas_required: false,
  uni_assist_required: false,
  application_fee_notes: "",
  winter_deadline: "",
  summer_deadline: "",
  official_url: "",
  source_url: "",
  mark_verified: false,
  almago_notes: "",
  is_active: false,
};

function programUniversity(program: Program) {
  return Array.isArray(program.universities) ? program.universities[0] : program.universities;
}

function universityName(program: Program) {
  const university = programUniversity(program);
  return university ? `${university.name} · ${university.city}` : "Université";
}

function programSourceUrl(program: Pick<Program, "source_url" | "application_url">) {
  if (isHttpSourceUrl(program.source_url)) return program.source_url?.trim() || null;
  if (isHttpSourceUrl(program.application_url)) return program.application_url?.trim() || null;
  return null;
}

function formatVerificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function AdminProgramsPanel({
  programs,
  universities,
  initialQuality = "all",
}: {
  programs: Program[];
  universities: { id: string; name: string; is_active: boolean }[];
  initialQuality?: string;
}) {
  const [items] = useState(programs);
  const [form, setForm] = useState<ProgramForm>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [quality, setQuality] = useState(
    ["all", "missing_source", "missing_verification", "missing_deadline", "inactive_university", "known_fixture"].includes(initialQuality)
      ? initialQuality
      : "all",
  );
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activePrograms = items.filter((program) => program.is_active);
  const publishablePrograms = items.filter(isPublishableProgram);
  const missingSourceCount = activePrograms.filter(
    (program) => !programSourceUrl(program),
  ).length;
  const missingVerificationCount = activePrograms.filter(
    (program) => !hasVerifiedProgramSource(program),
  ).length;
  const missingDeadlineCount = activePrograms.filter(
    (program) => !program.winter_deadline && !program.summer_deadline,
  ).length;
  const inactiveUniversityCount = activePrograms.filter(
    (program) => programUniversity(program)?.is_active !== true,
  ).length;
  const activeKnownFixtureCount = activePrograms.filter(
    (program) => isKnownCatalogueFixtureName(program.name),
  ).length;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return items.filter((program) => {
      if (level !== "all" && program.degree_level !== level) return false;
      if (quality === "missing_source" && programSourceUrl(program)) return false;
      if (quality === "missing_verification" && hasVerifiedProgramSource(program)) return false;
      if (quality === "missing_deadline" && (program.winter_deadline || program.summer_deadline)) return false;
      if (quality === "inactive_university" && programUniversity(program)?.is_active === true) return false;
      if (quality === "known_fixture" && !isKnownCatalogueFixtureName(program.name)) return false;
      if (!normalized) return true;
      return [program.name, program.field, universityName(program)]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr")
        .includes(normalized);
    });
  }, [items, query, level, quality]);

  function change(key: keyof ProgramForm, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditing(null);
    setForm(empty);
  }

  function edit(program: Program) {
    setEditing(program.id);
    setForm({
      university_id: program.university_id,
      name: program.name,
      degree_level: program.degree_level,
      field: program.field || "",
      language: program.teaching_language || "",
      intake_terms: (program.intake_terms || []).join(", "),
      duration: program.duration || "",
      nc_requirement: program.nc_requirement || "",
      german_level_required: program.german_level_required || "",
      english_level_required: program.english_level_required || "",
      diploma_required: program.diploma_required || "",
      indicative_average: program.indicative_average == null ? "" : String(program.indicative_average),
      studienkolleg_required: program.studienkolleg_required,
      testas_required: program.testas_required,
      uni_assist_required: program.uni_assist_required,
      application_fee_notes: program.application_fee_notes || "",
      winter_deadline: program.winter_deadline || "",
      summer_deadline: program.summer_deadline || "",
      official_url: program.application_url || "",
      source_url: program.source_url || "",
      mark_verified: false,
      almago_notes: program.almago_notes || "",
      is_active: program.is_active,
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
        editing ? `/api/admin/programs/${editing}` : "/api/admin/programs",
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
          text: result.error || "Nous n’arrivons pas à enregistrer ce programme pour le moment. Rien d’autre n’a été modifié.",
        });
        return;
      }

      setNotice({
        tone: "success",
        text: editing
          ? "Les informations du programme ont bien été mises à jour."
          : "Le programme a bien été ajouté au catalogue en état inactif. Activez-le séparément après contrôle.",
      });
      resetForm();
      window.location.reload();
    } catch {
      setNotice({
        tone: "error",
        text: "Nous n’arrivons pas à enregistrer ce programme pour le moment. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(program: Program) {
    setTogglingId(program.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/programs/${program.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_active: !program.is_active }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotice({
          tone: "error",
          text: result.error || "Nous n’arrivons pas à modifier l’état de ce programme pour le moment.",
        });
        return;
      }

      window.location.reload();
    } catch {
      setNotice({
        tone: "error",
        text: "Nous n’arrivons pas à modifier l’état de ce programme pour le moment. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-7">
      <Card aria-labelledby="admin-program-form-title" className="min-w-0 overflow-hidden">
        <form onSubmit={save}>
          <div className="mb-6 flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                {editing ? "Modification catalogue" : "Nouveau programme"}
              </p>
              <h2 id="admin-program-form-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                {editing ? "Modifier le programme" : "Ajouter un programme"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Renseignez uniquement les critères et échéances réellement vérifiés. Une donnée du catalogue n’est pas une décision d’admission.
              </p>
            </div>
            {editing && (
              <Button type="button" variant="secondary" onClick={resetForm} className="w-full justify-center sm:w-auto">
                Annuler la modification
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <FormSection title="1. Identité du programme">
              <div className="grid gap-3 lg:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Université
                  <select
                    required
                    value={form.university_id}
                    onChange={(event) => change("university_id", event.target.value)}
                    className="field"
                  >
                    <option value="">Choisir une université</option>
                    {universities.map((university) => (
                      <option
                        key={university.id}
                        value={university.id}
                        disabled={!university.is_active && university.id !== form.university_id}
                      >
                        {university.name}{university.is_active ? "" : " · inactive"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Nom du programme
                  <input
                    required
                    value={form.name}
                    onChange={(event) => change("name", event.target.value)}
                    placeholder="Ex. Computer Engineering"
                    className="field"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Niveau
                  <select value={form.degree_level} onChange={(event) => change("degree_level", event.target.value)} className="field">
                    {degreeLevels.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Domaine
                  <input value={form.field} onChange={(event) => change("field", event.target.value)} placeholder="Informatique, ingénierie…" className="field" />
                </label>
              </div>
            </FormSection>

            <FormSection title="2. Structure des études">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700">
                  Langue d’enseignement
                  <input value={form.language} onChange={(event) => change("language", event.target.value)} placeholder="Allemand, anglais…" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Semestres d’entrée
                  <input value={form.intake_terms} onChange={(event) => change("intake_terms", event.target.value)} placeholder="Winter, Summer" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Durée
                  <input value={form.duration} onChange={(event) => change("duration", event.target.value)} placeholder="6 semestres" className="field" />
                </label>
              </div>
            </FormSection>

            <FormSection title="3. Critères d’admission enregistrés">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700">
                  NC / restriction
                  <input value={form.nc_requirement} onChange={(event) => change("nc_requirement", event.target.value)} placeholder="NC / frei / à confirmer" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Diplôme requis
                  <input value={form.diploma_required} onChange={(event) => change("diploma_required", event.target.value)} placeholder="Diplôme requis" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Moyenne indicative
                  <input value={form.indicative_average} onChange={(event) => change("indicative_average", event.target.value)} placeholder="Si réellement documentée" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Allemand requis
                  <input value={form.german_level_required} onChange={(event) => change("german_level_required", event.target.value)} placeholder="B2, C1…" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Anglais requis
                  <input value={form.english_level_required} onChange={(event) => change("english_level_required", event.target.value)} placeholder="B2, C1…" className="field" />
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <ToggleField label="Studienkolleg requis" checked={form.studienkolleg_required} onChange={(checked) => change("studienkolleg_required", checked)} />
                <ToggleField label="TestAS requis" checked={form.testas_required} onChange={(checked) => change("testas_required", checked)} />
                <ToggleField label="Uni-Assist requis" checked={form.uni_assist_required} onChange={(checked) => change("uni_assist_required", checked)} />
              </div>
            </FormSection>

            <FormSection title="4. Échéances et candidature">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Deadline semestre d’hiver
                  <input type="date" value={form.winter_deadline} onChange={(event) => change("winter_deadline", event.target.value)} className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Deadline semestre d’été
                  <input type="date" value={form.summer_deadline} onChange={(event) => change("summer_deadline", event.target.value)} className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                  Lien officiel de candidature
                  <input value={form.official_url} onChange={(event) => change("official_url", event.target.value)} placeholder="https://..." className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                  Source officielle des informations
                  <input value={form.source_url} onChange={(event) => change("source_url", event.target.value)} placeholder="https://..." className="field" />
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Utilisez de préférence la page officielle qui contient les critères, exigences ou échéances enregistrés dans cette fiche.
                  </span>
                </label>
                <div className="md:col-span-2">
                  <ToggleField
                    label="J’ai vérifié les informations auprès de cette source aujourd’hui"
                    checked={form.mark_verified}
                    onChange={(checked) => change("mark_verified", checked)}
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Cette confirmation met à jour la date de vérification. Si vous changez un lien officiel sans reconfirmer la vérification, l’ancienne date sera retirée.
                  </p>
                </div>
                <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                  Frais de candidature
                  <textarea value={form.application_fee_notes} onChange={(event) => change("application_fee_notes", event.target.value)} placeholder="Frais ou notes vérifiées." className="field min-h-24 resize-y" />
                </label>
              </div>
            </FormSection>

            <FormSection title="5. Maintenance interne">
              <div className="mb-3 inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-bold text-slate-600">Interne à AlmaGo</div>
              <label className="block text-sm font-medium text-slate-700">
                Notes AlmaGo
                <textarea value={form.almago_notes} onChange={(event) => change("almago_notes", event.target.value)} placeholder="Notes internes de maintenance du catalogue." className="field min-h-24 resize-y" />
              </label>
              <ToggleField label="Programme actif dans AlmaGo" checked={form.is_active} onChange={(checked) => change("is_active", checked)} />
              <p className="text-xs leading-5 text-slate-500">
                Les notes AlmaGo restent internes à l’équipe. Elles ne sont pas présentées comme une information officielle de l’établissement. L’état actif contrôle l’utilisation du programme dans les parcours qui s’appuient sur le catalogue actif.
              </p>
            </FormSection>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Avant d’enregistrer, vérifiez les critères sensibles et les deadlines sur la source officielle lorsque celle-ci est disponible.
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

      <section aria-labelledby="program-catalogue-title">
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <QualityCard
            title="Programmes publiables"
            value={publishablePrograms.length}
            detail="Programme actif, université active et source vérifiée"
            tone={publishablePrograms.length ? "success" : "neutral"}
          />
          <QualityCard
            title="Source à compléter"
            value={missingSourceCount}
            detail="Programmes actifs sans lien officiel enregistré"
            tone={missingSourceCount ? "warning" : "success"}
          />
          <QualityCard
            title="Vérification à compléter"
            value={missingVerificationCount}
            detail="Programmes actifs sans date de vérification enregistrée"
            tone={missingVerificationCount ? "warning" : "success"}
          />
          <QualityCard
            title="Échéance à compléter"
            value={missingDeadlineCount}
            detail="Programmes actifs sans échéance hiver ni été"
            tone={missingDeadlineCount ? "warning" : "success"}
          />
          <QualityCard
            title="Université inactive"
            value={inactiveUniversityCount}
            detail="Programmes actifs actuellement non publiables"
            tone={inactiveUniversityCount ? "warning" : "success"}
          />
          <QualityCard
            title="Données de test actives"
            value={activeKnownFixtureCount}
            detail="Fiches connues à examiner puis désactiver explicitement"
            tone={activeKnownFixtureCount ? "warning" : "success"}
          />
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Catalogue</p>
            <h2 id="program-catalogue-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">Programmes enregistrés</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Recherchez par programme, domaine ou université puis modifiez uniquement la fiche concernée.</p>
          </div>
          <Badge variant={filtered.length ? "info" : "neutral"}>{filtered.length} affiché{filtered.length > 1 ? "s" : ""}</Badge>
        </div>

        <Card className="mb-5 shadow-none">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_16rem]">
            <label className="block text-sm font-medium text-slate-700">
              Rechercher
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Programme, domaine ou université" className="field" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Niveau
              <select value={level} onChange={(event) => setLevel(event.target.value)} className="field">
                <option value="all">Tous les niveaux</option>
                {degreeLevels.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Qualité de la fiche
              <select value={quality} onChange={(event) => setQuality(event.target.value)} className="field">
                <option value="all">Toutes les fiches</option>
                <option value="missing_source">Source officielle à compléter</option>
                <option value="missing_verification">Date de vérification à compléter</option>
                <option value="missing_deadline">Échéance à compléter</option>
                <option value="inactive_university">Université inactive</option>
                <option value="known_fixture">Données de test connues</option>
              </select>
            </label>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((program) => (
            <Card as="article" key={program.id} aria-labelledby={`admin-program-title-${program.id}`} className={`min-w-0 overflow-hidden break-words ${program.is_active ? "" : "bg-slate-50/70"}`}>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">{program.degree_level}</Badge>
                    {isKnownCatalogueFixtureName(program.name) && (
                      <Badge variant="warning">Donnée de test connue</Badge>
                    )}
                    <Badge variant={program.is_active ? "success" : "neutral"}>{program.is_active ? "Actif" : "Inactif"}</Badge>
                    {programUniversity(program)?.is_active === false && (
                      <Badge variant="warning">Université inactive · non publiable</Badge>
                    )}
                    <Badge variant={programSourceUrl(program) ? "info" : "warning"}>
                      {programSourceUrl(program) ? "Source officielle valide enregistrée" : "Source officielle à compléter"}
                    </Badge>
                    <Badge variant={hasVerifiedProgramSource(program) ? "success" : "warning"}>
                      {hasVerifiedProgramSource(program) && program.verified_at
                        ? `Vérifié le ${formatVerificationDate(program.verified_at)}`
                        : "Vérification à compléter"}
                    </Badge>
                  </div>
                  <h3 id={`admin-program-title-${program.id}`} className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950 [overflow-wrap:anywhere]">{program.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">{universityName(program)}</p>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Info label="Domaine" value={program.field || "À préciser"} />
                <Info label="Langue" value={program.teaching_language || "À préciser"} />
                <Info label="Deadline hiver" value={program.winter_deadline || "À confirmer"} />
                <Info label="Deadline été" value={program.summer_deadline || "À confirmer"} />
              </dl>

              {programSourceUrl(program) && (
                <a href={programSourceUrl(program) || "#"} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]">
                  Ouvrir la source officielle
                </a>
              )}

              <div className="mt-5 flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:flex-wrap">
                <Button type="button" variant="secondary" onClick={() => edit(program)} className="w-full justify-center sm:w-auto">
                  Modifier
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-center sm:w-auto"
                  disabled={togglingId === program.id}
                  onClick={() => toggleActive(program)}
                >
                  {togglingId === program.id
                    ? "Enregistrement…"
                    : program.is_active
                      ? "Désactiver"
                      : "Réactiver"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="mt-4 border-dashed bg-white/70 py-9 text-center shadow-none">
            <h3 className="font-bold text-slate-950">Aucun programme ne correspond à ces filtres.</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Modifiez la recherche ou le niveau sélectionné. Aucun programme n’a été supprimé ou modifié.</p>
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
  tone: "success" | "warning" | "neutral";
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
          className={`mt-1 h-2.5 w-2.5 rounded-full ${
            tone === "warning"
              ? "bg-amber-500"
              : tone === "success"
                ? "bg-emerald-600"
                : "bg-slate-300"
          }`}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </Card>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-muted)]/35 p-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900 [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
