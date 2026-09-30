# P2.4 — Optional free-account activation

Issue: #595  
Parent: #574

## Goal

A visitor who already saved a public orientation can optionally create or use a free Supabase account and attach that existing prospect/orientation without entering the project again.

This does **not** activate paid-client access.

## Flow

1. P2.3 creates the prospect and orientation and emails/serves an opaque resume token.
2. When P2.4 is enabled, the report exposes **Create my free space**.
3. `/signup?orientation_token=...` and `/login?orientation_token=...` resolve the token server-side and prefill the prospect email.
4. Signup keeps the secure claim path through Supabase email confirmation using the existing local-only `/auth/callback?next=...` mechanism.
5. Existing-account login keeps the same claim path.
6. Password recovery keeps the token through the reset callback and returns to claim after the password is changed.
7. The authenticated browser POSTs only the opaque token to `/api/orientation/claim`.
8. The server reads the authenticated Supabase user and calls the privileged atomic claim RPC.
9. The RPC independently verifies `auth.users.id + email`, token hash + expiry and prospect email, then attaches `prospects.user_id`.
10. The user is returned to the same saved orientation report.

## Atomic/idempotent claim

`claim_phase2_orientation`:

- is `SECURITY DEFINER`;
- is not executable by `public`, `anon` or `authenticated`;
- is executable only by the backend `service_role`;
- locks the prospect row with `FOR UPDATE`;
- rejects a token whose prospect email differs from the authenticated Auth user;
- rejects a prospect already linked to another user;
- rejects a user already linked to a different prospect;
- allows repeated claims by the same prospect/user pair;
- ensures `customer_access` exists as `prospect_account` without downgrading an existing lifecycle status.

The browser never supplies a trusted user ID or trusted email.

## Feature gates

P2.4 requires:

- `ALMAGO_PHASE2_ENABLED=true`
- `ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED=true`

The new gate defaults to false.

Transactional orientation email delivery now also requires the P2.4 gate. This prevents a public email from advertising an account-activation CTA while the claim flow is disabled.

## Security and privacy

- resume tokens remain 256-bit random bearer tokens created by P2.3;
- only SHA-256 token hashes are stored;
- token expiry is enforced before signup context resolution and again inside the atomic claim;
- the public URL contains no prospect ID, orientation ID or email;
- the known prospect email is resolved server-side and is read-only in the activation Auth form;
- no Supabase privileged secret reaches client code;
- normal signup/login remains unchanged when no valid P2.4 context is present.

## Production boundary

Do not enable P2.4 publicly yet.

P2.5 must first make the authenticated prospect dashboard and server/API permissions consistently reflect **free prospect account != paid client**. Until then, P2.4 remains code-complete but feature-gated.

P2.3 operational gates (A38/privacy, provider/domain and real FR/AR email tests) also remain applicable.
