import Link from "next/link";
import { ProspectOfferSelector, type PublishedOfferCard } from "@/components/prospect/ProspectOfferSelector";
import { prospectOffersCopy } from "@/content/prospect-offers-copy";
import { rebrandCopy } from "@/lib/brand";
import { getRequestLocale } from "@/lib/i18n-server";
import { getPhase2StudentAccess } from "@/lib/phase2/access";

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

function formatMinorPrice(
  value: number | string | null,
  currency: string | null,
  locale: keyof typeof localeTags,
) {
  if (value === null || !currency) return null;
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0) return null;

  try {
    const formatter = new Intl.NumberFormat(localeTags[locale], {
      style: "currency",
      currency,
    });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(amount / 10 ** digits);
  } catch {
    return null;
  }
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
      <main>
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{copy.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">{copy.title}</h1>
        </header>
        <section className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">{copy.lockedTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{copy.lockedBody}</p>
          <Link
            href="/prospect"
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--brand-strong)]"
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
    const priceLabel = formatMinorPrice(version.price_minor, version.currency, locale);
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
    <main>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">{copy.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{copy.intro}</p>
      </header>

      <ProspectOfferSelector offers={cards} copy={copy} />

      <p className="mt-5 text-xs leading-5 text-[var(--muted)]">{copy.disclaimer}</p>
    </main>
  );
}
