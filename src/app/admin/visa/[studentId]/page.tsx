import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import {
  AdminVisaCasePanel,
  type VisaCaseRow,
  type VisaDocumentOption,
} from "@/components/admin/AdminVisaCasePanel";
import { visaStatusLabels, isVisaStatus } from "@/lib/admin/visa-workflow";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminVisaStudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  if (!UUID_RE.test(studentId)) notFound();
  const supabase = await createClient();
  const [profileResult, caseResult, historyResult, documentsResult] = await Promise.all([
    supabase.from("profiles").select("id,first_name,last_name,full_name").eq("id", studentId).maybeSingle(),
    supabase.from("visa_cases")
      .select("student_id,track,residence_country,mission,status,official_source_url,source_verified_at,evidence_document_id,note,version,updated_at")
      .eq("student_id", studentId).maybeSingle(),
    supabase.from("visa_case_events")
      .select("id,from_status,to_status,track,version,evidence_document_id,note,created_at")
      .eq("student_id", studentId).order("created_at", { ascending: false }).limit(40),
    supabase.from("documents")
      .select("id,original_filename,created_at")
      .eq("student_id", studentId).eq("category", "other").eq("status", "approved")
      .order("created_at", { ascending: false }).limit(100),
  ]);

  if (!profileResult.data && !profileResult.error) notFound();

  if (profileResult.error || caseResult.error || historyResult.error || documentsResult.error) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 xl:px-8">
        <AdminPageHeader section="Dossiers" title="Suivi visa" description="Dossier consulaire réservé à l'administrateur." />
        <AdminLoadError
          title="Le suivi visa n'est pas disponible"
          description="Le schéma de suivi visa doit être déployé et ses permissions vérifiées avant utilisation. Aucune décision n’a été enregistrée."
          retryHref={`/admin/visa/${studentId}`}
        />
      </main>
    );
  }

  const profile = profileResult.data;
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim()
    || profile?.full_name || "Candidat";
  const visaCase = (caseResult.data || null) as VisaCaseRow | null;
  const history = (historyResult.data || []) as Array<{
    id: string;
    from_status: string | null;
    to_status: string;
    track: string;
    version: number;
    evidence_document_id: string | null;
    note: string | null;
    created_at: string;
  }>;
  const documents = (documentsResult.data || []) as VisaDocumentOption[];
  const docById = new Map(documents.map((doc) => [doc.id, doc.original_filename]));

  return (
    <main className="mx-auto w-full max-w-[92rem] space-y-6 px-4 py-6 sm:px-6 xl:px-8">
      <AdminPageHeader
        section="Dossiers"
        title={`Suivi visa · ${name}`}
        description="Suivi interne des démarches justifiées. Aucun changement de statut ne dépose une demande au consulat."
        actions={
          <>
            <Link href="/admin/accompagnement" className={buttonClassName("secondary", "px-4")}>Accompagnement de A à Z</Link>
            <Link href={`/admin/dossiers/${studentId}`} className={buttonClassName("primary", "px-4")}>Dossier 360°</Link>
          </>
        }
      />

      <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm leading-6 text-slate-700">
        <p><strong>Avant de conclure :</strong> contrôler la compétence consulaire, l’identité et le pays de résidence du demandeur, la source officielle et le motif exact. Seul un document privé « Autre » déjà approuvé pour cette personne peut étayer un dépôt, un rendez-vous ou une décision.</p>
        <p className="mt-2">Les preuves se déposent et se vérifient via le module Documents. Un refus ou un accord de visa ne peut pas être déduit d’une date, d’une admission ou d’un message informel.</p>
        <Link href="/admin/documents" className="mt-2 inline-block font-semibold text-[var(--brand-strong)] underline">Vérifier les documents du candidat →</Link>
      </div>

      <AdminVisaCasePanel studentId={studentId} visaCase={visaCase} documents={documents} />

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-950">Historique des validations visa</h2>
          <Badge variant="neutral">{history.length} entrée{history.length > 1 ? "s" : ""}</Badge>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">Journal interne généré automatiquement par la base. Les anciens états ne peuvent pas être modifiés depuis le navigateur.</p>
        <div className="mt-4 divide-y divide-[var(--border)]">
          {!history.length ? <p className="py-4 text-sm text-slate-600">Aucune étape visa encore enregistrée.</p> : history.map((item) => (
            <article key={item.id} className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">Version {item.version}</Badge>
                <span className="text-sm font-semibold text-slate-900">
                  {item.from_status && isVisaStatus(item.from_status) ? visaStatusLabels[item.from_status] + " → " : "Création → "}
                  {isVisaStatus(item.to_status) ? visaStatusLabels[item.to_status] : "État non reconnu"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" }).format(new Date(item.created_at))}
              </p>
              {item.evidence_document_id ? (
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  Justificatif : {docById.get(item.evidence_document_id) || "Ancienne preuve enregistrée dans le dossier"}
                </p>
              ) : null}
              {item.note ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.note}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
