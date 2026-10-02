import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/admin/prospects/page.tsx", "utf8");
const layout = readFileSync("src/app/admin/layout.tsx", "utf8");

test("FVL-2 reads explicit Free Validation interest signals", () => {
  assert.match(page, /from\("free_validation_interest_signals"\)/);
  assert.match(page, /select\("prospect_id,orientation_id,source,signal_version,created_at"\)/);
  assert.match(page, /latestInterestByProspect/);
});

test("FVL-2 shows the minimal validation funnel without an external analytics provider", () => {
  for (const label of [
    "prospects sauvegardés",
    "contact autorisé",
    "veulent continuer",
    "comptes gratuits liés",
    "priorité haute / maintenant",
  ]) {
    assert.match(page, new RegExp(label, "i"));
  }
  assert.doesNotMatch(page, /posthog|segment|mixpanel|amplitude|google analytics|gtag/i);
});

test("FVL-2 exposes an explicit interest filter and keeps all prospects in the base queue", () => {
  assert.match(page, /name="interest"/);
  assert.match(page, /interestFilter === "yes"/);
  assert.match(page, /interestFilter === "no"/);
  assert.match(page, /const queue: QueueItem\[\] = prospects/);
  assert.match(page, /const filteredQueue = queue\.filter/);
});

test("FVL-2 distinguishes interest from contact permission", () => {
  assert.match(page, /Contact/);
  assert.match(page, /Demande réelle/);
  assert.match(page, /Autorisé explicitement/);
  assert.match(page, /Aucun signal explicite enregistré/);
  assert.match(page, /Veut continuer avec Campus Allemagne/);
});

test("FVL-2 shows signal source and date rather than inferring demand", () => {
  assert.match(page, /interest\.source === "orientation_result"/);
  assert.match(page, /Depuis le résultat d’orientation/);
  assert.match(page, /Depuis un suivi e-mail/);
  assert.match(page, /interest\.created_at/);
});

test("FVL-2 does not claim that the market is automatically validated", () => {
  assert.match(page, /ils ne décident pas automatiquement si le marché est validé/);
  assert.doesNotMatch(page, /market_score|validation_score|success_probability|market_probability/i);
});

test("FVL-2 remains protected by the existing server-side admin boundary", () => {
  assert.match(layout, /supabase\.auth\.getUser\(\)/);
  assert.match(layout, /from\("user_roles"\)/);
  assert.match(layout, /role\?\.role !== "admin"/);
  assert.match(layout, /redirect\("\/unauthorized"\)/);
});

test("FVL-2 makes no lifecycle, payment, email or document mutation", () => {
  assert.doesNotMatch(
    page,
    /\.update\(|\.insert\(|sendTransactionalEmail|payment_pending|paid_pending_validation|client_active|storage\.objects|student-documents/i,
  );
});
