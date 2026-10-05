import Link from "next/link";
import { ProspectOfferSelector, type PublishedOfferCard } from "@/components/prospect/ProspectOfferSelector";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { prospectOffersCopy } from "@/content/prospect-offers-copy";
import { rebrandCopy } from "@/lib/brand";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import { formatMinorCurrency } from "@/lib/money";

type OfferRow = {
  id: string;
  code: "bronze" | "silver" | "gold";
};

type VersionRow = {
  id: string;
  offer_id: string;
  display_name: string;
  summary: string;
  service_items: unknown;
  price_minor: number | string | null;
  currency: string | null;
};

const localeTags = {
  fr: "fr-FR",
  ar: "ar-TN",
  en: "en-GB",
  de: "de-DE",
} as const;

function serviceItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 20)
    : [];
}

export const dynamic = "force-dynamic";

export default async function ProspectOffersPage() {
  const access = await getPhase2StudentAccess();
  const locale = await getRequestLocale();
  const copy = rebrandCopy(prospectOffersCopy[locale]);

  if (access.customerStatus !== "qualified_prospect"
    && access.customerStatus !== "payment_pending"
    && access.customerStatus !== "paid_pending_validation") {
    return (
      <main className="space-y-8">
        <ProspectPageHero eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.intro} />
        <section className="rounded-[1.35rem] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 shadow-[0_22px_60px_-42px_rgba(216,6,33,.22)] sm:p-6">
          <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#202326]">{copy.lockedTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{copy.lockedBody}</p>
          <Link
            href="/prospect"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
          >
            {copy.backToSpace}
          </Link>
        </section>
      </main>
    );
  }

  const { data: offerData } = await access.supabase
    .from("commercial_offers")
    .select("id,code");

  const offers = (offerData ?? []) as OfferRow[];
  const offerIds = offers.map((offer) => offer.id);

  let versions: VersionRow[] = [];
  if (offerIds.length) {
    const { data } = await access.supabase
      .from("commercial_offer_versions")
      .select("id,offer_id,display_name,summary,service_items,price_minor,currency")
      .in("offer_id", offerIds)
      .eq("status", "published");
    versions = (data ?? []) as VersionRow[];
  }

  const offerById = new Map(offers.map((offer) => [offer.id, offer]));
  const cards: PublishedOfferCard[] = versions.flatMap((version) => {
    const offer = offerById.get(version.offer_id);
    const priceLabel = formatMinorCurrency(version.price_minor, version.currency, localeTags[locale]);
    const services = serviceItems(version.service_items);

    if (!offer || !priceLabel || services.length === 0) return [];

    return [{
      id: version.id,
      code: offer.code,
      displayName: version.display_name,
      summary: version.summary,
      services,
      priceLabel,
    }];
  }).sort((a, b) => {
    const order = { bronze: 0, silver: 1, gold: 2 };
    return order[a.code] - order[b.code];
  });

  return (
    <main className="space-y-8">
      <ProspectPageHero eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.intro} />

      <ProspectOfferSelector offers={cards} copy={copy} />

      <p className="rounded-[1.15rem] border border-[#ead59a] bg-[#fff9e9] p-4 text-xs leading-5 text-[#504832] shadow-[0_16px_42px_-36px_rgba(139,98,0,.35)]">{copy.disclaimer}</p>
    </main>
  );
}
