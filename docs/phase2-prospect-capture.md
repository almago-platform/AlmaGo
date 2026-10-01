# P2.3 — Prospect capture, resumable report and transactional email

Issue: #592

## P2.3A — merged foundation

- the orientation result can be printed/saved as a branded PDF through the browser print dialog;
- optional prospect capture persists the email + orientation without creating an Auth account;
- the capture endpoint recomputes the diagnostic server-side instead of trusting client result JSON;
- direct `anon` access to `prospects` and `orientations` remains closed.

## P2.3B — code path

P2.3B adds a secure resume and email-delivery path while keeping production delivery disabled by default:

- each newly persisted orientation receives a 256-bit random resume token;
- only the SHA-256 token hash is stored;
- resume links expire after 90 days;
- the public report page resolves the token server-side and never queries by email or predictable database ID;
- the report can again be printed/saved as PDF;
- transactional delivery is behind its own feature gate;
- the current provider adapter is Resend over its HTTPS API;
- provider requests use an idempotency key derived from the persisted orientation ID;
- a provider failure never deletes the saved orientation and never turns a successful persistence into a 500;
- delivery metadata stores provider/message ID/timestamps, not provider error payloads.

The emailed URL contains only the opaque resume token. It contains no email address, prospect ID or orientation ID.

## Server-only Supabase boundary

The existing browser/session clients continue using `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

A separate `src/lib/supabase/privileged.ts` client:

- imports `server-only`;
- reads `SUPABASE_SECRET_KEY` only on the backend;
- disables session persistence;
- is used only by bounded Phase 2 server paths.

Supabase modern `sb_secret_*` keys are intended for trusted backend components. These keys bypass RLS, so every public input is validated/bounded before any privileged query or write.

## Feature gates

Prospect persistence requires:

- `ALMAGO_PHASE2_ENABLED=true`
- `ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED=true`

Transactional delivery additionally requires:

- `ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED=true`
- `ALMAGO_TRANSACTIONAL_EMAIL_PROVIDER=resend`
- `RESEND_API_KEY`
- `ALMAGO_TRANSACTIONAL_EMAIL_FROM`
- canonical HTTPS `SITE_URL`

All Phase 2 gates remain false by default.

## Privacy boundary

The capture UI is shown only after the diagnostic. It is optional and explicitly says no account is created.

The submission records the notice marker `orientation-prospect-v1` inside the persisted orientation input. This is a bounded audit marker; it is not marketing consent.

The email is transactional and sent only because the visitor explicitly requested persistence/delivery. No marketing consent is inferred.

## Failure strategy

Persistence is the primary operation.

- database failure: request fails;
- email provider disabled/unconfigured: orientation stays saved and the response reports delivery unavailable;
- provider request failure: orientation stays saved and the UI tells the visitor that the report remains printable;
- provider success: delivery metadata is recorded best-effort without exposing provider response bodies to the browser.

## Production activation still blocked

Do not enable public transactional delivery until all of the following are complete:

1. Resend account/API key selected for the production owner;
2. Campus Allemagne sending domain verified with the provider (SPF/DKIM as required);
3. sender address approved;
4. `SITE_URL` points to the final canonical HTTPS domain;
5. A38/privacy language for prospect retention + transactional email is approved;
6. one real FR and one real AR/RTL delivery test is completed;
7. P2.4 account-linking is merged and its feature gate is enabled only after P2.5 protects the free-prospect experience.

Therefore #592 remains open after code merge until operational delivery is proven. P2.4 code does not by itself authorize public activation.

## Smart Orientation contact consent (SO-3)

The email used to save or deliver an orientation remains transactional. It is **not** contact/marketing consent.

SO-3 adds an independent, optional checkbox:

- it is unchecked by default;
- it is not required to save the orientation or receive the transactional email;
- consent is stored on the prospect as `contact_consent`, `contact_consent_at` and a bounded version marker;
- the orientation input also records whether that specific submission included consent;
- a later submission with the box unchecked does not silently revoke a previously granted consent;
- no campaign, reminder, marketing email or other outreach is sent by SO-3.

A dedicated withdrawal/revocation mechanism and the final retention/legal wording must be in place before real outreach is activated. Until A38 is approved, Partner-Ready keeps real public prospect capture fail-closed and uses synthetic data only.

