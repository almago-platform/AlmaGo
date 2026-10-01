import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0040_phase2_offer_configuration_rpc.sql",
  "utf8",
);
const policyRepair = readFileSync(
  "supabase/migrations/0041_phase2_offer_policy_correlation_fix.sql",
  "utf8",
);
const route = readFileSync("src/app/api/admin/offers/route.ts", "utf8");
const adminPage = readFileSync("src/app/admin/offers/page.tsx", "utf8");
const editor = readFileSync("src/components/admin/CommercialOfferEditor.tsx", "utf8");
const prospectPage = readFileSync("src/app/prospect/offers/page.tsx", "utf8");
const prospectLoading = readFileSync("src/app/prospect/offers/loading.tsx", "utf8");
const selector = readFileSync("src/components/prospect/ProspectOfferSelector.tsx", "utf8");
const copy = readFileSync("src/content/prospect-offers-copy.ts", "utf8");
const prospectShell = readFileSync("src/components/layout/ProspectShell.tsx", "utf8");
const appShell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const adminQuality = readFileSync("tests/e2e/admin-space-quality.spec.mjs", "utf8");

test("P2.8B offer publication is audited, versioned and admin-verified", () => {
  assert.match(migration, /create or replace function public\.configure_phase2_commercial_offer/i);
  assert.match(migration, /security definer/i);
  assert.match(migration, /set search_path = ''/i);
  assert.match(
    migration,
    /from public\.user_roles ur[\s\S]*ur\.user_id = p_admin_user_id[\s\S]*ur\.role = 'admin'/i,
  );
  assert.match(migration, /for update/i);
  assert.match(
    migration,
    /coalesce\(max\(v\.version\), 0\) \+ 1/i,
  );
  assert.match(
    migration,
    /update public\.commercial_offer_versions[\s\S]*status = 'retired'/i,
  );
  assert.match(
    migration,
    /insert into public\.commercial_offer_versions/i,
  );
});

test("P2.8B direct commercial writes are closed and RPC is service-role-only", () => {
  assert.match(
    migration,
    /revoke insert, update, delete, truncate[\s\S]*public\.commercial_offer_versions[\s\S]*from service_role/i,
  );
  assert.match(
    migration,
    /revoke execute on function public\.configure_phase2_commercial_offer[\s\S]*from public, anon, authenticated/i,
  );
  assert.match(
    migration,
    /grant execute on function public\.configure_phase2_commercial_offer[\s\S]*to service_role/i,
  );
});

test("P2.8B published offers are RLS-gated by qualification and drafts remain admin-only", () => {
  assert.match(
    migration,
    /drop policy if exists "published commercial offers authenticated read"/i,
  );
  assert.match(
    migration,
    /ca\.status in \([\s\S]*'qualified_prospect'[\s\S]*'payment_pending'[\s\S]*'paid_pending_validation'/i,
  );
  assert.match(
    migration,
    /status = 'published'::public\.commercial_offer_version_status[\s\S]*or \(select public\.is_admin\(\)\)/i,
  );
  assert.match(
    migration,
    /v\.offer_id = public\.commercial_offers\.id/i,
  );
  assert.doesNotMatch(
    migration,
    /v\.offer_id = id\b/i,
  );
  assert.doesNotMatch(
    migration,
    /client_active|client_completed/i,
  );
});

test("already-migrated environments receive an additive offer RLS correlation repair", () => {
  assert.match(
    policyRepair,
    /drop policy if exists "qualified prospect published offers read"/i,
  );
  assert.match(
    policyRepair,
    /v\.offer_id = public\.commercial_offers\.id/i,
  );
  assert.doesNotMatch(
    policyRepair,
    /v\.offer_id = id\b/i,
  );
});

test("admin API derives admin identity from session and validates owner-controlled content", () => {
  assert.match(route, /supabase\.auth\.getUser\(\)/);
  assert.match(route, /from\("user_roles"\)/);
  assert.match(route, /role\?\.role !== "admin"/);
  assert.match(route, /p_admin_user_id: user\.id/);
  assert.doesNotMatch(route, /record\.(?:admin|adminId|userId|user_id)/);
  assert.match(route, /offerCodes = new Set\(\["bronze", "silver", "gold"\]\)/);
  assert.match(route, /CURRENCY_RE = \/\^\[A-Z\]\{3\}\$\//);
  assert.match(route, /serviceItems\.length < 1/);
  assert.match(route, /serviceItems\.length > 20/);
  assert.match(route, /hasForbiddenGuarantee\(combinedCopy\)/);
});

test("brand-soft offer guidance keeps normal text above the contrast floor", () => {
  assert.match(
    adminPage,
    /bg-\[var\(--brand-soft\)\][\s\S]*text-slate-700/,
  );
  assert.match(
    prospectPage,
    /bg-\[var\(--brand-soft\)\][\s\S]*text-slate-700/,
  );
  assert.doesNotMatch(
    adminPage,
    /bg-\[var\(--brand-soft\)\][\s\S]{0,500}text-\[var\(--muted\)\]/,
  );
  assert.doesNotMatch(
    prospectPage,
    /lockedTitle[\s\S]{0,500}text-\[var\(--muted\)\]/,
  );
});

test("offer configuration UI never hardcodes price or service promises", () => {
  assert.match(adminPage, /CommercialOfferEditor/);
  assert.match(editor, /priceMinor/);
  assert.match(editor, /currency/);
  assert.match(editor, /serviceItems/);
  assert.match(editor, /submit\("draft"\)/);
  assert.match(editor, /submit\("publish"\)/);
  assert.doesNotMatch(
    adminPage + editor,
    /€\s*\d|EUR\s*\d|99\.00|199\.00|admission garantie|visa garanti/i,
  );
});

test("prospect offer page requires qualified commercial state and reads published DB data", () => {
  assert.match(prospectPage, /access\.customerStatus !== "qualified_prospect"/);
  assert.match(prospectPage, /access\.customerStatus !== "payment_pending"/);
  assert.match(prospectPage, /access\.customerStatus !== "paid_pending_validation"/);
  assert.match(prospectPage, /from\("commercial_offers"\)/);
  assert.match(prospectPage, /from\("commercial_offer_versions"\)/);
  assert.match(prospectPage, /\.eq\("status", "published"\)/);
  assert.match(prospectPage, /formatMinorPrice/);
});

test("prospect selection is UI-only and cannot trigger payment or client access", () => {
  assert.match(selector, /useState<string \| null>/);
  assert.match(selector, /setSelectedId/);
  assert.doesNotMatch(
    selector + prospectPage,
    /fetch\(|checkout|webhook|payment_intent|client_active|customer_access.*update/i,
  );
  assert.match(copy, /ne déclenche ni paiement ni accès client/);
  assert.match(copy, /لا يبدأ الدفع ولا يفتح مساحة العميل/);
  assert.match(copy, /does not start a payment or unlock client access/);
  assert.match(copy, /startet keine Zahlung und schaltet keinen Kundenzugang frei/);
});

test("offer navigation is available to admin and free-prospect shells", () => {
  assert.match(appShell, /href: "\/admin\/offers"/);
  assert.match(prospectShell, /href: "\/prospect\/offers"/);
  assert.match(prospectShell, /prospectOffersCopy/);
});

test("localized offer copy forbids admission and visa guarantees", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(copy, new RegExp(`const ${locale}: ProspectOffersCopy`));
  }
  assert.match(copy, /ne garantit une admission universitaire ou un visa/);
  assert.match(copy, /لا يضمن أي عرض من AlmaGo القبول الجامعي أو التأشيرة/);
  assert.match(copy, /No AlmaGo offer guarantees university admission or a visa/);
  assert.match(copy, /Kein AlmaGo-Angebot garantiert eine Hochschulzulassung oder ein Visum/);
});


test("authenticated admin quality matrix covers the commercial offer surface", () => {
  assert.match(adminQuality, /path: "\/admin\/offers", name: "offers"/);
  assert.match(adminQuality, /new AxeBuilder\(\{ page \}\)\.analyze\(\)/);
  assert.match(adminQuality, /item\.impact === "serious" \|\| item\.impact === "critical"/);
});

test("prospect offers has a localized neutral loading state", () => {
  assert.match(prospectLoading, /"use client"/);
  assert.match(prospectLoading, /useLocale\(\)/);
  assert.match(prospectLoading, /aria-busy="true"/);
  assert.match(prospectLoading, /role="status"/);
  assert.match(prospectLoading, /Chargement des offres/);
  assert.match(prospectLoading, /جارٍ تحميل العروض/);
  assert.match(prospectLoading, /Loading offers/);
  assert.match(prospectLoading, /Angebote werden geladen/);
  assert.match(prospectLoading, /prospectOffersCopy\[locale\]/);
  assert.doesNotMatch(prospectLoading, /€\s*\d|EUR\s*\d|admission garantie|visa garanti/i);
});
