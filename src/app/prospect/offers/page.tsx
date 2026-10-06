import Link from "next/link";
import { ProspectOfferSelector, type PublishedOfferCard } from "@/components/prospect/ProspectOfferSelector";
import { ProspectPageHero } from "@/components/prospect/ProspectPageHero";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { buttonClassName } from "@/components/ui/Button";
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
      <main className="space-y-6">
        <ProspectPageHero eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.intro} />
        <PremiumEmptyState
          eyebrow={copy.eyebrow}
          title={copy.lockedTitle}
          description={copy.lockedBody}
          action={
            <Link href="/prospect" className={buttonClassName("secondary")}>
              {copy.backToSpace}
            </Link>
          }
        />
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
    <main className="space-y-6">
      <ProspectPageHero eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.intro} />

      <ProspectOfferSelector offers={cards} copy={copy} />

      <p className="pc-waiting-strip p-4 text-xs leading-5 text-[var(--foreground-soft)]">{copy.disclaimer}</p>
    </main>
  );
}
