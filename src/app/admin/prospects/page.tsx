import { ProspectQualificationReviewForm } from "@/components/admin/ProspectQualificationReviewForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createClient } from "@/lib/supabase/server";

type ProspectRow = {
  id: string;
  email: string;
  user_id: string | null;
  created_at: string;
};

type OrientationRow = {
  id: string;
  prospect_id: string;
  created_at: string;
};

type QualificationRow = {
  id: string;
  orientation_id: string;
  state: string;
  origin: string;
  created_at: string;
};

type AccessRow = {
  user_id: string;
  status: string;
};

const qualificationLabels: Record<string, string> = {
  not_evaluated: "À évaluer",
  too_early: "Encore tôt",
  needs_information: "Informations manquantes",
  needs_verification: "À vérifier",
  ready_for_review: "Prêt pour revue",
  qualified_prospect: "Qualifié",
};

export const dynamic = "force-dynamic";

export default async function AdminProspectsPage() {
  const supabase = await createClient();

  const { data: prospectData, error: prospectError } = await supabase
    .from("prospects")
    .select("id,email,user_id,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (prospectError) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader
          section="Prospects"
          title="Qualification des projets"
          description="La file de qualification est temporairement indisponible."
        />
      </main>
    );
  }

  const prospects = (prospectData ?? []) as ProspectRow[];
  const prospectIds = prospects.map((prospect) => prospect.id);
  const userIds = prospects.flatMap((prospect) => prospect.user_id ? [prospect.user_id] : []);

  let orientations: OrientationRow[] = [];
  if (prospectIds.length) {
    const { data } = await supabase
      .from("orientations")
      .select("id,prospect_id,created_at")
      .in("prospect_id", prospectIds)
      .order("created_at", { ascending: false })
      .limit(250);
    orientations = (data ?? []) as OrientationRow[];
  }

  const latestOrientationByProspect = new Map<string, OrientationRow>();
  for (const orientation of orientations) {
    if (!latestOrientationByProspect.has(orientation.prospect_id)) {
      latestOrientationByProspect.set(orientation.prospect_id, orientation);
    }
  }

  const currentOrientationIds = [...latestOrientationByProspect.values()].map(
    (orientation) => orientation.id,
  );

  let qualifications: QualificationRow[] = [];
  if (currentOrientationIds.length) {
    const { data } = await supabase
      .from("prospect_qualifications")
      .select("id,orientation_id,state,origin,created_at")
      .in("orientation_id", currentOrientationIds)
      .order("created_at", { ascending: false })
      .limit(250);
    qualifications = (data ?? []) as QualificationRow[];
  }

  const latestQualificationByOrientation = new Map<string, QualificationRow>();
  for (const qualification of qualifications) {
    if (!latestQualificationByOrientation.has(qualification.orientation_id)) {
      latestQualificationByOrientation.set(qualification.orientation_id, qualification);
    }
  }

  let accessRows: AccessRow[] = [];
  if (userIds.length) {
    const { data } = await supabase
      .from("customer_access")
      .select("user_id,status")
      .in("user_id", userIds);
    accessRows = (data ?? []) as AccessRow[];
  }
  const accessByUser = new Map(accessRows.map((row) => [row.user_id, row.status]));

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const readyCount = prospects.filter((prospect) => {
    const orientation = latestOrientationByProspect.get(prospect.id);
    const qualification = orientation
      ? latestQualificationByOrientation.get(orientation.id)
      : null;
    return qualification?.state === "ready_for_review"
      && prospect.user_id
      && accessByUser.get(prospect.user_id) === "prospect_account";
  }).length;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Prospects"
        title="Qualification des projets"
        description="Examinez uniquement les projets prêts pour revue. Une qualification ne garantit ni admission ni visa."
      />

      <section className="mb-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5">
        <p className="text-sm font-bold text-[var(--foreground)]">
          {readyCount} projet{readyCount > 1 ? "s" : ""} prêt{readyCount > 1 ? "s" : ""} pour revue humaine
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Qualifier un projet fait passer uniquement le statut commercial du compte gratuit à « prospect qualifié ». Cela n’active jamais l’espace client.
        </p>
      </section>

      {!prospects.length ? (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">Aucun prospect enregistré</h2>
          <p className="mt-2 text-sm text-slate-600">La file apparaîtra lorsque des orientations seront rattachées à des comptes gratuits.</p>
        </section>
      ) : (
        <div className="grid gap-4">
          {prospects.map((prospect) => {
            const orientation = latestOrientationByProspect.get(prospect.id) ?? null;
            const qualification = orientation
              ? latestQualificationByOrientation.get(orientation.id) ?? null
              : null;
            const accessStatus = prospect.user_id
              ? accessByUser.get(prospect.user_id) ?? null
              : null;
            const canReview =
              qualification?.state === "ready_for_review"
              && accessStatus === "prospect_account";

            return (
              <article
                key={prospect.id}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      <bdi dir="auto">{prospect.email}</bdi>
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Prospect créé le <bdi dir="auto">{dateFormatter.format(new Date(prospect.created_at))}</bdi>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {qualification
                        ? qualificationLabels[qualification.state] ?? qualification.state
                        : "Non évalué"}
                    </span>
                    <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand-strong)]">
                      {accessStatus ?? "sans compte lié"}
                    </span>
                  </div>
                </div>

                {!orientation ? (
                  <p className="mt-4 text-sm text-slate-600">Aucune orientation enregistrée.</p>
                ) : !qualification ? (
                  <p className="mt-4 text-sm text-slate-600">
                    Cette orientation n’a pas encore de qualification P2.7 persistée.
                  </p>
                ) : (
                  <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm text-slate-700">
                    <p>
                      Dernière orientation : <bdi dir="auto">{dateFormatter.format(new Date(orientation.created_at))}</bdi>
                    </p>
                    <p className="mt-1">
                      Origine de la qualification : {qualification.origin === "automatic" ? "automatique" : "revue humaine"}
                    </p>
                  </div>
                )}

                {canReview && orientation && qualification ? (
                  <ProspectQualificationReviewForm
                    orientationId={orientation.id}
                    qualificationId={qualification.id}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
