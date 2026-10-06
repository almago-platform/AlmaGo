import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CommercialOfferEditor } from "@/components/admin/CommercialOfferEditor";
import { createClient } from "@/lib/supabase/server";

const offerStatusLabels: Record<string, string> = {
  draft: "brouillon",
  published: "publiée",
  archived: "archivée",
};

type OfferCode = "bronze" | "silver" | "gold";

type OfferRow = {
  id: string;
  code: OfferCode;
};

type OfferVersionRow = {
  id: string;
  offer_id: string;
  version: number;
  status: "draft" | "published" | "retired";
  display_name: string;
  summary: string;
  service_items: unknown;
  price_minor: number | null;
  currency: string | null;
  published_at: string | null;
  created_at: string;
};

const offerOrder: OfferCode[] = ["bronze", "silver", "gold"];

function stringItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 20)
    : [];
}

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const supabase = await createClient();

  const [{ data: offerData }, { data: versionData }] = await Promise.all([
    supabase.from("commercial_offers").select("id,code"),
    supabase
      .from("commercial_offer_versions")
      .select("id,offer_id,version,status,display_name,summary,service_items,price_minor,currency,published_at,created_at")
      .order("version", { ascending: false }),
  ]);

  const offers = (offerData ?? []) as OfferRow[];
  const versions = (versionData ?? []) as OfferVersionRow[];
  const offerByCode = new Map(offers.map((offer) => [offer.code, offer]));
  const latestByOffer = new Map<string, OfferVersionRow>();
  const publishedByOffer = new Map<string, OfferVersionRow>();

  for (const version of versions) {
    if (!latestByOffer.has(version.offer_id)) latestByOffer.set(version.offer_id, version);
    if (version.status === "published" && !publishedByOffer.has(version.offer_id)) {
      publishedByOffer.set(version.offer_id, version);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Offres"
        title="Bronze, Silver et Gold"
        description="Créez des versions historisées. Aucun prix ni service n’est publié tant que vous ne cliquez pas explicitement sur « Publier cette version »."
      />

      <section className="mb-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5">
        <p className="text-sm font-bold text-[var(--foreground)]">Règles de publication</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Une publication exige un nom, un résumé, au moins un service, un montant et une devise ISO.
          Une nouvelle publication retire automatiquement l’ancienne version publiée sans supprimer l’historique.
          Ne promettez jamais admission ou visa.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {offerOrder.map((code) => {
          const offer = offerByCode.get(code);
          const latest = offer ? latestByOffer.get(offer.id) ?? null : null;
          const published = offer ? publishedByOffer.get(offer.id) ?? null : null;

          return (
            <section
              key={code}
              className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                    {code}
                  </p>
                  <h2 className="mt-1 text-xl font-bold capitalize text-slate-950">{code}</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                  {published ? "Publié v" + published.version : "Non publié"}
                </span>
              </div>

              {latest ? (
                <p className="mt-3 text-xs leading-5 text-slate-600">
                  Dernière version enregistrée : v{latest.version} · {offerStatusLabels[latest.status] || latest.status}
                </p>
              ) : (
                <p className="mt-3 text-xs leading-5 text-slate-600">
                  Aucune version commerciale enregistrée.
                </p>
              )}

              <CommercialOfferEditor
                offerCode={code}
                initialName={latest?.display_name ?? null}
                initialSummary={latest?.summary ?? null}
                initialServices={stringItems(latest?.service_items)}
                initialPriceMinor={latest?.price_minor ?? null}
                initialCurrency={latest?.currency ?? null}
              />
            </section>
          );
        })}
      </div>
    </main>
  );
}
