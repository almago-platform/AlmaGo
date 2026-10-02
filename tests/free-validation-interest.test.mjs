import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const migration = read("supabase/migrations/0047_free_validation_interest_signal.sql");
const token = read("src/lib/phase2/free-validation-interest-token.ts");
const captureRoute = read("src/app/api/orientation/prospect/route.ts");
const interestRoute = read("src/app/api/orientation/interest/route.ts");
const card = read("src/components/orientation/ProspectCaptureCard.tsx");
const copy = read("src/content/orientation-prospect-copy.ts");

test("FVL-1 stores an append-only explicit interest signal", () => {
  assert.match(migration, /create table if not exists public\.free_validation_interest_signals/);
  assert.match(migration, /signal text not null default 'wants_support'/);
  assert.match(migration, /unique \(orientation_id, signal\)/);
  assert.match(migration, /created_at timestamptz not null default now\(\)/);
  assert.doesNotMatch(migration, /update\s+public\.free_validation_interest_signals/i);
});

test("FVL-1 uses a dedicated opaque token, separate from email and IDs", () => {
  assert.match(token, /randomBytes\(INTEREST_TOKEN_BYTES\)\.toString\("base64url"\)/);
  assert.match(token, /createHash\("sha256"\)/);
  assert.match(token, /INTEREST_TOKEN_TTL_DAYS = 30/);
  assert.match(migration, /free_validation_interest_token_hash text/);
  assert.match(migration, /free_validation_interest_token_expires_at timestamptz/);
  assert.match(captureRoute, /createFreeValidationInterestToken/);
  assert.match(captureRoute, /free_validation_interest_token_hash: interest\.hash/);
  assert.match(captureRoute, /interestToken: interest\.token/);
});

test("FVL-1 endpoint stays behind the existing legal prospect-capture gate", () => {
  assert.match(interestRoute, /isPhase2ProspectCaptureEnabled\(\)/);
  assert.match(interestRoute, /return NextResponse\.json\(\{ error: "Not found\." \}, \{ status: 404 \}\)/);
});

test("FVL-1 validates token expiry and is idempotent", () => {
  assert.match(interestRoute, /free_validation_interest_token_hash/);
  assert.match(interestRoute, /free_validation_interest_token_expires_at/);
  assert.match(interestRoute, /signalError\.code !== "23505"/);
  assert.match(interestRoute, /alreadyRecorded: signalError\?\.code === "23505"/);
});

test("FVL-1 RLS exposes reads only to the linked user or admin", () => {
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on table public\.free_validation_interest_signals from anon/);
  assert.match(migration, /grant select on table public\.free_validation_interest_signals to authenticated/);
  assert.match(migration, /p\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /or \(select public\.is_admin\(\)\)/);
  assert.match(migration, /grant select, insert[\s\S]*to service_role/);
  assert.match(migration, /revoke update, delete, truncate[\s\S]*from service_role/);
});

test("FVL-1 requires a separate post-save click and never infers interest from email", () => {
  assert.match(card, /status === "success" && interestToken/);
  assert.match(card, /onClick=\{submitInterest\}/);
  assert.match(card, /fetch\("\/api\/orientation\/interest"/);
  assert.doesNotMatch(captureRoute, /wants_support/);
  assert.doesNotMatch(captureRoute, /free_validation_interest_signals/);
});

test("FVL-1 copy clearly states free validation and no automatic document access", () => {
  assert.match(copy, /Aucun paiement n’est demandé/);
  assert.match(copy, /n’ouvre pas automatiquement l’espace documents/);
  assert.match(copy, /لا يوجد أي دفع/);
  assert.match(copy, /لن يتم فتح مساحة الوثائق تلقائيًا/);
  assert.match(copy, /No payment is requested/);
  assert.match(copy, /does not automatically open document access/);
});

test("FVL-1 never changes commercial lifecycle, payment, qualification or document access", () => {
  for (const source of [migration, interestRoute]) {
    assert.doesNotMatch(
      source,
      /qualified_prospect|payment_pending|paid_pending_validation|client_active|customer_access|student-documents|storage\.objects/i,
    );
  }
});

test("FVL-1 sends no email or marketing action when interest is recorded", () => {
  assert.doesNotMatch(interestRoute, /sendTransactionalEmail|resend|sendMarketing|sendCampaign|sendOutreach/i);
});
