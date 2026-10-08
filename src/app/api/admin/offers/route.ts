import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/access";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const offerCodes = new Set(["bronze", "silver", "gold"]);
const actions = new Set(["draft", "publish"]);
const CURRENCY_RE = /^[A-Z]{3}$/;

const forbiddenGuaranteePatterns = [
  /(admission|visa).{0,40}(garant|guarantee)/i,
  /(garant|guarantee).{0,40}(admission|visa)/i,
  /(zulassung|visum).{0,40}garant/i,
  /garant.{0,40}(zulassung|visum)/i,
  /(قبول|تأشيرة).{0,40}مضمون/u,
  /مضمون.{0,40}(قبول|تأشيرة)/u,
];

function hasForbiddenGuarantee(value: string) {
  return forbiddenGuaranteePatterns.some((pattern) => pattern.test(value));
}

export async function POST(request: Request) {
  const { user, isAdmin } = await getAdminUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const offerCode = typeof record.offerCode === "string" ? record.offerCode : "";
  const action = typeof record.action === "string" ? record.action : "";
  const displayName = typeof record.displayName === "string" ? record.displayName.trim() : "";
  const summary = typeof record.summary === "string" ? record.summary.trim() : "";
  const currency = typeof record.currency === "string" && record.currency.trim()
    ? record.currency.trim().toUpperCase()
    : null;
  const rawPrice = record.priceMinor;
  const priceMinor =
    rawPrice === null || rawPrice === "" || rawPrice === undefined
      ? null
      : typeof rawPrice === "number"
        ? rawPrice
        : Number(rawPrice);
  const serviceItems = Array.isArray(record.serviceItems)
    ? record.serviceItems
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const combinedCopy = [displayName, summary, ...serviceItems].join(" ");

  if (
    !offerCodes.has(offerCode)
    || !actions.has(action)
    || displayName.length < 1
    || displayName.length > 80
    || summary.length < 1
    || summary.length > 500
    || serviceItems.length < 1
    || serviceItems.length > 20
    || serviceItems.some((item) => item.length > 200)
    || (priceMinor !== null && (!Number.isSafeInteger(priceMinor) || priceMinor < 0))
    || (currency !== null && !CURRENCY_RE.test(currency))
    || (action === "publish" && (priceMinor === null || currency === null))
    || hasForbiddenGuarantee(combinedCopy)
  ) {
    return NextResponse.json({ error: "Configuration d’offre invalide." }, { status: 400 });
  }

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  const { data, error } = await privileged.rpc(
    "configure_phase2_commercial_offer",
    {
      p_admin_user_id: user.id,
      p_offer_code: offerCode,
      p_publish: action === "publish",
      p_display_name: displayName,
      p_summary: summary,
      p_service_items: serviceItems,
      p_price_minor: priceMinor,
      p_currency: currency,
    },
  );

  if (error) {
    return NextResponse.json({ error: "Impossible d’enregistrer l’offre." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "L’offre n’a pas pu être enregistrée." }, { status: 409 });
  }

  return NextResponse.json({ saved: true }, { status: 201 });
}
