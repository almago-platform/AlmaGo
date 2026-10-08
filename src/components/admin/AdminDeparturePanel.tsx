"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type PostVisaTask = { title: string; owner: "student" | "almago"; description: string };

export const departureTaskPresets: readonly PostVisaTask[] = [
  {
    title: "Départ · Vérifier le visa et les dates de validité",
    owner: "almago",
    description: "Recontrôler avec le candidat le document officiel délivré, ses dates et les informations du passeport. Ne pas considérer un voyage comme possible avant sa confirmation.",
  },
  {
    title: "Départ · Confirmer logement et itinéraire",
    owner: "student",
    description: "Confirmer l'adresse du logement, la date de voyage réellement réservée, le contact sur place et un plan d’arrivée. Communiquer une mise à jour au conseiller.",
  },
  {
    title: "Départ · Préparer assurance et originaux",
    owner: "student",
    description: "Vérifier la couverture santé pour la date d'arrivée et rassembler passeport, visa, admission, financement et originaux nécessaires.",
  },
  {
    title: "Arrivée · Confirmer l’entrée en Allemagne",
    owner: "student",
    description: "Informer Campus Allemagne après l'arrivée réelle. Aucun suivi ne doit assimiler un billet réservé à une entrée sur le territoire.",
  },
  {
    title: "Arrivée · Vérifier Anmeldung, inscription et séjour",
    owner: "student",
    description: "Selon le lieu d'installation, organiser l’Anmeldung et confirmer l’inscription universitaire ou le démarrage du cours, puis les démarches auprès de l’Ausländerbehörde avant l'expiration du visa.",
  },
  {
    title: "Clôture · Faire le point et organiser le relais",
    owner: "almago",
    description: "Vérifier les étapes contractuellement incluses, confirmer le relais nécessaire et clôturer seulement avec une trace documentée des actions restant au candidat.",
  },
] as const;

export function AdminDeparturePanel({
  studentId,
  visaApproved,
  existing,
}: {
  studentId: string;
  visaApproved: boolean;
  existing: { title: string; status: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const taskByTitle = new Map(existing.map((item) => [item.title, item]));

  async function add(task: PostVisaTask) {
    if (busy || !visaApproved || taskByTitle.has(task.title)) return;
    if (!window.confirm(`Créer l'action « ${task.title} » dans le dossier ? Cette action pourra être visible par le candidat selon son accès.`)) return;
    setBusy(task.title);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/dossiers/${studentId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          owner: task.owner,
          due_date: "",
        }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setNotice(result.error || "L'action n'a pas pu être créée.");
      } else {
        router.refresh();
      }
    } catch {
      setNotice("Connexion indisponible. Aucune création confirmée.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-slate-950">Départ et arrivée · suivi opérationnel</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Ces tâches utilisent le suivi humain du Dossier 360° et son historique. Elles ne sont jamais créées automatiquement à la suite d’un simple changement d’état visa.
      </p>
      {!visaApproved ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Attendre une décision favorable avec preuve avant d’ouvrir les actions de départ.
        </p>
      ) : null}
      <div className="mt-4 divide-y divide-[var(--border)]">
        {departureTaskPresets.map((task) => {
          const found = taskByTitle.get(task.title);
          return (
            <article key={task.title} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={found?.status === "completed" ? "success" : found ? "info" : "neutral"}>
                    {found ? found.status === "completed" ? "Terminée dans le suivi" : "Action déjà enregistrée" : "À créer si utile"}
                  </Badge>
                  <Badge variant="neutral">{task.owner === "student" ? "Candidat" : "Campus Allemagne"}</Badge>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-950">{task.title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">{task.description}</p>
              </div>
              <Button type="button" variant="secondary" disabled={!visaApproved || Boolean(found) || Boolean(busy)} onClick={() => add(task)}>
                {busy === task.title ? "Création…" : found ? "Dans le dossier" : "Ajouter au suivi"}
              </Button>
            </article>
          );
        })}
      </div>
      {notice ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{notice}</p> : null}
      <Link href={`/admin/dossiers/${studentId}#actions`} className="mt-4 inline-block text-sm font-semibold text-[var(--brand-strong)] underline">
        Consulter, dater et terminer les actions dans Dossier 360° →
      </Link>
    </section>
  );
}
