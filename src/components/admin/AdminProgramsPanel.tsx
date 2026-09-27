"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  buildMasterRequirementsDocument,
  emptyMasterRequirementsForm,
  masterRequirementsFormFromDocument,
  type MasterRequirementsFormState,
} from "@/lib/master-requirements-form";
import { readMasterRequirementsDocument } from "@/lib/master-requirements-persistence";
import { degreeLevels } from "@/lib/phase4";

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
  almago_notes: string | null;
  requirements: unknown;
  is_active: boolean;
  universities: { name: string; city: string } | { name: string; city: string }[] | null;
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
  almago_notes: "",
  is_active: true,
};

function universityName(program: Program) {
  const university = Array.isArray(program.universities) ? program.universities[0] : program.universities;
  return university ? `${university.name} · ${university.city}` : "Université";
}

export function AdminProgramsPanel({
  programs,
  universities,
}: {
  programs: Program[];
  universities: { id: string; name: string }[];
}) {
  const [items] = useState(programs);
  const [form, setForm] = useState<ProgramForm>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [masterForm, setMasterForm] = useState<MasterRequirementsFormState>({ ...emptyMasterRequirementsForm });

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return items.filter((program) => {
      if (level !== "all" && program.degree_level !== level) return false;
      if (!normalized) return true;
      return [program.name, program.field, universityName(program)]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr")
        .includes(normalized);
    });
  }, [items, query, level]);

  function change(key: keyof ProgramForm, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditing(null);
    setForm(empty);
    setMasterForm({ ...emptyMasterRequirementsForm });
    setFormOpen(false);
  }

  function changeMaster(key: Exclude<keyof MasterRequirementsFormState, "evidence_conflict">, value: string) {
    setMasterForm((current) => ({ ...current, [key]: value, evidence_conflict: false } as MasterRequirementsFormState));
  }

  function edit(program: Program) {
    setEditing(program.id);
    setFormOpen(true);
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
      almago_notes: program.almago_notes || "",
      is_active: program.is_active,
    });
    setMasterForm(masterRequirementsFormFromDocument(readMasterRequirementsDocument(program.requirements)));
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);

    const master = buildMasterRequirementsDocument(masterForm);
    if (master.error) {
      setNotice({ tone: "error", text: master.error });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(
        editing ? `/api/admin/programs/${editing}` : "/api/admin/programs",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...form,
            ...(master.document ? { master_requirements: master.document } : {}),
          }),
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
          : "Le programme a bien été ajouté au catalogue.",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">Catalogue des programmes</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Recherchez une formation existante avant d’en créer une nouvelle.</p>
        </div>
        <Button type="button" onClick={() => { resetForm(); setFormOpen(true); }} className="w-full justify-center sm:w-auto">+ Ajouter un programme</Button>
      </div>

      {formOpen && (
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
                      <option key={university.id} value={university.id}>{university.name}</option>
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
                  Frais de candidature
                  <textarea value={form.application_fee_notes} onChange={(event) => change("application_fee_notes", event.target.value)} placeholder="Frais ou notes vérifiées." className="field min-h-24 resize-y" />
                </label>
              </div>
            </FormSection>

            <FormSection title="5. Exigences Master vérifiées">
              <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-600">
                Utilisez cette section uniquement pour des exigences publiées par une source officielle. Les anciens champs du catalogue ne sont jamais convertis automatiquement.
              </p>
              {masterForm.evidence_conflict && (
                <p role="alert" className="mb-4 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Cette fiche contient plusieurs preuves différentes. Renseignez une preuve commune actualisée avant d’enregistrer une modification.
                </p>
              )}
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700">
                  ECTS minimum
                  <input type="number" min="0.01" step="0.01" value={masterForm.minimum_ects} onChange={(event) => changeMaster("minimum_ects", event.target.value)} placeholder="Ex. 180" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Note minimale
                  <input type="number" min="0.01" step="0.01" value={masterForm.minimum_grade} onChange={(event) => changeMaster("minimum_grade", event.target.value)} placeholder="Uniquement si publiée" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Route de candidature
                  <select value={masterForm.application_route} onChange={(event) => changeMaster("application_route", event.target.value)} className="field">
                    <option value="unknown">Non confirmée</option>
                    <option value="direct">Directe</option>
                    <option value="uni_assist">uni-assist</option>
                    <option value="vpd">VPD</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Domaine de crédits
                  <input value={masterForm.subject} onChange={(event) => changeMaster("subject", event.target.value)} placeholder="Ex. Mathématiques" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  ECTS dans ce domaine
                  <input type="number" min="0.01" step="0.01" value={masterForm.subject_ects} onChange={(event) => changeMaster("subject_ects", event.target.value)} placeholder="Ex. 20" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Diplôme antérieur requis
                  <input value={masterForm.prior_degree} onChange={(event) => changeMaster("prior_degree", event.target.value)} placeholder="Texte officiel, sans interprétation" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Langue
                  <input value={masterForm.language} onChange={(event) => changeMaster("language", event.target.value)} placeholder="Ex. English" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Niveau requis
                  <input value={masterForm.language_level} onChange={(event) => changeMaster("language_level", event.target.value)} placeholder="Ex. C1" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Intake
                  <input value={masterForm.intake} onChange={(event) => changeMaster("intake", event.target.value)} placeholder="Ex. Wintersemester" className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Deadline officielle
                  <input type="date" value={masterForm.deadline} onChange={(event) => changeMaster("deadline", event.target.value)} className="field" />
                </label>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700">
                  Source officielle
                  <input type="url" value={masterForm.source_url} onChange={(event) => changeMaster("source_url", event.target.value)} placeholder="https://..." className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Vérifié le
                  <input type="date" value={masterForm.verified_at} onChange={(event) => changeMaster("verified_at", event.target.value)} className="field" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  À revoir avant le
                  <input type="date" value={masterForm.review_due_at} onChange={(event) => changeMaster("review_due_at", event.target.value)} className="field" />
                </label>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Une exigence n’est enregistrée comme structurée que si sa source HTTPS et ses dates de vérification sont valides. Une valeur vide reste inconnue et n’est jamais transformée en zéro.
              </p>
            </FormSection>

            <FormSection title="6. Maintenance interne">
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
      )}

      <section aria-labelledby="program-catalogue-title">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Catalogue</p>
            <h2 id="program-catalogue-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">Programmes enregistrés</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Recherchez par programme, domaine ou université puis modifiez uniquement la fiche concernée.</p>
          </div>
          <Badge variant={filtered.length ? "info" : "neutral"}>{filtered.length} affiché{filtered.length > 1 ? "s" : ""}</Badge>
        </div>

        <Card className="mb-5 shadow-none">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
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
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((program) => (
            <Card as="article" key={program.id} aria-labelledby={`admin-program-title-${program.id}`} className={`min-w-0 overflow-hidden break-words ${program.is_active ? "" : "bg-slate-50/70"}`}>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">{program.degree_level}</Badge>
                    <Badge variant={program.is_active ? "success" : "neutral"}>{program.is_active ? "Actif" : "Inactif"}</Badge>
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

              {program.application_url && (
                <a href={program.application_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]">
                  Vérifier la source officielle
                </a>
              )}

              <div className="mt-5 border-t border-[var(--border)] pt-4">
                <Button type="button" variant="secondary" onClick={() => edit(program)} className="w-full justify-center sm:w-auto">Modifier</Button>
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
