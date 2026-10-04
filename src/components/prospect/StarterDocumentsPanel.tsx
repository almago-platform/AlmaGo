"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { starterDocumentCategoriesForBacStatus } from "@/lib/campus-intake";
import { removableDocumentStatuses } from "@/lib/documents";

type StarterDocument = {
  id: string;
  category: string;
  original_filename: string;
  status: string;
  admin_comment: string | null;
  created_at: string;
};

function statusText(status: string) {
  if (status === "approved") return "Validé par Campus Allemagne";
  if (status === "pending" || status === "reviewed") return "En cours de vérification";
  if (status === "replace_required") return "À remplacer";
  if (status === "rejected") return "À corriger";
  return "Reçu";
}

function statusClass(status: string) {
  if (status === "approved") return "bg-emerald-50 text-emerald-800";
  if (status === "replace_required" || status === "rejected") return "bg-amber-50 text-amber-900";
  return "bg-blue-50 text-blue-800";
}

export function StarterDocumentsPanel({
  documents,
  preBac = false,
}: {
  documents: StarterDocument[];
  preBac?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("passport");
  const [busy, setBusy] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const documentRequirements = starterDocumentCategoriesForBacStatus(
    preBac ? "preparing" : "obtained",
  );
  const requiredCategories = documentRequirements
    .filter((item) => item.required)
    .map((item) => item.category);

  const latestByCategory = new Map<string, StarterDocument>();
  for (const document of documents) {
    if (!latestByCategory.has(document.category)) {
      latestByCategory.set(document.category, document);
    }
  }

  const approvedRequired = requiredCategories.filter((requiredCategory) =>
    documents.some(
      (document) => document.category === requiredCategory && document.status === "approved",
    ),
  ).length;
  const requiredReady = !preBac && approvedRequired === requiredCategories.length;
  const requiredProgress = requiredCategories.length
    ? Math.round((approvedRequired / requiredCategories.length) * 100)
    : 100;

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choisissez un fichier.");
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("file", file);

      const response = await fetch("/api/prospect/documents/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "Envoi impossible.");
        return;
      }

      if (inputRef.current) inputRef.current.value = "";
      setSelectedFileName("");
      setMessage("Document envoyé. Campus Allemagne va le vérifier.");
      router.refresh();
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(documentId: string) {
    if (!window.confirm("Supprimer ce document pour pouvoir le remplacer ?")) return;

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/prospect/documents/${documentId}`, {
        method: "DELETE",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "Suppression impossible.");
        return;
      }

      setMessage("Document supprimé.");
      router.refresh();
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <div className="relative overflow-hidden bg-[var(--foreground)] p-5 text-white sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-[var(--brand)]/14 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-amber-300">
              {preBac ? "Préparation avant le Bac" : "Pièces de départ"}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              {preBac ? "Ajoutez seulement ce que vous avez déjà" : "Complétez votre dossier de vérification"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">
              {preBac
                ? "Aucun document académique final n’est obligatoire maintenant. Vous pouvez ajouter votre passeport et votre certificat de langue s’ils sont déjà disponibles."
                : "Nous demandons seulement les preuves nécessaires pour décider du parcours adapté. Le certificat de langue est facultatif si vous n’en avez pas encore."}
            </p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          {preBac ? (
            <div className="rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="font-bold text-emerald-900">Aucun document obligatoire avant les résultats du Bac.</p>
              <p className="mt-1 text-sm leading-6 text-emerald-900">
                Vous pouvez continuer votre préparation même avec 0 document envoyé. Le Bac et le relevé final seront demandés après vos résultats.
              </p>
            </div>
          ) : (
            <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold">
                  Pièces obligatoires validées : {approvedRequired}/{requiredCategories.length}
                </span>
                <span className="text-[var(--muted)]">{requiredProgress}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)]"
                  style={{ width: `${requiredProgress}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {documentRequirements.map((requirement) => {
            const document = latestByCategory.get(requirement.category);
            return (
              <article
                key={requirement.category}
                className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{requirement.label}</h2>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {preBac
                        ? "Facultatif · si disponible"
                        : requirement.required
                          ? "Obligatoire pour la première validation"
                          : "Facultatif si vous l’avez déjà"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      document ? statusClass(document.status) : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {document ? statusText(document.status) : "Pas encore envoyé"}
                  </span>
                </div>

                {document ? (
                  <div className="mt-4">
                    <p className="truncate text-sm font-semibold">{document.original_filename}</p>
                    {document.admin_comment ? (
                      <p className="mt-2 text-sm leading-6 text-amber-900">{document.admin_comment}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                      <a
                        href={`/api/prospect/documents/${document.id}/view`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--brand-strong)] underline underline-offset-4"
                      >
                        Ouvrir
                      </a>
                      {removableDocumentStatuses.includes(
                        document.status as (typeof removableDocumentStatuses)[number],
                      ) ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => remove(document.id)}
                          className="text-red-700 underline underline-offset-4 disabled:opacity-50"
                        >
                          Supprimer / remplacer
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

          {requiredReady ? (
            <div className="mt-5 rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-bold text-emerald-900">Les pièces obligatoires sont validées.</p>
              <p className="mt-1 text-sm leading-6 text-emerald-900">
                Vous n’avez rien d’autre à faire maintenant. Campus Allemagne peut examiner votre parcours.
              </p>
            </div>
          ) : null}
          {preBac ? (
            <div className="mt-5 flex flex-wrap gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">Votre projet peut avancer sans dossier académique final.</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Continuez la langue, explorez les programmes et revenez mettre votre projet à jour après les résultats du Bac.
                </p>
              </div>
              <Link
                href="/prospect/roadmap"
                className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold"
              >
                Continuer ma préparation
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {(preBac || !requiredReady) ? (
        <form
          onSubmit={upload}
          className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6"
        >
          <h2 className="text-xl font-bold">Ajouter un document</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Type de document
              <select
                className="field mt-2"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {documentRequirements.map((item) => (
                  <option key={item.category} value={item.category}>{item.label}</option>
                ))}
              </select>
            </label>
            <div>
              <span className="text-sm font-semibold">Fichier</span>
              <input
                ref={inputRef}
                id="prospect-document-file"
                className="sr-only"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) => {
                  setSelectedFileName(event.target.files?.[0]?.name || "");
                  setError(null);
                }}
              />
              <label
                htmlFor="prospect-document-file"
                className="mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-control)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] px-4 py-4 text-center hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]"
              >
                <span className="text-sm font-bold text-[var(--foreground)]">
                  {selectedFileName || "Choisir un fichier"}
                </span>
                <span className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  PDF, JPG ou PNG · 10 MiB maximum
                </span>
              </label>
            </div>
          </div>

          {error ? <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
          {message ? <p role="status" className="mt-4 text-sm font-semibold text-emerald-800">{message}</p> : null}

          <button
            type="submit"
            disabled={busy || !selectedFileName}
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Envoi…" : "Envoyer le document"}
          </button>
        </form>
      ) : null}

      <Link
        href="/prospect"
        className="inline-flex min-h-11 w-fit items-center text-sm font-bold text-[var(--brand-strong)] underline underline-offset-4"
      >
        Retour à mon espace
      </Link>
    </div>
  );
}
