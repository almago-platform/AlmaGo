# P2.3A — Prospect capture and printable report

Issue: #592

## What ships in P2.3A

- the orientation result can be printed/saved as a branded PDF through the browser print dialog;
- optional prospect capture can persist the email + orientation without creating an Auth account;
- the capture endpoint recomputes the diagnostic server-side instead of trusting client result JSON;
- direct `anon` access to `prospects` and `orientations` remains closed.

## Server-only Supabase boundary

The existing browser/session clients continue using `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

A separate `src/lib/supabase/privileged.ts` client:

- imports `server-only`;
- reads `SUPABASE_SECRET_KEY` only on the backend;
- disables session persistence;
- is used only by the bounded prospect submission route.

Supabase currently recommends modern `sb_secret_*` keys for trusted backend components. These keys bypass RLS, so the route validates and bounds every submitted field before writing.

## Feature gates

Both must be true before persistence can run:

- `ALMAGO_PHASE2_ENABLED=true`
- `ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED=true`

The capture flag remains false by default.

The backend additionally requires `SUPABASE_SECRET_KEY`. If missing, the route fails closed with 503.

## Privacy boundary

The capture UI is shown only after the diagnostic. It is optional and explicitly says no account is created.

The submission records the notice marker `orientation-prospect-v1` inside the persisted orientation input. This is a temporary bounded audit marker; it is not marketing consent.

## P2.3B still required

P2.3 is not complete until a transactional email provider and sending domain are configured and the delivery path is tested. P2.3A deliberately does not claim that an email was sent.
